import * as pageStyles from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import AlertIcon from '@assets/icons/ic-alert.svg?react';
import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import TextField from '@components/inputField/TextField';

import * as styles from './ScenarioSetupForm.css';
import { SCENARIO_BUILDING_OPTIONS } from '../../constants/scenarioSettings';
import DateTimeField from '../inputField/dateTimeField/DateTimeField';
import ScenarioField from '../inputField/scenarioField/ScenarioField';

import type {
  BasicInfo,
  FireConditionField,
  FireConditionOptions,
} from '../../types/scenarioSettings';

interface ScenarioSetupFormProps {
  basicInfo: BasicInfo;
  conditions: FireConditionField[];
  options: FireConditionOptions;
  isRunning?: boolean;
}

const TRAINING_LOCK_MESSAGE = '🔒 잠금 · 훈련 중 수정 불가';

const ScenarioSetupForm = ({
  basicInfo,
  conditions,
  options,
  isRunning = false,
}: ScenarioSetupFormProps) => (
  <div className={styles.container}>
    <section className={pageStyles.mainSectionCard}>
      <div className={pageStyles.sectionTitleRow}>
        <h2 className={pageStyles.mainSectionTitle}>1. 기본 정보</h2>
        {isRunning && <span className={pageStyles.lockBadge}>{TRAINING_LOCK_MESSAGE}</span>}
      </div>

      <div className={pageStyles.fieldGrid}>
        <TextField
          label="시나리오명"
          defaultValue={basicInfo.scenarioName}
          placeholder="시나리오명을 입력하세요"
          disabled={isRunning}
        />
        <ScenarioField
          label="대상 건물"
          value={basicInfo.targetBuilding}
          options={SCENARIO_BUILDING_OPTIONS}
          disabled={isRunning}
        />
        <DateTimeField
          label="실시 일시"
          defaultValue={basicInfo.scheduledAt}
          disabled={isRunning}
        />
        <TextField
          label="예상 참가 인원"
          type="number"
          defaultValue={basicInfo.expectedParticipants}
          placeholder="예상 참가 인원을 입력하세요"
          leftIcon={<UsersIcon />}
          disabled={isRunning}
        />
      </div>
    </section>

    <section className={pageStyles.mainSectionCard}>
      <div className={pageStyles.sectionTitleRow}>
        <h2 className={pageStyles.mainSectionTitle}>2. 화재 발생 조건</h2>
        {isRunning && <span className={pageStyles.lockBadge}>{TRAINING_LOCK_MESSAGE}</span>}
      </div>

      <div className={pageStyles.fieldGrid}>
        {conditions
          .filter((condition) => !isRunning || ['origin', 'spread'].includes(condition.key))
          .map((condition) => (
            <ScenarioField
              key={condition.key}
              label={condition.label}
              value={condition.value}
              options={options[condition.key]}
              leadingIcon={condition.key === 'origin' ? <AlertIcon /> : undefined}
              disabled={isRunning}
            />
          ))}
      </div>

      <div className={styles.previewPanel}>
        <div className={styles.floorPlan}>
          <div className={styles.room} />
          <div className={`${styles.divider} ${styles.firstDivider}`} />
          <div className={`${styles.divider} ${styles.secondDivider}`} />

          <span className={`${styles.roomLabel} ${styles.roomLabel301}`}>301호</span>
          <span className={`${styles.roomLabel} ${styles.roomLabel302}`}>302호</span>
          <span className={`${styles.roomLabel} ${styles.roomLabel305}`}>305호</span>

          <div className={styles.routeLine} />
          <div className={styles.routeRise} />
          <div className={styles.routeTop} />
          <div className={styles.routeArrow} />
          <div className={styles.fireHalo} />
          <div className={styles.firePin}>
            <AlertIcon />
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default ScenarioSetupForm;
