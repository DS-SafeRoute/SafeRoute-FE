import { useNavigate } from 'react-router';

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
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const AiStatusText = ({ status }: { status: SegmentationStatus }) => {
  if (status === 'DONE') return <span className={styles.metaValueDone}>완료</span>;
  if (status === 'PENDING') return <span className={styles.metaValuePending}>대기중</span>;
  if (status === 'PROCESSING') return <span className={styles.metaValuePending}>처리중</span>;
  if (status === 'FAILED') return <span className={styles.metaValueFailed}>실패</span>;
  return <span className={styles.metaValue}>—</span>;
};

interface FloorCardProps {
  floor: Floor;
  buildingId: number;
  onManage: (buildingId: number, floorId: number) => void;
}

const FloorCard = ({ floor, buildingId, onManage }: FloorCardProps) => {
  const { label, color } = STATUS_CONFIG[floor.segmentationStatus];

  return (
    <div className={styles.floorCard}>
      <div className={styles.cardTop}>
        <div className={styles.cardIconWrap} aria-hidden="true">
          <div className={styles.cardIconInner} />
        </div>
        <StatusBadge label={label} color={color} />
      </div>

      <span className={styles.floorLabel}>{formatFloor(floor.floorNum)}</span>

      <div className={styles.divider} />

      <div className={styles.cardMeta}>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>업로드</span>
          <span className={styles.metaValue}>{formatDate(floor.processedAt)}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>AI 분석</span>
          <AiStatusText status={floor.segmentationStatus} />
        </div>
      </div>

      <button
        type="button"
        className={styles.manageButton}
        onClick={() => onManage(buildingId, floor.id)}
      >
        도면 관리
      </button>
    </div>
  );
};

const FloorPlansPage = () => {
  const navigate = useNavigate();

  const handleManage = (buildingId: number, floorId: number) => {
    void navigate(`/floorPlans/${buildingId}/${floorId}`);
  };

  return (
    <>
      <GNB
        breadcrumbs={[{ label: '관리' }]}
        title="도면 관리"
        description="등록된 건물별 도면을 확인하고 관리할 수 있습니다"
        userName="김안전"
        userRole="관리자"
      />

      <div className={styles.container}>
        {mockFloorBuildings.map((building) => (
          <section key={building.id} className={styles.buildingSection}>
            <div className={styles.buildingHeader}>
              <div className={styles.buildingDot} aria-hidden="true" />
              <span className={styles.buildingName}>{building.name}</span>
              <span className={styles.buildingCount}>{building.floors.length}개 층</span>
            </div>

            <div className={styles.floorGrid}>
              {building.floors.map((floor) => (
                <FloorCard
                  key={floor.id}
                  floor={floor}
                  buildingId={building.id}
                  onManage={handleManage}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
};

export default FloorPlansPage;
