import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import EyeIcon from '@assets/icons/ic-eye.svg?react';
import MapIcon from '@assets/icons/ic-map.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';
import UploadIcon from '@assets/icons/ic-upload.svg?react';

import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import useToast from '@components/toast/useToast';

import { formatFloor } from '@utils/floor';

import { deleteFloor, getFloorBuildings, segmentFloor, uploadFloor } from './api/floorPlansApi';
import * as styles from './FloorPlansPage.css';
import FloorDeleteConfirmModal from './modals/FloorDeleteConfirmModal';
import FloorReuploadConfirmModal from './modals/FloorReuploadConfirmModal';
import FloorUploadModal from './modals/FloorUploadModal';
import GridAreaSettingModal from './modals/GridAreaSettingModal';

import type { FloorBuilding, SegmentationStatus } from './types/floorPlans';

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

interface FloorSummary {
  id: string;
  floorNum: number;
  mapImageUrl: string | null;
  segmentationStatus: SegmentationStatus;
  processedAt: string | null;
}

type UploadTarget = { buildingId: string; buildingName: string; floorId: string; floorNum: number };
type FloorActionTarget = { buildingId: string; buildingName: string; floor: FloorSummary };
type SegmentTarget = { buildingId: string; floorId: string; previewUrl: string | null };

interface FloorCardProps {
  floor: FloorSummary;
  buildingId: string;
  buildingName: string;
  onUpload: (target: UploadTarget) => void;
  onReupload: (target: FloorActionTarget) => void;
  onDelete: (target: FloorActionTarget) => void;
}

const FloorCard = ({
  floor,
  buildingId,
  buildingName,
  onUpload,
  onReupload,
  onDelete,
}: FloorCardProps) => {
  const navigate = useNavigate();
  const { label, color } = STATUS_CONFIG[floor.segmentationStatus];
  const isNone = floor.segmentationStatus === 'NONE';
  const isDone = floor.segmentationStatus === 'DONE';

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
        <div className={styles.cardActionRow}>
          {isDone && (
            <button
              type="button"
              className={styles.detailButton}
              onClick={() => navigate(`/floorPlans/${buildingId}/${floor.id}`)}
            >
              <EyeIcon width={14} height={14} />
              상세보기
            </button>
          )}
          <button
            type="button"
            className={styles.reuploadButton}
            onClick={() => onReupload({ buildingId, buildingName, floor })}
          >
            <UploadIcon width={14} height={14} />
            재업로드
          </button>
          <button
            type="button"
            className={styles.deleteButtonCard}
            onClick={() => onDelete({ buildingId, buildingName, floor })}
          >
            <TrashIcon width={14} height={14} />
            삭제
          </button>
        </div>
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
  const [reuploadTarget, setReuploadTarget] = useState<FloorActionTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FloorActionTarget | null>(null);
  const [segmentTarget, setSegmentTarget] = useState<SegmentTarget | null>(null);

  useEffect(() => {
    setLoading(true);
    getFloorBuildings()
      .then(setBuildings)
      .catch(() => {
        show({ title: '도면 목록을 불러오지 못했습니다.', variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [show]);

  const handleOpenFloorUpload = (target: FloorActionTarget) => {
    setUploadTarget({
      buildingId: target.buildingId,
      buildingName: target.buildingName,
      floorId: target.floor.id,
      floorNum: target.floor.floorNum,
    });
  };

  const handleReuploadConfirm = () => {
    if (reuploadTarget) handleOpenFloorUpload(reuploadTarget);
    setReuploadTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { buildingId, buildingName, floor } = deleteTarget;
    deleteFloor(floor.id)
      .then(() => {
        setBuildings((prev) =>
          prev.map((b) =>
            b.id !== buildingId
              ? b
              : {
                  ...b,
                  floors: b.floors.map((f) =>
                    f.id !== floor.id
                      ? f
                      : { ...f, segmentationStatus: 'NONE', mapImageUrl: null, processedAt: null },
                  ),
                },
          ),
        );
        show({
          title: '층 도면이 삭제되었습니다.',
          description: `${buildingName} · ${formatFloor(floor.floorNum)} 도면이 삭제되었습니다.`,
          variant: 'success',
        });
      })
      .catch(() => {
        show({ title: '삭제에 실패했습니다.', variant: 'error' });
      })
      .finally(() => setDeleteTarget(null));
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
        setSegmentTarget({
          buildingId: uploadTarget.buildingId,
          floorId: uploadTarget.floorId,
          previewUrl: URL.createObjectURL(file),
        });
      })
      .catch(() => {
        show({ title: '업로드에 실패했습니다.', variant: 'error' });
      })
      .finally(() => setUploadTarget(null));
  };

  const handleCloseSegmentModal = () => {
    if (segmentTarget?.previewUrl) URL.revokeObjectURL(segmentTarget.previewUrl);
    setSegmentTarget(null);
  };

  const handleSegmentConfirm = (params: {
    realWidth: number;
    realHeight: number;
    gridScale: number;
  }) => {
    if (!segmentTarget) return;
    const { buildingId, floorId, previewUrl } = segmentTarget;
    segmentFloor(floorId, params)
      .then(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSegmentTarget(null);
        void navigate(`/floorPlans/${buildingId}/${floorId}`);
      })
      .catch(() => {
        // 설정값과 미리보기를 유지해 모달을 닫지 않고 바로 재시도할 수 있게 함
        show({ title: 'AI 분석 요청에 실패했습니다. 다시 시도해주세요.', variant: 'error' });
      });
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
                      onUpload={setUploadTarget}
                      onReupload={setReuploadTarget}
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

      {reuploadTarget && (
        <FloorReuploadConfirmModal
          open
          onClose={() => setReuploadTarget(null)}
          buildingName={reuploadTarget.buildingName}
          floorNum={reuploadTarget.floor.floorNum}
          onConfirm={handleReuploadConfirm}
        />
      )}

      {deleteTarget && (
        <FloorDeleteConfirmModal
          open
          onClose={() => setDeleteTarget(null)}
          buildingName={deleteTarget.buildingName}
          floorNum={deleteTarget.floor.floorNum}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {segmentTarget && (
        <GridAreaSettingModal
          open
          onClose={handleCloseSegmentModal}
          mapImageUrl={segmentTarget.previewUrl}
          onConfirm={handleSegmentConfirm}
        />
      )}
    </>
  );
};

export default FloorPlansPage;
