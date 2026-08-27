import { useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useGetBuildingsQuery } from '@pages/buildings/api/useBuildingsQuery';

import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import PlayIcon from '@assets/icons/ic-play.svg?react';
import SparklesIcon from '@assets/icons/ic-sparkles.svg?react';

import { Button } from '@components/Button';
import EmptyState from '@components/empty';
import useToast from '@components/toast/useToast';

import { ROUTES, getScenarioDetailPath } from '@constants/path';

import { useCreateScenarioMutation } from './api/useCreateScenarioMutation';
import { useGetScenarioQuery } from './api/useScenariosQuery';
import { useUpdateScenarioMutation } from './api/useUpdateScenarioMutation';
import RecommendationCard from './components/cards/recommendationCard/RecommendationCard';
import TrainingPreviewCard from './components/cards/trainingPreviewCard/TrainingPreviewCard';
import ScenarioSetupForm from './components/scenarioSetupForm/ScenarioSetupForm';
import TrainingControlPanel from './components/trainingControlPanel/TrainingControlPanel';
import TrainingEndModal from './components/trainingEndModal/TrainingEndModal';
import { DEFAULT_FIRE_CONDITIONS, FIRE_CONDITION_OPTIONS } from './constants/scenarioSettings';
import {
  CURRENT_ROUTE_TEXT,
  LIVE_METRICS,
  LIVE_STATUS,
  PREVIEW_METRICS,
  PREVIEW_STATUS,
  PROPOSED_ROUTE_TEXT,
  RECOMMENDATION_TEXT,
  ROUTE_PROPOSAL_TEXT,
} from './mocks/trainingData';
import * as styles from './ScenarioSettingsPage.css';
import { SCENARIO_STATUS } from './types/scenarioList';

import type { Scenario } from './types/scenarioList';
import type { BasicInfo } from './types/scenarioSettings';

interface ScenarioSettingsContentProps {
  scenario?: Scenario;
}

const FIRE_SPREAD_LABEL = {
  SLOW: '느림',
  MEDIUM: '중간',
  FAST: '빠름',
} as const;

const FIRE_SPREAD_VALUE = {
  느림: 'SLOW',
  중간: 'MEDIUM',
  빠름: 'FAST',
} as const;

type FireSpreadLabel = keyof typeof FIRE_SPREAD_VALUE;

const getInitialBasicInfo = (scenario?: Scenario): BasicInfo => ({
  scenarioName: scenario?.name ?? '',
  targetBuilding: scenario?.buildingId ?? '',
  scheduledAt: scenario?.scheduledAt ?? '',
  expectedParticipants: scenario ? String(scenario.expectedParticipants) : '',
});

