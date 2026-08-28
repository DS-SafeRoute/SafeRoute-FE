import { useState } from 'react';

import type { CreateBuildingRequest } from '@apis/__generated__/data-contracts';

import { Button } from '@components/Button';
import FilterChip from '@components/chip/FilterChip';
import RequiredFieldText from '@components/inputField/RequiredFieldText';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import * as styles from './buildingForm.css';
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
}

const INITIAL_FORM: FormState = {
  name: '',
  address: '',
  buildingType: 'CLASSROOM',
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

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = '건물명을 입력해 주세요';
    else if (form.name.trim().length < 2 || form.name.trim().length > 20)
      next.name = '건물명은 2~20자로 입력해 주세요';
    if (!form.address.trim()) next.address = '주소를 입력해 주세요';
    else if (form.address.trim().length < 8 || form.address.trim().length > 100)
      next.address = '주소는 8~100자로 입력해 주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      name: form.name.trim(),
      address: form.address.trim(),
      buildingType: form.buildingType,
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
      </div>
    </Modal>
  );
};

export default BuildingAddModal;
