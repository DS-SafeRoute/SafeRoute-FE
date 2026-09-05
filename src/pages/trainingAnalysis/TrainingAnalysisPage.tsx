import { Navigate } from 'react-router';

import CameraIcon from '@assets/icons/ic-camera.svg?react';

import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';

import { getTrainingCamerasPath } from '@constants/path';

import { useRunningTrainingSessionsQuery } from './api/useRunningTrainingSessionsQuery';
import * as styles from './TrainingAnalysisPage.css';

// 훈련분석은 시나리오가 시작(RUNNING)돼야만 볼 수 있어서, "볼 수 있는 훈련을 골라 들어가는
// 목록" 자체가 더 이상 의미가 없어짐(사실상 진행 중인 훈련은 0개 아니면 1개인 경우가 대부분).
// 그래서 목록 화면 없이, 진행 중인 훈련을 찾자마자 바로 그 카메라 목록으로 넘어감.
// 여러 건물에서 동시에 훈련이 진행 중이면 그중 가장 최근에 시작된 걸로 감(정렬 기준은
// useRunningTrainingSessionsQuery 참고) — 동시 진행 중인 훈련을 골라 보는 화면이 다시
// 필요해지면 그때 목록 UI를 되살리면 됨
const TrainingAnalysisPage = () => {
  const { sessions, isLoading, isError } = useRunningTrainingSessionsQuery();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon={<CameraIcon width={32} height={32} />}
          title="훈련 정보를 불러오지 못했습니다"
          description="잠시 후 다시 시도해주세요"
        />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon={<CameraIcon width={32} height={32} />}
          title="진행 중인 훈련이 없습니다"
          description="훈련이 시작되면 자동으로 이 화면에서 카메라 영상을 확인할 수 있습니다"
        />
      </div>
    );
  }

  return (
    <Navigate
      to={getTrainingCamerasPath(sessions[0].sessionId)}
      replace
      state={{ scenarioId: sessions[0].scenarioId }}
    />
  );
};

export default TrainingAnalysisPage;
