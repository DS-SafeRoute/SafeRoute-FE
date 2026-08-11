import { sideCardTitle } from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './TrainingPreviewCard.css';

import type { PreviewMetric, PreviewStatus } from '../../../types/scenarioSettings';

interface TrainingPreviewCardProps {
  title?: string;
  status: PreviewStatus;
  metrics: PreviewMetric[];
}

const TrainingPreviewCard = ({
  title = '훈련 미리보기',
  status,
  metrics,
}: TrainingPreviewCardProps) => (
  <section className={styles.card}>
    <div className={styles.header}>
      <h2 className={sideCardTitle}>{title}</h2>
      <StatusBadge label={status.label} color={status.color} dot={status.dot} />
    </div>

    <div className={styles.metricList}>
      {metrics.map((metric) => (
        <div key={metric.id} className={styles.metricRow}>
          <span className={styles.metricLabel}>{metric.label}</span>
          <span className={styles.metricValue}>{metric.value}</span>
        </div>
      ))}
    </div>
  </section>
);

export default TrainingPreviewCard;
