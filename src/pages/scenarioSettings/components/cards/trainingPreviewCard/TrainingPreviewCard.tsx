import { sideCardTitle } from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './TrainingPreviewCard.css';

import type { PreviewMetric, PreviewStatus } from '../../../types/scenarioSettings';

interface TrainingPreviewCardProps {
  status: PreviewStatus;
  metrics: PreviewMetric[];
}

const TrainingPreviewCard = ({ status, metrics }: TrainingPreviewCardProps) => (
  <section className={styles.card}>
    <div className={styles.header}>
      <h2 className={sideCardTitle}>훈련 미리보기</h2>
      <StatusBadge label={status.label} color={status.color} dot={status.dot} />
    </div>

    {/* TODO: 실제 뷰어로 바꾸기 */}
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
