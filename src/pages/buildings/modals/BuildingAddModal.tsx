import { useState } from 'react';

import FloorStepperField from '@pages/buildings/components/FloorStepperField/FloorStepperField';

import type { CreateBuildingRequest } from '@apis/__generated__/data-contracts';
import type { BuildingType } from '@apis/buildings/buildingTypes';

import { Button } from '@components/Button';
import FilterChip from '@components/chip/FilterChip';
import RequiredFieldText from '@components/inputField/RequiredFieldText';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal';

import { isNonNegativeInt, isPositiveInt } from '@shared/utils/validation';

import * as styles from './buildingForm.css';
import { BUILDING_TYPE_OPTIONS } from '../constants/buildingType';

import type { FloorCounts } from '../utils/floorSync';

interface BuildingAddModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (body: CreateBuildingRequest, floorCounts: FloorCounts) => void;
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

// 필드별 통과 여부와 에러 문구를 한 곳에서 판정 — isFormValid(버튼 활성화 조건)와 화면에 보여줄
// 에러 문구가 서로 다른 기준으로 갈라지지 않게 함
const computeFieldErrors = (form: FormState): Partial<Record<keyof FormState, string>> => {
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
  return next;
};

const BuildingAddModal = ({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: BuildingAddModalProps) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  // "추가" 버튼이 비활성 상태라 handleConfirm(및 그 안의 validate)이 아예 호출되지 않아, 값을
  // 잘못 입력해도 왜 버튼이 안 눌리는지 안내 문구가 하나도 안 뜨던 문제 — 필드를 직접 건드린
  // 뒤부터는 실시간으로 에러를 보여주도록 touched를 따로 추적함(건드리기 전엔 빈 폼에도
  // 에러가 먼저 뜨지 않게)
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, true>>>({});
  const fieldErrors = computeFieldErrors(form);
  const errors: Partial<Record<keyof FormState, string>> = {};
  (Object.keys(fieldErrors) as (keyof FormState)[]).forEach((key) => {
    if (touched[key]) errors[key] = fieldErrors[key];
  });

  const handleChange = (field: 'name' | 'address') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBuildingTypeChange = (value: BuildingType) => {
    setForm((prev) => ({ ...prev, buildingType: value }));
  };

  const handleFloorChange = (field: 'aboveFloors' | 'belowFloors') => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // isFormValid(버튼 활성화 조건)는 computeFieldErrors와 같은 기준을 그대로 따름
  const isFormValid = Object.keys(fieldErrors).length === 0;

  const handleConfirm = () => {
    if (!isFormValid) return;
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
    // 성공 시 부모가 모달을 닫아 이 컴포넌트가 언마운트되며 폼이 자연히 초기화됨.
    // 실패 시에는 입력값을 잃지 않도록 여기서 리셋하지 않음.
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setTouched({});
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
          <Button onClick={handleConfirm} isLoading={isSubmitting} disabled={!isFormValid}>
            추가
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

export default BuildingAddModal;
