import { useState } from 'react';

import { useGetScenariosQuery } from '@pages/scenarioSettings/api/useScenariosQuery';
import { SCENARIO_STATUS, SCENARIO_STATUS_VIEW } from '@pages/scenarioSettings/types/scenarioList';

import { Button } from '@components/Button';
import Dropdown from '@components/dropdown';
import type { DropdownOption } from '@components/dropdown';
import Modal from '@components/modal';

import * as styles from './IoTLightSettingsModal.css';

interface FireOriginScenarioModalProps {
  open: boolean;
  onClose: () => void;
  buildingId: string;
  onSelect: (scenarioId: string) => void;
}

// 발화점은 훈련 시작 전(DRAFT·READY)에만 지정하는 값이라, 진행 중·완료·오류 시나리오는 목록에서 제외함
const SELECTABLE_STATUSES: readonly string[] = [SCENARIO_STATUS.DRAFT, SCENARIO_STATUS.READY];

const FireOriginScenarioModal = ({
  open,
  onClose,
  buildingId,
  onSelect,
}: FireOriginScenarioModalProps) => {
  const { data: scenarios = [], isLoading, isError } = useGetScenariosQuery();
  const [scenarioId, setScenarioId] = useState('');

  const options: DropdownOption[] = scenarios
    .filter((s) => s.buildingId === buildingId && SELECTABLE_STATUSES.includes(s.status))
    .map((s) => ({ id: s.id, label: `${s.name} · ${SCENARIO_STATUS_VIEW[s.status].label}` }))
    .map(({ id, label }) => ({ value: id, label }));

  const handleClose = () => {
    setScenarioId('');
    onClose();
  };

  const handleConfirm = () => {
    if (!scenarioId) return;
    onSelect(scenarioId);
    setScenarioId('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="발화점 지정"
      description="발화점을 지정할 시나리오를 선택해 주세요"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            취소
          </Button>
          <Button disabled={!scenarioId} onClick={handleConfirm}>
            도면에서 지정하기
          </Button>
        </>
      }
    >
      <div className={styles.section}>
        <span className={styles.sectionTitle}>시나리오</span>
        {isLoading ? (
          <span className={styles.hint}>시나리오를 불러오는 중...</span>
        ) : isError ? (
          <span className={styles.hint}>시나리오 목록을 불러오지 못했습니다.</span>
        ) : options.length === 0 ? (
          <span className={styles.hint}>
            이 건물에 발화점을 지정할 수 있는 시나리오가 없습니다. 임시저장·준비완료 상태의
            시나리오만 지정할 수 있어요.
          </span>
        ) : (
          <Dropdown
            options={options}
            value={scenarioId}
            onChange={setScenarioId}
            placeholder="시나리오 선택"
          />
        )}
      </div>
    </Modal>
  );
};

export default FireOriginScenarioModal;
