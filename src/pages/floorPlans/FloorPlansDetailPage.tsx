import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import CheckIcon from '@assets/icons/ic-check.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';
import EditIcon from '@assets/icons/ic-edit.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';

import { formatFloor } from '@utils/floor';

import { getFloorBuildings, getFloorDetail, segmentFloor, uploadFloor } from './api/floorPlansApi';
import * as styles from './FloorPlansDetailPage.css';
import EquipmentDeleteConfirmModal from './modals/EquipmentDeleteConfirmModal';
import FloorUploadModal from './modals/FloorUploadModal';
import GridAreaSettingModal from './modals/GridAreaSettingModal';

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

type PlacingDeviceType = 'cctv' | 'iot' | 'light' | 'door';
type PlacingEquipmentType = Exclude<PlacingDeviceType, 'door'>;

const DEVICE_PLACE_CONFIG: Record<PlacingDeviceType, { label: string; color: string }> = {
  cctv: { label: 'CCTV', color: '#8b5cf6' },
  iot: { label: 'IoT', color: '#16a34a' },
  light: { label: '유도등', color: '#d97706' },
  door: { label: '문 · 출입구', color: '#2563eb' },
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

type ZoneType = 'general' | 'camera';

type ZoneRect = { x: number; y: number; w: number; h: number };

type ZoneEntry = { id: string; type: ZoneType; label: string; rect?: ZoneRect };

type DoorNode = { id: string; x: number; y: number; isFinalExit: boolean };

type ZoneRefSelection =
  | { kind: 'door'; id: string }
  | { kind: 'stair' }
  | { kind: 'zone'; id: string };

const GRID_SIZE = 20;

/* ── Mock SVG 도면 (3층 예시, Figma 레이아웃 매칭) ── */
const FLOOR_BOUNDS = { x: 20, y: 20, w: 520, h: 380 };

const FLOOR_WALLS: { x1: number; y1: number; x2: number; y2: number }[] = [
  { x1: 200, y1: 20, x2: 200, y2: 220 },
  { x1: 20, y1: 220, x2: 360, y2: 220 },
  { x1: 360, y1: 20, x2: 360, y2: 400 },
  { x1: 360, y1: 260, x2: 540, y2: 260 },
];

const INITIAL_STAIR_AREA: ZoneRect = { x: 380, y: 300, w: 120, h: 80 };

/* 기존(사전 등록) CCTV 장비에 시야 구역이 없을 경우 위치 기준으로 기본 구역을 만들어줌 */
const buildDefaultCctvZoneRect = (device: DeviceMarker): ZoneRect => {
  const size = 100;
  const cx = (device.x / 100) * 560;
  const cy = (device.y / 100) * 420;
  const clampedX = Math.min(
    Math.max(cx - size / 2, FLOOR_BOUNDS.x),
    FLOOR_BOUNDS.x + FLOOR_BOUNDS.w - size,
  );
  const clampedY = Math.min(
    Math.max(cy - size / 2, FLOOR_BOUNDS.y),
    FLOOR_BOUNDS.y + FLOOR_BOUNDS.h - size,
  );
  return {
    x: Math.round(clampedX / GRID_SIZE) * GRID_SIZE,
    y: Math.round(clampedY / GRID_SIZE) * GRID_SIZE,
    w: size,
    h: size,
  };
};

const isSameRect = (a: ZoneRect, b: ZoneRect): boolean =>
  a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

const INITIAL_DOOR_NODES: DoorNode[] = [
  { id: 'door-1', x: 110, y: 220, isFinalExit: false },
  { id: 'door-2', x: 280, y: 220, isFinalExit: false },
  { id: 'door-3', x: 360, y: 140, isFinalExit: false },
  { id: 'door-4', x: 450, y: 260, isFinalExit: false },
  { id: 'door-5', x: 360, y: 400, isFinalExit: false },
];

const GRID_LINES_X = Array.from(
  { length: Math.floor(FLOOR_BOUNDS.w / GRID_SIZE) + 1 },
  (_, i) => FLOOR_BOUNDS.x + i * GRID_SIZE,
);
const GRID_LINES_Y = Array.from(
  { length: Math.floor(FLOOR_BOUNDS.h / GRID_SIZE) + 1 },
  (_, i) => FLOOR_BOUNDS.y + i * GRID_SIZE,
);

const MockFloorMap3F = ({
  aiLayers,
  editMode,
  placingActive,
  zoneAddActive,
  zoneDraftRect,
  onZoneDraftChange,
  onZoneDragEnd,
  savedZones,
  stairArea,
  doorNodes,
  editingDoorId,
  onDoorNodeMove,
  selectedZoneRef,
  onZoneRefSelect,
  selectedCctvZoneId,
  onCctvZoneClick,
  poiMarkers,
  relocatingPoiId,
  onMapClick,
  onPoiClick,
  onBackgroundClick,
}: {
  aiLayers: Record<string, boolean>;
  editMode: EditMode;
  placingActive: boolean;
  zoneAddActive: boolean;
  zoneDraftRect: ZoneRect | null;
  onZoneDraftChange: (rect: ZoneRect | null) => void;
  onZoneDragEnd: () => void;
  savedZones: ZoneEntry[];
  stairArea: ZoneRect | null;
  doorNodes: DoorNode[];
  editingDoorId: string | null;
  onDoorNodeMove: (id: string, x: number, y: number) => void;
  selectedZoneRef: ZoneRefSelection | null;
  onZoneRefSelect: (ref: ZoneRefSelection) => void;
  selectedCctvZoneId: string | null;
  onCctvZoneClick: (zoneId: string) => void;
  poiMarkers: Array<{ id: string; x: number; y: number; label: string; poiType: string }>;
  relocatingPoiId: string | null;
  onMapClick: (x: number, y: number) => void;
  onPoiClick: (id: string) => void;
  onBackgroundClick: () => void;
}) => {
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const doorDragMovedRef = useRef(false);

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

  const handleDoorMouseDown = (e: React.MouseEvent<SVGGElement>, doorId: string) => {
    if (doorId !== editingDoorId) return;
    e.stopPropagation();
    e.preventDefault();
    doorDragMovedRef.current = false;
    const svgEl = e.currentTarget.ownerSVGElement;
    if (!svgEl) return;

    const onMove = (mv: MouseEvent) => {
      doorDragMovedRef.current = true;
      const point = svgPoint(mv.clientX, mv.clientY, svgEl);
      onDoorNodeMove(doorId, point.x, point.y);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const svgCursor =
    relocatingPoiId || editMode === 'poi' || placingActive || zoneAddActive
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
      {/* 배경 */}
      <rect width="560" height="420" fill="#f8f9fa" />

      {/* 외벽 (wall) */}
      {aiLayers.wall && (
        <rect
          x={FLOOR_BOUNDS.x}
          y={FLOOR_BOUNDS.y}
          width={FLOOR_BOUNDS.w}
          height={FLOOR_BOUNDS.h}
          fill="white"
          stroke="#374151"
          strokeWidth="2.5"
        />
      )}

      {/* 그리드 오버레이 */}
      {aiLayers.wall && (
        <g opacity={0.6}>
          {GRID_LINES_X.map((x) => (
            <line
              key={`gx-${x}`}
              x1={x}
              y1={FLOOR_BOUNDS.y}
              x2={x}
              y2={FLOOR_BOUNDS.y + FLOOR_BOUNDS.h}
              stroke="#b8bdc7"
              strokeWidth="1"
            />
          ))}
          {GRID_LINES_Y.map((y) => (
            <line
              key={`gy-${y}`}
              x1={FLOOR_BOUNDS.x}
              y1={y}
              x2={FLOOR_BOUNDS.x + FLOOR_BOUNDS.w}
              y2={y}
              stroke="#b8bdc7"
              strokeWidth="1"
            />
          ))}
        </g>
      )}

      {/* 내벽 (AI 세그멘테이션 결과) */}
      {aiLayers.room &&
        FLOOR_WALLS.map((w, i) => (
          <line
            key={`wall-${i}`}
            x1={w.x1}
            y1={w.y1}
            x2={w.x2}
            y2={w.y2}
            stroke="#374151"
            strokeWidth="2"
          />
        ))}

      {/* 계단 (AI 세그멘테이션 결과, 주황색 영역) */}
      {aiLayers.room &&
        stairArea &&
        (() => {
          const isStairSelected = selectedZoneRef?.kind === 'stair';
          return (
            <g
              onClick={(e) => {
                if (zoneAddActive) return;
                e.stopPropagation();
                onZoneRefSelect({ kind: 'stair' });
              }}
              style={{ cursor: zoneAddActive ? 'inherit' : 'pointer' }}
            >
              <rect
                x={stairArea.x}
                y={stairArea.y}
                width={stairArea.w}
                height={stairArea.h}
                fill="rgba(249,115,22,0.18)"
                stroke={isStairSelected ? '#2563eb' : '#f97316'}
                strokeWidth={isStairSelected ? '3' : '1.5'}
              />
              <text
                x={stairArea.x + stairArea.w / 2}
                y={stairArea.y + stairArea.h / 2 + 3}
                textAnchor="middle"
                fill="#c2410c"
                fontSize="10"
                fontFamily="sans-serif"
                style={{ pointerEvents: 'none' }}
              >
                계단
              </text>
            </g>
          );
        })()}

      {/* 문 · 출입구 (AI 세그멘테이션 결과, 사용자가 위치 보정 가능 · 최종 탈출구 지정은 우측 패널에서만) */}
      {aiLayers.room &&
        doorNodes.map((d) => {
          const isEditingThis = d.id === editingDoorId;
          const isSelected = selectedZoneRef?.kind === 'door' && selectedZoneRef.id === d.id;
          return (
            <g
              key={d.id}
              onMouseDown={(e) => handleDoorMouseDown(e, d.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (doorDragMovedRef.current) {
                  doorDragMovedRef.current = false;
                  return;
                }
                if (editingDoorId) return;
                onZoneRefSelect({ kind: 'door', id: d.id });
              }}
              style={{ cursor: isEditingThis ? 'grab' : 'pointer' }}
            >
              {isSelected && (
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={(d.isFinalExit ? 7 : 4) + 5}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                />
              )}
              <circle
                cx={d.x}
                cy={d.y}
                r={d.isFinalExit ? 7 : isEditingThis ? 6 : 4}
                fill={d.isFinalExit ? '#16a34a' : '#2563eb'}
                stroke={isEditingThis ? '#f59e0b' : d.isFinalExit ? 'white' : 'none'}
                strokeWidth={isEditingThis ? 3 : d.isFinalExit ? 2 : 0}
              />
              {d.isFinalExit && (
                <text
                  x={d.x}
                  y={d.y - 14}
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

      {/* 저장된 구역 — 카메라 시야는 해당 노드/카드를 선택했을 때만 표시 */}
      {savedZones.map((z) => {
        if (!z.rect) return null;
        const isSelected = selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === z.id;
        const isCctvLinked = selectedCctvZoneId === z.id;
        const highlighted = isSelected || isCctvLinked;
        if (z.type === 'camera' && !highlighted) return null;
        return (
          <g
            key={z.id}
            onClick={(e) => {
              if (zoneAddActive) return;
              e.stopPropagation();
              if (z.type === 'camera') {
                onCctvZoneClick(z.id);
              } else {
                onZoneRefSelect({ kind: 'zone', id: z.id });
              }
            }}
            style={{ cursor: zoneAddActive ? 'inherit' : 'pointer' }}
          >
            <rect
              x={z.rect.x}
              y={z.rect.y}
              width={z.rect.w}
              height={z.rect.h}
              fill={z.type === 'general' ? 'rgba(107,114,128,0.15)' : 'rgba(139,92,246,0.18)'}
              stroke={z.type === 'general' ? (isSelected ? '#2563eb' : '#6b7280') : '#8b5cf6'}
              strokeWidth={z.type === 'general' ? (isSelected ? '3' : '1.5') : '2'}
              strokeDasharray={z.type === 'camera' ? '4 3' : undefined}
            />
            {z.type === 'general' && (
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
            )}
          </g>
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

    const container = (e.currentTarget as HTMLElement).parentElement;
    if (!container) return;

    const onMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      didMove.current = true;
      const rect = container.getBoundingClientRect();
      const rawX = ((mv.clientX - rect.left) / rect.width) * 100;
      const rawY = ((mv.clientY - rect.top) / rect.height) * 100;
      onDragEnd(device.id, Math.max(0, Math.min(100, rawX)), Math.max(0, Math.min(100, rawY)));
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
 * 두 단계(정보 입력 → 위치 지정)로 구성. CCTV는 위치 지정 뒤 시야 범위 지정까지 총 세 단계.
 * 종료 버튼 규칙: 아직 생성되지 않는 중간 단계는 "다음", 실제로 저장되는 마지막 클릭만 "추가"로 통일
 * (구역추가 팝업과도 동일한 규칙 — 툴바의 "+ 노드 추가"/"+ 구역 추가"와 같은 동사로 시작·종료되게 함).
 */
const NodeAddPopup = ({
  containerRef,
  type,
  onTypeChange,
  stage,
  hasDraftRect,
  onCancel,
  onBack,
  onAdd,
  onFinalize,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  type: PlacingDeviceType;
  onTypeChange: (type: PlacingDeviceType) => void;
  stage: 'form' | 'position' | 'fov' | 'ready';
  hasDraftRect: boolean;
  onCancel: () => void;
  onBack: () => void;
  onAdd: (type: PlacingDeviceType, deviceId: string, location: string) => void;
  onFinalize: () => void;
}) => {
  const [deviceId, setDeviceId] = useState('');
  const [location, setLocation] = useState('');

  const isDoor = type === 'door';
  const isCctv = type === 'cctv';
  const totalSteps = isCctv ? 3 : 2;
  const stepNumber = stage === 'form' ? 1 : stage === 'position' ? 2 : totalSteps;

  if (stage !== 'form') {
    return (
      <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.nodeAddHeader}>
          <span className={styles.nodeAddTitle}>{DEVICE_PLACE_CONFIG[type].label} 위치 지정</span>
          <span className={styles.nodeAddStepBadge}>
            {stepNumber}/{totalSteps}
          </span>
        </div>
        <span className={styles.nodeAddHint}>
          {stage === 'position'
            ? '도면을 클릭해서 위치를 지정해주세요'
            : stage === 'fov'
              ? '도면을 드래그해서 카메라 시야 구역을 지정해주세요'
              : '위치 지정을 마쳤어요. 추가 버튼을 누르면 저장됩니다.'}
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
            disabled={stage === 'position' || (stage === 'fov' && !hasDraftRect)}
            onClick={onFinalize}
          >
            추가
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>노드 정보 입력</span>
        <span className={styles.nodeAddStepBadge}>
          {stepNumber}/{totalSteps}
        </span>
      </div>
      <span className={styles.nodeAddHint}>
        {isDoor
          ? '종류를 확인하고 다음을 누르면 위치를 지정할 수 있어요'
          : isCctv
            ? '정보를 입력하고 다음을 누르면 위치를 지정한 뒤 시야 범위까지 이어서 지정하게 돼요'
            : '정보를 입력하고 다음을 누르면 위치를 지정할 수 있어요'}
      </span>

      <div className={styles.nodeAddField}>
        <span className={styles.nodeAddLabel}>노드 종류</span>
        <div className={styles.deviceTypeChips}>
          {(['cctv', 'iot', 'light', 'door'] as const).map((t) => (
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

      {!isDoor && (
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
          disabled={!isDoor && !deviceId.trim()}
          onClick={() => onAdd(type, deviceId.trim(), location.trim())}
        >
          다음
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
  stairArea,
  doorNodes,
  editingDoorId,
  onDoorNodeMove,
  selectedZoneRef,
  onZoneRefSelect,
  selectedCctvZoneId,
  onCctvZoneClick,
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
  stairArea: ZoneRect | null;
  doorNodes: DoorNode[];
  editingDoorId: string | null;
  onDoorNodeMove: (id: string, x: number, y: number) => void;
  selectedZoneRef: ZoneRefSelection | null;
  onZoneRefSelect: (ref: ZoneRefSelection) => void;
  selectedCctvZoneId: string | null;
  onCctvZoneClick: (zoneId: string) => void;
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
  onUpload: () => void;
  onBackgroundClick: () => void;
}) => {
  const hasMockMap = floor.segmentationStatus === 'DONE';

  if (!hasMockMap) {
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
        aiLayers={aiLayers}
        editMode={editMode}
        placingActive={placingActive}
        zoneAddActive={zoneAddActive}
        zoneDraftRect={zoneDraftRect}
        onZoneDraftChange={onZoneDraftChange}
        onZoneDragEnd={onZoneDragEnd}
        savedZones={savedZones}
        stairArea={stairArea}
        doorNodes={doorNodes}
        editingDoorId={editingDoorId}
        onDoorNodeMove={onDoorNodeMove}
        selectedZoneRef={selectedZoneRef}
        onZoneRefSelect={onZoneRefSelect}
        selectedCctvZoneId={selectedCctvZoneId}
        onCctvZoneClick={onCctvZoneClick}
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

  const [floorBuildings, setFloorBuildings] = useState<FloorBuilding[]>([]);
  const [floor, setFloor] = useState<Floor | null>(null);
  const [loadingFloor, setLoadingFloor] = useState(false);

  // 빌딩 목록 (사이드바 셀렉터용)
  useEffect(() => {
    getFloorBuildings()
      .then(setFloorBuildings)
      .catch(() => {});
  }, []);

  // 현재 층 상세
  useEffect(() => {
    if (!floorId) return;
    setLoadingFloor(true);
    getFloorDetail(Number(floorId))
      .then(setFloor)
      .catch(() => {})
      .finally(() => setLoadingFloor(false));
  }, [floorId]);

  // 모든 CCTV 노드는 시야 구역이 필수 — 기존 등록 장비 중 누락된 것은 위치 기준으로 기본 구역을 채워 넣음
  useEffect(() => {
    if (!floor) return;
    const cctvDevices = floor.devices.filter((d) => d.type === 'cctv');
    if (cctvDevices.length === 0) return;
    setZones((prev) => {
      const missing = cctvDevices.filter(
        (d) => !prev.some((z) => z.type === 'camera' && z.label === `${d.label} 시야 구역`),
      );
      if (missing.length === 0) return prev;
      return [
        ...prev,
        ...missing.map((d) => ({
          id: `zone-cctv-${d.id}`,
          type: 'camera' as const,
          label: `${d.label} 시야 구역`,
          rect: buildDefaultCctvZoneRect(d),
        })),
      ];
    });
  }, [floor]);

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
  const [segmentTarget, setSegmentTarget] = useState<{ previewUrl: string } | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<PanelItem | null>(null);
  const [nodeAddOpen, setNodeAddOpen] = useState(false);
  const [zoneAddOpen, setZoneAddOpen] = useState(false);
  const [zones, setZones] = useState<ZoneEntry[]>([]);
  const [zoneDraftRect, setZoneDraftRectState] = useState<ZoneRect | null>(null);
  const zoneDraftRectRef = useRef<ZoneRect | null>(null);
  const setZoneDraftRect = (rect: ZoneRect | null) => {
    zoneDraftRectRef.current = rect;
    setZoneDraftRectState(rect);
  };
  const [topFilter, setTopFilter] = useState<'all' | 'device' | 'zone'>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<'cctv' | 'iot' | 'light' | null>(null);
  const [zoneTypeFilter, setZoneTypeFilter] = useState<'door' | 'stair' | 'general' | null>(null);
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
  const [doorNodes, setDoorNodes] = useState<DoorNode[]>(INITIAL_DOOR_NODES);
  const [stairArea, setStairArea] = useState<ZoneRect | null>(INITIAL_STAIR_AREA);
  const [editingDoorId, setEditingDoorId] = useState<string | null>(null);
  const [editingStair, setEditingStair] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneEditLabel, setZoneEditLabel] = useState('');
  // CCTV 카드 수정 중 해당 카메라의 시야 구역을 다시 드래그할 수 있게 하는 대상 구역 id
  const [editingCctvZoneId, setEditingCctvZoneId] = useState<string | null>(null);
  const [deviceDraftInfo, setDeviceDraftInfo] = useState<{
    deviceId: string;
    location: string;
  } | null>(null);
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
  const [toastMsg] = useState<string | null>(null);
  const [toastFading] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodePopupRef = useRef<HTMLDivElement>(null);
  const zonePopupRef = useRef<HTMLDivElement>(null);
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
      : selectedZoneRef?.kind === 'door' || selectedZoneRef?.kind === 'zone'
        ? selectedZoneRef.id
        : selectedZoneRef?.kind === 'stair'
          ? 'stair'
          : null;

  useEffect(() => {
    if (!focusedPanelId) return;
    const target = devicePanelRef.current?.querySelector(`[data-panel-id="${focusedPanelId}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedPanelId]);

  // 장비 추가 팝업: 팝업 및 도면 영역 바깥 클릭 시 닫기 (도면 클릭은 배치로 처리)
  // 정보 입력(1단계) 이후에는 위치·시야 지정 진행 상태가 있으므로 실수로 잃지 않도록 바깥 클릭으로 닫히지 않게 함
  useEffect(() => {
    if (!nodeAddOpen || deviceDraftInfo) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (nodePopupRef.current?.contains(target)) return;
      if (mapWrapRef.current?.contains(target)) return;
      setNodeAddOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [nodeAddOpen, deviceDraftInfo]);

  // 장비 추가 팝업이 닫히면 배치 진행 상태 초기화
  useEffect(() => {
    if (!nodeAddOpen) {
      setDeviceDraftInfo(null);
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

  const currentBuilding = floorBuildings.find((b) => String(b.id) === selectedBuildingId) ?? null;
  const currentFloor =
    currentBuilding?.floors.find((f) => String(f.id) === selectedFloorId) ?? null;

  const handleFloorChange = (newId: string) => {
    setSelectedFloorId(newId);
    setSelectedItem(null);
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    void navigate(`/floorPlans/${selectedBuildingId}/${newId}`);
  };

  const handleUploadConfirm = (file: File) => {
    if (!currentFloor) return;
    uploadFloor(Number(selectedBuildingId), currentFloor.floorNum, file)
      .then((newFloor) => {
        setFloorBuildings((prev) =>
          prev.map((b) =>
            String(b.id) !== selectedBuildingId
              ? b
              : {
                  ...b,
                  floors: b.floors.map((f) =>
                    f.id !== currentFloor.id ? f : { ...f, ...newFloor },
                  ),
                },
          ),
        );
        setSegmentTarget({ previewUrl: URL.createObjectURL(file) });
      })
      .finally(() => setUploadModalOpen(false));
  };

  const handleCloseSegmentModal = () => {
    if (segmentTarget) URL.revokeObjectURL(segmentTarget.previewUrl);
    setSegmentTarget(null);
  };

  const handleSegmentConfirm = (params: { area: number; gridScale: number }) => {
    if (!currentFloor) return;
    segmentFloor(currentFloor.id, params)
      .then(() => getFloorDetail(currentFloor.id))
      .then(setFloor)
      .finally(() => {
        if (segmentTarget) URL.revokeObjectURL(segmentTarget.previewUrl);
        setSegmentTarget(null);
      });
  };

  const handleMapClick = (x: number, y: number) => {
    if (relocatingPoiId) {
      setPoiMarkers((prev) => prev.map((m) => (m.id === relocatingPoiId ? { ...m, x, y } : m)));
      setRelocatingPoiId(null);
      return;
    }
    // 장치 배치 모드 (정보 입력 후 추가를 눌러야 위치 지정 단계로 진입)
    if (nodeAddOpen) {
      // x, y는 SVG 좌표(0-560, 0-420) → % 변환
      const pctX = (x / 560) * 100;
      const pctY = (y / 420) * 100;
      // 위치가 이미 지정된 뒤에는(예: 카메라 시야 구역 드래그 중 발생하는 클릭) 다시 덮어쓰지 않음
      if (deviceDraftInfo && !nodeStagedPosition) {
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

  const handleAddDevice = (_type: PlacingDeviceType, deviceId: string, location: string) => {
    // 모든 장비는 위치를 지정해야 최종 저장됨 — 팝업은 계속 열어둠
    setDeviceDraftInfo({ deviceId, location });
  };

  // 한 단계씩 되돌아가기: 위치(및 시야)가 지정된 상태면 그것만 취소, 아니면 정보 입력 단계로
  const handleNodeAddBack = () => {
    if (nodeStagedPosition) {
      setNodeStagedPosition(null);
      setZoneDraftRect(null);
    } else {
      setDeviceDraftInfo(null);
    }
  };

  const handleFinalizePlacement = () => {
    if (!deviceDraftInfo || !nodeStagedPosition) return;
    const cfg = DEVICE_PLACE_CONFIG[nodeAddType];

    if (nodeAddType === 'cctv') {
      const rect = zoneDraftRect;
      if (!rect || rect.w <= 0 || rect.h <= 0) return;
      const count = addedDevices.filter((d) => d.type === 'cctv').length + 1;
      const label = deviceDraftInfo.deviceId || `${cfg.label}-${String(count).padStart(2, '0')}`;
      setAddedDevices((prev) => [
        ...prev,
        {
          id: `added-cctv-${Date.now()}`,
          type: 'cctv',
          placeType: 'cctv',
          label,
          x: nodeStagedPosition.x,
          y: nodeStagedPosition.y,
          status: 'online',
          zone: deviceDraftInfo.location || '사용자 등록',
        },
      ]);
      setZones((prev) => [
        ...prev,
        { id: `zone-${Date.now()}`, type: 'camera', label: `${label} 시야 구역`, rect },
      ]);
    } else if (nodeAddType === 'door') {
      const x = Math.round(((nodeStagedPosition.x / 100) * 560) / GRID_SIZE) * GRID_SIZE;
      const y = Math.round(((nodeStagedPosition.y / 100) * 420) / GRID_SIZE) * GRID_SIZE;
      setDoorNodes((prev) => [...prev, { id: `door-${Date.now()}`, x, y, isFinalExit: false }]);
    } else {
      const count = addedDevices.filter((d) => d.type === 'iot').length + 1;
      setAddedDevices((prev) => [
        ...prev,
        {
          id: `added-${nodeAddType}-${Date.now()}`,
          type: 'iot',
          placeType: nodeAddType,
          label: deviceDraftInfo.deviceId || `${cfg.label}-${String(count).padStart(2, '0')}`,
          x: nodeStagedPosition.x,
          y: nodeStagedPosition.y,
          status: 'online',
          zone: deviceDraftInfo.location || '사용자 등록',
        },
      ]);
    }

    setDeviceDraftInfo(null);
    setNodeStagedPosition(null);
    setZoneDraftRect(null);
    setNodeAddOpen(false);
  };

  const handleZoneDragEnd = () => {
    const rect = zoneDraftRectRef.current;
    if (editingStair) {
      // 드래그만으로 바로 저장하지 않고 미리보기만 남겨둠 — 패널의 "완료" 버튼을 눌러야 반영됨
      return;
    }
    if (editingCctvZoneId) {
      if (rect && rect.w > 0 && rect.h > 0) {
        const zoneId = editingCctvZoneId;
        setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, rect } : z)));
      }
      setZoneDraftRect(null);
    }
  };

  const handleDoorNodeClick = (id: string) => {
    setDoorNodes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isFinalExit: !d.isFinalExit } : d)),
    );
  };

  const isSameZoneRef = (a: ZoneRefSelection | null, b: ZoneRefSelection): boolean => {
    if (!a || a.kind !== b.kind) return false;
    if (a.kind === 'door' && b.kind === 'door') return a.id === b.id;
    if (a.kind === 'zone' && b.kind === 'zone') return a.id === b.id;
    return a.kind === 'stair' && b.kind === 'stair';
  };

  // 우측 패널 카드 클릭 — 이미 필터를 통과해 보이는 카드이므로 필터는 건드리지 않음
  const handleZoneRefSelect = (ref: ZoneRefSelection) => {
    setSelectedItem(null);
    setEditingItemId(null);
    setSelectedZoneRef((prev) => (isSameZoneRef(prev, ref) ? null : ref));
  };

  // 도면 클릭 — 선택한 항목이 필터에 가려져 있을 수 있으므로 패널에 드러나도록 필터를 초기화
  const handleZoneRefSelectFromMap = (ref: ZoneRefSelection) => {
    handleZoneRefSelect(ref);
    setTopFilter((prev) => (prev === 'device' ? 'all' : prev));
    setZoneTypeFilter(null);
  };

  // 카메라 시야 구역을 도면에서 클릭하면 카메라 시야는 별도 카드가 없으므로 연결된 CCTV 장비를 선택
  const handleCctvZoneClick = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const cctvLabel = zone.label.replace(/ 시야 구역$/, '');
    const floorDevice = floor?.devices.find((d) => d.type === 'cctv' && d.label === cctvLabel);
    const addedDevice = addedDevices.find((d) => d.type === 'cctv' && d.label === cctvLabel);
    const device = floorDevice ?? (addedDevice as unknown as DeviceMarker | undefined);
    if (!device) return;
    setSelectedItem({ kind: 'device', data: device });
    setSelectedZoneRef(null);
    setTopFilter((prev) => (prev === 'zone' ? 'all' : prev));
  };

  const handleDoorNodeMove = (id: string, x: number, y: number) => {
    setDoorNodes((prev) => prev.map((d) => (d.id === id ? { ...d, x, y } : d)));
  };

  const handleDoorDelete = (id: string) => {
    setDoorNodes((prev) => prev.filter((d) => d.id !== id));
    setEditingDoorId((prev) => (prev === id ? null : prev));
  };

  const handleStartEditDoor = (id: string) => {
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setEditingStair(false);
    setEditingCctvZoneId(null);
    setEditingDoorId((prev) => (prev === id ? null : id));
  };

  const handleStartEditStair = () => {
    setNodeAddOpen(false);
    setZoneAddOpen(false);
    setEditingDoorId(null);
    setEditingCctvZoneId(null);
    setZoneDraftRect(null);
    setEditingStair(true);
  };

  // 계단 수정 완료 — 드래그로 그려둔 영역이 있으면 그때 반영하고 편집 모드 종료
  const handleFinishEditStair = () => {
    const rect = zoneDraftRectRef.current;
    if (rect && rect.w > 0 && rect.h > 0) setStairArea(rect);
    setEditingStair(false);
    setZoneDraftRect(null);
  };

  const handleStairDelete = () => {
    setStairArea(null);
    setEditingStair(false);
    setSelectedZoneRef((prev) => (prev?.kind === 'stair' ? null : prev));
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

  const selectedCctvZoneId =
    selectedItem?.kind === 'device' && selectedItem.data.type === 'cctv'
      ? (zones.find(
          (z) => z.type === 'camera' && z.label === `${selectedItem.data.label} 시야 구역`,
        )?.id ?? null)
      : null;

  const isDoorSelected = (id: string) =>
    selectedZoneRef?.kind === 'door' && selectedZoneRef.id === id;
  const isStairSelected = selectedZoneRef?.kind === 'stair';
  const isZoneSelected = (id: string) =>
    (selectedZoneRef?.kind === 'zone' && selectedZoneRef.id === id) || selectedCctvZoneId === id;

  const renderDoorCard = (d: DoorNode) => {
    const i = doorNodes.findIndex((x) => x.id === d.id);
    const isEditing = editingDoorId === d.id;
    return (
      <div
        key={d.id}
        data-panel-id={d.id}
        className={clsx(styles.deviceCard, isDoorSelected(d.id) && styles.deviceCardSelected)}
        onClick={() => handleZoneRefSelect({ kind: 'door', id: d.id })}
      >
        <div className={styles.zoneCardHeader}>
          <span className={styles.zoneCardTitleGroup}>
            <span className={clsx(styles.zoneCardDot, styles.zoneCardDotDoor)} />
            <span className={styles.deviceCardName}>문 · 출입구 {i + 1}</span>
          </span>
          <span className={styles.zoneCardHeaderActions}>
            <button
              type="button"
              className={d.isFinalExit ? styles.finalExitBadge : styles.finalExitToggle}
              onClick={(e) => {
                e.stopPropagation();
                handleDoorNodeClick(d.id);
              }}
            >
              {d.isFinalExit ? '최종 탈출구' : '탈출구로 지정'}
            </button>
            <button
              type="button"
              aria-label={isEditing ? '수정 완료' : '수정'}
              className={isEditing ? styles.zoneCardIconBtnDone : styles.zoneCardIconBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleStartEditDoor(d.id);
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
                handleDoorDelete(d.id);
              }}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </span>
        </div>
      </div>
    );
  };

  const renderStairCard = () => (
    <div
      data-panel-id="stair"
      className={clsx(styles.deviceCard, isStairSelected && styles.deviceCardSelected)}
      onClick={() => stairArea && handleZoneRefSelect({ kind: 'stair' })}
    >
      <div className={styles.zoneCardHeader}>
        <span className={styles.zoneCardTitleGroup}>
          <span className={clsx(styles.zoneCardDot, styles.zoneCardDotStair)} />
          <span className={styles.deviceCardName}>계단 영역</span>
        </span>
        <span className={styles.zoneCardHeaderActions}>
          <button
            type="button"
            aria-label={editingStair ? '수정 완료' : stairArea ? '수정' : '추가'}
            className={editingStair ? styles.zoneCardIconBtnDone : styles.zoneCardIconBtn}
            onClick={(e) => {
              e.stopPropagation();
              if (editingStair) {
                handleFinishEditStair();
              } else {
                handleStartEditStair();
              }
            }}
          >
            {editingStair ? (
              <CheckIcon width={14} height={14} />
            ) : (
              <EditIcon width={14} height={14} />
            )}
          </button>
          {stairArea && (
            <button
              type="button"
              aria-label="삭제"
              className={styles.zoneCardIconBtnDelete}
              onClick={(e) => {
                e.stopPropagation();
                handleStairDelete();
              }}
            >
              <TrashIcon width={14} height={14} />
            </button>
          )}
        </span>
      </div>
    </div>
  );

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
    if (item.type === 'cctv') {
      const zone = zones.find((z) => z.type === 'camera' && z.label === `${item.label} 시야 구역`);
      setEditingCctvZoneId(zone?.id ?? null);
    } else {
      setEditingCctvZoneId(null);
    }
  };

  const handleSaveEdit = (item: PanelItem) => {
    const oldLabel = item.label;
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
    }
    if (item.type === 'cctv' && newLabel !== oldLabel) {
      setZones((prev) =>
        prev.map((z) =>
          z.type === 'camera' && z.label === `${oldLabel} 시야 구역`
            ? { ...z, label: `${newLabel} 시야 구역` }
            : z,
        ),
      );
    }
    if (selectedItem?.kind === 'device' && selectedItem.data.id === item.id) {
      setSelectedItem({
        kind: 'device',
        data: { ...selectedItem.data, label: newLabel, zone: editForm.zone },
      });
    }
    setEditingItemId(null);
    setEditingCctvZoneId(null);
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
                    const isCurrent = String(f.id) === selectedFloorId;
                    const isNone = f.segmentationStatus === 'NONE';
                    return (
                      <button
                        key={f.id}
                        type="button"
                        className={clsx(
                          styles.floorNavItem,
                          isCurrent && styles.floorNavItemActive,
                        )}
                        onClick={() => handleFloorChange(String(f.id))}
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
              </div>
            )}

            {nodeAddOpen && (
              <NodeAddPopup
                containerRef={nodePopupRef}
                type={nodeAddType}
                onTypeChange={setNodeAddType}
                stage={
                  !deviceDraftInfo
                    ? 'form'
                    : !nodeStagedPosition
                      ? 'position'
                      : nodeAddType === 'cctv'
                        ? 'fov'
                        : 'ready'
                }
                hasDraftRect={!!zoneDraftRect && zoneDraftRect.w > 0 && zoneDraftRect.h > 0}
                onCancel={() => setNodeAddOpen(false)}
                onBack={handleNodeAddBack}
                onAdd={handleAddDevice}
                onFinalize={handleFinalizePlacement}
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

            {loadingFloor && (
              <div style={{ padding: '4rem', color: '#6b7280', fontSize: '1.4rem' }}>
                도면을 불러오는 중...
              </div>
            )}
            {!loadingFloor && currentFloor ? (
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
                  editingStair ||
                  !!editingCctvZoneId ||
                  (nodeAddType === 'cctv' && !!deviceDraftInfo && !!nodeStagedPosition)
                }
                zoneDraftRect={zoneDraftRect}
                onZoneDraftChange={setZoneDraftRect}
                onZoneDragEnd={handleZoneDragEnd}
                savedZones={zones}
                stairArea={stairArea}
                doorNodes={doorNodes}
                editingDoorId={editingDoorId}
                onDoorNodeMove={handleDoorNodeMove}
                selectedZoneRef={selectedZoneRef}
                onZoneRefSelect={handleZoneRefSelectFromMap}
                selectedCctvZoneId={selectedCctvZoneId}
                onCctvZoneClick={handleCctvZoneClick}
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
              </div>

              <div className={styles.nodeTypeLegendDivider} />

              <div className={styles.nodeTypeLegendSection}>
                <span className={styles.zoneLegendTitle}>구역 종류</span>
                <div className={styles.zoneLegendItem}>
                  <span className={clsx(styles.nodeTypeDot, styles.nodeTypeDotDoor)} />
                  <span className={styles.zoneLegendLabel}>문 · 출입구</span>
                </div>
                <div className={styles.zoneLegendItem}>
                  <span
                    className={clsx(styles.nodeTypeAreaSwatch, styles.nodeTypeAreaSwatchStair)}
                  />
                  <span className={styles.zoneLegendLabel}>계단</span>
                </div>
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
                    { key: 'device', label: '장비' },
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

              {topFilter === 'zone' && (
                <div className={styles.subFilterChips}>
                  {(
                    [
                      { key: 'door', label: '문 · 출입구' },
                      { key: 'stair', label: '계단' },
                      { key: 'general', label: '일반' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      className={clsx(
                        styles.subFilterChip,
                        zoneTypeFilter === key && styles.subFilterChipActive,
                      )}
                      onClick={() => setZoneTypeFilter((prev) => (prev === key ? null : key))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.devicePanelList}>
              {topFilter !== 'zone' &&
                (panelItems.length === 0
                  ? topFilter === 'device' && (
                      <p className={styles.devicePanelEmpty}>표시할 장비가 없습니다</p>
                    )
                  : panelItems.map((item) => (
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
                      />
                    )))}

              {topFilter !== 'device' && (
                <>
                  {(!zoneTypeFilter || zoneTypeFilter === 'door') &&
                    doorNodes.map((d) => renderDoorCard(d))}

                  {(!zoneTypeFilter || zoneTypeFilter === 'stair') && renderStairCard()}

                  {zones
                    .filter((z) => z.type === 'general')
                    .filter((z) => !zoneTypeFilter || zoneTypeFilter === z.type)
                    .map((z) => renderZoneCard(z))}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      <FloorUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        buildingName={currentBuilding?.name ?? ''}
        floorNum={currentFloor?.floorNum ?? 0}
        onConfirm={handleUploadConfirm}
      />

      {segmentTarget && (
        <GridAreaSettingModal
          open
          onClose={handleCloseSegmentModal}
          mapImageUrl={segmentTarget.previewUrl}
          onConfirm={handleSegmentConfirm}
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
    </>
  );
};

export default FloorPlansDetailPage;
