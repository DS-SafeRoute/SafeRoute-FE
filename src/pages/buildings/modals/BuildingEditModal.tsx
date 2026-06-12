import { useEffect, useState } from 'react';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

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
  area: string;
}

const isPositiveNumber = (v: string) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) > 0;

const BuildingEditModal = ({ open, onClose, building, onConfirm }: BuildingEditModalProps) => {
  const [form, setForm] = useState<FormState>({
    name: building.name,
    area: String(building.area),
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (open) {
      setForm({ name: building.name, area: String(building.area) });
      setErrors({});
    }
  }, [open, building]);

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = '건물명을 입력해 주세요';
    if (!form.area.trim()) next.area = '면적을 입력해 주세요';
    else if (!isPositiveNumber(form.area)) next.area = '올바른 면적을 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      ...building,
      name: form.name.trim(),
      area: Number(form.area),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="건물 정보 수정"
      description={`'${building.name}' 정보를 수정합니다`}
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
          label="연면적(m²) *"
          placeholder="12,500"
          value={form.area}
          onChange={handleChange('area')}
          errorMessage={errors.area}
        />
      </div>
    </Modal>
  );
};

export default BuildingEditModal;
