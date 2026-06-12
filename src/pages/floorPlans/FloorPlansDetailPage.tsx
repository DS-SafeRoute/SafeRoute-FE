import { useState } from 'react';

import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import GNB from '@components/gnb';

import * as styles from './FloorPlansDetailPage.css';
import { mockFloorBuildings } from './mocks/floorPlansData';

import type { EditMode, SegmentationStatus } from './types/floorPlans';

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

const FloorPlansDetailPage = () => {
  const navigate = useNavigate();
  const { buildingId, floorId } = useParams<{ buildingId: string; floorId: string }>();

  const building = mockFloorBuildings.find((b) => String(b.id) === buildingId) ?? null;
  const floor = building?.floors.find((f) => String(f.id) === floorId) ?? null;

  const [selectedBuildingId, setSelectedBuildingId] = useState(buildingId ?? '');
  const [selectedFloorId, setSelectedFloorId] = useState(floorId ?? '');
  const [editMode, setEditMode] = useState<EditMode>('view');

  const currentBuilding =
    mockFloorBuildings.find((b) => String(b.id) === selectedBuildingId) ?? null;
  const currentFloor =
    currentBuilding?.floors.find((f) => String(f.id) === selectedFloorId) ?? null;

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBuildingId = e.target.value;
    const newBuilding = mockFloorBuildings.find((b) => String(b.id) === newBuildingId);
    const firstFloorId = newBuilding?.floors[0]?.id;
    setSelectedBuildingId(newBuildingId);
    setSelectedFloorId(firstFloorId ? String(firstFloorId) : '');
    if (firstFloorId) {
      void navigate(`/floorPlans/${newBuildingId}/${firstFloorId}`);
    }
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFloorId = e.target.value;
    setSelectedFloorId(newFloorId);
    void navigate(`/floorPlans/${selectedBuildingId}/${newFloorId}`);
  };

  const status = currentFloor?.segmentationStatus ?? floor?.segmentationStatus ?? 'NONE';
  const { label: statusLabel, color: statusColor } = STATUS_CONFIG[status];
  const canRunAI = status === 'NONE' || status === 'FAILED';

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
              <select
                className={styles.select}
                value={selectedBuildingId}
                onChange={handleBuildingChange}
                aria-label="건물 선택"
              >
                {mockFloorBuildings.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                value={selectedFloorId}
                onChange={handleFloorChange}
                aria-label="층 선택"
                disabled={!currentBuilding}
              >
                {currentBuilding?.floors.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {formatFloor(f.floorNum)}
                  </option>
                ))}
              </select>
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
        </aside>

        <div className={styles.canvas}>
          {currentFloor?.mapImageUrl ? (
            <img
              src={currentFloor.mapImageUrl}
              alt={`${formatFloor(currentFloor.floorNum)} 도면`}
              className={styles.mapImage}
            />
          ) : (
            <div className={styles.canvasPlaceholder}>
              <span className={styles.canvasPlaceholderTitle}>등록된 도면이 없습니다</span>
              <span>AI 영역 분할 실행 또는 도면 이미지를 업로드해 주세요</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FloorPlansDetailPage;
