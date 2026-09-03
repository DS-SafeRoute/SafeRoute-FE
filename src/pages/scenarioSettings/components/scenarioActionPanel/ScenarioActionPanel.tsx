import TrainingPreviewCard from '@pages/scenarioSettings/components/cards/trainingPreviewCard/TrainingPreviewCard';
import { PREVIEW_STATUS } from '@pages/scenarioSettings/constants/scenarioSettings';
import {
  draftButton,
  sideColumn,
  startRestrictionNotice,
} from '@pages/scenarioSettings/ScenarioSettingsPage.css';
import type { PreviewMetric } from '@pages/scenarioSettings/types/scenarioSettings';

import PlayIcon from '@assets/icons/ic-play.svg?react';

import { Button } from '@components/Button';

export type ScenarioActionMode = 'create' | 'edit' | 'start';

interface ScenarioStartState {
  disabled: boolean;
  restrictionMessage?: string;
  showPreview: boolean;
  canEdit: boolean;
  metrics: PreviewMetric[];
}

interface ScenarioActionHandlers {
  onSaveDraft: () => void;
  onComplete: () => void;
  onStart: () => void;
  onEdit: () => void;
}

interface ScenarioActionPanelProps {
  mode: ScenarioActionMode;
  isSavingDraft: boolean;
  isCompleting: boolean;
  showDraftSave: boolean;
  completeLabel: string;
  startState: ScenarioStartState;
  handlers: ScenarioActionHandlers;
}

// 훈련 전 시나리오 상태에 맞는 생성·저장·시작 액션 표시
const ScenarioActionPanel = ({
  mode,
  isSavingDraft,
  isCompleting,
  showDraftSave,
  completeLabel,
  startState,
  handlers,
}: ScenarioActionPanelProps) => {
  if (mode === 'create' || mode === 'edit') {
    return (
      <aside className={sideColumn}>
        <Button
          type="button"
          size="lg"
          fullWidth
          isLoading={isCompleting}
          onClick={handlers.onComplete}
        >
          {completeLabel}
        </Button>
        {showDraftSave && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            fullWidth
            className={draftButton}
            isLoading={isSavingDraft}
            onClick={handlers.onSaveDraft}
          >
            {mode === 'create' ? '임시 저장' : '변경사항 임시 저장'}
          </Button>
        )}
      </aside>
    );
  }

  return (
    <aside className={sideColumn}>
      <Button
        type="button"
        size="lg"
        fullWidth
        leftIcon={<PlayIcon />}
        disabled={startState.disabled}
        isLoading={isCompleting}
        onClick={handlers.onStart}
      >
        시나리오 시작
      </Button>

      {startState.restrictionMessage && (
        <p className={startRestrictionNotice}>{startState.restrictionMessage}</p>
      )}

      {startState.showPreview && (
        <TrainingPreviewCard status={PREVIEW_STATUS} metrics={startState.metrics} />
      )}

      {startState.canEdit && (
        <Button type="button" variant="ghost" size="md" fullWidth onClick={handlers.onEdit}>
          수정하기
        </Button>
      )}
    </aside>
  );
};

export default ScenarioActionPanel;
