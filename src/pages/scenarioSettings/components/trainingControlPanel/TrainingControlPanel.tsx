import { sideColumn } from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import PlayIcon from '@assets/icons/ic-play.svg?react';
import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import { Button } from '@components/Button';

import * as styles from './TrainingControlPanel.css';
import useElapsedTrainingTime from '../../hooks/useElapsedTrainingTime';
import RecommendationCard from '../cards/recommendationCard/RecommendationCard';
import TrainingPreviewCard from '../cards/trainingPreviewCard/TrainingPreviewCard';

import type { PreviewMetric, PreviewStatus } from '../../types/scenarioSettings';

interface TrainingControlPanelProps {
  startedAt: number;
  currentRoute: string;
  routeProposal: string | null;
  liveStatus: PreviewStatus;
  liveMetrics: PreviewMetric[];
  onEnd: () => void;
  onRejectRouteProposal: () => void;
  onApplyRouteProposal: () => void;
}

const TrainingControlPanel = ({
  startedAt,
  currentRoute,
  routeProposal,
  liveStatus,
  liveMetrics,
  onEnd,
  onRejectRouteProposal,
  onApplyRouteProposal,
}: TrainingControlPanelProps) => {
  const elapsedTime = useElapsedTrainingTime(startedAt);

  return (
    <aside className={sideColumn}>
      <Button
        type="button"
        variant="danger"
        size="lg"
        fullWidth
        leftIcon={<PlayIcon />}
        onClick={onEnd}
      >
        종료
      </Button>

      <div className={styles.elapsedTimer}>
        <span className={styles.timerLabel}>
          <span className={styles.dangerDot} aria-hidden="true" />
          훈련 진행 시간
        </span>
        <strong className={styles.timerValue}>{elapsedTime}</strong>
      </div>

      <RecommendationCard icon={<SparklesIcon />} title="현재 경로" message={currentRoute} />

      {routeProposal && (
        <section className={styles.proposalCard}>
          <div className={styles.proposalHeader}>
            <h2 className={styles.proposalTitle}>
              <span className={styles.warningDot} aria-hidden="true" />
              경로 변경 제안
            </h2>
            <span className={styles.aiBadge}>AI 판단</span>
          </div>
          <p className={styles.proposalMessage}>{routeProposal}</p>
          <div className={styles.proposalActions}>
            <Button type="button" variant="ghost" size="sm" onClick={onRejectRouteProposal}>
              거부
            </Button>
            <Button type="button" size="sm" onClick={onApplyRouteProposal}>
              승인 · 경로 적용
            </Button>
          </div>
        </section>
      )}

      <TrainingPreviewCard title="실시간 도면 상태" status={liveStatus} metrics={liveMetrics} />

      <div className={styles.lockNotice}>
        🔒 훈련 진행 중에는 도면의 노드·구역 편집이 제한됩니다
      </div>
    </aside>
  );
};

export default TrainingControlPanel;
