import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';
import XIcon from '@assets/icons/ic-x.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import Dropdown from '@components/dropdown';
import GNB from '@components/gnb';

import { getFloorBuildings, getFloorDetail } from './api/floorPlansApi';
import * as styles from './FloorPlansDetailPage.css';
import { mockFloorBuildings } from './mocks/floorPlansData';

import type {
  AiLayer,
  DeviceMarker,
  EditMode,
  Floor,
  PoiMarker,
  SegmentationStatus,
} from './types/floorPlans';

/* ── 유틸 ── */
const formatFloor = (n: number) => (n > 0 ? `${n}층` : n < 0 ? `B${Math.abs(n)}층` : '1층');

const AI_LAYERS: { key: AiLayer; label: string }[] = [
  { key: 'wall', label: '벽' },
  { key: 'corridor', label: '복도' },
  { key: 'stairwell', label: '계단실' },
  { key: 'exit', label: '비상구' },
  { key: 'room', label: '방' },
];

const MODE_CONFIG: { mode: EditMode; label: string }[] = [
  { mode: 'view', label: '보기' },
  { mode: 'poi', label: 'POI 편집' },
  { mode: 'simulation', label: '경로 시뮬레이션' },
];

type SelectedItem = { kind: 'device'; data: DeviceMarker } | { kind: 'poi'; data: PoiMarker };

type PoiType = 'exit' | 'stair' | 'extinguisher' | 'assembly' | 'firstaid';

const POI_TYPE_CONFIG: Record<PoiType, { label: string; color: string; icon: string }> = {
  exit: { label: '비상구', color: '#16a34a', icon: 'E' },
  stair: { label: '계단', color: '#2563eb', icon: '▲' },
  extinguisher: { label: '소화기', color: '#dc2626', icon: 'F' },
  assembly: { label: '집결지', color: '#7c3aed', icon: 'A' },
  firstaid: { label: '구급함', color: '#0891b2', icon: '+' },
};

type PlacingDeviceType = 'cctv' | 'iot';

const DEVICE_PLACE_CONFIG: Record<PlacingDeviceType, { label: string; color: string }> = {
  cctv: { label: 'CCTV', color: '#2563eb' },
  iot: { label: 'IoT 유도등', color: '#16a34a' },
};

type AddedDevice = {
  id: string;
  type: PlacingDeviceType;
  label: string;
  x: number; // %
  y: number; // %
  status: 'online';
  zone: string;
};

/* ── 경로탐색 헬퍼 ── */
type Pt = { x: number; y: number };

/* 복도 양쪽 외벽에 비상구 위치 */
const DOOR_PTS = {
  room301: { x: 110, y: 195 },
  room302: { x: 400, y: 195 },
  room303: { x: 110, y: 225 },
  room304: { x: 400, y: 225 },
};

const EXIT_PTS = {
  A: { x: 22, y: 210 }, // 좌측 외벽 복도 높이
  B: { x: 538, y: 210 }, // 우측 외벽 복도 높이
};

const CORR_Y = 210; // 복도 중심 Y

function getZone(
  x: number,
  y: number,
): 'room301' | 'room302' | 'room303' | 'room304' | 'corridor' | 'other' {
  if (x >= 20 && x <= 250 && y >= 20 && y <= 195) return 'room301';
  if (x >= 310 && x <= 540 && y >= 20 && y <= 195) return 'room302';
  if (x >= 20 && x <= 250 && y >= 225 && y <= 380) return 'room303';
  if (x >= 310 && x <= 540 && y >= 225 && y <= 380) return 'room304';
  if (y >= 195 && y <= 225) return 'corridor';
  return 'other';
}

function computeEvacPath(start: Pt, isExitB: boolean): Pt[] {
  const exitPt = isExitB ? EXIT_PTS.B : EXIT_PTS.A;
  const path: Pt[] = [start];
  const zone = getZone(start.x, start.y);

  // Step 1: 시작 방 → 복도 문
  const doorMap: Record<string, Pt> = {
    room301: DOOR_PTS.room301,
    room302: DOOR_PTS.room302,
    room303: DOOR_PTS.room303,
    room304: DOOR_PTS.room304,
  };
  if (doorMap[zone]) {
    const door = doorMap[zone];
    // 방 안에서 문 방향으로 직선 이동 후 문 통과
    path.push({ x: start.x, y: door.y });
    path.push(door);
  }

  // Step 2: 복도 중심선(Y=210)에 맞추기
  const last = path[path.length - 1];
  if (Math.abs(last.y - CORR_Y) > 3) {
    path.push({ x: last.x, y: CORR_Y });
  }

  // Step 3: 복도를 수평으로 이동 → 비상구(외벽)
  const currX = path[path.length - 1].x;
  if (Math.abs(currX - exitPt.x) > 10) {
    path.push({ x: exitPt.x, y: CORR_Y });
  }
  path.push(exitPt);

  return path;
}

function interpolatePoly(pts: Pt[], t: number): Pt {
  let total = 0;
  const segs = pts.slice(1).map((p, i) => {
    const dx = p.x - pts[i].x;
    const dy = p.y - pts[i].y;
    const len = Math.hypot(dx, dy);
    total += len;
    return { dx, dy, len };
  });
  const target = t * total;
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    const { dx, dy, len } = segs[i];
    if (acc + len >= target) {
      const r = len > 0 ? (target - acc) / len : 0;
      return { x: pts[i].x + r * dx, y: pts[i].y + r * dy };
    }
    acc += len;
  }
  return pts[pts.length - 1];
}

function polyLen(pts: Pt[]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return total;
}

function isNear(a: Pt, b: Pt, d = 55): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < d;
}

