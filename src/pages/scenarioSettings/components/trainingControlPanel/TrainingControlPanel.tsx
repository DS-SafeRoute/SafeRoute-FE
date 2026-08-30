import { sideColumn } from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import PauseIcon from '@assets/icons/ic-pause.svg?react';
import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import { Button } from '@components/Button';

import useElapsedTrainingTime from '@hooks/useElapsedTrainingTime';

import * as styles from './TrainingControlPanel.css';
import { LIVE_STATUS } from '../../constants/scenarioSettings';
import RecommendationCard from '../cards/recommendationCard/RecommendationCard';
import TrainingPreviewCard from '../cards/trainingPreviewCard/TrainingPreviewCard';

import type { PreviewMetric } from '../../types/scenarioSettings';

interface RouteProposal {
  message: string;
  previousRoute: string;
  candidateRoute: string;
}

interface RouteDecision {
  proposal: RouteProposal | null;
  isPending: boolean;
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
  const { proposal, isPending, onReject, onApply } = routeDecision;

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
            <Button type="button" variant="ghost" size="sm" onClick={onReject} disabled={isPending}>
              거부
            </Button>
            <Button type="button" size="sm" onClick={onApply} isLoading={isPending}>
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
