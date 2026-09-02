import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import { ApiError } from '@apis/errors/apiError';
import {
  useCreateFireOriginMutation,
  useScenarioFireOriginQuery,
} from '@apis/scenarios/fireZoneQueries';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import CheckIcon from '@assets/icons/ic-check.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';
import EditIcon from '@assets/icons/ic-edit.svg?react';
import EyeOffIcon from '@assets/icons/ic-eye-off.svg?react';
import EyeIcon from '@assets/icons/ic-eye.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import LoadingState from '@components/loadingState';
import useToast from '@components/toast/useToast';

import { formatFloor, hasFloorPlan } from '@utils/floor';

import {
  configureCctvGridCells,
  createCctv,
  disableCctv,
  enableCctv,
  getFloorCctvs,
  updateCctv,
} from './api/cctvApi';
import { getFloorGridCells, setFloorGrid } from './api/floorGridApi';
import {
  analyzeFloor,
  getFloorBuildings,
  getFloorDetail,
  getFloorImageUrl,
  uploadFloor,
} from './api/floorPlansApi';
import {
  changeLightDirection,
  configureLightGuidance,
  createIoTLight,
  deleteIoTLight,
  disableIoTLight,
  enableIoTLight,
  getFloorLights,
  updateIoTLight,
  updateLightPiEndpoint,
} from './api/iotLightsApi';
import {
  createMapEdge,
  createMapNode,
  deleteMapEdge,
  deleteMapNode,
  getFloorGraph,
  updateMapNodePosition,
} from './api/mapGraphApi';
import {
  createUserZone,
  deleteUserZone,
  getFloorUserZones,
  getUserZoneDetail,
} from './api/userZoneApi';
import * as styles from './FloorPlansDetailPage.css';
import CctvSettingsModal from './modals/CctvSettingsModal';
import EquipmentDeleteConfirmModal from './modals/EquipmentDeleteConfirmModal';
import FireOriginScenarioModal from './modals/FireOriginScenarioModal';
import FloorUploadModal from './modals/FloorUploadModal';
import GridAreaSettingModal from './modals/GridAreaSettingModal';
import IoTLightSettingsModal from './modals/IoTLightSettingsModal';
import {
  GRID_SIZE_KEY,
  PENDING_GRID_SIZE_KEY,
  readStoredNumber,
  rememberGridSize,
  rememberPendingGridSize,
} from './utils/gridStorage';

import type { Cctv } from './api/cctvApi';
import type { FloorGridCell } from './api/floorGridApi';
import type { IoTLight } from './api/iotLightsApi';
import type { MapEdge, MapNode, MapNodeType } from './api/mapGraphApi';
import type { DeviceMarker, DeviceType, Floor, FloorBuilding } from './types/floorPlans';

type SelectedItem = { kind: 'device'; data: DeviceMarker };

type PanelItem = {
  id: string;
  kind: 'device';
  /** 우측 패널 필터 기준 — AddedDevice.placeType과 같은 체계(유도등은 'light') */
  type: 'cctv' | 'light' | 'general';
  label: string;
  statusText: string;
  statusOnline: boolean;
  zone: string;
  source: 'floor' | 'added';
};

// 도면 마커의 DeviceType('cctv'|'iot'|'fire')을 패널 필터 체계(PanelItem.type)로 변환.
// 두 군데(패널 목록 만들 때, 지도 클릭으로 필터 이동할 때)에서 각각 다시 구현하면 인식 못하는
// 값의 처리(fallback)가 서로 어긋날 수 있어 하나로 합침
const deviceTypeToPlaceType = (type: DeviceType): PanelItem['type'] => {
  if (type === 'cctv') return 'cctv';
  if (type === 'iot') return 'light';
  return 'general';
};

// deviceTypeFilter(하위 필터 칩)는 'general' 칩이 따로 없어서, 그 값은 필터 해제(null)로 흡수함 —
// 위 매핑에서 파생시켜 fallback이 서로 다른 두 벌의 변환 로직으로 갈라지지 않게 함
const deviceTypeToFilterChip = (type: DeviceType): 'cctv' | 'light' | null => {
  const placeType = deviceTypeToPlaceType(type);
  return placeType === 'general' ? null : placeType;
};

// 브라우저는 mousemove를 초당 수백 번까지도 쏘는데, 드래그 중 매번 상태를 갱신하면 프레임마다
// 전체 도면(SVG 그래프·그리드·패널)이 재렌더됨 — 프레임당 최신 좌표 한 번만 반영되도록 묶어줌
const rafThrottle = <A extends unknown[]>(fn: (...args: A) => void) => {
  let rafId: number | null = null;
  let latestArgs: A | null = null;
  const flush = () => {
    rafId = null;
    if (latestArgs) fn(...latestArgs);
  };
  const throttled = (...args: A) => {
    latestArgs = args;
    if (rafId === null) rafId = requestAnimationFrame(flush);
  };
  throttled.cancel = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    latestArgs = null;
  };
  return throttled;
};

// 'iot'는 API 없이 화면에만 찍히는 더미 노드였어서 제거함 — 실제 장비는 CCTV와 유도등뿐
type PlacingDeviceType = 'cctv' | 'light' | 'door' | 'stair' | 'hallway' | 'start';
type PlacingEquipmentType = Exclude<PlacingDeviceType, 'door' | 'stair' | 'hallway' | 'start'>;

const DEVICE_PLACE_CONFIG: Record<PlacingDeviceType, { label: string; color: string }> = {
  cctv: { label: 'CCTV', color: '#8b5cf6' },
  light: { label: '유도등', color: '#d97706' },
  door: { label: '문 · 출입구', color: '#2563eb' },
  stair: { label: '계단', color: '#f97316' },
  hallway: { label: '복도', color: '#0891b2' },
  start: { label: '시작 노드', color: '#db2777' },
};

type AddedDevice = {
  id: string;
  type: 'cctv' | 'iot';
  placeType: PlacingEquipmentType;
  label: string;
  x: number; // %
  y: number; // %
  status: 'online';
  zone: string;
};

type ZoneType = 'general';

type ZoneRect = { x: number; y: number; w: number; h: number };

// cellIds가 실제 저장 단위(백엔드 UserZone은 그리드 셀 집합) — rect는 드래그 중 임시 표시에만 씀
type ZoneEntry = { id: string; type: ZoneType; label: string; cellIds: string[] };

/* 도면 위 구조 노드 — 실제 API의 MapNodeResponse.type(DOOR/STAIR 등)과 대응되는 점 좌표 노드.
   isFinalExit은 문·계단에서만 의미 있음(시작 노드·복도는 항상 false — 시작 노드는 서버가
   isExitTarget=false로 강제 저장함) */
type StructureNodeType = 'door' | 'stair' | 'hallway' | 'start';

type StructureNode = {
  id: string;
  type: StructureNodeType;
  x: number;
  y: number;
  isFinalExit: boolean;
};

const STRUCTURE_NODE_LABEL: Record<StructureNodeType, string> = {
  door: '문 · 출입구',
  stair: '계단',
  hallway: '복도',
  start: '시작 노드',
};

// 구조 노드 여부 판정 — STRUCTURE_NODE_LABEL을 단일 소스로 삼아, 새 구조 노드 타입이 추가될 때
// 이 판정만 따로 놓쳐서 어긋나는 일이 없게 함
const isStructureNodeType = (type: string): type is StructureNodeType =>
  type in STRUCTURE_NODE_LABEL;

// 구조 노드 ↔ 맵그래프 노드 타입 매핑 (API MapNodeResponse.type)
const STRUCTURE_NODE_API_TYPE = {
  door: 'DOOR',
  stair: 'STAIR',
  hallway: 'HALLWAY',
  start: 'START',
} as const satisfies Record<StructureNodeType, MapNodeType>;

const API_TYPE_TO_STRUCTURE: Partial<Record<MapNodeType, StructureNodeType>> = {
  DOOR: 'door',
  STAIR: 'stair',
  HALLWAY: 'hallway',
  START: 'start',
};

const STRUCTURE_NODE_COLOR: Record<StructureNodeType, string> = {
  door: '#2563eb',
  stair: '#f97316',
  hallway: '#0891b2',
  start: '#db2777',
};

// 우측 패널 구조 노드 카드의 점 색상 클래스 — 위 색상표를 그대로 벡터-엑스트랙트 클래스로 옮긴 것
const ZONE_CARD_DOT_CLASS: Record<StructureNodeType, string> = {
  door: styles.zoneCardDotDoor,
  stair: styles.zoneCardDotStair,
  hallway: styles.zoneCardDotHallway,
  start: styles.zoneCardDotStart,
};

// 맵그래프 노드 중 문/계단이 아닌 나머지(ROOM/HALLWAY/EXIT/CUSTOM) — 조회 전용, 아직 편집 대상 아님
const GRAPH_NODE_COLOR: Record<'ROOM' | 'HALLWAY' | 'EXIT' | 'CUSTOM', string> = {
  ROOM: '#9ca3af',
  HALLWAY: '#9ca3af',
  EXIT: '#16a34a',
  CUSTOM: '#7c3aed',
};

type ZoneRefSelection = { kind: 'node'; id: string } | { kind: 'zone'; id: string };

// 그리드(PUT /floors/{id}/grid, GET /floors/{id}/grid/cells)는 두 가지 용도로만 존재함:
//  1) 사용자 구역(user-zone): 구역 = 그리드 셀 id의 집합(UserZoneCreateRequest.cellIds). 셀 단위로만 선택 가능
//  2) 화재 구역(fire-zone): 초기 발화 셀 = 그리드 셀 id 하나(CreateFireZoneRequest.gridCellId), 화재 확산 시뮬레이션 기준
// 반면 맵그래프 노드/엣지의 좌표(x,y)는 0~1 정규화 double로 자유 좌표이고 그리드와 무관함 —
// 노드 배치/이동은 클릭한 지점 그대로 저장한다(격자 스냅 없음).

// CCTV 등록(POST /cctvs)은 감시 면적 계산에 그리드 배율(cellSizeMeter)을 요구하는데(없으면 CCTV006),
// 배율 복원 순서(백엔드에 조회 API가 없어 브라우저에 기록해뒀다 되찾음):
//   1) 이 브라우저에 기록해둔 값(업로드 때 입력했거나 이전에 설정한 값) — localStorage라 새로고침/재접속에도 유지
//   2) 이 층에 이미 등록된 CCTV의 gridCellSizeMeter (한 대라도 있으면 그때 쓰인 배율을 알 수 있음)
//   3) 위 둘 다 없을 때만 사용자에게 한 번 물어봄
// 키 정의·읽기/쓰기 헬퍼는 FloorPlansPage(업로드 화면)도 같이 쓰므로 utils/gridStorage로 뺌

// SVG 캔버스 폭은 560 고정, 높이는 도면 실제 비율(그리드 columns/rows 또는 이미지 비율)에 맞춰
// 렌더 시점에 계산해서 넘김 — viewBox 비율 == 이미지 비율이므로 이미지를 늘리지 않고도
// 그리드·노드·드래그 좌표가 전부 같은 0~1 ↔ 0~(560,canvasH) 공간에 정확히 맞물림
const CANVAS_W = 560;
const DEFAULT_CANVAS_H = 420;

// AI 분석이 DONE으로 바뀐 직후엔 노드가 아직 생성 중일 수 있어 그래프가 비어 올 수 있음 — 재조회 설정
const GRAPH_RETRY_LIMIT = 5;
const GRAPH_RETRY_INTERVAL_MS = 2000;

// 그리드 행·열 수 — 셀이 수십만 개까지 갈 수 있어서 Math.max(...spread) 대신 순회로 구함
// (스프레드는 인자 개수 한계로 RangeError: Maximum call stack size exceeded가 날 수 있음)
const getGridDimensions = (cells: FloorGridCell[]): { cols: number; rows: number } => {
  let maxCol = 0;
  let maxRow = 0;
  for (const cell of cells) {
    if (cell.columnIndex > maxCol) maxCol = cell.columnIndex;
    if (cell.rowIndex > maxRow) maxRow = cell.rowIndex;
  }
  return { cols: maxCol + 1, rows: maxRow + 1 };
};

// 그리드 셀 하나의 SVG 픽셀 크기 — 캔버스(560 x canvasH)를 열/행 수로 그대로 나눔.
// 셀 rect가 캔버스를 정확히 타일링하고 `centerX*560 - w/2`가 실제 셀 왼쪽 변과 일치함
const getGridCellPxSize = (cells: FloorGridCell[], canvasH: number): { w: number; h: number } => {
  if (cells.length === 0) return { w: 20, h: 20 };
  const { cols, rows } = getGridDimensions(cells);
  return { w: CANVAS_W / cols, h: canvasH / rows };
};

// 드래그 사각형(캔버스 좌표)과 영역이 조금이라도 겹치는 셀들의 id — 셀 중심이 아니라 셀 면적 기준.
// 드래그 미리보기와 실제 잡히는 셀이 일치하도록 드래그 중/드래그 종료 양쪽에서 같은 로직을 씀
const cellIdsIntersectingRect = (
  cells: FloorGridCell[],
  rect: { x: number; y: number; w: number; h: number },
  size: { w: number; h: number },
  canvasH: number,
): string[] =>
  cells
    .filter((cell) => {
      const left = cell.centerX * CANVAS_W - size.w / 2;
      const top = cell.centerY * canvasH - size.h / 2;
      return (
        left < rect.x + rect.w &&
        left + size.w > rect.x &&
        top < rect.y + rect.h &&
        top + size.h > rect.y
      );
    })
    .map((cell) => cell.id);

// 셀의 (row,col) 인덱스만으로 픽셀 좌표를 뽑을 수 있도록 그리드 원점(0,0 셀의 좌상단)을 역산.
// 셀마다 제각각인 centerX/centerY(부동소수) 대신 원점+인덱스로 좌표를 계산하면 인접 셀의
// 공유 모서리 좌표가 정확히 일치해서, 경계선/격자선에 미세한 어긋남이나 이중선이 안 생김
const getGridPxOrigin = (
  cells: FloorGridCell[],
  size: { w: number; h: number },
  canvasH: number,
): { x: number; y: number } => {
  const ref = cells[0];
  if (!ref) return { x: 0, y: 0 };
  return {
    x: ref.centerX * CANVAS_W - size.w / 2 - ref.columnIndex * size.w,
    y: ref.centerY * canvasH - size.h / 2 - ref.rowIndex * size.h,
  };
};

// 셀 집합의 바깥 윤곽선을 하나의 SVG path(d)로. 셀별 rect를 이어 붙이면 반투명 채움 사이에
// 이음매가 보여 "직사각형의 집합"처럼 보이므로, 합집합 윤곽을 구해 단일 도형으로 그림.
const buildZoneOutlinePath = (
  cells: FloorGridCell[],
  size: { w: number; h: number },
  canvasH: number,
): string => {
  const origin = getGridPxOrigin(cells, size, canvasH);
  const cellKey = (col: number, row: number) => `${col},${row}`;
  const inZone = new Set(cells.map((c) => cellKey(c.columnIndex, c.rowIndex)));
  const cornerX = (col: number) => origin.x + col * size.w;
  const cornerY = (row: number) => origin.y + row * size.h;
  const ptKey = (x: number, y: number) => `${x},${y}`;

  // 이웃이 없는 변만 방향성 있게 수집(셀 기준 시계방향) → 이어 붙이면 닫힌 윤곽이 됨
  const nextByStart = new Map<string, { x: number; y: number }>();
  cells.forEach((c) => {
    const { columnIndex: col, rowIndex: row } = c;
    const tl = { x: cornerX(col), y: cornerY(row) };
    const tr = { x: cornerX(col + 1), y: cornerY(row) };
    const br = { x: cornerX(col + 1), y: cornerY(row + 1) };
    const bl = { x: cornerX(col), y: cornerY(row + 1) };
    if (!inZone.has(cellKey(col, row - 1))) nextByStart.set(ptKey(tl.x, tl.y), tr);
    if (!inZone.has(cellKey(col + 1, row))) nextByStart.set(ptKey(tr.x, tr.y), br);
    if (!inZone.has(cellKey(col, row + 1))) nextByStart.set(ptKey(br.x, br.y), bl);
    if (!inZone.has(cellKey(col - 1, row))) nextByStart.set(ptKey(bl.x, bl.y), tl);
  });

  let d = '';
  const visited = new Set<string>();
  for (const startKey of nextByStart.keys()) {
    if (visited.has(startKey)) continue;
    const [sx, sy] = startKey.split(',').map(Number);
    d += `M${sx} ${sy}`;
    let curKey = startKey;
    while (true) {
      const next = nextByStart.get(curKey);
      if (!next) break;
      visited.add(curKey);
      d += `L${next.x} ${next.y}`;
      const nextKey = ptKey(next.x, next.y);
      if (nextKey === startKey) {
        d += 'Z';
        break;
      }
      if (visited.has(nextKey)) break;
      curKey = nextKey;
    }
  }
  return d;
};

