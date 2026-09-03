import FireLocationGrid from '@pages/scenarioSettings/components/fireLocationGrid/FireLocationGrid';
import DateTimeField from '@pages/scenarioSettings/components/inputField/dateTimeField/DateTimeField';
import ScenarioField from '@pages/scenarioSettings/components/inputField/scenarioField/ScenarioField';
import type { ScenarioFieldOption } from '@pages/scenarioSettings/components/inputField/scenarioField/ScenarioField';
import { FIRE_SPREAD_OPTIONS } from '@pages/scenarioSettings/constants/scenarioSettings';
import type { ScenarioFloorMapView } from '@pages/scenarioSettings/hooks/useScenarioFloorView';
import * as pageStyles from '@pages/scenarioSettings/ScenarioSettingsPage.css';
import type { BasicInfo } from '@pages/scenarioSettings/types/scenarioSettings';

import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';

import * as styles from './ScenarioSetupForm.css';

interface ScenarioSetupValue {
  basicInfo: BasicInfo;
  fireSpreadLabel: string;
}

interface ScenarioSetupMode {
  isRunning: boolean;
  readOnly: boolean;
  buildingReadOnly: boolean;
}

interface ScenarioSetupHandlers {
  onBasicInfoChange: (key: keyof BasicInfo, value: string) => void;
  onFireSpreadChange: (value: string) => void;
}

interface EvacuationSetupControl {
  floorOptions: readonly ScenarioFieldOption[];
  selectedFloorId: string;
  persistedStartNodeId?: string | null;
  editable: boolean;
  configured: boolean;
  canSave: boolean;
  isSaving: boolean;
  onFloorChange: (floorId: string) => void;
  onFireCellSelect: (cellId: string) => void;
  onStartNodeSelect: (nodeId: string) => void;
  onSave: () => void;
}

interface ScenarioSetupFormProps {
  value: ScenarioSetupValue;
  buildingOptions: readonly ScenarioFieldOption[];
  floorMap: ScenarioFloorMapView;
  mode: ScenarioSetupMode;
  handlers: ScenarioSetupHandlers;
  evacuationSetup: EvacuationSetupControl;
}

const TRAINING_LOCK_MESSAGE = '🔒 잠금 · 훈련 중 수정 불가';

const ScenarioSetupForm = ({
  value,
  buildingOptions,
  floorMap,
  mode,
  handlers,
  evacuationSetup,
}: ScenarioSetupFormProps) => {
  const { basicInfo, fireSpreadLabel } = value;
  const { isRunning, readOnly, buildingReadOnly } = mode;
  const { onBasicInfoChange, onFireSpreadChange } = handlers;

  return (
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

        <div className={styles.fireConditionField}>
          <ScenarioField
            label="확산 속도"
            value={fireSpreadLabel}
            options={FIRE_SPREAD_OPTIONS}
            disabled={isRunning}
            readOnly={readOnly}
            onChange={onFireSpreadChange}
          />
        </div>

        <h3 className={styles.fireLocationLabel}>발화 위치 및 시작 지점</h3>
        <div className={styles.mapToolbar}>
          <ScenarioField
            label="도면 층"
            value={evacuationSetup.selectedFloorId}
            options={evacuationSetup.floorOptions}
            disabled={isRunning || evacuationSetup.configured}
            readOnly={!evacuationSetup.editable}
            onChange={evacuationSetup.onFloorChange}
          />
          <div className={styles.mapGuide}>
            <span>
              <strong>1.</strong> 보행 가능한 격자에서 발화 위치 선택
            </span>
            <span>
              <strong>2.</strong> 분홍색 START 후보에서 시작 지점 선택
            </span>
          </div>
        </div>
        <FireLocationGrid
          imageUrl={floorMap.imageUrl}
          graph={floorMap.graph}
          gridCells={floorMap.gridCells}
          routeNodeIds={floorMap.routeNodeIds}
          fireCellIds={floorMap.fireCellIds}
          originCellId={floorMap.originCellId}
          selectedFireCellId={floorMap.selectedFireCellId}
          selectedStartNodeId={floorMap.selectedStartNodeId}
          persistedStartNodeId={evacuationSetup.persistedStartNodeId}
          statusMessage={floorMap.statusMessage}
          disabled={!evacuationSetup.editable || evacuationSetup.configured || isRunning}
          onFireCellSelect={evacuationSetup.onFireCellSelect}
          onStartNodeSelect={evacuationSetup.onStartNodeSelect}
        />

        {evacuationSetup.configured && (
          <p className={styles.setupNotice}>
            설정이 저장되었습니다. 변경하려면 새 시나리오를 만들어 주세요.
          </p>
        )}
        {!evacuationSetup.configured && !evacuationSetup.editable && (
          <p className={styles.setupNotice}>
            시나리오 작성을 완료해 READY 상태로 전환한 뒤 설정할 수 있습니다.
          </p>
        )}
        {evacuationSetup.editable && !evacuationSetup.configured && (
          <Button
            type="button"
            className={styles.setupButton}
            disabled={!evacuationSetup.canSave}
            isLoading={evacuationSetup.isSaving}
            onClick={evacuationSetup.onSave}
          >
            발화 위치 · 시작 지점 저장
          </Button>
        )}
      </section>
    </div>
  );
};

export default ScenarioSetupForm;
