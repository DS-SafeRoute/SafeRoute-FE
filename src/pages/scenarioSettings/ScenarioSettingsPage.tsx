import PlayIcon from '@assets/icons/ic-play.svg?react';
import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import { Button } from '@components/Button';

import RecommendationCard from './components/cards/recommendationCard/RecommendationCard';
import TrainingPreviewCard from './components/cards/trainingPreviewCard/TrainingPreviewCard';
import ScenarioSetupForm from './components/scenarioSetupForm/ScenarioSetupForm';
import {
  basicInfo,
  previewStatus,
  fireConditionOptions,
  previewMetrics,
  recommendationText,
  selectedFireConditions,
} from './mocks/scenarioSettingsData';
import * as styles from './ScenarioSettingsPage.css';

const ScenarioSettingsPage = () => (
  <div className={styles.container}>
    <div className={styles.sectionContainer}>
      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <ScenarioSetupForm
            basicInfo={basicInfo}
            conditions={selectedFireConditions}
            options={fireConditionOptions}
          />
        </div>

        <aside className={styles.sideColumn}>
          <Button type="button" size="lg" fullWidth leftIcon={<PlayIcon />}>
            시나리오 시작
          </Button>
          <RecommendationCard icon={<SparklesIcon />} message={recommendationText} />
          <TrainingPreviewCard status={previewStatus} metrics={previewMetrics} />
          <Button type="button" variant="ghost" size="lg" fullWidth>
            임시 저장
          </Button>
        </aside>
      </div>
    </div>
  </div>
);

export default ScenarioSettingsPage;
