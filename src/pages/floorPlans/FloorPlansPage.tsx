import { useState } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import GNB from '@components/gnb';

import * as styles from './FloorPlansPage.css';
import { mockFloorBuildings } from './mocks/floorPlansData';

import type { Floor, SegmentationStatus } from './types/floorPlans';

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

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const getActionLabel = (status: SegmentationStatus) => {
  if (status === 'NONE') return '도면 업로드';
  if (status === 'FAILED') return '재시도';
  if (status === 'DONE') return '편집';
  return null;
};

interface FloorRowProps {
  floor: Floor;
  buildingId: number;
  onEdit: (buildingId: number, floorId: number) => void;
}

const FloorRow = ({ floor, buildingId, onEdit }: FloorRowProps) => {
  const { label, color } = STATUS_CONFIG[floor.segmentationStatus];
  const actionLabel = getActionLabel(floor.segmentationStatus);
  const isProcessing =
    floor.segmentationStatus === 'PENDING' || floor.segmentationStatus === 'PROCESSING';

  return (
    <div className={styles.floorCard}>
      <div className={styles.thumbnail}>
        {floor.mapImageUrl ? (
          <img
            src={floor.mapImageUrl}
            alt={`${formatFloor(floor.floorNum)} 도면`}
            className={styles.thumbnailImg}
          />
        ) : (
          <span className={styles.thumbnailPlaceholder}>없음</span>
        )}
      </div>

      <div className={styles.floorInfo}>
        <span className={styles.floorLabel}>{formatFloor(floor.floorNum)}</span>
        {floor.processedAt && (
          <span className={styles.floorMeta}>처리 완료: {formatDate(floor.processedAt)}</span>
        )}
        {floor.segmentationStatus === 'DONE' && (
          <span className={styles.floorMeta}>
            장치 {floor.devices.length}개 · POI {floor.pois.length}개
          </span>
        )}
      </div>

      <StatusBadge label={label} color={color} dot />

      <div className={styles.floorActions}>
        {actionLabel && !isProcessing && (
          <Button
            variant={floor.segmentationStatus === 'DONE' ? 'outlined' : 'primary'}
            size="sm"
            onClick={() => floor.segmentationStatus === 'DONE' && onEdit(buildingId, floor.id)}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

const FloorPlansPage = () => {
  const navigate = useNavigate();
  const [selectedBuildingId, setSelectedBuildingId] = useState(mockFloorBuildings[0]?.id ?? null);

  const handleEdit = (buildingId: number, floorId: number) => {
    void navigate(`/floorPlans/${buildingId}/${floorId}`);
  };

  const selectedBuilding = mockFloorBuildings.find((b) => b.id === selectedBuildingId) ?? null;

  return (
    <>
      <GNB
        breadcrumbs={[{ label: '관리' }]}
        title="도면 관리"
        description="건물별 층 도면 등록 및 세그멘테이션 관리"
        userName="김안전"
        userRole="관리자"
      />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>건물 목록</div>
          <ul className={styles.buildingList} role="listbox" aria-label="건물 선택">
            {mockFloorBuildings.map((building) => (
              <li
                key={building.id}
                role="option"
                aria-selected={building.id === selectedBuildingId}
                className={clsx(
                  styles.buildingItem,
                  building.id === selectedBuildingId && styles.buildingItemActive,
                )}
                onClick={() => setSelectedBuildingId(building.id)}
              >
                {building.name}
              </li>
            ))}
          </ul>
        </aside>

        <main className={styles.main}>
          <div className={styles.mainHeader}>
            <span className={styles.mainTitle}>{selectedBuilding?.name ?? '-'}</span>
            <span className={styles.mainCount}>총 {selectedBuilding?.floors.length ?? 0}개 층</span>
          </div>

          {selectedBuilding && selectedBuilding.floors.length > 0 ? (
            <div className={styles.floorList}>
              {selectedBuilding.floors.map((floor) => (
                <FloorRow
                  key={floor.id}
                  floor={floor}
                  buildingId={selectedBuilding.id}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>등록된 층 정보가 없습니다</span>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default FloorPlansPage;