// 그리드 표시 토글용 균일 격자선(모눈종이). 셀별 rect 대신 캔버스(560x420) 전체를
// 가로지르는 직선만 그어서, 공유 변이 두 번 그려져 자리표처럼 보이던 문제를 없앰.
// 선 위치는 실제 그리드 원점에 위상만 맞추고, 셀 범위를 넘어 캔버스 가장자리까지 채움
const GridOverlayLines = ({
  cells,
  size,
  canvasH,
}: {
  cells: FloorGridCell[];
  size: { w: number; h: number };
  canvasH: number;
}) => {
  if (cells.length === 0) return null;
  const CANVAS_H = canvasH;

  // 위상(offset)은 각 셀 왼쪽/위쪽 변을 셀 크기로 나눈 나머지의 중앙값으로 구함 —
  // 특정 셀 하나의 부동소수 오차에 흔들리지 않고, 격자선이 실제 셀 경계에 맞음.
  // 그 위상에서 0부터 캔버스 끝까지 셀 간격으로 선을 반복해 전체를 덮음
  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  };
  const phaseX = median(
    cells.map((c) => {
      const left = c.centerX * CANVAS_W - size.w / 2;
      return ((left % size.w) + size.w) % size.w;
    }),
  );
  const phaseY = median(
    cells.map((c) => {
      const top = c.centerY * CANVAS_H - size.h / 2;
      return ((top % size.h) + size.h) % size.h;
    }),
  );
  const verticalXs: number[] = [];
  for (let x = phaseX; x <= CANVAS_W + 0.001; x += size.w) verticalXs.push(x);
  const horizontalYs: number[] = [];
  for (let y = phaseY; y <= CANVAS_H + 0.001; y += size.h) horizontalYs.push(y);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {verticalXs.map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={CANVAS_H}
          stroke="rgba(107,114,128,0.22)"
          strokeWidth="0.6"
        />
      ))}
      {horizontalYs.map((y) => (
        <line
          key={`h${y}`}
          x1={0}
          y1={y}
          x2={CANVAS_W}
          y2={y}
          stroke="rgba(107,114,128,0.22)"
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
};

const MockFloorMap3F = ({
  mapImageUrl,
  canvasH,
  placingActive,
  zoneAddActive,
  zoneDraftRect,
  onZoneDraftChange,
  onZoneDragEnd,
  savedZones,
  structureNodes,
  editingStructureId,
  onStructureNodeMove,
  onStructureNodeMoveEnd,
  graphNodes,
  graphEdges,
  edgeAddActive,
  onNodeClickForEdge,
  selectedEdgeId,
  onEdgeSelect,
  onEdgeDelete,
  selectedZoneRef,
  onZoneRefSelect,
  cctvGridCellsMode,
  floorGridCells,
  selectedGridCellIds,
  gridCellPxSize,
  onGridCellToggle,
  onMapClick,
  onBackgroundClick,
}: {
  mapImageUrl: string | null;
  canvasH: number;
  placingActive: boolean;
  zoneAddActive: boolean;
  zoneDraftRect: ZoneRect | null;
  onZoneDraftChange: (rect: ZoneRect | null) => void;
  onZoneDragEnd: () => void;
  savedZones: ZoneEntry[];
  structureNodes: StructureNode[];
  graphNodes: MapNode[];
  graphEdges: MapEdge[];
  edgeAddActive: boolean;
  onNodeClickForEdge: (id: string) => void;
  selectedEdgeId: string | null;
  onEdgeSelect: (id: string) => void;
  onEdgeDelete: (id: string) => void;
  editingStructureId: string | null;
  onStructureNodeMove: (id: string, x: number, y: number) => void;
  onStructureNodeMoveEnd: (id: string, x: number, y: number) => void;
  selectedZoneRef: ZoneRefSelection | null;
  onZoneRefSelect: (ref: ZoneRefSelection) => void;
  cctvGridCellsMode: 'hidden' | 'selecting' | 'viewing' | 'browsing';
  floorGridCells: FloorGridCell[];
  selectedGridCellIds: string[];
  gridCellPxSize: { w: number; h: number };
  onGridCellToggle: (cellId: string) => void;
  onMapClick: (x: number, y: number) => void;
  onBackgroundClick: () => void;
}) => {
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const structureDragMovedRef = useRef(false);

  // 엣지(선) 양 끝 좌표를 찾기 위한 노드 id → SVG 좌표 조회 (구조 노드 + 그 외 그래프 노드 통합)
  const nodePositionById = new Map<string, { x: number; y: number }>();
  structureNodes.forEach((n) => nodePositionById.set(n.id, { x: n.x, y: n.y }));
  graphNodes.forEach((n) => nodePositionById.set(n.id, { x: n.x * CANVAS_W, y: n.y * canvasH }));

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // 캔버스 경계 밖 클릭이 0~1 범위를 벗어난 좌표로 저장되지 않도록 클램프 (백엔드 x,y 검증: 0~1)
    const x = Math.round(
      Math.max(0, Math.min(CANVAS_W, ((e.clientX - rect.left) / rect.width) * CANVAS_W)),
    );
    const y = Math.round(
      Math.max(0, Math.min(canvasH, ((e.clientY - rect.top) / rect.height) * canvasH)),
    );
    if (placingActive) {
      onMapClick(x, y);
      return;
    }
    if (zoneAddActive) return;
    onBackgroundClick();
  };

  // 클릭/드래그 지점을 캔버스(560 x canvasH) 좌표로 그대로 변환 — 격자 스냅 없이 포인터를 정확히 따라감.
  // 구역 드래그는 이 사각형과 겹치는 실제 그리드 셀이 선택되고(handleZoneDragEnd), 노드는 이 좌표에 그대로 배치됨
  const svgPoint = (clientX: number, clientY: number, svgEl: SVGSVGElement) => {
    const rect = svgEl.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * CANVAS_W;
    const rawY = ((clientY - rect.top) / rect.height) * canvasH;
    return {
      x: Math.max(0, Math.min(CANVAS_W, rawX)),
      y: Math.max(0, Math.min(canvasH, rawY)),
    };
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!zoneAddActive) return;
    e.preventDefault();
    const svgEl = e.currentTarget;
    const start = svgPoint(e.clientX, e.clientY, svgEl);
    dragStartRef.current = start;
    onZoneDraftChange({ x: start.x, y: start.y, w: 0, h: 0 });
    let lastRect = { x: start.x, y: start.y, w: 0, h: 0 };
    const applyRect = rafThrottle((rect: typeof lastRect) => onZoneDraftChange(rect));

    const onMove = (mv: MouseEvent) => {
      if (!dragStartRef.current) return;
      const cur = svgPoint(mv.clientX, mv.clientY, svgEl);
      const x = Math.min(dragStartRef.current.x, cur.x);
      const y = Math.min(dragStartRef.current.y, cur.y);
      const w = Math.abs(cur.x - dragStartRef.current.x);
      const h = Math.abs(cur.y - dragStartRef.current.y);
      lastRect = { x, y, w, h };
      applyRect(lastRect);
    };
    const onUp = () => {
      dragStartRef.current = null;
      // onZoneDragEnd가 마지막으로 반영된 사각형을 기준으로 셀을 계산하므로, 대기 중인 갱신을
      // 취소하고 마지막 사각형을 먼저 동기 반영한 뒤에 종료 처리함
      applyRect.cancel();
      onZoneDraftChange(lastRect);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      onZoneDragEnd();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleStructureMouseDown = (e: React.MouseEvent<SVGGElement>, structureId: string) => {
    if (structureId !== editingStructureId) return;
    e.stopPropagation();
    e.preventDefault();
    structureDragMovedRef.current = false;
    const svgEl = e.currentTarget.ownerSVGElement;
    if (!svgEl) return;
    let lastPoint: { x: number; y: number } | null = null;
    const applyMove = rafThrottle((x: number, y: number) => onStructureNodeMove(structureId, x, y));

    const onMove = (mv: MouseEvent) => {
      structureDragMovedRef.current = true;
      const point = svgPoint(mv.clientX, mv.clientY, svgEl);
      lastPoint = point;
      applyMove(point.x, point.y);
    };
    const onUp = () => {
      applyMove.cancel();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (lastPoint) {
        onStructureNodeMove(structureId, lastPoint.x, lastPoint.y);
        onStructureNodeMoveEnd(structureId, lastPoint.x, lastPoint.y);
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const svgCursor = placingActive || zoneAddActive || edgeAddActive ? 'crosshair' : 'default';

  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${canvasH}`}
      width={700}
      height={(700 * canvasH) / CANVAS_W}
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: svgCursor }}
      onClick={handleSvgClick}
      onMouseDown={handleSvgMouseDown}
    >
      {/* 배경 — 실제 업로드된 도면 원본 이미지. 벽은 별도 데이터가 아니라 이 이미지 자체에 포함되어 있음.
          viewBox 높이(canvasH)를 도면 실제 비율에 맞춰 잡으므로, 이미지를 preserveAspectRatio="none"로
          꽉 채워도 늘어나지 않고 격자·노드·드래그 좌표(0~1 정규화)와 정확히 일치함 */}
      <rect width={CANVAS_W} height={canvasH} fill="#f8f9fa" />
      {mapImageUrl && (
        <image
          href={mapImageUrl}
          x={0}
          y={0}
          width={CANVAS_W}
          height={canvasH}
          preserveAspectRatio="none"
        />
      )}

      {/* 맵그래프 엣지 — 편집모드 아닐 땐 클릭해서 선택 후 삭제 가능 */}
      {graphEdges.map((edge) => {
        const from = nodePositionById.get(edge.fromNodeId);
        const to = nodePositionById.get(edge.toNodeId);
        if (!from || !to) return null;
        const isSelected = selectedEdgeId === edge.id;
        const canSelect = !edgeAddActive && !placingActive && !zoneAddActive;
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        return (
          <g key={edge.id}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="transparent"
              strokeWidth="10"
              style={{
                cursor: canSelect ? 'pointer' : 'default',
                pointerEvents: canSelect ? 'stroke' : 'none',
              }}
              onClick={(e) => {
                if (!canSelect) return;
                e.stopPropagation();
                onEdgeSelect(edge.id);
              }}
            />
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isSelected ? '#2563eb' : '#9ca3af'}
              strokeWidth={isSelected ? '2.5' : '1.5'}
              strokeDasharray="3 3"
              style={{ pointerEvents: 'none' }}
            />
            {isSelected && (
              <g
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdgeDelete(edge.id);
                }}
              >
                <circle cx={midX} cy={midY} r="8" fill="#ef4444" />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="white"
                  fontFamily="sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  ×
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* 맵그래프 노드 중 ROOM/HALLWAY/EXIT/CUSTOM — 엣지 연결 모드에서만 클릭 가능.
          ROOM/HALLWAY는 경로 계산용 내부 포인트라 엣지 연결 모드일 때만 화면에 표시 —
          평소엔 클릭도 안 되는데 캔버스만 지저분하게 만들어서 숨김. EXIT/CUSTOM은 정보성이라 항상 표시 */}
      {graphNodes.map((n) => {
        const isRoomOrHallway = n.type === 'ROOM' || n.type === 'HALLWAY';
        if (isRoomOrHallway && !edgeAddActive) return null;
        const x = n.x * CANVAS_W;
        const y = n.y * canvasH;
        const color = GRAPH_NODE_COLOR[n.type as 'ROOM' | 'HALLWAY' | 'EXIT' | 'CUSTOM'];
        return (
          <g
            key={n.id}
            style={{ pointerEvents: edgeAddActive ? 'auto' : 'none', cursor: 'pointer' }}
            onClick={(e) => {
              if (!edgeAddActive) return;
              e.stopPropagation();
              onNodeClickForEdge(n.id);
            }}
          >
            <circle cx={x} cy={y} r={n.type === 'EXIT' ? 6 : 3} fill={color} />
            {n.type === 'EXIT' && (
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill={color}
                fontFamily="sans-serif"
              >
                {n.name}
              </text>
            )}
          </g>
        );
      })}

      {/* 구조 노드 — 계단 · 문/출입구 (AI 세그멘테이션 결과, 사용자가 위치 보정 가능 · 최종 탈출구 지정은 우측 패널에서만) */}
      {structureNodes.map((n) => {
        const isEditingThis = n.id === editingStructureId;
        const isSelected = selectedZoneRef?.kind === 'node' && selectedZoneRef.id === n.id;
        const isStair = n.type === 'stair';
        const baseColor = STRUCTURE_NODE_COLOR[n.type];
        return (
          <g
            key={n.id}
            onMouseDown={(e) => handleStructureMouseDown(e, n.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (edgeAddActive) {
                onNodeClickForEdge(n.id);
                return;
              }
              if (structureDragMovedRef.current) {
                structureDragMovedRef.current = false;
                return;
              }
              if (editingStructureId) return;
              onZoneRefSelect({ kind: 'node', id: n.id });
            }}
            style={{ cursor: isEditingThis ? 'grab' : 'pointer' }}
          >
            {isSelected && (
              <circle
                cx={n.x}
                cy={n.y}
                r={(n.isFinalExit ? 7 : isStair ? 6 : 4) + 5}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.isFinalExit ? 7 : isEditingThis ? 6 : isStair ? 5 : 4}
              fill={n.isFinalExit ? '#16a34a' : baseColor}
              stroke={isEditingThis ? '#f59e0b' : n.isFinalExit ? 'white' : 'none'}
              strokeWidth={isEditingThis ? 3 : n.isFinalExit ? 2 : 0}
            />
            {isStair && (
              <text
                x={n.x}
                y={n.y + 3}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill="white"
                fontFamily="sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                ▲
              </text>
            )}
            {n.isFinalExit && (
              <text
                x={n.x}
                y={n.y - 14}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#16a34a"
                fontFamily="sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                최종 탈출구
              </text>
            )}
          </g>
        );
      })}

      {/* 저장된 일반 구역 — 백엔드 저장 단위가 그리드 셀 집합이라, 셀들의 합집합 윤곽을
          단일 path로 그려 하나의 면적으로 보이게 함(내부 격자선·이음매 없음).
          구역마다 매번 floorGridCells를 선형 탐색하지 않도록 id→셀 매핑을 한 번만 만들어 재사용 */}
      {(() => {
        const floorGridCellById = new Map(floorGridCells.map((c) => [c.id, c]));
        return savedZones.map((z) => {
          const cells = z.cellIds
            .map((id) => floorGridCellById.get(id))
            .filter((c): c is FloorGridCell => !!c);
          if (cells.length === 0) return null;
          const isSelected = selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === z.id;
          const xs = cells.map((c) => c.centerX * CANVAS_W);
          const ys = cells.map((c) => c.centerY * canvasH);
          const labelX = (Math.min(...xs) + Math.max(...xs)) / 2;
          const labelY = (Math.min(...ys) + Math.max(...ys)) / 2;

          return (
            <g
              key={z.id}
              onClick={(e) => {
                if (zoneAddActive) return;
                e.stopPropagation();
                onZoneRefSelect({ kind: 'zone', id: z.id });
              }}
              style={{ cursor: zoneAddActive ? 'inherit' : 'pointer' }}
            >
              <path
                d={buildZoneOutlinePath(cells, gridCellPxSize, canvasH)}
                fillRule="evenodd"
                fill="rgba(107,114,128,0.15)"
                stroke={isSelected ? '#2563eb' : '#6b7280'}
                strokeWidth={isSelected ? '2' : '1'}
              />
              <text
                x={labelX}
                y={labelY + 3}
                textAnchor="middle"
                fill="#374151"
                fontSize="10"
                fontFamily="sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                {z.label}
              </text>
            </g>
          );
        });
      })()}

      {/* 그리드 표시 토글 — 도면 위에 얹는 균일한 모눈종이 격자선(선만, 채움 없음) */}
      {cctvGridCellsMode === 'browsing' && (
        <GridOverlayLines cells={floorGridCells} size={gridCellPxSize} canvasH={canvasH} />
      )}

      {/* 그리드 셀 선택 — CCTV 신규 등록 중(선택 가능) 또는 기존 CCTV 감시 영역(조회 전용).
          셀마다 테두리를 그리면 원고지처럼 보여서, 얇은 균일 격자선 위에 선택된 셀만
          하나의 면적(채움+외곽선)으로 표시하고, 클릭 판정은 투명 히트영역이 담당함 */}
      {(cctvGridCellsMode === 'selecting' || cctvGridCellsMode === 'viewing') && (
        <>
          {cctvGridCellsMode === 'selecting' && (
            <GridOverlayLines cells={floorGridCells} size={gridCellPxSize} canvasH={canvasH} />
          )}

          {(() => {
            const selectedCells = floorGridCells.filter((c) => selectedGridCellIds.includes(c.id));
            if (selectedCells.length === 0) return null;
            return (
              <path
                d={buildZoneOutlinePath(selectedCells, gridCellPxSize, canvasH)}
                fillRule="evenodd"
                fill="rgba(139,92,246,0.3)"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                style={{ pointerEvents: 'none' }}
              />
            );
          })()}

          {cctvGridCellsMode === 'selecting' &&
            floorGridCells.map((cell) => (
              <rect
                key={cell.id}
                x={cell.centerX * CANVAS_W - gridCellPxSize.w / 2}
                y={cell.centerY * canvasH - gridCellPxSize.h / 2}
                width={gridCellPxSize.w}
                height={gridCellPxSize.h}
                fill="transparent"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onGridCellToggle(cell.id);
                }}
              />
            ))}
        </>
      )}

      {/* 구역 추가 드래그 선택 영역 */}
      {zoneAddActive && zoneDraftRect && zoneDraftRect.w > 0 && zoneDraftRect.h > 0 && (
        <rect
          x={zoneDraftRect.x}
          y={zoneDraftRect.y}
          width={zoneDraftRect.w}
          height={zoneDraftRect.h}
          fill="rgba(37,99,235,0.18)"
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  );
};

/* ── CCTV/IoT 마커 ── */
const DevicePin = ({
  device,
  posX,
  posY,
  selected,
  draggable,
  onClick,
  onDragEnd,
}: {
  device: DeviceMarker;
  posX: number;
  posY: number;
  selected: boolean;
  draggable: boolean;
  onClick: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) => {
  const isDragging = useRef(false);
  const didMove = useRef(false);

  const isOffline = device.status === 'offline';
  const markerClass = clsx(
    styles.markerCircle,
    device.type === 'cctv'
      ? isOffline
        ? styles.markerCctvOffline
        : styles.markerCctv
      : styles.markerIot,
    selected && styles.markerSelected,
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    didMove.current = false;

    const container = (e.currentTarget as HTMLElement).parentElement;
    if (!container) return;
    let lastPoint: { x: number; y: number } | null = null;
    const applyMove = rafThrottle((x: number, y: number) => onDragEnd(device.id, x, y));

    const onMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      didMove.current = true;
      const rect = container.getBoundingClientRect();
      const rawX = ((mv.clientX - rect.left) / rect.width) * 100;
      const rawY = ((mv.clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.max(0, Math.min(100, rawX));
      const clampedY = Math.max(0, Math.min(100, rawY));
      lastPoint = { x: clampedX, y: clampedY };
      applyMove(clampedX, clampedY);
    };

    const onUp = () => {
      isDragging.current = false;
      // 마지막 프레임이 아직 예약된 상태로 끊기지 않도록, 대기 중이던 갱신은 취소하고
      // 마지막 좌표를 바로 반영해 마우스를 뗀 위치와 어긋나지 않게 함
      applyMove.cancel();
      if (lastPoint) onDragEnd(device.id, lastPoint.x, lastPoint.y);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={device.label}
      className={styles.markerWrap}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        cursor: draggable ? 'grab' : 'pointer',
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (didMove.current) {
          e.stopPropagation();
          return;
        }
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={markerClass}>
        {device.type === 'cctv' ? (
          <CameraIcon width={12} height={12} aria-hidden="true" />
        ) : (
          <WifiIcon width={12} height={12} aria-hidden="true" />
        )}
      </div>
      {selected && <span className={styles.markerLabel}>{device.label}</span>}
    </div>
  );
};

/* ── 사용자가 추가한 장치 마커 (위치 드래그 지원) ── */
const AddedDevicePin = ({
  device,
  posX,
  posY,
  selected,
  draggable,
  onClick,
  onDragEnd,
  onDragMoveEnd,
}: {
  device: AddedDevice;
  posX: number;
  posY: number;
  selected: boolean;
  draggable: boolean;
  onClick: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onDragMoveEnd: (id: string, x: number, y: number) => void;
}) => {
  const isDragging = useRef(false);
  const didMove = useRef(false);
  const color = DEVICE_PLACE_CONFIG[device.placeType].color;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    didMove.current = false;

    const container = (e.currentTarget as HTMLElement).parentElement;
    if (!container) return;
    let lastPoint: { x: number; y: number } | null = null;
    const applyMove = rafThrottle((x: number, y: number) => onDragEnd(device.id, x, y));

    const onMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      didMove.current = true;
      const rect = container.getBoundingClientRect();
      const rawX = ((mv.clientX - rect.left) / rect.width) * 100;
      const rawY = ((mv.clientY - rect.top) / rect.height) * 100;
      const point = { x: Math.max(0, Math.min(100, rawX)), y: Math.max(0, Math.min(100, rawY)) };
      lastPoint = point;
      applyMove(point.x, point.y);
    };
    const onUp = () => {
      isDragging.current = false;
      applyMove.cancel();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (lastPoint) {
        onDragEnd(device.id, lastPoint.x, lastPoint.y);
        onDragMoveEnd(device.id, lastPoint.x, lastPoint.y);
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={device.label}
      className={styles.markerWrap}
      style={{ left: `${posX}%`, top: `${posY}%`, cursor: draggable ? 'grab' : 'pointer' }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (didMove.current) return;
        onClick();
      }}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div
        className={styles.markerCircle}
        style={{ backgroundColor: color, border: '2px dashed white' }}
        title={device.label}
      >
        {device.type === 'cctv' ? (
          <CameraIcon width={12} height={12} aria-hidden="true" />
        ) : (
          <WifiIcon width={12} height={12} aria-hidden="true" />
        )}
      </div>
      {selected && <span className={styles.markerLabel}>{device.label}</span>}
    </div>
  );
};

/* ── 장비 추가 팝업 ──
 * 정보 입력과 위치 지정을 같은 화면(입력 단계)에서 함께 진행 — 도면을 클릭하면 위치가 잡히고,
 * 다시 클릭하면 위치를 옮길 수 있음. CCTV만 이후 시야 범위 지정 단계가 추가로 붙어 총 2단계.
 * 종료 버튼 규칙: 아직 생성되지 않는 중간 단계는 "다음", 실제로 저장되는 마지막 클릭만 "추가"로 통일
 * (구역추가 팝업과도 동일한 규칙 — 툴바의 "+ 노드 추가"/"+ 구역 추가"와 같은 동사로 시작·종료되게 함).
 */
const NodeAddPopup = ({
  containerRef,
  type,
  onTypeChange,
  stage,
  hasPosition,
  selectedCellCount,
  hasStartNode,
  onCancel,
  onBack,
  onSubmitEntry,
  onFinalize,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  type: PlacingDeviceType;
  onTypeChange: (type: PlacingDeviceType) => void;
  stage: 'entry' | 'fov';
  hasPosition: boolean;
  selectedCellCount: number;
  // 시작 노드는 층당 1개만 허용돼서, 이미 있으면 칩을 비활성화함
  hasStartNode: boolean;
  onCancel: () => void;
  onBack: () => void;
  onSubmitEntry: (type: PlacingDeviceType, deviceId: string, location: string) => void;
  onFinalize: (deviceId: string, location: string) => void;
}) => {
  const [deviceId, setDeviceId] = useState('');
  const [location, setLocation] = useState('');

  const isStructureNode = isStructureNodeType(type);
  const isCctv = type === 'cctv';
  const totalSteps = isCctv ? 2 : 1;
  const stepNumber = stage === 'entry' ? 1 : totalSteps;

  if (stage === 'fov') {
    return (
      <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.nodeAddHeader}>
          <span className={styles.nodeAddTitle}>
            {DEVICE_PLACE_CONFIG[type].label} 시야 범위 지정
          </span>
          <span className={styles.nodeAddStepBadge}>
            {stepNumber}/{totalSteps}
          </span>
        </div>
        <span className={styles.nodeAddHint}>
          {selectedCellCount > 0
            ? `${selectedCellCount}칸 선택됨. 다시 드래그하면 그 영역으로 새로 잡히고, 칸을 클릭하면 하나씩 켜고 끌 수 있어요.`
            : '도면을 드래그해서 카메라 시야 구역에 해당하는 칸을 선택해주세요'}
        </span>

        <div className={styles.nodeAddActions}>
          <button type="button" className={styles.nodeAddBackBtn} onClick={onBack}>
            이전
          </button>
          <button type="button" className={styles.nodeAddCancelBtn} onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className={styles.nodeAddSubmitBtn}
            disabled={selectedCellCount === 0}
            onClick={() => onFinalize(deviceId, location)}
          >
            추가
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = hasPosition && (isStructureNode || !!deviceId.trim());

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>노드 추가</span>
        <span className={styles.nodeAddStepBadge}>
          {stepNumber}/{totalSteps}
        </span>
      </div>
      <span className={styles.nodeAddHint}>
        {hasPosition
          ? '위치가 지정됐어요. 다른 곳을 클릭하면 위치를 옮길 수 있어요.'
          : '도면을 클릭해서 위치를 지정해주세요'}
      </span>

      <div className={styles.nodeAddField}>
        <span className={styles.nodeAddLabel}>노드 종류</span>
        <div className={styles.deviceTypeChips}>
          {(['cctv', 'light', 'door', 'stair', 'hallway', 'start'] as const).map((t) => {
            const disabled = t === 'start' && hasStartNode;
            return (
              <button
                key={t}
                type="button"
                className={clsx(styles.deviceTypeChip, type === t && styles.deviceTypeChipActive)}
                disabled={disabled}
                title={disabled ? '이 층에는 이미 시작 노드가 있어요' : undefined}
                onClick={() => onTypeChange(t)}
              >
                {DEVICE_PLACE_CONFIG[t].label}
              </button>
            );
          })}
        </div>
      </div>

      {!isStructureNode && (
        <>
          <div className={styles.nodeAddField}>
            <span className={styles.nodeAddLabel}>장치 ID</span>
            <input
              className={styles.nodeAddInput}
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="CCTV-A3-05"
            />
          </div>

          <div className={styles.nodeAddField}>
            <span className={styles.nodeAddLabel}>설치 위치</span>
            <input
              className={styles.nodeAddInput}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="3층 · 복도 동측"
            />
          </div>
        </>
      )}

      <div className={styles.nodeAddActions}>
        <button type="button" className={styles.nodeAddCancelBtn} onClick={onCancel}>
          취소
        </button>
        <button
          type="button"
          className={styles.nodeAddSubmitBtn}
          disabled={!canSubmit}
          onClick={() => onSubmitEntry(type, deviceId.trim(), location.trim())}
        >
          {isCctv ? '다음' : '추가'}
        </button>
      </div>
    </div>
  );
};

/* ── 구역 설정 팝업 — 백엔드 저장 단위가 그리드 셀 집합이라 드래그는 겹치는 셀을 고르는 용도로 씀 ── */
const ZoneAddPopup = ({
  containerRef,
  selectedCellCount,
  onCancel,
  onSave,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  selectedCellCount: number;
  onCancel: () => void;
  onSave: (label: string) => void;
}) => {
  const [zoneName, setZoneName] = useState('');
  const hasSelectedCells = selectedCellCount > 0;

  const handleSave = () => {
    onSave(zoneName.trim());
  };

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>구역 설정</span>
        <span className={styles.nodeAddStepBadge}>{hasSelectedCells ? '2/2' : '1/2'}</span>
      </div>
      <span className={styles.nodeAddHint}>
        {hasSelectedCells
          ? `${selectedCellCount}칸 선택됨. 다시 드래그하면 그 영역으로 새로 잡혀요. 이름을 입력하고 추가 버튼을 누르면 저장됩니다.`
          : '이름을 입력하거나 도면을 드래그해서 영역에 해당하는 칸을 선택해주세요. 어느 쪽을 먼저 하셔도 괜찮아요.'}
      </span>

      <div className={styles.nodeAddField}>
        <span className={styles.nodeAddLabel}>구역 이름</span>
        <input
          className={styles.nodeAddInput}
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          placeholder="3층 앞 복도 구역"
        />
      </div>

      <div className={styles.nodeAddActions}>
        <button type="button" className={styles.nodeAddCancelBtn} onClick={onCancel}>
          취소
        </button>
        <button
          type="button"
          className={styles.nodeAddSubmitBtn}
          disabled={!zoneName.trim() || !hasSelectedCells}
          onClick={handleSave}
        >
          추가
        </button>
      </div>
    </div>
  );
};

/* ── 엣지 연결 팝업 — 두 노드를 클릭해서 고른 뒤 거리·양방향 여부를 입력 ── */
const EdgeAddPopup = ({
  containerRef,
  fromLabel,
  toLabel,
  onCancel,
  onSave,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  fromLabel: string;
  toLabel: string;
  onCancel: () => void;
  onSave: (distance: number, bidirectional: boolean) => void;
}) => {
  const [distance, setDistance] = useState('');
  const [bidirectional, setBidirectional] = useState(true);

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || /^\d+(\.\d+)?$/.test(raw)) setDistance(raw);
  };

  const isValid = Number(distance) > 0;

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>엣지 연결</span>
      </div>
      <span className={styles.nodeAddHint}>
        {fromLabel} → {toLabel}
      </span>

      <div className={styles.nodeAddField}>
        <span className={styles.nodeAddLabel}>거리(m)</span>
        <input
          className={styles.nodeAddInput}
          type="text"
          inputMode="decimal"
          value={distance}
          onChange={handleDistanceChange}
          placeholder="3.5"
        />
      </div>

      <label className={styles.edgeBidirectionalField}>
        <input
          type="checkbox"
          checked={bidirectional}
          onChange={(e) => setBidirectional(e.target.checked)}
        />
        양방향 통행 가능
      </label>

      <div className={styles.nodeAddActions}>
        <button type="button" className={styles.nodeAddCancelBtn} onClick={onCancel}>
          취소
        </button>
        <button
          type="button"
          className={styles.nodeAddSubmitBtn}
          disabled={!isValid}
          onClick={() => onSave(Number(distance), bidirectional)}
        >
          추가
        </button>
      </div>
    </div>
  );
};

/* ── 장비 카드 ── */
const DeviceCard = ({
  item,
  selected,
  editing,
  editForm,
  onEditFormChange,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onOpenSettings,
}: {
  item: PanelItem;
  selected: boolean;
  editing: boolean;
  editForm: { label: string; zone: string };
  onEditFormChange: (form: { label: string; zone: string }) => void;
  onSelect: (item: PanelItem) => void;
  onStartEdit: (item: PanelItem) => void;
  onSaveEdit: (item: PanelItem) => void;
  onDelete: (item: PanelItem) => void;
  onOpenSettings: (item: PanelItem) => void;
}) => (
  <div
    data-panel-id={item.id}
    className={clsx(styles.deviceCard, selected && styles.deviceCardSelected)}
    onClick={() => onSelect(item)}
  >
    {editing ? (
      <input
        className={styles.deviceCardNameInput}
        value={editForm.label}
        onChange={(e) => onEditFormChange({ ...editForm, label: e.target.value })}
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <span className={styles.deviceCardName}>{item.label}</span>
    )}
    <div className={styles.deviceCardRow}>
      <span className={styles.deviceCardKey}>장치 ID</span>
      <span className={styles.deviceCardValue}>{item.id.toUpperCase()}</span>
    </div>
    <div className={styles.deviceCardRow}>
      <span className={styles.deviceCardKey}>상태</span>
      <StatusBadge label={item.statusText} color={item.statusOnline ? 'green' : 'neutral'} dot />
    </div>
    <div className={styles.deviceCardRow}>
      <span className={styles.deviceCardKey}>설치 위치</span>
      {editing ? (
        <input
          className={styles.deviceCardValueInput}
          value={editForm.zone}
          onChange={(e) => onEditFormChange({ ...editForm, zone: e.target.value })}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={styles.deviceCardValue}>{item.zone}</span>
      )}
    </div>
    <div className={styles.deviceCardActions}>
      {/* CCTV는 이름 수정·활성화·감시영역을 한 모달에서 처리하므로 버튼을 "수정" 하나로 합침 */}
      {item.type === 'cctv' ? (
        <button
          type="button"
          className={styles.deviceCardEditBtn}
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings(item);
          }}
        >
          수정
        </button>
      ) : (
        <>
          {editing ? (
            <button
              type="button"
              className={styles.deviceCardDoneBtn}
              onClick={(e) => {
                e.stopPropagation();
                onSaveEdit(item);
              }}
            >
              완료
            </button>
          ) : (
            <button
              type="button"
              className={styles.deviceCardEditBtn}
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(item);
              }}
            >
              수정
            </button>
          )}
          {item.type === 'light' && (
            <button
              type="button"
              className={styles.deviceCardEditBtn}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings(item);
              }}
            >
              설정
            </button>
          )}
        </>
      )}
      <button
        type="button"
        className={styles.deviceCardDeleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
      >
        삭제
      </button>
    </div>
  </div>
);

/* ── 도면 캔버스 ── */
const FloorCanvas = ({
  mapWrapRef,
  floor,
  resolvedImageUrl,
  canvasH,
  selected,
  zoom,
  editingItemId,
  placingActive,
  zoneAddActive,
  zoneDraftRect,
  onZoneDraftChange,
  onZoneDragEnd,
  savedZones,
  structureNodes,
  editingStructureId,
  onStructureNodeMove,
  onStructureNodeMoveEnd,
  graphNodes,
  graphEdges,
  edgeAddActive,
  onNodeClickForEdge,
  selectedEdgeId,
  onEdgeSelect,
  onEdgeDelete,
  selectedZoneRef,
  onZoneRefSelect,
  cctvGridCellsMode,
  floorGridCells,
  selectedGridCellIds,
  gridCellPxSize,
  onGridCellToggle,
  stagedCameraPosition,
  existingFireOriginPosition,
  devicePositions,
  addedDevices,
  onSelectDevice,
  onMapClick,
  onDeviceMoved,
  onDeviceMoveEnd,
  onUpload,
  onBackgroundClick,
}: {
  mapWrapRef: React.RefObject<HTMLDivElement>;
  floor: Floor;
  resolvedImageUrl: string | null;
  canvasH: number;
  selected: SelectedItem | null;
  zoom: number;
  editingItemId: string | null;
  placingActive: boolean;
  zoneAddActive: boolean;
  zoneDraftRect: ZoneRect | null;
  onZoneDraftChange: (rect: ZoneRect | null) => void;
  onZoneDragEnd: () => void;
  savedZones: ZoneEntry[];
  structureNodes: StructureNode[];
  editingStructureId: string | null;
  onStructureNodeMove: (id: string, x: number, y: number) => void;
  onStructureNodeMoveEnd: (id: string, x: number, y: number) => void;
  graphNodes: MapNode[];
  graphEdges: MapEdge[];
  edgeAddActive: boolean;
  onNodeClickForEdge: (id: string) => void;
  selectedEdgeId: string | null;
  onEdgeSelect: (id: string) => void;
  onEdgeDelete: (id: string) => void;
  selectedZoneRef: ZoneRefSelection | null;
  onZoneRefSelect: (ref: ZoneRefSelection) => void;
  cctvGridCellsMode: 'hidden' | 'selecting' | 'viewing' | 'browsing';
  floorGridCells: FloorGridCell[];
  selectedGridCellIds: string[];
  gridCellPxSize: { w: number; h: number };
  onGridCellToggle: (cellId: string) => void;
  stagedCameraPosition: { x: number; y: number } | null;
  existingFireOriginPosition: { x: number; y: number } | null;
  devicePositions: Record<string, { x: number; y: number }>;
  addedDevices: AddedDevice[];
  onSelectDevice: (d: DeviceMarker) => void;
  onMapClick: (x: number, y: number) => void;
  onDeviceMoved: (id: string, x: number, y: number) => void;
  onDeviceMoveEnd: (id: string, x: number, y: number) => void;
  onUpload: () => void;
  onBackgroundClick: () => void;
}) => {
  const hasFloorPlan = floor.segmentationStatus === 'DONE';

  if (!hasFloorPlan) {
    // 이미지가 올라온 층만 "분석 중"으로 취급 — 업로드 전 층은 기존 안내를 보여줌
    const isAnalyzing =
      !!floor.mapImageUrl &&
      (floor.segmentationStatus === 'PENDING' || floor.segmentationStatus === 'PROCESSING');
    const isAnalysisFailed = floor.segmentationStatus === 'FAILED';

    return (
      <div className={styles.canvasPlaceholder}>
        {isAnalyzing ? (
          <>
            <LoadingState size="md" message="AI가 도면을 분석하고 있습니다" />
            <p className={styles.canvasPlaceholderText}>
              완료되면 이 화면에 도면과 노드가 자동으로 표시됩니다
            </p>
          </>
        ) : (
          <>
            <span className={styles.canvasPlaceholderTitle}>
              {isAnalysisFailed ? '도면 분석에 실패했습니다' : '등록된 도면이 없습니다'}
            </span>
            <p className={styles.canvasPlaceholderText}>
              {isAnalysisFailed
                ? '도면을 다시 업로드해 주세요'
                : '도면을 업로드하거나 AI 영역 분할을 실행해 주세요'}
            </p>
            <Button variant="primary" size="sm" onClick={onUpload}>
              도면 {isAnalysisFailed ? '다시 ' : ''}업로드
            </Button>
          </>
        )}
      </div>
    );
  }

  const scale = zoom / 100;

  return (
    <div ref={mapWrapRef} className={styles.mapWrap} style={{ transform: `scale(${scale})` }}>
      <MockFloorMap3F
        mapImageUrl={resolvedImageUrl}
        canvasH={canvasH}
        placingActive={placingActive}
        zoneAddActive={zoneAddActive}
        zoneDraftRect={zoneDraftRect}
        onZoneDraftChange={onZoneDraftChange}
        onZoneDragEnd={onZoneDragEnd}
        savedZones={savedZones}
        structureNodes={structureNodes}
        editingStructureId={editingStructureId}
        onStructureNodeMove={onStructureNodeMove}
        onStructureNodeMoveEnd={onStructureNodeMoveEnd}
        graphNodes={graphNodes}
        graphEdges={graphEdges}
        edgeAddActive={edgeAddActive}
        onNodeClickForEdge={onNodeClickForEdge}
        selectedEdgeId={selectedEdgeId}
        onEdgeSelect={onEdgeSelect}
        onEdgeDelete={onEdgeDelete}
        selectedZoneRef={selectedZoneRef}
        onZoneRefSelect={onZoneRefSelect}
        cctvGridCellsMode={cctvGridCellsMode}
        floorGridCells={floorGridCells}
        selectedGridCellIds={selectedGridCellIds}
        gridCellPxSize={gridCellPxSize}
        onGridCellToggle={onGridCellToggle}
        onMapClick={onMapClick}
        onBackgroundClick={onBackgroundClick}
      />
      {stagedCameraPosition && (
        <div
          className={styles.stagedCameraMarker}
          style={{ left: `${stagedCameraPosition.x}%`, top: `${stagedCameraPosition.y}%` }}
        />
      )}
      {existingFireOriginPosition && (
        <div
          className={styles.existingFireOriginMarker}
          style={{
            left: `${existingFireOriginPosition.x}%`,
            top: `${existingFireOriginPosition.y}%`,
          }}
        />
      )}
      {floor.devices.map((device) => {
        const pos = devicePositions[device.id] ?? { x: device.x, y: device.y };
        return (
          <DevicePin
            key={device.id}
            device={device}
            posX={pos.x}
            posY={pos.y}
            selected={selected?.kind === 'device' && selected.data.id === device.id}
            draggable={editingItemId === device.id}
            onClick={() => onSelectDevice(device)}
            onDragEnd={onDeviceMoved}
          />
        );
      })}

      {/* 사용자가 추가한 장치 마커 */}
      {addedDevices.map((d) => {
        const pos = devicePositions[d.id] ?? { x: d.x, y: d.y };
        return (
          <AddedDevicePin
            key={d.id}
            device={d}
            posX={pos.x}
            posY={pos.y}
            selected={selected?.kind === 'device' && selected.data.id === d.id}
            draggable={editingItemId === d.id}
            onClick={() => onSelectDevice(d as unknown as DeviceMarker)}
            onDragEnd={onDeviceMoved}
            onDragMoveEnd={onDeviceMoveEnd}
          />
        );
      })}
    </div>
  );
};

/* ── 메인 페이지 ── */
const FloorPlansDetailPage = () => {
  const navigate = useNavigate();
  const { buildingId, floorId } = useParams<{ buildingId: string; floorId: string }>();
  const { show } = useToast();

  const [floorBuildings, setFloorBuildings] = useState<FloorBuilding[]>([]);
  const [floor, setFloor] = useState<Floor | null>(null);
  const [loadingFloor, setLoadingFloor] = useState(false);
  const [resolvedMapImageUrl, setResolvedMapImageUrl] = useState<string | null>(null);
  const [floorGridCells, setFloorGridCells] = useState<FloorGridCell[]>([]);
  // 도면 이미지의 원본 가로/세로 비율 — viewBox 높이(canvasH)를 여기에 맞춰 이미지 왜곡을 없앰
  const [imageAspect, setImageAspect] = useState<number | null>(null);

  // SVG viewBox 높이 — 폭 CANVAS_W(560)은 고정, 높이만 도면 실제 비율에 맞춤.
  // 이미지 원본 비율을 우선(가장 직접적), 없으면 그리드 columns/rows, 그것도 없으면 4:3.
  // viewBox 비율 == 이미지 비율이라 preserveAspectRatio="none"으로 채워도 이미지가 안 늘어남
  const canvasH = useMemo(() => {
    if (imageAspect && imageAspect > 0) return CANVAS_W / imageAspect;
    if (floorGridCells.length > 0) {
      const { cols, rows } = getGridDimensions(floorGridCells);
      if (cols > 0 && rows > 0) return (CANVAS_W * rows) / cols;
    }
    return DEFAULT_CANVAS_H;
  }, [imageAspect, floorGridCells]);

  // 업로드 직후엔 AI 세그멘테이션이 아직 진행 중(PENDING/PROCESSING)이라 노드/도면이 안 뜸.
  // 이미지가 올라온 층에서 DONE/FAILED가 아니면 "분석 중"으로 보고(업로드 전 층은 제외),
  // 완료로 바뀌는 순간 화면을 자동 새로고침함
  const isFloorReady = floor?.segmentationStatus === 'DONE';
  const isAnalysisSettled =
    floor?.segmentationStatus === 'DONE' || floor?.segmentationStatus === 'FAILED';
  const isAnalyzing = Boolean(floor?.mapImageUrl) && !isAnalysisSettled;

  // 빌딩 목록 (사이드바 셀렉터용)
  useEffect(() => {
    getFloorBuildings()
      .then(setFloorBuildings)
      .catch(() => {});
  }, []);

  // 층이 바뀌거나 도면을 다시 올렸을 때, 이전 도면 기준으로 만들어진 노드·장비·구역이
  // 화면에 남지 않도록 층 단위 상태를 한 번에 비움 (각 조회 effect가 새 데이터로 다시 채움)
  const resetFloorScopedState = useCallback(() => {
    setStructureNodes([]);
    setGraphNodes([]);
    setGraphEdges([]);
    setAddedDevices([]);
    setRealCctvs([]);
    setIotLights([]);
    // 드래그로 옮긴 위치를 담아두는 오버레이 — 층을 바꿔도 안 비우면 다른 층에서 우연히
    // id가 겹칠 때 엉뚱한 위치가 그대로 보일 수 있음
    setDevicePositions({});
    setZones([]);
    setFloorGridCells([]);
    setSelectedItem(null);
    setSelectedZoneRef(null);
    setSelectedEdgeId(null);
    setEditingItemId(null);
    setEditingStructureId(null);
    setEditingZoneId(null);
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setEdgeAddOpen(false);
    setEditingCctvId(null);
    setCctvDraftCellIds([]);
    setZoneDraftCellIds([]);
    setNodeStagedPosition(null);
    setShowGridOverlay(false);
  }, []);

  // 현재 층 상세 — 층 전환 시 이전 층 데이터가 남아있지 않도록 즉시 초기화
  useEffect(() => {
    if (!buildingId || !floorId) return;
    let cancelled = false;
    setFloor(null);
    resetFloorScopedState();
    setLoadingFloor(true);
    getFloorDetail(buildingId, floorId)
      .then((data) => {
        if (!cancelled) setFloor(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingFloor(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildingId, floorId, resetFloorScopedState]);

  // 세그멘테이션이 끝날 때까지 층 상세를 주기적으로 다시 조회해서 상태 전환을 감지
  useEffect(() => {
    if (!buildingId || !floorId || !isAnalyzing) return;
    let cancelled = false;
    const timer = setInterval(() => {
      getFloorDetail(buildingId, floorId)
        .then((data) => {
          // clearInterval은 다음 틱만 막아서, 층 전환 중 이미 보낸 요청이 늦게 응답하면
          // 새 층 데이터를 이전 층 데이터로 덮어쓸 수 있음 — cancelled로 막음
          if (!cancelled) setFloor(data);
        })
        .catch(() => {});
    }, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [buildingId, floorId, isAnalyzing]);

  // 분석이 끝나면(DONE) 노드·엣지는 아래 맵그래프 effect가 isFloorReady 전환으로 자동 재조회하고,
  // 그리드 셀은 배율 재적용 effect가 다시 받아온다 — 별도의 페이지 새로고침은 필요 없음

  // 캔버스에 실제로 그릴 도면 이미지의 presigned URL — 도면이 있는 층일 때만, 그 층 하나에 대해서만 조회
  useEffect(() => {
    setResolvedMapImageUrl(null);
    if (!buildingId || !floorId || !floor?.mapImageUrl) return;
    let cancelled = false;
    getFloorImageUrl(buildingId, floorId)
      .then(({ imageUrl }) => {
        if (!cancelled) setResolvedMapImageUrl(imageUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [buildingId, floorId, floor?.mapImageUrl]);

  // 도면 이미지 원본 비율 측정 — 그리드가 없을 때 canvasH 계산의 기준으로 씀
  useEffect(() => {
    setImageAspect(null);
    if (!resolvedMapImageUrl) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalHeight > 0) {
        setImageAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = resolvedMapImageUrl;
    return () => {
      cancelled = true;
    };
  }, [resolvedMapImageUrl]);

  // 업로드 시 정한 그리드 배율이 AI 분석 과정에서 사라질 수 있어, 분석 완료(DONE) 후
  // sessionStorage에 남겨둔 값으로 PUT /grid를 한 번 더 호출해 배율을 확정함
  useEffect(() => {
    if (!floorId || !isFloorReady) return;
    const cellSizeMeter = readStoredNumber(PENDING_GRID_SIZE_KEY(floorId));
    if (!cellSizeMeter) return;
    let cancelled = false;
    setFloorGrid(floorId, cellSizeMeter)
      .then(() => getFloorGridCells(floorId))
      .then((cells) => {
        if (cancelled) return;
        setFloorGridCells(cells);
        rememberGridSize(floorId, cellSizeMeter);
        show({
          title: `그리드 배율(${cellSizeMeter}m)이 자동 적용되었습니다.`,
          variant: 'success',
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const msg = isAxiosError<{ message?: string }>(error)
          ? (error.response?.data?.message ?? '')
          : '';
        show({
          title: `그리드 배율 자동 적용 실패${msg ? ` (${msg})` : ''} — 그리드 설정에서 직접 지정해주세요.`,
          variant: 'error',
          duration: 8000,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [floorId, isFloorReady, show]);

  // 맵그래프(노드/엣지) 조회 — 문/계단은 기존 구조 노드 편집 상태로, 나머지는 조회 전용으로 보관.
  // 세그멘테이션 상태가 DONE으로 바뀌어도 서버가 노드를 다 만들기 전이라 빈 그래프가 올 수 있어서,
  // 비어 있으면 짧은 간격으로 몇 번 더 조회한다. (예전에는 이 자리에서 페이지를 통째로
  // 새로고침했는데, 편집 중이던 상태가 날아가고 깜빡임이 커서 재조회 방식으로 바꿈)
  useEffect(() => {
    if (!floorId || !isFloorReady) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = () => {
      getFloorGraph(floorId)
        .then((graph) => {
          if (cancelled) return;
          const structureFromGraph: StructureNode[] = graph.nodes.flatMap((n) => {
            const structureType = API_TYPE_TO_STRUCTURE[n.type];
            if (!structureType) return [];
            return [
              {
                id: n.id,
                type: structureType,
                x: n.x * CANVAS_W,
                y: n.y * canvasH,
                isFinalExit: n.isExitTarget,
              },
            ];
          });
          setStructureNodes(structureFromGraph);
          setGraphNodes(graph.nodes.filter((n) => !API_TYPE_TO_STRUCTURE[n.type]));
          setGraphEdges(graph.edges);

          // 분석 직후 아직 노드가 안 만들어졌으면 잠시 뒤 다시 시도(최대 GRAPH_RETRY_LIMIT회)
          if (graph.nodes.length === 0 && attempts < GRAPH_RETRY_LIMIT) {
            attempts += 1;
            timer = setTimeout(load, GRAPH_RETRY_INTERVAL_MS);
          }
        })
        .catch(() => {});
    };

    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // canvasH가 확정되면(그리드/이미지 로드) 구조 노드 px 좌표를 그 기준으로 다시 계산해야 함
  }, [floorId, isFloorReady, canvasH]);

  // IoT 유도등 조회 — 기존 장비 마커 목록(addedDevices)에 실제 데이터로 채워 넣음
  useEffect(() => {
    if (!floorId) return;
    let cancelled = false;
    getFloorLights(floorId)
      .then((lights) => {
        if (cancelled) return;
        setIotLights(lights);
        setAddedDevices((prev) => [
          ...prev.filter((d) => d.placeType !== 'light'),
          ...lights.map(
            (light): AddedDevice => ({
              id: light.id,
              type: 'iot',
              placeType: 'light',
              label: light.name,
              x: light.x * 100,
              y: light.y * 100,
              status: 'online',
              zone: '사용자 등록',
            }),
          ),
        ]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [floorId]);

  // CCTV 조회 — 실제 등록된 CCTV를 장비 마커 목록에 채워 넣음
  useEffect(() => {
    if (!floorId) return;
    let cancelled = false;
    getFloorCctvs(floorId)
      .then((cctvs) => {
        if (cancelled) return;
        setRealCctvs(cctvs);
        setAddedDevices((prev) => [
          ...prev.filter((d) => d.type !== 'cctv'),
          ...cctvs.map(
            (cctv): AddedDevice => ({
              id: cctv.id,
              type: 'cctv',
              placeType: 'cctv',
              label: cctv.name,
              x: cctv.x * 100,
              y: cctv.y * 100,
              status: 'online',
              zone: `모니터링 ${cctv.monitoredGridCellCount}칸 · ${cctv.monitoredAreaM2}㎡`,
            }),
          ),
        ]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [floorId]);

  // 사용자 지정 영역 조회 — 목록 API는 이름만 내려줘서, 화면에 그리려면 구역마다 셀 상세를 따로 조회
  useEffect(() => {
    if (!floorId) return;
    let cancelled = false;
    getFloorUserZones(floorId)
      .then((zoneList) => Promise.all(zoneList.map((zone) => getUserZoneDetail(floorId, zone.id))))
      .then((details) => {
        if (cancelled) return;
        setZones(
          details.map((d) => ({
            id: d.id,
            type: 'general',
            label: d.name,
            cellIds: d.cells.map((c) => c.cellId),
          })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [floorId]);

  // 층 그리드 셀 조회 — CCTV 시야구역 선택에 사용
  useEffect(() => {
    if (!floorId) return;
    let cancelled = false;
    getFloorGridCells(floorId)
      .then((cells) => {
        if (!cancelled) setFloorGridCells(cells);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [floorId]);

  const [selectedBuildingId] = useState(buildingId ?? '');
  const [selectedFloorId, setSelectedFloorId] = useState(floorId ?? '');
  const [zoom, setZoom] = useState(100);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [selectedZoneRef, setSelectedZoneRef] = useState<ZoneRefSelection | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ file: File; previewUrl: string } | null>(
    null,
  );
  const [isReuploading, setIsReuploading] = useState(false);

  // 미리보기 objectURL이 명시적으로 취소/제출되지 않고 화면을 벗어나는 경우를 대비한 안전망
  useEffect(() => {
    return () => {
      if (pendingUpload) URL.revokeObjectURL(pendingUpload.previewUrl);
    };
  }, [pendingUpload]);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<PanelItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [nodeAddOpen, setNodeAddOpen] = useState(false);
  const [zoneAddOpen, setZoneAddOpen] = useState(false);
  const [edgeAddOpen, setEdgeAddOpen] = useState(false);
  const [edgeDraftFromId, setEdgeDraftFromId] = useState<string | null>(null);
  const [edgeDraftToId, setEdgeDraftToId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneEntry[]>([]);
  const [zoneDraftRect, setZoneDraftRectState] = useState<ZoneRect | null>(null);
  const zoneDraftRectRef = useRef<ZoneRect | null>(null);
  const setZoneDraftRect = (rect: ZoneRect | null) => {
    zoneDraftRectRef.current = rect;
    setZoneDraftRectState(rect);
  };
  const [topFilter, setTopFilter] = useState<'all' | 'device' | 'zone'>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<
    'cctv' | 'light' | 'door' | 'stair' | 'hallway' | 'start' | null
  >(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; zone: string }>({
    label: '',
    zone: '',
  });
  const [nodeAddType, setNodeAddType] = useState<PlacingDeviceType>('cctv');
  const [addedDevices, setAddedDevices] = useState<AddedDevice[]>([]);
  const [structureNodes, setStructureNodes] = useState<StructureNode[]>([]);
  const [graphNodes, setGraphNodes] = useState<MapNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<MapEdge[]>([]);
  const [iotLights, setIotLights] = useState<IoTLight[]>([]);
  const [lightSettingsTarget, setLightSettingsTarget] = useState<IoTLight | null>(null);
  const [cctvSettingsTarget, setCctvSettingsTarget] = useState<Cctv | null>(null);
  const [isSavingCctv, setIsSavingCctv] = useState(false);
  const [fireOriginModalOpen, setFireOriginModalOpen] = useState(false);
  // 발화점 지정 모드 — 시나리오를 고르고 나면 도면 그리드 클릭으로 셀을 지정할 수 있게 됨
  const [fireOriginScenarioId, setFireOriginScenarioId] = useState<string | null>(null);
  const [fireOriginDraftCellId, setFireOriginDraftCellId] = useState<string | null>(null);
  const createFireOriginMutation = useCreateFireOriginMutation();
  // 이미 지정된 발화점이 있으면 도면에 표시하고, 재지정 시 경고해줌
  const existingFireOriginQuery = useScenarioFireOriginQuery(fireOriginScenarioId ?? undefined);
  const existingFireOrigin = existingFireOriginQuery.data?.[0] ?? null;
  const [editingCctvId, setEditingCctvId] = useState<string | null>(null);
  const [editingStructureId, setEditingStructureId] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneEditLabel, setZoneEditLabel] = useState('');
  const [nodeAddStage, setNodeAddStage] = useState<'entry' | 'fov'>('entry');
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  // 그리드 설정 팝업은 "그리드 표시" 토글과 CCTV 등록 흐름 둘 다에서 공유해서 사용 —
  // 확인 버튼을 눌렀을 때 어느 쪽으로 돌아가야 하는지 구분하기 위한 값
  const [gridSetupPromptOpen, setGridSetupPromptOpen] = useState(false);
  const [gridSetupIntent, setGridSetupIntent] = useState<
    'toggle' | 'cctv' | 'zone' | 'fireOrigin' | null
  >(null);
  const [gridSizeMeterInput, setGridSizeMeterInput] = useState('1');
  const [realCctvs, setRealCctvs] = useState<Cctv[]>([]);
  const [cctvDraftCellIds, setCctvDraftCellIds] = useState<string[]>([]);
  const [zoneDraftCellIds, setZoneDraftCellIds] = useState<string[]>([]);
  const [zoneDeleteTarget, setZoneDeleteTarget] = useState<ZoneEntry | null>(null);
  const [isDeletingZone, setIsDeletingZone] = useState(false);
  const [nodeStagedPosition, setNodeStagedPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [devicePositions, setDevicePositions] = useState<Record<string, { x: number; y: number }>>(
    {},
  );

  const handleDeviceMoved = (id: string, x: number, y: number) => {
    setDevicePositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  // 드래그가 끝났을 때만 실제 위치를 저장. devicePositions는 드래그 중 화면에 즉시 반영하기 위한
  // 임시 오버레이라, 서버에 커밋되면 addedDevices의 x/y도 같이 맞춰줌 — 그래야 이후 addedDevices가
  // 다른 이유로 재구성되어도 devicePositions 없이 최신 위치를 그대로 유지함
  const handleDeviceMoveEnd = (id: string, x: number, y: number) => {
    const device = addedDevices.find((d) => d.id === id);
    if (device?.placeType === 'light') {
      updateIoTLight(id, { name: device.label, x: x / 100, y: y / 100 })
        .then(() => {
          setAddedDevices((prev) => prev.map((d) => (d.id === id ? { ...d, x, y } : d)));
        })
        .catch(() => {});
      return;
    }
    if (device?.placeType === 'cctv') {
      updateCctv(id, { name: device.label, x: x / 100, y: y / 100 })
        .then((updated) => {
          setRealCctvs((prev) => prev.map((c) => (c.id === id ? updated : c)));
          setAddedDevices((prev) => prev.map((d) => (d.id === id ? { ...d, x, y } : d)));
        })
        .catch(() => {});
    }
  };

  const handleOpenDeviceSettings = (item: PanelItem) => {
    if (item.type === 'light') {
      const light = iotLights.find((l) => l.id === item.id);
      if (light) setLightSettingsTarget(light);
    } else if (item.type === 'cctv') {
      const cctv = realCctvs.find((c) => c.id === item.id);
      if (cctv) setCctvSettingsTarget(cctv);
    }
  };

  const handleCctvToggleEnabled = (enabled: boolean) => {
    if (!cctvSettingsTarget || cctvSettingsTarget.enabled === enabled) return;
    const request = enabled ? enableCctv : disableCctv;
    request(cctvSettingsTarget.id)
      .then((updated) => {
        setRealCctvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setCctvSettingsTarget(updated);
        show({
          title: enabled
            ? 'CCTV를 사용 가능으로 바꿨습니다.'
            : 'CCTV를 사용 불가능으로 바꿨습니다.',
          variant: 'success',
        });
      })
      .catch(() => {
        show({ title: 'CCTV 사용 여부 변경에 실패했습니다.', variant: 'error' });
      });
  };

  // 통합 모달에서 이름만 저장 — 위치(x,y)는 도면 드래그로 바꾸므로 기존 값을 그대로 보냄
  const handleCctvSaveName = (name: string) => {
    if (!cctvSettingsTarget || isSavingCctv) return;
    setIsSavingCctv(true);
    updateCctv(cctvSettingsTarget.id, {
      name,
      x: cctvSettingsTarget.x,
      y: cctvSettingsTarget.y,
    })
      .then((updated) => {
        setRealCctvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setCctvSettingsTarget(updated);
        setAddedDevices((prev) =>
          prev.map((d) => (d.id === updated.id ? { ...d, label: updated.name } : d)),
        );
        show({ title: 'CCTV 정보가 수정되었습니다.', variant: 'success' });
      })
      .catch(() => {
        show({ title: 'CCTV 정보 수정에 실패했습니다.', variant: 'error' });
      })
      .finally(() => setIsSavingCctv(false));
  };

  const handleStartEditCctvCells = () => {
    if (!cctvSettingsTarget) return;
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setEdgeAddOpen(false);
    setEditingCctvId(cctvSettingsTarget.id);
    setCctvDraftCellIds(cctvSettingsTarget.gridCells.map((c) => c.id));
    setCctvSettingsTarget(null);
  };

  const handleCancelEditCctvCells = () => {
    setEditingCctvId(null);
    setCctvDraftCellIds([]);
  };

  const handleSaveEditCctvCells = () => {
    if (!editingCctvId || cctvDraftCellIds.length === 0) return;
    configureCctvGridCells(editingCctvId, cctvDraftCellIds)
      .then((updated) => {
        setRealCctvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setAddedDevices((prev) =>
          prev.map((d) =>
            d.id === updated.id
              ? {
                  ...d,
                  zone: `모니터링 ${updated.monitoredGridCellCount}칸 · ${updated.monitoredAreaM2}㎡`,
                }
              : d,
          ),
        );
        setEditingCctvId(null);
        setCctvDraftCellIds([]);
      })
      .catch(() => {});
  };

  const handleLightToggleEnabled = (enabled: boolean) => {
    if (!lightSettingsTarget) return;
    const request = enabled ? enableIoTLight : disableIoTLight;
    request(lightSettingsTarget.id)
      .then((updated) => {
        setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        setLightSettingsTarget(updated);
      })
      .catch(() => {});
  };

  const handleLightDirectionChange = (direction: 'LEFT' | 'RIGHT' | 'OFF') => {
    if (!lightSettingsTarget) return;
    changeLightDirection(lightSettingsTarget.id, direction).catch(() => {});
  };

  const handleLightGuidanceSave = (
    decisionNodeId: string,
    leftEdgeId: string,
    rightEdgeId: string,
  ) => {
    if (!lightSettingsTarget) return;
    configureLightGuidance(lightSettingsTarget.id, { decisionNodeId, leftEdgeId, rightEdgeId })
      .then((updated) => {
        setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        setLightSettingsTarget(updated);
      })
      .catch(() => {});
  };

  const handleLightPiEndpointSave = (piEndpoint: string) => {
    if (!lightSettingsTarget) return;
    updateLightPiEndpoint(lightSettingsTarget.id, piEndpoint)
      .then((updated) => {
        setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        setLightSettingsTarget(updated);
      })
      .catch(() => {});
  };
  const [toastMsg] = useState<string | null>(null);
  const [toastFading] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodePopupRef = useRef<HTMLDivElement>(null);
  const zonePopupRef = useRef<HTMLDivElement>(null);
  const edgePopupRef = useRef<HTMLDivElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const devicePanelRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastFadeRef.current) clearTimeout(toastFadeRef.current);
    },
    [],
  );

  // 선택된 카드를 상단에 고정하지 않는 대신, 리스트 안에서 스크롤로 한 번 보여줌 (하이퍼링크 이동과 동일한 느낌)
  const focusedPanelId =
    selectedItem?.kind === 'device' ? selectedItem.data.id : (selectedZoneRef?.id ?? null);

  useEffect(() => {
    if (!focusedPanelId) return;
    const target = devicePanelRef.current?.querySelector(`[data-panel-id="${focusedPanelId}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedPanelId]);

  // 장비 추가 팝업: 팝업 및 도면 영역 바깥 클릭 시 닫기 (도면 클릭은 배치로 처리)
  // 위치를 한 번이라도 지정한 뒤에는 진행 상태를 실수로 잃지 않도록 바깥 클릭으로 닫히지 않게 함
  useEffect(() => {
    if (!nodeAddOpen || nodeStagedPosition) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (nodePopupRef.current?.contains(target)) return;
      if (mapWrapRef.current?.contains(target)) return;
      setNodeAddOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [nodeAddOpen, nodeStagedPosition]);

  // 장비 추가 팝업이 닫히면 배치 진행 상태 초기화
  useEffect(() => {
    if (!nodeAddOpen) {
      setNodeAddStage('entry');
      setNodeStagedPosition(null);
      setZoneDraftRect(null);
    }
  }, [nodeAddOpen]);

  // 구역 설정 팝업: 팝업 및 도면 영역 바깥 클릭 시 닫기 (도면 드래그는 구역 선택으로 처리)
  // 셀을 이미 선택한 뒤에는 진행 상태를 실수로 잃지 않도록 바깥 클릭으로 닫히지 않게 함
  useEffect(() => {
    if (!zoneAddOpen || zoneDraftCellIds.length > 0) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (zonePopupRef.current?.contains(target)) return;
      if (mapWrapRef.current?.contains(target)) return;
      setZoneAddOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [zoneAddOpen, zoneDraftCellIds]);

  // 구역 설정 팝업이 닫히면 드래그로 선택한 임시 영역/셀도 초기화
  useEffect(() => {
    if (!zoneAddOpen) {
      setZoneDraftRect(null);
      setZoneDraftCellIds([]);
    }
  }, [zoneAddOpen]);

  const currentBuilding = floorBuildings.find((b) => b.id === selectedBuildingId) ?? null;
  const currentFloor = currentBuilding?.floors.find((f) => f.id === selectedFloorId) ?? null;

  const handleFloorChange = (newId: string) => {
    setSelectedFloorId(newId);
    setSelectedItem(null);
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    void navigate(`/floorPlans/${selectedBuildingId}/${newId}`);
  };

  // 파일 선택 단계 — 실제 업로드는 다음 단계(가로/세로 입력)에서 함께 이뤄짐
  const handleFileSelected = (file: File) => {
    setPendingUpload({ file, previewUrl: URL.createObjectURL(file) });
    setUploadModalOpen(false);
  };

  const handleCloseUploadDimensionsModal = () => {
    if (pendingUpload) URL.revokeObjectURL(pendingUpload.previewUrl);
    setPendingUpload(null);
  };

  const handleUploadDimensionsConfirm = (params: {
    realWidth: number;
    realHeight: number;
    cellSizeMeter: number;
  }) => {
    if (!currentFloor || !pendingUpload || isReuploading) return;
    const { file, previewUrl } = pendingUpload;
    setIsReuploading(true);
    uploadFloor(
      selectedBuildingId,
      currentFloor.floorNum,
      file,
      params.realWidth,
      params.realHeight,
    )
      .then(async (newFloor) => {
        // 도면이 바뀌면 이전 도면 기준으로 만들어진 노드·엣지·장비·구역은 더 이상 유효하지 않으므로
        // 화면에서 먼저 비우고, AI 재분석이 끝나면 각 조회 effect가 새 데이터로 채운다
        resetFloorScopedState();
        // 초기 업로드 경로와 동일하게, AI 분석이 배율을 지우더라도 복원할 수 있도록 먼저 기록해둠
        rememberPendingGridSize(newFloor.id, params.cellSizeMeter);
        try {
          await setFloorGrid(newFloor.id, params.cellSizeMeter);
          setFloorGridCells(await getFloorGridCells(newFloor.id));
        } catch {
          show({
            title: '그리드 설정에 실패했습니다. 분석 완료 후 자동으로 다시 시도합니다.',
            variant: 'warning',
          });
        }
        setFloorBuildings((prev) =>
          prev.map((b) =>
            b.id !== selectedBuildingId
              ? b
              : { ...b, floors: b.floors.map((f) => (f.id !== currentFloor.id ? f : newFloor)) },
          ),
        );
        setFloor(newFloor);
        URL.revokeObjectURL(previewUrl);
        setPendingUpload(null);
        setIsReuploading(false);
        // 타임아웃은 '분석이 시작됐다'는 증거가 아니므로 성공으로 넘기지 않고 구분해서 안내한다
        analyzeFloor(newFloor.id).catch((error: unknown) => {
          const timedOut = isAxiosError(error) && error.code === 'ECONNABORTED';
          show({
            title: timedOut
              ? '분석 요청 응답이 지연되고 있습니다. 잠시 후 진행 상태를 확인해주세요.'
              : '도면 분석 요청에 실패했습니다. 다시 시도해주세요.',
            variant: 'warning',
          });
        });
      })
      .catch(() => {
        // 미리보기와 입력값을 유지해 모달을 닫지 않고 바로 재시도할 수 있게 함
        setIsReuploading(false);
        show({ title: '업로드에 실패했습니다. 다시 시도해주세요.', variant: 'error' });
      });
  };

  // 장치 배치 모드 — 정보 입력과 같은 단계에서 클릭으로 위치 지정. 다시 클릭하면 위치를 옮길 수 있음
  // (CCTV 시야 구역 드래그 단계에서는 클릭이 다른 용도이므로 위치를 덮어쓰지 않음)
  const handleMapClick = (x: number, y: number) => {
    if (!nodeAddOpen || nodeAddStage !== 'entry') return;
    setNodeStagedPosition({ x: (x / CANVAS_W) * 100, y: (y / canvasH) * 100 });
  };

  const handleAddedDeviceDelete = (id: string) => {
    setAddedDevices((prev) => prev.filter((d) => d.id !== id));
  };

  // 정보 입력 + 위치 지정을 마친 뒤 확정 — CCTV만 시야 구역 지정 단계로 넘어가고, 나머지는 바로 저장
  const finalizeNodePlacement = (
    type: PlacingDeviceType,
    deviceId: string,
    location: string,
    position: { x: number; y: number },
  ) => {
    const cfg = DEVICE_PLACE_CONFIG[type];

    if (isStructureNodeType(type)) {
      // 클릭해 지정한 위치 그대로 저장 (격자 스냅 없음). position은 0~100(%) 기준
      const ratioX = position.x / 100;
      const ratioY = position.y / 100;
      const x = ratioX * CANVAS_W;
      const y = ratioY * canvasH;
      if (currentFloor) {
        const apiType = STRUCTURE_NODE_API_TYPE[type];
        const count = structureNodes.filter((n) => n.type === type).length + 1;
        createMapNode(currentFloor.id, {
          code: `${apiType}-${Date.now()}`,
          type: apiType,
          name: `${cfg.label} ${count}`,
          x: ratioX,
          y: ratioY,
          isExitTarget: false,
        })
          .then((newNode) => {
            setStructureNodes((prev) => [
              ...prev,
              { id: newNode.id, type, x, y, isFinalExit: false },
            ]);
          })
          .catch((error: unknown) => {
            // 지금까지 문/계단/복도가 실패한 적이 없어서 안 드러났을 뿐, 실패해도 조용히
            // 무시되던 자리라 원인을 알 수 있게 서버 메시지를 그대로 보여줌
            const responseData = isAxiosError(error) ? error.response?.data : undefined;
            const body =
              responseData && typeof responseData === 'object'
                ? (responseData as { code?: unknown; message?: unknown })
                : undefined;
            const serverCode = error instanceof ApiError ? error.code : String(body?.code ?? '');
            const serverMessage =
              error instanceof ApiError ? error.message : String(body?.message ?? '');
            if (import.meta.env.DEV) {
              console.error(`[${cfg.label} 노드 추가 실패]`, serverCode, responseData ?? error);
            }
            show({
              title: serverMessage || `${cfg.label} 추가에 실패했습니다. 다시 시도해주세요.`,
              variant: 'error',
              duration: 8000,
            });
          });
      }
    } else if (type === 'light') {
      if (currentFloor) {
        const count = addedDevices.filter((d) => d.placeType === 'light').length + 1;
        const name = deviceId || `${cfg.label}-${String(count).padStart(2, '0')}`;
        createIoTLight({
          floorId: currentFloor.id,
          name,
          x: position.x / 100,
          y: position.y / 100,
        })
          .then((newLight) => {
            // 설정 모달·활성화 표시가 iotLights를 참조하므로 여기에도 반영해야 함
            setIotLights((prev) => [...prev, newLight]);
            setAddedDevices((prev) => [
              ...prev,
              {
                id: newLight.id,
                type: 'iot',
                placeType: 'light',
                label: newLight.name,
                x: position.x,
                y: position.y,
                status: 'online',
                zone: location || '사용자 등록',
              },
            ]);
          })
          .catch(() => {
            show({ title: '유도등 등록에 실패했습니다. 다시 시도해주세요.', variant: 'error' });
          });
      }
    }

    setNodeAddStage('entry');
    setNodeStagedPosition(null);
    setZoneDraftRect(null);
    setNodeAddOpen(false);
  };

  // 그리드가 필요한 두 진입점(CCTV 등록, 그리드 표시 토글)이 공유하는 확인 로직 —
  // 로컬 state가 비어있어도 실제로 없는 게 맞는지 서버에서 한 번 더 확인한 뒤에만 설정 팝업을 띄움
  const ensureFloorGridCells = (): Promise<FloorGridCell[]> => {
    if (floorGridCells.length > 0) return Promise.resolve(floorGridCells);
    if (!currentFloor) return Promise.resolve([]);
    return getFloorGridCells(currentFloor.id)
      .then((cells) => {
        setFloorGridCells(cells);
        return cells;
      })
      .catch(() => []);
  };

  const openGridSetupPrompt = (intent: 'toggle' | 'cctv' | 'zone' | 'fireOrigin') => {
    setGridSetupIntent(intent);
    // 업로드 때 정했던 값이 남아 있으면 다시 입력하지 않도록 채워둠
    const remembered = currentFloor
      ? (readStoredNumber(GRID_SIZE_KEY(currentFloor.id)) ??
        readStoredNumber(PENDING_GRID_SIZE_KEY(currentFloor.id)))
      : null;
    setGridSizeMeterInput(String(remembered ?? 1));
    setGridSetupPromptOpen(true);
  };

  // 입력 단계 제출 — CCTV는 서버가 배율(cellSizeMeter) 없이는 등록을 거부(CCTV006)하는데
  // 배율 조회 API가 없어서, 아는 값이 있으면 조용히 다시 적용하고 정말 모를 때만 사용자에게 묻는다.
  // (드래그를 다 끝낸 뒤에 실패하지 않도록 시야 선택 단계로 넘어가기 전에 처리)
  const handleSubmitNodeEntry = (type: PlacingDeviceType, deviceId: string, location: string) => {
    if (!nodeStagedPosition) return;
    if (type === 'cctv') {
      // ensureFloorGridCells 호출 전 상태를 기억해둠 — 이미 이번 세션에서 그리드를 확인했다면
      // (cells가 새로 조회된 게 아니라 기존 state) 배율을 다시 PUT할 필요가 없음
      const hadGridAlready = floorGridCells.length > 0;
      void ensureFloorGridCells().then((cells) => {
        const floorIdForGrid = currentFloor?.id;
        if (!floorIdForGrid || cells.length === 0) {
          setNodeAddStage('entry');
          openGridSetupPrompt('cctv');
          return;
        }
        if (hadGridAlready) {
          // 그리드가 이미 확인된 상태에서 무관한 CCTV를 하나 더 등록하는 경우 — 배율을 다시
          // 적용하면 셀이 재생성될 수 있어(다른 CCTV·구역의 cellIds가 무효화됨) 건드리지 않음
          setNodeAddStage('fov');
          return;
        }
        // 기억해둔 값 → 이미 등록된 CCTV가 쓰던 배율 순으로 되찾음
        const knownSize =
          readStoredNumber(GRID_SIZE_KEY(floorIdForGrid)) ??
          realCctvs.find((c) => c.floorId === floorIdForGrid && c.gridCellSizeMeter)
            ?.gridCellSizeMeter ??
          null;

        if (!knownSize) {
          setNodeAddStage('entry');
          openGridSetupPrompt('cctv');
          return;
        }

        // 배율을 알고 있으면 사용자를 막지 않고 조용히 재적용(PUT은 create-or-update라 안전).
        // 셀이 재생성될 수 있으므로 적용 후 셀을 다시 받아온 뒤에 시야 선택 단계로 넘어감
        setFloorGrid(floorIdForGrid, knownSize)
          .then(() => getFloorGridCells(floorIdForGrid))
          .then((refreshed) => {
            setFloorGridCells(refreshed);
            rememberGridSize(floorIdForGrid, knownSize);
            setNodeAddStage('fov');
          })
          .catch(() => {
            // 재적용이 실패하면 그때 사용자에게 물어봄
            setNodeAddStage('entry');
            openGridSetupPrompt('cctv');
          });
      });
      return;
    }
    finalizeNodePlacement(type, deviceId, location, nodeStagedPosition);
  };

  // 그리드설정/시야구역 단계에서 뒤로 — 입력 단계로 돌아가되 이미 지정한 위치는 유지
  const handleNodeAddBack = () => {
    setNodeAddStage('entry');
    setZoneDraftRect(null);
    setCctvDraftCellIds([]);
  };

  // 그리드 표시 토글
  const handleToggleGridOverlay = () => {
    if (showGridOverlay) {
      setShowGridOverlay(false);
      return;
    }
    ensureFloorGridCells().then((cells) => {
      if (cells.length > 0) {
        setShowGridOverlay(true);
        return;
      }
      openGridSetupPrompt('toggle');
    });
  };

  const handleGridSetupPromptCancel = () => {
    setGridSetupPromptOpen(false);
    if (gridSetupIntent === 'cctv') handleNodeAddBack();
    // 그리드가 없어서 발화점을 지정할 수 없는 상태이니, 모드 자체를 접음
    if (gridSetupIntent === 'fireOrigin') setFireOriginScenarioId(null);
    setGridSetupIntent(null);
  };

  const handleGridSetupPromptConfirm = () => {
    if (!currentFloor) return;
    const cellSizeMeter = Number(gridSizeMeterInput);
    if (!(cellSizeMeter > 0)) return;
    const floorIdForGrid = currentFloor.id;
    setFloorGrid(floorIdForGrid, cellSizeMeter)
      .then(() => getFloorGridCells(floorIdForGrid))
      .then((cells) => {
        setFloorGridCells(cells);
        rememberGridSize(floorIdForGrid, cellSizeMeter);
        setGridSetupPromptOpen(false);
        if (gridSetupIntent === 'cctv') {
          setNodeAddStage('fov');
        } else if (gridSetupIntent === 'zone') {
          setZoneAddOpen(true);
        } else if (gridSetupIntent === 'fireOrigin') {
          // 발화점 지정 모드는 fireOriginScenarioId로 이미 켜져 있어서 별도 처리 없이 셀 선택으로 넘어감
        } else {
          setShowGridOverlay(true);
        }
        setGridSetupIntent(null);
      })
      .catch((error: unknown) => {
        const msg = isAxiosError<{ message?: string }>(error)
          ? (error.response?.data?.message ?? '')
          : '';
        show({
          title: `그리드 설정에 실패했습니다${msg ? ` (${msg})` : ''}`,
          variant: 'error',
          duration: 8000,
        });
      });
  };

  // 그리드 셀 드래그/클릭 선택은 CCTV 등록·CCTV 시야구역 재선택·구역 추가 세 곳에서 공유하는데,
  // 그중 CCTV/구역 두 플로우는 임시 선택값을 각자 다른 state(cctvDraftCellIds/zoneDraftCellIds)에
  // 담아두고 있어서 "지금 어느 쪽이 활성 상태인지"만 여기서 한 번 정하고 아래에서 그대로 씀.
  // 발화점 지정은 다중 선택이 아니라 단일 셀만 고르므로 fireOriginDraftCellId를 배열로 감싸 재사용
  const activeDraftCellIds = fireOriginScenarioId
    ? fireOriginDraftCellId
      ? [fireOriginDraftCellId]
      : []
    : zoneAddOpen
      ? zoneDraftCellIds
      : cctvDraftCellIds;
  const setActiveDraftCellIds = zoneAddOpen ? setZoneDraftCellIds : setCctvDraftCellIds;

  const handleGridCellToggle = (cellId: string) => {
    if (fireOriginScenarioId) {
      // 발화점은 재등록 API가 없어 한 번 지정되면 다시 클릭해도 항상 실패(409)함 — 아예 선택되지 않게 막음
      if (existingFireOrigin) return;
      // 여러 칸을 모으는 다른 플로우와 달리, 클릭할 때마다 그 칸 하나로 선택을 바꿈(다시 누르면 해제)
      setFireOriginDraftCellId((prev) => (prev === cellId ? null : cellId));
      return;
    }
    setActiveDraftCellIds((prev) =>
      prev.includes(cellId) ? prev.filter((id) => id !== cellId) : [...prev, cellId],
    );
  };

  const handleCancelFireOrigin = () => {
    setFireOriginScenarioId(null);
    setFireOriginDraftCellId(null);
  };

  const handleConfirmFireOrigin = () => {
    if (!fireOriginScenarioId || !fireOriginDraftCellId) return;
    createFireOriginMutation.mutate(
      { scenarioId: fireOriginScenarioId, gridCellId: fireOriginDraftCellId },
      {
        onSuccess: () => {
          show({ title: '발화점이 지정되었습니다.', variant: 'success' });
          setFireOriginScenarioId(null);
          setFireOriginDraftCellId(null);
        },
        onError: (error: unknown) => {
          // HTTP 4xx는 AxiosError로, 200 + isSuccess:false는 ApiError로 올라오므로 둘 다 봄
          // (CCTV 등록 실패 처리와 같은 패턴) — 409라고 전부 "이미 등록됨"은 아니라서
          // 서버가 내려준 code/message를 그대로 확인해서 보여줌
          const responseData = isAxiosError(error) ? error.response?.data : undefined;
          const body =
            responseData && typeof responseData === 'object'
              ? (responseData as { code?: unknown; message?: unknown })
              : undefined;
          const serverCode = error instanceof ApiError ? error.code : String(body?.code ?? '');
          const serverMessage =
            error instanceof ApiError ? error.message : String(body?.message ?? '');
          if (import.meta.env.DEV) {
            console.error('[발화점 지정 실패]', serverCode, responseData ?? error);
          }
          show({
            title: serverMessage || '발화점 지정에 실패했습니다. 다시 시도해주세요.',
            variant: 'error',
            duration: 8000,
          });
        },
      },
    );
  };

  const handleFinalizeFov = (deviceId: string) => {
    // 조용히 return하지 않고 어디서 막혔는지 알려줌
    if (!nodeStagedPosition) {
      show({ title: '도면에서 카메라 위치를 먼저 지정해주세요.', variant: 'warning' });
      return;
    }
    if (!currentFloor) {
      show({
        title: '층 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.',
        variant: 'error',
      });
      return;
    }
    if (cctvDraftCellIds.length === 0) {
      show({ title: '도면을 드래그해서 감시 구역(칸)을 먼저 선택해주세요.', variant: 'warning' });
      return;
    }
    const count = addedDevices.filter((d) => d.type === 'cctv').length + 1;
    const label = deviceId || `CCTV-${String(count).padStart(2, '0')}`;
    // x,y는 0~1 정규화 값이어야 함 — 캔버스 경계 밖 클릭 등으로 살짝 벗어나는 경우 클램프
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    createCctv({
      floorId: currentFloor.id,
      name: label,
      x: clamp01(nodeStagedPosition.x / 100),
      y: clamp01(nodeStagedPosition.y / 100),
      gridCellIds: cctvDraftCellIds,
    })
      .then((newCctv) => {
        setRealCctvs((prev) => [...prev, newCctv]);
        setAddedDevices((prev) => [
          ...prev,
          {
            id: newCctv.id,
            type: 'cctv',
            placeType: 'cctv',
            label: newCctv.name,
            x: nodeStagedPosition.x,
            y: nodeStagedPosition.y,
            status: 'online',
            zone: `모니터링 ${newCctv.monitoredGridCellCount}칸 · ${newCctv.monitoredAreaM2}㎡`,
          },
        ]);
        setNodeAddStage('entry');
        setNodeStagedPosition(null);
        setZoneDraftRect(null);
        setCctvDraftCellIds([]);
        setNodeAddOpen(false);
      })
      .catch((error: unknown) => {
        // HTTP 4xx는 AxiosError로, 200 + isSuccess:false는 ApiError로 올라오므로 둘 다 본다
        const responseData = isAxiosError(error) ? error.response?.data : undefined;
        const body =
          responseData && typeof responseData === 'object'
            ? (responseData as { code?: unknown; message?: unknown })
            : undefined;
        const serverCode = error instanceof ApiError ? error.code : String(body?.code ?? '');
        const serverMessage =
          error instanceof ApiError ? error.message : String(body?.message ?? '');
        if (import.meta.env.DEV) {
          console.error('[CCTV 등록 실패]', serverCode, responseData ?? error);
        }
        // CCTV006 = 이 층에 그리드 배율(cellSizeMeter)이 설정 안 됨.
        // 아는 배율이 있으면 조용히 재적용해서 사용자는 다시 드래그만 하면 되게 하고,
        // 정말 모를 때만 설정 팝업을 띄운다. (배율 재적용 시 셀이 바뀌므로 선택은 초기화)
        if (serverCode === 'CCTV006' || /GridCell 크기|cellSizeMeter/i.test(serverMessage)) {
          setCctvDraftCellIds([]);
          const knownSize = readStoredNumber(GRID_SIZE_KEY(currentFloor.id));
          if (knownSize) {
            setFloorGrid(currentFloor.id, knownSize)
              .then(() => getFloorGridCells(currentFloor.id))
              .then((refreshed) => {
                setFloorGridCells(refreshed);
                show({
                  title: `그리드 배율(${knownSize}m)을 다시 적용했습니다. 감시 구역을 다시 드래그해주세요.`,
                  variant: 'warning',
                  duration: 7000,
                });
              })
              .catch(() => openGridSetupPrompt('cctv'));
            return;
          }
          openGridSetupPrompt('cctv');
          show({
            title:
              '이 층의 그리드 배율(m)을 먼저 설정해야 합니다. 설정 후 감시 구역을 다시 드래그해주세요.',
            variant: 'warning',
            duration: 7000,
          });
          return;
        }
        show({
          title: `CCTV 등록에 실패했습니다.${serverMessage ? ` (${serverMessage})` : ''}`,
          variant: 'error',
        });
      });
  };

  const handleZoneDragEnd = () => {
    const rect = zoneDraftRectRef.current;
    const cctvCellSelecting =
      (nodeAddOpen && nodeAddType === 'cctv' && nodeAddStage === 'fov') || !!editingCctvId;
    if (cctvCellSelecting || zoneAddOpen) {
      if (rect && rect.w > 0 && rect.h > 0) {
        // 새 드래그가 이전 선택을 대체함(여러 번 드래그해도 마지막 것만 유효). 미세 조정은 셀 클릭 토글로
        setActiveDraftCellIds(
          cellIdsIntersectingRect(floorGridCells, rect, gridCellPxSize, canvasH),
        );
      }
      setZoneDraftRect(null);
    }
  };

  // 최종 탈출구 지정은 문에서만 의미 있음 — 서버에도 저장(실패 시 롤백)
  const handleToggleFinalExit = (id: string) => {
    const node = structureNodes.find((n) => n.id === id);
    if (!node) return;
    const nextIsFinalExit = !node.isFinalExit;
    setStructureNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFinalExit: nextIsFinalExit } : n)),
    );
    updateMapNodePosition(id, {
      x: node.x / CANVAS_W,
      y: node.y / canvasH,
      isExitTarget: nextIsFinalExit,
    }).catch((error: unknown) => {
      setStructureNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isFinalExit: !nextIsFinalExit } : n)),
      );
      // 마지막 남은 탈출구는 해제할 수 없는 등 서버가 이유를 message로 내려주므로 그대로 보여줌
      const responseData = isAxiosError(error) ? error.response?.data : undefined;
      const body =
        responseData && typeof responseData === 'object'
          ? (responseData as { message?: unknown })
          : undefined;
      const serverMessage = error instanceof ApiError ? error.message : String(body?.message ?? '');
      show({
        title: serverMessage || '최종 탈출구 지정에 실패했습니다.',
        variant: 'error',
      });
    });
  };

  const isSameZoneRef = (a: ZoneRefSelection | null, b: ZoneRefSelection): boolean =>
    !!a && a.kind === b.kind && a.id === b.id;

  // 우측 패널 카드 클릭 — 이미 필터를 통과해 보이는 카드이므로 필터는 건드리지 않음
  const handleZoneRefSelect = (ref: ZoneRefSelection) => {
    setSelectedItem(null);
    setEditingItemId(null);
    setSelectedZoneRef((prev) => (isSameZoneRef(prev, ref) ? null : ref));
  };

  // 도면에서 항목을 클릭하면, 그 카드가 지금 필터에 가려져 있어도 우측 패널에 드러나서
  // 포커싱(스크롤)되도록 상위/하위 필터를 그 항목에 맞게 이동시킴
  const handleZoneRefSelectFromMap = (ref: ZoneRefSelection) => {
    handleZoneRefSelect(ref);
    if (ref.kind === 'zone') {
      setTopFilter((prev) => (prev === 'device' ? 'all' : prev));
      return;
    }
    setTopFilter((prev) => (prev === 'zone' ? 'all' : prev));
    // 문/계단 노드면 해당 하위 칩으로 이동, 그 외(방·복도 등)는 하위 필터 해제
    const structureType = structureNodes.find((n) => n.id === ref.id)?.type;
    setDeviceTypeFilter(
      structureType === 'door' || structureType === 'stair' ? structureType : null,
    );
  };

  // 드래그 중 미리보기용 — API 호출은 드래그가 끝났을 때(handleStructureNodeMoveEnd)만
  const handleStructureNodeMove = (id: string, x: number, y: number) => {
    setStructureNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const handleStructureNodeMoveEnd = (id: string, x: number, y: number) => {
    updateMapNodePosition(id, { x: x / CANVAS_W, y: y / canvasH }).catch(() => {});
  };

  const handleStructureNodeDelete = (id: string) => {
    deleteMapNode(id)
      .then(() => {
        setStructureNodes((prev) => prev.filter((n) => n.id !== id));
        setEditingStructureId((prev) => (prev === id ? null : prev));
      })
      .catch(() => {});
  };

  // 노드 id로 표시용 라벨 조회 (구조 노드 + 그 외 그래프 노드 통합)
  const getGraphNodeLabel = (id: string): string => {
    const structureNode = structureNodes.find((n) => n.id === id);
    if (structureNode) return STRUCTURE_NODE_LABEL[structureNode.type];
    const graphNode = graphNodes.find((n) => n.id === id);
    return graphNode?.name ?? id;
  };

  const handleEdgeNodeClick = (nodeId: string) => {
    if (!edgeDraftFromId) {
      setEdgeDraftFromId(nodeId);
      return;
    }
    if (nodeId === edgeDraftFromId) return;
    setEdgeDraftToId(nodeId);
  };

  const handleCancelEdgeDraft = () => {
    setEdgeDraftFromId(null);
    setEdgeDraftToId(null);
    setEdgeAddOpen(false);
  };

  const handleCreateEdge = (distance: number, bidirectional: boolean) => {
    if (!edgeDraftFromId || !edgeDraftToId) return;
    createMapEdge({
      fromNodeId: edgeDraftFromId,
      toNodeId: edgeDraftToId,
      distance,
      bidirectional,
    })
      .then((newEdge) => {
        setGraphEdges((prev) => [...prev, newEdge]);
      })
      .catch(() => {})
      .finally(() => {
        setEdgeDraftFromId(null);
        setEdgeDraftToId(null);
        setEdgeAddOpen(false);
      });
  };

  const handleEdgeDelete = (edgeId: string) => {
    deleteMapEdge(edgeId)
      .then(() => {
        setGraphEdges((prev) => prev.filter((e) => e.id !== edgeId));
        setSelectedEdgeId((prev) => (prev === edgeId ? null : prev));
      })
      .catch(() => {});
  };

  const handleStartEditStructure = (id: string) => {
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setEditingStructureId((prev) => (prev === id ? null : id));
  };

  const handleStartEditZone = (zone: ZoneEntry) => {
    setEditingZoneId(zone.id);
    setZoneEditLabel(zone.label);
  };

  // 이름 수정 API가 아직 없어서 로컬에만 반영됨 — 새로고침하면 원래 이름으로 돌아감
  const handleSaveZoneLabel = (id: string) => {
    const trimmed = zoneEditLabel.trim();
    if (trimmed) {
      setZones((prev) => prev.map((z) => (z.id === id ? { ...z, label: trimmed } : z)));
    }
    setEditingZoneId(null);
  };

  const handleAddZone = (label: string) => {
    if (!currentFloor || zoneDraftCellIds.length === 0) return;
    createUserZone(currentFloor.id, { name: label, cellIds: zoneDraftCellIds })
      .then((zone) => {
        setZones((prev) => [
          ...prev,
          { id: zone.id, type: 'general', label: zone.name, cellIds: zoneDraftCellIds },
        ]);
        setZoneAddOpen(false);
        setZoneDraftCellIds([]);
      })
      .catch(() => {
        show({ title: '구역 저장에 실패했습니다.', variant: 'error' });
      });
  };

  // 구역 추가 버튼 — 그리드가 있어야 셀을 선택할 수 있어서, 없으면 설정 팝업부터 띄움
  const handleToggleZoneAdd = () => {
    setNodeAddOpen(false);
    handleCancelFireOrigin();
    if (zoneAddOpen) {
      setZoneAddOpen(false);
      return;
    }
    ensureFloorGridCells().then((cells) => {
      if (cells.length > 0) {
        setZoneAddOpen(true);
        return;
      }
      openGridSetupPrompt('zone');
    });
  };

  // 다른 삭제(장비/POI)는 전부 확인 모달을 거치는데 구역만 클릭 즉시 삭제되고 있어서 맞춤
  const handleZoneDeleteRequest = (zone: ZoneEntry) => setZoneDeleteTarget(zone);
  const handleZoneDeleteCancel = () => setZoneDeleteTarget(null);

  const handleZoneDeleteConfirm = () => {
    if (!currentFloor || !zoneDeleteTarget || isDeletingZone) return;
    const id = zoneDeleteTarget.id;
    setIsDeletingZone(true);
    deleteUserZone(currentFloor.id, id)
      .then(() => {
        setZones((prev) => prev.filter((z) => z.id !== id));
        if (selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === id) {
          setSelectedZoneRef(null);
        }
        setZoneDeleteTarget(null);
      })
      .catch(() => {
        show({ title: '구역 삭제에 실패했습니다.', variant: 'error' });
      })
      .finally(() => setIsDeletingZone(false));
  };

  const isNodeSelected = (id: string) =>
    selectedZoneRef?.kind === 'node' && selectedZoneRef.id === id;
  const isZoneSelected = (id: string) =>
    selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === id;

  const renderStructureCard = (n: StructureNode) => {
    const sameTypeIndex = structureNodes
      .filter((x) => x.type === n.type)
      .findIndex((x) => x.id === n.id);
    const isEditing = editingStructureId === n.id;
    return (
      <div
        key={n.id}
        data-panel-id={n.id}
        className={clsx(styles.deviceCard, isNodeSelected(n.id) && styles.deviceCardSelected)}
        onClick={() => handleZoneRefSelect({ kind: 'node', id: n.id })}
      >
        <div className={styles.zoneCardHeader}>
          <span className={styles.zoneCardTitleGroup}>
            <span className={clsx(styles.zoneCardDot, ZONE_CARD_DOT_CLASS[n.type])} />
            <span className={styles.deviceCardName}>
              {STRUCTURE_NODE_LABEL[n.type]} {sameTypeIndex + 1}
            </span>
          </span>
          <span className={styles.zoneCardHeaderActions}>
            {(n.type === 'door' || n.type === 'stair') && (
              <button
                type="button"
                className={n.isFinalExit ? styles.finalExitBadge : styles.finalExitToggle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFinalExit(n.id);
                }}
              >
                {n.isFinalExit ? '최종 탈출구' : '탈출구로 지정'}
              </button>
            )}
            <button
              type="button"
              aria-label={isEditing ? '수정 완료' : '수정'}
              className={isEditing ? styles.zoneCardIconBtnDone : styles.zoneCardIconBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleStartEditStructure(n.id);
              }}
            >
              {isEditing ? (
                <CheckIcon width={14} height={14} />
              ) : (
                <EditIcon width={14} height={14} />
              )}
            </button>
            <button
              type="button"
              aria-label="삭제"
              className={styles.zoneCardIconBtnDelete}
              onClick={(e) => {
                e.stopPropagation();
                handleStructureNodeDelete(n.id);
              }}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </span>
        </div>
      </div>
    );
  };

  const renderZoneCard = (z: ZoneEntry) => {
    const isEditing = editingZoneId === z.id;
    return (
      <div
        key={z.id}
        data-panel-id={z.id}
        className={clsx(styles.deviceCard, isZoneSelected(z.id) && styles.deviceCardSelected)}
        onClick={() => handleZoneRefSelect({ kind: 'zone', id: z.id })}
      >
        <div className={styles.zoneCardHeader}>
          <span className={styles.zoneCardTitleGroup}>
            <span className={clsx(styles.zoneCardDot, styles.zoneCardDotGeneral)} />
            {isEditing ? (
              <input
                className={styles.deviceCardNameInput}
                value={zoneEditLabel}
                onChange={(e) => setZoneEditLabel(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={styles.deviceCardName}>{z.label}</span>
            )}
          </span>
          <span className={styles.zoneCardHeaderActions}>
            <button
              type="button"
              aria-label={isEditing ? '수정 완료' : '수정'}
              className={isEditing ? styles.zoneCardIconBtnDone : styles.zoneCardIconBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) {
                  handleSaveZoneLabel(z.id);
                } else {
                  handleStartEditZone(z);
                }
              }}
            >
              {isEditing ? (
                <CheckIcon width={14} height={14} />
              ) : (
                <EditIcon width={14} height={14} />
              )}
            </button>
            <button
              type="button"
              aria-label="삭제"
              className={styles.zoneCardIconBtnDelete}
              onClick={(e) => {
                e.stopPropagation();
                handleZoneDeleteRequest(z);
              }}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </span>
        </div>
      </div>
    );
  };

  // 드래그(mousemove)마다 재렌더되는 컴포넌트라, 매 렌더 O(n·m) 재계산을 피하려고 useMemo로 감쌈
  const allPanelItems: PanelItem[] = useMemo(
    () => [
      ...(floor?.devices ?? []).map((d) => ({
        id: d.id,
        kind: 'device' as const,
        type: deviceTypeToPlaceType(d.type),
        label: d.label,
        statusText: d.status === 'online' ? '실시간' : '오프라인',
        statusOnline: d.status === 'online',
        zone: d.zone,
        source: 'floor' as const,
      })),
      // 상태는 실제 CCTV/유도등의 enabled를 따라감 — 예전엔 '실시간'으로 고정돼 있어서
      // 사용 불가로 바꿔도 카드에 반영되지 않았음
      ...addedDevices.map((d) => {
        const enabled =
          realCctvs.find((c) => c.id === d.id)?.enabled ??
          iotLights.find((l) => l.id === d.id)?.enabled ??
          true;
        return {
          id: d.id,
          kind: 'device' as const,
          type: d.placeType,
          label: d.label,
          statusText: enabled ? '사용 가능' : '사용 불가능',
          statusOnline: enabled,
          zone: d.zone,
          source: 'added' as const,
        };
      }),
    ],
    [floor?.devices, addedDevices, realCctvs, iotLights],
  );

  const panelItems = useMemo(
    () => allPanelItems.filter((item) => !deviceTypeFilter || item.type === deviceTypeFilter),
    [allPanelItems, deviceTypeFilter],
  );

  const visibleStructureNodes = useMemo(
    () => structureNodes.filter((n) => !deviceTypeFilter || deviceTypeFilter === n.type),
    [structureNodes, deviceTypeFilter],
  );

  // 유도등 설정 모달의 판단 노드/엣지 드롭다운 목록
  const lightNodeOptions = useMemo(
    () => [
      ...structureNodes.map((n) => ({ id: n.id, label: STRUCTURE_NODE_LABEL[n.type] })),
      ...graphNodes.map((n) => ({ id: n.id, label: n.name })),
    ],
    [structureNodes, graphNodes],
  );
  const lightEdgeOptions = useMemo(
    () =>
      graphEdges.map((edge) => ({
        id: edge.id,
        label: `${getGraphNodeLabel(edge.fromNodeId)} → ${getGraphNodeLabel(edge.toNodeId)} (${edge.distance}m)`,
      })),
    // getGraphNodeLabel은 structureNodes/graphNodes를 참조하는 클로저라 그 둘을 대신 의존성으로 둠
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphEdges, structureNodes, graphNodes],
  );

  const gridCellPxSize = useMemo(
    () => getGridCellPxSize(floorGridCells, canvasH),
    [floorGridCells, canvasH],
  );

  // 이 시나리오의 발화점이 이미 지정되어 있고, 그게 지금 보고 있는 층이면 도면에 표시함
  const existingFireOriginCell =
    existingFireOrigin && currentFloor && existingFireOrigin.floorId === currentFloor.id
      ? (floorGridCells.find((c) => c.id === existingFireOrigin.gridCellId) ?? null)
      : null;

  const cctvGridCellsMode: 'hidden' | 'selecting' | 'viewing' | 'browsing' =
    (nodeAddOpen && nodeAddType === 'cctv' && nodeAddStage === 'fov') ||
    editingCctvId ||
    zoneAddOpen ||
    fireOriginScenarioId
      ? 'selecting'
      : selectedItem?.kind === 'device' && realCctvs.some((c) => c.id === selectedItem.data.id)
        ? 'viewing'
        : showGridOverlay
          ? 'browsing'
          : 'hidden';

  // 드래그 중에는 미리보기로 "겹치는 셀"을 실시간 표시 → 손을 떼면 그대로 확정됨
  const dragPreviewCellIds =
    cctvGridCellsMode === 'selecting' && zoneDraftRect && zoneDraftRect.w > 0 && zoneDraftRect.h > 0
      ? cellIdsIntersectingRect(floorGridCells, zoneDraftRect, gridCellPxSize, canvasH)
      : null;

  const selectedGridCellIds =
    cctvGridCellsMode === 'selecting'
      ? (dragPreviewCellIds ?? activeDraftCellIds)
      : cctvGridCellsMode === 'viewing' && selectedItem?.kind === 'device'
        ? (realCctvs.find((c) => c.id === selectedItem.data.id)?.gridCells.map((c) => c.id) ?? [])
        : [];

  const isPanelItemSelected = (item: PanelItem) => selectedItem?.data.id === item.id;

  const handlePanelItemSelect = (item: PanelItem) => {
    if (item.kind !== 'device') return;
    const isSame = selectedItem?.kind === 'device' && selectedItem.data.id === item.id;
    if (isSame) {
      setSelectedItem(null);
      setEditingItemId(null);
      return;
    }
    const data =
      item.source === 'floor'
        ? floor?.devices.find((d) => d.id === item.id)
        : addedDevices.find((d) => d.id === item.id);
    if (data) setSelectedItem({ kind: 'device', data });
    setSelectedZoneRef(null);
    if (editingItemId && editingItemId !== item.id) setEditingItemId(null);
  };

  const handleStartEdit = (item: PanelItem) => {
    if (item.kind !== 'device') return;
    if (selectedItem?.kind !== 'device' || selectedItem.data.id !== item.id) {
      handlePanelItemSelect(item);
    }
    setEditForm({ label: item.label, zone: item.zone });
    setEditingItemId(item.id);
  };

  const handleSaveEdit = (item: PanelItem) => {
    const newLabel = editForm.label;
    if (item.source === 'floor') {
      setFloor((prev) =>
        prev
          ? {
              ...prev,
              devices: prev.devices.map((d) =>
                d.id === item.id ? { ...d, label: newLabel, zone: editForm.zone } : d,
              ),
            }
          : prev,
      );
    } else if (item.source === 'added') {
      const prevDevice = addedDevices.find((d) => d.id === item.id);
      setAddedDevices((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, label: newLabel, zone: editForm.zone } : d)),
      );
      // 실패하면 방금 낙관적으로 바꾼 이름/구역을 원래대로 되돌림 — 안 그러면 저장 안 됐는데 화면엔 새 이름이 남음
      const rollback = () => {
        if (prevDevice)
          setAddedDevices((prev) => prev.map((d) => (d.id === item.id ? prevDevice : d)));
      };
      if (item.type === 'light' && prevDevice) {
        updateIoTLight(item.id, {
          name: newLabel,
          x: prevDevice.x / 100,
          y: prevDevice.y / 100,
        }).catch(() => {
          rollback();
          show({ title: '유도등 정보 수정에 실패했습니다.', variant: 'error' });
        });
      } else if (item.type === 'cctv' && prevDevice) {
        updateCctv(item.id, { name: newLabel, x: prevDevice.x / 100, y: prevDevice.y / 100 })
          .then((updated) => {
            setRealCctvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          })
          .catch(() => {
            rollback();
            show({ title: 'CCTV 정보 수정에 실패했습니다.', variant: 'error' });
          });
      }
    }
    if (selectedItem?.kind === 'device' && selectedItem.data.id === item.id) {
      setSelectedItem({
        kind: 'device',
        data: { ...selectedItem.data, label: newLabel, zone: editForm.zone },
      });
    }
    setEditingItemId(null);
  };

  const handlePanelItemDelete = (item: PanelItem) => {
    setDeleteConfirmTarget(item);
  };

  const handleDeleteConfirm = () => {
    const item = deleteConfirmTarget;
    if (!item || isDeletingItem) return;
    if (editingItemId === item.id) setEditingItemId(null);
    if (item.source === 'added') {
      if (item.type === 'light') {
        // 서버에서 이 유도등이 붙어있던 노드·엣지까지 cascade로 함께 삭제됨
        setIsDeletingItem(true);
        deleteIoTLight(item.id)
          .then(() => {
            handleAddedDeviceDelete(item.id);
            setIotLights((prev) => prev.filter((l) => l.id !== item.id));
            setDeleteConfirmTarget(null);
          })
          .catch(() => {
            show({ title: '유도등 삭제에 실패했습니다.', variant: 'error' });
          })
          .finally(() => setIsDeletingItem(false));
        return;
      }
      handleAddedDeviceDelete(item.id);
      setDeleteConfirmTarget(null);
      return;
    }
    setFloor((prev) =>
      prev ? { ...prev, devices: prev.devices.filter((d) => d.id !== item.id) } : prev,
    );
    if (selectedItem?.kind === 'device' && selectedItem.data.id === item.id) {
      setSelectedItem(null);
    }
    setDeleteConfirmTarget(null);
  };

  return (
    <>
      <div className={styles.layout}>
        {/* ── 좌측 사이드바 ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner} style={{ padding: '2rem 2rem 2.4rem' }}>
            {/* 층 목록 */}
            <div className={styles.floorNavCard}>
              <div className={styles.floorNavHeader}>층 목록</div>
              <div className={styles.floorNavList}>
                {[...(currentBuilding?.floors ?? [])]
                  .sort((a, b) => b.floorNum - a.floorNum)
                  .map((f) => {
                    const isCurrent = f.id === selectedFloorId;
                    const isNone = !hasFloorPlan(f);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        className={clsx(
                          styles.floorNavItem,
                          isCurrent && styles.floorNavItemActive,
                        )}
                        onClick={() => handleFloorChange(f.id)}
                      >
                        <span>{formatFloor(f.floorNum)}</span>
                        {isNone && <StatusBadge label="미등록" color="neutral" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </aside>

        {/* ── 중앙 캔버스 ── */}
        <div className={styles.canvasArea}>
          {/* 모드 안내 토스트 */}
          {toastMsg && (
            <div className={clsx(styles.toast, toastFading && styles.toastFading)}>{toastMsg}</div>
          )}

          {currentFloor && (
            <div className={styles.canvasHeader}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate('/floorPlans')}
                aria-label="도면 관리 목록으로"
              >
                <ChevronRightIcon width={16} height={16} className={styles.backButtonIcon} />
              </button>
              <span className={styles.canvasHeaderText}>{currentBuilding?.name ?? ''}</span>
              <span className={styles.canvasHeaderFloor}>{formatFloor(currentFloor.floorNum)}</span>
            </div>
          )}

          <div
            className={clsx(
              styles.canvasBody,
              currentFloor?.segmentationStatus === 'DONE' && styles.canvasBodyWithActions,
            )}
          >
            {/* 장비 추가 / 구역 추가 */}
            {currentFloor?.segmentationStatus === 'DONE' && (
              <div className={styles.canvasActionFloat}>
                <button
                  type="button"
                  className={clsx(
                    styles.canvasActionButton,
                    showGridOverlay && styles.canvasActionButtonActive,
                  )}
                  aria-pressed={showGridOverlay}
                  onClick={handleToggleGridOverlay}
                >
                  {showGridOverlay ? (
                    <EyeOffIcon width={14} height={14} />
                  ) : (
                    <EyeIcon width={14} height={14} />
                  )}
                  그리드 표시
                </button>
                <button
                  type="button"
                  className={styles.canvasActionButton}
                  onClick={() => {
                    setZoneAddOpen(false);
                    handleCancelFireOrigin();
                    setNodeAddOpen((v) => !v);
                  }}
                >
                  <PlusIcon width={14} height={14} />
                  노드 추가
                </button>
                <button
                  type="button"
                  className={styles.canvasActionButton}
                  onClick={handleToggleZoneAdd}
                >
                  <PlusIcon width={14} height={14} />
                  구역 추가
                </button>
                <button
                  type="button"
                  className={styles.canvasActionButton}
                  onClick={() => {
                    setNodeAddOpen(false);
                    setZoneAddOpen(false);
                    handleCancelFireOrigin();
                    setSelectedEdgeId(null);
                    setEdgeAddOpen((v) => {
                      if (v) {
                        setEdgeDraftFromId(null);
                        setEdgeDraftToId(null);
                      }
                      return !v;
                    });
                  }}
                >
                  <PlusIcon width={14} height={14} />
                  엣지 연결
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.canvasActionButton,
                    fireOriginScenarioId && styles.canvasActionButtonActive,
                  )}
                  aria-pressed={Boolean(fireOriginScenarioId)}
                  onClick={() => {
                    // 다른 배치 모드와 동시에 켜지면 그리드 클릭 결과가 어느 쪽으로 가는지
                    // 헷갈리므로, 발화점 지정을 시작할 때 나머지 모드는 먼저 정리함
                    setNodeAddOpen(false);
                    setZoneAddOpen(false);
                    setEdgeAddOpen(false);
                    setEditingCctvId(null);
                    setEditingStructureId(null);
                    setFireOriginModalOpen(true);
                  }}
                >
                  <PlusIcon width={14} height={14} />
                  발화점 지정
                </button>
              </div>
            )}

            {gridSetupPromptOpen && (
              <div className={styles.gridSetupPopup} onClick={(e) => e.stopPropagation()}>
                <span className={styles.nodeAddTitle}>그리드 설정 필요</span>
                <span className={styles.nodeAddHint}>
                  이 층에는 아직 그리드가 없어요. 셀 크기를 정하고 설정해주세요.
                </span>
                <div className={styles.nodeAddField}>
                  <div className={styles.gridSizeLabelRow}>
                    <span className={styles.nodeAddLabel}>셀 크기</span>
                    <span className={styles.gridSizeValue}>
                      {Number(gridSizeMeterInput || 1).toFixed(1)}m
                    </span>
                  </div>
                  <input
                    type="range"
                    className={styles.gridSizeSlider}
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={Number(gridSizeMeterInput || 1)}
                    onChange={(e) => setGridSizeMeterInput(e.target.value)}
                  />
                </div>
                <div className={styles.nodeAddActions}>
                  <button
                    type="button"
                    className={styles.nodeAddCancelBtn}
                    onClick={handleGridSetupPromptCancel}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className={styles.nodeAddSubmitBtn}
                    disabled={!(Number(gridSizeMeterInput) > 0)}
                    onClick={handleGridSetupPromptConfirm}
                  >
                    설정
                  </button>
                </div>
              </div>
            )}

            {fireOriginScenarioId && !gridSetupPromptOpen && (
              <div className={styles.fireOriginPopup} onClick={(e) => e.stopPropagation()}>
                <span className={styles.nodeAddTitle}>발화점 지정</span>
                <span className={styles.nodeAddHint}>
                  {existingFireOriginQuery.isLoading
                    ? '발화점 정보를 확인하는 중...'
                    : existingFireOrigin
                      ? existingFireOriginCell
                        ? '빨간 원이 이미 지정된 발화점이에요. 발화점은 한 번 지정하면 변경할 수 없어요.'
                        : '이 시나리오는 다른 층에 발화점이 이미 지정되어 있어요. 발화점은 한 번 지정하면 변경할 수 없어요.'
                      : fireOriginDraftCellId
                        ? '선택한 칸을 이 시나리오의 최초 발화점으로 지정합니다.'
                        : '도면에서 발화점으로 지정할 칸을 클릭해주세요.'}
                </span>
                <div className={styles.nodeAddActions}>
                  <button
                    type="button"
                    className={styles.nodeAddCancelBtn}
                    onClick={handleCancelFireOrigin}
                  >
                    {existingFireOrigin ? '닫기' : '취소'}
                  </button>
                  {!existingFireOrigin && (
                    <button
                      type="button"
                      className={styles.nodeAddSubmitBtn}
                      disabled={!fireOriginDraftCellId || createFireOriginMutation.isPending}
                      onClick={handleConfirmFireOrigin}
                    >
                      {createFireOriginMutation.isPending ? '지정 중...' : '지정'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {edgeAddOpen && edgeDraftFromId && !edgeDraftToId && (
              <div
                style={{
                  position: 'absolute',
                  top: '0.8rem',
                  left: '0.8rem',
                  zIndex: 5,
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.6rem',
                  padding: '0.6rem 1rem',
                  fontSize: '1.2rem',
                  color: '#374151',
                }}
              >
                연결할 두 번째 노드를 클릭해주세요
              </div>
            )}

            {edgeAddOpen && edgeDraftFromId && edgeDraftToId && (
              <EdgeAddPopup
                containerRef={edgePopupRef}
                fromLabel={getGraphNodeLabel(edgeDraftFromId)}
                toLabel={getGraphNodeLabel(edgeDraftToId)}
                onCancel={handleCancelEdgeDraft}
                onSave={handleCreateEdge}
              />
            )}

            {editingCctvId && (
              <div
                style={{
                  position: 'absolute',
                  top: '0.8rem',
                  left: '0.8rem',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.6rem',
                  padding: '0.6rem 1rem',
                  fontSize: '1.2rem',
                  color: '#374151',
                }}
              >
                <span>감시 영역 편집 중 · {cctvDraftCellIds.length}칸 선택됨</span>
                <button
                  type="button"
                  className={styles.nodeAddCancelBtn}
                  onClick={handleCancelEditCctvCells}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.nodeAddSubmitBtn}
                  disabled={cctvDraftCellIds.length === 0}
                  onClick={handleSaveEditCctvCells}
                >
                  저장
                </button>
              </div>
            )}

            {nodeAddOpen && !gridSetupPromptOpen && (
              <NodeAddPopup
                containerRef={nodePopupRef}
                type={nodeAddType}
                onTypeChange={setNodeAddType}
                stage={nodeAddStage}
                hasPosition={!!nodeStagedPosition}
                selectedCellCount={cctvDraftCellIds.length}
                hasStartNode={structureNodes.some((n) => n.type === 'start')}
                onCancel={() => setNodeAddOpen(false)}
                onBack={handleNodeAddBack}
                onSubmitEntry={handleSubmitNodeEntry}
                onFinalize={handleFinalizeFov}
              />
            )}

            {zoneAddOpen && (
              <ZoneAddPopup
                containerRef={zonePopupRef}
                selectedCellCount={zoneDraftCellIds.length}
                onCancel={() => setZoneAddOpen(false)}
                onSave={handleAddZone}
              />
            )}

            {loadingFloor ? (
              <LoadingState message="도면을 불러오는 중..." />
            ) : currentFloor ? (
              <FloorCanvas
                mapWrapRef={mapWrapRef}
                floor={floor ?? currentFloor}
                resolvedImageUrl={resolvedMapImageUrl}
                canvasH={canvasH}
                selected={selectedItem}
                zoom={zoom}
                editingItemId={editingItemId}
                placingActive={nodeAddOpen}
                zoneAddActive={
                  zoneAddOpen ||
                  (nodeAddType === 'cctv' && nodeAddStage === 'fov') ||
                  !!editingCctvId
                }
                zoneDraftRect={zoneDraftRect}
                onZoneDraftChange={setZoneDraftRect}
                onZoneDragEnd={handleZoneDragEnd}
                savedZones={zones}
                structureNodes={structureNodes}
                editingStructureId={editingStructureId}
                onStructureNodeMove={handleStructureNodeMove}
                onStructureNodeMoveEnd={handleStructureNodeMoveEnd}
                graphNodes={graphNodes}
                graphEdges={graphEdges}
                edgeAddActive={edgeAddOpen}
                onNodeClickForEdge={handleEdgeNodeClick}
                selectedEdgeId={selectedEdgeId}
                onEdgeSelect={setSelectedEdgeId}
                onEdgeDelete={handleEdgeDelete}
                selectedZoneRef={selectedZoneRef}
                onZoneRefSelect={handleZoneRefSelectFromMap}
                cctvGridCellsMode={cctvGridCellsMode}
                floorGridCells={floorGridCells}
                selectedGridCellIds={selectedGridCellIds}
                gridCellPxSize={gridCellPxSize}
                onGridCellToggle={handleGridCellToggle}
                stagedCameraPosition={nodeStagedPosition}
                existingFireOriginPosition={
                  existingFireOriginCell
                    ? {
                        x: existingFireOriginCell.centerX * 100,
                        y: existingFireOriginCell.centerY * 100,
                      }
                    : null
                }
                onSelectDevice={(d) => {
                  const isSame = selectedItem?.kind === 'device' && selectedItem.data.id === d.id;
                  setSelectedItem(isSame ? null : { kind: 'device', data: d });
                  setSelectedZoneRef(null);
                  // 지금 하위 필터에 가려져 있어도 이 장비 카드가 패널에 드러나도록 그 종류로 이동
                  setTopFilter((prev) => (prev === 'zone' ? 'all' : prev));
                  setDeviceTypeFilter(deviceTypeToFilterChip(d.type));
                }}
                onMapClick={handleMapClick}
                onBackgroundClick={() => {
                  setSelectedItem(null);
                  setSelectedZoneRef(null);
                }}
                devicePositions={devicePositions}
                onDeviceMoved={handleDeviceMoved}
                onDeviceMoveEnd={handleDeviceMoveEnd}
                addedDevices={addedDevices}
                onUpload={() => setUploadModalOpen(true)}
              />
            ) : (
              <div className={styles.canvasPlaceholder}>
                <span className={styles.canvasPlaceholderTitle}>층 정보를 찾을 수 없습니다</span>
              </div>
            )}
          </div>

          {currentFloor?.segmentationStatus === 'DONE' && (
            <div className={styles.nodeTypeLegend}>
              <div className={styles.nodeTypeLegendSection}>
                <span className={styles.zoneLegendTitle}>노드 종류</span>
                <div className={styles.zoneLegendItem}>
                  <span className={styles.nodeTypeCctvBadge}>CC</span>
                  <span className={styles.zoneLegendLabel}>CCTV</span>
                </div>
                <div className={styles.zoneLegendItem}>
                  <span className={clsx(styles.nodeTypeDot, styles.nodeTypeDotIot)} />
                  <span className={styles.zoneLegendLabel}>IoT</span>
                </div>
                <div className={styles.zoneLegendItem}>
                  <span className={clsx(styles.nodeTypeDot, styles.nodeTypeDotLight)} />
                  <span className={styles.zoneLegendLabel}>유도등</span>
                </div>
                <div className={styles.zoneLegendItem}>
                  <span className={clsx(styles.nodeTypeDot, styles.nodeTypeDotDoor)} />
                  <span className={styles.zoneLegendLabel}>문 · 출입구</span>
                </div>
                <div className={styles.zoneLegendItem}>
                  <span className={clsx(styles.nodeTypeDot, styles.nodeTypeDotStair)} />
                  <span className={styles.zoneLegendLabel}>계단</span>
                </div>
              </div>

              <div className={styles.nodeTypeLegendDivider} />

              <div className={styles.nodeTypeLegendSection}>
                <span className={styles.zoneLegendTitle}>구역 종류</span>
                <div className={styles.zoneLegendItem}>
                  <span
                    className={clsx(styles.nodeTypeAreaSwatch, styles.nodeTypeAreaSwatchGeneral)}
                  />
                  <span className={styles.zoneLegendLabel}>일반 구역</span>
                </div>
                <div className={styles.zoneLegendItem}>
                  <span
                    className={clsx(styles.nodeTypeAreaSwatch, styles.nodeTypeAreaSwatchCamera)}
                  />
                  <span className={styles.zoneLegendLabel}>카메라 시야</span>
                </div>
              </div>
            </div>
          )}

          {/* 플로팅 줌 컨트롤 */}
          <div className={styles.canvasZoomFloat}>
            <button
              type="button"
              className={styles.zoomButton}
              onClick={() => setZoom((v) => Math.max(50, v - 10))}
              disabled={zoom <= 50}
            >
              −
            </button>
            <button
              type="button"
              className={zoom !== 100 ? styles.zoomValueClickable : styles.zoomValue}
              onClick={() => setZoom(100)}
              title={zoom !== 100 ? '클릭해서 100% 리셋' : undefined}
            >
              {zoom}%
            </button>
            <button
              type="button"
              className={styles.zoomButton}
              onClick={() => setZoom((v) => Math.min(200, v + 10))}
              disabled={zoom >= 200}
            >
              +
            </button>
          </div>
        </div>

        {/* ── 우측 장비 목록 패널 ── */}
        <aside ref={devicePanelRef} className={styles.devicePanel}>
          <div className={styles.devicePanelInner}>
            <div className={styles.devicePanelSticky}>
              <div className={styles.filterTabs}>
                {(
                  [
                    { key: 'all', label: '전체' },
                    { key: 'device', label: '노드' },
                    { key: 'zone', label: '구역' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={clsx(styles.filterTab, topFilter === key && styles.filterTabActive)}
                    onClick={() => setTopFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {topFilter === 'device' && (
                <div className={styles.subFilterChips}>
                  {(
                    [
                      { key: 'cctv', label: 'CCTV' },
                      { key: 'light', label: '유도등' },
                      { key: 'door', label: '문 · 출입구' },
                      { key: 'stair', label: '계단' },
                      { key: 'hallway', label: '복도' },
                      { key: 'start', label: '시작 노드' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      className={clsx(
                        styles.subFilterChip,
                        deviceTypeFilter === key && styles.subFilterChipActive,
                      )}
                      onClick={() => setDeviceTypeFilter((prev) => (prev === key ? null : key))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.devicePanelList}>
              {topFilter !== 'zone' && (
                <>
                  {visibleStructureNodes.map((n) => renderStructureCard(n))}

                  {panelItems.map((item) => (
                    <DeviceCard
                      key={item.id}
                      item={item}
                      selected={isPanelItemSelected(item)}
                      editing={editingItemId === item.id}
                      editForm={editForm}
                      onEditFormChange={setEditForm}
                      onSelect={handlePanelItemSelect}
                      onStartEdit={handleStartEdit}
                      onSaveEdit={handleSaveEdit}
                      onDelete={handlePanelItemDelete}
                      onOpenSettings={handleOpenDeviceSettings}
                    />
                  ))}

                  {panelItems.length === 0 &&
                    visibleStructureNodes.length === 0 &&
                    topFilter === 'device' && (
                      <p className={styles.devicePanelEmpty}>표시할 노드가 없습니다</p>
                    )}
                </>
              )}

              {topFilter !== 'device' &&
                zones.filter((z) => z.type === 'general').map((z) => renderZoneCard(z))}
            </div>
          </div>
        </aside>
      </div>

      <FloorUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        buildingName={currentBuilding?.name ?? ''}
        floorNum={currentFloor?.floorNum ?? 0}
        onConfirm={handleFileSelected}
      />

      {pendingUpload && (
        <GridAreaSettingModal
          open
          onClose={handleCloseUploadDimensionsModal}
          mapImageUrl={pendingUpload.previewUrl}
          onConfirm={handleUploadDimensionsConfirm}
          isSubmitting={isReuploading}
        />
      )}

      {deleteConfirmTarget && (
        <EquipmentDeleteConfirmModal
          open
          onClose={() => setDeleteConfirmTarget(null)}
          label={deleteConfirmTarget.label}
          onConfirm={handleDeleteConfirm}
          isSubmitting={isDeletingItem}
        />
      )}

      {zoneDeleteTarget && (
        <EquipmentDeleteConfirmModal
          open
          onClose={handleZoneDeleteCancel}
          label={zoneDeleteTarget.label}
          onConfirm={handleZoneDeleteConfirm}
          isSubmitting={isDeletingZone}
        />
      )}

      {lightSettingsTarget && (
        <IoTLightSettingsModal
          open
          onClose={() => setLightSettingsTarget(null)}
          light={lightSettingsTarget}
          nodeOptions={lightNodeOptions}
          edgeOptions={lightEdgeOptions}
          onToggleEnabled={handleLightToggleEnabled}
          onDirectionChange={handleLightDirectionChange}
          onGuidanceSave={handleLightGuidanceSave}
          onPiEndpointSave={handleLightPiEndpointSave}
        />
      )}

      {cctvSettingsTarget && (
        <CctvSettingsModal
          open
          onClose={() => setCctvSettingsTarget(null)}
          cctv={cctvSettingsTarget}
          isSaving={isSavingCctv}
          onSaveName={handleCctvSaveName}
          onToggleEnabled={handleCctvToggleEnabled}
          onEditCells={handleStartEditCctvCells}
        />
      )}

      {buildingId && (
        <FireOriginScenarioModal
          open={fireOriginModalOpen}
          onClose={() => setFireOriginModalOpen(false)}
          buildingId={buildingId}
          onSelect={(scenarioId) => {
            setFireOriginModalOpen(false);
            // CCTV 등록과 같은 이유로 그리드가 있어야 셀을 지정할 수 있음 — 없으면 먼저 만들게 함
            void ensureFloorGridCells().then((cells) => {
              setFireOriginScenarioId(scenarioId);
              if (cells.length === 0) openGridSetupPrompt('fireOrigin');
            });
          }}
        />
      )}
    </>
  );
};

export default FloorPlansDetailPage;
