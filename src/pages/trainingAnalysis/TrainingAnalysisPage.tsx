import { useNavigate } from 'react-router';

import CameraIcon from '@assets/icons/ic-camera.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';
import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';

import { getTrainingCamerasPath } from '@constants/path';

import { useViewableTrainingSessionsQuery } from './api/useViewableTrainingSessionsQuery';
import {
  TRAINING_SESSION_STATUS_VIEW,
  VIEWABLE_SESSION_STATUSES,
} from './constants/trainingAnalysis';
import * as styles from './TrainingAnalysisPage.css';
import { formatSessionStartedAt } from './utils/trainingAnalysis';

import type { TrainingSessionStatus, TrainingSessionSummary } from './types/trainingAnalysis';

const isViewable = (status: TrainingSessionStatus) =>
  (VIEWABLE_SESSION_STATUSES as readonly TrainingSessionStatus[]).includes(status);

const TrainingAnalysisPage = () => {
  const navigate = useNavigate();
  const { sessions, isLoading, isError } = useViewableTrainingSessionsQuery();

  const handleOpen = (session: TrainingSessionSummary) => {
    if (!isViewable(session.status)) return;
    void navigate(getTrainingCamerasPath(session.sessionId));
  };

  return (
    <div className={styles.container}>
      {isLoading && <LoadingState />}

      {!isLoading && isError && (
        <EmptyState
          icon={<CameraIcon width={32} height={32} />}
          title="훈련 목록을 불러오지 못했습니다"
          description="잠시 후 다시 시도해주세요"
        />
      )}

      {!isLoading && !isError && sessions.length === 0 && (
        <EmptyState
          icon={<CameraIcon width={32} height={32} />}
          title="확인할 수 있는 훈련이 없습니다"
          description="진행 중이거나 종료된 훈련의 CCTV 프레임을 이곳에서 확인할 수 있습니다"
        />
      )}

      {!isLoading && !isError && sessions.length > 0 && (
        <div className={styles.table}>
          <div className={styles.headRow}>
            <span className={styles.headCell}>훈련명</span>
            <span className={styles.headCell}>건물</span>
            <span className={styles.headCell}>상태</span>
            <span className={styles.headCell}>시작 시각</span>
            <span className={styles.headCellAction} />
          </div>

          {sessions.map((session) => {
            const viewable = isViewable(session.status);
            const statusView = TRAINING_SESSION_STATUS_VIEW[session.status];

            return (
              <div key={session.sessionId} className={styles.row}>
                <button
                  type="button"
                  className={styles.rowMain}
                  disabled={!viewable}
                  onClick={() => handleOpen(session)}
                >
                  <span className={styles.name}>{session.scenarioName}</span>
                  <span className={styles.building}>{session.buildingName}</span>
                  <StatusBadge label={statusView.label} color={statusView.color} dot />
                  <span className={styles.startedAt}>
                    {formatSessionStartedAt(session.startedAt)}
                  </span>
                </button>

                <div className={styles.action}>
                  {viewable ? (
                    <Button variant="primary" size="sm" onClick={() => handleOpen(session)}>
                      영상 분석 보기
                    </Button>
                  ) : (
                    <span className={styles.actionHint}>열람 불가</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainingAnalysisPage;
