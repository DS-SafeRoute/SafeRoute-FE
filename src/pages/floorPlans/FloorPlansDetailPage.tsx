import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import { extractApiError } from '@apis/errors/apiError';
import { floorQueryKeys } from '@apis/floors/floorQueries';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import CheckIcon from '@assets/icons/ic-check.svg?react';
import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';
import EditIcon from '@assets/icons/ic-edit.svg?react';
import InfoIcon from '@assets/icons/ic-info.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';
import XIcon from '@assets/icons/ic-x.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import Dropdown from '@components/dropdown';
import LoadingState from '@components/loadingState';
import useToast from '@components/toast/useToast';

import { formatFloor, hasFloorPlan } from '@utils/floor';
import {
  CANVAS_W,
  buildZoneOutlinePath,
  getGridCellPxSize,
  getGridDimensions,
} from '@utils/floorCanvas';
import { formatAreaM2 } from '@utils/format';

import {
  configureCctvGridCells,
  createCctv,
  deleteCctv,
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
  assignLightCctv,
  configureLightGuidance,
  createIoTLight,
  deleteIoTLight,
  disableIoTLight,
  enableIoTLight,
  getFloorLights,
  updateIoTLight,
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
import ReadinessChecklist from './components/ReadinessChecklist';
import { DEVICE_COLOR } from './constants/deviceColors';
import * as styles from './FloorPlansDetailPage.css';
import EquipmentDeleteConfirmModal from './modals/EquipmentDeleteConfirmModal';
import FloorUploadModal from './modals/FloorUploadModal';
import GridAreaSettingModal from './modals/GridAreaSettingModal';
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
  // CCTV 카드에서 감시 영역 현황을 바로 보여주기 위한 값 — CCTV가 아니면 없음
  monitoredArea?: { cellCount: number; areaM2: number };
  // 서버가 자동 채번하는 장치 코드(예: CCTV_001) — id(내부 UUID)와 다른, 사람이 보는 식별자.
  // 수정 API로도 바꿀 수 없는 값이라 CCTV가 아니면 없음
  code?: string;
  // 유도등 카드의 가이던스 현황 표시용 — 유도등이 아니면 없음
  guidanceConfigured?: boolean;
  // 유도등 카드에서 담당 CCTV를 바로 보여주기 위한 값 — 유도등이 아니거나 미배정이면 없음
  cctvName?: string;
};

// 장비 카드의 "수정" 편집 폼 — CCTV는 label만 쓰고, 유도등은 설정 모달에 있던
// 가이던스·담당 CCTV까지 전부 이 폼으로 흡수함(모달 없이 카드 안에서 편집). Pi 엔드포인트는
// 스웨거상 "참고용 메타데이터일 뿐 실제 명령 전달 경로에는 안 쓰인다"고 명시되어 있어 뺐음.
// "설치 위치"(zone)는 백엔드에 저장 필드가 없어(요청 스키마에 name/x/y뿐) 텍스트로 입력받아도
// 저장 API로 안 나가고 새로고침하면 사라지는 값이었음 — 편집 항목에서 아예 빼고, 카드엔 실제
// 좌표(formatInstallLocation)를 읽기 전용으로 보여줌(CCTV는 감시영역 문구를 그대로 씀)
interface DeviceEditForm {
  label: string;
  decisionNodeId: string;
  leftEdgeId: string;
  rightEdgeId: string;
  cctvId: string;
}

const EMPTY_DEVICE_EDIT_FORM: DeviceEditForm = {
  label: '',
  decisionNodeId: '',
  leftEdgeId: '',
  rightEdgeId: '',
  cctvId: '',
};

// 유도등 추가 팝업에서 같이 받는 담당 CCTV·가이던스 값 — DeviceEditForm과 필드 구성은 같지만
// label이 없고(장치 ID 입력이 대신함) 전부 빈 문자열이면 "아직 안 정함"으로 취급해 생략 가능함
type LightAddFields = {
  cctvId: string;
  decisionNodeId: string;
  leftEdgeId: string;
  rightEdgeId: string;
};

// CCTV 등록·시야 재선택·수정 세 곳에서 카드에 보여줄 "모니터링 N칸 · M㎡" 문구를 각자 다시
// 조립하면 한 줄이 100자를 넘기기 쉽고 표현도 어긋나기 쉬워 하나로 합침
const formatMonitoredZone = (cctv: Pick<Cctv, 'monitoredGridCellCount' | 'monitoredAreaM2'>) =>
  `모니터링 ${cctv.monitoredGridCellCount}칸 · ${formatAreaM2(cctv.monitoredAreaM2)}㎡`;

// "설치 위치" 카드 행 — CCTV는 감시 영역에서 계산한 실제 값(zone)이 있지만, 유도등은 그런
// 백엔드 필드가 없어(등록 팝업의 "설치 위치" 입력은 저장 API로 나가지 않음) 새로고침하면
// 사라지고 고정 문구로 되돌아가던 값이었음 — 대신 이미 갖고 있는 실제 좌표를 보여줘서
// 최소한 의미 있는 값이 뜨게 함
const formatInstallLocation = (type: PanelItem['type'], x: number, y: number, zone: string) =>
  type === 'cctv' ? zone : `X ${Math.round(x)}% · Y ${Math.round(y)}%`;

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
// 시작 후보(START) 노드 생성은 이 화면(도면편집) 몫이 맞음 — 스웨거 재확인 결과 START는
// "특정 시나리오에 귀속되지 않는, 층 단위로 등록해두는 훈련 시작점 후보"라 도면을 다루는
// 이 화면에서 다른 구조 노드(문/계단/복도)와 똑같이 만든다. 실제 훈련 시작점 선택은
// 시나리오 설정 화면에서 발화점 셀과 함께 확정한다.
type PlacingDeviceType = 'cctv' | 'light' | 'door' | 'stair' | 'hallway' | 'start';
type PlacingEquipmentType = Exclude<PlacingDeviceType, 'door' | 'stair' | 'hallway' | 'start'>;

const DEVICE_PLACE_CONFIG: Record<PlacingDeviceType, { label: string; color: string }> = {
  cctv: { label: 'CCTV', color: DEVICE_COLOR.cctv },
  light: { label: '유도등', color: DEVICE_COLOR.light },
  door: { label: '문 · 출입구', color: DEVICE_COLOR.door },
  stair: { label: '계단', color: DEVICE_COLOR.stair },
  hallway: { label: '복도', color: DEVICE_COLOR.hallway },
  // "시작 노드"가 아니라 "시작 후보"로 부름 — 실제 훈련 시작점 확정은 시나리오설정에서 함
  start: { label: '시작 후보', color: DEVICE_COLOR.start },
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
   isFinalExit은 계단에서만 의미 있음(문/출입구는 층 사이를 잇는 탈출 경로가 아니라 최종
   탈출구로 지정할 수 없음. 복도·시작 후보도 항상 false — 시작 후보는 서버가
   isExitTarget=false로 강제 저장함). 시작 후보(START)는 스웨거 재확인 결과 이 화면(도면편집)
   에서 만드는 게 맞는 걸로 정정함 — 층 단위로 등록해두는 후보일 뿐, 실제 "이 시나리오의
   시작점" 확정은 시나리오 설정에서 발화점 셀과 함께 처리함) */
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
  start: '시작 후보',
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
  // 최종 탈출구로 지정하면 서버 노드 타입이 EXIT로 올라옴 — 편집기에선 계속 계단 카드로 다뤄
  // '최종 탈출구' 배지·해제 토글이 유지되게 함(해제 시 STAIR로 복원)
  EXIT: 'stair',
};

