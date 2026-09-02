import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router';

import BuildingIcon from '@assets/icons/ic-building.svg?react';
import EyeIcon from '@assets/icons/ic-eye.svg?react';
import MapIcon from '@assets/icons/ic-map.svg?react';
import UploadIcon from '@assets/icons/ic-upload.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';
import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';
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

  const loadFloorBuildings = useCallback(() => {
    setLoading(true);
    setHasLoadError(false);
    return getFloorBuildings()
      .then(setBuildings)
      .catch(() => {
        setHasLoadError(true);
        show({ title: '도면 목록을 불러오지 못했습니다.', variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(() => {
    void loadFloorBuildings();
  }, [loadFloorBuildings]);

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
        // 그리드 배율을 지금 설정해도, 뒤이어 실행되는 AI 분석이 그리드 셀을 재생성하면서
        // cellSizeMeter가 사라지는 경우가 있음. 그래서 값을 sessionStorage에 남겨두고
        // (새로고침에도 살아남음) 상세 화면에서 분석 완료 후 한 번 더 PUT 하게 함
        try {
          // 분석이 끝난 뒤 상세 화면에서 다시 적용해야 하므로 pending으로 남기고,
          // 값 자체도 기억해둬서 이후 CCTV 등록 때 사용자에게 다시 묻지 않게 함
          localStorage.setItem(
            `saferoute:pendingGridCellSize:${newFloor.id}`,
            String(params.cellSizeMeter),
          );
          localStorage.setItem(
            `saferoute:gridCellSize:${newFloor.id}`,
            String(params.cellSizeMeter),
          );
        } catch {
          // 스토리지 사용 불가 환경 — 무시하고 아래 즉시 설정에만 의존
        }
        // 상세 화면의 1회성 그리드 조회가 빈 결과를 캐싱하지 않도록, 이동 전에 한 번은 설정 시도
        try {
          await setFloorGrid(newFloor.id, params.cellSizeMeter);
        } catch {
          show({
            title: '그리드 설정에 실패했습니다. 분석 완료 후 자동으로 다시 시도합니다.',
            variant: 'warning',
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
          description: `${buildingName} · ${formatFloor(floorNum)} AI 분석이 진행 중입니다. 완료되면 상세 화면에 자동으로 반영됩니다.`,
          variant: 'success',
        });
        URL.revokeObjectURL(previewUrl);
        setPendingUpload(null);
        setIsUploading(false);
        void navigate(`/floorPlans/${buildingId}/${newFloor.id}`);
        // 분석 요청은 서버에서 오래 걸려 타임아웃될 수 있는데, 타임아웃은 '분석이 시작됐다'는 증거가
        // 아니므로 성공으로 넘기지 않는다. 상세 화면이 상태를 폴링하니 그쪽에서 확인하도록 안내만 구분
        analyzeFloor(newFloor.id).catch((error: unknown) => {
          const timedOut = isAxiosError(error) && error.code === 'ECONNABORTED';
          show({
            title: timedOut
              ? '분석 요청 응답이 지연되고 있습니다. 상세 화면에서 진행 상태를 확인해주세요.'
              : '도면 분석 요청에 실패했습니다. 상세 화면에서 다시 시도해주세요.',
            variant: 'warning',
          });
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
        {loading && <LoadingState />}
        {!loading && hasLoadError ? (
          <EmptyState
            className={styles.emptyState}
            icon={<BuildingIcon />}
            title="도면 목록을 불러오지 못했습니다."
            action={
              <Button type="button" variant="ghost" onClick={() => void loadFloorBuildings()}>
                다시 시도
              </Button>
            }
          />
        ) : null}
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
