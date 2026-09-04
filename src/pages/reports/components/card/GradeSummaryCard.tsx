import * as styles from './GradeSummaryCard.css';

import type { ReportSummary } from '../../types/report';

interface GradeSummaryCardProps {
  summary: ReportSummary;
}

const GradeSummaryCard = ({ summary }: GradeSummaryCardProps) => (
  <section className={styles.gradeCard} aria-label="종합 평가 등급">
    <strong className={styles.grade}>{summary.grade}</strong>
    <p className={styles.summary}>{summary.scoreText}</p>
  </section>
);

export default GradeSummaryCard;
