import { useEffect, useState } from 'react';

import FloorStepperField from '@pages/buildings/components/FloorStepperField/FloorStepperField';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import { isPositiveInt } from '@shared/utils/validation';

import * as styles from './BuildingAddModal.css';

import type { Building } from '../types/buildings';

interface BuildingEditModalProps {
  open: boolean;
  onClose: () => void;
  building: Building;
  onConfirm: (updated: Building) => void;
}

interface FormState {
  name: string;
  totalFloors: string;
}

const toFormState = (building: Building): FormState => ({
  name: building.name,
  totalFloors: String(building.totalFloors),
});

const BuildingEditModal = ({ open, onClose, building, onConfirm }: BuildingEditModalProps) => {
  const [form, setForm] = useState<FormState>(toFormState(building));
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(building));
      setErrors({});
    }
  }, [open, building]);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFloorChange = (field: 'totalFloors') => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = '건물명을 입력해 주세요';
    if (!form.totalFloors.trim()) next.totalFloors = '층수를 입력해 주세요';
    else if (!isPositiveInt(form.totalFloors)) next.totalFloors = '올바른 층수를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      ...building,
      name: form.name.trim(),
      totalFloors: Number(form.totalFloors),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="건물 정보 수정"
      description="건물명과 층수를 수정합니다"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleConfirm}>수정 완료</Button>
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
            label="층수 *"
            value={form.totalFloors}
            onChange={handleFloorChange('totalFloors')}
            min={1}
            errorMessage={errors.totalFloors}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BuildingEditModal;
