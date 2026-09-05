import { useMemo } from 'react';

import { Navigate, useLocation, useNavigate, useParams } from 'react-router';

import { extractApiError } from '@apis/errors/apiError';
import {
  MAX_TRAINING_DURATION_MS,
  TRAINING_SESSION_STATUS,
} from '@apis/trainingSessions/trainingSessionConstants';

import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';

import { getScenarioDetailPath, getTrainingCameraFramesPath, ROUTES } from '@constants/path';

import useElapsedTrainingTime from '@hooks/useElapsedTrainingTime';

import { formatDuration } from '@utils/format';

import { useSessionCamerasQuery } from './api/useSessionCamerasQuery';
import { useTrainingSessionQuery } from './api/useSessionContextQuery';
import { useSessionCurrentStatesQuery } from './api/useSessionCurrentStatesQuery';
import { useTrainingMonitoringSocket } from './api/useTrainingMonitoringSocket';
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
  getScenarioIdFromNavigationState,
  groupCamerasByFloor,
} from './utils/trainingAnalysis';

import type { MonitoringCamera, TrainingSessionStatus } from './types/trainingAnalysis';

const isViewable = (status: TrainingSessionStatus) =>
  (VIEWABLE_SESSION_STATUSES as readonly TrainingSessionStatus[]).includes(status);

const TrainingCamerasPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { state: navigationState } = useLocation();
  const navigate = useNavigate();
  const scenarioId = getScenarioIdFromNavigationState(navigationState);

  const {
    session,
    isLoading: isSessionLoading,
    isError: isSessionError,
    error: sessionError,
  } = useTrainingSessionQuery(sessionId);
  const isLive = isLiveSessionStatus(session?.status);
  const {
    data: cameras = [],
    isLoading: isCamerasLoading,
    isError: isCamerasError,
    error: camerasError,
  } = useSessionCamerasQuery(sessionId, { live: isLive });
  const { data: currentStates = [] } = useSessionCurrentStatesQuery(sessionId, { live: isLive });
  const currentStateByCode = useMemo(
    () => new Map(currentStates.map((state) => [state.cctvCode, state])),
    [currentStates],
  );

  // 진행 중일 때만 1초 단위로 이어서 증가시키고, 종료됐으면 서버가 마지막으로 준 값을 그대로 표시
  const tickingElapsed = useElapsedTrainingTime(isLive ? (session?.startedAt ?? null) : null);
  const isAwaitingServerEnd =
    isLive &&
    session?.startedAt !== null &&
    session?.startedAt !== undefined &&
    Date.now() >= session.startedAt + MAX_TRAINING_DURATION_MS;
  const elapsedDisplay = isLive ? tickingElapsed : formatDuration(session?.elapsedSeconds ?? 0);

  const cameraRefs = useMemo(
    () => cameras.map((c) => ({ cctvId: c.cctvId, code: c.code })),
    [cameras],
  );
  useTrainingMonitoringSocket(sessionId, cameraRefs);

  const floorGroups = useMemo(() => groupCamerasByFloor(cameras), [cameras]);

  if (session?.status === TRAINING_SESSION_STATUS.FAILED && scenarioId) {
    return (
      <Navigate
        to={getScenarioDetailPath(scenarioId)}
        replace
        state={{ timedOutSessionId: session.sessionId }}
      />
    );
  }

  if (!isSessionLoading && !isSessionError && (!session || !isViewable(session.status))) {
    return <Navigate to={ROUTES.TRAINING_ANALYSIS} replace />;
  }

  if (isSessionError) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="훈련 정보를 불러오지 못했습니다"
          description={extractApiError(sessionError).message || '잠시 후 다시 시도해주세요'}
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
    void navigate(getTrainingCameraFramesPath(session.sessionId, camera.cctvId), {
      state: { scenarioId },
    });
  };

  return (
    <div className={styles.container}>
      <SessionInfoCard
        sessionName={session.scenarioName}
        statusLabel={statusView.label}
        statusColor={statusView.color}
        meta={session.buildingName}
        notice={
          isAwaitingServerEnd
            ? '10분이 경과했습니다. 서버에서 훈련 종료 상태를 확인하고 있습니다.'
            : isLive
              ? `실시간 모니터링 중 · 카메라별 최신 프레임이 ${session.snapshotIntervalSec}초 간격으로 자동 갱신됩니다.`
              : `훈련 중 ${session.snapshotIntervalSec}초 간격으로 수집된 프레임 기록입니다.`
        }
        live={isLive}
        stats={[
          { label: '날짜', value: formatSessionStartedDate(session.startedAt) },
          { label: '시작 시간', value: formatSessionStartedClock(session.startedAt) },
          { label: '진행 시간', value: elapsedDisplay },
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
                    <CameraCard
                      key={camera.cctvId}
                      camera={camera}
                      currentState={currentStateByCode.get(camera.code)}
                      onClick={handleSelect}
                    />
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
