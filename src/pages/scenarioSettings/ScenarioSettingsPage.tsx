import { useCallback, useState } from 'react';

import { useNavigate } from 'react-router';

import PlayIcon from '@assets/icons/ic-play.svg?react';
import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import { Button } from '@components/Button';

import { ROUTES } from '@constants/path';

import RecommendationCard from './components/cards/recommendationCard/RecommendationCard';
import TrainingPreviewCard from './components/cards/trainingPreviewCard/TrainingPreviewCard';
import ScenarioSetupForm from './components/scenarioSetupForm/ScenarioSetupForm';
import TrainingControlPanel from './components/trainingControlPanel/TrainingControlPanel';
import TrainingEndModal from './components/trainingEndModal/TrainingEndModal';
import {
  basicInfo,
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

const ScenarioSettingsPage = () => {
  const navigate = useNavigate();
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [currentRoute, setCurrentRoute] = useState(currentRouteText);
  const [routeProposal, setRouteProposal] = useState<string | null>(routeProposalText);
  const isRunning = startedAt !== null;

  const startTraining = () => {
    setStartedAt(Date.now());
  };

  const handleRejectRouteProposal = () => {
    setRouteProposal(null);
  };

  const handleApplyRouteProposal = () => {
    setCurrentRoute(proposedRouteText);
    setRouteProposal(null);
  };

  const handleHome = useCallback(() => void navigate(ROUTES.HOME), [navigate]);
  const handleReport = useCallback(() => void navigate(ROUTES.REPORTS), [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.contentGrid}>
        <ScenarioSetupForm
          basicInfo={basicInfo}
          conditions={selectedFireConditions}
          options={fireConditionOptions}
          isRunning={isRunning}
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
            <Button type="button" variant="ghost" size="lg" fullWidth>
              임시 저장
            </Button>
          </aside>
        )}
      </div>

      <TrainingEndModal open={isEndModalOpen} onHome={handleHome} onReport={handleReport} />
    </div>
  );
};

export default ScenarioSettingsPage;
