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
import { scenarioListData } from './mocks/scenarioListData';
import {
  basicInfo,
  emptyBasicInfo,
  currentRouteText,
  liveMetrics,
  liveStatus,
  previewStatus,
  fireConditionOptions,
  previewMetrics,
  recommendationText,
  proposedRouteText,
  routeProposalText,
  selectedFireConditions,
} from './mocks/scenarioSettingsData';
import * as styles from './ScenarioSettingsPage.css';
import { SCENARIO_STATUS } from './types/scenarioList';

const ScenarioSettingsPage = () => {
  const navigate = useNavigate();
  const { scenarioId } = useParams();
  const { show } = useToast();
  const isCreatePage = scenarioId === undefined;
  const scenario = scenarioListData.find((item) => item.id === scenarioId);
  const isInitiallyEditing = isCreatePage || scenario?.status === SCENARIO_STATUS.DRAFT;
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
  const [startedAt, setStartedAt] = useState<number | null>(() =>
    scenario?.status === SCENARIO_STATUS.IN_PROGRESS ? Date.now() - 8 * 60 * 1000 : null,
  );
  const [currentRoute, setCurrentRoute] = useState(currentRouteText);
  const [routeProposal, setRouteProposal] = useState<string | null>(routeProposalText);
  const isRunning = startedAt !== null;
  const scenarioBasicInfo = isCreatePage
    ? emptyBasicInfo
    : { ...basicInfo, scenarioName: scenario?.name ?? basicInfo.scenarioName };

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
    setCurrentRoute(proposedRouteText);
    setRouteProposal(null);
  };

  if (!isCreatePage && !scenario) {
    return <Navigate replace to={ROUTES.SCENARIO_LIST} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentGrid}>
        <ScenarioSetupForm
          basicInfo={scenarioBasicInfo}
          conditions={selectedFireConditions}
          options={fireConditionOptions}
          isRunning={isRunning}
          readOnly={!isEditing && !isRunning}
        />

        {startedAt !== null ? (
          <TrainingControlPanel
            startedAt={startedAt}
            currentRoute={currentRoute}
            routeProposal={routeProposal}
            liveStatus={liveStatus}
            liveMetrics={liveMetrics}
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
                <RecommendationCard icon={<SparklesIcon />} message={recommendationText} />
                <TrainingPreviewCard status={previewStatus} metrics={previewMetrics} />
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

export default ScenarioSettingsPage;
