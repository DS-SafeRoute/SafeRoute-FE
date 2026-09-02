import { useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useGetBuildingsQuery } from '@pages/buildings/api/useBuildingsQuery';

import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { useGetTrainingSessionsQuery } from '@apis/trainingSessions/useGetTrainingSessionsQuery';
import {
  useCreateTrainingSessionMutation,
  useEndTrainingSessionMutation,
  useStartTrainingSessionMutation,
} from '@apis/trainingSessions/useTrainingSessionMutations';
import { useTrainingSessionSocket } from '@apis/trainingSessions/websocket/useTrainingSessionSocket';
import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import PlayIcon from '@assets/icons/ic-play.svg?react';

import { Button } from '@components/Button';
import EmptyState from '@components/empty';
import useToast from '@components/toast/useToast';

import { ROUTES, getScenarioDetailPath } from '@constants/path';

import { useCreateScenarioMutation } from './api/useCreateScenarioMutation';
import { useGetScenarioQuery } from './api/useScenariosQuery';
import { useUpdateScenarioMutation } from './api/useUpdateScenarioMutation';
import TrainingPreviewCard from './components/cards/trainingPreviewCard/TrainingPreviewCard';
import ScenarioSetupForm from './components/scenarioSetupForm/ScenarioSetupForm';
import TrainingControlPanel from './components/trainingControlPanel/TrainingControlPanel';
import TrainingEndModal from './components/trainingEndModal/TrainingEndModal';
import { FIRE_SPREAD_LABEL, FIRE_SPREAD_VALUE, PREVIEW_STATUS } from './constants/scenarioSettings';
import { useScenarioFloorView } from './hooks/useScenarioFloorView';
import { useTrainingRouteData } from './hooks/useTrainingRouteData';
import * as styles from './ScenarioSettingsPage.css';
import { SCENARIO_STATUS } from './types/scenarioList';
import { getInitialBasicInfo, toScheduledAt } from './utils/scenarioSettings';

