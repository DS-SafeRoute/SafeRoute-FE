import { useState } from 'react';

import { useNavigate } from 'react-router';

import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import GNB from '@components/gnb';
import ToastContainer from '@components/toast/ToastContainer';
import useToast from '@components/toast/useToast';

import * as styles from './FloorPlansPage.css';
import { mockFloorBuildings } from './mocks/floorPlansData';
import FloorUploadModal from './modals/FloorUploadModal';

import type { FloorBuilding, SegmentationStatus } from './types/floorPlans';

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

type UploadTarget = { buildingId: number; buildingName: string; floorId: number; floorNum: number };
type DeleteTarget = { buildingId: number; floorId: number; floorNum: number; buildingName: string };

interface FloorCardProps {
  floor: {
    id: number;
    floorNum: number;
    mapImageUrl: string | null;
    segmentationStatus: SegmentationStatus;
    processedAt: string | null;
  };
  buildingId: number;
  onManage: (buildingId: number, floorId: number) => void;
  onUpload: (target: UploadTarget) => void;
  onDelete: (target: DeleteTarget) => void;
  buildingName: string;
}

const FloorCard = ({
  floor,
  buildingId,
  buildingName,
  onManage,
  onUpload,
  onDelete,
}: FloorCardProps) => {
  const { label, color } = STATUS_CONFIG[floor.segmentationStatus];
  const isProcessing =
    floor.segmentationStatus === 'PENDING' || floor.segmentationStatus === 'PROCESSING';
  const isNone = floor.segmentationStatus === 'NONE';

  return (
    <div className={styles.floorCard}>
      <div className={styles.cardTop}>
        <div className={styles.cardIconWrap} aria-hidden="true">
          <div className={styles.cardIconInner} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <StatusBadge label={label} color={color} />
          <button
            type="button"
            className={styles.deleteButton}
            title="층 삭제"
            onClick={() =>
              onDelete({ buildingId, floorId: floor.id, floorNum: floor.floorNum, buildingName })
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
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
          onClick={() => !isProcessing && onManage(buildingId, floor.id)}
        >
          {isProcessing ? '처리 중...' : '도면 관리'}
        </button>
      )}
    </div>
  );
};

const FloorPlansPage = () => {
  const navigate = useNavigate();
  const { toasts, leavingIds, show, dismiss } = useToast();
  const [buildings, setBuildings] = useState<FloorBuilding[]>(mockFloorBuildings);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setBuildings((prev) =>
      prev.map((b) =>
        b.id !== deleteTarget.buildingId
          ? b
          : { ...b, floors: b.floors.filter((f) => f.id !== deleteTarget.floorId) },
      ),
    );
    show({
      title: '층 도면이 삭제되었습니다.',
      description: `${deleteTarget.buildingName} · ${formatFloor(deleteTarget.floorNum)} 도면이 삭제되었습니다.`,
      variant: 'success',
    });
    setDeleteTarget(null);
  };

  const handleManage = (buildingId: number, floorId: number) => {
    void navigate(`/floorPlans/${buildingId}/${floorId}`);
  };

  const handleUploadConfirm = (file: File) => {
    if (!uploadTarget) return;
    setBuildings((prev) =>
      prev.map((b) =>
        b.id !== uploadTarget.buildingId
          ? b
          : {
              ...b,
              floors: b.floors.map((f) =>
                f.id !== uploadTarget.floorId
                  ? f
                  : {
                      ...f,
                      mapImageUrl: URL.createObjectURL(file),
                      segmentationStatus: 'PENDING' as const,
                      processedAt: new Date().toISOString(),
                    },
              ),
            },
      ),
    );
    setUploadTarget(null);
    show({
      title: '도면이 업로드되었습니다.',
      description: `${uploadTarget.buildingName} · ${formatFloor(uploadTarget.floorNum)} 도면이 등록되었습니다.`,
      variant: 'success',
    });
    void navigate(`/floorPlans/${uploadTarget.buildingId}/${uploadTarget.floorId}`);
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
        {buildings.map((building) => (
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
                  buildingName={building.name}
                  onManage={handleManage}
                  onUpload={setUploadTarget}
                  onDelete={setDeleteTarget}
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

      {deleteTarget && (
        <div className={styles.confirmOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <p className={styles.confirmTitle}>층 도면 삭제</p>
            <p className={styles.confirmDesc}>
              {deleteTarget.buildingName} · {formatFloor(deleteTarget.floorNum)} 도면을 삭제하면
              복구할 수 없습니다. 계속하시겠습니까?
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={handleDeleteConfirm}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} leavingIds={leavingIds} onClose={dismiss} />
    </>
  );
};

export default FloorPlansPage;
