import { useState } from 'react';

import { useNavigate } from 'react-router';

import FileTextIcon from '@assets/icons/ic-filetext.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';

import { Button } from '@components/Button';
import Dropdown from '@components/dropdown';
import useToast from '@components/toast/useToast';

import { ROUTES, getScenarioDetailPath } from '@constants/path';

import ScenarioDeleteModal from './components/scenarioDeleteModal/ScenarioDeleteModal';
import ScenarioListRow from './components/scenarioList/ScenarioListRow';
import { scenarioListData, scenarioStatusFilterOptions } from './mocks/scenarioListData';
import * as styles from './ScenarioListPage.css';

import type { ScenarioSummary } from './types/scenarioList';

type StatusFilter = (typeof scenarioStatusFilterOptions)[number]['value'];

const ScenarioListPage = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const [scenarios, setScenarios] = useState(scenarioListData);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<ScenarioSummary | null>(null);

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

    setScenarios((current) => current.filter((scenario) => scenario.id !== deleteTarget.id));
    show({
      title: '시나리오가 삭제되었습니다.',
      description: `${deleteTarget.name}이(가) 삭제되었습니다.`,
      variant: 'success',
    });
    setDeleteTarget(null);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <Dropdown
            shape="rounded"
            options={scenarioStatusFilterOptions}
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

        {scenarios.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <FileTextIcon />
            </span>
            <div className={styles.emptyText}>
              <strong className={styles.emptyTitle}>생성된 시나리오가 없습니다.</strong>
              <p className={styles.emptyDescription}>
                첫 번째 훈련 시나리오를 만들어 훈련을 준비해 보세요.
              </p>
            </div>
            <Button type="button" leftIcon={<PlusIcon />} onClick={navigateToCreate}>
              시나리오 만들기
            </Button>
          </div>
        ) : filteredScenarios.length > 0 ? (
          <div className={styles.list}>
            {filteredScenarios.map((scenario) => (
              <ScenarioListRow
                key={scenario.id}
                scenario={scenario}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className={styles.filterEmpty}>선택한 상태의 시나리오가 없습니다.</div>
        )}
      </div>

      {deleteTarget ? (
        <ScenarioDeleteModal
          open
          scenarioName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </>
  );
};

export default ScenarioListPage;
