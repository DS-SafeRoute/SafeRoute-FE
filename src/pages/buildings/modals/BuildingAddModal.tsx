import { useState } from 'react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import { isPositiveInt, isPositiveNumber } from '@shared/utils/validation';

import * as styles from './BuildingAddModal.css';

import type { Building } from '../types/buildings';

interface BuildingAddModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (building: Omit<Building, 'id'>) => void;
}

interface FormState {
  name: string;
  area: string;
  floors: string;
}

const INITIAL_FORM: FormState = { name: '', area: '', floors: '' };

const BuildingAddModal = ({ open, onClose, onConfirm }: BuildingAddModalProps) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = '건물명을 입력해 주세요';
    if (!form.area.trim()) next.area = '면적을 입력해 주세요';
    else if (!isPositiveNumber(form.area)) next.area = '올바른 면적을 입력해 주세요';
    if (!form.floors.trim()) next.floors = '층수를 입력해 주세요';
    else if (!isPositiveInt(form.floors)) next.floors = '올바른 층수를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      name: form.name.trim(),
      area: Number(form.area),
      status: 'normal',
      lastTrainingDate: '-',
      aboveFloors: Number(form.floors),
      belowFloors: 0,
      floorPlans: [],
      cctvTotal: 0,
      cctvOnline: 0,
      iotTotal: 0,
      iotOnline: 0,
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
        <TextField
          label="연면적(m²) *"
          placeholder="12,500"
          value={form.area}
          onChange={handleChange('area')}
          errorMessage={errors.area}
        />
        <TextField
          label="층수 *"
          placeholder="5"
          value={form.floors}
          onChange={handleChange('floors')}
          errorMessage={errors.floors}
        />
      </div>
    </Modal>
  );
};

export default BuildingAddModal;
