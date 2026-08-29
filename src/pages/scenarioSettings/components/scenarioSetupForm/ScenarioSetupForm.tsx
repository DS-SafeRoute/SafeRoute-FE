import * as pageStyles from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import type {
  EvacuationRouteResponse,
  FloorGraphResponse,
} from '@apis/__generated__/data-contracts';

import AlertIcon from '@assets/icons/ic-alert.svg?react';
import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import TextField from '@components/inputField/TextField';

import * as styles from './ScenarioSetupForm.css';
import DateTimeField from '../inputField/dateTimeField/DateTimeField';
import ScenarioField from '../inputField/scenarioField/ScenarioField';
import TrainingFloorPlan from '../trainingFloorPlan/TrainingFloorPlan';

import type {
  BasicInfo,
  FireConditionField,
  FireConditionOptions,
} from '../../types/scenarioSettings';
import type { ScenarioFieldOption } from '../inputField/scenarioField/ScenarioField';

interface ScenarioSetupFormProps {
  basicInfo: BasicInfo;
  conditions: readonly FireConditionField[];
  options: FireConditionOptions;
  isRunning?: boolean;
  readOnly?: boolean;
  buildingOptions: readonly ScenarioFieldOption[];
  buildingReadOnly: boolean;
  floorGraph?: FloorGraphResponse;
  evacuationRoute?: EvacuationRouteResponse;
  isFloorPlanLoading?: boolean;
  floorPlanMessage?: string;
  onBasicInfoChange: (key: keyof BasicInfo, value: string) => void;
  onFireSpreadChange: (value: string) => void;
}

const TRAINING_LOCK_MESSAGE = '🔒 잠금 · 훈련 중 수정 불가';

const ScenarioSetupForm = ({
  basicInfo,
  conditions,
  options,
  isRunning = false,
  readOnly = false,
  buildingOptions,
  buildingReadOnly,
  floorGraph,
  evacuationRoute,
  isFloorPlanLoading = false,
  floorPlanMessage,
  onBasicInfoChange,
  onFireSpreadChange,
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
          value={basicInfo.scenarioName}
          placeholder="시나리오명을 입력하세요"
          readOnly={readOnly}
          disabled={isRunning}
          onChange={(event) => onBasicInfoChange('scenarioName', event.target.value)}
        />
        <ScenarioField
          label="대상 건물"
          value={basicInfo.targetBuilding}
          options={buildingOptions}
          disabled={isRunning}
          readOnly={readOnly || buildingReadOnly}
          onChange={(value) => onBasicInfoChange('targetBuilding', value)}
        />
        <DateTimeField
          label="실시 일시"
          value={basicInfo.scheduledAt}
          disabled={isRunning}
          readOnly={readOnly}
          onChange={(value) => onBasicInfoChange('scheduledAt', value)}
        />
        <TextField
          label="예상 참가 인원"
          type="number"
          value={basicInfo.expectedParticipants}
          placeholder="예상 참가 인원을 입력하세요"
          leftIcon={<UsersIcon />}
          readOnly={readOnly}
          disabled={isRunning}
          onChange={(event) => onBasicInfoChange('expectedParticipants', event.target.value)}
        />
      </div>
    </section>

    <section className={pageStyles.mainSectionCard}>
      <div className={pageStyles.sectionTitleRow}>
        <h2 className={pageStyles.mainSectionTitle}>2. 화재 발생 조건</h2>
        {isRunning && <span className={pageStyles.lockBadge}>{TRAINING_LOCK_MESSAGE}</span>}
      </div>

      <div className={pageStyles.fieldGrid}>
        {conditions.map((condition) => (
          <ScenarioField
            key={condition.key}
            label={condition.label}
            value={condition.value}
            options={options[condition.key]}
            leadingIcon={condition.key === 'origin' ? <AlertIcon /> : undefined}
            disabled={isRunning}
            readOnly={readOnly || condition.key !== 'spread'}
            onChange={condition.key === 'spread' ? onFireSpreadChange : undefined}
          />
        ))}
      </div>

      <div className={styles.previewPanel}>
        {isRunning ? (
          <TrainingFloorPlan
            graph={floorGraph}
            route={evacuationRoute}
            isLoading={isFloorPlanLoading}
            emptyMessage={floorPlanMessage}
          />
        ) : (
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
        )}
      </div>
    </section>
  </div>
);

export default ScenarioSetupForm;
