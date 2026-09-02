import { useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useGetBuildingsQuery } from '@pages/buildings/api/useBuildingsQuery';

import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import PlayIcon from '@assets/icons/ic-play.svg?react';

import { Button } from '@components/Button';
import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';
import useToast from '@components/toast/useToast';

import { ROUTES, getScenarioDetailPath } from '@constants/path';

import {
  useCreateScenarioMutation,
  useGetScenarioQuery,
  useUpdateScenarioMutation,
} from './api/scenarioQueries';
import TrainingPreviewCard from './components/cards/trainingPreviewCard/TrainingPreviewCard';
import ScenarioSetupForm from './components/scenarioSetupForm/ScenarioSetupForm';
import TrainingControlPanel from './components/trainingControlPanel/TrainingControlPanel';
import TrainingEndModal from './components/trainingEndModal/TrainingEndModal';
import { PREVIEW_STATUS } from './constants/scenarioSettings';
import { useScenarioFloorView } from './hooks/useScenarioFloorView';
import { useScenarioForm } from './hooks/useScenarioForm';
import { useScenarioTraining } from './hooks/useScenarioTraining';
import * as styles from './ScenarioSettingsPage.css';
import { SCENARIO_STATUS } from './types/scenarioList';

import type { Scenario } from './types/scenarioList';

interface ScenarioSettingsContentProps {
  scenario?: Scenario;
}

