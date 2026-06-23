import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './AiReportCard.css';

import type { ReportNarrative } from '../../types/report';

interface AiReportCardProps {
  narrative: ReportNarrative;
}

const AiReportCard = ({ narrative }: AiReportCardProps) => (
  <section className={styles.card}>
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <SparklesIcon className={styles.iconBox} aria-hidden="true" focusable="false" />
        <h2 className={styles.title}>AI 자동 평가 보고서</h2>
      </div>
      <StatusBadge label="Claude · 자동 생성" color="blue" />
    </div>

    <div className={styles.body}>
      <p>
        {narrative.headlinePrefix} <span className={styles.successText}>{narrative.grade}</span>
        {narrative.headlineSuffix}
      </p>
      <p>
        <span className={styles.paragraphLabel}>강점: </span>
        {narrative.strength}
      </p>
      <p>
        <span className={styles.paragraphLabel}>개선: </span>
        {narrative.improvementPrefix}{' '}
        <span className={styles.warningText}>{narrative.improvementScore}</span>
        {narrative.improvementSuffix}
      </p>
    </div>
  </section>
);

export default AiReportCard;
