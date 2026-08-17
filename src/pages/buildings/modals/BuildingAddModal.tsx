import { useState } from 'react';

import FloorStepperField from '@pages/buildings/components/FloorStepperField/FloorStepperField';

import type { CreateBuildingRequest } from '@apis/__generated__/data-contracts';

import { Button } from '@components/Button';
import FilterChip from '@components/chip/FilterChip';
import RequiredFieldText from '@components/inputField/RequiredFieldText';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import { isNonNegativeInt, isPositiveInt } from '@shared/utils/validation';

import * as styles from './BuildingAddModal.css';
import { BUILDING_TYPE_OPTIONS } from '../constants/buildingType';

import type { BuildingType } from '../types/buildings';

interface BuildingAddModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (body: CreateBuildingRequest) => void;
  isSubmitting?: boolean;
}

interface FormState {
  name: string;
  address: string;
  buildingType: BuildingType;
  aboveFloors: string;
  belowFloors: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  address: '',
  buildingType: 'CLASSROOM',
  aboveFloors: '1',
  belowFloors: '0',
};

const BuildingAddModal = ({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: BuildingAddModalProps) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

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
    const totalFloors =
      Number(form.aboveFloors) + (form.belowFloors.trim() ? Number(form.belowFloors) : 0);
    onConfirm({
      name: form.name.trim(),
      address: form.address.trim(),
      buildingType: form.buildingType,
      totalFloors,
    });
    // 성공 시 부모가 모달을 닫아 이 컴포넌트가 언마운트되며 폼이 자연히 초기화됨.
    // 실패 시에는 입력값을 잃지 않도록 여기서 리셋하지 않음.
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
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleConfirm} isLoading={isSubmitting}>
            추가 완료
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
          <span className={styles.fieldLabel}>
            <RequiredFieldText label="건물 유형 *" />
          </span>
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
