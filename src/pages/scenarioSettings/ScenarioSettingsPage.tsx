import { useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useGetBuildingsQuery } from '@pages/buildings/api/useBuildingsQuery';

import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';

import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';
import useToast from '@components/toast/useToast';

import { ROUTES, getScenarioDetailPath } from '@constants/path';

import {
  useCreateScenarioMutation,
  useGetScenarioQuery,
  useUpdateScenarioMutation,
} from './api/scenarioQueries';
import ScenarioActionPanel from './components/scenarioActionPanel/ScenarioActionPanel';
import ScenarioSetupForm from './components/scenarioSetupForm/ScenarioSetupForm';
import TrainingControlPanel from './components/trainingControlPanel/TrainingControlPanel';
import TrainingEndModal from './components/trainingEndModal/TrainingEndModal';
import { useScenarioFloorView } from './hooks/useScenarioFloorView';
import { useScenarioForm } from './hooks/useScenarioForm';
import { useScenarioTraining } from './hooks/useScenarioTraining';
import * as styles from './ScenarioSettingsPage.css';
import { SCENARIO_STATUS } from './types/scenarioList';

import type { ScenarioActionMode } from './components/scenarioActionPanel/ScenarioActionPanel';
import type { Scenario } from './types/scenarioList';

interface ScenarioSettingsContentProps {
  scenario?: Scenario;
}

const getScenarioActionMode = (
  scenario: Scenario | undefined,
  isEditing: boolean,
): ScenarioActionMode => {
  if (!scenario) return 'create';
  if (scenario.status === SCENARIO_STATUS.DRAFT || isEditing) return 'edit';
  return 'start';
};

const getStartRestrictionMessage = (
  scenario: Scenario | undefined,
  isFireOriginRequired: boolean,
) => {
  if (
    scenario?.status === SCENARIO_STATUS.COMPLETED ||
    scenario?.status === SCENARIO_STATUS.ERROR
  ) {
    return '완료되었거나 오류가 발생한 시나리오는 다시 시작할 수 없습니다. 새 시나리오를 생성해 주세요.';
  }
  if (isFireOriginRequired) {
    return '도면 관리에서 이 시나리오의 최초 발화점을 지정해 주세요.';
  }
  return undefined;
};

const getActionLoading = (
  mode: ScenarioActionMode,
  isCreating: boolean,
  isSaving: boolean,
  isStarting: boolean,
) => {
  if (mode === 'create') return isCreating;
  if (mode === 'edit') return isSaving;
  return isStarting;
};

