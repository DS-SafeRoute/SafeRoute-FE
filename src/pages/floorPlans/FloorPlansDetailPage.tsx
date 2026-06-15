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
  { key: 'room', label: '실' },
];

const MODE_CONFIG: { mode: EditMode; label: string }[] = [
  { mode: 'view', label: '보기' },
  { mode: 'poi', label: 'POI 편집' },
  { mode: 'simulation', label: '경로 시뮬레이션' },
];

type SelectedItem = { kind: 'device'; data: DeviceMarker } | { kind: 'poi'; data: PoiMarker };

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
  simulationExitId,
  fireZones,
  editMode,
  poiMarkers,
  simAnimating,
  editingPoiId,
  relocatingPoiId,
  onMapClick,
  onRoomClick,
  onPoiClick,
  onPoiLabelChange,
  onPoiDelete,
  onPoiRelocate,
  onPoiPopoverClose,
}: {
  aiLayers: Record<string, boolean>;
  showHeatmap: boolean;
  simulationExitId: string;
  fireZones: string[];
  editMode: EditMode;
  poiMarkers: Array<{ id: string; x: number; y: number; label: string }>;
  simAnimating: boolean;
  editingPoiId: string | null;
  relocatingPoiId: string | null;
  onMapClick: (x: number, y: number) => void;
  onRoomClick: (roomId: string) => void;
  onPoiClick: (id: string) => void;
  onPoiLabelChange: (id: string, label: string) => void;
  onPoiDelete: (id: string) => void;
  onPoiRelocate: (id: string) => void;
  onPoiPopoverClose: () => void;
}) => {
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (editMode !== 'poi') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 560);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 420);
    onMapClick(x, y);
  };

  const svgCursor = relocatingPoiId
    ? 'crosshair'
    : editMode === 'poi'
      ? 'crosshair'
      : editMode === 'simulation'
        ? 'pointer'
        : 'default';

  return (
    <svg
      viewBox="0 0 560 420"
      width="560"
      height="420"
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
        ROOMS.map((room) => {
          const isFire = fireZones.includes(room.id);
          const cx = room.x + room.w - 24;
          const cy = room.y + room.h - 24;
          return (
            <g
              key={room.id}
              onClick={
                editMode === 'simulation'
                  ? (e) => {
                      e.stopPropagation();
                      onRoomClick(room.id);
                    }
                  : undefined
              }
              style={editMode === 'simulation' ? { cursor: 'pointer' } : undefined}
            >
              <rect
                x={room.x}
                y={room.y}
                width={room.w}
                height={room.h}
                fill={isFire ? 'rgba(254,202,202,0.7)' : room.baseFill}
                stroke={isFire ? '#f87171' : '#d1d5db'}
                strokeWidth={isFire ? 1.5 : 1}
              />
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 + 4}
                textAnchor="middle"
                fill={isFire ? '#b91c1c' : '#6b7280'}
                fontSize="12"
                fontFamily="sans-serif"
                fontWeight={isFire ? '600' : '400'}
              >
                {room.label}
              </text>
              {isFire && (
                <>
                  <circle cx={cx} cy={cy} r="14" fill="#ef4444" />
                  <text
                    x={cx}
                    y={cy + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    F
                  </text>
                </>
              )}
              {editMode === 'simulation' && !isFire && (
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.w}
                  height={room.h}
                  fill="transparent"
                  stroke="#f87171"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.4"
                />
              )}
            </g>
          );
        })}

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

      {/* 비상구 (exit) */}
      {aiLayers.exit && (
        <>
          <circle cx="100" cy="393" r="16" fill="#16a34a" />
          <text
            x="100"
            y="397"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            E
          </text>
          <text
            x="100"
            y="414"
            textAnchor="middle"
            fill="#16a34a"
            fontSize="10"
            fontFamily="sans-serif"
          >
            EXIT A
          </text>
          <circle cx="450" cy="393" r="16" fill="#16a34a" />
          <text
            x="450"
            y="397"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            E
          </text>
          <text
            x="450"
            y="414"
            textAnchor="middle"
            fill="#16a34a"
            fontSize="10"
            fontFamily="sans-serif"
          >
            EXIT B
          </text>
        </>
      )}

      {/* 시뮬레이션 경로 */}
      {simulationExitId === 'exit-a3-01' && (
        <g>
          <line
            key={simAnimating ? 'anim' : 'static'}
            x1="280"
            y1="210"
            x2="100"
            y2="380"
            stroke="#3b82f6"
            strokeWidth="2.5"
            className={simAnimating ? styles.simPathAnimated : undefined}
            strokeDasharray={simAnimating ? undefined : '8 5'}
          />
          {[0.15, 0.35, 0.55, 0.75, 0.92].map((t) => (
            <circle
              key={t}
              cx={280 - t * 180}
              cy={210 + t * 170}
              r="5"
              fill="#3b82f6"
              opacity="0.8"
            />
          ))}
        </g>
      )}
      {simulationExitId === 'exit-a3-02' && (
        <g>
          <line
            key={simAnimating ? 'anim' : 'static'}
            x1="280"
            y1="210"
            x2="450"
            y2="380"
            stroke="#3b82f6"
            strokeWidth="2.5"
            className={simAnimating ? styles.simPathAnimated : undefined}
            strokeDasharray={simAnimating ? undefined : '8 5'}
          />
          {[0.15, 0.35, 0.55, 0.75, 0.92].map((t) => (
            <circle
              key={t}
              cx={280 + t * 170}
              cy={210 + t * 170}
              r="5"
              fill="#3b82f6"
              opacity="0.8"
            />
          ))}
        </g>
      )}

      {/* 혼잡도 히트맵 */}
      {showHeatmap && (
        <g opacity="0.4">
          <ellipse cx="140" cy="240" rx="70" ry="50" fill="#ef4444" />
          <ellipse cx="350" cy="255" rx="55" ry="40" fill="#f97316" />
          <ellipse cx="220" cy="290" rx="40" ry="35" fill="#eab308" />
        </g>
      )}

      {/* POI 마커 */}
      {poiMarkers.map((m) => {
        const isEditing = editingPoiId === m.id;
        const isRelocating = relocatingPoiId === m.id;
        // 팝오버가 SVG 오른쪽 경계를 넘지 않도록 좌우 반전
        const popX = m.x + 20 > 400 ? m.x - 175 : m.x + 20;
        const popY = m.y - 20;
        return (
          <g key={m.id}>
            {/* 마커 본체 */}
            <circle
              cx={m.x}
              cy={m.y}
              r="14"
              fill={isRelocating ? '#f59e0b' : '#8b5cf6'}
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
              P
            </text>
            <text
              x={m.x}
              y={m.y + 26}
              textAnchor="middle"
              fill={isRelocating ? '#f59e0b' : '#8b5cf6'}
              fontSize="9"
              fontFamily="sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {isRelocating ? '클릭해서 이동' : m.label}
            </text>

            {/* 편집 팝오버 */}
            {isEditing && (
              <foreignObject x={popX} y={popY} width="160" height="120">
                <div
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
                      POI 편집
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
                    value={m.label}
                    onChange={(e) => onPoiLabelChange(m.id, e.target.value)}
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
                      e.target.style.borderColor = '#8b5cf6';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onPoiRelocate(m.id)}
                      style={{
                        flex: 1,
                        border: '1px solid #8b5cf6',
                        borderRadius: '4px',
                        background: 'white',
                        color: '#8b5cf6',
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
                      onClick={() => onPoiDelete(m.id)}
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
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ── CCTV/IoT 마커 ── */
const DevicePin = ({
  device,
  selected,
  zoom,
  onClick,
}: {
  device: DeviceMarker;
  selected: boolean;
  zoom: number;
  onClick: () => void;
}) => {
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
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={device.label}
      className={styles.markerWrap}
      style={{ left: `${device.x}%`, top: `${device.y}%` }}
      onClick={(e) => {
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
  simulationExitId,
  fireZones,
  editMode,
  poiMarkers,
  simAnimating,
  editingPoiId,
  relocatingPoiId,
  onSelectDevice,
  onMapClick,
  onRoomClick,
  onPoiClick,
  onPoiLabelChange,
  onPoiDelete,
  onPoiRelocate,
  onPoiPopoverClose,
}: {
  floor: Floor;
  selected: SelectedItem | null;
  aiLayers: Record<string, boolean>;
  showHeatmap: boolean;
  zoom: number;
  simulationExitId: string;
  fireZones: string[];
  editMode: EditMode;
  poiMarkers: Array<{ id: string; x: number; y: number; label: string }>;
  simAnimating: boolean;
  editingPoiId: string | null;
  relocatingPoiId: string | null;
  onSelectDevice: (d: DeviceMarker) => void;
  onMapClick: (x: number, y: number) => void;
  onRoomClick: (roomId: string) => void;
  onPoiClick: (id: string) => void;
  onPoiLabelChange: (id: string, label: string) => void;
  onPoiDelete: (id: string) => void;
  onPoiRelocate: (id: string) => void;
  onPoiPopoverClose: () => void;
}) => {
  const hasMockMap = floor.segmentationStatus === 'DONE';

  if (!hasMockMap) {
    return (
      <div className={styles.canvasPlaceholder}>
        <span className={styles.canvasPlaceholderTitle}>등록된 도면이 없습니다</span>
        <span>도면 목록에서 도면을 업로드하거나 AI 영역 분할을 실행해 주세요</span>
      </div>
    );
  }

  const scale = zoom / 100;

  return (
    <div className={styles.mapWrap} style={{ transform: `scale(${scale})` }}>
      <MockFloorMap3F
        aiLayers={aiLayers}
        showHeatmap={showHeatmap}
        simulationExitId={simulationExitId}
        fireZones={fireZones}
        editMode={editMode}
        poiMarkers={poiMarkers}
        simAnimating={simAnimating}
        editingPoiId={editingPoiId}
        relocatingPoiId={relocatingPoiId}
        onMapClick={onMapClick}
        onRoomClick={onRoomClick}
        onPoiClick={onPoiClick}
        onPoiLabelChange={onPoiLabelChange}
        onPoiDelete={onPoiDelete}
        onPoiRelocate={onPoiRelocate}
        onPoiPopoverClose={onPoiPopoverClose}
      />
      {floor.devices.map((device) => (
        <DevicePin
          key={device.id}
          device={device}
          selected={selected?.kind === 'device' && selected.data.id === device.id}
          zoom={zoom}
          onClick={() => onSelectDevice(device)}
        />
      ))}
    </div>
  );
};

/* ── 메인 페이지 ── */
const FloorPlansDetailPage = () => {
  const navigate = useNavigate();
  const { buildingId, floorId } = useParams<{ buildingId: string; floorId: string }>();

  const building = mockFloorBuildings.find((b) => String(b.id) === buildingId) ?? null;
  const floor = building?.floors.find((f) => String(f.id) === floorId) ?? null;

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
  const [fireZones, setFireZones] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [segStatusOverride, setSegStatusOverride] = useState<SegmentationStatus | null>(null);
  const [poiMarkers, setPoiMarkers] = useState<
    Array<{ id: string; x: number; y: number; label: string }>
  >([]);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [relocatingPoiId, setRelocatingPoiId] = useState<string | null>(null);
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

  const TOAST_MSG: Record<EditMode, string> = {
    view: '보기 모드',
    poi: 'POI 편집 모드 · 도면을 클릭해 마커를 추가하세요',
    simulation: '시뮬레이션 모드 · 실(방)을 클릭해 화재 구역을 지정하세요',
  };

  const handleEditModeChange = (mode: EditMode) => {
    setEditMode(mode);
    setEditingPoiId(null);
    setRelocatingPoiId(null);
    showToast(TOAST_MSG[mode]);
  };

  const currentBuilding =
    mockFloorBuildings.find((b) => String(b.id) === selectedBuildingId) ?? null;
  const currentFloor =
    currentBuilding?.floors.find((f) => String(f.id) === selectedFloorId) ?? null;

  const buildingOptions = mockFloorBuildings.map((b) => ({ label: b.name, value: String(b.id) }));
  const floorOptions =
    currentBuilding?.floors.map((f) => ({
      label: formatFloor(f.floorNum),
      value: String(f.id),
    })) ?? [];

  const exitOptions = (currentFloor?.pois ?? [])
    .filter((p) => p.type === 'exit')
    .map((p) => ({ label: p.label, value: p.id }));

  const handleBuildingChange = (newId: string) => {
    const newBuilding = mockFloorBuildings.find((b) => String(b.id) === newId);
    const firstFloor = newBuilding?.floors[0];
    setSelectedBuildingId(newId);
    setSelectedFloorId(firstFloor ? String(firstFloor.id) : '');
    setSelectedItem(null);
    setSelectedExit('');
    setFireZones([]);
    if (firstFloor) void navigate(`/floorPlans/${newId}/${firstFloor.id}`);
  };

  const handleFloorChange = (newId: string) => {
    setSelectedFloorId(newId);
    setSelectedItem(null);
    setSelectedExit('');
    setFireZones([]);
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

  const handleRoomClick = (roomId: string) => {
    setFireZones((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId],
    );
  };

  const handleMapClick = (x: number, y: number) => {
    if (relocatingPoiId) {
      setPoiMarkers((prev) => prev.map((m) => (m.id === relocatingPoiId ? { ...m, x, y } : m)));
      setRelocatingPoiId(null);
      return;
    }
    setPoiMarkers((prev) => [
      ...prev,
      { id: `poi-${Date.now()}`, x, y, label: `POI ${prev.length + 1}` },
    ]);
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

  const handleRunSimulation = () => {
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    setSimState('running');
    simTimerRef.current = setTimeout(() => setSimState('done'), 2000);
  };

  const handleResetSimulation = () => {
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    setSimState('idle');
    setSelectedExit('');
    setFireZones([]);
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

            {/* AI 영역 분할 */}
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

            <div className={styles.divider} />

            {/* 편집 모드 */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>편집 모드</span>
              <div className={styles.modeGroup}>
                {MODE_CONFIG.map(({ mode, label }) => (
                  <button
                    key={mode}
                    type="button"
                    className={clsx(
                      styles.modeButton,
                      editMode === mode && styles.modeButtonActive,
                    )}
                    onClick={() => handleEditModeChange(mode)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 시뮬레이션 설정 (simulation 모드에서만) */}
            {editMode === 'simulation' && (
              <>
                <div className={styles.divider} />
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>시뮬레이션 설정</span>
                  <div className={styles.simSection}>
                    {/* 출구 선택 */}
                    <div className={styles.selectField}>
                      <span className={styles.selectFieldLabel}>출구 선택</span>
                      <Dropdown
                        className={styles.dropdownFullWidth}
                        options={exitOptions}
                        value={selectedExit}
                        onChange={(v) => {
                          setSelectedExit(v);
                          setSimState('idle');
                        }}
                        placeholder="선택"
                        disabled={exitOptions.length === 0 || simState === 'running'}
                      />
                    </div>

                    {/* 화재 구역 목록 */}
                    <div>
                      <span className={styles.selectFieldLabel}>
                        화재 구역
                        {fireZones.length > 0 && (
                          <span style={{ marginLeft: '0.4rem', color: '#ef4444', fontWeight: 600 }}>
                            ({fireZones.length})
                          </span>
                        )}
                      </span>
                      {fireZones.length === 0 ? (
                        <p style={{ marginTop: '0.4rem', color: '#9ca3af', fontSize: '1.2rem' }}>
                          도면에서 실을 클릭해 화재 구역을 지정하세요
                        </p>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            marginTop: '0.4rem',
                          }}
                        >
                          {fireZones.map((id) => {
                            const label = ROOMS.find((r) => r.id === id)?.label ?? id;
                            return (
                              <div
                                key={id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '0.6rem',
                                  backgroundColor: 'rgba(254,202,202,0.5)',
                                  border: '1px solid #f87171',
                                }}
                              >
                                <span
                                  style={{ fontSize: '1.2rem', color: '#b91c1c', fontWeight: 500 }}
                                >
                                  🔥 {label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRoomClick(id)}
                                  disabled={simState === 'running'}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    fontSize: '1.2rem',
                                    padding: '0 0.2rem',
                                  }}
                                  aria-label={`${label} 화재 구역 해제`}
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 실행/초기화 버튼 */}
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
                </div>
              </>
            )}

            <div className={styles.divider} />

            {/* 혼잡도 히트맵 */}
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

            <div className={styles.divider} />

            {/* 보기 설정 */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>보기 설정</span>
              <div className={styles.zoomRow}>
                <span className={styles.zoomLabel}>확대/축소</span>
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
          {currentFloor && (
            <div className={styles.canvasHeader}>
              <span className={styles.canvasHeaderIcon}>B</span>
              <span className={styles.canvasHeaderText}>{currentBuilding?.name ?? ''}</span>
              <span className={styles.canvasHeaderFloor}>{formatFloor(currentFloor.floorNum)}</span>
            </div>
          )}

          <div className={styles.canvasBody}>
            {currentFloor ? (
              <FloorCanvas
                floor={currentFloor}
                selected={selectedItem}
                aiLayers={aiLayers}
                showHeatmap={showHeatmap}
                zoom={zoom}
                simulationExitId={selectedExit}
                fireZones={fireZones}
                editMode={editMode}
                poiMarkers={poiMarkers}
                simAnimating={simState === 'running'}
                editingPoiId={editingPoiId}
                relocatingPoiId={relocatingPoiId}
                onSelectDevice={(d) => {
                  if (editMode === 'poi') return;
                  setSelectedItem({ kind: 'device', data: d });
                }}
                onMapClick={handleMapClick}
                onRoomClick={handleRoomClick}
                onPoiClick={handlePoiClick}
                onPoiLabelChange={handlePoiLabelChange}
                onPoiDelete={handlePoiDelete}
                onPoiRelocate={handlePoiRelocate}
                onPoiPopoverClose={() => setEditingPoiId(null)}
              />
            ) : (
              <div className={styles.canvasPlaceholder}>
                <span className={styles.canvasPlaceholderTitle}>층 정보를 찾을 수 없습니다</span>
              </div>
            )}
          </div>

          {/* 모드 안내 토스트 */}
          {toastMsg && (
            <div className={clsx(styles.toast, toastFading && styles.toastFading)}>{toastMsg}</div>
          )}

          {/* 선택된 항목 패널 */}
          {selectedItem && simState !== 'done' && (
            <InfoPanel selected={selectedItem} onClose={() => setSelectedItem(null)} />
          )}

          {/* 시뮬레이션 결과 패널 */}
          {simState === 'done' &&
            selectedExit &&
            (() => {
              const exitLabel =
                exitOptions.find((o) => o.value === selectedExit)?.label ?? selectedExit;
              const fireCount = fireZones.length;
              const estTime = 30 + fireCount * 10 + (selectedExit === 'exit-a3-02' ? 8 : 0);
              const isSafe = fireCount < 3;
              const avoidedRooms = ROOMS.filter((r) => fireZones.includes(r.id))
                .map((r) => r.label)
                .join(', ');
              return (
                <div className={styles.simResultPanel}>
                  <div className={styles.simResultTitle}>시뮬레이션 결과</div>
                  <div className={styles.simResultRow}>
                    <span className={styles.simResultKey}>목표 출구</span>
                    <span className={styles.simResultValue}>{exitLabel}</span>
                  </div>
                  <div className={styles.simResultRow}>
                    <span className={styles.simResultKey}>예상 대피 시간</span>
                    <span className={styles.simResultValue}>{estTime}초</span>
                  </div>
                  <div className={styles.simResultRow}>
                    <span className={styles.simResultKey}>경유 구역</span>
                    <span className={styles.simResultValue}>복도 → 계단실 → {exitLabel}</span>
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
                  {avoidedRooms && (
                    <div className={styles.simResultRow}>
                      <span className={styles.simResultKey}>회피 구역</span>
                      <span className={styles.simResultValue}>{avoidedRooms}</span>
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      </div>
    </>
  );
};

export default FloorPlansDetailPage;
