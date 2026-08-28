import { useState } from 'react';

import { useNavigate } from 'react-router';

import { useGetBuildingsQuery } from '@pages/buildings/api/useBuildingsQuery';

import FileTextIcon from '@assets/icons/ic-filetext.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import Dropdown from '@components/dropdown';
import EmptyState from '@components/empty';
import useToast from '@components/toast/useToast';

import { ROUTES, getScenarioDetailPath } from '@constants/path';

import { useDeleteScenarioMutation } from './api/useDeleteScenarioMutation';
import { useGetScenariosQuery } from './api/useScenariosQuery';
import ScenarioDeleteModal from './components/scenarioDeleteModal/ScenarioDeleteModal';
import ScenarioListRow from './components/scenarioList/ScenarioListRow';
import { SCENARIO_STATUS_FILTER_OPTIONS } from './constants/scenarioSettings';
import * as styles from './ScenarioListPage.css';

import type { ScenarioSummary } from './types/scenarioList';

type StatusFilter = (typeof SCENARIO_STATUS_FILTER_OPTIONS)[number]['value'];

const ScenarioListPage = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: scenarios = [], isPending, isError, refetch } = useGetScenariosQuery();
  const { data: buildings = [] } = useGetBuildingsQuery();
  const deleteScenarioMutation = useDeleteScenarioMutation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<ScenarioSummary | null>(null);
  const buildingNames = new Map(buildings.map((building) => [building.id, building.name]));

  const filteredScenarios = scenarios.filter(
    (scenario) => statusFilter === 'ALL' || scenario.status === statusFilter,
  );

  const navigateToCreate = () => void navigate(ROUTES.SCENARIO_CREATE);

  const handleOpen = (scenario: ScenarioSummary) => {
    void navigate(getScenarioDetailPath(scenario.id));
  };

  const handleDelete = (scenario: ScenarioSummary) => {
    if (!scenario.deletable) return;
    setDeleteTarget(scenario);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deleteScenarioMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        show({
          title: '시나리오가 삭제되었습니다.',
          description: `${deleteTarget.name}이(가) 삭제되었습니다.`,
          variant: 'success',
        });
        setDeleteTarget(null);
      },
      onError: () => {
        show({ title: '시나리오 삭제에 실패했습니다.', variant: 'error' });
      },
    });
  };

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
          >
            시나리오 추가
          </Button>
        </div>

        {isPending ? (
          <p className={styles.stateMessage}>불러오는 중...</p>
        ) : isError ? (
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
        ) : scenarios.length === 0 ? (
          <EmptyState
            className={styles.emptyState}
            icon={<FileTextIcon />}
            title="아직 등록된 시나리오가 없습니다."
          />
        ) : filteredScenarios.length > 0 ? (
          <div className={styles.list}>
            {filteredScenarios.map((scenario) => (
              <ScenarioListRow
                key={scenario.id}
                scenario={scenario}
                buildingName={buildingNames.get(scenario.buildingId)}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState className={styles.emptyState} title="선택한 상태의 시나리오가 없습니다." />
        )}
      </div>

      {deleteTarget ? (
        <ScenarioDeleteModal
          open
          scenarioName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          isSubmitting={deleteScenarioMutation.isPending}
        />
      ) : null}
    </>
  );
};

export default ScenarioListPage;
