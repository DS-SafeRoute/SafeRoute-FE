import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import * as styles from './AiReportCard.css';

interface AiReportCardProps {
  summaryText?: string;
}

const AiReportCard = ({ summaryText }: AiReportCardProps) => (
  <section className={styles.card}>
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <SparklesIcon className={styles.iconBox} aria-hidden="true" focusable="false" />
        <h2 className={styles.title}>자동 평가 보고서</h2>
      </div>
    </div>

    <p className={styles.body}>{summaryText || '자동 평가 내용이 없습니다.'}</p>
  </section>
);

export default AiReportCard;
