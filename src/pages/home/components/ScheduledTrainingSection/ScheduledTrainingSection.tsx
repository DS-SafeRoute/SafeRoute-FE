import type { ReactNode } from 'react';

import { Button } from '@components/Button';

import * as styles from './ScheduledTrainingSection.css';
import { HOME_TRAINING_STATUS } from '../../constants/home';

import type { ScheduledTraining } from '../../types/home';

type ScheduledTrainingSectionProps = {
  training: ScheduledTraining;
  onStart: () => void;
  sectionIcon: ReactNode;
  actionIcon: ReactNode;
};

const ScheduledTrainingSection = ({
  training,
  onStart,
  sectionIcon,
  actionIcon,
}: ScheduledTrainingSectionProps) => {
  const isInProgress = training.status === HOME_TRAINING_STATUS.IN_PROGRESS;
  const sectionTitle = isInProgress ? '훈련 진행 중' : '예정된 훈련';

  return (
    <section className={styles.scheduledCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.titleIcon}>{sectionIcon}</span>
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
        </div>
      </div>

      <div className={styles.scheduleInfoPanel}>
        <p className={styles.subtleLabel}>건물 · 위치</p>
        <p className={styles.schedulePlace}>
          {training.building} · {training.floor}
        </p>

        <div className={styles.scheduleMetaGrid}>
          <div className={styles.scheduleMetaItem}>
            <span className={styles.metaLabel}>날짜</span>
            <span className={styles.metaValue}>{training.date}</span>
          </div>
          <div className={styles.scheduleMetaItem}>
            <span className={styles.metaLabel}>시간</span>
            <span className={styles.metaValue}>{training.time}</span>
          </div>
          <div className={styles.scheduleMetaItem}>
            <span className={styles.metaLabel}>참가</span>
            <span className={styles.metaValue}>{training.participants}</span>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        fullWidth
        className={styles.scheduleButton}
        leftIcon={actionIcon}
        onClick={onStart}
        disabled={isInProgress}
      >
        {isInProgress ? '훈련 중' : '훈련 시작'}
      </Button>
    </section>
  );
};

export default ScheduledTrainingSection;
