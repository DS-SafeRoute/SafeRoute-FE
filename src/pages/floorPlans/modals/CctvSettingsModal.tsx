import { useEffect, useState } from 'react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './IoTLightSettingsModal.css';

import type { Cctv } from '../api/cctvApi';

interface CctvSettingsModalProps {
  open: boolean;
  onClose: () => void;
  cctv: Cctv;
  isSaving?: boolean;
  onSaveName: (name: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onEditCells: () => void;
}

// 이름 수정과 활성화·감시영역 설정이 카드의 "수정"/"설정" 두 버튼으로 나뉘어 있어 어색했던 걸
// 하나의 모달로 합침 — CCTV에 대해 할 수 있는 일을 여기서 모두 처리함
const CctvSettingsModal = ({
  open,
  onClose,
  cctv,
  isSaving = false,
  onSaveName,
  onToggleEnabled,
  onEditCells,
}: CctvSettingsModalProps) => {
  const [name, setName] = useState(cctv.name);

  // 다른 CCTV를 열거나 서버 값이 갱신되면 입력값도 맞춰줌
  useEffect(() => {
    setName(cctv.name);
  }, [cctv.id, cctv.name]);

  const trimmedName = name.trim();
  const isNameChanged = trimmedName !== cctv.name;
  const canSave = trimmedName.length > 0 && isNameChanged && !isSaving;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="CCTV 수정"
      description={cctv.code}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
          <Button disabled={!canSave} isLoading={isSaving} onClick={() => onSaveName(trimmedName)}>
            저장
          </Button>
        </>
      }
    >
      <div className={styles.section}>
        <span className={styles.sectionTitle}>이름</span>
        <input
          className={styles.textInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="CCTV-A3-05"
        />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>활성화 상태</span>
        <div className={styles.rowButtons}>
          <button
            type="button"
            className={
              cctv.enabled
                ? `${styles.toggleButton} ${styles.toggleButtonActive}`
                : styles.toggleButton
            }
            onClick={() => onToggleEnabled(true)}
          >
            사용 가능
          </button>
          <button
            type="button"
            className={
              !cctv.enabled
                ? `${styles.toggleButton} ${styles.toggleButtonActive}`
                : styles.toggleButton
            }
            onClick={() => onToggleEnabled(false)}
          >
            사용 불가능
          </button>
        </div>
        <span className={styles.hint}>
          사용 불가능으로 두면 훈련 중 이 카메라의 혼잡 감지를 사용하지 않습니다.
        </span>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>감시 영역</span>
        <span className={styles.hint}>
          현재 {cctv.monitoredGridCellCount}칸 · {cctv.monitoredAreaM2}㎡ 모니터링 중
        </span>
        <div className={styles.saveRow}>
          <Button size="sm" onClick={onEditCells}>
            감시 영역 재선택
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CctvSettingsModal;
