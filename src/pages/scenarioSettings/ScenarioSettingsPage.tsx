import { useState } from 'react';

import { Navigate, useNavigate, useParams } from 'react-router';

import PlayIcon from '@assets/icons/ic-play.svg?react';
import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import { Button } from '@components/Button';
import useToast from '@components/toast/useToast';

import { ROUTES } from '@constants/path';

import RecommendationCard from './components/cards/recommendationCard/RecommendationCard';
import TrainingPreviewCard from './components/cards/trainingPreviewCard/TrainingPreviewCard';
import ScenarioSetupForm from './components/scenarioSetupForm/ScenarioSetupForm';
import TrainingControlPanel from './components/trainingControlPanel/TrainingControlPanel';
import TrainingEndModal from './components/trainingEndModal/TrainingEndModal';
import { SCENARIO_LIST_DATA } from './mocks/scenarioListData';
import {
  CURRENT_ROUTE_TEXT,
  DEFAULT_FIRE_CONDITIONS,
  EMPTY_BASIC_INFO,
  FIRE_CONDITION_OPTIONS,
  LIVE_METRICS,
  LIVE_STATUS,
  PREVIEW_METRICS,
  PREVIEW_STATUS,
  PROPOSED_ROUTE_TEXT,
  RECOMMENDATION_TEXT,
  ROUTE_PROPOSAL_TEXT,
  SCENARIO_DETAIL_DATA,
} from './mocks/scenarioSettingsData';
import * as styles from './ScenarioSettingsPage.css';
import { SCENARIO_STATUS } from './types/scenarioList';

import type { ScenarioSummary } from './types/scenarioList';
import type { ScenarioDetail } from './types/scenarioSettings';

interface ScenarioSettingsContentProps {
  scenario?: ScenarioSummary;
  scenarioDetail?: ScenarioDetail;
}

const ScenarioSettingsContent = ({ scenario, scenarioDetail }: ScenarioSettingsContentProps) => {
  const navigate = useNavigate();
  const { show } = useToast();
  const isCreatePage = scenario === undefined;
  const isInitiallyEditing = isCreatePage || scenario?.status === SCENARIO_STATUS.DRAFT;
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
  const [startedAt, setStartedAt] = useState<number | null>(() =>
    scenario?.status === SCENARIO_STATUS.IN_PROGRESS ? Date.now() - 8 * 60 * 1000 : null,
  );
  const [currentRoute, setCurrentRoute] = useState(CURRENT_ROUTE_TEXT);
  const [routeProposal, setRouteProposal] = useState<string | null>(ROUTE_PROPOSAL_TEXT);
  const isRunning = startedAt !== null;
  const scenarioBasicInfo = scenarioDetail?.basicInfo ?? EMPTY_BASIC_INFO;
  const fireConditions = scenarioDetail?.fireConditions ?? DEFAULT_FIRE_CONDITIONS;

  const startTraining = () => {
    setStartedAt(Date.now());
  };

  const handleSaveDraft = () => {
    show({ title: '임시 저장되었습니다.', variant: 'success' });
  };

  const handleComplete = () => {
    setIsEditing(false);
    show({ title: '시나리오 작성이 완료되었습니다.', variant: 'success' });
  };

  const handleRejectRouteProposal = () => {
    setRouteProposal(null);
  };

  const handleApplyRouteProposal = () => {
    setCurrentRoute(PROPOSED_ROUTE_TEXT);
    setRouteProposal(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentGrid}>
        <ScenarioSetupForm
          basicInfo={scenarioBasicInfo}
          conditions={fireConditions}
          options={FIRE_CONDITION_OPTIONS}
          isRunning={isRunning}
          readOnly={!isEditing && !isRunning}
        />

        {startedAt !== null ? (
          <TrainingControlPanel
            startedAt={startedAt}
            currentRoute={currentRoute}
            routeProposal={routeProposal}
            liveStatus={LIVE_STATUS}
            liveMetrics={LIVE_METRICS}
            onEnd={() => setIsEndModalOpen(true)}
            onRejectRouteProposal={handleRejectRouteProposal}
            onApplyRouteProposal={handleApplyRouteProposal}
          />
        ) : (
          <aside className={styles.sideColumn}>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  fullWidth
                  className={styles.draftButton}
                  onClick={handleSaveDraft}
                >
                  임시 저장
                </Button>
                <Button type="button" size="lg" fullWidth onClick={handleComplete}>
                  작성 완료
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  size="lg"
                  fullWidth
                  leftIcon={<PlayIcon />}
                  onClick={startTraining}
                >
                  시나리오 시작
                </Button>
                <RecommendationCard icon={<SparklesIcon />} message={RECOMMENDATION_TEXT} />
                <TrainingPreviewCard status={PREVIEW_STATUS} metrics={PREVIEW_METRICS} />
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => setIsEditing(true)}
                >
                  수정하기
                </Button>
              </>
            )}
          </aside>
        )}
      </div>

      <TrainingEndModal
        open={isEndModalOpen}
        onHome={() => void navigate(ROUTES.HOME)}
        onReport={() => void navigate(ROUTES.REPORTS)}
      />
    </div>
  );
};

const ScenarioSettingsPage = () => {
  const { scenarioId } = useParams();
  const scenario = scenarioId
    ? SCENARIO_LIST_DATA.find((item) => item.id === scenarioId)
    : undefined;
  const scenarioDetail = scenarioId ? SCENARIO_DETAIL_DATA[scenarioId] : undefined;

  if (scenarioId && (!scenario || !scenarioDetail)) {
    return <Navigate replace to={ROUTES.SCENARIO_LIST} />;
  }

  return (
    <ScenarioSettingsContent
      key={scenarioId ?? 'new'}
      scenario={scenario}
      scenarioDetail={scenarioDetail}
    />
  );
};

export default ScenarioSettingsPage;
