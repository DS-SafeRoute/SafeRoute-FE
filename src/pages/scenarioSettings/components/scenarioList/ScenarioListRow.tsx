import ScenarioListTooltip from '@pages/scenarioSettings/components/tooltip/ScenarioListTooltip';
import { SCENARIO_STATUS_VIEW } from '@pages/scenarioSettings/types/scenarioList';
import type { ScenarioSummary } from '@pages/scenarioSettings/types/scenarioList';
import { formatScenarioScheduledAt } from '@pages/scenarioSettings/utils/scenarioSettings';

import FileTextIcon from '@assets/icons/ic-filetext.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './ScenarioListRow.css';

interface ScenarioListRowProps {
  scenario: ScenarioSummary;
  buildingName?: string;
  onOpen: (scenario: ScenarioSummary) => void;
  onDelete: (scenario: ScenarioSummary) => void;
}

const DELETE_DISABLED_MESSAGE = '훈련 이력이 있어 삭제할 수 없습니다';

const ScenarioListRow = ({ scenario, buildingName, onOpen, onDelete }: ScenarioListRowProps) => {
  const statusView = SCENARIO_STATUS_VIEW[scenario.status];
  const deleteButton = (
    <Button
      type="button"
      variant={scenario.deletable ? 'dangerOutlined' : 'ghost'}
      size="sm"
      iconOnly
      aria-disabled={scenario.deletable ? undefined : true}
      className={scenario.deletable ? styles.deleteButton : styles.disabledDeleteButton}
      aria-label={`${scenario.name} 삭제`}
      onClick={() => {
        if (!scenario.deletable) return;
        onDelete(scenario);
      }}
    >
      <TrashIcon />
    </Button>
  );

  return (
    <article className={styles.row}>
      <button type="button" className={styles.mainButton} onClick={() => onOpen(scenario)}>
        <span className={styles.titleRow}>
          <strong className={styles.title}>{scenario.name}</strong>
          <StatusBadge label={statusView.label} color={statusView.color} dot />
        </span>
        <span className={styles.detail}>
          {buildingName ?? '건물 정보 없음'} · {formatScenarioScheduledAt(scenario.scheduledAt)} ·
          예상 {scenario.expectedParticipants}명
        </span>
      </button>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="outlined"
          size="sm"
          iconOnly
          disabled={!scenario.reportId}
          className={styles.reportButton}
          aria-label={`${scenario.name} 보고서`}
          onClick={() => {
            if (!scenario.reportId) return;
            // TODO: reportId를 사용해 해당 시나리오의 보고서 페이지로 이동
          }}
        >
          <FileTextIcon />
        </Button>
        {scenario.deletable ? (
          deleteButton
        ) : (
          <ScenarioListTooltip content={DELETE_DISABLED_MESSAGE}>
            {deleteButton}
          </ScenarioListTooltip>
        )}
      </div>
    </article>
  );
};

export default ScenarioListRow;
