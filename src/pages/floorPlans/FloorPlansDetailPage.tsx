import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import CheckIcon from '@assets/icons/ic-check.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';
import EditIcon from '@assets/icons/ic-edit.svg?react';
import LayersIcon from '@assets/icons/ic-layers.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import useToast from '@components/toast/useToast';

import { formatFloor } from '@utils/floor';

import {
  configureCctvGridCells,
  createCctv,
  disableCctv,
  enableCctv,
  getFloorCctvs,
} from './api/cctvApi';
import { getFloorGridCells, setFloorGrid } from './api/floorGridApi';
import { analyzeFloor, getFloorBuildings, getFloorDetail, uploadFloor } from './api/floorPlansApi';
import {
  changeLightDirection,
  configureLightGuidance,
  createIoTLight,
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
import * as styles from './FloorPlansDetailPage.css';
import CctvSettingsModal from './modals/CctvSettingsModal';
import EquipmentDeleteConfirmModal from './modals/EquipmentDeleteConfirmModal';
import FloorUploadModal from './modals/FloorUploadModal';
import GridAreaSettingModal from './modals/GridAreaSettingModal';
import IoTLightSettingsModal from './modals/IoTLightSettingsModal';

import type { Cctv } from './api/cctvApi';
import type { FloorGridCell } from './api/floorGridApi';
import type { IoTLight } from './api/iotLightsApi';
import type { MapEdge, MapNode } from './api/mapGraphApi';
import type {
  AiLayer,
  DeviceMarker,
  EditMode,
  Floor,
  FloorBuilding,
  PoiMarker,
} from './types/floorPlans';

type SelectedItem = { kind: 'device'; data: DeviceMarker } | { kind: 'poi'; data: PoiMarker };

type PanelItem = {
  id: string;
  kind: 'device' | 'poi';
  type: 'cctv' | 'iot' | 'light' | 'general';
  label: string;
  statusText: string;
  statusOnline: boolean;
  zone: string;
  source: 'floor' | 'added' | 'poi';
};

type PoiType = 'exit' | 'stair' | 'extinguisher' | 'assembly' | 'firstaid';

const POI_TYPE_CONFIG: Record<PoiType, { label: string; color: string; icon: string }> = {
  exit: { label: '비상구', color: '#16a34a', icon: 'E' },
  stair: { label: '계단', color: '#2563eb', icon: '▲' },
  extinguisher: { label: '소화기', color: '#dc2626', icon: 'F' },
  assembly: { label: '집결지', color: '#7c3aed', icon: 'A' },
  firstaid: { label: '구급함', color: '#0891b2', icon: '+' },
};

type PlacingDeviceType = 'cctv' | 'iot' | 'light' | 'door' | 'stair';
type PlacingEquipmentType = Exclude<PlacingDeviceType, 'door' | 'stair'>;

const DEVICE_PLACE_CONFIG: Record<PlacingDeviceType, { label: string; color: string }> = {
  cctv: { label: 'CCTV', color: '#8b5cf6' },
  iot: { label: 'IoT', color: '#16a34a' },
  light: { label: '유도등', color: '#d97706' },
  door: { label: '문 · 출입구', color: '#2563eb' },
  stair: { label: '계단', color: '#f97316' },
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

type ZoneEntry = { id: string; type: ZoneType; label: string; rect?: ZoneRect };

/* 도면 위 구조 노드 — 실제 API의 MapNodeResponse.type(DOOR/STAIR 등)과 대응되는 점 좌표 노드.
   isFinalExit은 문에서만 의미 있음(계단은 항상 false) */
type StructureNodeType = 'door' | 'stair';

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
};

// 맵그래프 노드 중 문/계단이 아닌 나머지(ROOM/HALLWAY/EXIT/CUSTOM) — 조회 전용, 아직 편집 대상 아님
const GRAPH_NODE_COLOR: Record<'ROOM' | 'HALLWAY' | 'EXIT' | 'CUSTOM', string> = {
  ROOM: '#9ca3af',
  HALLWAY: '#9ca3af',
  EXIT: '#16a34a',
  CUSTOM: '#7c3aed',
};

type ZoneRefSelection = { kind: 'node'; id: string } | { kind: 'zone'; id: string };

const GRID_SIZE = 20;

const isSameRect = (a: ZoneRect, b: ZoneRect): boolean =>
  a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

const MockFloorMap3F = ({
  mapImageUrl,
  aiLayers,
  editMode,
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
  poiMarkers,
  relocatingPoiId,
  onMapClick,
  onPoiClick,
  onBackgroundClick,
}: {
  mapImageUrl: string | null;
  aiLayers: Record<string, boolean>;
  editMode: EditMode;
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
  poiMarkers: Array<{ id: string; x: number; y: number; label: string; poiType: string }>;
  relocatingPoiId: string | null;
  onMapClick: (x: number, y: number) => void;
  onPoiClick: (id: string) => void;
  onBackgroundClick: () => void;
}) => {
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const structureDragMovedRef = useRef(false);

  // 엣지(선) 양 끝 좌표를 찾기 위한 노드 id → SVG 좌표 조회 (구조 노드 + 그 외 그래프 노드 통합)
  const nodePositionById = new Map<string, { x: number; y: number }>();
  structureNodes.forEach((n) => nodePositionById.set(n.id, { x: n.x, y: n.y }));
  graphNodes.forEach((n) => nodePositionById.set(n.id, { x: n.x * 560, y: n.y * 420 }));

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 560);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 420);
    if (editMode === 'poi' || placingActive) {
      onMapClick(x, y);
      return;
    }
    if (zoneAddActive) return;
    onBackgroundClick();
  };

  const svgPoint = (clientX: number, clientY: number, svgEl: SVGSVGElement) => {
    const rect = svgEl.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * 560;
    const rawY = ((clientY - rect.top) / rect.height) * 420;
    return {
      x: Math.max(0, Math.min(560, Math.round(rawX / GRID_SIZE) * GRID_SIZE)),
      y: Math.max(0, Math.min(420, Math.round(rawY / GRID_SIZE) * GRID_SIZE)),
    };
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!zoneAddActive) return;
    e.preventDefault();
    const svgEl = e.currentTarget;
    const start = svgPoint(e.clientX, e.clientY, svgEl);
    dragStartRef.current = start;
    onZoneDraftChange({ x: start.x, y: start.y, w: 0, h: 0 });

    const onMove = (mv: MouseEvent) => {
      if (!dragStartRef.current) return;
      const cur = svgPoint(mv.clientX, mv.clientY, svgEl);
      const x = Math.min(dragStartRef.current.x, cur.x);
      const y = Math.min(dragStartRef.current.y, cur.y);
      const w = Math.abs(cur.x - dragStartRef.current.x);
      const h = Math.abs(cur.y - dragStartRef.current.y);
      onZoneDraftChange({ x, y, w, h });
    };
    const onUp = () => {
      dragStartRef.current = null;
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

    const onMove = (mv: MouseEvent) => {
      structureDragMovedRef.current = true;
      const point = svgPoint(mv.clientX, mv.clientY, svgEl);
      lastPoint = point;
      onStructureNodeMove(structureId, point.x, point.y);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (lastPoint) onStructureNodeMoveEnd(structureId, lastPoint.x, lastPoint.y);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const svgCursor =
    relocatingPoiId || editMode === 'poi' || placingActive || zoneAddActive || edgeAddActive
      ? 'crosshair'
      : 'default';

  return (
    <svg
      viewBox="0 0 560 420"
      width="700"
      height="525"
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: svgCursor }}
      onClick={handleSvgClick}
      onMouseDown={handleSvgMouseDown}
    >
      {/* 배경 — 실제 업로드된 도면 원본 이미지. 벽은 별도 데이터가 아니라 이 이미지 자체에 포함되어 있음 */}
      <rect width="560" height="420" fill="#f8f9fa" />
      {mapImageUrl && (
        <image
          href={mapImageUrl}
          x={0}
          y={0}
          width={560}
          height={420}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* 맵그래프 엣지 — 편집모드 아닐 땐 클릭해서 선택 후 삭제 가능 */}
      {aiLayers.room &&
        graphEdges.map((edge) => {
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

      {/* 맵그래프 노드 중 ROOM/HALLWAY/EXIT/CUSTOM — 엣지 연결 모드에서만 클릭 가능 */}
      {aiLayers.room &&
        graphNodes.map((n) => {
          const x = n.x * 560;
          const y = n.y * 420;
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
      {aiLayers.room &&
        structureNodes.map((n) => {
          const isEditingThis = n.id === editingStructureId;
          const isSelected = selectedZoneRef?.kind === 'node' && selectedZoneRef.id === n.id;
          const isStair = n.type === 'stair';
          const baseColor = isStair ? '#f97316' : '#2563eb';
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

      {/* 저장된 일반 구역 */}
      {savedZones.map((z) => {
        if (!z.rect) return null;
        const isSelected = selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === z.id;
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
            <rect
              x={z.rect.x}
              y={z.rect.y}
              width={z.rect.w}
              height={z.rect.h}
              fill="rgba(107,114,128,0.15)"
              stroke={isSelected ? '#2563eb' : '#6b7280'}
              strokeWidth={isSelected ? '3' : '1.5'}
            />
            <text
              x={z.rect.x + z.rect.w / 2}
              y={z.rect.y + z.rect.h / 2 + 3}
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
      })}

      {/* 그리드 셀 — CCTV 신규 등록 중(선택 가능), 선택된 기존 CCTV의 감시 영역(조회 전용),
          또는 그리드 표시 토글이 켜진 경우(전체 조회 전용) */}
      {cctvGridCellsMode !== 'hidden' &&
        floorGridCells.map((cell) => {
          const cx = cell.centerX * 560;
          const cy = cell.centerY * 420;
          const isSelected = selectedGridCellIds.includes(cell.id);
          if (cctvGridCellsMode === 'viewing' && !isSelected) return null;
          const isBrowsing = cctvGridCellsMode === 'browsing';
          return (
            <rect
              key={cell.id}
              x={cx - gridCellPxSize.w / 2}
              y={cy - gridCellPxSize.h / 2}
              width={gridCellPxSize.w}
              height={gridCellPxSize.h}
              fill={
                isSelected
                  ? 'rgba(139,92,246,0.35)'
                  : isBrowsing
                    ? 'rgba(107,114,128,0.05)'
                    : 'rgba(139,92,246,0.04)'
              }
              stroke={isBrowsing ? 'rgba(75,85,99,0.6)' : '#8b5cf6'}
              strokeWidth={isSelected ? '1.5' : isBrowsing ? '1' : '0.5'}
              style={{
                cursor: cctvGridCellsMode === 'selecting' ? 'pointer' : 'default',
                pointerEvents: cctvGridCellsMode === 'selecting' ? 'auto' : 'none',
              }}
              onClick={(e) => {
                if (cctvGridCellsMode !== 'selecting') return;
                e.stopPropagation();
                onGridCellToggle(cell.id);
              }}
            />
          );
        })}

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

      {/* POI 마커 */}
      {poiMarkers.map((m) => {
        const isRelocating = relocatingPoiId === m.id;
        const cfg = POI_TYPE_CONFIG[m.poiType as PoiType] ?? POI_TYPE_CONFIG.exit;
        const fill = isRelocating ? '#f59e0b' : cfg.color;
        return (
          <g key={m.id}>
            <circle
              cx={m.x}
              cy={m.y}
              r="14"
              fill={fill}
              stroke="white"
              strokeWidth="2"
              style={{ cursor: editMode === 'poi' ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (editMode !== 'poi') return;
                e.stopPropagation();
                onPoiClick(m.id);
              }}
            />
            <text
              x={m.x}
              y={m.y + 5}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {isRelocating ? '↖' : cfg.icon}
            </text>
            <text
              x={m.x}
              y={m.y + 26}
              textAnchor="middle"
              fill={fill}
              fontSize="9"
              fontFamily="sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {isRelocating ? '클릭해서 이동' : m.label}
            </text>
          </g>
        );
      })}
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

    const onMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      didMove.current = true;
      const rect = container.getBoundingClientRect();
      const rawX = ((mv.clientX - rect.left) / rect.width) * 100;
      const rawY = ((mv.clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.max(0, Math.min(100, rawX));
      const clampedY = Math.max(0, Math.min(100, rawY));
      onDragEnd(device.id, clampedX, clampedY);
    };

    const onUp = () => {
      isDragging.current = false;
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

    const onMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      didMove.current = true;
      const rect = container.getBoundingClientRect();
      const rawX = ((mv.clientX - rect.left) / rect.width) * 100;
      const rawY = ((mv.clientY - rect.top) / rect.height) * 100;
      const point = { x: Math.max(0, Math.min(100, rawX)), y: Math.max(0, Math.min(100, rawY)) };
      lastPoint = point;
      onDragEnd(device.id, point.x, point.y);
    };
    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (lastPoint) onDragMoveEnd(device.id, lastPoint.x, lastPoint.y);
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
  gridSizeMeterInput,
  onGridSizeMeterInputChange,
  onGridSetup,
  onCancel,
  onBack,
  onSubmitEntry,
  onFinalize,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  type: PlacingDeviceType;
  onTypeChange: (type: PlacingDeviceType) => void;
  stage: 'entry' | 'grid-setup' | 'fov';
  hasPosition: boolean;
  selectedCellCount: number;
  gridSizeMeterInput: string;
  onGridSizeMeterInputChange: (value: string) => void;
  onGridSetup: () => void;
  onCancel: () => void;
  onBack: () => void;
  onSubmitEntry: (type: PlacingDeviceType, deviceId: string, location: string) => void;
  onFinalize: (deviceId: string, location: string) => void;
}) => {
  const [deviceId, setDeviceId] = useState('');
  const [location, setLocation] = useState('');

  const isStructureNode = type === 'door' || type === 'stair';
  const isCctv = type === 'cctv';
  const totalSteps = isCctv ? 2 : 1;
  const stepNumber = stage === 'entry' ? 1 : totalSteps;

  if (stage === 'grid-setup') {
    return (
      <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.nodeAddHeader}>
          <span className={styles.nodeAddTitle}>그리드 설정 필요</span>
        </div>
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
            onChange={(e) => onGridSizeMeterInputChange(e.target.value)}
          />
        </div>
        <div className={styles.nodeAddActions}>
          <button type="button" className={styles.nodeAddCancelBtn} onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className={styles.nodeAddSubmitBtn}
            disabled={!(Number(gridSizeMeterInput) > 0)}
            onClick={onGridSetup}
          >
            설정
          </button>
        </div>
      </div>
    );
  }

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
            ? `${selectedCellCount}칸 선택됨. 도면을 드래그하면 겹치는 칸이 추가되고, 선택된 칸을 클릭하면 해제돼요.`
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
          {(['cctv', 'iot', 'light', 'door', 'stair'] as const).map((t) => (
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

/* ── 구역 설정 팝업 ── */
const ZoneAddPopup = ({
  containerRef,
  hasDraftRect,
  isDuplicateRect,
  onCancel,
  onSave,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  hasDraftRect: boolean;
  isDuplicateRect: boolean;
  onCancel: () => void;
  onSave: (label: string) => void;
}) => {
  const [zoneName, setZoneName] = useState('');

  const handleSave = () => {
    onSave(zoneName.trim());
  };

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>구역 설정</span>
        <span className={styles.nodeAddStepBadge}>{hasDraftRect ? '2/2' : '1/2'}</span>
      </div>
      <span className={styles.nodeAddHint}>
        {hasDraftRect && isDuplicateRect
          ? '이미 같은 위치와 크기의 구역이 있어요. 도면을 다시 드래그해서 다른 영역을 지정해주세요.'
          : hasDraftRect
            ? '영역 지정을 마쳤어요. 이름을 입력하고 추가 버튼을 누르면 저장됩니다.'
            : '이름을 입력하거나 도면을 드래그해서 영역을 지정해주세요. 어느 쪽을 먼저 하셔도 괜찮아요.'}
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
          disabled={!zoneName.trim() || !hasDraftRect || isDuplicateRect}
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
      {(item.type === 'light' || item.type === 'cctv') && (
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
  selected,
  aiLayers,
  zoom,
  editMode,
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
  poiMarkers,
  editingPoiId,
  relocatingPoiId,
  devicePositions,
  addedDevices,
  onSelectDevice,
  onMapClick,
  onPoiClick,
  onPoiLabelChange,
  onPoiDelete,
  onPoiRelocate,
  onPoiPopoverClose,
  onDeviceMoved,
  onDeviceMoveEnd,
  onUpload,
  onBackgroundClick,
}: {
  mapWrapRef: React.RefObject<HTMLDivElement>;
  floor: Floor;
  selected: SelectedItem | null;
  aiLayers: Record<string, boolean>;
  zoom: number;
  editMode: EditMode;
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
  poiMarkers: Array<{ id: string; x: number; y: number; label: string; poiType: string }>;
  editingPoiId: string | null;
  relocatingPoiId: string | null;
  devicePositions: Record<string, { x: number; y: number }>;
  addedDevices: AddedDevice[];
  onSelectDevice: (d: DeviceMarker) => void;
  onMapClick: (x: number, y: number) => void;
  onPoiClick: (id: string) => void;
  onPoiLabelChange: (id: string, label: string) => void;
  onPoiDelete: (id: string) => void;
  onPoiRelocate: (id: string) => void;
  onPoiPopoverClose: () => void;
  onDeviceMoved: (id: string, x: number, y: number) => void;
  onDeviceMoveEnd: (id: string, x: number, y: number) => void;
  onUpload: () => void;
  onBackgroundClick: () => void;
}) => {
  const hasFloorPlan = floor.segmentationStatus === 'DONE';

  if (!hasFloorPlan) {
    return (
      <div className={styles.canvasPlaceholder}>
        <span className={styles.canvasPlaceholderTitle}>등록된 도면이 없습니다</span>
        <p style={{ color: 'inherit', margin: 0 }}>
          도면을 업로드하거나 AI 영역 분할을 실행해 주세요
        </p>
        <Button variant="primary" size="sm" onClick={onUpload}>
          도면 업로드
        </Button>
      </div>
    );
  }

  const scale = zoom / 100;

  return (
    <div ref={mapWrapRef} className={styles.mapWrap} style={{ transform: `scale(${scale})` }}>
      <MockFloorMap3F
        mapImageUrl={floor.mapImageUrl}
        aiLayers={aiLayers}
        editMode={editMode}
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
        poiMarkers={poiMarkers}
        relocatingPoiId={relocatingPoiId}
        onMapClick={onMapClick}
        onPoiClick={onPoiClick}
        onBackgroundClick={onBackgroundClick}
      />
      {stagedCameraPosition && (
        <div
          className={styles.stagedCameraMarker}
          style={{ left: `${stagedCameraPosition.x}%`, top: `${stagedCameraPosition.y}%` }}
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

      {/* POI 편집 팝오버 — SVG 바깥 절대 위치 (잘림 없음) */}
      {editingPoiId &&
        (() => {
          const poi = poiMarkers.find((m) => m.id === editingPoiId);
          if (!poi) return null;
          const cfg = POI_TYPE_CONFIG[poi.poiType as PoiType] ?? POI_TYPE_CONFIG.exit;
          const left = poi.x + 20 > 400 ? poi.x - 180 : poi.x + 20;
          const top = poi.y - 20;
          return (
            <div
              style={{
                position: 'absolute',
                left,
                top,
                zIndex: 20,
                background: 'white',
                border: `1px solid ${cfg.color}40`,
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                padding: '10px',
                width: '170px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: '11px', color: cfg.color, fontWeight: 700 }}>
                  {cfg.icon} {cfg.label} 편집
                </span>
                <button
                  type="button"
                  onClick={onPoiPopoverClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: '14px',
                    lineHeight: 1,
                    padding: '0 2px',
                  }}
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={poi.label}
                onChange={(e) => onPoiLabelChange(poi.id, e.target.value)}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  fontSize: '11px',
                  width: '100%',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = cfg.color;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => onPoiRelocate(poi.id)}
                  style={{
                    flex: 1,
                    border: `1px solid ${cfg.color}`,
                    borderRadius: '4px',
                    background: 'white',
                    color: cfg.color,
                    fontSize: '10px',
                    padding: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  위치 변경
                </button>
                <button
                  type="button"
                  onClick={() => onPoiDelete(poi.id)}
                  style={{
                    flex: 1,
                    border: 'none',
                    borderRadius: '4px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    padding: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })()}
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

  // 빌딩 목록 (사이드바 셀렉터용)
  useEffect(() => {
    getFloorBuildings()
      .then(setFloorBuildings)
      .catch(() => {});
  }, []);

  // 현재 층 상세 — 층 전환 시 이전 층 데이터가 남아있지 않도록 즉시 초기화
  useEffect(() => {
    if (!buildingId || !floorId) return;
    let cancelled = false;
    setFloor(null);
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
  }, [buildingId, floorId]);

  // 맵그래프(노드/엣지) 조회 — 문/계단은 기존 구조 노드 편집 상태로, 나머지는 조회 전용으로 보관
  useEffect(() => {
    if (!floorId) return;
    let cancelled = false;
    getFloorGraph(floorId)
      .then((graph) => {
        if (cancelled) return;
        const structureFromGraph: StructureNode[] = graph.nodes
          .filter((n) => n.type === 'DOOR' || n.type === 'STAIR')
          .map((n) => ({
            id: n.id,
            type: n.type === 'DOOR' ? 'door' : 'stair',
            x: Math.round(n.x * 560),
            y: Math.round(n.y * 420),
            isFinalExit: n.isExitTarget,
          }));
        setStructureNodes(structureFromGraph);
        setGraphNodes(graph.nodes.filter((n) => n.type !== 'DOOR' && n.type !== 'STAIR'));
        setGraphEdges(graph.edges);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [floorId]);

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
  const [editMode] = useState<EditMode>('view');
  const [aiLayers] = useState<Record<AiLayer, boolean>>({
    wall: true,
    corridor: true,
    stairwell: true,
    exit: true,
    room: true,
  });
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
    'cctv' | 'iot' | 'light' | 'door' | 'stair' | null
  >(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; zone: string }>({
    label: '',
    zone: '',
  });
  const [poiMarkers, setPoiMarkers] = useState<
    Array<{ id: string; x: number; y: number; label: string; poiType: PoiType }>
  >([]);
  const [selectedPoiType] = useState<PoiType>('exit');
  const [nodeAddType, setNodeAddType] = useState<PlacingDeviceType>('cctv');
  const [addedDevices, setAddedDevices] = useState<AddedDevice[]>([]);
  const [structureNodes, setStructureNodes] = useState<StructureNode[]>([]);
  const [graphNodes, setGraphNodes] = useState<MapNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<MapEdge[]>([]);
  const [iotLights, setIotLights] = useState<IoTLight[]>([]);
  const [lightSettingsTarget, setLightSettingsTarget] = useState<IoTLight | null>(null);
  const [cctvSettingsTarget, setCctvSettingsTarget] = useState<Cctv | null>(null);
  const [editingCctvId, setEditingCctvId] = useState<string | null>(null);
  const [editingStructureId, setEditingStructureId] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneEditLabel, setZoneEditLabel] = useState('');
  const [nodeAddStage, setNodeAddStage] = useState<'entry' | 'grid-setup' | 'fov'>('entry');
  const [floorGridCells, setFloorGridCells] = useState<FloorGridCell[]>([]);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [gridSetupPromptOpen, setGridSetupPromptOpen] = useState(false);
  const [gridSizeMeterInput, setGridSizeMeterInput] = useState('1');
  const [realCctvs, setRealCctvs] = useState<Cctv[]>([]);
  const [cctvDraftCellIds, setCctvDraftCellIds] = useState<string[]>([]);
  const [nodeStagedPosition, setNodeStagedPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [relocatingPoiId, setRelocatingPoiId] = useState<string | null>(null);
  const [devicePositions, setDevicePositions] = useState<Record<string, { x: number; y: number }>>(
    {},
  );

  const handleDeviceMoved = (id: string, x: number, y: number) => {
    setDevicePositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  // 드래그가 끝났을 때만 실제 위치를 저장
  const handleDeviceMoveEnd = (id: string, x: number, y: number) => {
    const device = addedDevices.find((d) => d.id === id);
    if (device?.placeType === 'light') {
      updateIoTLight(id, { name: device.label, x: x / 100, y: y / 100 }).catch(() => {});
      return;
    }
    if (device?.placeType === 'cctv') {
      const cctv = realCctvs.find((c) => c.id === id);
      if (!cctv?.customNodeId) return;
      updateMapNodePosition(cctv.customNodeId, { x: x / 100, y: y / 100 })
        .then(() => {
          setRealCctvs((prev) =>
            prev.map((c) => (c.id === id ? { ...c, x: x / 100, y: y / 100 } : c)),
          );
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
    if (!cctvSettingsTarget) return;
    const request = enabled ? enableCctv : disableCctv;
    request(cctvSettingsTarget.id)
      .then((updated) => {
        setRealCctvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setCctvSettingsTarget(updated);
      })
      .catch(() => {});
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
    selectedItem?.kind === 'device' || selectedItem?.kind === 'poi'
      ? selectedItem.data.id
      : (selectedZoneRef?.id ?? null);

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
  // 영역을 이미 그린 뒤에는 진행 상태를 실수로 잃지 않도록 바깥 클릭으로 닫히지 않게 함
  useEffect(() => {
    const hasDraft = !!zoneDraftRect && zoneDraftRect.w > 0 && zoneDraftRect.h > 0;
    if (!zoneAddOpen || hasDraft) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (zonePopupRef.current?.contains(target)) return;
      if (mapWrapRef.current?.contains(target)) return;
      setZoneAddOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [zoneAddOpen, zoneDraftRect]);

  // 구역 설정 팝업이 닫히면 드래그로 선택한 임시 영역도 초기화
  useEffect(() => {
    if (!zoneAddOpen) setZoneDraftRect(null);
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
        try {
          await setFloorGrid(newFloor.id, params.cellSizeMeter);
          setFloorGridCells(await getFloorGridCells(newFloor.id));
        } catch {
          show({
            title: '그리드 설정에 실패했습니다. "그리드 표시" 토글에서 다시 설정해주세요.',
            variant: 'error',
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
        analyzeFloor(newFloor.id).catch(() => {
          show({ title: '도면 분석 요청에 실패했습니다.', variant: 'error' });
        });
      })
      .catch(() => {
        // 미리보기와 입력값을 유지해 모달을 닫지 않고 바로 재시도할 수 있게 함
        setIsReuploading(false);
        show({ title: '업로드에 실패했습니다. 다시 시도해주세요.', variant: 'error' });
      });
  };

  const handleMapClick = (x: number, y: number) => {
    if (relocatingPoiId) {
      setPoiMarkers((prev) => prev.map((m) => (m.id === relocatingPoiId ? { ...m, x, y } : m)));
      setRelocatingPoiId(null);
      return;
    }
    // 장치 배치 모드 — 정보 입력과 같은 단계에서 클릭으로 위치 지정. 다시 클릭하면 위치를 옮길 수 있음
    // (CCTV 시야 구역 드래그 단계에서는 클릭이 다른 용도이므로 위치를 덮어쓰지 않음)
    if (nodeAddOpen) {
      if (nodeAddStage === 'entry') {
        const pctX = (x / 560) * 100;
        const pctY = (y / 420) * 100;
        setNodeStagedPosition({ x: pctX, y: pctY });
      }
      return;
    }
    // POI 배치
    setPoiMarkers((prev) => [
      ...prev,
      {
        id: `poi-${Date.now()}`,
        x,
        y,
        label: `${(POI_TYPE_CONFIG[selectedPoiType] ?? POI_TYPE_CONFIG.exit).label} ${prev.filter((m) => m.poiType === selectedPoiType).length + 1}`,
        poiType: selectedPoiType,
      },
    ]);
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

    if (type === 'door' || type === 'stair') {
      const x = Math.round(((position.x / 100) * 560) / GRID_SIZE) * GRID_SIZE;
      const y = Math.round(((position.y / 100) * 420) / GRID_SIZE) * GRID_SIZE;
      if (currentFloor) {
        const apiType = type === 'door' ? 'DOOR' : 'STAIR';
        const count = structureNodes.filter((n) => n.type === type).length + 1;
        createMapNode(currentFloor.id, {
          code: `${apiType}-${Date.now()}`,
          type: apiType,
          name: `${cfg.label} ${count}`,
          x: x / 560,
          y: y / 420,
          isExitTarget: false,
        })
          .then((newNode) => {
            setStructureNodes((prev) => [
              ...prev,
              { id: newNode.id, type, x, y, isFinalExit: false },
            ]);
          })
          .catch(() => {});
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
          .catch(() => {});
      }
    } else {
      const count = addedDevices.filter((d) => d.type === 'iot').length + 1;
      setAddedDevices((prev) => [
        ...prev,
        {
          id: `added-${type}-${Date.now()}`,
          type: 'iot',
          placeType: type,
          label: deviceId || `${cfg.label}-${String(count).padStart(2, '0')}`,
          x: position.x,
          y: position.y,
          status: 'online',
          zone: location || '사용자 등록',
        },
      ]);
    }

    setNodeAddStage('entry');
    setNodeStagedPosition(null);
    setZoneDraftRect(null);
    setNodeAddOpen(false);
  };

  // 입력 단계 제출 — CCTV는 그리드 유무에 따라 그리드설정/시야구역 단계로, 나머지는 바로 확정
  const handleSubmitNodeEntry = (type: PlacingDeviceType, deviceId: string, location: string) => {
    if (!nodeStagedPosition) return;
    if (type === 'cctv') {
      setNodeAddStage(floorGridCells.length === 0 ? 'grid-setup' : 'fov');
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

  const handleGridSetup = () => {
    if (!currentFloor) return;
    const cellSizeMeter = Number(gridSizeMeterInput);
    if (!(cellSizeMeter > 0)) return;
    setFloorGrid(currentFloor.id, cellSizeMeter)
      .then(() => getFloorGridCells(currentFloor.id))
      .then((cells) => {
        setFloorGridCells(cells);
        setNodeAddStage('fov');
      })
      .catch(() => {});
  };

  // 그리드 표시 토글 — 업로드 시점에 이미 그리드가 만들어졌을 수 있어 로컬 state만 믿지 않고
  // 서버에서 다시 한번 확인한 뒤에만 "그리드 없음" 설정 팝업을 띄움
  const handleToggleGridOverlay = () => {
    if (showGridOverlay) {
      setShowGridOverlay(false);
      return;
    }
    if (floorGridCells.length > 0) {
      setShowGridOverlay(true);
      return;
    }
    if (!currentFloor) return;
    getFloorGridCells(currentFloor.id)
      .then((cells) => {
        if (cells.length > 0) {
          setFloorGridCells(cells);
          setShowGridOverlay(true);
          return;
        }
        setGridSizeMeterInput('1');
        setGridSetupPromptOpen(true);
      })
      .catch(() => {
        setGridSizeMeterInput('1');
        setGridSetupPromptOpen(true);
      });
  };

  const handleGridSetupPromptConfirm = () => {
    if (!currentFloor) return;
    const cellSizeMeter = Number(gridSizeMeterInput);
    if (!(cellSizeMeter > 0)) return;
    setFloorGrid(currentFloor.id, cellSizeMeter)
      .then(() => getFloorGridCells(currentFloor.id))
      .then((cells) => {
        setFloorGridCells(cells);
        setShowGridOverlay(true);
        setGridSetupPromptOpen(false);
      })
      .catch(() => {});
  };

  const handleGridCellToggle = (cellId: string) => {
    setCctvDraftCellIds((prev) =>
      prev.includes(cellId) ? prev.filter((id) => id !== cellId) : [...prev, cellId],
    );
  };

  const handleFinalizeFov = (deviceId: string) => {
    if (!nodeStagedPosition || !currentFloor || cctvDraftCellIds.length === 0) return;
    const count = addedDevices.filter((d) => d.type === 'cctv').length + 1;
    const label = deviceId || `CCTV-${String(count).padStart(2, '0')}`;
    createCctv({
      floorId: currentFloor.id,
      name: label,
      x: nodeStagedPosition.x / 100,
      y: nodeStagedPosition.y / 100,
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
      .catch(() => {});
  };

  const handleZoneDragEnd = () => {
    const rect = zoneDraftRectRef.current;
    const cctvCellSelecting =
      (nodeAddOpen && nodeAddType === 'cctv' && nodeAddStage === 'fov') || !!editingCctvId;
    if (cctvCellSelecting) {
      if (rect && rect.w > 0 && rect.h > 0) {
        const overlapping = floorGridCells.filter((cell) => {
          const cx = cell.centerX * 560;
          const cy = cell.centerY * 420;
          return cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h;
        });
        setCctvDraftCellIds((prev) =>
          Array.from(new Set([...prev, ...overlapping.map((c) => c.id)])),
        );
      }
      setZoneDraftRect(null);
    }
  };

  // 최종 탈출구 지정은 문에서만 의미 있음
  const handleToggleFinalExit = (id: string) => {
    setStructureNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFinalExit: !n.isFinalExit } : n)),
    );
  };

  const isSameZoneRef = (a: ZoneRefSelection | null, b: ZoneRefSelection): boolean =>
    !!a && a.kind === b.kind && a.id === b.id;

  // 우측 패널 카드 클릭 — 이미 필터를 통과해 보이는 카드이므로 필터는 건드리지 않음
  const handleZoneRefSelect = (ref: ZoneRefSelection) => {
    setSelectedItem(null);
    setEditingItemId(null);
    setSelectedZoneRef((prev) => (isSameZoneRef(prev, ref) ? null : ref));
  };

  // 도면 클릭 — 선택한 항목이 필터에 가려져 있을 수 있으므로 패널에 드러나도록 필터를 초기화
  const handleZoneRefSelectFromMap = (ref: ZoneRefSelection) => {
    handleZoneRefSelect(ref);
    if (ref.kind === 'zone') {
      setTopFilter((prev) => (prev === 'device' ? 'all' : prev));
    } else {
      setTopFilter((prev) => (prev === 'zone' ? 'all' : prev));
    }
  };

  // 드래그 중 미리보기용 — API 호출은 드래그가 끝났을 때(handleStructureNodeMoveEnd)만
  const handleStructureNodeMove = (id: string, x: number, y: number) => {
    setStructureNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const handleStructureNodeMoveEnd = (id: string, x: number, y: number) => {
    updateMapNodePosition(id, { x: x / 560, y: y / 420 }).catch(() => {});
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

  const handleSaveZoneLabel = (id: string) => {
    const trimmed = zoneEditLabel.trim();
    if (trimmed) {
      setZones((prev) => prev.map((z) => (z.id === id ? { ...z, label: trimmed } : z)));
    }
    setEditingZoneId(null);
  };

  const handleAddZone = (label: string) => {
    const rect = zoneDraftRect;
    if (!rect || rect.w <= 0 || rect.h <= 0) return;
    if (zones.some((z) => z.rect && isSameRect(z.rect, rect))) return;
    setZones((prev) => [...prev, { id: `zone-${Date.now()}`, type: 'general', label, rect }]);
    setZoneAddOpen(false);
  };

  const handleZoneDelete = (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  const isNodeSelected = (id: string) =>
    selectedZoneRef?.kind === 'node' && selectedZoneRef.id === id;
  const isZoneSelected = (id: string) =>
    selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === id;

  const renderStructureCard = (n: StructureNode) => {
    const isStair = n.type === 'stair';
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
            <span
              className={clsx(
                styles.zoneCardDot,
                isStair ? styles.zoneCardDotStair : styles.zoneCardDotDoor,
              )}
            />
            <span className={styles.deviceCardName}>
              {STRUCTURE_NODE_LABEL[n.type]} {sameTypeIndex + 1}
            </span>
          </span>
          <span className={styles.zoneCardHeaderActions}>
            {!isStair && (
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
                handleZoneDelete(z.id);
              }}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </span>
        </div>
      </div>
    );
  };

  const allPanelItems: PanelItem[] = [
    ...(floor?.devices ?? []).map((d) => ({
      id: d.id,
      kind: 'device' as const,
      type: d.type as 'cctv' | 'iot',
      label: d.label,
      statusText: d.status === 'online' ? '실시간' : '오프라인',
      statusOnline: d.status === 'online',
      zone: d.zone,
      source: 'floor' as const,
    })),
    ...addedDevices.map((d) => ({
      id: d.id,
      kind: 'device' as const,
      type: d.placeType,
      label: d.label,
      statusText: '실시간',
      statusOnline: true,
      zone: d.zone,
      source: 'added' as const,
    })),
    ...poiMarkers.map((p) => ({
      id: p.id,
      kind: 'poi' as const,
      type: 'general' as const,
      label: p.label,
      statusText: '등록됨',
      statusOnline: true,
      zone: '-',
      source: 'poi' as const,
    })),
  ];

  const panelItems = allPanelItems.filter((item) => {
    if (deviceTypeFilter && item.type !== deviceTypeFilter) return false;
    return true;
  });

  const visibleStructureNodes = structureNodes.filter(
    (n) => !deviceTypeFilter || deviceTypeFilter === n.type,
  );

  // 유도등 설정 모달의 판단 노드/엣지 드롭다운 목록
  const lightNodeOptions = [
    ...structureNodes.map((n) => ({ id: n.id, label: STRUCTURE_NODE_LABEL[n.type] })),
    ...graphNodes.map((n) => ({ id: n.id, label: n.name })),
  ];
  const lightEdgeOptions = graphEdges.map((edge) => ({
    id: edge.id,
    label: `${getGraphNodeLabel(edge.fromNodeId)} → ${getGraphNodeLabel(edge.toNodeId)} (${edge.distance}m)`,
  }));

  // 그리드 셀 하나의 SVG 픽셀 크기 — 셀 중심점 간 간격으로 역산
  const gridCellPxSize = (() => {
    if (floorGridCells.length === 0) return { w: 20, h: 20 };
    const maxCol = Math.max(...floorGridCells.map((c) => c.columnIndex));
    const maxRow = Math.max(...floorGridCells.map((c) => c.rowIndex));
    return { w: 560 / (maxCol + 1), h: 420 / (maxRow + 1) };
  })();

  const cctvGridCellsMode: 'hidden' | 'selecting' | 'viewing' | 'browsing' =
    (nodeAddOpen && nodeAddType === 'cctv' && nodeAddStage === 'fov') || editingCctvId
      ? 'selecting'
      : selectedItem?.kind === 'device' && realCctvs.some((c) => c.id === selectedItem.data.id)
        ? 'viewing'
        : showGridOverlay
          ? 'browsing'
          : 'hidden';

  const selectedGridCellIds =
    cctvGridCellsMode === 'selecting'
      ? cctvDraftCellIds
      : cctvGridCellsMode === 'viewing' && selectedItem?.kind === 'device'
        ? (realCctvs.find((c) => c.id === selectedItem.data.id)?.gridCells.map((c) => c.id) ?? [])
        : [];

  const isPanelItemSelected = (item: PanelItem) =>
    selectedItem?.kind === 'device'
      ? item.kind === 'device' && selectedItem.data.id === item.id
      : selectedItem?.kind === 'poi'
        ? item.kind === 'poi' && selectedItem.data.id === item.id
        : false;

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
      setAddedDevices((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, label: newLabel, zone: editForm.zone } : d)),
      );
      if (item.type === 'light') {
        const device = addedDevices.find((d) => d.id === item.id);
        if (device) {
          updateIoTLight(item.id, { name: newLabel, x: device.x / 100, y: device.y / 100 }).catch(
            () => {},
          );
        }
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
    if (!item) return;
    if (editingItemId === item.id) setEditingItemId(null);
    if (item.kind === 'poi') {
      handlePoiDelete(item.id);
      setDeleteConfirmTarget(null);
      return;
    }
    if (item.source === 'added') {
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

  const handlePoiClick = (id: string) => {
    setEditingPoiId((prev) => (prev === id ? null : id));
  };

  const handlePoiLabelChange = (id: string, label: string) => {
    setPoiMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, label } : m)));
  };

  const handlePoiDelete = (id: string) => {
    setPoiMarkers((prev) => prev.filter((m) => m.id !== id));
    setEditingPoiId(null);
  };

  const handlePoiRelocate = (id: string) => {
    setRelocatingPoiId(id);
    setEditingPoiId(null);
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
                    const isNone = f.segmentationStatus === 'NONE';
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
                  <LayersIcon width={14} height={14} />
                  그리드 표시
                </button>
                <button
                  type="button"
                  className={styles.canvasActionButton}
                  onClick={() => {
                    setZoneAddOpen(false);
                    setNodeAddOpen((v) => !v);
                  }}
                >
                  <PlusIcon width={14} height={14} />
                  노드 추가
                </button>
                <button
                  type="button"
                  className={styles.canvasActionButton}
                  onClick={() => {
                    setNodeAddOpen(false);
                    setZoneAddOpen((v) => !v);
                  }}
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
                    onClick={() => setGridSetupPromptOpen(false)}
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

            {nodeAddOpen && (
              <NodeAddPopup
                containerRef={nodePopupRef}
                type={nodeAddType}
                onTypeChange={setNodeAddType}
                stage={nodeAddStage}
                hasPosition={!!nodeStagedPosition}
                selectedCellCount={cctvDraftCellIds.length}
                gridSizeMeterInput={gridSizeMeterInput}
                onGridSizeMeterInputChange={setGridSizeMeterInput}
                onGridSetup={handleGridSetup}
                onCancel={() => setNodeAddOpen(false)}
                onBack={handleNodeAddBack}
                onSubmitEntry={handleSubmitNodeEntry}
                onFinalize={handleFinalizeFov}
              />
            )}

            {zoneAddOpen && (
              <ZoneAddPopup
                containerRef={zonePopupRef}
                hasDraftRect={!!zoneDraftRect && zoneDraftRect.w > 0 && zoneDraftRect.h > 0}
                isDuplicateRect={
                  !!zoneDraftRect && zones.some((z) => z.rect && isSameRect(z.rect, zoneDraftRect))
                }
                onCancel={() => setZoneAddOpen(false)}
                onSave={handleAddZone}
              />
            )}

            {loadingFloor ? (
              <div style={{ padding: '4rem', color: '#6b7280', fontSize: '1.4rem' }}>
                도면을 불러오는 중...
              </div>
            ) : currentFloor ? (
              <FloorCanvas
                mapWrapRef={mapWrapRef}
                floor={floor ?? currentFloor}
                selected={selectedItem}
                aiLayers={aiLayers}
                zoom={zoom}
                editMode={editMode}
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
                poiMarkers={poiMarkers}
                editingPoiId={editingPoiId}
                relocatingPoiId={relocatingPoiId}
                onSelectDevice={(d) => {
                  if (editMode === 'poi') return;
                  const isSame = selectedItem?.kind === 'device' && selectedItem.data.id === d.id;
                  setSelectedItem(isSame ? null : { kind: 'device', data: d });
                  setSelectedZoneRef(null);
                  setTopFilter((prev) => (prev === 'zone' ? 'all' : prev));
                }}
                onMapClick={handleMapClick}
                onPoiClick={handlePoiClick}
                onPoiLabelChange={handlePoiLabelChange}
                onPoiDelete={handlePoiDelete}
                onPoiRelocate={handlePoiRelocate}
                onPoiPopoverClose={() => setEditingPoiId(null)}
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
                      { key: 'iot', label: 'IoT' },
                      { key: 'light', label: '유도등' },
                      { key: 'door', label: '문 · 출입구' },
                      { key: 'stair', label: '계단' },
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
          onToggleEnabled={handleCctvToggleEnabled}
          onEditCells={handleStartEditCctvCells}
        />
      )}
    </>
  );
};

export default FloorPlansDetailPage;
