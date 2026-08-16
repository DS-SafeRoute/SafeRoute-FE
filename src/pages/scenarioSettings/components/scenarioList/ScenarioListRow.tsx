import TrashIcon from '@assets/icons/ic-trash.svg?react';

import { Button } from '@components/Button';
import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './ScenarioListRow.css';
import { SCENARIO_STATUS_VIEW } from '../../types/scenarioList';
import ScenarioListTooltip from '../tooltip/ScenarioListTooltip';

import type { ScenarioSummary } from '../../types/scenarioList';

interface ScenarioListRowProps {
  scenario: ScenarioSummary;
  onOpen: (scenario: ScenarioSummary) => void;
  onDelete: (scenario: ScenarioSummary) => void;
}

const DELETE_DISABLED_MESSAGE = '훈련 이력이 있어 삭제할 수 없습니다';

const ScenarioListRow = ({ scenario, onOpen, onDelete }: ScenarioListRowProps) => {
  const statusView = SCENARIO_STATUS_VIEW[scenario.status];
  const deleteButton = (
    <Button
      type="button"
      variant={scenario.deletable ? 'dangerOutlined' : 'ghost'}
      size="sm"
      iconOnly
      disabled={!scenario.deletable}
      className={scenario.deletable ? styles.deleteButton : undefined}
      aria-label={`${scenario.name} 삭제`}
      onClick={() => onDelete(scenario)}
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
          {scenario.location} · {scenario.scheduledAt} · {scenario.expectedParticipants}명
        </span>
      </button>

      <div className={styles.actions}>
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
