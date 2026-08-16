import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import MapIcon from '@assets/icons/ic-map.svg?react';

import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import useToast from '@components/toast/useToast';

import { formatFloor } from '@utils/floor';

import { deleteFloor, getFloorBuildings, uploadFloor } from './api/floorPlansApi';
import * as styles from './FloorPlansPage.css';
import FloorManageModal from './modals/FloorManageModal';
import FloorReuploadConfirmModal from './modals/FloorReuploadConfirmModal';
import FloorUploadModal from './modals/FloorUploadModal';

import type { Floor, FloorBuilding, SegmentationStatus } from './types/floorPlans';

const STATUS_CONFIG: Record<SegmentationStatus, { label: string; color: StatusBadgeColor }> = {
  NONE: { label: '미등록', color: 'neutral' },
  PENDING: { label: '대기중', color: 'yellow' },
  PROCESSING: { label: '처리중', color: 'blue' },
  DONE: { label: '완료', color: 'green' },
  FAILED: { label: '실패', color: 'red' },
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AiStatusText = ({ status }: { status: SegmentationStatus }) => {
  if (status === 'DONE') return <span className={styles.metaValueDone}>완료</span>;
  if (status === 'PENDING') return <span className={styles.metaValuePending}>대기중</span>;
  if (status === 'PROCESSING') return <span className={styles.metaValuePending}>처리중</span>;
  if (status === 'FAILED') return <span className={styles.metaValueFailed}>실패</span>;
  return <span className={styles.metaValue}>—</span>;
};

type UploadTarget = { buildingId: number; buildingName: string; floorId: number; floorNum: number };

interface FloorCardProps {
  floor: {
    id: number;
    floorNum: number;
    mapImageUrl: string | null;
    segmentationStatus: SegmentationStatus;
    processedAt: string | null;
  };
  buildingId: number;
  onManage: (buildingId: number) => void;
  onUpload: (target: UploadTarget) => void;
  buildingName: string;
}

const FloorCard = ({ floor, buildingId, buildingName, onManage, onUpload }: FloorCardProps) => {
  const { label, color } = STATUS_CONFIG[floor.segmentationStatus];
  const isProcessing =
    floor.segmentationStatus === 'PENDING' || floor.segmentationStatus === 'PROCESSING';
  const isNone = floor.segmentationStatus === 'NONE';

  return (
    <div className={styles.floorCard}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>
          <MapIcon width={16} height={16} />
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

      {isNone ? (
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() =>
            onUpload({ buildingId, buildingName, floorId: floor.id, floorNum: floor.floorNum })
          }
        >
          도면 업로드
        </button>
      ) : (
        <button
          type="button"
          className={styles.manageButton}
          disabled={isProcessing}
          onClick={() => !isProcessing && onManage(buildingId)}
        >
          {isProcessing ? '처리 중...' : '도면 관리'}
        </button>
      )}
    </div>
  );
};

const FloorPlansPage = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const [buildings, setBuildings] = useState<FloorBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [manageBuildingId, setManageBuildingId] = useState<number | null>(null);
  const [reuploadTarget, setReuploadTarget] = useState<Floor | null>(null);

  useEffect(() => {
    setLoading(true);
    getFloorBuildings()
      .then(setBuildings)
      .catch(() => {
        show({ title: '도면 목록을 불러오지 못했습니다.', variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [show]);

  const handleManage = (buildingId: number) => {
    setManageBuildingId(buildingId);
  };

  const manageBuilding = buildings.find((b) => b.id === manageBuildingId) ?? null;

  const handleOpenFloorUpload = (floor: Floor) => {
    if (!manageBuilding) return;
    setUploadTarget({
      buildingId: manageBuilding.id,
      buildingName: manageBuilding.name,
      floorId: floor.id,
      floorNum: floor.floorNum,
    });
  };

  const handleReuploadConfirm = () => {
    if (reuploadTarget) handleOpenFloorUpload(reuploadTarget);
    setReuploadTarget(null);
  };

  const handleDeleteFloor = (floor: Floor) => {
    if (!manageBuilding) return;
    const buildingId = manageBuilding.id;
    deleteFloor(floor.id)
      .then(() => {
        setBuildings((prev) =>
          prev.map((b) =>
            b.id !== buildingId ? b : { ...b, floors: b.floors.filter((f) => f.id !== floor.id) },
          ),
        );
        show({
          title: '층 도면이 삭제되었습니다.',
          description: `${manageBuilding.name} · ${formatFloor(floor.floorNum)} 도면이 삭제되었습니다.`,
          variant: 'success',
        });
      })
      .catch(() => {
        show({ title: '삭제에 실패했습니다.', variant: 'error' });
      });
  };

  const handleUploadConfirm = (file: File) => {
    if (!uploadTarget) return;
    uploadFloor(uploadTarget.buildingId, uploadTarget.floorNum, file)
      .then((newFloor) => {
        setBuildings((prev) =>
          prev.map((b) =>
            b.id !== uploadTarget.buildingId
              ? b
              : {
                  ...b,
                  floors: b.floors.map((f) =>
                    f.id !== uploadTarget.floorId ? f : { ...f, ...newFloor },
                  ),
                },
          ),
        );
        show({
          title: '도면이 업로드되었습니다.',
          description: `${uploadTarget.buildingName} · ${formatFloor(uploadTarget.floorNum)} 도면이 등록되었습니다.`,
          variant: 'success',
        });
        void navigate(`/floorPlans/${uploadTarget.buildingId}/${uploadTarget.floorId}`);
      })
      .catch(() => {
        show({ title: '업로드에 실패했습니다.', variant: 'error' });
      })
      .finally(() => setUploadTarget(null));
  };

  return (
    <>
      <div className={styles.container}>
        {loading && (
          <p style={{ color: 'var(--color-textLow)', fontSize: '1.4rem', padding: '2rem 0' }}>
            불러오는 중...
          </p>
        )}
        {!loading &&
          buildings.map((building) => (
            <section key={building.id} className={styles.buildingSection}>
              <div className={styles.buildingHeader}>
                <div className={styles.buildingDot} aria-hidden="true" />
                <span className={styles.buildingName}>{building.name}</span>
                <span className={styles.buildingCount}>{building.floors.length}개 층</span>
              </div>

              <div className={styles.floorGrid}>
                {[...building.floors]
                  .sort((a, b) => a.floorNum - b.floorNum)
                  .map((floor) => (
                    <FloorCard
                      key={floor.id}
                      floor={floor}
                      buildingId={building.id}
                      buildingName={building.name}
                      onManage={handleManage}
                      onUpload={setUploadTarget}
                    />
                  ))}
              </div>
            </section>
          ))}
      </div>

      {uploadTarget && (
        <FloorUploadModal
          open
          onClose={() => setUploadTarget(null)}
          buildingName={uploadTarget.buildingName}
          floorNum={uploadTarget.floorNum}
          onConfirm={handleUploadConfirm}
        />
      )}

      {manageBuilding && (
        <FloorManageModal
          open
          onClose={() => setManageBuildingId(null)}
          buildingName={manageBuilding.name}
          floors={manageBuilding.floors}
          onUpload={handleOpenFloorUpload}
          onReupload={setReuploadTarget}
          onDelete={handleDeleteFloor}
        />
      )}

      {reuploadTarget && (
        <FloorReuploadConfirmModal
          open
          onClose={() => setReuploadTarget(null)}
          floorNum={reuploadTarget.floorNum}
          onConfirm={handleReuploadConfirm}
        />
      )}
    </>
  );
};

export default FloorPlansPage;
