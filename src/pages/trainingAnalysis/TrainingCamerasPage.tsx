import { useMemo } from 'react';

import { Navigate, useNavigate, useParams } from 'react-router';

import { extractApiError } from '@apis/errors/apiError';

import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';

import { getTrainingCameraFramesPath, ROUTES } from '@constants/path';

import { useSessionCamerasQuery } from './api/useSessionCamerasQuery';
import { useTrainingSessionQuery } from './api/useViewableTrainingSessionsQuery';
import CameraCard from './components/CameraCard/CameraCard';
import SessionInfoCard from './components/SessionInfoCard/SessionInfoCard';
import {
  isLiveSessionStatus,
  TRAINING_SESSION_STATUS_VIEW,
  VIEWABLE_SESSION_STATUSES,
} from './constants/trainingAnalysis';
import * as styles from './TrainingCamerasPage.css';
import { formatSessionStartedAt } from './utils/trainingAnalysis';

import type { MonitoringCamera, TrainingSessionStatus } from './types/trainingAnalysis';

const isViewable = (status: TrainingSessionStatus) =>
  (VIEWABLE_SESSION_STATUSES as readonly TrainingSessionStatus[]).includes(status);

// 층별로 묶어서 보여주기 위한 그룹핑. Map은 key가 처음 등장한 순서를 유지하므로
// 카메라 목록 응답 순서(대개 층 순)를 그대로 따라감
const groupByFloor = (cameras: MonitoringCamera[]) => {
  const groups = new Map<string, MonitoringCamera[]>();
  for (const camera of cameras) {
    const group = groups.get(camera.floorName);
    if (group) group.push(camera);
    else groups.set(camera.floorName, [camera]);
  }
  return Array.from(groups.entries());
};

const TrainingCamerasPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    session,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useTrainingSessionQuery(sessionId);
  const isLive = isLiveSessionStatus(session?.status);
  const {
    data: cameras = [],
    isLoading: isCamerasLoading,
    isError: isCamerasError,
    error: camerasError,
  } = useSessionCamerasQuery(sessionId, { live: isLive });

  const floorGroups = useMemo(() => groupByFloor(cameras), [cameras]);

  if (!isSessionLoading && !isSessionError && (!session || !isViewable(session.status))) {
    return <Navigate to={ROUTES.TRAINING_ANALYSIS} replace />;
  }

  if (isSessionError) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="훈련 정보를 불러오지 못했습니다"
          description="잠시 후 다시 시도해주세요"
        />
      </div>
    );
  }

  if (isSessionLoading || !session) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  const statusView = TRAINING_SESSION_STATUS_VIEW[session.status];
  // capturedAt은 "프레임이 있는지"가 아니라 "이미지가 첨부된 프레임이 있는지"만 나타냄(실측 확인됨
  // — 이미지 없이 보낸 관측치는 데이터가 정상 저장돼도 이 값이 계속 null). 그래서 이 수는
  // "썸네일이 있는 카메라 수"로만 씀 — "프레임이 있는 카메라 수"라고 하면 실제보다 적게 셀 수 있음
  const camerasWithThumbnail = cameras.filter((camera) => camera.capturedAt !== null);

  const handleSelect = (camera: MonitoringCamera) => {
    void navigate(getTrainingCameraFramesPath(session.sessionId, camera.cctvId));
  };

  return (
    <div className={styles.container}>
      <SessionInfoCard
        sessionName={session.scenarioName}
        statusLabel={statusView.label}
        statusColor={statusView.color}
        meta={`${session.buildingName} · ${formatSessionStartedAt(session.startedAt)} 시작 · 카메라 ${cameras.length}대`}
        notice={
          isLive
            ? '훈련이 진행 중입니다. 카메라별 최신 프레임이 약 5초 간격으로 갱신됩니다.'
            : '훈련 중 5초 간격으로 수집된 프레임을 카메라별로 확인할 수 있습니다.'
        }
        onBack={() => void navigate(ROUTES.TRAINING_ANALYSIS)}
      />

      <div className={styles.gridSection}>
        {isCamerasLoading && <LoadingState size="md" message="카메라 목록을 불러오는 중..." />}

        {!isCamerasLoading && isCamerasError && (
          <EmptyState
            title="카메라 목록을 불러오지 못했습니다"
            // 서버가 이유를 message로 내려주면(예: 세션이 더 이상 조회 가능한 상태가 아님)
            // 그대로 보여줌 — "잠시 후 다시 시도해주세요"는 재시도로 해결 안 되는 경우에도
            // 똑같이 떠서 오해를 줬음
            description={extractApiError(camerasError).message || '잠시 후 다시 시도해주세요'}
          />
        )}

        {!isCamerasLoading && !isCamerasError && cameras.length === 0 && (
          <EmptyState title="등록된 카메라가 없습니다" />
        )}

        {!isCamerasLoading && !isCamerasError && cameras.length > 0 && (
          <>
            <div className={styles.gridHeadRow}>
              <span className={styles.gridSubtitle}>
                썸네일이 있는 카메라 {camerasWithThumbnail.length}대 ·{' '}
                {isLive ? '약 5초 간격으로 갱신 중' : '5초 간격으로 수집됨'}
              </span>
            </div>

            {floorGroups.map(([floorName, floorCameras]) => (
              <div key={floorName} className={styles.floorGroup}>
                <div className={styles.floorHeadRow}>
                  <span className={styles.floorLabel}>{floorName}</span>
                  <span className={styles.floorCount}>카메라 {floorCameras.length}대</span>
                </div>
                <div className={styles.grid}>
                  {floorCameras.map((camera) => (
                    <CameraCard key={camera.cctvId} camera={camera} onClick={handleSelect} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingCamerasPage;