const ScenarioSettingsContent = ({ scenario }: ScenarioSettingsContentProps) => {
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { data: currentUser } = useMyProfileQuery();
  const createScenarioMutation = useCreateScenarioMutation();
  const updateScenarioMutation = useUpdateScenarioMutation();
  const isCreatePage = scenario === undefined;
  const isDraft = scenario?.status === SCENARIO_STATUS.DRAFT;
  const isScenarioReady = scenario?.status === SCENARIO_STATUS.READY;
  const isRestartUnavailable =
    scenario?.status === SCENARIO_STATUS.COMPLETED || scenario?.status === SCENARIO_STATUS.ERROR;
  const [isEditing, setIsEditing] = useState(false);
  const isEditable = isCreatePage || isDraft || isEditing;
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const scenarioForm = useScenarioForm({ scenario, defaultBuildingId: buildings[0]?.id });
  const training = useScenarioTraining({ scenario, adminId: currentUser?.id });
  const buildingOptions = buildings.map((building) => ({
    label: building.name,
    value: building.id,
  }));
  const floorView = useScenarioFloorView({
    scenarioId: scenario?.id,
    buildingId: scenarioForm.selectedBuildingId,
    isRunning: training.isRunning,
    routeFloorId: training.route.routeFloorId,
    routeNodeIds: training.route.routeNodeIds,
  });
  const canStartTraining = isScenarioReady && floorView.hasFireOrigin;
  const isFireOriginRequired =
    isScenarioReady &&
    !floorView.isFireOriginPending &&
    !floorView.isFireOriginError &&
    !floorView.hasFireOrigin;

  const handleStartTraining = async () => {
    if (training.areSessionsPending || !canStartTraining) return;

    if (!scenario || !currentUser?.id) {
      show({ title: '사용자 정보를 불러온 후 다시 시도해 주세요.', variant: 'error' });
      return;
    }

    try {
      await training.startTraining();
      show({ title: '훈련이 시작되었습니다.', variant: 'success' });
    } catch {
      show({ title: '훈련 시작에 실패했습니다.', variant: 'error' });
    }
  };

  const handleEndTraining = async () => {
    if (!training.isRunning) return;

    try {
      await training.endTraining();
      setIsEndModalOpen(true);
    } catch {
      show({ title: '훈련 종료에 실패했습니다.', variant: 'error' });
    }
  };

  const getFormPayload = () => {
    const payload = scenarioForm.getPayload();
    if (!payload) {
      show({ title: '시나리오 정보를 모두 올바르게 입력해 주세요.', variant: 'error' });
    }
    return payload;
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
        buildingId: scenarioForm.selectedBuildingId,
        adminId: currentUser.id,
      });

      try {
        await training.scheduleTraining(createdScenario.id, payload.scheduledAt);
      } catch {
        show({
          title: '시나리오는 등록됐지만 훈련 일정 등록에 실패했습니다.',
          variant: 'error',
        });
        void navigate(getScenarioDetailPath(createdScenario.id), { replace: true });
        return;
      }

      show({ title: '시나리오가 등록되었습니다.', variant: 'success' });
      void navigate(getScenarioDetailPath(createdScenario.id), { replace: true });
    } catch {
      show({ title: '시나리오 등록에 실패했습니다.', variant: 'error' });
    }
  };

  const handleRejectRouteProposal = async () => {
    try {
      await training.route.rejectRouteProposal();
    } catch {
      show({ title: '경로 변경 제안 거부에 실패했습니다.', variant: 'error' });
    }
  };

  const handleApplyRouteProposal = async () => {
    try {
      await training.route.approveRouteProposal();
    } catch {
      show({ title: '경로 변경 제안 승인에 실패했습니다.', variant: 'error' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentGrid}>
        <ScenarioSetupForm
          value={scenarioForm.value}
          buildingOptions={buildingOptions}
          floorMap={floorView.floorMap}
          mode={{
            isRunning: training.isRunning,
            readOnly: !isEditable && !training.isRunning,
            buildingReadOnly: !isCreatePage,
          }}
          handlers={{
            onBasicInfoChange: scenarioForm.handleBasicInfoChange,
            onFireSpreadChange: scenarioForm.handleFireSpreadChange,
          }}
        />

        {training.isRunning && training.startedAt !== null ? (
          <TrainingControlPanel
            startedAt={training.startedAt}
            currentRoute={training.route.currentRouteMessage}
            liveMetrics={floorView.previewMetrics}
            isEnding={training.isEnding}
            onEnd={() => void handleEndTraining()}
            routeDecision={{
              proposal: training.route.routeProposal,
              isApplying: training.route.isApplyingRouteProposal,
              isRejecting: training.route.isRejectingRouteProposal,
              onReject: () => void handleRejectRouteProposal(),
              onApply: () => void handleApplyRouteProposal(),
            }}
          />
        ) : (
          <aside className={styles.sideColumn}>
            {isCreatePage ? (
              <Button
                type="button"
                size="lg"
                fullWidth
                onClick={() => void handleCreate()}
                isLoading={createScenarioMutation.isPending || training.isScheduling}
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
                  onClick={() => void handleStartTraining()}
                  disabled={
                    training.areSessionsPending ||
                    floorView.isFireOriginPending ||
                    !canStartTraining
                  }
                  isLoading={training.isStarting}
                >
                  시나리오 시작
                </Button>
                {isRestartUnavailable ? (
                  <p className={styles.startRestrictionNotice}>
                    완료되었거나 오류가 발생한 시나리오는 다시 시작할 수 없습니다. 새 시나리오를
                    생성해 주세요.
                  </p>
                ) : null}
                {isFireOriginRequired ? (
                  // 발화점 등록 API가 도면관리에서 evacuation-setup 쪽으로 옮겨간 것으로 보여
                  // (팀 전달사항, 2026-09-03) 더 이상 "도면 관리에서"라고 특정 위치를 안내하지 않음
                  <p className={styles.startRestrictionNotice}>
                    이 시나리오의 최초 발화점이 아직 지정되지 않았어요.
                  </p>
                ) : null}
                {canStartTraining ? (
                  <TrainingPreviewCard status={PREVIEW_STATUS} metrics={floorView.previewMetrics} />
                ) : null}
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
    return <LoadingState message="시나리오를 불러오는 중..." />;
  }

  if (scenarioId && (isError || !scenario)) {
    return <EmptyState className={styles.pageState} title="시나리오를 불러오지 못했습니다." />;
  }

  return <ScenarioSettingsContent key={scenarioId ?? 'new'} scenario={scenario} />;
};

export default ScenarioSettingsPage;