// 시나리오 작성·수정 화면과 훈련 진행 화면의 UI 흐름 조정
const ScenarioSettingsContent = ({ scenario }: ScenarioSettingsContentProps) => {
  const navigate = useNavigate();
  const { show } = useToast();

  // 폼 선택지와 요청에 필요한 사용자·건물 정보
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { data: currentUser } = useMyProfileQuery();

  // 시나리오 생성·수정 요청 상태
  const createScenarioMutation = useCreateScenarioMutation();
  const updateScenarioMutation = useUpdateScenarioMutation();

  // 편집 여부와 훈련 종료 안내 모달은 서로 독립적인 UI 상태
  const [isEditing, setIsEditing] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  // 시나리오 상태에 따른 액션 패널 모드
  const isCreatePage = scenario === undefined;
  const isScenarioReady = scenario?.status === SCENARIO_STATUS.READY;
  const actionMode = getScenarioActionMode(scenario, isEditing);

  // 입력 폼과 훈련 세션의 상태·동작을 도메인 단위로 관리
  const scenarioForm = useScenarioForm({ scenario, defaultBuildingId: buildings[0]?.id });
  const training = useScenarioTraining({ scenario, adminId: currentUser?.id });

  // 건물 조회 결과를 대상 건물 선택 옵션으로 변환
  const buildingOptions = buildings.map((building) => ({
    label: building.name,
    value: building.id,
  }));

  // 선택된 건물·훈련 경로에 맞는 도면과 발화 위치 조회
  const floorView = useScenarioFloorView({
    scenarioId: scenario?.id,
    buildingId: scenarioForm.selectedBuildingId,
    isRunning: training.isRunning,
    routeFloorId: training.route.routeFloorId,
    routeNodeIds: training.route.routeNodeIds,
  });

  // 준비 상태와 발화점 조회 결과를 조합해 훈련 시작 가능 여부 결정
  const canStartTraining = isScenarioReady && floorView.hasFireOrigin;
  const isFireOriginRequired =
    isScenarioReady &&
    !floorView.isFireOriginPending &&
    !floorView.isFireOriginError &&
    !floorView.hasFireOrigin;
  const startRestrictionMessage = getStartRestrictionMessage(scenario, isFireOriginRequired);
  const isActionLoading = getActionLoading(
    actionMode,
    createScenarioMutation.isPending || training.isScheduling,
    updateScenarioMutation.isPending,
    training.isStarting,
  );

  // 예약 세션을 준비한 뒤 훈련 시작
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

  // 진행 중인 훈련 종료 후 결과 이동 모달 표시
  const handleEndTraining = async () => {
    if (!training.isRunning) return;

    try {
      await training.endTraining();
      setIsEndModalOpen(true);
    } catch {
      show({ title: '훈련 종료에 실패했습니다.', variant: 'error' });
    }
  };

  // 작성·수정에서 공통으로 사용할 검증 완료 payload 반환
  const getFormPayload = () => {
    const payload = scenarioForm.getPayload();
    if (!payload) {
      show({ title: '시나리오 정보를 모두 올바르게 입력해 주세요.', variant: 'error' });
    }
    return payload;
  };

  // 기존 시나리오의 수정 내용을 임시 저장
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

  // 시나리오 생성 후 연결된 훈련 일정까지 순서대로 등록
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

  // 실시간 경로 변경 제안 거부
  const handleRejectRouteProposal = async () => {
    try {
      await training.route.rejectRouteProposal();
    } catch {
      show({ title: '경로 변경 제안 거부에 실패했습니다.', variant: 'error' });
    }
  };

  // 실시간 경로 변경 제안 승인
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
        {/* 기본 정보·화재 조건·발화 위치 입력 영역 */}
        <ScenarioSetupForm
          value={scenarioForm.value}
          buildingOptions={buildingOptions}
          floorMap={floorView.floorMap}
          mode={{
            isRunning: training.isRunning,
            readOnly: actionMode === 'start' && !training.isRunning,
            buildingReadOnly: !isCreatePage,
          }}
          handlers={{
            onBasicInfoChange: scenarioForm.handleBasicInfoChange,
            onFireSpreadChange: scenarioForm.handleFireSpreadChange,
          }}
        />

        {/* 훈련 중에는 제어 패널, 그 외에는 작성·저장·시작 액션 표시 */}
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
          <ScenarioActionPanel
            mode={actionMode}
            isLoading={isActionLoading}
            startState={{
              disabled:
                training.areSessionsPending || floorView.isFireOriginPending || !canStartTraining,
              restrictionMessage: startRestrictionMessage,
              showPreview: canStartTraining,
              canEdit: isScenarioReady,
              metrics: floorView.previewMetrics,
            }}
            handlers={{
              onCreate: () => void handleCreate(),
              onSave: () => void handleSaveDraft(),
              onStart: () => void handleStartTraining(),
              onEdit: () => setIsEditing(true),
            }}
          />
        )}
      </div>

      {/* 훈련 종료 후 홈 또는 보고서 이동 선택 */}
      <TrainingEndModal
        open={isEndModalOpen}
        onHome={() => void navigate(ROUTES.HOME)}
        onReport={() => void navigate(ROUTES.REPORTS)}
      />
    </div>
  );
};

// 상세 조회 상태를 처리하고 검증된 시나리오만 콘텐츠에 전달
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
