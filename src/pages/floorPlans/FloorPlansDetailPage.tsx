import { useState } from 'react';

import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import XIcon from '@assets/icons/ic-x.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import Dropdown from '@components/dropdown';
import GNB from '@components/gnb';

import * as styles from './FloorPlansDetailPage.css';
import { mockFloorBuildings } from './mocks/floorPlansData';

import type {
  DeviceMarker,
  EditMode,
  Floor,
  PoiMarker,
  SegmentationStatus,
} from './types/floorPlans';

const STATUS_CONFIG: Record<SegmentationStatus, { label: string; color: StatusBadgeColor }> = {
  NONE: { label: '미등록', color: 'neutral' },
  PENDING: { label: '대기중', color: 'yellow' },
  PROCESSING: { label: '처리중', color: 'blue' },
  DONE: { label: '완료', color: 'green' },
  FAILED: { label: '실패', color: 'red' },
};

const formatFloor = (floorNum: number) => {
  if (floorNum > 0) return `${floorNum}층`;
  if (floorNum < 0) return `B${Math.abs(floorNum)}층`;
  return '1층';
};

const MODE_CONFIG: { mode: EditMode; label: string; desc: string }[] = [
  { mode: 'view', label: '보기', desc: '도면 및 장치 현황 확인' },
  { mode: 'poi', label: 'POI 편집', desc: '출구 · 계단 · 화재구역 마커 편집' },
  { mode: 'simulation', label: '시뮬레이션', desc: '대피 경로 시뮬레이션 실행' },
];

type SelectedItem = { kind: 'device'; data: DeviceMarker } | { kind: 'poi'; data: PoiMarker };

/* 장치 마커 */
const DeviceMarkerPin = ({
  device,
  selected,
  onClick,
}: {
  device: DeviceMarker;
  selected: boolean;
  onClick: () => void;
}) => {
  const isOffline = device.status === 'offline';
  const markerClass = clsx(
    styles.marker,
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
      aria-pressed={selected}
      className={styles.markerWrap}
      style={{ left: `${device.x}%`, top: `${device.y}%` }}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={markerClass}>
        <CameraIcon width={14} height={14} aria-hidden="true" />
      </div>
      {selected && <span className={styles.markerLabel}>{device.label}</span>}
    </div>
  );
};

/* POI 마커 */
const PoiMarkerPin = ({
  poi,
  selected,
  onClick,
}: {
  poi: PoiMarker;
  selected: boolean;
  onClick: () => void;
}) => (
  <div
    role="button"
    tabIndex={0}
    aria-label={poi.label}
    aria-pressed={selected}
    className={styles.markerWrap}
    style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <div className={clsx(styles.marker, styles.markerPoi, selected && styles.markerSelected)}>
      <span style={{ fontSize: '1rem', fontWeight: 700 }}>P</span>
    </div>
    {selected && <span className={styles.markerLabel}>{poi.label}</span>}
  </div>
);

/* 선택된 장치 정보 패널 */
const DeviceInfoPanel = ({
  selected,
  onClose,
}: {
  selected: SelectedItem;
  onClose: () => void;
}) => {
  if (selected.kind === 'device') {
    const d = selected.data;
    return (
      <div className={styles.infoPanel}>
        <div className={styles.infoPanelHeader}>
          <span className={styles.infoPanelTitle}>{d.label}</span>
          <button
            type="button"
            className={styles.infoPanelClose}
            onClick={onClose}
            aria-label="닫기"
          >
            <XIcon width={14} height={14} />
          </button>
        </div>
        {d.model && (
          <div className={styles.infoPanelRow}>
            <span className={styles.infoPanelKey}>모델</span>
            <span className={styles.infoPanelValue}>{d.model}</span>
          </div>
        )}
        <div className={styles.infoPanelRow}>
          <span className={styles.infoPanelKey}>구역</span>
          <span className={styles.infoPanelValue}>{d.zone}</span>
        </div>
        {d.resolution && (
          <div className={styles.infoPanelRow}>
            <span className={styles.infoPanelKey}>해상도</span>
            <span className={styles.infoPanelValue}>{d.resolution}</span>
          </div>
        )}
        <div className={styles.infoPanelRow}>
          <span className={styles.infoPanelKey}>상태</span>
          <StatusBadge
            label={d.status === 'online' ? '온라인' : '오프라인'}
            color={d.status === 'online' ? 'green' : 'neutral'}
            dot
          />
        </div>
      </div>
    );
  }

  const p = selected.data;
  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <span className={styles.infoPanelTitle}>{p.label}</span>
        <button type="button" className={styles.infoPanelClose} onClick={onClose} aria-label="닫기">
          <XIcon width={14} height={14} />
        </button>
      </div>
      <div className={styles.infoPanelRow}>
        <span className={styles.infoPanelKey}>유형</span>
        <span className={styles.infoPanelValue}>{p.type}</span>
      </div>
    </div>
  );
};

