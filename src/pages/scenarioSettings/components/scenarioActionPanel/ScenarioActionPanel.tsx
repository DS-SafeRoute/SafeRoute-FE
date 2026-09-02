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
  onCreate: () => void;
  onSave: () => void;
  onStart: () => void;
  onEdit: () => void;
}

interface ScenarioActionPanelProps {
  mode: ScenarioActionMode;
  isLoading: boolean;
  startState: ScenarioStartState;
  handlers: ScenarioActionHandlers;
}

// 훈련 전 시나리오 상태에 맞는 생성·저장·시작 액션 표시
const ScenarioActionPanel = ({
  mode,
  isLoading,
  startState,
  handlers,
}: ScenarioActionPanelProps) => {
  if (mode === 'create') {
    return (
      <aside className={sideColumn}>
        <Button type="button" size="lg" fullWidth isLoading={isLoading} onClick={handlers.onCreate}>
          작성 완료
        </Button>
      </aside>
    );
  }

  if (mode === 'edit') {
    return (
      <aside className={sideColumn}>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          fullWidth
          className={draftButton}
          isLoading={isLoading}
          onClick={handlers.onSave}
        >
          임시 저장
        </Button>
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
        isLoading={isLoading}
        onClick={handlers.onStart}
      >
        시나리오 시작
      </Button>

      {startState.restrictionMessage ? (
        <p className={startRestrictionNotice}>{startState.restrictionMessage}</p>
      ) : null}

      {startState.showPreview ? (
        <TrainingPreviewCard status={PREVIEW_STATUS} metrics={startState.metrics} />
      ) : null}

      {startState.canEdit ? (
        <Button type="button" variant="ghost" size="md" fullWidth onClick={handlers.onEdit}>
          수정하기
        </Button>
      ) : null}
    </aside>
  );
};

export default ScenarioActionPanel;
