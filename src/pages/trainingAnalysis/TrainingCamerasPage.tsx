import { useMemo } from 'react';

import { Navigate, useNavigate, useParams } from 'react-router';

import EmptyState from '@components/empty';

import { getTrainingCameraFramesPath, ROUTES } from '@constants/path';

import { useSessionCamerasQuery } from './api/useSessionCamerasQuery';
import { useTrainingSessionQuery } from './api/useViewableTrainingSessionsQuery';
import CameraCard from './components/CameraCard/CameraCard';
import LoadingState from './components/LoadingState/LoadingState';
import SessionInfoCard from './components/SessionInfoCard/SessionInfoCard';
import {
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
  const {
    data: cameras = [],
    isLoading: isCamerasLoading,
    isError: isCamerasError,
  } = useSessionCamerasQuery(sessionId);

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
  const cameraWithFrame = cameras.filter((c) => c.thumbnailUrl !== null);

  const handleSelect = (camera: MonitoringCamera) => {
    if (camera.thumbnailUrl === null) return;
    void navigate(getTrainingCameraFramesPath(session.sessionId, camera.cctvId));
  };

  return (
    <div className={styles.container}>
      <SessionInfoCard
        sessionName={session.scenarioName}
        statusLabel={statusView.label}
        statusColor={statusView.color}
        meta={`${session.buildingName} · ${formatSessionStartedAt(session.startedAt)} 시작 · 카메라 ${cameras.length}대`}
        notice="훈련 중에는 열람할 수 없으며, 종료 후 수집된 프레임만 확인할 수 있습니다."
        onBack={() => void navigate(ROUTES.TRAINING_ANALYSIS)}
      />

      <div className={styles.gridSection}>
        {isCamerasLoading && <LoadingState size="md" message="카메라 목록을 불러오는 중..." />}

        {!isCamerasLoading && isCamerasError && (
          <EmptyState
            title="카메라 목록을 불러오지 못했습니다"
            description="잠시 후 다시 시도해주세요"
          />
        )}

        {!isCamerasLoading && !isCamerasError && cameras.length === 0 && (
          <EmptyState title="등록된 카메라가 없습니다" />
        )}

        {!isCamerasLoading && !isCamerasError && cameras.length > 0 && (
          <>
            <div className={styles.gridHeadRow}>
              <span className={styles.gridSubtitle}>
                프레임이 있는 카메라 {cameraWithFrame.length}대 · 5초 간격으로 저장됨
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
