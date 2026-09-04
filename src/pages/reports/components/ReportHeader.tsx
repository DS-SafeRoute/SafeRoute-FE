import * as styles from '../ReportsPage.css';

import type { ReportMetaItem } from '../types/report';

interface ReportHeaderProps {
  meta: ReportMetaItem[];
}

// 훈련 분석 보고서 헤더 (훈련 메타 정보)
const ReportHeader = ({ meta }: ReportHeaderProps) => (
  <section className={styles.reportHeader} aria-labelledby="report-document-title">
    <div className={styles.reportTitleGroup}>
      <p className={styles.reportEyebrow}>SAFE ROUTE</p>
      <h2 id="report-document-title" className={styles.reportTitle}>
        훈련 분석 보고서
      </h2>
    </div>

    <dl className={styles.reportMetaGrid}>
      {meta.map((item) => (
        <div key={item.label} className={styles.reportMetaItem}>
          <dt className={styles.reportMetaLabel}>{item.label}</dt>
          <dd className={styles.reportMetaValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export default ReportHeader;
