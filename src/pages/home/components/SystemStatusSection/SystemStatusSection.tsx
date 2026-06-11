import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './SystemStatusSection.css';

import type { SystemStatusItem } from '../../types/home';

type SystemStatusSectionProps = {
  items: SystemStatusItem[];
};

const SystemStatusSection = ({ items }: SystemStatusSectionProps) => {
  const [summary, ...details] = items;

  return (
    <section className={styles.systemCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>시스템 상태</h2>
        </div>

        {summary ? (
          <StatusBadge label={summary.label} color={summary.tone} dot={summary.dot} />
        ) : null}
      </div>

      <div className={styles.systemList}>
        {details.map((item) => (
          <div key={item.id} className={styles.systemRow}>
            <span className={styles.systemLabel}>{item.label}</span>
            <span className={`${styles.systemValue} ${styles.systemValueTone[item.tone]}`}>
              {item.icon}
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SystemStatusSection;
