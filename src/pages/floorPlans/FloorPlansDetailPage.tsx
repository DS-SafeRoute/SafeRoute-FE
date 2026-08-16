import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';
import XIcon from '@assets/icons/ic-x.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';

import { formatFloor } from '@utils/floor';

import { getFloorBuildings, getFloorDetail } from './api/floorPlansApi';
import * as styles from './FloorPlansDetailPage.css';
import FloorUploadModal from './modals/FloorUploadModal';

import type {
  AiLayer,
  DeviceMarker,
  EditMode,
  Floor,
  FloorBuilding,
  PoiMarker,
} from './types/floorPlans';

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
  editMode,
  poiMarkers,
  relocatingPoiId,
  onMapClick,
  onPoiClick,
}: {
  aiLayers: Record<string, boolean>;
  editMode: EditMode;
  poiMarkers: Array<{ id: string; x: number; y: number; label: string; poiType: string }>;
  relocatingPoiId: string | null;
  onMapClick: (x: number, y: number) => void;
  onPoiClick: (id: string) => void;
}) => {
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 560);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 420);
    if (editMode === 'poi') {
      onMapClick(x, y);
      return;
    }
  };

  const svgCursor = relocatingPoiId || editMode === 'poi' ? 'crosshair' : 'default';

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
  zoom,
  editMode,
  poiMarkers,
  editingPoiId,
  relocatingPoiId,
  devicePositions,
  addedDevices,
  onAddedDeviceDelete,
  onSelectDevice,
  onMapClick,
  onPoiClick,
  onPoiLabelChange,
  onPoiDelete,
  onPoiRelocate,
  onPoiPopoverClose,
  onDeviceMoved,
  onUpload,
}: {
  floor: Floor;
  selected: SelectedItem | null;
  aiLayers: Record<string, boolean>;
  zoom: number;
  editMode: EditMode;
  poiMarkers: Array<{ id: string; x: number; y: number; label: string; poiType: string }>;
  editingPoiId: string | null;
  relocatingPoiId: string | null;
  devicePositions: Record<string, { x: number; y: number }>;
  addedDevices: AddedDevice[];
  onAddedDeviceDelete: (id: string) => void;
  onSelectDevice: (d: DeviceMarker) => void;
  onMapClick: (x: number, y: number) => void;
  onPoiClick: (id: string) => void;
  onPoiLabelChange: (id: string, label: string) => void;
  onPoiDelete: (id: string) => void;
  onPoiRelocate: (id: string) => void;
  onPoiPopoverClose: () => void;
  onDeviceMoved: (id: string, x: number, y: number) => void;
  onUpload: () => void;
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
    <div className={styles.mapWrap} style={{ transform: `scale(${scale})` }}>
      <MockFloorMap3F
        aiLayers={aiLayers}
        editMode={editMode}
        poiMarkers={poiMarkers}
        relocatingPoiId={relocatingPoiId}
        onMapClick={onMapClick}
        onPoiClick={onPoiClick}
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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [poiMarkers, setPoiMarkers] = useState<
    Array<{ id: string; x: number; y: number; label: string; poiType: PoiType }>
  >([]);
  const [selectedPoiType] = useState<PoiType>('exit');
  const [placingDeviceType] = useState<PlacingDeviceType | null>(null);
  const [addedDevices, setAddedDevices] = useState<AddedDevice[]>([]);
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

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastFadeRef.current) clearTimeout(toastFadeRef.current);
    },
    [],
  );

  const currentBuilding = floorBuildings.find((b) => String(b.id) === selectedBuildingId) ?? null;
  const currentFloor =
    currentBuilding?.floors.find((f) => String(f.id) === selectedFloorId) ?? null;

  const handleFloorChange = (newId: string) => {
    setSelectedFloorId(newId);
    setSelectedItem(null);
    void navigate(`/floorPlans/${selectedBuildingId}/${newId}`);
  };

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
                        {isCurrent && <StatusBadge label="현재" color="blue" />}
                        {!isCurrent && isNone && <StatusBadge label="미등록" color="neutral" />}
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
                zoom={zoom}
                editMode={editMode}
                poiMarkers={poiMarkers}
                editingPoiId={editingPoiId}
                relocatingPoiId={relocatingPoiId}
                onSelectDevice={(d) => {
                  if (editMode === 'poi') return;
                  setSelectedItem({ kind: 'device', data: d });
                }}
                onMapClick={handleMapClick}
                onPoiClick={handlePoiClick}
                onPoiLabelChange={handlePoiLabelChange}
                onPoiDelete={handlePoiDelete}
                onPoiRelocate={handlePoiRelocate}
                onPoiPopoverClose={() => setEditingPoiId(null)}
                devicePositions={devicePositions}
                onDeviceMoved={handleDeviceMoved}
                addedDevices={addedDevices}
                onAddedDeviceDelete={handleAddedDeviceDelete}
                onUpload={() => setUploadModalOpen(true)}
              />
            ) : (
              <div className={styles.canvasPlaceholder}>
                <span className={styles.canvasPlaceholderTitle}>층 정보를 찾을 수 없습니다</span>
              </div>
            )}
          </div>

          {/* 장비 추가 / 구역 추가 */}
          {currentFloor?.segmentationStatus === 'DONE' && (
            <div className={styles.canvasActionFloat}>
              <button type="button" className={styles.canvasActionButton}>
                <PlusIcon width={14} height={14} />
                장비 추가
              </button>
              <button type="button" className={styles.canvasActionButton}>
                <PlusIcon width={14} height={14} />
                구역 추가
              </button>
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

          {/* 선택된 항목 패널 */}
          {selectedItem && (
            <InfoPanel selected={selectedItem} onClose={() => setSelectedItem(null)} />
          )}
        </div>
      </div>

      <FloorUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        buildingName={currentBuilding?.name ?? ''}
        floorNum={currentFloor?.floorNum ?? 0}
        onConfirm={() => setUploadModalOpen(false)}
      />
    </>
  );
};

export default FloorPlansDetailPage;