import type { FireSpreadLabel } from './constants/scenarioSettings';
import type { Scenario } from './types/scenarioList';
import type { BasicInfo } from './types/scenarioSettings';

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
  const createTrainingSessionMutation = useCreateTrainingSessionMutation();
  const startTrainingSessionMutation = useStartTrainingSessionMutation();
  const endTrainingSessionMutation = useEndTrainingSessionMutation();
  const shouldQueryTrainingSessions =
    scenario?.status === SCENARIO_STATUS.READY || scenario?.status === SCENARIO_STATUS.IN_PROGRESS;
  const { data: runningSessions = [], isPending: isRunningSessionsPending } =
    useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.RUNNING, shouldQueryTrainingSessions);
  const { data: scheduledSessions = [], isPending: isScheduledSessionsPending } =
    useGetTrainingSessionsQuery(TRAINING_SESSION_STATUS.SCHEDULED, shouldQueryTrainingSessions);
  const areTrainingSessionsPending =
    shouldQueryTrainingSessions && (isRunningSessionsPending || isScheduledSessionsPending);
  const isCreatePage = scenario === undefined;
  const isDraft = scenario?.status === SCENARIO_STATUS.DRAFT;
  const isScenarioReady = scenario?.status === SCENARIO_STATUS.READY;
  const isRestartUnavailable =
    scenario?.status === SCENARIO_STATUS.COMPLETED || scenario?.status === SCENARIO_STATUS.ERROR;
  const [isEditing, setIsEditing] = useState(false);
  const isEditable = isCreatePage || isDraft || isEditing;
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [createdSessionStartedAt, setCreatedSessionStartedAt] = useState<string | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(() => getInitialBasicInfo(scenario));
  const [fireSpreadLabel, setFireSpreadLabel] = useState<FireSpreadLabel>(
    scenario ? FIRE_SPREAD_LABEL[scenario.fireSpreadSpeed] : FIRE_SPREAD_LABEL.MEDIUM,
  );
  const runningSession = runningSessions.find(
    (session) =>
      session.scenarioName === scenario?.name && session.buildingId === scenario?.buildingId,
  );
  const scheduledSession = scheduledSessions.find(
    (session) =>
      session.scenarioName === scenario?.name && session.buildingId === scenario?.buildingId,
  );
  const activeSessionId = createdSessionId ?? runningSession?.sessionId ?? null;
  const routeSessionId = activeSessionId ?? scheduledSession?.sessionId ?? null;
  const activeStartedAt = createdSessionStartedAt ?? runningSession?.startedAt ?? null;
  const startedAt = activeStartedAt ? Date.parse(activeStartedAt) : null;
  const isRunning = activeSessionId !== null && startedAt !== null && !Number.isNaN(startedAt);
  const selectedBuildingId = basicInfo.targetBuilding || buildings[0]?.id || '';
  const displayedBasicInfo = { ...basicInfo, targetBuilding: selectedBuildingId };
  const buildingOptions = buildings.map((building) => ({
    label: building.name,
    value: building.id,
  }));
  const trainingRouteData = useTrainingRouteData({
    sessionId: routeSessionId,
    enabled: isRunning,
  });
  const floorView = useScenarioFloorView({
    scenarioId: scenario?.id,
    buildingId: selectedBuildingId,
    isRunning,
    routeFloorId: trainingRouteData.routeFloorId,
    routeNodeIds: trainingRouteData.routeNodeIds,
  });
  const canStartTraining = isScenarioReady && floorView.hasFireOrigin;
  const isFireOriginRequired =
    isScenarioReady &&
    !floorView.isFireOriginPending &&
    !floorView.isFireOriginError &&
    !floorView.hasFireOrigin;
  useTrainingSessionSocket({
    sessionId: activeSessionId,
    onEvent: trainingRouteData.handleTrainingEvent,
  });

  const handleStartTraining = async () => {
    if (areTrainingSessionsPending || !canStartTraining) return;

    if (!scenario || !currentUser?.id) {
      show({ title: '사용자 정보를 불러온 후 다시 시도해 주세요.', variant: 'error' });
      return;
    }

    try {
      let sessionId = scheduledSession?.sessionId;

      if (!sessionId) {
        const registeredSession = await createTrainingSessionMutation.mutateAsync({
          scenarioId: scenario.id,
          body: {
            adminId: currentUser.id,
            status: TRAINING_SESSION_STATUS.SCHEDULED,
            startedAt: scenario.scheduledAt,
          },
        });

        sessionId = registeredSession.id;
      }

      if (!sessionId) {
        throw new Error('시작할 훈련 세션 ID가 없습니다.');
      }

      const session = await startTrainingSessionMutation.mutateAsync(sessionId);

      if (!session.id || !session.startedAt) {
        throw new Error('시작된 훈련 세션 정보가 없습니다.');
      }

      setCreatedSessionId(session.id);
      setCreatedSessionStartedAt(session.startedAt);
      show({ title: '훈련이 시작되었습니다.', variant: 'success' });
    } catch {
      show({ title: '훈련 시작에 실패했습니다.', variant: 'error' });
    }
  };

  const handleEndTraining = async () => {
    if (!activeSessionId) return;

    try {
      await endTrainingSessionMutation.mutateAsync(activeSessionId);
      setIsEndModalOpen(true);
    } catch {
      show({ title: '훈련 종료에 실패했습니다.', variant: 'error' });
    }
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
    const targetEvacuationSec = basicInfo.targetEvacuationSec
      ? Number(basicInfo.targetEvacuationSec)
      : undefined;

    if (
      !name ||
      !selectedBuildingId ||
      !Number.isInteger(expectedParticipants) ||
      expectedParticipants < 1 ||
      (targetEvacuationSec !== undefined &&
        (!Number.isInteger(targetEvacuationSec) || targetEvacuationSec < 1)) ||
      !scheduledAt
    ) {
      show({ title: '시나리오 정보를 모두 올바르게 입력해 주세요.', variant: 'error' });
      return null;
    }

    return { name, expectedParticipants, scheduledAt, fireSpreadSpeed, targetEvacuationSec };
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

      try {
        await createTrainingSessionMutation.mutateAsync({
          scenarioId: createdScenario.id,
          body: {
            adminId: currentUser.id,
            status: TRAINING_SESSION_STATUS.SCHEDULED,
            startedAt: payload.scheduledAt,
          },
        });
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
      await trainingRouteData.rejectRouteProposal();
    } catch {
      show({ title: '경로 변경 제안 거부에 실패했습니다.', variant: 'error' });
    }
  };

  const handleApplyRouteProposal = async () => {
    try {
      await trainingRouteData.approveRouteProposal();
    } catch {
      show({ title: '경로 변경 제안 승인에 실패했습니다.', variant: 'error' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentGrid}>
        <ScenarioSetupForm
          value={{
            basicInfo: displayedBasicInfo,
            fireSpreadLabel,
          }}
          buildingOptions={buildingOptions}
          floorMap={floorView.floorMap}
          mode={{
            isRunning,
            readOnly: !isEditable && !isRunning,
            buildingReadOnly: !isCreatePage,
          }}
          handlers={{
            onBasicInfoChange: handleBasicInfoChange,
            onFireSpreadChange: handleFireSpreadChange,
          }}
        />

        {isRunning && startedAt !== null ? (
          <TrainingControlPanel
            startedAt={startedAt}
            currentRoute={trainingRouteData.currentRouteMessage}
            liveMetrics={floorView.previewMetrics}
            isEnding={endTrainingSessionMutation.isPending}
            onEnd={() => void handleEndTraining()}
            routeDecision={{
              proposal: trainingRouteData.routeProposal,
              isApplying: trainingRouteData.isApplyingRouteProposal,
              isRejecting: trainingRouteData.isRejectingRouteProposal,
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
                isLoading={
                  createScenarioMutation.isPending || createTrainingSessionMutation.isPending
                }
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
                    areTrainingSessionsPending || floorView.isFireOriginPending || !canStartTraining
                  }
                  isLoading={
                    createTrainingSessionMutation.isPending ||
                    startTrainingSessionMutation.isPending
                  }
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
    return <div className={styles.stateMessage}>시나리오를 불러오는 중...</div>;
  }

  if (scenarioId && (isError || !scenario)) {
    return <EmptyState className={styles.pageState} title="시나리오를 불러오지 못했습니다." />;
  }

  return <ScenarioSettingsContent key={scenarioId ?? 'new'} scenario={scenario} />;
};

export default ScenarioSettingsPage;
