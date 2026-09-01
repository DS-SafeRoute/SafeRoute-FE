import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import BuildingIcon from '@assets/icons/ic-building.svg?react';
import EyeIcon from '@assets/icons/ic-eye.svg?react';
import MapIcon from '@assets/icons/ic-map.svg?react';
import UploadIcon from '@assets/icons/ic-upload.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import EmptyState from '@components/empty';
import useToast from '@components/toast/useToast';

import { ROUTES } from '@constants/path';

import { formatFloor, hasFloorPlan } from '@utils/floor';

import { setFloorGrid } from './api/floorGridApi';
import { analyzeFloor, getFloorBuildings, uploadFloor } from './api/floorPlansApi';
import * as styles from './FloorPlansPage.css';
import FloorReuploadConfirmModal from './modals/FloorReuploadConfirmModal';
import FloorUploadModal from './modals/FloorUploadModal';
import GridAreaSettingModal from './modals/GridAreaSettingModal';

import type { FloorBuilding, SegmentationStatus } from './types/floorPlans';

const NONE_STATUS_BADGE: { label: string; color: StatusBadgeColor } = {
  label: '미등록',
  color: 'neutral',
};

const STATUS_CONFIG: Record<SegmentationStatus, { label: string; color: StatusBadgeColor }> = {
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

const AiStatusText = ({ status }: { status: SegmentationStatus | null }) => {
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

interface UploadTarget {
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorNum: number;
}
interface FloorActionTarget {
  buildingId: string;
  buildingName: string;
  floor: FloorSummary;
}
interface PendingUpload {
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorNum: number;
  file: File;
  previewUrl: string;
}

interface FloorCardProps {
  floor: FloorSummary;
  buildingId: string;
  buildingName: string;
  onUpload: (target: UploadTarget) => void;
  onReupload: (target: FloorActionTarget) => void;
}

const FloorCard = ({ floor, buildingId, buildingName, onUpload, onReupload }: FloorCardProps) => {
  const navigate = useNavigate();
  const isNone = !hasFloorPlan(floor);
  const { label, color } = isNone ? NONE_STATUS_BADGE : STATUS_CONFIG[floor.segmentationStatus];
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
          <AiStatusText status={isNone ? null : floor.segmentationStatus} />
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
  const [hasLoadError, setHasLoadError] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [reuploadTarget, setReuploadTarget] = useState<FloorActionTarget | null>(null);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 미리보기 objectURL이 명시적으로 취소/제출되지 않고 화면을 벗어나는 경우(뒤로가기 등)를 대비한 안전망
  useEffect(() => {
    return () => {
      if (pendingUpload) URL.revokeObjectURL(pendingUpload.previewUrl);
    };
  }, [pendingUpload]);

  useEffect(() => {
    setLoading(true);
    setHasLoadError(false);
    getFloorBuildings()
      .then(setBuildings)
      .catch(() => {
        setHasLoadError(true);
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
    cellSizeMeter: number;
  }) => {
    if (!pendingUpload || isUploading) return;
    const { buildingId, buildingName, floorNum, file, previewUrl } = pendingUpload;
    setIsUploading(true);
    uploadFloor(buildingId, floorNum, file, params.realWidth, params.realHeight)
      .then(async (newFloor) => {
        // 그리드 생성을 기다리지 않고 바로 상세 화면으로 넘어가면, 상세 화면의 1회성 그리드 조회가
        // 그리드가 채 만들어지기 전에 실행돼 빈 결과를 캐싱해버릴 수 있음 — 성공/실패와 무관하게 완료까지 대기
        try {
          await setFloorGrid(newFloor.id, params.cellSizeMeter);
        } catch {
          show({
            title: '그리드 설정에 실패했습니다. 상세 화면에서 다시 설정해주세요.',
            variant: 'error',
          });
        }
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
        setIsUploading(false);
        void navigate(`/floorPlans/${buildingId}/${newFloor.id}`);
        analyzeFloor(newFloor.id).catch(() => {
          show({ title: '도면 분석 요청에 실패했습니다.', variant: 'error' });
        });
      })
      .catch(() => {
        // 미리보기와 입력값을 유지해 모달을 닫지 않고 바로 재시도할 수 있게 함
        setIsUploading(false);
        show({ title: '업로드에 실패했습니다. 다시 시도해주세요.', variant: 'error' });
      });
  };

  const hasFloors = buildings.some((building) => building.floors.length > 0);

  return (
    <>
      <div className={styles.container}>
        {loading && <p className={styles.stateMessage}>불러오는 중...</p>}
        {!loading && !hasLoadError && !hasFloors ? (
          <EmptyState
            className={styles.emptyState}
            icon={<BuildingIcon />}
            title="등록된 도면이 없습니다."
            description="건물과 층 정보를 등록한 뒤 도면을 업로드해 주세요."
            action={
              <Button type="button" onClick={() => void navigate(ROUTES.BUILDINGS)}>
                건물 등록하러 가기
              </Button>
            }
          />
        ) : null}
        {!loading &&
          !hasLoadError &&
          hasFloors &&
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
          isSubmitting={isUploading}
        />
      )}
    </>
  );
};

export default FloorPlansPage;