const STRUCTURE_NODE_COLOR: Record<StructureNodeType, string> = {
  door: DEVICE_COLOR.door,
  stair: DEVICE_COLOR.stair,
  hallway: DEVICE_COLOR.hallway,
  start: DEVICE_COLOR.start,
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

// 두 노드 사이에 이미 엣지가 있는지 확인 — 방향은 상관없음(A-B가 있으면 B-A도 같은 구간으로 봄).
// 체인으로 여러 경로를 잇다 보면 이전에 만든 경로와 구간이 겹칠 수 있는데, 그 구간만 생성에서
// 자동으로 제외하기 위해 캔버스 미리보기와 검토 화면 양쪽에서 이 함수를 같이 씀
const hasExistingEdge = (edges: MapEdge[], fromId: string, toId: string): boolean =>
  edges.some(
    (e) =>
      (e.fromNodeId === fromId && e.toNodeId === toId) ||
      (e.fromNodeId === toId && e.toNodeId === fromId),
  );

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

// 그리드 좌표계 기준값·순수 계산 함수는 shared/utils/floorCanvas에서 관리한다.
// 시나리오 설정 캔버스도 같은 계산을 사용해 셀 경계가 어긋나지 않게 한다.
const DEFAULT_CANVAS_H = 420;

// AI 분석이 DONE으로 바뀐 직후엔 노드가 아직 생성 중일 수 있어 그래프가 비어 올 수 있음 — 재조회 설정
const GRAPH_RETRY_LIMIT = 5;
const GRAPH_RETRY_INTERVAL_MS = 2000;

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
  onZoneDraftChange,
  onZoneDragEnd,
  onZoneDraggingChange,
  savedZones,
  structureNodes,
  editingStructureId,
  onStructureNodeMove,
  onStructureNodeMoveEnd,
  graphNodes,
  graphEdges,
  edgeAddActive,
  onNodeClickForEdge,
  edgeChainNodeIds,
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
  lightPreviewNodeId,
  lightPreviewLeftEdgeId,
  lightPreviewRightEdgeId,
  lightPickField,
  onLightPick,
}: {
  mapImageUrl: string | null;
  canvasH: number;
  placingActive: boolean;
  zoneAddActive: boolean;
  onZoneDraftChange: (rect: ZoneRect | null) => void;
  onZoneDragEnd: () => void;
  onZoneDraggingChange: (dragging: boolean) => void;
  savedZones: ZoneEntry[];
  structureNodes: StructureNode[];
  graphNodes: MapNode[];
  graphEdges: MapEdge[];
  edgeAddActive: boolean;
  onNodeClickForEdge: (id: string) => void;
  // 순서대로 클릭해 쌓은 엣지 체인 — 골라둔 노드 강조·구간 미리보기에 씀
  edgeChainNodeIds: string[];
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
  // 유도등 추가·수정 중 드롭다운으로 고른 갈림길 위치·왼쪽/오른쪽 통로를 캔버스에 바로
  // 보여주기 위함 — "뭘 고른 건지 캔버스에서 안 보여서 불친절하다"는 피드백 반영
  lightPreviewNodeId?: string;
  lightPreviewLeftEdgeId?: string;
  lightPreviewRightEdgeId?: string;
  // "캔버스에서 선택" 모드 — 켜져 있으면 노드/엣지 클릭이 평소 동작(선택·삭제·엣지연결 등) 대신
  // 유도등 갈림길 위치·좌우 통로 지정으로 대체됨
  lightPickField?: 'decisionNode' | 'leftEdge' | 'rightEdge' | null;
  onLightPick?: (id: string) => void;
}) => {
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const structureDragMovedRef = useRef(false);
  // 구역 드래그 중엔 포인터가 격자 셀·구조 노드 위를 지나가도 그 위에 걸린 개별 커서(pointer 등)로
  // 안 바뀌고 항상 십자선(crosshair)으로 보여야 함 — 드래그가 아닐 땐 칸 클릭·노드 선택이 여전히
  // 동작해야 하므로 zoneAddActive 내내가 아니라 실제 드래그 중(mousedown~mouseup)에만 그 레이어의
  // 포인터 이벤트를 꺼서 아래 svg 배경의 crosshair가 그대로 보이게 함
  const [isZoneDragging, setIsZoneDragging] = useState(false);

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
    setIsZoneDragging(true);
    onZoneDraggingChange(true);
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
      setIsZoneDragging(false);
      onZoneDraggingChange(false);
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
        // 유도등 추가·수정 중 드롭다운으로 왼쪽/오른쪽 통로를 고르면 캔버스에서도 바로 어느
        // 구간인지 보이게 함 — 색만으로는 헷갈릴 수 있어 라벨도 같이 띄움
        const isLeftPreview = !!lightPreviewLeftEdgeId && edge.id === lightPreviewLeftEdgeId;
        const isRightPreview = !!lightPreviewRightEdgeId && edge.id === lightPreviewRightEdgeId;
        const previewColor = isLeftPreview ? '#0ea5e9' : isRightPreview ? '#f59e0b' : null;
        // "캔버스에서 선택" 중엔 갈림길 위치에 실제로 연결된 엣지만 고를 수 있어야 함 — 드롭다운의
        // 필터 기준(연결 여부 + 반대쪽이 이미 고른 엣지 제외)을 그대로 따름
        const isEdgePickMode = lightPickField === 'leftEdge' || lightPickField === 'rightEdge';
        const isPickableEdge =
          isEdgePickMode &&
          !!lightPreviewNodeId &&
          (edge.fromNodeId === lightPreviewNodeId || edge.toNodeId === lightPreviewNodeId) &&
          edge.id !==
            (lightPickField === 'leftEdge' ? lightPreviewRightEdgeId : lightPreviewLeftEdgeId);
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
                cursor: canSelect || isPickableEdge ? 'pointer' : 'default',
                pointerEvents: canSelect || isPickableEdge ? 'stroke' : 'none',
              }}
              onClick={(e) => {
                if (isPickableEdge) {
                  e.stopPropagation();
                  onLightPick?.(edge.id);
                  return;
                }
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
              stroke={previewColor ?? (isSelected ? '#2563eb' : '#9ca3af')}
              strokeWidth={previewColor ? '3' : isSelected ? '2.5' : '1.5'}
              strokeDasharray={previewColor ? undefined : '3 3'}
              style={{ pointerEvents: 'none' }}
            />
            {previewColor && (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={midX - 13}
                  y={midY - 8}
                  width={26}
                  height={13}
                  rx={3}
                  fill={previewColor}
                />
                <text
                  x={midX}
                  y={midY + 2}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  fill="white"
                  fontFamily="sans-serif"
                >
                  {isLeftPreview ? '왼쪽' : '오른쪽'}
                </text>
              </g>
            )}
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

      {/* 순서대로 클릭해 쌓는 중인 엣지 체인 미리보기 — 이미 있는 구간은 회색, 새로 만들 구간은
          파란 점선으로 구분해서 검토 화면까지 안 가도 겹치는지 바로 알 수 있게 함 */}
      {edgeChainNodeIds.length > 1 &&
        edgeChainNodeIds.slice(0, -1).map((fromId, i) => {
          const toId = edgeChainNodeIds[i + 1];
          const from = nodePositionById.get(fromId);
          const to = nodePositionById.get(toId);
          if (!from || !to) return null;
          const alreadyExists = hasExistingEdge(graphEdges, fromId, toId);
          return (
            <line
              key={`edge-chain-preview-${fromId}-${toId}-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={alreadyExists ? '#9ca3af' : '#2563eb'}
              strokeWidth="2"
              strokeDasharray="4 3"
              style={{ pointerEvents: 'none' }}
            />
          );
        })}

      {/* 맵그래프 노드 중 ROOM/HALLWAY/EXIT/CUSTOM — 엣지 연결 모드에서만 클릭 가능.
          ROOM/HALLWAY는 경로 계산용 내부 포인트라 엣지 연결 모드일 때만 화면에 표시 —
          평소엔 클릭도 안 되는데 캔버스만 지저분하게 만들어서 숨김. EXIT/CUSTOM은 정보성이라 항상 표시 */}
      {graphNodes.map((n) => {
        const isRoomOrHallway = n.type === 'ROOM' || n.type === 'HALLWAY';
        const isLightPreview = !!lightPreviewNodeId && n.id === lightPreviewNodeId;
        // "캔버스에서 선택" 중엔 갈림길 위치로 아무 노드나 고를 수 있어야 해서, ROOM/HALLWAY도
        // 엣지 연결 모드가 아니어도 이때는 보여줌(유도등의 갈림길 위치로 이미 고른 노드도 동일)
        const isNodePickMode = lightPickField === 'decisionNode';
        if (isRoomOrHallway && !edgeAddActive && !isLightPreview && !isNodePickMode) return null;
        const x = n.x * CANVAS_W;
        const y = n.y * canvasH;
        const color = GRAPH_NODE_COLOR[n.type as 'ROOM' | 'HALLWAY' | 'EXIT' | 'CUSTOM'];
        return (
          <g
            key={n.id}
            style={{
              pointerEvents: edgeAddActive || isNodePickMode ? 'auto' : 'none',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              if (isNodePickMode) {
                e.stopPropagation();
                onLightPick?.(n.id);
                return;
              }
              if (!edgeAddActive) return;
              e.stopPropagation();
              onNodeClickForEdge(n.id);
            }}
          >
            {/* 엣지 연결 모드·유도등 갈림길 선택 모드에선 작은 점을 정확히 겨냥하기 어려워,
                넓은 투명 히트영역을 겹쳐 둔다 */}
            {(edgeAddActive || isNodePickMode) && (
              <circle cx={x} cy={y} r={13} fill="transparent" />
            )}
            {/* 체인에 이미 골라둔 노드는 테두리로 강조해서 클릭했다는 걸 바로 알 수 있게 함 */}
            {edgeChainNodeIds.includes(n.id) && (
              <circle cx={x} cy={y} r={9} fill="none" stroke="#2563eb" strokeWidth="2" />
            )}
            {/* 유도등 갈림길 위치로 고른 노드 강조 — 노란 점선 링(유도등 색과 맞춤) */}
            {isLightPreview && (
              <circle
                cx={x}
                cy={y}
                r={11}
                fill="none"
                stroke={DEVICE_COLOR.light}
                strokeWidth="2"
                strokeDasharray="3 2"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={n.type === 'EXIT' ? 6 : edgeAddActive || isLightPreview || isNodePickMode ? 5 : 3}
              fill={color}
            />
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
        const isLightPreview = !!lightPreviewNodeId && n.id === lightPreviewNodeId;
        const isNodePickMode = lightPickField === 'decisionNode';
        // 왼쪽/오른쪽 통로(엣지)를 캔버스에서 고르는 중엔 노드는 고를 대상이 아닌데, 이 원이
        // 계속 클릭을 가로채고 있었음 — 엣지가 노드 바로 옆에 붙어있으면 SVG 상 나중에 그려지는
        // 이 노드 원이 클릭을 먼저 받아가서 엣지를 못 고르던 문제의 원인
        const isEdgePickMode = lightPickField === 'leftEdge' || lightPickField === 'rightEdge';
        return (
          <g
            key={n.id}
            onMouseDown={(e) => handleStructureMouseDown(e, n.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (isNodePickMode) {
                onLightPick?.(n.id);
                return;
              }
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
            style={{
              cursor: isEditingThis ? 'grab' : 'pointer',
              pointerEvents: isZoneDragging || isEdgePickMode ? 'none' : 'auto',
            }}
          >
            {/* 엣지 연결 모드에선 작은 점을 정확히 겨냥하기 어려워, 넓은 투명 히트영역을 겹쳐 둔다 */}
            {edgeAddActive && !isEditingThis && (
              <circle cx={n.x} cy={n.y} r={16} fill="transparent" />
            )}
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
            {/* 체인에 이미 골라둔 노드는 테두리로 강조 — isSelected 링과 헷갈리지 않게 실선으로 구분 */}
            {edgeChainNodeIds.includes(n.id) && (
              <circle
                cx={n.x}
                cy={n.y}
                r={(n.isFinalExit ? 7 : isStair ? 6 : 4) + 4}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
              />
            )}
            {/* 유도등 갈림길 위치로 고른 노드 강조 — 노란 점선 링(유도등 색과 맞춤) */}
            {isLightPreview && (
              <circle
                cx={n.x}
                cy={n.y}
                r={(n.isFinalExit ? 7 : isStair ? 6 : 4) + 6}
                fill="none"
                stroke={DEVICE_COLOR.light}
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

      {/* 그리드 배경 — 도면 위에 얹는 균일한 모눈종이 격자선(선만, 채움 없음). 선택/조회 중이든
          아니든(browsing/selecting/viewing 어느 모드든) 항상 그림 — CCTV 카드를 눌러서 보기만
          해도(viewing) 배경 그리드가 사라지면 안 되는데, 예전엔 viewing이 이 조건에서 빠져있어서
          CCTV 카드를 클릭할 때마다 그리드가 사라지던 버그였음 */}
      <GridOverlayLines cells={floorGridCells} size={gridCellPxSize} canvasH={canvasH} />

      {/* 그리드 셀 선택 — CCTV 신규 등록 중(선택 가능) 또는 기존 CCTV 감시 영역(조회 전용).
          셀마다 테두리를 그리면 원고지처럼 보여서, 얇은 균일 격자선 위에 선택된 셀만
          하나의 면적(채움+외곽선)으로 표시하고, 클릭 판정은 투명 히트영역이 담당함 */}
      {(cctvGridCellsMode === 'selecting' || cctvGridCellsMode === 'viewing') && (
        <>
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
                style={{
                  cursor: 'pointer',
                  pointerEvents: isZoneDragging ? 'none' : 'auto',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onGridCellToggle(cell.id);
                }}
              />
            ))}
        </>
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

    // 마커의 바로 위 부모(구역 드래그 중 포인터 이벤트만 끄는 레이어)는 일부러 position을
    // 안 걸어둬서 자식이 전부 absolute면 높이가 0으로 찌그러짐 — 그 부모 기준으로 %를 계산하면
    // rect.height가 0이라 세로 좌표가 전부 위/아래 끝으로 튐(수정 중 위치를 옮기면 마커가
    // 캔버스 맨 위로 튀던 버그의 원인). 실제 좌표 기준인 mapWrap(그 부모의 부모)을 써야 함
    const container = (e.currentTarget as HTMLElement).parentElement?.parentElement;
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
      <div className={styles.markerPin}>
        <div className={markerClass}>
          {device.type === 'cctv' ? (
            <CameraIcon width={12} height={12} aria-hidden="true" />
          ) : (
            <WifiIcon width={12} height={12} aria-hidden="true" />
          )}
        </div>
      </div>
      {selected && (
        <span className={clsx(styles.markerLabel, styles.markerLabelPin)}>{device.label}</span>
      )}
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
}: {
  device: AddedDevice;
  posX: number;
  posY: number;
  selected: boolean;
  draggable: boolean;
  onClick: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
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

    // 마커의 바로 위 부모(구역 드래그 중 포인터 이벤트만 끄는 레이어)는 일부러 position을
    // 안 걸어둬서 자식이 전부 absolute면 높이가 0으로 찌그러짐 — 그 부모 기준으로 %를 계산하면
    // rect.height가 0이라 세로 좌표가 전부 위/아래 끝으로 튐(수정 중 위치를 옮기면 마커가
    // 캔버스 맨 위로 튀던 버그의 원인). 실제 좌표 기준인 mapWrap(그 부모의 부모)을 써야 함
    const container = (e.currentTarget as HTMLElement).parentElement?.parentElement;
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
      if (lastPoint) onDragEnd(device.id, lastPoint.x, lastPoint.y);
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
      <div className={styles.markerPin}>
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
      </div>
      {selected && (
        <span className={clsx(styles.markerLabel, styles.markerLabelPin)}>{device.label}</span>
      )}
    </div>
  );
};

type LightPickFieldName = 'decisionNode' | 'leftEdge' | 'rightEdge';

interface LightPickFieldProps {
  label: string;
  fieldName: LightPickFieldName;
  pickField: LightPickFieldName | null;
  disabled?: boolean;
  // 옵션 목록에서 찾은 현재 값의 표시용 라벨 — undefined면 아직 선택 안 된 상태
  displayLabel?: string;
  emptyText: string;
  onStartPick: () => void;
  onClear: () => void;
}

// 갈림길 위치·왼쪽 통로·오른쪽 통로 — 같은 이름 노드가 많아 드롭다운으로는 뭐가 뭔지 구분이
// 안 된다는 QA 피드백으로 드롭다운 자체를 없애고 도면(캔버스) 클릭으로만 고르게 함. 이 컴포넌트는
// 값을 고르는 UI가 아니라 "캔버스에서 선택" 버튼 + 현재 값 표시 + 지우기 버튼만 담당함
const LightPickField = ({
  label,
  fieldName,
  pickField,
  disabled = false,
  displayLabel,
  emptyText,
  onStartPick,
  onClear,
}: LightPickFieldProps) => {
  const picking = pickField === fieldName;
  return (
    <div className={styles.nodeAddField}>
      <div className={styles.nodeAddLabelRow}>
        <span className={styles.nodeAddLabel}>{label}</span>
        <button
          type="button"
          className={styles.nodeAddPickBtn}
          disabled={disabled}
          onClick={onStartPick}
        >
          {picking ? '선택 취소' : '캔버스에서 선택'}
        </button>
      </div>
      <div
        className={clsx(
          styles.nodeAddPickDisplay,
          !displayLabel && styles.nodeAddPickDisplayEmpty,
          picking && styles.nodeAddPickDisplayActive,
        )}
      >
        {displayLabel ?? emptyText}
        {displayLabel && (
          <button
            type="button"
            aria-label={`${label} 선택 해제`}
            className={styles.nodeAddPickClearBtn}
            onClick={onClear}
          >
            <XIcon width={14} height={14} />
          </button>
        )}
      </div>
    </div>
  );
};

// 갈림길 위치에 이어진 엣지가 도면에 하나도 없으면 왼쪽/오른쪽 통로는 캔버스에서 클릭할 대상 자체가
// 없어 아무것도 고를 수 없음(통로는 이 팝업이 아니라 별도의 "+ 추가 → 엣지 추가"로 미리 그려둬야
// 하는 데이터라서) — 그 상태에서 그냥 "클릭해주세요"만 보여주면 왜 안 되는지 알 수 없어 안내를 바꿔줌
interface LightPickHint {
  text: string;
  // 그냥 안내가 아니라 "지금 이대로는 진행이 안 된다"는 경고라 색으로도 구분되게 함
  isWarning: boolean;
}

const getLightPickHint = (
  pickField: LightPickFieldName | null,
  decisionNodeId: string,
  edgeOptions: readonly { fromNodeId: string; toNodeId: string }[],
): LightPickHint => {
  if (!pickField) {
    return {
      text: '이 유도등이 서 있는 갈림길 위치와, 화재 시 왼쪽·오른쪽 중 어느 통로로 안내할지 정해주세요',
      isWarning: false,
    };
  }
  if (pickField === 'decisionNode') {
    return { text: '도면에서 갈림길이 될 노드를 클릭해주세요', isWarning: false };
  }
  const hasConnectedEdge = edgeOptions.some(
    (e) => e.fromNodeId === decisionNodeId || e.toNodeId === decisionNodeId,
  );
  if (!hasConnectedEdge) {
    return {
      text: '이 갈림길에 연결된 통로(엣지)가 없어요. "+ 추가 → 엣지 추가"로 통로를 먼저 만들어주세요',
      isWarning: true,
    };
  }
  return {
    text:
      pickField === 'leftEdge'
        ? '도면에서 왼쪽 통로가 될 구간(선)을 클릭해주세요'
        : '도면에서 오른쪽 통로가 될 구간(선)을 클릭해주세요',
    isWarning: false,
  };
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
  onCancel,
  onBack,
  onSubmitEntry,
  onFinalize,
  lightNodeOptions,
  lightEdgeOptions,
  lightCctvOptions,
  lightFields,
  onLightFieldsChange,
  lightPickField,
  onStartLightPick,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  type: PlacingDeviceType;
  onTypeChange: (type: PlacingDeviceType) => void;
  stage: 'entry' | 'fov';
  hasPosition: boolean;
  selectedCellCount: number;
  onCancel: () => void;
  onBack: () => void;
  onSubmitEntry: (type: PlacingDeviceType, deviceId: string, lightFields: LightAddFields) => void;
  onFinalize: (deviceId: string) => void;
  lightNodeOptions: { id: string; label: string }[];
  lightEdgeOptions: { id: string; label: string; fromNodeId: string; toNodeId: string }[];
  lightCctvOptions: { id: string; label: string }[];
  // 갈림길 위치·좌우 통로 값은 부모가 갖고 있음(캔버스 클릭으로도 같은 값을 채울 수 있어야
  // 해서 이 팝업 로컬 state로 두면 캔버스↔팝업 양방향 동기화가 번거로워짐 — DeviceCard의
  // editForm과 같은 방식으로 통일). 담당 CCTV는 캔버스에서 고를 대상이 아니라 포함하지 않음
  lightFields: { decisionNodeId: string; leftEdgeId: string; rightEdgeId: string };
  onLightFieldsChange: (fields: {
    decisionNodeId: string;
    leftEdgeId: string;
    rightEdgeId: string;
  }) => void;
  lightPickField: 'decisionNode' | 'leftEdge' | 'rightEdge' | null;
  onStartLightPick: (field: 'decisionNode' | 'leftEdge' | 'rightEdge') => void;
}) => {
  const [deviceId, setDeviceId] = useState('');
  // 담당 CCTV는 캔버스에서 고를 대상이 아니라(그래프 노드/엣지가 아님) 계속 이 팝업 로컬
  // state로 둠 — 수정 카드(DeviceCard)와 채워야 하는 값이 서로 달라 등록 직후엔 "훈련 준비"에
  // 필요한 guidanceConfigured/cctvId가 항상 비어있던 문제. 도면에 아직 판단 노드·엣지·CCTV가
  // 없을 수도 있어 필수로 막지는 않음(비워두면 등록 후 카드에서 마저 채움)
  const [lightCctvId, setLightCctvId] = useState('');
  const {
    decisionNodeId: lightDecisionNodeId,
    leftEdgeId: lightLeftEdgeId,
    rightEdgeId: lightRightEdgeId,
  } = lightFields;

  const isStructureNode = isStructureNodeType(type);
  const isCctv = type === 'cctv';
  const isLight = type === 'light';
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
            onClick={() => onFinalize(deviceId)}
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
          {(['cctv', 'light', 'door', 'stair', 'hallway', 'start'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={clsx(styles.deviceTypeChip, type === t && styles.deviceTypeChipActive)}
              onClick={() => onTypeChange(t)}
            >
              {DEVICE_PLACE_CONFIG[t].label}
            </button>
          ))}
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
              placeholder={isCctv ? 'CCTV-A3-05' : 'IOT-A3-05'}
            />
          </div>

          {/* 담당 CCTV·가이던스(판단 노드/좌우 엣지) — 장비 카드 수정에서만 채울 수 있던 값이라
              등록 직후엔 항상 비어있던 문제(훈련 준비의 guidanceConfigured가 안 채워짐). 도면에
              아직 판단 노드·엣지·CCTV가 없을 수도 있어 필수는 아니고, 비워두면 등록 후 카드에서
              마저 채울 수 있음 */}
          {isLight &&
            (() => {
              const lightPickHint = getLightPickHint(
                lightPickField,
                lightDecisionNodeId,
                lightEdgeOptions,
              );
              return (
                <>
                  <div className={styles.nodeAddField}>
                    <span className={styles.nodeAddLabel}>담당 CCTV</span>
                    <Dropdown
                      shape="rounded"
                      fullWidth
                      ariaLabel="담당 CCTV"
                      options={lightCctvOptions.map((c) => ({ value: c.id, label: c.label }))}
                      value={lightCctvId}
                      onChange={setLightCctvId}
                      placeholder="미지정"
                    />
                  </div>
                  {/* "판단 노드"·"경로 엣지"란 용어와, 목록에 같은 종류(예: 복도) 노드가 여러 개일 때
                      뭐가 뭔지 구분이 안 된다는 QA 피드백 — 무엇을 고르는 건지 문장으로 먼저 알려주고,
                      옵션 라벨도 우측 패널 카드와 같은 번호("복도 1" 등, getGraphNodeLabel)를 쓰게 함.
                      드롭다운이 여전히 헷갈리면 "캔버스에서 선택" 버튼으로 도면에서 직접 클릭해 고를
                      수도 있게 함(이 경우 도면 위 강조·클릭은 부모가 처리하고 값만 내려받음) */}
                  <span
                    className={clsx(
                      styles.nodeAddHint,
                      lightPickHint.isWarning && styles.nodeAddHintWarning,
                    )}
                  >
                    {lightPickHint.text}
                  </span>
                  <LightPickField
                    label="갈림길 위치"
                    fieldName="decisionNode"
                    pickField={lightPickField}
                    displayLabel={lightNodeOptions.find((n) => n.id === lightDecisionNodeId)?.label}
                    emptyText="갈림길 위치 선택"
                    onStartPick={() => onStartLightPick('decisionNode')}
                    onClear={() =>
                      onLightFieldsChange({ decisionNodeId: '', leftEdgeId: '', rightEdgeId: '' })
                    }
                  />
                  <LightPickField
                    label="왼쪽 통로"
                    fieldName="leftEdge"
                    pickField={lightPickField}
                    disabled={!lightDecisionNodeId}
                    displayLabel={lightEdgeOptions.find((e) => e.id === lightLeftEdgeId)?.label}
                    emptyText={lightDecisionNodeId ? '왼쪽 통로 선택' : '갈림길 위치를 먼저 선택'}
                    onStartPick={() => onStartLightPick('leftEdge')}
                    onClear={() => onLightFieldsChange({ ...lightFields, leftEdgeId: '' })}
                  />
                  <LightPickField
                    label="오른쪽 통로"
                    fieldName="rightEdge"
                    pickField={lightPickField}
                    disabled={!lightDecisionNodeId}
                    displayLabel={lightEdgeOptions.find((e) => e.id === lightRightEdgeId)?.label}
                    emptyText={lightDecisionNodeId ? '오른쪽 통로 선택' : '갈림길 위치를 먼저 선택'}
                    onStartPick={() => onStartLightPick('rightEdge')}
                    onClear={() => onLightFieldsChange({ ...lightFields, rightEdgeId: '' })}
                  />
                </>
              );
            })()}
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
          onClick={() =>
            onSubmitEntry(type, deviceId.trim(), {
              cctvId: lightCctvId,
              decisionNodeId: lightDecisionNodeId,
              leftEdgeId: lightLeftEdgeId,
              rightEdgeId: lightRightEdgeId,
            })
          }
        >
          {isCctv ? '다음' : '추가'}
        </button>
      </div>
    </div>
  );
};

/* ── 구역 설정 팝업 — 백엔드 저장 단위가 그리드 셀 집합이라 드래그는 겹치는 셀을 고르는 용도로 씀.
   구역 재설정(재드래그)에도 그대로 재사용함 — 구역은 수정 API가 없어 새로 만들고 기존 걸
   지우는 방식으로만 "재설정"할 수 있는데, 이 팝업이 이름+셀 선택을 같이 받는 유일한 곳이라
   재설정 흐름도 다시 "새 구역 만들기"와 같은 절차를 타면 됨 ── */
const ZoneAddPopup = ({
  containerRef,
  selectedCellCount,
  initialName = '',
  title = '구역 설정',
  submitLabel = '추가',
  onCancel,
  onSave,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  selectedCellCount: number;
  initialName?: string;
  title?: string;
  submitLabel?: string;
  onCancel: () => void;
  onSave: (label: string) => void;
}) => {
  const [zoneName, setZoneName] = useState(initialName);
  const hasSelectedCells = selectedCellCount > 0;

  const handleSave = () => {
    onSave(zoneName.trim());
  };

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>{title}</span>
        <span className={styles.nodeAddStepBadge}>{hasSelectedCells ? '2/2' : '1/2'}</span>
      </div>
      <span className={styles.nodeAddHint}>
        {hasSelectedCells
          ? `${selectedCellCount}칸 선택됨. 다시 드래그하면 그 영역으로 새로 잡혀요. 이름을 입력하고 ${submitLabel} 버튼을 누르면 저장됩니다.`
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
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

/* ── 엣지 체인 검토 팝업 — 순서대로 고른 노드들 사이 구간을 한 번에 검토·확정.
   구간이 1개(노드 2개)여도 같은 화면을 씀 — 별도 "한 쌍짜리" 경로를 둘 필요가 없음 ── */
const EdgeChainReviewPopup = ({
  containerRef,
  segments,
  onBack,
  onSubmit,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  segments: {
    fromId: string;
    toId: string;
    fromLabel: string;
    toLabel: string;
    // 두 노드 좌표 + 그리드 배율로 계산한 추정 거리(m). 없으면 수동 입력
    suggestedDistanceM: number | null;
    // 다른 경로와 겹쳐서 이미 존재하는 구간 — 입력 없이 생성 대상에서만 제외함
    alreadyExists: boolean;
  }[];
  onBack: () => void;
  onSubmit: (
    rows: {
      fromId: string;
      toId: string;
      fromLabel: string;
      toLabel: string;
      distanceM: number;
      bidirectional: boolean;
    }[],
  ) => void;
}) => {
  // 실내 노드 간 거리는 1m 미만도 흔해서 cm로 입력받음(정수로 편하게 입력, 저장은 m로 환산)
  const [distancesCm, setDistancesCm] = useState(() =>
    segments.map((s) =>
      s.suggestedDistanceM !== null ? String(Math.round(s.suggestedDistanceM * 100)) : '',
    ),
  );
  const [bidirectional, setBidirectional] = useState(true);

  const handleDistanceChange = (index: number, raw: string) => {
    // 완성된 숫자만 허용하면 편집 중간 상태(끝자리 삭제 등)가 거부돼 편집이 막히던 문제 —
    // 타이핑 도중 상태(끝에 점만 있거나 소수부가 빈 경우)도 허용
    if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
    setDistancesCm((prev) => prev.map((v, i) => (i === index ? raw : v)));
  };

  const newSegmentCount = segments.filter((s) => !s.alreadyExists).length;
  const allValid =
    newSegmentCount > 0 && segments.every((s, i) => s.alreadyExists || Number(distancesCm[i]) > 0);

  const handleSubmit = () => {
    const rows: {
      fromId: string;
      toId: string;
      fromLabel: string;
      toLabel: string;
      distanceM: number;
      bidirectional: boolean;
    }[] = [];
    segments.forEach((s, i) => {
      if (s.alreadyExists) return;
      rows.push({
        fromId: s.fromId,
        toId: s.toId,
        fromLabel: s.fromLabel,
        toLabel: s.toLabel,
        distanceM: Number(distancesCm[i]) / 100,
        bidirectional,
      });
    });
    onSubmit(rows);
  };

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>연결 구간 확인</span>
        <span className={styles.nodeAddStepBadge}>
          {newSegmentCount < segments.length
            ? `신규 ${newSegmentCount}개 · 기존 ${segments.length - newSegmentCount}개`
            : `${segments.length}개 구간`}
        </span>
      </div>
      <span className={styles.nodeAddHint}>
        {newSegmentCount === 0
          ? '선택한 구간이 모두 이미 연결되어 있어요'
          : '새로 만들 구간의 거리(cm)를 확인하고, 필요하면 고쳐주세요'}
      </span>

      <div className={styles.edgeChainList}>
        {segments.map((s, i) => (
          <div key={`${s.fromId}-${s.toId}`} className={styles.edgeChainRow}>
            <span className={styles.edgeChainRowLabel}>
              {s.fromLabel} → {s.toLabel}
            </span>
            {s.alreadyExists ? (
              <span className={styles.edgeChainExistingTag}>이미 연결됨</span>
            ) : (
              <input
                className={styles.edgeChainDistanceInput}
                type="text"
                inputMode="decimal"
                value={distancesCm[i]}
                onChange={(e) => handleDistanceChange(i, e.target.value)}
                placeholder="350"
              />
            )}
          </div>
        ))}
      </div>

      <label className={styles.edgeBidirectionalField}>
        <input
          type="checkbox"
          checked={bidirectional}
          onChange={(e) => setBidirectional(e.target.checked)}
        />
        전체 양방향 통행 가능
      </label>

      <div className={styles.nodeAddActions}>
        <button type="button" className={styles.nodeAddCancelBtn} onClick={onBack}>
          이전
        </button>
        <button
          type="button"
          className={styles.nodeAddSubmitBtn}
          disabled={!allValid}
          onClick={handleSubmit}
        >
          {newSegmentCount}개 연결 추가
        </button>
      </div>
    </div>
  );
};

/* ── 툴바 "+ 추가" 메뉴 — 노드/구역/엣지 추가를 각각 버튼으로 늘어놓지 않고 하나로 묶음 ── */
const AddActionMenu = ({
  onAddNode,
  onAddZone,
  onAddEdge,
}: {
  onAddNode: () => void;
  onAddZone: () => void;
  onAddEdge: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const items = [
    { label: '노드 추가', onClick: onAddNode },
    { label: '구역 추가', onClick: onAddZone },
    { label: '엣지 연결', onClick: onAddEdge },
  ];

  return (
    <div ref={containerRef} className={styles.addMenuContainer}>
      <button
        type="button"
        className={styles.canvasActionButton}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <PlusIcon width={14} height={14} />
        추가
        <ChevronDownIcon width={14} height={14} className={styles.addMenuChevron} />
      </button>
      {open && (
        <div className={styles.addMenuPanel} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={styles.addMenuItem}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── 노드/구역 종류 안내 — 인포 아이콘을 눌렀을 때만 팝오버로 보여주고 바깥을 클릭하면 닫힘
   (항상 떠 있는 범례가 도면을 가린다는 피드백을 받아 지도 툴들에서 흔한 "on-demand 팝오버"
   패턴으로 바꿈) ── */
const NodeTypeLegendInfo = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={styles.legendInfoContainer}>
      <button
        type="button"
        className={styles.legendInfoButton}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="노드·구역 표시 안내"
        onClick={() => setOpen((prev) => !prev)}
      >
        <InfoIcon width={18} height={18} />
      </button>

      {open && (
        <div className={styles.legendPopover} role="dialog" aria-label="노드·구역 표시 안내">
          <div className={styles.nodeTypeLegendSection}>
            <span className={styles.zoneLegendTitle}>노드 종류</span>
            <div className={styles.zoneLegendItem}>
              <span className={styles.nodeTypeCctvBadge}>CC</span>
              <span className={styles.zoneLegendLabel}>CCTV</span>
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
            <div className={styles.zoneLegendItem}>
              <span className={clsx(styles.nodeTypeDot, styles.nodeTypeDotHallway)} />
              <span className={styles.zoneLegendLabel}>복도</span>
            </div>
            <div className={styles.zoneLegendItem}>
              <span className={clsx(styles.nodeTypeDot, styles.nodeTypeDotStart)} />
              <span className={styles.zoneLegendLabel}>시작 후보</span>
            </div>
          </div>

          <div className={styles.nodeTypeLegendDivider} />

          <div className={styles.nodeTypeLegendSection}>
            <span className={styles.zoneLegendTitle}>구역 종류</span>
            <div className={styles.zoneLegendItem}>
              <span className={clsx(styles.nodeTypeAreaSwatch, styles.nodeTypeAreaSwatchGeneral)} />
              <span className={styles.zoneLegendLabel}>일반 구역</span>
            </div>
            <div className={styles.zoneLegendItem}>
              <span className={clsx(styles.nodeTypeAreaSwatch, styles.nodeTypeAreaSwatchCamera)} />
              <span className={styles.zoneLegendLabel}>카메라 시야</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── 장비 카드 ── */
const DeviceCard = ({
  item,
  selected,
  editing,
  editForm,
  hasChanges,
  onEditFormChange,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onToggleEnabled,
  onEditCctvCells,
  lightNodeOptions,
  lightEdgeOptions,
  lightCctvOptions,
  lightPickField,
  onStartLightPick,
}: {
  item: PanelItem;
  selected: boolean;
  editing: boolean;
  editForm: DeviceEditForm;
  // 폼이 원본과 달라졌는지 — "완료" 버튼을 실제로 바뀐 게 있을 때만 눌리게 하는 데 씀
  hasChanges: boolean;
  onEditFormChange: (form: DeviceEditForm) => void;
  onSelect: (item: PanelItem) => void;
  onStartEdit: (item: PanelItem) => void;
  onSaveEdit: (item: PanelItem) => void;
  onCancelEdit: (item: PanelItem) => void;
  onDelete: (item: PanelItem) => void;
  onToggleEnabled: (item: PanelItem) => void;
  onEditCctvCells: (item: PanelItem) => void;
  lightNodeOptions: { id: string; label: string }[];
  lightEdgeOptions: { id: string; label: string; fromNodeId: string; toNodeId: string }[];
  lightCctvOptions: { id: string; label: string }[];
  // "캔버스에서 선택" — 드롭다운 대신 도면에서 직접 클릭해 갈림길 위치·좌우 통로를 고르는 대안
  lightPickField: 'decisionNode' | 'leftEdge' | 'rightEdge' | null;
  onStartLightPick: (field: 'decisionNode' | 'leftEdge' | 'rightEdge') => void;
}) => {
  // 가이던스·방향처럼 자주 안 건드리는 항목은 접어둬서, 수정 모드로 들어갈 때 카드가
  // 일반 모드보다 과하게 길어지는 걸 줄임
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div
      data-panel-id={item.id}
      role="button"
      tabIndex={0}
      className={clsx(styles.deviceCard, selected && styles.deviceCardSelected)}
      // 수정 중엔 카드 배경 클릭이 선택 토글로 이어져서, 이미 선택된 카드를 다시 누르면
      // editingItemId까지 같이 풀려버렸음(완료를 누른 것처럼 보이는 버그) — 수정 중엔 무시함
      onClick={() => {
        if (!editing) onSelect(item);
      }}
      // 카드 자체가 role="button"이라 키보드로도 선택할 수 있어야 함 — 다만 안쪽 입력·버튼이
      // 이벤트를 버블링시킨 경우(e.target !== e.currentTarget)는 그쪽 자체 키 처리에 맡기고 무시
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        if (!editing) onSelect(item);
      }}
    >
      <div className={styles.deviceCardNameRow}>
        {editing ? (
          <input
            className={styles.deviceCardNameInput}
            aria-label="장치 이름"
            value={editForm.label}
            onChange={(e) => onEditFormChange({ ...editForm, label: e.target.value })}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={styles.deviceCardName}>{item.label}</span>
        )}
        <button
          type="button"
          aria-label="삭제"
          className={styles.zoneCardIconBtnDelete}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
        >
          <TrashIcon width={14} height={14} />
        </button>
      </div>
      <div className={styles.deviceCardRow}>
        <span className={styles.deviceCardKey}>장치 코드</span>
        <span
          className={styles.deviceCardValue}
          title={item.code ? '서버가 자동으로 부여하는 값이라 수정할 수 없어요' : undefined}
        >
          {item.code ?? item.id.toUpperCase()}
        </span>
      </div>
      <div className={styles.deviceCardRow}>
        <span className={styles.deviceCardKey}>상태</span>
        {item.type === 'cctv' || item.type === 'light' ? (
          <span className={styles.cctvEnableRow}>
            <span className={styles.deviceCardValue}>
              {item.statusOnline ? '활성화' : '비활성화'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={item.statusOnline}
              aria-label={
                item.statusOnline
                  ? '활성화됨 — 클릭하면 비활성화로 전환'
                  : '비활성화됨 — 클릭하면 활성화로 전환'
              }
              className={clsx(
                styles.cctvEnableSwitch,
                item.statusOnline && styles.cctvEnableSwitchOn,
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnabled(item);
              }}
            >
              <span className={styles.cctvEnableSwitchThumb} />
            </button>
          </span>
        ) : (
          <StatusBadge
            label={item.statusText}
            color={item.statusOnline ? 'green' : 'neutral'}
            dot
          />
        )}
      </div>
      <div className={styles.deviceCardRow}>
        <span className={styles.deviceCardKey}>설치 위치</span>
        <span
          className={styles.deviceCardValue}
          title={
            item.type === 'cctv'
              ? '감시 영역에서 자동으로 계산돼요'
              : '도면 위 실제 좌표예요 — 캔버스에서 위치를 옮기면 여기도 함께 바뀌어요'
          }
        >
          {item.zone}
        </span>
      </div>
      {item.type === 'light' && (
        <>
          <div className={styles.deviceCardRow}>
            <span className={styles.deviceCardKey}>담당 CCTV</span>
            {!editing && (
              <span className={styles.deviceCardValue}>{item.cctvName ?? '미지정'}</span>
            )}
          </div>
          {editing && (
            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown
                shape="rounded"
                fullWidth
                ariaLabel="담당 CCTV"
                options={lightCctvOptions.map((c) => ({ value: c.id, label: c.label }))}
                value={editForm.cctvId}
                onChange={(v) => onEditFormChange({ ...editForm, cctvId: v })}
                placeholder="미지정"
              />
            </div>
          )}
          <div
            className={styles.deviceCardRow}
            title="화재 시 이 유도등이 서 있는 갈림길에서 왼쪽/오른쪽 중 어느 통로로 사람들을 안내할지 정해요"
          >
            <span className={styles.deviceCardKey}>경로 · 방향</span>
            {editing ? (
              <button
                type="button"
                className={styles.deviceCardFieldEditBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailsOpen((v) => !v);
                }}
              >
                {item.guidanceConfigured ? '설정됨' : '미설정'} · {detailsOpen ? '접기' : '펼치기'}
              </button>
            ) : (
              <span className={styles.deviceCardValue}>
                {item.guidanceConfigured ? '설정됨' : '미설정'}
              </span>
            )}
          </div>
          {editing && detailsOpen && (
            <div className={styles.lightFieldGroup} onClick={(e) => e.stopPropagation()}>
              {/* "판단 노드"·"경로 엣지"란 용어가 무엇을 고르는 건지 안 와닿는다는 QA 피드백 —
                  펼쳤을 때 항상 보이는 문장으로 먼저 설명함(hover에만 의존하던 title 문구를 대체).
                  드롭다운에 같은 이름 노드가 많아 헷갈리면 "캔버스에서 선택"으로 도면에서 직접
                  클릭해 고를 수도 있음 */}
              {(() => {
                const lightPickHint = getLightPickHint(
                  lightPickField,
                  editForm.decisionNodeId,
                  lightEdgeOptions,
                );
                return (
                  <span
                    className={clsx(
                      styles.nodeAddHint,
                      lightPickHint.isWarning && styles.nodeAddHintWarning,
                    )}
                  >
                    {lightPickHint.text}
                  </span>
                );
              })()}
              <LightPickField
                label="갈림길 위치"
                fieldName="decisionNode"
                pickField={lightPickField}
                displayLabel={lightNodeOptions.find((n) => n.id === editForm.decisionNodeId)?.label}
                emptyText="갈림길 위치 선택"
                onStartPick={() => onStartLightPick('decisionNode')}
                onClear={() =>
                  // 갈림길 위치(판단 노드)를 바꾸면 이전 노드에 연결돼 있던 좌/우 통로 선택은
                  // 더 이상 유효하지 않을 수 있어(연결 안 된 엣지를 저장 시점에야 서버가
                  // 거부하던 문제의 원인이었음) 같이 비움
                  onEditFormChange({
                    ...editForm,
                    decisionNodeId: '',
                    leftEdgeId: '',
                    rightEdgeId: '',
                  })
                }
              />
              {/* 갈림길 위치에 실제로 연결된 통로(엣지)만 후보로 보여줌 — 그 외를 고르면 저장할 때
                  서버가 거부해서(leftEdgeId/rightEdgeId는 decisionNodeId에 연결돼 있어야 함)
                  헷갈리던 문제를 아예 고를 수 없게 만들어 없앰 */}
              <LightPickField
                label="왼쪽 통로"
                fieldName="leftEdge"
                pickField={lightPickField}
                disabled={!editForm.decisionNodeId}
                displayLabel={lightEdgeOptions.find((e) => e.id === editForm.leftEdgeId)?.label}
                emptyText={editForm.decisionNodeId ? '왼쪽 통로 선택' : '갈림길 위치를 먼저 선택'}
                onStartPick={() => onStartLightPick('leftEdge')}
                onClear={() => onEditFormChange({ ...editForm, leftEdgeId: '' })}
              />
              <LightPickField
                label="오른쪽 통로"
                fieldName="rightEdge"
                pickField={lightPickField}
                disabled={!editForm.decisionNodeId}
                displayLabel={lightEdgeOptions.find((e) => e.id === editForm.rightEdgeId)?.label}
                emptyText={editForm.decisionNodeId ? '오른쪽 통로 선택' : '갈림길 위치를 먼저 선택'}
                onStartPick={() => onStartLightPick('rightEdge')}
                onClear={() => onEditFormChange({ ...editForm, rightEdgeId: '' })}
              />
            </div>
          )}
        </>
      )}
      {item.type === 'cctv' && (
        <div className={styles.deviceCardRow}>
          <span className={styles.deviceCardKey}>감시 영역</span>
          {editing ? (
            // 버튼 3개가 난잡해 보인다는 피드백으로, 별도 액션 버튼 대신 이 값 자체를
            // 눌러서 재선택하도록 함 — "설치 위치"가 수정 중엔 입력창으로 바뀌는 것과 같은 결
            <button
              type="button"
              className={styles.deviceCardFieldEditBtn}
              onClick={(e) => {
                e.stopPropagation();
                onEditCctvCells(item);
              }}
            >
              {item.monitoredArea
                ? `${item.monitoredArea.cellCount}칸 · ${formatAreaM2(item.monitoredArea.areaM2)}㎡`
                : '미지정'}{' '}
              · 재선택
            </button>
          ) : (
            <span className={styles.deviceCardValue}>
              {item.monitoredArea
                ? `${item.monitoredArea.cellCount}칸 · ${formatAreaM2(item.monitoredArea.areaM2)}㎡`
                : '미지정'}
            </span>
          )}
        </div>
      )}
      <div className={styles.deviceCardActions}>
        {editing ? (
          <>
            <button
              type="button"
              className={styles.deviceCardEditBtn}
              onClick={(e) => {
                e.stopPropagation();
                onCancelEdit(item);
              }}
            >
              취소
            </button>
            <button
              type="button"
              className={styles.deviceCardDoneBtn}
              disabled={!hasChanges}
              title={hasChanges ? undefined : '변경된 내용이 없어요'}
              onClick={(e) => {
                e.stopPropagation();
                onSaveEdit(item);
              }}
            >
              완료
            </button>
          </>
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
      </div>
    </div>
  );
};

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
  onZoneDraftChange,
  onZoneDragEnd,
  isZoneDragging,
  onZoneDraggingChange,
  savedZones,
  structureNodes,
  editingStructureId,
  onStructureNodeMove,
  onStructureNodeMoveEnd,
  graphNodes,
  graphEdges,
  edgeAddActive,
  onNodeClickForEdge,
  edgeChainNodeIds,
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
  devicePositions,
  addedDevices,
  onSelectDevice,
  onMapClick,
  onDeviceMoved,
  onUpload,
  onBackgroundClick,
  lightPreviewNodeId,
  lightPreviewLeftEdgeId,
  lightPreviewRightEdgeId,
  lightPickField,
  onLightPick,
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
  onZoneDraftChange: (rect: ZoneRect | null) => void;
  onZoneDragEnd: () => void;
  isZoneDragging: boolean;
  onZoneDraggingChange: (dragging: boolean) => void;
  savedZones: ZoneEntry[];
  structureNodes: StructureNode[];
  editingStructureId: string | null;
  onStructureNodeMove: (id: string, x: number, y: number) => void;
  onStructureNodeMoveEnd: (id: string, x: number, y: number) => void;
  graphNodes: MapNode[];
  graphEdges: MapEdge[];
  edgeAddActive: boolean;
  onNodeClickForEdge: (id: string) => void;
  edgeChainNodeIds: string[];
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
  devicePositions: Record<string, { x: number; y: number }>;
  addedDevices: AddedDevice[];
  onSelectDevice: (d: DeviceMarker) => void;
  onMapClick: (x: number, y: number) => void;
  onDeviceMoved: (id: string, x: number, y: number) => void;
  onUpload: () => void;
  onBackgroundClick: () => void;
  lightPreviewNodeId?: string;
  lightPreviewLeftEdgeId?: string;
  lightPreviewRightEdgeId?: string;
  lightPickField?: 'decisionNode' | 'leftEdge' | 'rightEdge' | null;
  onLightPick?: (id: string) => void;
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
        onZoneDraftChange={onZoneDraftChange}
        onZoneDragEnd={onZoneDragEnd}
        onZoneDraggingChange={onZoneDraggingChange}
        savedZones={savedZones}
        structureNodes={structureNodes}
        editingStructureId={editingStructureId}
        onStructureNodeMove={onStructureNodeMove}
        onStructureNodeMoveEnd={onStructureNodeMoveEnd}
        graphNodes={graphNodes}
        graphEdges={graphEdges}
        edgeAddActive={edgeAddActive}
        onNodeClickForEdge={onNodeClickForEdge}
        edgeChainNodeIds={edgeChainNodeIds}
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
        lightPreviewNodeId={lightPreviewNodeId}
        lightPreviewLeftEdgeId={lightPreviewLeftEdgeId}
        lightPreviewRightEdgeId={lightPreviewRightEdgeId}
        lightPickField={lightPickField}
        onLightPick={onLightPick}
      />
      {stagedCameraPosition && (
        <div
          className={styles.stagedCameraMarker}
          style={{ left: `${stagedCameraPosition.x}%`, top: `${stagedCameraPosition.y}%` }}
        />
      )}
      {/* 구역 드래그 중엔 이 레이어(SVG 밖 HTML 마커)의 포인터 이벤트를 꺼서, 마커 위를
          지나가도 각자의 cursor(grab/pointer)로 안 바뀌고 아래 SVG 배경의 crosshair가
          그대로 보이게 함 — 이 wrapper는 position을 안 걸어서 자식들의 absolute 위치
          기준(mapWrap)에는 영향이 없음 */}
      <div style={{ pointerEvents: isZoneDragging ? 'none' : undefined }}>
        {floor.devices.map((device) => {
          // devicePositions는 드래그 중 미리보기 오버레이 — 수정 모드를 벗어나면(완료든 취소든)
          // 곧바로 원래 좌표로 되돌아가야 해서, 그 항목을 수정 중일 때만 오버레이를 반영함
          const pos =
            editingItemId === device.id && devicePositions[device.id]
              ? devicePositions[device.id]
              : { x: device.x, y: device.y };
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
          // devicePositions는 드래그 중 미리보기 오버레이 — 수정 모드를 벗어나면(완료든 취소든)
          // 곧바로 원래 좌표로 되돌아가야 해서, 그 항목을 수정 중일 때만 오버레이를 반영함
          const pos =
            editingItemId === d.id && devicePositions[d.id]
              ? devicePositions[d.id]
              : { x: d.x, y: d.y };
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
            />
          );
        })}
      </div>
    </div>
  );
};

/* ── 메인 페이지 ── */
const FloorPlansDetailPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  // 그리드 columns/rows 비율을 우선으로 씀 — 셀 크기는 CANVAS_W/cols × canvasH/rows로 계산되므로
  // (getGridCellPxSize) 이 값이 이미지의 원본 픽셀 비율과 어긋나면 정사각형이어야 할 셀이
  // 직사각형으로 보임. 스캔·촬영한 도면은 실측 비율과 이미지 픽셀 비율이 딱 맞아떨어지지
  // 않는 경우가 많아, 그리드가 아직 없을 때(분석 전)만 이미지 비율로 대체하고 그것도
  // 없으면 4:3. viewBox 비율이 이미지와 살짝 어긋나면 배경 이미지가 미세하게 늘어날 수
  // 있지만, 셀을 정확히 클릭·드래그해야 하는 그리드 쪽이 더 중요해서 이 쪽을 우선함
  const canvasH = useMemo(() => {
    if (floorGridCells.length > 0) {
      const { cols, rows } = getGridDimensions(floorGridCells);
      if (cols > 0 && rows > 0) return (CANVAS_W * rows) / cols;
    }
    if (imageAspect && imageAspect > 0) return CANVAS_W / imageAspect;
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

  // CCTV 등록 시 그리드 배율이 서버에서 사라져있어(CCTV006) 재적용 후 재시도할 때, 방금 사용자가
  // 드래그한 영역을 다시 그리게 하지 않고 같은 영역으로 셀을 재계산하기 위해 rect를 별도로 들고
  // 있음 — cctvDraftCellIds는 재적용 전 그리드의 셀 id라 그대로 재사용할 수 없음(그리드 재적용 시
  // 셀이 새로 생성되어 id가 바뀜). 등록 성공뿐 아니라 새 CCTV 시야 선택을 다시 시작할 때·층을
  // 바꿀 때도 비워야 함 — 안 그러면 취소 후 클릭만으로 새 영역을 고른 다음 CCTV006이 나면
  // 재시도가 엉뚱한(예전) 드래그 영역을 그대로 써버림(코드래빗 리뷰로 발견)
  const lastCctvDraftRectRef = useRef<ZoneRect | null>(null);

  // 층이 바뀌거나 도면을 다시 올렸을 때, 이전 도면 기준으로 만들어진 노드·장비·구역이
  // 화면에 남지 않도록 층 단위 상태를 한 번에 비움 (각 조회 effect가 새 데이터로 다시 채움)
  const resetFloorScopedState = useCallback(() => {
    lastCctvDraftRectRef.current = null;
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
    setDeleteConfirmTarget(null);
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

  // 그리드는 더 이상 토글로 켜야만 보이는 게 아니라 항상 표시함 — 층이 준비되면 바로
  // 조회해둠(floorGridCells가 비어있을 때만 실제로 요청함, ensureFloorGridCells 내부 참고)
  useEffect(() => {
    if (!isFloorReady) return;
    void ensureFloorGridCells();
    // ensureFloorGridCells는 매 렌더 새로 만들어지는 함수라 의존성에 넣으면 무한 재실행됨.
    // floorId/isFloorReady가 바뀔 때만 재조회하면 됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorId, isFloorReady]);

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
                // 경로 탐색기가 인정하는 최종 탈출구는 type === 'EXIT'뿐 — 예전 코드로 isExitTarget만
                // 붙은 계단은 '탈출구로 지정'을 다시 눌러 EXIT로 승격해야 함(배지 아직 안 붙음)
                isFinalExit: n.type === 'EXIT',
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
              zone: formatMonitoredZone(cctv),
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

  // 층 그리드 셀 조회 — CCTV 시야구역 선택에 사용.
  // 층을 빠르게 옮기거나 화면을 벗어나면(언마운트) 응답을 무시하는 것뿐 아니라 실제로 요청도
  // 중단해야, 배율이 작아 페이지가 많은 층에서 안 쓸 응답까지 끝까지 받아오는 낭비가 없음
  useEffect(() => {
    if (!floorId) return;
    const controller = new AbortController();
    getFloorGridCells(floorId, controller.signal)
      .then((cells) => {
        setFloorGridCells(cells);
      })
      .catch(() => {});
    return () => {
      controller.abort();
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
  // 노드를 한 쌍씩 고르던 방식 대신, 클릭한 순서대로 경로를 쌓아뒀다가 한 번에 구간별로
  // 검토·확정함(A→B→C→D 클릭 시 A-B, B-C, C-D를 일괄 생성) — 매번 팝업을 반복하던 번거로움을 줄임
  const [edgeChainNodeIds, setEdgeChainNodeIds] = useState<string[]>([]);
  const [edgeChainReviewOpen, setEdgeChainReviewOpen] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneEntry[]>([]);
  // 구역 재설정(재드래그) 중인 기존 구역 id — null이면 zoneAddOpen은 "새 구역 추가" 흐름.
  // 구역은 PATCH가 없어 새로 만들고 기존 걸 지우는 방식으로만 "수정"할 수 있음(스웨거 확인)
  const [zoneResetTargetId, setZoneResetTargetId] = useState<string | null>(null);
  const [zoneDraftRect, setZoneDraftRectState] = useState<ZoneRect | null>(null);
  const zoneDraftRectRef = useRef<ZoneRect | null>(null);
  const setZoneDraftRect = (rect: ZoneRect | null) => {
    zoneDraftRectRef.current = rect;
    setZoneDraftRectState(rect);
  };
  // 구역 드래그(사각형 선택) 중엔 캔버스 위 CCTV·유도등 마커(SVG 밖 별도 HTML 마커)와
  // 격자 셀·구조 노드가 저마다 다른 커서를 걸고 있어도 항상 십자선(crosshair)으로 보이게 함 —
  // MockFloorMap3F(SVG 내부)에서 드래그 시작/종료 시 이 값을 갱신하고, FloorCanvas가 SVG 밖
  // 마커의 pointer-events를 같이 꺼서 호버가 아래 SVG 배경(crosshair)으로 그대로 넘어가게 함
  const [isZoneDragging, setIsZoneDragging] = useState(false);
  const [topFilter, setTopFilter] = useState<'all' | 'device' | 'zone'>('all');
  // 여러 칩을 동시에 켤 수 있는 다중 선택 필터 — 빈 배열이면 "전체"와 같음
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<
    Array<'cctv' | 'light' | 'door' | 'stair' | 'hallway' | 'start'>
  >([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DeviceEditForm>(EMPTY_DEVICE_EDIT_FORM);
  const [nodeAddType, setNodeAddType] = useState<PlacingDeviceType>('cctv');
  // 유도등 추가 팝업의 갈림길 위치·좌우 통로 값 — 드롭다운뿐 아니라 캔버스 클릭으로도 채울 수
  // 있어야 해서(도면에서 직접 고르는 대안) 팝업 로컬 state가 아니라 여기서 관리함. 담당 CCTV는
  // 캔버스에서 고를 대상이 아니라 계속 팝업 로컬 state(lightCctvId)로 남아있음
  const [nodeAddLightFields, setNodeAddLightFields] = useState({
    decisionNodeId: '',
    leftEdgeId: '',
    rightEdgeId: '',
  });
  // 지금 "캔버스에서 선택" 모드가 걸려있는 대상 — 추가 팝업/수정 카드 중 어느 쪽의 어느
  // 필드인지 알아야 캔버스 클릭 결과를 올바른 곳에 반영할 수 있음
  const [lightPickTarget, setLightPickTarget] = useState<{
    source: 'add' | 'edit';
    field: 'decisionNode' | 'leftEdge' | 'rightEdge';
  } | null>(null);
  const [addedDevices, setAddedDevices] = useState<AddedDevice[]>([]);
  const [structureNodes, setStructureNodes] = useState<StructureNode[]>([]);

  // 최종 탈출구는 시나리오 재생에 필수인데(좌측 훈련 준비 카드 참고) 지정을 깜빡하기 쉬워서
  // 한 번은 눈에 띄게 토스트로 알려줌. 문/계단이 아직 하나도 없으면(설정 초반) 안 띄움 —
  // 그 경우는 체크리스트가 "문 추가하기"부터 안내하므로 아직 최종 탈출구를 물을 단계가 아님.
  // 층당 한 번만 뜨게 ref로 기억(재조회로 structureNodes가 여러 번 갱신돼도 반복 알림 방지)
  const finalExitWarnedFloorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!floorId || structureNodes.length === 0) return;
    if (finalExitWarnedFloorRef.current === floorId) return;
    const hasDoorOrStair = structureNodes.some((n) => n.type === 'door' || n.type === 'stair');
    const hasFinalExit = structureNodes.some((n) => n.isFinalExit);
    if (!hasDoorOrStair || hasFinalExit) return;
    finalExitWarnedFloorRef.current = floorId;
    show({
      title: '최종 탈출구가 지정되지 않았습니다.',
      description:
        '훈련 시나리오를 실행하려면 문/계단 카드에서 최종 탈출구를 하나 이상 지정해주세요.',
      variant: 'warning',
      duration: 8000,
    });
  }, [floorId, structureNodes, show]);

  const [graphNodes, setGraphNodes] = useState<MapNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<MapEdge[]>([]);
  const [iotLights, setIotLights] = useState<IoTLight[]>([]);
  const [editingCctvId, setEditingCctvId] = useState<string | null>(null);
  const [editingStructureId, setEditingStructureId] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneEditLabel, setZoneEditLabel] = useState('');
  const [nodeAddStage, setNodeAddStage] = useState<'entry' | 'fov'>('entry');
  // 그리드 설정 팝업은 CCTV 등록·구역 추가 흐름에서 공유해서 사용 —
  // 확인 버튼을 눌렀을 때 어느 쪽으로 돌아가야 하는지 구분하기 위한 값
  const [gridSetupPromptOpen, setGridSetupPromptOpen] = useState(false);
  const [gridSetupIntent, setGridSetupIntent] = useState<'cctv' | 'zone' | null>(null);
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

  // devicePositions는 드래그 중 화면에 즉시 반영하기 위한 임시 오버레이 — 실제 저장은
  // "완료"를 눌렀을 때(handleSaveEdit)만 일어나고, 그 전까지는 이 값만 갱신됨. 수정 모드를
  // 벗어나면(완료든 취소든) 렌더링 쪽에서 이 오버레이를 무시하고 원래 좌표로 되돌아감
  const handleDeviceMoved = (id: string, x: number, y: number) => {
    setDevicePositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  // CCTV/유도등 카드의 활성화 스위치 — 둘 다 enabled 필드와 활성화/비활성화 PATCH API 모양이
  // 같아서 한 핸들러에서 타입만 보고 갈라 처리함
  const handleToggleEnabled = (item: PanelItem) => {
    if (item.type === 'cctv') {
      const cctv = realCctvs.find((c) => c.id === item.id);
      if (!cctv) return;
      const enabled = !cctv.enabled;
      const request = enabled ? enableCctv : disableCctv;
      request(cctv.id)
        .then((updated) => {
          setRealCctvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          show({
            title: enabled ? 'CCTV를 활성화했습니다.' : 'CCTV를 비활성화했습니다.',
            variant: 'success',
          });
        })
        .catch(() => {
          show({ title: 'CCTV 활성화 여부 변경에 실패했습니다.', variant: 'error' });
        });
      return;
    }
    if (item.type === 'light') {
      const light = iotLights.find((l) => l.id === item.id);
      if (!light) return;
      const enabled = !light.enabled;
      const request = enabled ? enableIoTLight : disableIoTLight;
      request(light.id)
        .then((updated) => {
          setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          show({
            title: enabled ? '유도등을 활성화했습니다.' : '유도등을 비활성화했습니다.',
            variant: 'success',
          });
        })
        .catch(() => {
          show({ title: '유도등 활성화 여부 변경에 실패했습니다.', variant: 'error' });
        });
    }
  };

  const handleStartEditCctvCells = (item: PanelItem) => {
    const cctv = realCctvs.find((c) => c.id === item.id);
    if (!cctv) return;
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setEdgeAddOpen(false);
    setEditingCctvId(cctv.id);
    setCctvDraftCellIds(cctv.gridCells.map((c) => c.id));
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
                  zone: formatMonitoredZone(updated),
                }
              : d,
          ),
        );
        setEditingCctvId(null);
        setCctvDraftCellIds([]);
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

  // 장비 추가 팝업이 닫히면 배치 진행 상태 초기화
  useEffect(() => {
    if (!nodeAddOpen) {
      setNodeAddStage('entry');
      setNodeStagedPosition(null);
      setZoneDraftRect(null);
    }
  }, [nodeAddOpen]);

  // 구역 설정 팝업이 닫히면 드래그로 선택한 임시 영역/셀과 재설정 대상도 함께 초기화
  useEffect(() => {
    if (!zoneAddOpen) {
      setZoneDraftRect(null);
      setZoneDraftCellIds([]);
      setZoneResetTargetId(null);
    }
  }, [zoneAddOpen]);

  const currentBuilding = floorBuildings.find((b) => b.id === selectedBuildingId) ?? null;
  const currentFloor = currentBuilding?.floors.find((f) => f.id === selectedFloorId) ?? null;

  const handleFloorChange = (newId: string) => {
    setSelectedFloorId(newId);
    setSelectedItem(null);
    setDeleteConfirmTarget(null);
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
    position: { x: number; y: number },
    lightFields: LightAddFields,
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
            const { code: serverCode, message: serverMessage } = extractApiError(error);
            if (import.meta.env.DEV) {
              console.error(`[${cfg.label} 노드 추가 실패]`, serverCode, error);
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
                // 유도등의 "설치 위치"는 실제 좌표(x/y)로 표시하므로(formatInstallLocation) 여기
                // 값은 안 쓰임 — AddedDevice.zone 타입을 맞추기 위한 자리만 채움
                zone: '',
              },
            ]);

            // 담당 CCTV·가이던스는 handleSaveEdit(카드 수정)과 같은 방식으로, 값이 채워졌을
            // 때만 등록 직후 이어서 저장함 — 등록 시점에 판단 노드·엣지가 아직 없으면
            // 비워둔 채로 넘어가고 나중에 카드에서 채워도 됨
            const { decisionNodeId, leftEdgeId, rightEdgeId, cctvId } = lightFields;
            if (decisionNodeId && leftEdgeId && rightEdgeId) {
              configureLightGuidance(newLight.id, { decisionNodeId, leftEdgeId, rightEdgeId })
                .then((updated) =>
                  setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l))),
                )
                .catch((error: unknown) => {
                  const { message } = extractApiError(error);
                  show({ title: message || '경로 저장에 실패했습니다.', variant: 'error' });
                });
            }
            if (cctvId) {
              assignLightCctv(newLight.id, cctvId)
                .then((updated) =>
                  setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l))),
                )
                .catch((error: unknown) => {
                  const { message } = extractApiError(error);
                  show({ title: message || '담당 CCTV 배정에 실패했습니다.', variant: 'error' });
                });
            }
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
    setNodeAddLightFields({ decisionNodeId: '', leftEdgeId: '', rightEdgeId: '' });
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

  const openGridSetupPrompt = (intent: 'cctv' | 'zone') => {
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
  const handleSubmitNodeEntry = (
    type: PlacingDeviceType,
    deviceId: string,
    lightFields: LightAddFields,
  ) => {
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
    finalizeNodePlacement(type, deviceId, nodeStagedPosition, lightFields);
  };

  // 그리드설정/시야구역 단계에서 뒤로 — 입력 단계로 돌아가되 이미 지정한 위치는 유지
  const handleNodeAddBack = () => {
    setNodeAddStage('entry');
    setZoneDraftRect(null);
    setCctvDraftCellIds([]);
    lastCctvDraftRectRef.current = null;
  };

  // 팝업을 취소로 닫을 때도 다음 CCTV 등록 시도가 이전 드래그 영역을 이어받지 않게 비움.
  // 유도등 갈림길·좌우 통로 값과 캔버스 픽 모드도 다음 추가 시도에 남아있지 않게 같이 정리
  const handleCancelNodeAdd = () => {
    setNodeAddOpen(false);
    lastCctvDraftRectRef.current = null;
    setNodeAddLightFields({ decisionNodeId: '', leftEdgeId: '', rightEdgeId: '' });
    setLightPickTarget((prev) => (prev?.source === 'add' ? null : prev));
  };

  const handleGridSetupPromptCancel = () => {
    setGridSetupPromptOpen(false);
    if (gridSetupIntent === 'cctv') handleNodeAddBack();
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

  // 그리드 셀 드래그/클릭 선택은 CCTV 등록·CCTV 시야구역 재선택·구역 추가/수정 세 곳에서
  // 공유함 — 임시 선택값을 각자 다른 state(cctvDraftCellIds/zoneDraftCellIds)에 담아두고
  // 있어서 "지금 어느 쪽이 활성 상태인지"만 여기서 한 번 정하고 아래에서 그대로 씀
  const activeDraftCellIds = zoneAddOpen ? zoneDraftCellIds : cctvDraftCellIds;
  const setActiveDraftCellIds = zoneAddOpen ? setZoneDraftCellIds : setCctvDraftCellIds;

  const handleGridCellToggle = (cellId: string) => {
    setActiveDraftCellIds((prev) =>
      prev.includes(cellId) ? prev.filter((id) => id !== cellId) : [...prev, cellId],
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
    const x = clamp01(nodeStagedPosition.x / 100);
    const y = clamp01(nodeStagedPosition.y / 100);

    // 최초 시도·재시도 둘 다 여기로 옴 — 성공 처리를 한 곳에 모아 둠
    const handleCreated = (newCctv: Cctv) => {
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
          zone: formatMonitoredZone(newCctv),
        },
      ]);
      lastCctvDraftRectRef.current = null;
      setNodeAddStage('entry');
      setNodeStagedPosition(null);
      setZoneDraftRect(null);
      setCctvDraftCellIds([]);
      setNodeAddOpen(false);
    };

    createCctv({ floorId: currentFloor.id, name: label, x, y, gridCellIds: cctvDraftCellIds })
      .then(handleCreated)
      .catch((error: unknown) => {
        // HTTP 4xx는 AxiosError로, 200 + isSuccess:false는 ApiError로 올라오므로 둘 다 본다
        const { code: serverCode, message: serverMessage } = extractApiError(error);
        if (import.meta.env.DEV) {
          console.error('[CCTV 등록 실패]', serverCode, error);
        }
        // CCTV006 = 이 층에 그리드 배율(cellSizeMeter)이 설정 안 됨. AI 재분석 등으로 서버에서
        // 배율이 사라지는 경우가 있어 드물지 않게 재현됨(알려진 백엔드 이슈).
        // 아는 배율이 있으면 조용히 재적용하고, 방금 드래그했던 영역(rect)을 새 그리드 기준으로
        // 다시 계산해서 같은 자리로 한 번 더 등록을 시도한다 — 사용자가 다시 드래그하지 않아도
        // 대부분 이 자리에서 바로 완료됨("새로고침해야 반영된다"는 문제의 원인이었음).
        // rect가 없거나(드래그 없이 클릭만 한 경우 등) 재시도도 실패하면 그때만 다시 그려달라고 안내함
        if (serverCode === 'CCTV006' || /GridCell 크기|cellSizeMeter/i.test(serverMessage)) {
          const knownSize = readStoredNumber(GRID_SIZE_KEY(currentFloor.id));
          if (!knownSize) {
            setCctvDraftCellIds([]);
            openGridSetupPrompt('cctv');
            show({
              title:
                '이 층의 그리드 배율(m)을 먼저 설정해야 합니다. 설정 후 감시 구역을 다시 드래그해주세요.',
              variant: 'warning',
              duration: 7000,
            });
            return;
          }
          const draftRect = lastCctvDraftRectRef.current;
          setFloorGrid(currentFloor.id, knownSize)
            .then(() => getFloorGridCells(currentFloor.id))
            .then((refreshed) => {
              setFloorGridCells(refreshed);
              // gridCellPxSize는 재적용 전 floorGridCells 기준으로 계산된 memo라 그대로 쓰면
              // 안 됨 — 재생성된 그리드는 행·열 수가 달라질 수 있어(코드래빗 리뷰로 발견),
              // 새로 조회한 refreshed 기준으로 다시 계산해서 넘김
              const retryCellIds = draftRect
                ? cellIdsIntersectingRect(
                    refreshed,
                    draftRect,
                    getGridCellPxSize(refreshed, canvasH),
                    canvasH,
                  )
                : [];
              if (retryCellIds.length === 0) {
                setCctvDraftCellIds([]);
                show({
                  title: `그리드 배율(${knownSize}m)을 다시 적용했습니다. 감시 구역을 다시 드래그해주세요.`,
                  variant: 'warning',
                  duration: 7000,
                });
                return;
              }
              return createCctv({
                floorId: currentFloor.id,
                name: label,
                x,
                y,
                gridCellIds: retryCellIds,
              })
                .then(handleCreated)
                .catch(() => {
                  setCctvDraftCellIds([]);
                  show({
                    title: `그리드 배율(${knownSize}m)을 다시 적용했습니다. 감시 구역을 다시 드래그해주세요.`,
                    variant: 'warning',
                    duration: 7000,
                  });
                });
            })
            .catch(() => {
              setCctvDraftCellIds([]);
              openGridSetupPrompt('cctv');
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
    const isNewCctvSelecting = nodeAddOpen && nodeAddType === 'cctv' && nodeAddStage === 'fov';
    const cctvCellSelecting = isNewCctvSelecting || !!editingCctvId;
    if (cctvCellSelecting || zoneAddOpen) {
      if (rect && rect.w > 0 && rect.h > 0) {
        // 새 드래그가 이전 선택을 대체함(여러 번 드래그해도 마지막 것만 유효). 미세 조정은 셀 클릭 토글로
        setActiveDraftCellIds(
          cellIdsIntersectingRect(floorGridCells, rect, gridCellPxSize, canvasH),
        );
        // 신규 CCTV 등록 흐름일 때만 rect를 별도 보관 — 그리드 배율이 서버에서 사라져있어
        // 등록이 실패하면(CCTV006) 이 rect로 같은 영역을 다시 계산해 재시도함
        if (isNewCctvSelecting) lastCctvDraftRectRef.current = rect;
      }
      setZoneDraftRect(null);
    }
  };

  // 최종 탈출구 지정은 계단에서만 가능 — 서버에도 저장(실패 시 롤백).
  // 경로 탐색기(GET /sessions/{id}/current-route)는 type === 'EXIT'인 노드만 대피 목적지로
  // 인식함(EVAC005 "도달 가능한 EXIT 노드가 없습니다") — isExitTarget 플래그만으론 안 잡히므로
  // 지정 시 노드 타입을 EXIT로 승격하고, 해제 시 원래 구조 타입(STAIR)으로 되돌린다.
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
      type: nextIsFinalExit ? 'EXIT' : STRUCTURE_NODE_API_TYPE[node.type],
      isExitTarget: nextIsFinalExit,
    }).catch((error: unknown) => {
      setStructureNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isFinalExit: !nextIsFinalExit } : n)),
      );
      // 마지막 남은 탈출구는 해제할 수 없는 등 서버가 이유를 message로 내려주므로 그대로 보여줌
      const { message: serverMessage } = extractApiError(error);
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
    // 엣지를 선택해둔 채로 다른 노드·구역을 고르면 엣지 강조가 그대로 남아있던 문제 —
    // 포커스는 하나만 유지되게 함
    setSelectedEdgeId(null);
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
    // 문/계단 노드면 해당 하위 칩으로 이동(다른 칩은 정리), 그 외(방·복도 등)는 하위 필터 해제
    const structureType = structureNodes.find((n) => n.id === ref.id)?.type;
    setDeviceTypeFilter(
      structureType === 'door' || structureType === 'stair' ? [structureType] : [],
    );
  };

  // 드래그 중 미리보기용 — API 호출은 드래그가 끝났을 때(handleStructureNodeMoveEnd)만
  const handleStructureNodeMove = (id: string, x: number, y: number) => {
    setStructureNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const handleStructureNodeMoveEnd = (id: string, x: number, y: number) => {
    updateMapNodePosition(id, { x: x / CANVAS_W, y: y / canvasH }).catch((error: unknown) => {
      const { message } = extractApiError(error);
      show({ title: message || '위치 저장에 실패했습니다.', variant: 'error' });
    });
  };

  const handleStructureNodeDelete = (id: string) => {
    deleteMapNode(id)
      .then(() => {
        setStructureNodes((prev) => prev.filter((n) => n.id !== id));
        // 서버는 이 노드에 붙은 엣지까지 cascade 삭제하므로 로컬 엣지도 같이 정리
        setGraphEdges((prev) =>
          prev.filter((edge) => edge.fromNodeId !== id && edge.toNodeId !== id),
        );
        setEditingStructureId((prev) => (prev === id ? null : prev));
      })
      .catch((error: unknown) => {
        // 유도등 판단 노드로 참조 중이거나 마지막 탈출구인 경우 등 서버가 이유를 message로 내려줌
        const { message: serverMessage } = extractApiError(error);
        show({
          title: serverMessage || '노드 삭제에 실패했습니다.',
          variant: 'error',
        });
      });
  };

  // 노드 id로 표시용 라벨 조회 (구조 노드 + 그 외 그래프 노드 통합) — 같은 종류(예: 복도)가
  // 여러 개면 전부 "복도"로만 보여서 유도등 판단 노드·경로 엣지를 고를 때 뭐가 뭔지 구분이
  // 안 되던 문제(QA 피드백) — 우측 패널 카드와 같은 규칙("복도 1", "복도 2"...)으로 번호를
  // 붙여서, 패널에서 본 번호와 드롭다운 번호가 그대로 대응되게 함
  const getGraphNodeLabel = (id: string): string => {
    const structureNode = structureNodes.find((n) => n.id === id);
    if (structureNode) {
      const sameTypeIndex = structureNodes
        .filter((n) => n.type === structureNode.type)
        .findIndex((n) => n.id === structureNode.id);
      return `${STRUCTURE_NODE_LABEL[structureNode.type]} ${sameTypeIndex + 1}`;
    }
    const graphNode = graphNodes.find((n) => n.id === id);
    return graphNode?.name ?? id;
  };

  // 클릭한 순서대로 경로에 노드를 쌓음 — 같은 노드를 연속으로 눌러도 무시(실수로 두 번 클릭)
  // 방금 고른 노드를 실수로 다시 클릭했을 수 있으니, 마지막 노드를 다시 누르면 추가하는 대신
  // 선택을 취소함(경로 맨 끝을 한 단계 되돌리는 것과 같음)
  const handleEdgeNodeClick = (nodeId: string) => {
    setEdgeChainNodeIds((prev) =>
      prev[prev.length - 1] === nodeId ? prev.slice(0, -1) : [...prev, nodeId],
    );
  };

  const handleClearEdgeChain = () => {
    setEdgeChainNodeIds([]);
  };

  // 엣지 연결 모드 종료
  const handleExitEdgeMode = () => {
    setEdgeChainNodeIds([]);
    setEdgeChainReviewOpen(false);
    setEdgeAddOpen(false);
  };

  // 두 노드 사이 거리(m) 추정 — 정규화 좌표(0~1) 차이를 칸 수로 환산한 뒤 그리드 배율(m/칸)을
  // 곱한다. 배율(GRID_SIZE_KEY→PENDING→등록된 CCTV 순으로 탐색)이나 그리드 정보가 없으면 null이라
  // 검토 화면에서 그 구간만 수동 입력으로 폴백한다.
  const estimateEdgeDistanceM = (fromId: string, toId: string): number | null => {
    if (!currentFloor) return null;
    const cellSizeMeter =
      readStoredNumber(GRID_SIZE_KEY(currentFloor.id)) ??
      readStoredNumber(PENDING_GRID_SIZE_KEY(currentFloor.id)) ??
      realCctvs.find((c) => c.floorId === currentFloor.id && c.gridCellSizeMeter)
        ?.gridCellSizeMeter ??
      null;
    if (!cellSizeMeter) return null;
    const { cols, rows } = getGridDimensions(floorGridCells);
    if (!cols || !rows) return null;
    const normalizedPos = (id: string): { x: number; y: number } | null => {
      const structure = structureNodes.find((n) => n.id === id);
      if (structure) return { x: structure.x / CANVAS_W, y: structure.y / canvasH };
      const graphNode = graphNodes.find((n) => n.id === id);
      return graphNode ? { x: graphNode.x, y: graphNode.y } : null;
    };
    const from = normalizedPos(fromId);
    const to = normalizedPos(toId);
    if (!from || !to) return null;
    const meters = Math.hypot((from.x - to.x) * cols, (from.y - to.y) * rows) * cellSizeMeter;
    return Math.max(0.1, Math.round(meters * 10) / 10);
  };

  // 클릭한 순서(A→B→C→D)를 연속 구간(A-B, B-C, C-D)으로 풀어 검토 화면에 넘길 목록을 만듦
  const edgeChainSegments = edgeChainNodeIds.slice(0, -1).map((fromId, i) => {
    const toId = edgeChainNodeIds[i + 1];
    return {
      fromId,
      toId,
      fromLabel: getGraphNodeLabel(fromId),
      toLabel: getGraphNodeLabel(toId),
      suggestedDistanceM: estimateEdgeDistanceM(fromId, toId),
      // 다른 경로를 잇다 겹친 구간 — 이미 있는 엣지라 다시 만들 필요가 없어서 검토 화면에서
      // 자동으로 제외함(사용자가 일일이 안 겹치게 클릭할 필요 없게)
      alreadyExists: hasExistingEdge(graphEdges, fromId, toId),
    };
  });

  const handleProceedToEdgeChainReview = () => {
    if (edgeChainNodeIds.length < 2) return;
    setEdgeChainReviewOpen(true);
  };

  const handleBackFromEdgeChainReview = () => {
    setEdgeChainReviewOpen(false);
  };

  // 검토 화면에서 확정한 구간들을 한 번에 생성 — 일부만 실패해도 성공한 구간은 반영하고
  // 실패한 개수·사유만 토스트로 알림(하나 실패했다고 나머지까지 날아가면 안 됨)
  const handleSubmitEdgeChain = (
    rows: {
      fromId: string;
      toId: string;
      fromLabel: string;
      toLabel: string;
      distanceM: number;
      bidirectional: boolean;
    }[],
  ) => {
    Promise.allSettled(
      rows.map((row) =>
        createMapEdge({
          fromNodeId: row.fromId,
          toNodeId: row.toId,
          distance: row.distanceM,
          bidirectional: row.bidirectional,
        }),
      ),
    ).then((results) => {
      const succeeded: MapEdge[] = [];
      // 실패한 구간의 라벨을 같이 모아둠 — 전체 실패 개수만 알려주면 어느 구간이 안 됐는지
      // 몰라서 성공한 구간까지 처음부터 다시 골라야 했던 문제
      const failedLabels: string[] = [];
      let firstErrorMessage: string | undefined;
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          succeeded.push(result.value);
        } else {
          failedLabels.push(`${rows[i].fromLabel} → ${rows[i].toLabel}`);
          firstErrorMessage ??= extractApiError(result.reason).message;
        }
      });
      if (succeeded.length > 0) {
        setGraphEdges((prev) => [...prev, ...succeeded]);
        show({ title: `${succeeded.length}개 구간이 연결되었습니다.`, variant: 'success' });
      }
      if (failedLabels.length > 0) {
        show({
          title: `${failedLabels.length}개 구간 연결에 실패했습니다.${
            firstErrorMessage ? ` (${firstErrorMessage})` : ''
          }`,
          description: failedLabels.join(', '),
          variant: 'error',
        });
      }
      // 경로 하나를 확정하면 모드도 함께 종료 — 이어서 계속 뜨면 "안 끝난다"는 인상을 줌.
      // 다른 경로를 더 잇고 싶으면 "엣지 연결"을 다시 열면 되고, 그때는 방금 만든 구간이
      // graphEdges에 반영돼 있어 중복 클릭도 곧바로 감지됨
      setEdgeChainNodeIds([]);
      setEdgeChainReviewOpen(false);
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

  // 카드 수정은 한 번에 하나만 — 다른 종류의 카드를 수정 중이었다면 여기서 정리함
  const handleStartEditStructure = (id: string) => {
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setEditingItemId(null);
    setEditingZoneId(null);
    handleCancelEditCctvCells();
    setEditingStructureId((prev) => (prev === id ? null : id));
  };

  // "수정"을 누르면 이름 입력뿐 아니라 도면 그리드 셀 선택도 바로 켬 — 재설정을 위해 별도
  // 버튼·팝업을 한 번 더 거치게 했더니 클릭이 너무 많다는 피드백으로, CCTV 감시영역과 같은
  // 결로 통일함(수정 중엔 도면을 드래그하면 바로 영역이 다시 잡힘)
  const handleStartEditZone = (zone: ZoneEntry) => {
    setEditingItemId(null);
    setEditingStructureId(null);
    handleCancelEditCctvCells();
    setZoneResetTargetId(zone.id);
    setZoneDraftCellIds(zone.cellIds);
    setZoneAddOpen(true);
    setEditingZoneId(zone.id);
    setZoneEditLabel(zone.label);
  };

  // 이름 수정 API가 아직 없어서 로컬에만 반영됨 — 새로고침하면 원래 이름으로 돌아감
  const handleSaveZoneLabel = (id: string) => {
    const trimmed = zoneEditLabel.trim();
    if (zoneResetTargetId === id) {
      const original = zones.find((z) => z.id === id);
      const cellsChanged =
        !original ||
        original.cellIds.length !== zoneDraftCellIds.length ||
        !original.cellIds.every((c) => zoneDraftCellIds.includes(c));
      const nameChanged = !!trimmed && !!original && trimmed !== original.label;
      // 아무것도 안 바꿨으면(이름도 그대로, 도면도 안 건드림) 굳이 삭제→생성을 왕복하지 않고
      // 그냥 수정 모드만 닫음
      if (!cellsChanged && !nameChanged) {
        setZoneAddOpen(false);
        setZoneDraftCellIds([]);
        setZoneResetTargetId(null);
        setEditingZoneId(null);
        return;
      }
      if (trimmed) handleConfirmZoneReset(trimmed);
      return;
    }
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

  // 구역은 PATCH가 없어(스웨거 확인) 새로 만들고 기존 걸 지우는 방식으로 "재설정"함 —
  // handleStartEditZone이 이미 zoneDraftCellIds를 기존 셀로 채워두고 도면 드래그를 켜뒀으므로
  // 여기서는 그 결과(zoneDraftCellIds)를 그대로 저장만 함
  const handleConfirmZoneReset = (label: string) => {
    if (!currentFloor || !zoneResetTargetId || zoneDraftCellIds.length === 0) return;
    const targetId = zoneResetTargetId;
    const nextCellIds = zoneDraftCellIds;
    const floorId = currentFloor.id;
    // 삭제 전 원본을 남겨둠 — 삭제는 됐는데 생성만 실패했을 때 원래 이름·셀로 한 번 더
    // 만들어보는 복구 시도에 씀(코드래빗 리뷰 반영: 복구 시도 없이 그냥 지워지기만 하면
    // 사용자가 셀 목록을 기억해서 손으로 다시 만들어야 함)
    const original = zones.find((z) => z.id === targetId);
    // 스웨거 확인 결과 구역 이름은 같은 층 안에서 유일해야 함 — 이름을 그대로 두고
    // 셀만 재설정하는 흔한 경우, 기존 구역을 먼저 안 지우면 "이름 중복"으로 새 구역
    // 생성이 거부됨(재설정할 때마다 매번 실패하던 원인). 그래서 삭제 → 생성 순서로 감:
    // 셀 겹침은 스웨거상 문제없음(기존 구역에서 자동으로 빠짐)이라 안전하지만, 생성이
    // 실패하면 기존 구역은 이미 사라진 상태로 남는 트레이드오프가 있음 — 아래에서 그 경우도 처리함
    let deleted = false;
    deleteUserZone(floorId, targetId)
      .then(() => {
        deleted = true;
        return createUserZone(floorId, { name: label, cellIds: nextCellIds });
      })
      .then((zone) => {
        setZones((prev) => [
          ...prev.filter((z) => z.id !== targetId),
          { id: zone.id, type: 'general', label: zone.name, cellIds: nextCellIds },
        ]);
        if (selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === targetId) {
          setSelectedZoneRef(null);
        }
        setZoneAddOpen(false);
        setZoneDraftCellIds([]);
        setEditingZoneId(null);
        show({ title: '구역을 다시 설정했습니다.', variant: 'success' });
      })
      .catch((error: unknown) => {
        const { message } = extractApiError(error);
        if (!deleted) {
          show({ title: message || '구역 재설정에 실패했습니다.', variant: 'error' });
          return;
        }
        if (!original) {
          // 원본 정보가 없으면(이론상 거의 없음) 복구를 시도할 수 없음 — 기존 안내로 대체
          setZones((prev) => prev.filter((z) => z.id !== targetId));
          show({
            title:
              message || '기존 구역은 삭제됐지만 새 구역 생성에 실패했습니다. 다시 만들어주세요.',
            variant: 'error',
            duration: 10000,
          });
          return;
        }
        // 삭제는 됐는데 새 구역 생성만 실패 — 원래 이름·셀로 한 번 더 복구를 시도해서
        // 실패 범위를 줄임(이름만 바꾸는 흔한 경우 특히 유효)
        createUserZone(floorId, { name: original.label, cellIds: original.cellIds })
          .then((restored) => {
            setZones((prev) => [
              ...prev.filter((z) => z.id !== targetId),
              {
                id: restored.id,
                type: 'general',
                label: original.label,
                cellIds: original.cellIds,
              },
            ]);
            show({
              title: message || '구역 재설정에 실패해 이전 상태로 되돌렸습니다.',
              variant: 'error',
              duration: 10000,
            });
          })
          .catch(() => {
            // 복구 재시도까지 실패한 경우에만 진짜로 사라짐 — 목록에서 지우고 명확히 알림
            setZones((prev) => prev.filter((z) => z.id !== targetId));
            show({
              title: '기존 구역이 삭제됐고 복구에도 실패했습니다. 구역을 다시 만들어주세요.',
              variant: 'error',
              duration: 10000,
            });
          });
      });
  };

  // 구역 추가 버튼 — 그리드가 있어야 셀을 선택할 수 있어서, 없으면 설정 팝업부터 띄움
  const handleToggleZoneAdd = () => {
    setNodeAddOpen(false);
    if (zoneAddOpen) {
      setZoneAddOpen(false);
      return;
    }
    setZoneResetTargetId(null);
    ensureFloorGridCells().then((cells) => {
      if (cells.length > 0) {
        setZoneAddOpen(true);
        return;
      }
      openGridSetupPrompt('zone');
    });
  };

  // 툴바 "+ 추가" 메뉴·훈련 준비 체크리스트가 같이 쓰는 진입점 — 다른 배치 모드를 정리하고 엶.
  // presetType을 주면 노드 종류 칩까지 미리 골라둠(예: 체크리스트의 "시작 노드 지정하기")
  const handleOpenNodeAdd = (presetType?: PlacingDeviceType) => {
    setZoneAddOpen(false);
    if (presetType) setNodeAddType(presetType);
    setNodeAddOpen(true);
    // 새로 여는 등록 흐름은 이전 시도의 드래그 영역과 무관해야 함
    lastCctvDraftRectRef.current = null;
  };

  const handleOpenEdgeAdd = () => {
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setSelectedEdgeId(null);
    setEdgeAddOpen(true);
    setEdgeChainNodeIds([]);
    setEdgeChainReviewOpen(false);
  };

  // 추가/편집 모드는 이제 바깥 클릭으로 안 닫히므로(캔버스가 아닌 다른 영역을 눌러도 진행
  // 중인 폼이 사라지지 않게 하기 위함), 마우스 없이도 빠져나갈 수 있도록 Esc로 지금 열려 있는
  // 모드 하나를 명시적으로 종료함. 이 모드들은 서로 배타적으로 열리므로 우선순위만 정해두면 됨
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (gridSetupPromptOpen) {
        // handleGridSetupPromptCancel과 같은 동작 — 매 렌더마다 새로 만들어지는 함수라
        // 의존성 배열에 넣으면 리스너가 렌더마다 재구독되므로 여기선 로직만 그대로 옮겨 씀
        setGridSetupPromptOpen(false);
        if (gridSetupIntent === 'cctv') {
          setNodeAddStage('entry');
          setZoneDraftRect(null);
          setCctvDraftCellIds([]);
          lastCctvDraftRectRef.current = null;
        }
        setGridSetupIntent(null);
      } else if (editingCctvId) {
        handleCancelEditCctvCells();
      } else if (edgeChainReviewOpen) {
        // 검토 화면에서는 모드 전체를 나가지 말고 경로 편집으로 한 단계만 되돌아감
        setEdgeChainReviewOpen(false);
      } else if (edgeAddOpen) {
        handleExitEdgeMode();
      } else if (zoneAddOpen) {
        setZoneAddOpen(false);
      } else if (nodeAddOpen) {
        handleCancelNodeAdd();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    gridSetupPromptOpen,
    gridSetupIntent,
    editingCctvId,
    edgeChainReviewOpen,
    edgeAddOpen,
    zoneAddOpen,
    nodeAddOpen,
  ]);

  // 시작 후보 중 하나라도 엣지를 따라 최종 탈출구까지 이어지는지 (훈련 준비 체크리스트용).
  // 이 경로가 없으면 경로 탐색기가 EVAC005("도달 가능한 EXIT 노드가 없습니다")로 실패함 —
  // 시작 노드가 그래프에 아예 연결 안 돼 있어도 여기서 걸림. graphEdges + structureNodes로 BFS.
  const hasRouteFromStartToExit = useMemo(() => {
    const startNodes = structureNodes.filter((n) => n.type === 'start');
    const exitIds = new Set(structureNodes.filter((n) => n.isFinalExit).map((n) => n.id));
    if (startNodes.length === 0 || exitIds.size === 0) return false;

    const adjacency = new Map<string, string[]>();
    const link = (from: string, to: string) => {
      const list = adjacency.get(from);
      if (list) list.push(to);
      else adjacency.set(from, [to]);
    };
    for (const edge of graphEdges) {
      link(edge.fromNodeId, edge.toNodeId);
      if (edge.bidirectional) link(edge.toNodeId, edge.fromNodeId);
    }

    return startNodes.some((start) => {
      const visited = new Set([start.id]);
      const queue = [start.id];
      while (queue.length > 0) {
        const current = queue.shift() as string;
        if (exitIds.has(current)) return true;
        for (const next of adjacency.get(current) ?? []) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        }
      }
      return false;
    });
  }, [structureNodes, graphEdges]);

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
            {/* 최종 탈출구는 계단에서만 지정 — 문/출입구는 층 내부 통로라 제외 */}
            {n.type === 'stair' && (
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
                aria-label="구역 이름"
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
        {/* 감시 영역(CCTV 카드)과 같은 자리·같은 모양 — 수정 중이 아닐 때도 정보를 보여줘서
            수정 모드로 들어갈 때 카드 규격이 갑자기 늘어나 보이지 않게 함. 수정을 누르면 바로
            도면 드래그가 켜지므로(handleStartEditZone) 별도 "재설정" 버튼 없이 여기는
            지금 고른 칸 수만 실시간으로 보여줌 */}
        <div
          className={styles.deviceCardRow}
          title={isEditing ? '도면에서 칸을 클릭하거나 드래그하면 영역이 바로 바뀌어요' : undefined}
        >
          <span className={styles.deviceCardKey}>구역 범위</span>
          {isEditing ? (
            <span className={styles.deviceCardValue}>{zoneDraftCellIds.length}칸</span>
          ) : (
            <span className={styles.deviceCardValue}>{z.cellIds.length}칸</span>
          )}
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
        zone: formatInstallLocation(deviceTypeToPlaceType(d.type), d.x, d.y, d.zone),
        source: 'floor' as const,
      })),
      // 상태는 실제 CCTV/유도등의 enabled를 따라감 — 예전엔 '실시간'으로 고정돼 있어서
      // 사용 불가로 바꿔도 카드에 반영되지 않았음
      ...addedDevices.map((d) => {
        const matchedCctv = realCctvs.find((c) => c.id === d.id);
        const matchedLight = iotLights.find((l) => l.id === d.id);
        const enabled = matchedCctv?.enabled ?? matchedLight?.enabled ?? true;
        return {
          id: d.id,
          kind: 'device' as const,
          type: d.placeType,
          label: d.label,
          statusText: enabled ? '활성화' : '비활성화',
          statusOnline: enabled,
          zone: formatInstallLocation(d.placeType, d.x, d.y, d.zone),
          source: 'added' as const,
          monitoredArea: matchedCctv
            ? { cellCount: matchedCctv.monitoredGridCellCount, areaM2: matchedCctv.monitoredAreaM2 }
            : undefined,
          code: matchedCctv?.code ?? matchedLight?.code,
          cctvName: matchedLight?.cctvId
            ? (realCctvs.find((c) => c.id === matchedLight.cctvId)?.name ?? '알 수 없는 CCTV')
            : undefined,
          guidanceConfigured: matchedLight?.guidanceConfigured,
        };
      }),
    ],
    [floor?.devices, addedDevices, realCctvs, iotLights],
  );

  const panelItems = useMemo(
    () =>
      allPanelItems.filter(
        (item) => deviceTypeFilter.length === 0 || deviceTypeFilter.some((t) => t === item.type),
      ),
    [allPanelItems, deviceTypeFilter],
  );

  const visibleStructureNodes = useMemo(
    () =>
      structureNodes.filter(
        (n) => deviceTypeFilter.length === 0 || deviceTypeFilter.some((t) => t === n.type),
      ),
    [structureNodes, deviceTypeFilter],
  );

  // 유도등 설정 모달의 판단 노드/엣지 드롭다운 목록 — getGraphNodeLabel과 같은 번호 규칙을
  // 쓰도록 그 함수를 그대로 재사용함(따로 STRUCTURE_NODE_LABEL만 가져다 쓰면 번호가 안 붙어
  // 같은 종류 노드가 여러 개일 때 다시 구분이 안 되는 문제로 되돌아감)
  const lightNodeOptions = useMemo(
    () => [
      ...structureNodes.map((n) => ({ id: n.id, label: getGraphNodeLabel(n.id) })),
      ...graphNodes.map((n) => ({ id: n.id, label: n.name })),
    ],
    // getGraphNodeLabel은 structureNodes/graphNodes를 참조하는 클로저라 그 둘을 대신 의존성으로 둠
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [structureNodes, graphNodes],
  );
  // fromNodeId/toNodeId도 같이 내려줌 — 판단 노드에 실제로 연결된 엣지만 좌/우 후보로 걸러내는 데 씀
  // (판단 노드와 무관한 엣지를 골라도 UI는 막지 않고 저장 시점에야 서버가 거부해서 헷갈리던 문제)
  const lightEdgeOptions = useMemo(
    () =>
      graphEdges.map((edge) => ({
        id: edge.id,
        label: `${getGraphNodeLabel(edge.fromNodeId)} → ${getGraphNodeLabel(edge.toNodeId)} (${edge.distance}m)`,
        fromNodeId: edge.fromNodeId,
        toNodeId: edge.toNodeId,
      })),
    // getGraphNodeLabel은 structureNodes/graphNodes를 참조하는 클로저라 그 둘을 대신 의존성으로 둠
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphEdges, structureNodes, graphNodes],
  );
  // 담당 CCTV 배정 드롭다운 목록 — realCctvs는 이미 이 층 floorId로만 조회됨
  const lightCctvOptions = useMemo(
    () => realCctvs.map((c) => ({ id: c.id, label: c.code ? `${c.name} (${c.code})` : c.name })),
    [realCctvs],
  );

  // 장비 카드 "완료" 버튼 — 실제로 바뀐 값이 있을 때만 눌리게. handleSaveEdit의
  // guidanceChanged 판정과 같은 기준(원본 값과 폼 값 비교)을 여기서도 씀
  const editingPanelItem = editingItemId
    ? allPanelItems.find((item) => item.id === editingItemId)
    : undefined;
  const editingLight =
    editingPanelItem?.type === 'light' ? iotLights.find((l) => l.id === editingItemId) : undefined;
  const isDeviceEditFormDirty = editingPanelItem
    ? editForm.label !== editingPanelItem.label ||
      editForm.decisionNodeId !== (editingLight?.decisionNodeId ?? '') ||
      editForm.leftEdgeId !== (editingLight?.leftEdgeId ?? '') ||
      editForm.rightEdgeId !== (editingLight?.rightEdgeId ?? '') ||
      editForm.cctvId !== (editingLight?.cctvId ?? '') ||
      // 위치 드래그도 완료를 눌러야 확정되므로, 옮긴 좌표가 스테이징돼 있으면 그것만으로도
      // "바뀐 값이 있다"고 봄(devicePositions[id]는 handleStartEdit이 매 세션 시작마다 지움)
      (!!editingItemId && editingItemId in devicePositions)
    : false;

  // 캔버스에 비출 유도등 갈림길·좌우 통로 미리보기 — 추가 팝업이 열려있으면 그 값을, 유도등을
  // 수정 중이면 수정 폼 값을 보여줌(둘 다 아니면 null이라 캔버스에 강조가 안 남음)
  const lightPreviewSource =
    nodeAddOpen && nodeAddType === 'light'
      ? nodeAddLightFields
      : editingPanelItem?.type === 'light'
        ? editForm
        : null;

  // "캔버스에서 선택" — 드롭다운에 같은 이름 노드가 많아 고르기 혼란스럽다는 피드백으로,
  // 도면에서 직접 클릭해 갈림길 위치·좌우 통로를 지정하는 대안 제공. 추가 팝업/수정 카드
  // 중 어느 쪽이 지금 열려있는지에 따라 그쪽의 픽 모드만 캔버스에 반영함
  const currentLightPickField =
    nodeAddOpen && nodeAddType === 'light'
      ? lightPickTarget?.source === 'add'
        ? lightPickTarget.field
        : null
      : editingPanelItem?.type === 'light'
        ? lightPickTarget?.source === 'edit'
          ? lightPickTarget.field
          : null
        : null;

  // 클릭 결과를 올바른 곳(추가 팝업 vs 수정 카드)에 반영하려면 시작한 소스를 같이 들고 있어야 함
  const handleStartLightPick = (
    source: 'add' | 'edit',
    field: 'decisionNode' | 'leftEdge' | 'rightEdge',
  ) => {
    setLightPickTarget((prev) =>
      prev?.source === source && prev.field === field ? null : { source, field },
    );
  };

  // MockFloorMap3F가 픽 모드에서 유효한(연결된) 노드·엣지만 클릭 가능하게 걸러주므로, 여기서는
  // 넘어온 id를 그대로 해당 대상의 값으로 반영하면 됨
  const handleLightCanvasPick = (id: string) => {
    if (!lightPickTarget) return;
    const { source, field } = lightPickTarget;
    if (source === 'add') {
      setNodeAddLightFields((prev) =>
        field === 'decisionNode'
          ? { decisionNodeId: id, leftEdgeId: '', rightEdgeId: '' }
          : field === 'leftEdge'
            ? { ...prev, leftEdgeId: id }
            : { ...prev, rightEdgeId: id },
      );
    } else {
      setEditForm((prev) =>
        field === 'decisionNode'
          ? { ...prev, decisionNodeId: id, leftEdgeId: '', rightEdgeId: '' }
          : field === 'leftEdge'
            ? { ...prev, leftEdgeId: id }
            : { ...prev, rightEdgeId: id },
      );
    }
    setLightPickTarget(null);
  };

  const nodeAddLightPickField = lightPickTarget?.source === 'add' ? lightPickTarget.field : null;
  const editLightPickField = lightPickTarget?.source === 'edit' ? lightPickTarget.field : null;

  const gridCellPxSize = useMemo(
    () => getGridCellPxSize(floorGridCells, canvasH),
    [floorGridCells, canvasH],
  );

  // 그리드는 더 이상 토글로 껐다 켰다 하지 않고, 선택/조회 중이 아니면 항상 표시함
  // (floorGridCells가 비어 있으면 어차피 그릴 게 없어서 실질적으로 아무것도 안 보임)
  const cctvGridCellsMode: 'selecting' | 'viewing' | 'browsing' =
    (nodeAddOpen && nodeAddType === 'cctv' && nodeAddStage === 'fov') ||
    editingCctvId ||
    zoneAddOpen
      ? 'selecting'
      : selectedItem?.kind === 'device' && realCctvs.some((c) => c.id === selectedItem.data.id)
        ? 'viewing'
        : 'browsing';

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
    // 카드 수정은 한 번에 하나만 — 다른 카드 종류의 수정이나 CCTV 감시영역 재선택이
    // 남아있으면 여기서 정리함
    setEditingStructureId(null);
    setEditingZoneId(null);
    if (zoneAddOpen) setZoneAddOpen(false);
    if (editingCctvId && editingCctvId !== item.id) handleCancelEditCctvCells();
    if (selectedItem?.kind !== 'device' || selectedItem.data.id !== item.id) {
      handlePanelItemSelect(item);
    }
    // 유도등은 예전 설정 모달에 있던 필드까지 이 폼에 같이 채워서, 카드 하나에서 전부 편집함
    const light = item.type === 'light' ? iotLights.find((l) => l.id === item.id) : undefined;
    setEditForm({
      label: item.label,
      decisionNodeId: light?.decisionNodeId ?? '',
      leftEdgeId: light?.leftEdgeId ?? '',
      rightEdgeId: light?.rightEdgeId ?? '',
      cctvId: light?.cctvId ?? '',
    });
    // 이전에 드래그했다가 완료를 안 누르고 나간 세션의 스테이징 값이 남아있으면 이번에
    // 새로 안 옮겨도 그 값이 그대로 보여서 위치가 잘못 표시될 수 있음 — 새 수정 세션은
    // 항상 실제 저장된 좌표에서 다시 시작하게 정리함
    setDevicePositions((prev) => {
      if (!(item.id in prev)) return prev;
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    setEditingItemId(item.id);
  };

  const handleSaveEdit = (item: PanelItem) => {
    // 감시영역 재선택 중에 카드 완료를 눌러도 재선택 팝업이 안 닫히던 문제 — 완료는
    // 재선택까지 함께 정리함(재선택 자체는 저장하지 않은 채로 취소됨)
    if (editingCctvId === item.id) handleCancelEditCctvCells();
    const newLabel = editForm.label;
    if (item.source === 'floor') {
      setFloor((prev) =>
        prev
          ? {
              ...prev,
              devices: prev.devices.map((d) => (d.id === item.id ? { ...d, label: newLabel } : d)),
            }
          : prev,
      );
    } else if (item.source === 'added') {
      const prevDevice = addedDevices.find((d) => d.id === item.id);
      // 위치 드래그도 "완료"를 눌러야 확정되도록 함 — 이번 수정 세션에서 실제로 옮겼으면
      // devicePositions에 그 좌표가 스테이징돼 있고(없으면 안 옮긴 것이므로 기존 좌표 그대로)
      const stagedPos = devicePositions[item.id];
      const finalX = stagedPos?.x ?? prevDevice?.x ?? 0;
      const finalY = stagedPos?.y ?? prevDevice?.y ?? 0;
      setAddedDevices((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, label: newLabel, x: finalX, y: finalY } : d)),
      );
      // 실패하면 방금 낙관적으로 바꾼 이름·위치를 원래대로 되돌림 — 안 그러면 저장 안 됐는데 화면엔 새 값이 남음
      const rollback = () => {
        if (prevDevice)
          setAddedDevices((prev) => prev.map((d) => (d.id === item.id ? prevDevice : d)));
      };
      if (item.type === 'light' && prevDevice) {
        const prevLight = iotLights.find((l) => l.id === item.id);
        updateIoTLight(item.id, {
          name: newLabel,
          x: finalX / 100,
          y: finalY / 100,
        }).catch(() => {
          rollback();
          show({ title: '유도등 정보 수정에 실패했습니다.', variant: 'error' });
        });

        // 가이던스·담당 CCTV는 예전 설정 모달의 "저장" 버튼들이 하던 일을 그대로 옮긴 것 —
        // 바뀐 값이 있을 때만, 각자 독립된 PATCH로 보냄. Pi 엔드포인트는 스웨거 확인 결과
        // "참고용 메타데이터일 뿐 실제 명령 전달 경로에는 쓰이지 않는다"고 명시되어 있어
        // 카드에서 뺌(연동에 필요한 값이 아님) — 필요해지면 api/iotLightsApi.ts의
        // updateLightPiEndpoint를 그대로 다시 쓰면 됨
        const { decisionNodeId, leftEdgeId, rightEdgeId } = editForm;
        const guidanceChanged =
          decisionNodeId !== (prevLight?.decisionNodeId ?? '') ||
          leftEdgeId !== (prevLight?.leftEdgeId ?? '') ||
          rightEdgeId !== (prevLight?.rightEdgeId ?? '');
        if (decisionNodeId && leftEdgeId && rightEdgeId && guidanceChanged) {
          configureLightGuidance(item.id, { decisionNodeId, leftEdgeId, rightEdgeId })
            .then((updated) =>
              setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l))),
            )
            .catch((error: unknown) => {
              const { message } = extractApiError(error);
              show({ title: message || '경로 저장에 실패했습니다.', variant: 'error' });
            });
        }

        if (editForm.cctvId && editForm.cctvId !== (prevLight?.cctvId ?? '')) {
          assignLightCctv(item.id, editForm.cctvId)
            .then((updated) =>
              setIotLights((prev) => prev.map((l) => (l.id === updated.id ? updated : l))),
            )
            .catch((error: unknown) => {
              const { message } = extractApiError(error);
              show({ title: message || '담당 CCTV 배정에 실패했습니다.', variant: 'error' });
            });
        }
      } else if (item.type === 'cctv' && prevDevice) {
        updateCctv(item.id, { name: newLabel, x: finalX / 100, y: finalY / 100 })
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
        data: { ...selectedItem.data, label: newLabel },
      });
    }
    setEditingItemId(null);
    // 스테이징된 드래그 좌표는 이미 addedDevices에 커밋했으니 정리 — 다음 수정 세션은
    // handleStartEdit이 다시 깨끗한 상태로 시작함
    setDevicePositions((prev) => {
      if (!(item.id in prev)) return prev;
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  // "취소" — 이름·가이던스 등 입력한 값은 그냥 버림. 위치도 저장 안 하고 나가면 렌더링
  // 쪽에서 editingItemId가 이 항목이 아닐 때 devicePositions 오버레이를 무시하게 돼있어
  // 자동으로 원래 좌표로 되돌아감(추가로 지워서 다음 수정 세션도 깨끗하게 시작하게 함)
  const handleCancelEdit = (item: PanelItem) => {
    if (editingCctvId === item.id) handleCancelEditCctvCells();
    setEditingItemId(null);
    setDevicePositions((prev) => {
      if (!(item.id in prev)) return prev;
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  const handlePanelItemDelete = (item: PanelItem) => {
    setDeleteConfirmTarget(item);
  };

  const handleDeleteConfirm = () => {
    const item = deleteConfirmTarget;
    if (!item || isDeletingItem) return;
    if (
      item.source === 'added' &&
      item.type === 'cctv' &&
      !realCctvs.some((cctv) => cctv.id === item.id && cctv.floorId === floorId)
    ) {
      setDeleteConfirmTarget(null);
      return;
    }
    if (editingItemId === item.id) setEditingItemId(null);
    if (item.source === 'added') {
      if (item.type === 'cctv') {
        setIsDeletingItem(true);
        deleteCctv(item.id)
          .then(() => {
            handleAddedDeviceDelete(item.id);
            setRealCctvs((prev) => prev.filter((cctv) => cctv.id !== item.id));
            setSelectedItem((prev) =>
              prev?.kind === 'device' && prev.data.id === item.id ? null : prev,
            );
            if (editingCctvId === item.id) handleCancelEditCctvCells();
            setDeleteConfirmTarget(null);
            void queryClient.invalidateQueries({ queryKey: floorQueryKeys.cctv(floorId) });
          })
          .catch((error: unknown) => {
            const { message } = extractApiError(error);
            show({ title: message || 'CCTV 삭제에 실패했습니다.', variant: 'error' });
          })
          .finally(() => setIsDeletingItem(false));
        return;
      }
      if (item.type === 'light') {
        // 서버에서 이 유도등이 붙어있던 노드·엣지까지 cascade로 함께 삭제됨
        setIsDeletingItem(true);
        deleteIoTLight(item.id)
          .then(() => {
            handleAddedDeviceDelete(item.id);
            setIotLights((prev) => prev.filter((l) => l.id !== item.id));
            setDeleteConfirmTarget(null);
          })
          .catch((error: unknown) => {
            // CCTV/구조 노드 삭제와 달리 여기만 서버 메시지를 안 보여줘서, 실패해도 왜 실패했는지
            // 알 수 없었음(예: 다른 곳에서 참조 중이라 서버가 거부하는 경우) — 실제 사유를 그대로 보여줌
            const { message } = extractApiError(error);
            show({ title: message || '유도등 삭제에 실패했습니다.', variant: 'error' });
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

            {/* 훈련 준비 체크리스트 — 시작 노드·최종 탈출구가 없으면 시나리오 재생이 안 되는데
                그동안 눈에 띄는 안내가 없었음. 층 목록 바로 아래, 도면 편집을 시작하기 전에
                가장 먼저 보이는 자리에 둠 */}
            {currentFloor?.segmentationStatus === 'DONE' && (
              <ReadinessChecklist
                hasStartNode={structureNodes.some((n) => n.type === 'start')}
                hasFinalExit={structureNodes.some((n) => n.isFinalExit)}
                hasStair={structureNodes.some((n) => n.type === 'stair')}
                hasRouteToExit={hasRouteFromStartToExit}
                onAddStartNode={() => handleOpenNodeAdd('start')}
                onAddStair={() => handleOpenNodeAdd('stair')}
                onFocusDeviceCards={() => {
                  setTopFilter('device');
                  setDeviceTypeFilter([]);
                }}
                onConnectEdges={handleOpenEdgeAdd}
              />
            )}

            {/* 노드/구역/엣지 추가 · 그리드 설정 · 감시영역 재선택 팝업 — 예전엔 캔버스 위에
                떠 있어서 도면을 가려 그 밑을 클릭할 수 없었음. 도면을 보면서 동시에 입력할 수
                있어야 하는 흐름이라, 캔버스와 겹치지 않는 이 사이드바로 옮김 */}
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

            {/* 노드를 순서대로 계속 클릭해 경로를 쌓는 패널 — 경로 하나를 확정하면 모드도 같이
                끝나므로(핸들러 쪽 주석 참고), 여기선 항상 "아직 아무 것도 안 만든 상태"만 보여줌 */}
            {edgeAddOpen && !edgeChainReviewOpen && (
              <div className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
                <div className={styles.nodeAddHeader}>
                  <span className={styles.nodeAddTitle}>엣지 연결</span>
                </div>
                <span className={styles.nodeAddHint}>
                  {edgeChainNodeIds.length === 0
                    ? '연결할 노드를 순서대로 클릭하세요'
                    : `계속 클릭해서 경로를 잇거나, 다음을 눌러 ${edgeChainNodeIds.length - 1}개 구간을 확정하세요`}
                </span>
                {edgeChainNodeIds.length > 0 && (
                  <span className={styles.edgeChainPath}>
                    {edgeChainNodeIds.map((id) => getGraphNodeLabel(id)).join(' → ')}
                  </span>
                )}
                <div className={styles.nodeAddActions}>
                  {edgeChainNodeIds.length > 0 && (
                    <button
                      type="button"
                      className={styles.nodeAddCancelBtn}
                      onClick={handleClearEdgeChain}
                    >
                      다시 선택
                    </button>
                  )}
                  {edgeChainNodeIds.length >= 2 ? (
                    <button
                      type="button"
                      className={styles.nodeAddSubmitBtn}
                      onClick={handleProceedToEdgeChainReview}
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.nodeAddCancelBtn}
                      onClick={handleExitEdgeMode}
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            )}

            {edgeAddOpen && edgeChainReviewOpen && (
              <EdgeChainReviewPopup
                containerRef={edgePopupRef}
                segments={edgeChainSegments}
                onBack={handleBackFromEdgeChainReview}
                onSubmit={handleSubmitEdgeChain}
              />
            )}

            {editingCctvId && (
              // 예전엔 좌측 상단에 raw 스타일로 떠서 눈에 잘 안 띄었음 — 다른 모든 "설정 중"
              // 팝업(구역 설정 등)과 같은 자리·같은 스타일로 통일해서 찾기 쉽게 함
              <div className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
                <div className={styles.nodeAddHeader}>
                  <span className={styles.nodeAddTitle}>감시 영역 재선택</span>
                </div>
                <span className={styles.nodeAddHint}>
                  도면에서 칸을 클릭하거나 드래그해서 감시 영역을 다시 선택해주세요.{' '}
                  {cctvDraftCellIds.length}칸 선택됨.
                </span>
                <div className={styles.nodeAddActions}>
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
                onCancel={handleCancelNodeAdd}
                onBack={handleNodeAddBack}
                onSubmitEntry={handleSubmitNodeEntry}
                onFinalize={handleFinalizeFov}
                lightNodeOptions={lightNodeOptions}
                lightEdgeOptions={lightEdgeOptions}
                lightCctvOptions={lightCctvOptions}
                lightFields={nodeAddLightFields}
                onLightFieldsChange={setNodeAddLightFields}
                lightPickField={nodeAddLightPickField}
                onStartLightPick={(field) => handleStartLightPick('add', field)}
              />
            )}

            {/* 기존 구역 수정(zoneResetTargetId)은 팝업 없이 카드에서 이름을, 도면에서 칸을
                바로 편집함 — 이 팝업은 "새 구역 추가"에만 씀(이름을 받을 카드가 아직 없어서
                여전히 필요함) */}
            {zoneAddOpen && !zoneResetTargetId && (
              <ZoneAddPopup
                containerRef={zonePopupRef}
                selectedCellCount={zoneDraftCellIds.length}
                onCancel={() => setZoneAddOpen(false)}
                onSave={handleAddZone}
              />
            )}
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
            {/* 그리드는 이제 토글 없이 항상 표시함(아래 ensureFloorGridCells 자동 조회 효과 참고) */}
            {currentFloor?.segmentationStatus === 'DONE' && (
              <div className={styles.canvasTopRightRow}>
                <AddActionMenu
                  onAddNode={() => handleOpenNodeAdd()}
                  onAddZone={handleToggleZoneAdd}
                  onAddEdge={handleOpenEdgeAdd}
                />
              </div>
            )}

            <div className={styles.canvasScrollArea}>
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
                  onZoneDraftChange={setZoneDraftRect}
                  onZoneDragEnd={handleZoneDragEnd}
                  isZoneDragging={isZoneDragging}
                  onZoneDraggingChange={setIsZoneDragging}
                  savedZones={zones}
                  structureNodes={structureNodes}
                  editingStructureId={editingStructureId}
                  onStructureNodeMove={handleStructureNodeMove}
                  onStructureNodeMoveEnd={handleStructureNodeMoveEnd}
                  graphNodes={graphNodes}
                  graphEdges={graphEdges}
                  edgeAddActive={edgeAddOpen && !edgeChainReviewOpen}
                  onNodeClickForEdge={handleEdgeNodeClick}
                  edgeChainNodeIds={edgeChainNodeIds}
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
                  lightPreviewNodeId={lightPreviewSource?.decisionNodeId}
                  lightPreviewLeftEdgeId={lightPreviewSource?.leftEdgeId}
                  lightPreviewRightEdgeId={lightPreviewSource?.rightEdgeId}
                  lightPickField={currentLightPickField}
                  onLightPick={handleLightCanvasPick}
                  stagedCameraPosition={nodeStagedPosition}
                  onSelectDevice={(d) => {
                    const isSame = selectedItem?.kind === 'device' && selectedItem.data.id === d.id;
                    setSelectedItem(isSame ? null : { kind: 'device', data: d });
                    setSelectedZoneRef(null);
                    // 엣지를 선택해둔 채로 장비를 고르면 엣지 강조가 그대로 남아있던 문제 —
                    // 포커스는 하나만 유지되게 함
                    setSelectedEdgeId(null);
                    // 지금 하위 필터에 가려져 있어도 이 장비 카드가 패널에 드러나도록 그 종류로 이동
                    // (다른 칩은 정리 — 안 그러면 이 종류가 아직 안 켜져 있을 때 여전히 숨어 있음)
                    setTopFilter((prev) => (prev === 'zone' ? 'all' : prev));
                    const chip = deviceTypeToFilterChip(d.type);
                    setDeviceTypeFilter(chip ? [chip] : []);
                  }}
                  onMapClick={handleMapClick}
                  onBackgroundClick={() => {
                    setSelectedItem(null);
                    setSelectedZoneRef(null);
                    setSelectedEdgeId(null);
                  }}
                  devicePositions={devicePositions}
                  onDeviceMoved={handleDeviceMoved}
                  addedDevices={addedDevices}
                  onUpload={() => setUploadModalOpen(true)}
                />
              ) : (
                <div className={styles.canvasPlaceholder}>
                  <span className={styles.canvasPlaceholderTitle}>층 정보를 찾을 수 없습니다</span>
                </div>
              )}
            </div>
          </div>

          {/* 캔버스 우하단 — 범례 정보 아이콘을 줌 컨트롤 바로 위에 세로로 쌓음 */}
          <div className={styles.canvasBottomRightColumn}>
            {currentFloor?.segmentationStatus === 'DONE' && <NodeTypeLegendInfo />}
            <div className={styles.canvasZoomFloat}>
              <button
                type="button"
                className={styles.zoomButton}
                onClick={() => setZoom((v) => Math.max(50, v - 10))}
                disabled={zoom <= 50}
                aria-label="축소"
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
                aria-label="확대"
              >
                +
              </button>
            </div>
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
                    onClick={() => {
                      // 유도등 등 하위 필터 칩을 고른 채로 "전체"를 누르면 그 필터가 그대로
                      // 남아서 전체가 아니라 필터링된 목록만 보이는 문제가 있었음 — 탭을
                      // 바꿀 때마다 하위 필터도 같이 초기화함
                      setTopFilter(key);
                      setDeviceTypeFilter([]);
                    }}
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
                      { key: 'start', label: '시작 후보' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      className={clsx(
                        styles.subFilterChip,
                        deviceTypeFilter.includes(key) && styles.subFilterChipActive,
                      )}
                      onClick={() =>
                        setDeviceTypeFilter((prev) =>
                          prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
                        )
                      }
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
                      hasChanges={isDeviceEditFormDirty}
                      onEditFormChange={setEditForm}
                      onSelect={handlePanelItemSelect}
                      onStartEdit={handleStartEdit}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onDelete={handlePanelItemDelete}
                      onToggleEnabled={handleToggleEnabled}
                      onEditCctvCells={handleStartEditCctvCells}
                      lightNodeOptions={lightNodeOptions}
                      lightEdgeOptions={lightEdgeOptions}
                      lightCctvOptions={lightCctvOptions}
                      lightPickField={editingItemId === item.id ? editLightPickField : null}
                      onStartLightPick={(field) => handleStartLightPick('edit', field)}
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
    </>
  );
};

export default FloorPlansDetailPage;
