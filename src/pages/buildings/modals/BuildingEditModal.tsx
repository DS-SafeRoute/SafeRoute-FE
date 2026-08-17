import { useEffect, useState } from 'react';

import FloorStepperField from '@pages/buildings/components/FloorStepperField/FloorStepperField';

import type { UpdateBuildingRequest } from '@apis/__generated__/data-contracts';

import { Button } from '@components/Button';
import FilterChip from '@components/chip/FilterChip';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import { isPositiveInt } from '@shared/utils/validation';

import * as styles from './BuildingAddModal.css';
import { BUILDING_TYPE_OPTIONS } from '../constants/buildingType';

import type { Building, BuildingType } from '../types/buildings';

interface BuildingEditModalProps {
  open: boolean;
  onClose: () => void;
  building: Building;
  onConfirm: (body: UpdateBuildingRequest) => void;
  isSubmitting?: boolean;
}

interface FormState {
  name: string;
  address: string;
  buildingType: BuildingType;
  totalFloors: string;
}

const toFormState = (building: Building): FormState => ({
  name: building.name,
  address: building.address,
  buildingType: building.buildingType,
  totalFloors: String(building.totalFloors),
});

const BuildingEditModal = ({
  open,
  onClose,
  building,
  onConfirm,
  isSubmitting = false,
}: BuildingEditModalProps) => {
  const [form, setForm] = useState<FormState>(toFormState(building));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(building));
      setErrors({});
    }
  }, [open, building]);

  const handleChange = (field: 'name' | 'address') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleBuildingTypeChange = (value: BuildingType) => {
    setForm((prev) => ({ ...prev, buildingType: value }));
  };

  const handleFloorChange = (field: 'totalFloors') => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = '건물명을 입력해 주세요';
    else if (form.name.trim().length < 2 || form.name.trim().length > 20)
      next.name = '건물명은 2~20자로 입력해 주세요';
    if (!form.address.trim()) next.address = '주소를 입력해 주세요';
    else if (form.address.trim().length < 8 || form.address.trim().length > 100)
      next.address = '주소는 8~100자로 입력해 주세요';
    if (!form.totalFloors.trim()) next.totalFloors = '층수를 입력해 주세요';
    else if (!isPositiveInt(form.totalFloors)) next.totalFloors = '올바른 층수를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      name: form.name.trim(),
      address: form.address.trim(),
      buildingType: form.buildingType,
      totalFloors: Number(form.totalFloors),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="건물 정보 수정"
      description="건물 정보를 수정합니다"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleConfirm} isLoading={isSubmitting}>
            수정 완료
          </Button>
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
          label="주소 *"
          placeholder="서울특별시 강남구 테헤란로 123"
          value={form.address}
          onChange={handleChange('address')}
          errorMessage={errors.address}
        />
        <div className={styles.field}>
          <span className={styles.fieldLabel}>건물 유형 *</span>
          <div className={styles.chipRow}>
            {BUILDING_TYPE_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                selected={form.buildingType === option.value}
                onSelect={() => handleBuildingTypeChange(option.value)}
              />
            ))}
          </div>
        </div>
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
