import RecommendationCard from '@pages/scenarioSettings/components/cards/recommendationCard/RecommendationCard';
import TrainingPreviewCard from '@pages/scenarioSettings/components/cards/trainingPreviewCard/TrainingPreviewCard';
import { LIVE_STATUS } from '@pages/scenarioSettings/constants/scenarioSettings';
import { sideColumn } from '@pages/scenarioSettings/ScenarioSettingsPage.css';
import type { PreviewMetric } from '@pages/scenarioSettings/types/scenarioSettings';

import PauseIcon from '@assets/icons/ic-pause.svg?react';
import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import { Button } from '@components/Button';

import useElapsedTrainingTime from '@hooks/useElapsedTrainingTime';

import * as styles from './TrainingControlPanel.css';

interface RouteProposal {
  message: string;
  previousRoute: string;
  candidateRoute: string;
}

interface RouteDecision {
  proposal: RouteProposal | null;
  isApplying: boolean;
  isRejecting: boolean;
  onReject: () => void;
  onApply: () => void;
}

interface TrainingControlPanelProps {
  startedAt: number;
  currentRoute: string;
  liveMetrics: PreviewMetric[];
  isEnding: boolean;
  onEnd: () => void;
  routeDecision: RouteDecision;
}

const TrainingControlPanel = ({
  startedAt,
  currentRoute,
  liveMetrics,
  isEnding,
  onEnd,
  routeDecision,
}: TrainingControlPanelProps) => {
  const elapsedTime = useElapsedTrainingTime(startedAt);
  const { proposal, isApplying, isRejecting, onReject, onApply } = routeDecision;
  const isPending = isApplying || isRejecting;

  return (
    <aside className={sideColumn}>
      <Button
        type="button"
        variant="danger"
        size="lg"
        fullWidth
        leftIcon={<PauseIcon />}
        onClick={onEnd}
        isLoading={isEnding}
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
      <p className={styles.durationNotice}>
        훈련은 최대 10분간 진행되며, 종료 후 보고서가 생성됩니다.
      </p>

      <RecommendationCard icon={<SparklesIcon />} title="현재 경로" message={currentRoute} />

      {proposal && (
        <section className={styles.proposalCard}>
          <div className={styles.proposalHeader}>
            <h2 className={styles.proposalTitle}>
              <span className={styles.warningDot} aria-hidden="true" />
              경로 변경 제안
            </h2>
            <span className={styles.aiBadge}>AI 판단</span>
          </div>
          <p className={styles.proposalMessage}>{proposal.message}</p>
          <dl className={styles.routeComparison}>
            <div>
              <dt>기존</dt>
              <dd>{proposal.previousRoute}</dd>
            </div>
            <div>
              <dt>제안</dt>
              <dd>{proposal.candidateRoute}</dd>
            </div>
          </dl>
          <div className={styles.proposalActions}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReject}
              disabled={isPending}
              isLoading={isRejecting}
            >
              거부
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onApply}
              disabled={isPending}
              isLoading={isApplying}
            >
              승인 · 경로 적용
            </Button>
          </div>
        </section>
      )}

      <TrainingPreviewCard title="실시간 도면 상태" status={LIVE_STATUS} metrics={liveMetrics} />

      <div className={styles.lockNotice}>
        🔒 훈련 진행 중에는 도면의 노드·구역 편집이 제한됩니다
      </div>
    </aside>
  );
};

export default TrainingControlPanel;
