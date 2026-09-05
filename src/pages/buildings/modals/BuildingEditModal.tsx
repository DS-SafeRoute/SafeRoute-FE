import { useEffect, useState } from 'react';

import FloorStepperField from '@pages/buildings/components/FloorStepperField/FloorStepperField';

import type { UpdateBuildingRequest } from '@apis/__generated__/data-contracts';
import type { Building, BuildingType } from '@apis/buildings/buildingTypes';

import { Button } from '@components/Button';
import FilterChip from '@components/chip/FilterChip';
import RequiredFieldText from '@components/inputField/RequiredFieldText';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import { isNonNegativeInt, isPositiveInt } from '@shared/utils/validation';

import * as styles from './buildingForm.css';
import { BUILDING_TYPE_OPTIONS } from '../constants/buildingType';

import type { FloorCounts } from '../utils/floorSync';

interface BuildingEditModalProps {
  open: boolean;
  onClose: () => void;
  building: Building;
  onConfirm: (body: UpdateBuildingRequest, floorCounts: FloorCounts) => void;
  isSubmitting?: boolean;
}

interface FormState {
  name: string;
  address: string;
  buildingType: BuildingType;
  aboveFloors: string;
  belowFloors: string;
}

const toFormState = (building: Building): FormState => ({
  name: building.name,
  address: building.address,
  buildingType: building.buildingType,
  aboveFloors: String(building.groundFloorCount),
  belowFloors: String(building.basementFloorCount),
});

// 원래 값과 하나라도 다른 게 있어야 수정할 내용이 있는 것 — 앞뒤 공백만 다른 건 무시함
const isFormDirty = (form: FormState, original: FormState): boolean =>
  form.name.trim() !== original.name.trim() ||
  form.address.trim() !== original.address.trim() ||
  form.buildingType !== original.buildingType ||
  form.aboveFloors.trim() !== original.aboveFloors.trim() ||
  form.belowFloors.trim() !== original.belowFloors.trim();

const BuildingEditModal = ({
  open,
  onClose,
  building,
  onConfirm,
  isSubmitting = false,
}: BuildingEditModalProps) => {
  const [form, setForm] = useState<FormState>(toFormState(building));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const isDirty = isFormDirty(form, toFormState(building));

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

  const handleFloorChange = (field: 'aboveFloors' | 'belowFloors') => (value: string) => {
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
    if (!form.aboveFloors.trim()) next.aboveFloors = '지상 층수를 입력해 주세요';
    else if (!isPositiveInt(form.aboveFloors)) next.aboveFloors = '올바른 층수를 입력해 주세요';
    if (form.belowFloors.trim() && !isNonNegativeInt(form.belowFloors))
      next.belowFloors = '올바른 층수를 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm(
      {
        name: form.name.trim(),
        address: form.address.trim(),
        buildingType: form.buildingType,
      },
      {
        aboveFloors: Number(form.aboveFloors),
        belowFloors: form.belowFloors.trim() ? Number(form.belowFloors) : 0,
      },
    );
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
          <Button onClick={handleConfirm} isLoading={isSubmitting} disabled={!isDirty}>
            수정
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
          <span id="building-type-label" className={styles.fieldLabel}>
            <RequiredFieldText label="건물 유형 *" />
          </span>
          <div className={styles.chipRow} role="group" aria-labelledby="building-type-label">
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

export default BuildingEditModal;