/* 캔버스 */
const FloorCanvas = ({
  floor,
  selected,
  onSelectDevice,
  onSelectPoi,
}: {
  floor: Floor;
  selected: SelectedItem | null;
  onSelectDevice: (d: DeviceMarker) => void;
  onSelectPoi: (p: PoiMarker) => void;
}) => {
  if (!floor.mapImageUrl) {
    return (
      <div className={styles.canvasPlaceholder}>
        <span className={styles.canvasPlaceholderTitle}>등록된 도면이 없습니다</span>
        <span>AI 영역 분할 실행 또는 도면 이미지를 업로드해 주세요</span>
      </div>
    );
  }

  return (
    <div className={styles.mapWrap}>
      <img
        src={floor.mapImageUrl}
        alt={`${formatFloor(floor.floorNum)} 도면`}
        className={styles.mapImage}
        draggable={false}
      />
      {floor.devices.map((device) => (
        <DeviceMarkerPin
          key={device.id}
          device={device}
          selected={selected?.kind === 'device' && selected.data.id === device.id}
          onClick={() => onSelectDevice(device)}
        />
      ))}
      {floor.pois.map((poi) => (
        <PoiMarkerPin
          key={poi.id}
          poi={poi}
          selected={selected?.kind === 'poi' && selected.data.id === poi.id}
          onClick={() => onSelectPoi(poi)}
        />
      ))}
    </div>
  );
};

