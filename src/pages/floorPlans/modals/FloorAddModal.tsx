import { useId, useState } from 'react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './FloorAddModal.css';

interface FloorAddModalProps {
  open: boolean;
  onClose: () => void;
  buildingName: string;
  onConfirm: (floorNum: number) => void;
}

const FloorAddModal = ({ open, onClose, buildingName, onConfirm }: FloorAddModalProps) => {
  const [floorNum, setFloorNum] = useState('');
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || /^-?\d+$/.test(raw)) setFloorNum(raw);
  };

  const handleClose = () => {
    setFloorNum('');
    onClose();
  };

  const isValid = floorNum !== '' && Number(floorNum) !== 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onConfirm(Number(floorNum));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="층 추가"
      description={buildingName}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            취소
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            추가
          </Button>
        </>
      }
    >
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={inputId}>
          층 번호
        </label>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="numeric"
          placeholder="3"
          value={floorNum}
          onChange={handleChange}
        />
        <span className={styles.hint}>지하층은 음수로 입력해주세요 (예: 지하 1층 → -1)</span>
      </div>
    </Modal>
  );
};

export default FloorAddModal;
