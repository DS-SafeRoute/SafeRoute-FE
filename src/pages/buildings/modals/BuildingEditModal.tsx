import { useEffect, useState } from 'react';

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
  floors: string;
}

const BuildingEditModal = ({ open, onClose, building, onConfirm }: BuildingEditModalProps) => {
  const [form, setForm] = useState<FormState>({
    name: building.name,
    floors: String(building.aboveFloors),
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (open) {
      setForm({ name: building.name, floors: String(building.aboveFloors) });
      setErrors({});
    }
  }, [open, building.id, building.name, building.aboveFloors]);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = '건물명을 입력해 주세요';
    if (!form.floors.trim()) next.floors = '층수를 입력해 주세요';
    else if (!isPositiveInt(form.floors)) next.floors = '올바른 층수를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      ...building,
      name: form.name.trim(),
      aboveFloors: Number(form.floors),
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

export default BuildingEditModal;
