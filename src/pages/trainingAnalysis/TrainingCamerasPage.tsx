import { useMemo } from 'react';

import { Navigate, useNavigate, useParams } from 'react-router';

import EmptyState from '@components/empty';

import { getTrainingCameraFramesPath, ROUTES } from '@constants/path';

import CameraCard from './components/CameraCard/CameraCard';
import SessionInfoCard from './components/SessionInfoCard/SessionInfoCard';
import {
  TRAINING_SESSION_STATUS_VIEW,
  VIEWABLE_SESSION_STATUSES,
} from './constants/trainingAnalysis';
import { mockCameras, mockSessions } from './mocks/trainingAnalysisData';
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

  // TODO(API 연동): mockSessions.find → 세션 상세 조회로 교체, mockCameras → getSessionCameras(sessionId)
  const session = mockSessions.find((s) => s.sessionId === sessionId);
  const cameras = mockCameras;
  const floorGroups = useMemo(() => groupByFloor(cameras), [cameras]);

  if (!session || !isViewable(session.status)) {
    return <Navigate to={ROUTES.TRAINING_ANALYSIS} replace />;
  }

  const statusView = TRAINING_SESSION_STATUS_VIEW[session.status];
  const cameraWithFrame = cameras.filter((c) => c.thumbnailUrl !== null);

  const handleSelect = (camera: MonitoringCamera) => {
    if (!session || camera.thumbnailUrl === null) return;
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
        {cameras.length > 0 && (
          <div className={styles.gridHeadRow}>
            <span className={styles.gridSubtitle}>
              프레임이 있는 카메라 {cameraWithFrame.length}대 · 5초 간격으로 저장됨
            </span>
          </div>
        )}

        {cameras.length === 0 ? (
          <EmptyState title="등록된 카메라가 없습니다" />
        ) : (
          floorGroups.map(([floorName, floorCameras]) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default TrainingCamerasPage;
