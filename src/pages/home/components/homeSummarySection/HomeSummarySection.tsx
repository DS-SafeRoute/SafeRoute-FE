import clsx from 'clsx';

import * as styles from './HomeSummarySection.css';

import type { HomeMetric } from '../../types/home';

type HomeSummarySectionProps = {
  metrics: HomeMetric[];
};

const HomeSummarySection = ({ metrics }: HomeSummarySectionProps) => (
  <section className={styles.summaryGrid} aria-label="홈 요약 지표">
    {metrics.map((metric) => (
      <article key={metric.id} className={styles.metricCard}>
        <span className={clsx(styles.metricIconBase, styles.metricIcon[metric.iconTone])}>
          {metric.icon}
        </span>

        <div className={styles.metricValueRow}>
          <strong className={styles.metricValue}>{metric.value}</strong>
          {metric.valueSuffix ? (
            <span className={styles.metricSuffix}>{metric.valueSuffix}</span>
          ) : null}
        </div>
        <p className={styles.metricTitle}>{metric.title}</p>
      </article>
    ))}
  </section>
);

export default HomeSummarySection;
