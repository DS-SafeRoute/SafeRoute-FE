import { useState } from 'react';

import FloorStepperField from '@pages/buildings/components/FloorStepperField/FloorStepperField';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import { isNonNegativeInt, isPositiveInt } from '@shared/utils/validation';

import * as styles from './BuildingAddModal.css';

import type { Building } from '../types/buildings';

interface BuildingAddModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (building: Omit<Building, 'id'>) => void;
}

interface FormState {
  name: string;
  aboveFloors: string;
  belowFloors: string;
}

const INITIAL_FORM: FormState = { name: '', aboveFloors: '1', belowFloors: '0' };

const BuildingAddModal = ({ open, onClose, onConfirm }: BuildingAddModalProps) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFloorChange = (field: 'aboveFloors' | 'belowFloors') => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = '건물명을 입력해 주세요';
    if (!form.aboveFloors.trim()) next.aboveFloors = '지상 층수를 입력해 주세요';
    else if (!isPositiveInt(form.aboveFloors)) next.aboveFloors = '올바른 층수를 입력해 주세요';
    if (form.belowFloors.trim() && !isNonNegativeInt(form.belowFloors))
      next.belowFloors = '올바른 층수를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const totalFloors =
      Number(form.aboveFloors) + (form.belowFloors.trim() ? Number(form.belowFloors) : 0);
    onConfirm({
      name: form.name.trim(),
      // TODO(#54): buildingType/address 입력 필드는 다음 커밋에서 추가 예정
      address: '',
      buildingType: 'CLASSROOM',
      totalFloors,
      isActive: true,
      lastTrainedAt: null,
    });
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="건물 추가"
      description="새 건물 정보를 입력합니다"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleConfirm}>추가 완료</Button>
        </>
      }
    >
      <div className={styles.form}>
        <TextField
          label="건물명 *"
          placeholder="A동 · 본관"
          value={form.name}
          onChange={handleChange('name')}
          errorMessage={errors.name}
        />
        <div className={styles.floorRow}>
          <FloorStepperField
            label="지상 *"
            value={form.aboveFloors}
            onChange={handleFloorChange('aboveFloors')}
            min={1}
            errorMessage={errors.aboveFloors}
          />
          <FloorStepperField
            label="지하"
            value={form.belowFloors}
            onChange={handleFloorChange('belowFloors')}
            min={0}
            errorMessage={errors.belowFloors}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BuildingAddModal;
