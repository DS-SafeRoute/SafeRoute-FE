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
import {
  formatSessionStartedClock,
  formatSessionStartedDate,
  groupCamerasByFloor,
} from './utils/trainingAnalysis';

import type { MonitoringCamera, TrainingSessionStatus } from './types/trainingAnalysis';

const isViewable = (status: TrainingSessionStatus) =>
  (VIEWABLE_SESSION_STATUSES as readonly TrainingSessionStatus[]).includes(status);

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

  const floorGroups = useMemo(() => groupCamerasByFloor(cameras), [cameras]);

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

  const handleSelect = (camera: MonitoringCamera) => {
    void navigate(getTrainingCameraFramesPath(session.sessionId, camera.cctvId));
  };

  return (
    <div className={styles.container}>
      <SessionInfoCard
        sessionName={session.scenarioName}
        statusLabel={statusView.label}
        statusColor={statusView.color}
        meta={session.buildingName}
        notice={
          isLive
            ? '실시간 모니터링 중 · 카메라별 최신 프레임이 5초 간격으로 자동 갱신됩니다.'
            : '훈련 중 5초 간격으로 수집된 프레임 기록입니다.'
        }
        live={isLive}
        stats={[
          { label: '날짜', value: formatSessionStartedDate(session.startedAt) },
          { label: '시작 시간', value: formatSessionStartedClock(session.startedAt) },
          { label: '카메라', value: `${cameras.length}대` },
        ]}
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
