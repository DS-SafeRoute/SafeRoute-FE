import type { ReactNode } from 'react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './RecentTrainingSection.css';
import { HOME_GRADE_BADGE_COLOR, HOME_RECENT_TRAINING_TABLE_HEADERS } from '../../constants/home';

import type { TrainingRecord } from '../../types/home';

type RecentTrainingSectionProps = {
  records: TrainingRecord[];
  actionIcon: ReactNode;
};

const RecentTrainingSection = ({ records, actionIcon }: RecentTrainingSectionProps) => (
  <section className={styles.recordsSection}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>최근 훈련 기록</h2>

      <Button
        type="button"
        variant="outlined"
        size="sm"
        rightIcon={actionIcon}
        className={styles.headerActionButton}
      >
        전체 보기
      </Button>
    </div>

    <table className={styles.recordsTable}>
      <thead>
        <tr>
          {HOME_RECENT_TRAINING_TABLE_HEADERS.map((header) => (
            <th key={header} className={styles.tableHeadCell}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td className={styles.tableCell({ tone: 'emphasis' })}>{record.name}</td>
            <td className={styles.tableCell({ tone: 'date' })}>{record.date}</td>
            <td className={styles.tableCell()}>{record.participants}</td>
            <td className={styles.tableCell({ tone: 'emphasis' })}>{record.evacuationTime}</td>
            <td className={styles.tableCell()}>{record.survivalRate}</td>
            <td className={styles.tableCell()}>
              <StatusBadge
                label={record.grade}
                color={HOME_GRADE_BADGE_COLOR[record.grade] ?? 'neutral'}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export default RecentTrainingSection;