/* ── Mock SVG 도면 (3층 예시) ── */
const ROOMS: {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  baseFill: string;
}[] = [
  {
    id: 'room-301',
    label: 'ROOM 301',
    x: 20,
    y: 20,
    w: 230,
    h: 175,
    baseFill: 'rgba(254,226,226,0.5)',
  },
  {
    id: 'room-302',
    label: 'ROOM 302',
    x: 310,
    y: 20,
    w: 230,
    h: 175,
    baseFill: 'rgba(255,237,213,0.5)',
  },
  {
    id: 'room-303',
    label: 'ROOM 303',
    x: 20,
    y: 225,
    w: 230,
    h: 155,
    baseFill: 'rgba(243,244,246,0.5)',
  },
  {
    id: 'room-304',
    label: 'ROOM 304',
    x: 310,
    y: 225,
    w: 230,
    h: 155,
    baseFill: 'rgba(243,244,246,0.5)',
  },
];

const MockFloorMap3F = ({
  aiLayers,
  showHeatmap,
  evacPath,
  isPathDanger,
  editMode,
  poiMarkers,
  simAnimating,
  simDone,
  editingPoiId,
  relocatingPoiId,
  fireMarkers,
  simStart,
  simClickMode,
  onMapClick,
  onFireMapClick,
  onFireMarkerDelete: handleFireMarkerDelete,
  onPoiClick,
  onPoiLabelChange,
  onPoiDelete,
  onPoiRelocate,
  onPoiPopoverClose,
}: {
  aiLayers: Record<string, boolean>;
  showHeatmap: boolean;
  evacPath: Pt[] | null;
  isPathDanger: boolean;
  editMode: EditMode;
  poiMarkers: Array<{ id: string; x: number; y: number; label: string }>;
  simAnimating: boolean;
  simDone: boolean;
  editingPoiId: string | null;
  relocatingPoiId: string | null;
  fireMarkers: Array<{ id: string; x: number; y: number }>;
  simStart: { x: number; y: number } | null;
  simClickMode: 'fire' | 'start' | null;
  onMapClick: (x: number, y: number) => void;
  onFireMapClick: (x: number, y: number) => void;
  onFireMarkerDelete: (id: string) => void;
  onPoiClick: (id: string) => void;
  onPoiLabelChange: (id: string, label: string) => void;
  onPoiDelete: (id: string) => void;
  onPoiRelocate: (id: string) => void;
  onPoiPopoverClose: () => void;
}) => {
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 560);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 420);
    if (simClickMode === 'start' || simClickMode === 'fire') {
      onFireMapClick(x, y);
      return;
    }
    if (editMode === 'poi') {
      onMapClick(x, y);
      return;
    }
  };

  const svgCursor =
    relocatingPoiId || simClickMode === 'start' || simClickMode === 'fire'
      ? 'crosshair'
      : editMode === 'poi'
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
    >
      {/* 배경 */}
      <rect width="560" height="420" fill="#f8f9fa" />

      {/* 외벽 (wall) */}
      {aiLayers.wall && (
        <rect
          x="20"
          y="20"
          width="520"
          height="380"
          fill="none"
          stroke="#374151"
          strokeWidth="2.5"
        />
      )}

      {/* 실 (room) */}
      {aiLayers.room &&
        ROOMS.map((room) => (
          <g key={room.id}>
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              fill={room.baseFill}
              stroke="#d1d5db"
              strokeWidth={1}
            />
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 + 4}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="12"
              fontFamily="sans-serif"
            >
              {room.label}
            </text>
          </g>
        ))}

      {/* 복도 (corridor) */}
      {aiLayers.corridor && (
        <rect
          x="20"
          y="195"
          width="520"
          height="30"
          fill="rgba(219,234,254,0.4)"
          stroke="#bfdbfe"
          strokeWidth="1"
        />
      )}

      {/* 계단실 (stairwell) */}
      {aiLayers.stairwell && (
        <>
          <rect
            x="250"
            y="185"
            width="60"
            height="40"
            fill="rgba(191,219,254,0.7)"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
          <text
            x="280"
            y="209"
            textAnchor="middle"
            fill="#1d4ed8"
            fontSize="10"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            STAIR
          </text>
        </>
      )}

      {/* 비상구 (exit) — 복도 좌우 외벽 */}
      {aiLayers.exit && (
        <>
          {/* EXIT A — 좌측 외벽 (복도 높이) */}
          <rect x="16" y="198" width="8" height="24" fill="white" />
          <circle cx="22" cy="210" r="16" fill="#16a34a" />
          <text
            x="22"
            y="214"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            E
          </text>
          <text
            x="22"
            y="236"
            textAnchor="middle"
            fill="#16a34a"
            fontSize="9"
            fontFamily="sans-serif"
          >
            EXIT A
          </text>
          {/* EXIT B — 우측 외벽 (복도 높이) */}
          <rect x="536" y="198" width="8" height="24" fill="white" />
          <circle cx="538" cy="210" r="16" fill="#16a34a" />
          <text
            x="538"
            y="214"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            E
          </text>
          <text
            x="538"
            y="236"
            textAnchor="middle"
            fill="#16a34a"
            fontSize="9"
            fontFamily="sans-serif"
          >
            EXIT B
          </text>
        </>
      )}

      {/* 시뮬레이션 경로 */}
      {evacPath &&
        evacPath.length > 1 &&
        (() => {
          const stroke = isPathDanger ? '#f97316' : '#3b82f6';
          const d = evacPath.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
          return (
            <g>
              <path
                key={simAnimating ? 'anim' : 'static'}
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="300"
                className={simAnimating ? styles.simPathAnimated : undefined}
                strokeDasharray={simAnimating ? undefined : '8 5'}
              />
              {(simAnimating || simDone) &&
                [0.1, 0.28, 0.46, 0.64, 0.82].map((t) => {
                  const p = interpolatePoly(evacPath, t);
                  return <circle key={t} cx={p.x} cy={p.y} r="5" fill={stroke} opacity="0.8" />;
                })}
            </g>
          );
        })()}

      {/* 혼잡도 히트맵 */}
      {showHeatmap && (
        <g opacity="0.4">
          <ellipse cx="140" cy="240" rx="70" ry="50" fill="#ef4444" />
          <ellipse cx="350" cy="255" rx="55" ry="40" fill="#f97316" />
          <ellipse cx="220" cy="290" rx="40" ry="35" fill="#eab308" />
        </g>
      )}

      {/* 문 (door) — 복도와 각 방 사이 */}
      {aiLayers.room && (
        <g>
          {/* ROOM 301 → 복도 문 */}
          <rect x="85" y="192" width="50" height="6" fill="white" />
          <line x1="85" y1="195" x2="85" y2="170" stroke="#374151" strokeWidth="1.2" />
          <path
            d="M 85 170 A 25 25 0 0 1 110 195"
            fill="rgba(219,234,254,0.3)"
            stroke="#374151"
            strokeWidth="1"
          />
          {/* ROOM 302 → 복도 문 */}
          <rect x="375" y="192" width="50" height="6" fill="white" />
          <line x1="425" y1="195" x2="425" y2="170" stroke="#374151" strokeWidth="1.2" />
          <path
            d="M 425 170 A 25 25 0 0 0 400 195"
            fill="rgba(219,234,254,0.3)"
            stroke="#374151"
            strokeWidth="1"
          />
          {/* ROOM 303 → 복도 문 */}
          <rect x="85" y="222" width="50" height="6" fill="white" />
          <line x1="85" y1="225" x2="85" y2="250" stroke="#374151" strokeWidth="1.2" />
          <path
            d="M 85 250 A 25 25 0 0 0 110 225"
            fill="rgba(219,234,254,0.3)"
            stroke="#374151"
            strokeWidth="1"
          />
          {/* ROOM 304 → 복도 문 */}
          <rect x="375" y="222" width="50" height="6" fill="white" />
          <line x1="425" y1="225" x2="425" y2="250" stroke="#374151" strokeWidth="1.2" />
          <path
            d="M 425 250 A 25 25 0 0 1 400 225"
            fill="rgba(219,234,254,0.3)"
            stroke="#374151"
            strokeWidth="1"
          />
        </g>
      )}

      {/* 훈련 시작 위치 마커 */}
      {simStart && (
        <g>
          <circle
            cx={simStart.x}
            cy={simStart.y}
            r="15"
            fill="#16a34a"
            stroke="white"
            strokeWidth="2"
            opacity="0.95"
          />
          <text
            x={simStart.x}
            y={simStart.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            S
          </text>
          <text
            x={simStart.x}
            y={simStart.y + 28}
            textAnchor="middle"
            fill="#16a34a"
            fontSize="9"
            fontFamily="sans-serif"
          >
            시작위치
          </text>
        </g>
      )}

      {/* 임의 화재 마커 (POI 방식) */}
      {fireMarkers.map((m) => (
        <g
          key={m.id}
          onClick={(e) => {
            e.stopPropagation();
            handleFireMarkerDelete(m.id);
          }}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx={m.x}
            cy={m.y}
            r="14"
            fill="#ef4444"
            stroke="white"
            strokeWidth="2"
            opacity="0.9"
          />
          <text
            x={m.x}
            y={m.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="13"
            fontFamily="sans-serif"
          >
            🔥
          </text>
          <title>클릭해서 화재 마커 삭제</title>
        </g>
      ))}

      {/* POI 마커 */}
      {poiMarkers.map((m) => {
        const isRelocating = relocatingPoiId === m.id;
        const cfg = POI_TYPE_CONFIG[m.poiType as PoiType] ?? POI_TYPE_CONFIG.custom;
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
  zoom,
  onClick,
  onDragEnd,
}: {
  device: DeviceMarker;
  posX: number;
  posY: number;
  selected: boolean;
  draggable: boolean;
  zoom: number;
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

    const scale = zoom / 100;

    const onMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      didMove.current = true;
      const rect = container.getBoundingClientRect();
      const rawX = ((mv.clientX - rect.left) / scale / rect.width) * 100 * scale;
      const rawY = ((mv.clientY - rect.top) / scale / rect.height) * 100 * scale;
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

/* ── 선택 정보 패널 ── */
const InfoPanel = ({ selected, onClose }: { selected: SelectedItem; onClose: () => void }) => {
  if (selected.kind === 'device') {
    const d = selected.data;
    return (
      <div className={styles.infoPanel}>
        <div className={styles.infoPanelHeader}>
          <span className={styles.infoPanelTitle}>선택 정보 · {d.label}</span>
          <button
            type="button"
            className={styles.infoPanelClose}
            onClick={onClose}
            aria-label="닫기"
          >
            <XIcon width={14} height={14} />
          </button>
        </div>
        {d.type === 'cctv' && <div className={styles.infoPanelThumb}>CCTV thumbnail</div>}
        <div className={styles.infoPanelRow}>
          <span className={styles.infoPanelKey}>장치 ID</span>
          <span className={styles.infoPanelValue}>{d.id.toUpperCase()}</span>
        </div>
        {d.model && (
          <div className={styles.infoPanelRow}>
            <span className={styles.infoPanelKey}>모델</span>
            <span className={styles.infoPanelValue}>{d.model}</span>
          </div>
        )}
        <div className={styles.infoPanelRow}>
          <span className={styles.infoPanelKey}>상태</span>
          <StatusBadge
            label={d.status === 'online' ? '실시간' : '오프라인'}
            color={d.status === 'online' ? 'green' : 'neutral'}
            dot
          />
        </div>
        {d.resolution && (
          <div className={styles.infoPanelRow}>
            <span className={styles.infoPanelKey}>해상도</span>
            <span className={styles.infoPanelValue}>{d.resolution}</span>
          </div>
        )}
        <div className={styles.infoPanelRow}>
          <span className={styles.infoPanelKey}>설치 위치</span>
          <span className={styles.infoPanelValue}>{d.zone}</span>
        </div>
        <div className={styles.infoPanelActions}>
          <Button
            variant="outlined"
            size="sm"
            className={styles.infoPanelActionBtn}
            onClick={onClose}
          >
            설정
          </Button>
          <Button variant="primary" size="sm" className={styles.infoPanelActionBtn}>
            스트림 보기
          </Button>
        </div>
      </div>
    );
  }

  const p = selected.data;
  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <span className={styles.infoPanelTitle}>선택 정보 · {p.label}</span>
        <button type="button" className={styles.infoPanelClose} onClick={onClose} aria-label="닫기">
          <XIcon width={14} height={14} />
        </button>
      </div>
      <div className={styles.infoPanelRow}>
        <span className={styles.infoPanelKey}>유형</span>
        <span className={styles.infoPanelValue}>
          {p.type === 'exit' ? '비상구' : p.type === 'stair' ? '계단' : '화재 구역'}
        </span>
      </div>
    </div>
  );
};

/* ── 도면 캔버스 ── */
const FloorCanvas = ({
  floor,
  selected,
  aiLayers,
  showHeatmap,
  zoom,
  evacPath,
  isPathDanger,
  editMode,
  poiMarkers,
  simAnimating,
  simDone,
  editingPoiId,
  relocatingPoiId,
  fireMarkers,
  simStart,
  simClickMode,
  devicePositions,
  addedDevices,
  onAddedDeviceDelete,
  onSelectDevice,
  onMapClick,
  onFireMapClick,
  onFireMarkerDelete,
  onPoiClick,
  onPoiLabelChange,
  onPoiDelete,
  onPoiRelocate,
  onPoiPopoverClose,
  onDeviceMoved,
}: {
  floor: Floor;
  selected: SelectedItem | null;
  aiLayers: Record<string, boolean>;
  showHeatmap: boolean;
  zoom: number;
  evacPath: Pt[] | null;
  isPathDanger: boolean;
  editMode: EditMode;
  poiMarkers: Array<{ id: string; x: number; y: number; label: string }>;
  simAnimating: boolean;
  simDone: boolean;
  editingPoiId: string | null;
  relocatingPoiId: string | null;
  fireMarkers: Array<{ id: string; x: number; y: number }>;
  simStart: { x: number; y: number } | null;
  simClickMode: 'fire' | 'start' | null;
  devicePositions: Record<string, { x: number; y: number }>;
  addedDevices: AddedDevice[];
  onAddedDeviceDelete: (id: string) => void;
  onSelectDevice: (d: DeviceMarker) => void;
  onMapClick: (x: number, y: number) => void;
  onFireMapClick: (x: number, y: number) => void;
  onFireMarkerDelete: (id: string) => void;
  onPoiClick: (id: string) => void;
  onPoiLabelChange: (id: string, label: string) => void;
  onPoiDelete: (id: string) => void;
  onPoiRelocate: (id: string) => void;
  onPoiPopoverClose: () => void;
  onDeviceMoved: (id: string, x: number, y: number) => void;
}) => {
  const hasMockMap = floor.segmentationStatus === 'DONE';

  if (!hasMockMap) {
    return (
      <div className={styles.canvasPlaceholder}>
        <span className={styles.canvasPlaceholderTitle}>등록된 도면이 없습니다</span>
        <p style={{ color: 'inherit', margin: 0 }}>
          도면을 업로드하거나 AI 영역 분할을 실행해 주세요
        </p>
        <Button variant="primary" size="sm" onClick={() => {}}>
          도면 업로드
        </Button>
      </div>
    );
  }

  const scale = zoom / 100;

  return (
    <div className={styles.mapWrap} style={{ transform: `scale(${scale})` }}>
      <MockFloorMap3F
        aiLayers={aiLayers}
        showHeatmap={showHeatmap}
        evacPath={evacPath}
        isPathDanger={isPathDanger}
        editMode={editMode}
        poiMarkers={poiMarkers}
        simAnimating={simAnimating}
        simDone={simDone}
        editingPoiId={editingPoiId}
        relocatingPoiId={relocatingPoiId}
        fireMarkers={fireMarkers}
        simStart={simStart}
        simClickMode={simClickMode}
        onMapClick={onMapClick}
        onFireMapClick={onFireMapClick}
        onFireMarkerDelete={onFireMarkerDelete}
        onPoiClick={onPoiClick}
        onPoiLabelChange={onPoiLabelChange}
        onPoiDelete={onPoiDelete}
        onPoiRelocate={onPoiRelocate}
        onPoiPopoverClose={onPoiPopoverClose}
      />
      {floor.devices.map((device) => {
        const pos = devicePositions[device.id] ?? { x: device.x, y: device.y };
        return (
          <DevicePin
            key={device.id}
            device={device}
            posX={pos.x}
            posY={pos.y}
            selected={selected?.kind === 'device' && selected.data.id === device.id}
            draggable={editMode === 'view'}
            zoom={zoom}
            onClick={() => onSelectDevice(device)}
            onDragEnd={onDeviceMoved}
          />
        );
      })}

      {/* 사용자가 추가한 장치 마커 */}
      {addedDevices.map((d) => {
        const pos = devicePositions[d.id] ?? { x: d.x, y: d.y };
        const color = DEVICE_PLACE_CONFIG[d.type].color;
        return (
          <div
            key={d.id}
            className={styles.markerWrap}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={styles.markerCircle}
              style={{ backgroundColor: color, border: `2px dashed white`, cursor: 'pointer' }}
              title={d.label}
              onClick={() => onAddedDeviceDelete(d.id)}
            >
              {d.type === 'cctv' ? (
                <CameraIcon width={12} height={12} aria-hidden="true" />
              ) : (
                <WifiIcon width={12} height={12} aria-hidden="true" />
              )}
            </div>
            <span className={styles.markerLabel} style={{ color }}>
              {d.label}
            </span>
          </div>
        );
      })}

      {/* POI 편집 팝오버 — SVG 바깥 절대 위치 (잘림 없음) */}
      {editingPoiId &&
        (() => {
          const poi = poiMarkers.find((m) => m.id === editingPoiId);
          if (!poi) return null;
          const cfg = POI_TYPE_CONFIG[poi.poiType as PoiType] ?? POI_TYPE_CONFIG.custom;
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

  const [floorBuildings, setFloorBuildings] = useState(mockFloorBuildings);
  const [floor, setFloor] = useState(
    () => mockFloorBuildings.flatMap((b) => b.floors).find((f) => String(f.id) === floorId) ?? null,
  );
  const [loadingFloor, setLoadingFloor] = useState(false);

  const building = floorBuildings.find((b) => String(b.id) === buildingId) ?? null;

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

  const [selectedBuildingId, setSelectedBuildingId] = useState(buildingId ?? '');
  const [selectedFloorId, setSelectedFloorId] = useState(floorId ?? '');
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [aiLayers, setAiLayers] = useState<Record<AiLayer, boolean>>({
    wall: true,
    corridor: true,
    stairwell: true,
    exit: true,
    room: true,
  });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedExit, setSelectedExit] = useState('');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [simStart, setSimStart] = useState<{ x: number; y: number } | null>(null);
  const [simClickMode, setSimClickMode] = useState<'fire' | 'start' | null>(null);
  const [segStatusOverride, setSegStatusOverride] = useState<SegmentationStatus | null>(null);
  const [poiMarkers, setPoiMarkers] = useState<
    Array<{ id: string; x: number; y: number; label: string; poiType: PoiType }>
  >([]);
  const [selectedPoiType, setSelectedPoiType] = useState<PoiType>('exit');
  const [placingDeviceType, setPlacingDeviceType] = useState<PlacingDeviceType | null>(null);
  const [addedDevices, setAddedDevices] = useState<AddedDevice[]>([]);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [relocatingPoiId, setRelocatingPoiId] = useState<string | null>(null);
  const [fireMarkers, setFireMarkers] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [devicePositions, setDevicePositions] = useState<Record<string, { x: number; y: number }>>(
    {},
  );

  const handleDeviceMoved = (id: string, x: number, y: number) => {
    setDevicePositions((prev) => ({ ...prev, [id]: { x, y } }));
  };
  const [simState, setSimState] = useState<'idle' | 'running' | 'done'>('idle');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastFading, setToastFading] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    setToastFading(false);
    toastTimerRef.current = setTimeout(() => {
      setToastFading(true);
      toastTimerRef.current = setTimeout(() => setToastMsg(null), 300);
    }, 2200);
  };

  const TOAST_MSG: Partial<Record<EditMode, string>> = {
    view: '보기 모드',
    poi: 'POI 편집 모드 · 도면을 클릭해 마커를 추가하세요',
  };

  const handleEditModeChange = (mode: EditMode) => {
    setEditMode(mode);
    setEditingPoiId(null);
    setRelocatingPoiId(null);
    setSimClickMode(null);
    const msg = TOAST_MSG[mode];
    if (msg) showToast(msg);
  };

  const currentBuilding = floorBuildings.find((b) => String(b.id) === selectedBuildingId) ?? null;
  const currentFloor =
    currentBuilding?.floors.find((f) => String(f.id) === selectedFloorId) ?? null;

  const FLOOR_STATUS_LABEL: Record<string, string> = {
    NONE: '미등록',
    PENDING: '대기중',
    PROCESSING: '처리중',
    DONE: '등록완료',
    FAILED: '오류',
  };

  const buildingOptions = floorBuildings.map((b) => ({ label: b.name, value: String(b.id) }));
  const floorOptions =
    currentBuilding?.floors.map((f) => ({
      label: `${formatFloor(f.floorNum)}  ·  ${FLOOR_STATUS_LABEL[f.segmentationStatus]}`,
      value: String(f.id),
    })) ?? [];

  const exitOptions = (currentFloor?.pois ?? [])
    .filter((p) => p.type === 'exit')
    .map((p) => ({ label: p.label, value: p.id }));

  const selectedExitLabel = exitOptions.find((o) => o.value === selectedExit)?.label ?? '';
  const isExitB = selectedExitLabel.toUpperCase().includes('B');
  const evacPath = selectedExit ? computeEvacPath(simStart ?? { x: 280, y: 210 }, isExitB) : null;
  const allDoors = Object.values(DOOR_PTS);
  const isPathDanger = fireMarkers.some((f) => allDoors.some((d) => isNear(f, d)));

  const handleBuildingChange = (newId: string) => {
    const newBuilding = floorBuildings.find((b) => String(b.id) === newId);
    const firstFloor = newBuilding?.floors[0];
    setSelectedBuildingId(newId);
    setSelectedFloorId(firstFloor ? String(firstFloor.id) : '');
    setSelectedItem(null);
    setSelectedExit('');
    setFireMarkers([]);
    setSimStart(null);
    if (firstFloor) void navigate(`/floorPlans/${newId}/${firstFloor.id}`);
  };

  const handleFloorChange = (newId: string) => {
    setSelectedFloorId(newId);
    setSelectedItem(null);
    setSelectedExit('');
    setFireMarkers([]);
    setSimStart(null);
    setSimState('idle');
    void navigate(`/floorPlans/${selectedBuildingId}/${newId}`);
  };

  const toggleAiLayer = (key: AiLayer) => {
    setAiLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const baseStatus = currentFloor?.segmentationStatus ?? 'NONE';
  const segStatus = segStatusOverride ?? baseStatus;
  const isDone = segStatus === 'DONE';
  const isProcessing = segStatus === 'PROCESSING';
  const canRunAI = segStatus === 'NONE' || segStatus === 'FAILED' || segStatus === 'DONE';

  const handleMapClick = (x: number, y: number) => {
    if (relocatingPoiId) {
      setPoiMarkers((prev) => prev.map((m) => (m.id === relocatingPoiId ? { ...m, x, y } : m)));
      setRelocatingPoiId(null);
      return;
    }
    // 장치 배치 모드
    if (placingDeviceType) {
      const cfg = DEVICE_PLACE_CONFIG[placingDeviceType];
      const count = addedDevices.filter((d) => d.type === placingDeviceType).length + 1;
      const id = `added-${placingDeviceType}-${Date.now()}`;
      // x, y는 SVG 좌표(0-560, 0-420) → % 변환
      const pctX = (x / 560) * 100;
      const pctY = (y / 420) * 100;
      setAddedDevices((prev) => [
        ...prev,
        {
          id,
          type: placingDeviceType,
          label: `${cfg.label}-${String(count).padStart(2, '0')}`,
          x: pctX,
          y: pctY,
          status: 'online',
          zone: '사용자 등록',
        },
      ]);
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

  const handleFireMapClick = (x: number, y: number) => {
    if (simClickMode === 'start') {
      setSimStart({ x, y });
      setSimClickMode(null);
    } else if (simClickMode === 'fire') {
      setFireMarkers((prev) => [...prev, { id: `fire-${Date.now()}`, x, y }]);
    }
  };

  const handleFireMarkerDelete = (id: string) => {
    setFireMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRunSimulation = () => {
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    setSimState('running');
    simTimerRef.current = setTimeout(() => setSimState('done'), 2000);
  };

  const handleResetSimulation = () => {
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    setSimState('idle');
    setSelectedExit('');
    setFireMarkers([]);
    setSimStart(null);
    setSimClickMode(null);
  };

  const handleRunAI = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setSegStatusOverride('PROCESSING');
    aiTimerRef.current = setTimeout(() => setSegStatusOverride('DONE'), 2500);
  };

  const SEG_STATUS_LABEL: Record<SegmentationStatus, string> = {
    NONE: '미처리',
    PENDING: '대기중',
    PROCESSING: '처리중',
    DONE: '완료',
    FAILED: '실패',
  };
  const SEG_STATUS_COLOR: Record<
    SegmentationStatus,
    'neutral' | 'yellow' | 'blue' | 'green' | 'red'
  > = {
    NONE: 'neutral',
    PENDING: 'yellow',
    PROCESSING: 'blue',
    DONE: 'green',
    FAILED: 'red',
  };

  return (
    <>
      <GNB
        breadcrumbs={[{ label: '관리' }, { label: '도면 관리' }]}
        title="도면 관리 상세"
        description="층별 도면을 확인하고 관리합니다"
        userName="김안전"
        userRole="관리자"
      />

      <div className={styles.layout}>
        {/* ── 좌측 사이드바 ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner} style={{ padding: '2rem 2rem 2.4rem' }}>
            {/* 건물/층 선택 */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>건물 선택</span>
              <div className={styles.selectWrap}>
                <div className={styles.selectField}>
                  <span className={styles.selectFieldLabel}>건물</span>
                  <Dropdown
                    className={styles.dropdownFullWidth}
                    options={buildingOptions}
                    value={selectedBuildingId}
                    onChange={handleBuildingChange}
                    placeholder="건물 선택"
                  />
                </div>
                <div className={styles.selectField}>
                  <span className={styles.selectFieldLabel}>층</span>
                  <Dropdown
                    className={styles.dropdownFullWidth}
                    options={floorOptions}
                    value={selectedFloorId}
                    onChange={handleFloorChange}
                    placeholder="층 선택"
                    disabled={!currentBuilding}
                  />
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            {/* AI 세그멘테이션 */}
            <div className={styles.section}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span className={styles.sectionLabel}>AI 세그멘테이션</span>
                <StatusBadge
                  label={SEG_STATUS_LABEL[segStatus]}
                  color={SEG_STATUS_COLOR[segStatus]}
                  dot
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={!canRunAI}
                isLoading={isProcessing}
                onClick={handleRunAI}
              >
                {isProcessing ? 'AI 처리 중...' : isDone ? 'AI 재분석' : 'AI 영역 분할 실행'}
              </Button>
            </div>

            <div className={styles.divider} />

            {/* 보기 / POI편집 탭 */}
            <div className={styles.modeTabGroup}>
              {(
                [
                  { mode: 'view', label: '보기' },
                  { mode: 'poi', label: 'POI 편집' },
                ] as const
              ).map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  className={clsx(styles.modeTab, editMode === mode && styles.modeTabActive)}
                  disabled={!isDone}
                  onClick={() => handleEditModeChange(mode)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 보기 모드 */}
            {editMode === 'view' && (
              <>
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>AI 영역 분할</span>
                  <div className={styles.aiLayerList}>
                    {AI_LAYERS.map(({ key, label }) => (
                      <label key={key} className={styles.aiLayerItem}>
                        <input
                          type="checkbox"
                          className={styles.aiLayerCheckbox}
                          checked={aiLayers[key]}
                          disabled={!isDone}
                          onChange={() => toggleAiLayer(key)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <label className={styles.heatmapRow}>
                  <input
                    type="checkbox"
                    className={styles.heatmapCheckbox}
                    checked={showHeatmap}
                    disabled={!isDone}
                    onChange={() => setShowHeatmap((v) => !v)}
                  />
                  혼잡도 히트맵
                </label>
              </>
            )}

            {/* POI 편집 모드 */}
            {editMode === 'poi' && (
              <>
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>POI 유형</span>
                  <div className={styles.poiTypeGrid}>
                    {(
                      Object.entries(POI_TYPE_CONFIG) as [
                        PoiType,
                        (typeof POI_TYPE_CONFIG)[PoiType],
                      ][]
                    ).map(([type, cfg]) => (
                      <button
                        key={type}
                        type="button"
                        className={clsx(
                          styles.poiTypeBtn,
                          placingDeviceType === null &&
                            selectedPoiType === type &&
                            styles.poiTypeBtnActive,
                        )}
                        style={
                          placingDeviceType === null && selectedPoiType === type
                            ? {
                                borderColor: cfg.color,
                                backgroundColor: `${cfg.color}15`,
                                color: cfg.color,
                              }
                            : {}
                        }
                        onClick={() => {
                          setSelectedPoiType(type);
                          setPlacingDeviceType(null);
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.section}>
                  <span className={styles.sectionLabel}>장치 배치</span>
                  <div className={styles.poiTypeGrid}>
                    {(
                      Object.entries(DEVICE_PLACE_CONFIG) as [
                        PlacingDeviceType,
                        (typeof DEVICE_PLACE_CONFIG)[PlacingDeviceType],
                      ][]
                    ).map(([type, cfg]) => (
                      <button
                        key={type}
                        type="button"
                        className={clsx(
                          styles.poiTypeBtn,
                          placingDeviceType === type && styles.poiTypeBtnActive,
                        )}
                        style={
                          placingDeviceType === type
                            ? {
                                borderColor: cfg.color,
                                backgroundColor: `${cfg.color}15`,
                                color: cfg.color,
                              }
                            : {}
                        }
                        onClick={() =>
                          setPlacingDeviceType((prev) => (prev === type ? null : type))
                        }
                      >
                        {type === 'cctv' ? '📷' : '💡'} {cfg.label}
                      </button>
                    ))}
                  </div>
                  {addedDevices.length > 0 && (
                    <ul
                      style={{
                        margin: '0.6rem 0 0',
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      {addedDevices.map((d) => (
                        <li
                          key={d.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '1.15rem',
                            color: '#374151',
                          }}
                        >
                          <span>{d.label}</span>
                          <button
                            type="button"
                            onClick={() => handleAddedDeviceDelete(d.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              fontSize: '1.2rem',
                              padding: '0 0.2rem',
                            }}
                            title="삭제"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p style={{ margin: 0, color: '#9ca3af', fontSize: '1.1rem', lineHeight: 1.4 }}>
                  {placingDeviceType
                    ? `도면을 클릭해 ${DEVICE_PLACE_CONFIG[placingDeviceType].label} 위치를 등록합니다`
                    : `도면을 클릭해 ${(POI_TYPE_CONFIG[selectedPoiType] ?? POI_TYPE_CONFIG.exit).label} 마커를 추가합니다`}
                </p>
              </>
            )}

            {/* 범례 */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={clsx(styles.legendDot, styles.legendDotIot)} />
                유도등
              </div>
              <div className={styles.legendItem}>
                <span className={clsx(styles.legendDot, styles.legendDotCctv)} />
                CCTV
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
              <span className={styles.canvasHeaderIcon}>B</span>
              <span className={styles.canvasHeaderText}>{currentBuilding?.name ?? ''}</span>
              <span className={styles.canvasHeaderFloor}>{formatFloor(currentFloor.floorNum)}</span>
            </div>
          )}

          <div className={styles.canvasBody}>
            {loadingFloor && (
              <div style={{ padding: '4rem', color: '#6b7280', fontSize: '1.4rem' }}>
                도면을 불러오는 중...
              </div>
            )}
            {!loadingFloor && currentFloor ? (
              <FloorCanvas
                floor={floor ?? currentFloor}
                selected={selectedItem}
                aiLayers={aiLayers}
                showHeatmap={showHeatmap}
                zoom={zoom}
                evacPath={evacPath}
                isPathDanger={isPathDanger}
                editMode={editMode}
                poiMarkers={poiMarkers}
                simAnimating={simState === 'running'}
                simDone={simState === 'done'}
                editingPoiId={editingPoiId}
                relocatingPoiId={relocatingPoiId}
                fireMarkers={fireMarkers}
                simStart={simStart}
                simClickMode={simClickMode}
                onSelectDevice={(d) => {
                  if (editMode === 'poi') return;
                  setSelectedItem({ kind: 'device', data: d });
                }}
                onMapClick={handleMapClick}
                onFireMapClick={handleFireMapClick}
                onFireMarkerDelete={handleFireMarkerDelete}
                onPoiClick={handlePoiClick}
                onPoiLabelChange={handlePoiLabelChange}
                onPoiDelete={handlePoiDelete}
                onPoiRelocate={handlePoiRelocate}
                onPoiPopoverClose={() => setEditingPoiId(null)}
                devicePositions={devicePositions}
                onDeviceMoved={handleDeviceMoved}
                addedDevices={addedDevices}
                onAddedDeviceDelete={handleAddedDeviceDelete}
              />
            ) : (
              <div className={styles.canvasPlaceholder}>
                <span className={styles.canvasPlaceholderTitle}>층 정보를 찾을 수 없습니다</span>
              </div>
            )}
          </div>

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

          {/* 선택된 항목 패널 */}
          {selectedItem && simState !== 'done' && (
            <InfoPanel selected={selectedItem} onClose={() => setSelectedItem(null)} />
          )}
        </div>

        {/* ── 우측 경로 시뮬레이션 패널 (항상 표시) ── */}
        {(() => {
          const fireCount = fireMarkers.length;
          const pathLength = evacPath ? polyLen(evacPath) : 300;
          const estTime = Math.round(pathLength * 0.22 + fireCount * 6);
          const isSafe = !isPathDanger && fireCount < 3;
          return (
            <aside className={styles.simPanel}>
              <div className={styles.simPanelInner}>
                <div className={styles.simPanelTitle}>경로 시뮬레이션</div>

                {/* 출구 선택 */}
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>목표 출구</span>
                  <Dropdown
                    className={styles.dropdownFullWidth}
                    options={exitOptions}
                    value={selectedExit}
                    onChange={(v) => {
                      setSelectedExit(v);
                      setSimState('idle');
                    }}
                    placeholder="출구 선택"
                    disabled={exitOptions.length === 0 || simState === 'running'}
                  />
                </div>

                <div className={styles.divider} />

                {/* 훈련 시작 위치 */}
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>훈련 시작 위치</span>
                  {simStart ? (
                    <div className={styles.simStartInfo}>
                      <span>
                        S ({simStart.x}, {simStart.y})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSimStart(null)}
                        disabled={simState === 'running'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#16a34a',
                          fontSize: '1.2rem',
                          padding: '0 0.2rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '1.1rem' }}>
                      미설정 (기본값: 중앙)
                    </p>
                  )}
                  <button
                    type="button"
                    className={clsx(
                      styles.simClickModeBtn,
                      simClickMode === 'start' && styles.simClickModeBtnActive,
                    )}
                    disabled={simState === 'running'}
                    onClick={() => setSimClickMode((m) => (m === 'start' ? null : 'start'))}
                  >
                    {simClickMode === 'start'
                      ? '📍 도면을 클릭해 위치 지정 중'
                      : '도면에서 시작 위치 설정'}
                  </button>
                </div>

                <div className={styles.divider} />

                {/* 화재 위치 */}
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>
                    화재 위치
                    {fireCount > 0 && (
                      <span style={{ marginLeft: '0.4rem', color: '#ef4444', fontWeight: 600 }}>
                        ({fireCount})
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    className={clsx(
                      styles.simClickModeBtn,
                      simClickMode === 'fire' && styles.simClickModeBtnActive,
                    )}
                    disabled={simState === 'running'}
                    onClick={() => setSimClickMode((m) => (m === 'fire' ? null : 'fire'))}
                  >
                    {simClickMode === 'fire' ? '🔥 도면을 클릭해 추가 중' : '화재 위치 추가'}
                  </button>
                  {fireMarkers.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {fireMarkers.map((m, i) => (
                        <div key={m.id} className={styles.simFireItem}>
                          <span>🔥 화재 {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleFireMarkerDelete(m.id)}
                            disabled={simState === 'running'}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              fontSize: '1.2rem',
                              padding: '0 0.2rem',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.divider} />

                {/* 실행/초기화 */}
                <div className={styles.section}>
                  <button
                    type="button"
                    className={styles.simRunButton}
                    disabled={!selectedExit || simState === 'running'}
                    onClick={handleRunSimulation}
                  >
                    {simState === 'running'
                      ? '시뮬레이션 실행 중...'
                      : simState === 'done'
                        ? '다시 실행'
                        : '시뮬레이션 실행'}
                  </button>
                  <button
                    type="button"
                    className={styles.simResetButton}
                    disabled={simState === 'running'}
                    onClick={handleResetSimulation}
                  >
                    초기화
                  </button>
                </div>

                {/* 시뮬레이션 결과 */}
                {simState === 'done' && selectedExit && (
                  <div className={styles.simResultSection}>
                    <div className={styles.simResultTitle}>시뮬레이션 결과</div>
                    <div className={styles.simResultRow}>
                      <span className={styles.simResultKey}>목표 출구</span>
                      <span className={styles.simResultValue}>{selectedExitLabel}</span>
                    </div>
                    {simStart && (
                      <div className={styles.simResultRow}>
                        <span className={styles.simResultKey}>시작 위치</span>
                        <span className={styles.simResultValue}>
                          ({simStart.x}, {simStart.y})
                        </span>
                      </div>
                    )}
                    <div className={styles.simResultRow}>
                      <span className={styles.simResultKey}>예상 대피 시간</span>
                      <span className={styles.simResultValue}>{estTime}초</span>
                    </div>
                    <div className={styles.simResultRow}>
                      <span className={styles.simResultKey}>경유 구역</span>
                      <span className={styles.simResultValue}>
                        복도 → 계단실 → {selectedExitLabel}
                      </span>
                    </div>
                    <div className={styles.simResultRow}>
                      <span className={styles.simResultKey}>화재 구역 회피</span>
                      <span
                        className={clsx(
                          styles.simResultBadge,
                          isSafe ? styles.simResultBadgeSafe : styles.simResultBadgeDanger,
                        )}
                      >
                        {isSafe ? '✓ 안전' : '⚠ 위험'}
                      </span>
                    </div>
                    {fireCount > 0 && (
                      <div className={styles.simResultRow}>
                        <span className={styles.simResultKey}>화재 마커</span>
                        <span className={styles.simResultValue}>{fireCount}개</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>
          );
        })()}
      </div>
    </>
  );
};

export default FloorPlansDetailPage;