const FloorPlansDetailPage = () => {
  const navigate = useNavigate();
  const { buildingId, floorId } = useParams<{ buildingId: string; floorId: string }>();

  const building = mockFloorBuildings.find((b) => String(b.id) === buildingId) ?? null;
  const floor = building?.floors.find((f) => String(f.id) === floorId) ?? null;

  const [selectedBuildingId, setSelectedBuildingId] = useState(buildingId ?? '');
  const [selectedFloorId, setSelectedFloorId] = useState(floorId ?? '');
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const currentBuilding =
    mockFloorBuildings.find((b) => String(b.id) === selectedBuildingId) ?? null;
  const currentFloor =
    currentBuilding?.floors.find((f) => String(f.id) === selectedFloorId) ?? null;

  const handleBuildingChange = (newBuildingId: string) => {
    const newBuilding = mockFloorBuildings.find((b) => String(b.id) === newBuildingId);
    const firstFloorId = newBuilding?.floors[0]?.id;
    setSelectedBuildingId(newBuildingId);
    setSelectedFloorId(firstFloorId ? String(firstFloorId) : '');
    setSelectedItem(null);
    if (firstFloorId) {
      void navigate(`/floorPlans/${newBuildingId}/${firstFloorId}`);
    }
  };

  const handleFloorChange = (newFloorId: string) => {
    setSelectedFloorId(newFloorId);
    setSelectedItem(null);
    void navigate(`/floorPlans/${selectedBuildingId}/${newFloorId}`);
  };

  const buildingOptions = mockFloorBuildings.map((b) => ({ label: b.name, value: String(b.id) }));
  const floorOptions =
    currentBuilding?.floors.map((f) => ({
      label: formatFloor(f.floorNum),
      value: String(f.id),
    })) ?? [];

  const status = currentFloor?.segmentationStatus ?? floor?.segmentationStatus ?? 'NONE';
  const { label: statusLabel, color: statusColor } = STATUS_CONFIG[status];
  const canRunAI = status === 'NONE' || status === 'FAILED';

  const cctvOnline =
    currentFloor?.devices.filter((d) => d.type === 'cctv' && d.status === 'online').length ?? 0;
  const cctvTotal = currentFloor?.devices.filter((d) => d.type === 'cctv').length ?? 0;
  const iotTotal = currentFloor?.devices.filter((d) => d.type === 'iot').length ?? 0;
  const poiTotal = currentFloor?.pois.length ?? 0;

  return (
    <>
      <GNB
        breadcrumbs={[{ label: '관리' }, { label: '도면 관리' }]}
        title={`${building?.name ?? ''} ${floor ? formatFloor(floor.floorNum) : ''} 도면`}
        description="도면 세그멘테이션 및 장치 배치 관리"
        userName="김안전"
        userRole="관리자"
      />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>건물 / 층 선택</span>
            <div className={styles.selectWrap}>
              <Dropdown
                className={styles.dropdownFullWidth}
                options={buildingOptions}
                value={selectedBuildingId}
                onChange={handleBuildingChange}
                placeholder="건물 선택"
              />
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

          <div className={styles.divider} />

          <div className={styles.section}>
            <span className={styles.sectionLabel}>세그멘테이션</span>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>AI 처리 상태</span>
              <StatusBadge label={statusLabel} color={statusColor} dot />
            </div>
            <Button className={styles.aiButton} disabled={!canRunAI} variant="primary" size="sm">
              AI 영역 분할 실행
            </Button>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <span className={styles.sectionLabel}>편집 모드</span>
            <div className={styles.modeGroup}>
              {MODE_CONFIG.map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  className={clsx(styles.modeButton, editMode === mode && styles.modeButtonActive)}
                  onClick={() => setEditMode(mode)}
                >
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <span className={styles.modeDesc}>
              {MODE_CONFIG.find((m) => m.mode === editMode)?.desc}
            </span>
          </div>

          {(cctvTotal > 0 || iotTotal > 0 || poiTotal > 0) && (
            <>
              <div className={styles.divider} />
              <div className={styles.section}>
                <span className={styles.sectionLabel}>장치 현황</span>
                {cctvTotal > 0 && (
                  <div className={styles.deviceSummaryRow}>
                    <span className={styles.deviceSummaryLabel}>CCTV</span>
                    <span className={styles.deviceSummaryCount}>
                      {cctvOnline}/{cctvTotal} 온라인
                    </span>
                  </div>
                )}
                {iotTotal > 0 && (
                  <div className={styles.deviceSummaryRow}>
                    <span className={styles.deviceSummaryLabel}>IoT</span>
                    <span className={styles.deviceSummaryCount}>{iotTotal}개</span>
                  </div>
                )}
                {poiTotal > 0 && (
                  <div className={styles.deviceSummaryRow}>
                    <span className={styles.deviceSummaryLabel}>POI</span>
                    <span className={styles.deviceSummaryCount}>{poiTotal}개</span>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedItem && (
            <>
              <div className={styles.divider} />
              <div className={styles.section}>
                <span className={styles.sectionLabel}>선택된 항목</span>
                <DeviceInfoPanel selected={selectedItem} onClose={() => setSelectedItem(null)} />
              </div>
            </>
          )}
        </aside>

        <div className={styles.canvas}>
          {currentFloor ? (
            <FloorCanvas
              floor={currentFloor}
              selected={selectedItem}
              onSelectDevice={(d) => setSelectedItem({ kind: 'device', data: d })}
              onSelectPoi={(p) => setSelectedItem({ kind: 'poi', data: p })}
            />
          ) : (
            <div className={styles.canvasPlaceholder}>
              <span className={styles.canvasPlaceholderTitle}>층 정보를 찾을 수 없습니다</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FloorPlansDetailPage;
