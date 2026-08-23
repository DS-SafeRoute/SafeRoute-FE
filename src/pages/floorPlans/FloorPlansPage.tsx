import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import EyeIcon from '@assets/icons/ic-eye.svg?react';
import MapIcon from '@assets/icons/ic-map.svg?react';
import UploadIcon from '@assets/icons/ic-upload.svg?react';

import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import useToast from '@components/toast/useToast';

import { formatFloor } from '@utils/floor';

import { analyzeFloor, getFloorBuildings, uploadFloor } from './api/floorPlansApi';
import * as styles from './FloorPlansPage.css';
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
type PendingUpload = {
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorNum: number;
  file: File;
  previewUrl: string;
};

interface FloorCardProps {
  floor: FloorSummary;
  buildingId: string;
  buildingName: string;
  onUpload: (target: UploadTarget) => void;
  onReupload: (target: FloorActionTarget) => void;
}

const FloorCard = ({ floor, buildingId, buildingName, onUpload, onReupload }: FloorCardProps) => {
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
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);

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

  // 파일 선택 단계 — 실제 업로드는 다음 단계(가로/세로 입력)에서 함께 이뤄짐
  const handleFileSelected = (file: File) => {
    if (!uploadTarget) return;
    setPendingUpload({ ...uploadTarget, file, previewUrl: URL.createObjectURL(file) });
    setUploadTarget(null);
  };

  const handleCloseUploadDimensionsModal = () => {
    if (pendingUpload) URL.revokeObjectURL(pendingUpload.previewUrl);
    setPendingUpload(null);
  };

  const handleUploadDimensionsConfirm = (params: {
    realWidth: number;
    realHeight: number;
    gridScale: number;
  }) => {
    if (!pendingUpload) return;
    const { buildingId, buildingName, floorNum, file, previewUrl } = pendingUpload;
    uploadFloor(buildingId, floorNum, file, params.realWidth, params.realHeight)
      .then((newFloor) => {
        setBuildings((prev) =>
          prev.map((b) => {
            if (b.id !== buildingId) return b;
            const exists = b.floors.some((f) => f.floorNum === floorNum);
            return {
              ...b,
              floors: exists
                ? b.floors.map((f) => (f.floorNum === floorNum ? newFloor : f))
                : [...b.floors, newFloor],
            };
          }),
        );
        show({
          title: '도면이 업로드되었습니다.',
          description: `${buildingName} · ${formatFloor(floorNum)} 도면이 등록되었습니다.`,
          variant: 'success',
        });
        URL.revokeObjectURL(previewUrl);
        setPendingUpload(null);
        void navigate(`/floorPlans/${buildingId}/${newFloor.id}`);
        analyzeFloor(newFloor.id).catch(() => {});
      })
      .catch(() => {
        // 미리보기와 입력값을 유지해 모달을 닫지 않고 바로 재시도할 수 있게 함
        show({ title: '업로드에 실패했습니다. 다시 시도해주세요.', variant: 'error' });
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
          onConfirm={handleFileSelected}
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

      {pendingUpload && (
        <GridAreaSettingModal
          open
          onClose={handleCloseUploadDimensionsModal}
          mapImageUrl={pendingUpload.previewUrl}
          onConfirm={handleUploadDimensionsConfirm}
        />
      )}
    </>
  );
};

export default FloorPlansPage;
