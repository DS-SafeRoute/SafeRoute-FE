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
        <div className={styles.metricHeader}>
          <span className={clsx(styles.metricIconBase, styles.metricIcon[metric.iconTone])}>
            {metric.icon}
          </span>
          <span className={clsx(styles.metricTrendBase, styles.metricTrend[metric.trendTone])}>
            {metric.trendIcon}
            {metric.trend}
          </span>
        </div>

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
