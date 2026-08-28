import type { ReactNode } from 'react';

import { Button } from '@components/Button';

import * as styles from './ScheduledTrainingSection.css';
import { HOME_TRAINING_STATUS } from '../../constants/home';

import type { ScheduledTraining } from '../../types/home';

type ScheduledTrainingSectionProps = {
  training: ScheduledTraining | null;
  onAction: () => void;
  isLoading?: boolean;
  sectionIcon?: ReactNode;
  actionIcon: ReactNode;
};

const ScheduledTrainingSection = ({
  training,
  onAction,
  isLoading = false,
  sectionIcon,
  actionIcon,
}: ScheduledTrainingSectionProps) => {
  const isInProgress = training?.status === HOME_TRAINING_STATUS.IN_PROGRESS;
  const sectionTitle = isInProgress ? '훈련 진행 중' : '예정된 훈련';
  const timeLabel = isInProgress ? '진행 시간' : '일시';
  const timeValue = isInProgress
    ? (training?.elapsedTime ?? '-')
    : `${training?.date ?? '-'} ${training?.time ?? '-'}`;

  return (
    <section className={styles.scheduledCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          {sectionIcon ? <span className={styles.titleIcon}>{sectionIcon}</span> : null}
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
        </div>
      </div>

      <div className={styles.scheduleInfoPanel}>
        {training ? (
          <>
            <p className={styles.subtleLabel}>훈련 시나리오</p>
            <p className={styles.schedulePlace}>{training.name}</p>

            <div className={styles.scheduleMetaGrid}>
              <div className={styles.scheduleMetaItem}>
                <span className={styles.metaLabel}>건물</span>
                <span className={styles.metaValue}>{training.building}</span>
              </div>
              <div className={styles.scheduleMetaItem}>
                <span className={styles.metaLabel}>{timeLabel}</span>
                <span className={styles.metaValue}>{timeValue}</span>
              </div>
              <div className={styles.scheduleMetaItem}>
                <span className={styles.metaLabel}>참가</span>
                <span className={styles.metaValue}>{training.participants}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className={styles.subtleLabel}>훈련 일정</p>
            <p className={styles.schedulePlace}>등록된 훈련이 없습니다</p>
          </>
        )}
      </div>

      <Button
        type="button"
        size="lg"
        fullWidth
        className={styles.scheduleButton}
        leftIcon={actionIcon}
        onClick={onAction}
        disabled={!training}
        isLoading={isLoading}
      >
        {isInProgress ? '모니터링 보기' : training ? '훈련 시작' : '훈련 없음'}
      </Button>
    </section>
  );
};

export default ScheduledTrainingSection;