const toScheduledAt = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const ScenarioSettingsContent = ({ scenario }: ScenarioSettingsContentProps) => {
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { data: currentUser } = useMyProfileQuery();
  const createScenarioMutation = useCreateScenarioMutation();
  const updateScenarioMutation = useUpdateScenarioMutation();
  const isCreatePage = scenario === undefined;
  const isDraft = scenario?.status === SCENARIO_STATUS.DRAFT;
  const [isEditing, setIsEditing] = useState(false);
  const isEditable = isCreatePage || isDraft || isEditing;
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(() =>
    scenario?.status === SCENARIO_STATUS.IN_PROGRESS ? Date.now() - 8 * 60 * 1000 : null,
  );
  const [currentRoute, setCurrentRoute] = useState(CURRENT_ROUTE_TEXT);
  const [routeProposal, setRouteProposal] = useState<string | null>(ROUTE_PROPOSAL_TEXT);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(() => getInitialBasicInfo(scenario));
  const [fireSpreadLabel, setFireSpreadLabel] = useState<FireSpreadLabel>(
    scenario ? FIRE_SPREAD_LABEL[scenario.fireSpreadSpeed] : FIRE_SPREAD_LABEL.MEDIUM,
  );
  const isRunning = startedAt !== null;
  const selectedBuildingId = basicInfo.targetBuilding || buildings[0]?.id || '';
  const displayedBasicInfo = { ...basicInfo, targetBuilding: selectedBuildingId };
  const fireConditions = DEFAULT_FIRE_CONDITIONS.map((condition) =>
    condition.key === 'spread' ? { ...condition, value: fireSpreadLabel } : condition,
  );
  const buildingOptions = buildings.map((building) => ({
    label: building.name,
    value: building.id,
  }));

  const startTraining = () => {
    setStartedAt(Date.now());
  };

  const handleBasicInfoChange = (key: keyof BasicInfo, value: string) => {
    setBasicInfo((current) => ({ ...current, [key]: value }));
  };

  const handleFireSpreadChange = (value: string) => {
    if (value in FIRE_SPREAD_VALUE) {
      setFireSpreadLabel(value as FireSpreadLabel);
    }
  };

  const getFormPayload = () => {
    const name = basicInfo.scenarioName.trim();
    const expectedParticipants = Number(basicInfo.expectedParticipants);
    const scheduledAt = toScheduledAt(basicInfo.scheduledAt);
    const fireSpreadSpeed = FIRE_SPREAD_VALUE[fireSpreadLabel];

    if (
      !name ||
      !selectedBuildingId ||
      !Number.isInteger(expectedParticipants) ||
      expectedParticipants < 1 ||
      !scheduledAt
    ) {
      show({ title: '시나리오 정보를 모두 올바르게 입력해 주세요.', variant: 'error' });
      return null;
    }

    return { name, expectedParticipants, scheduledAt, fireSpreadSpeed };
  };

  const handleSaveDraft = async () => {
    if (!scenario) return;
    const payload = getFormPayload();
    if (!payload) return;

    try {
      await updateScenarioMutation.mutateAsync({
        scenarioId: scenario.id,
        body: payload,
      });
      setIsEditing(false);
      show({ title: '임시 저장되었습니다.', variant: 'success' });
    } catch {
      show({ title: '임시 저장에 실패했습니다.', variant: 'error' });
    }
  };

  const handleCreate = async () => {
    const payload = getFormPayload();
    if (!payload) return;

    if (!currentUser?.id) {
      show({ title: '사용자 정보를 불러온 후 다시 시도해 주세요.', variant: 'error' });
      return;
    }

    try {
      const createdScenario = await createScenarioMutation.mutateAsync({
        ...payload,
        buildingId: selectedBuildingId,
        adminId: currentUser.id,
      });
      show({ title: '시나리오가 등록되었습니다.', variant: 'success' });
      void navigate(getScenarioDetailPath(createdScenario.id), { replace: true });
    } catch {
      show({ title: '시나리오 등록에 실패했습니다.', variant: 'error' });
    }
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
          basicInfo={displayedBasicInfo}
          conditions={fireConditions}
          options={FIRE_CONDITION_OPTIONS}
          buildingOptions={buildingOptions}
          buildingReadOnly={!isCreatePage}
          isRunning={isRunning}
          readOnly={!isEditable && !isRunning}
          onBasicInfoChange={handleBasicInfoChange}
          onFireSpreadChange={handleFireSpreadChange}
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
            {isCreatePage ? (
              <Button
                type="button"
                size="lg"
                fullWidth
                onClick={() => void handleCreate()}
                isLoading={createScenarioMutation.isPending}
              >
                작성 완료
              </Button>
            ) : isDraft || isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                fullWidth
                className={styles.draftButton}
                onClick={() => void handleSaveDraft()}
                isLoading={updateScenarioMutation.isPending}
              >
                임시 저장
              </Button>
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
                {scenario?.status === SCENARIO_STATUS.READY ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    fullWidth
                    onClick={() => setIsEditing(true)}
                  >
                    수정하기
                  </Button>
                ) : null}
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
  const { data: scenario, isPending, isError } = useGetScenarioQuery(scenarioId);

  if (scenarioId && isPending) {
    return <div className={styles.stateMessage}>시나리오를 불러오는 중...</div>;
  }

  if (scenarioId && (isError || !scenario)) {
    return <EmptyState className={styles.pageState} title="시나리오를 불러오지 못했습니다." />;
  }

  return <ScenarioSettingsContent key={scenarioId ?? 'new'} scenario={scenario} />;
};

export default ScenarioSettingsPage;
