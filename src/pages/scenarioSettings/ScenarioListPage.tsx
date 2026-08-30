import { useState, type ReactNode } from 'react';

import { useNavigate } from 'react-router';

import { useGetBuildingsQuery } from '@pages/buildings/api/useBuildingsQuery';

import type { Scenario } from '@apis/scenarios/scenarioTypes';
import { useDeleteScenarioMutation } from '@apis/scenarios/useScenarioMutations';
import { useGetScenariosQuery } from '@apis/scenarios/useScenariosQuery';

import FileTextIcon from '@assets/icons/ic-filetext.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import Dropdown from '@components/dropdown';
import EmptyState from '@components/empty';
import LoadingState from '@components/loadingState';
import useToast from '@components/toast/useToast';

import { ROUTES, getReportPath, getScenarioDetailPath } from '@constants/path';

import ScenarioDeleteModal from './components/scenarioDeleteModal/ScenarioDeleteModal';
import ScenarioListRow from './components/scenarioList/ScenarioListRow';
import { SCENARIO_STATUS_FILTER_OPTIONS } from './constants/scenarioSettings';
import * as styles from './ScenarioListPage.css';

type StatusFilter = (typeof SCENARIO_STATUS_FILTER_OPTIONS)[number]['value'];

const ScenarioListPage = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: scenarios = [], isPending, isError, refetch } = useGetScenariosQuery();
  const { data: buildings = [], isPending: areBuildingsPending } = useGetBuildingsQuery();
  const deleteScenarioMutation = useDeleteScenarioMutation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null);
  const buildingNames = new Map(buildings.map((building) => [building.id, building.name]));

  const filteredScenarios = scenarios.filter(
    (scenario) => statusFilter === 'ALL' || scenario.status === statusFilter,
  );

  const navigateToCreate = () => {
    if (buildings.length === 0) {
      show({
        title: '건물을 먼저 등록해 주세요.',
        description: '시나리오를 추가하려면 대상 건물이 필요합니다.',
        variant: 'default',
      });
      return;
    }

    void navigate(ROUTES.SCENARIO_CREATE);
  };

  const handleOpen = (scenario: Scenario) => {
    void navigate(getScenarioDetailPath(scenario.id));
  };

  const handleOpenReport = (reportId: string) => {
    void navigate(getReportPath(reportId));
  };

  const handleDelete = (scenario: Scenario) => {
    if (!scenario.deletable) return;
    setDeleteTarget(scenario);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const scenarioName = deleteTarget.name ?? '이 시나리오';

    deleteScenarioMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        show({
          title: '시나리오가 삭제되었습니다.',
          description: `${scenarioName}이(가) 삭제되었습니다.`,
          variant: 'success',
        });
        setDeleteTarget(null);
      },
      onError: () => {
        show({ title: '시나리오 삭제에 실패했습니다.', variant: 'error' });
      },
    });
  };

  let listContent: ReactNode;
  if (isPending) {
    listContent = <LoadingState />;
  } else if (isError) {
    listContent = (
      <EmptyState
        className={styles.emptyState}
        icon={<FileTextIcon />}
        title="시나리오 목록을 불러오지 못했습니다."
        action={
          <Button type="button" variant="ghost" onClick={() => void refetch()}>
            다시 시도
          </Button>
        }
      />
    );
  } else if (scenarios.length === 0) {
    listContent = (
      <EmptyState
        className={styles.emptyState}
        icon={<FileTextIcon />}
        title="아직 등록된 시나리오가 없습니다."
      />
    );
  } else if (filteredScenarios.length === 0) {
    listContent = (
      <EmptyState className={styles.emptyState} title="선택한 상태의 시나리오가 없습니다." />
    );
  } else {
    listContent = (
      <div className={styles.list}>
        {filteredScenarios.map((scenario) => (
          <ScenarioListRow
            key={scenario.id}
            scenario={scenario}
            buildingName={scenario.buildingId ? buildingNames.get(scenario.buildingId) : undefined}
            onOpen={handleOpen}
            onOpenReport={handleOpenReport}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <Dropdown
            shape="rounded"
            options={SCENARIO_STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <Button
            type="button"
            className={styles.addButton}
            leftIcon={<PlusIcon />}
            onClick={navigateToCreate}
            disabled={areBuildingsPending}
          >
            시나리오 추가
          </Button>
        </div>

        {listContent}
      </div>

      {deleteTarget && (
        <ScenarioDeleteModal
          open
          scenarioName={deleteTarget.name ?? '이 시나리오'}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          isSubmitting={deleteScenarioMutation.isPending}
        />
      )}
    </>
  );
};

export default ScenarioListPage;
