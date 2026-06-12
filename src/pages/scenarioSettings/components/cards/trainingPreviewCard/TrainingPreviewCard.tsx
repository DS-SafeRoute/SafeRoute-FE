import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './TrainingPreviewCard.css';

import type { PreviewMetric } from '../../../types/scenarioSettings';

interface TrainingPreviewCardProps {
  metrics: PreviewMetric[];
}

const TrainingPreviewCard = ({ metrics }: TrainingPreviewCardProps) => (
  <section className={styles.card}>
    <div className={styles.header}>
      <h2 className={styles.title}>훈련 미리보기</h2>
      <StatusBadge label="준비 완료" color="green" dot />
    </div>

    <div className={styles.previewBox}>3D Digital Twin Preview</div>

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
