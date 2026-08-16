import * as styles from './GradeSummaryCard.css';

import type { ReportDelta, ReportSummary } from '../../types/report';

interface GradeSummaryCardProps {
  summary: ReportSummary;
}

const deltaArrow: Record<ReportDelta['direction'], string> = {
  down: '↓',
  flat: '-',
  up: '↑',
};

const formatDelta = (delta: ReportDelta) => `${delta.value} ${deltaArrow[delta.direction]}`;

const GradeSummaryCard = ({ summary }: GradeSummaryCardProps) => (
  <section className={styles.gradeCard} aria-label="종합 평가 등급">
    <div>
      <p className={styles.eyebrow}>OVERALL GRADE</p>
      <strong className={styles.grade}>{summary.grade}</strong>
      <p className={styles.summary}>
        {summary.scoreText} · {summary.percentileText}
      </p>
    </div>

    <div className={styles.metricRow}>
      <p>
        <span className={styles.metricLabel}>이전 회차 대비</span>
        <strong className={styles.metricValue}>{formatDelta(summary.previousDelta)}</strong>
      </p>
      <p>
        <span className={styles.metricLabel}>전국 평균 대비</span>
        <strong className={styles.metricValue}>{formatDelta(summary.nationalDelta)}</strong>
      </p>
    </div>
  </section>
);

export default GradeSummaryCard;
