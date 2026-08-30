import { useEffect, useState, type FormEvent } from 'react';

import type { GenerateTrainingReportRequest } from '@apis/reports/reportTypes';

import { Button } from '@components/Button';
import TextField from '@components/inputField/TextField';
import Modal from '@components/modal/Modal';

import * as styles from './TrainingEndModal.css';

interface TrainingEndModalProps {
  open: boolean;
  completed: boolean;
  participantCount: number;
  isSubmitting: boolean;
  canClose: boolean;
  onClose: () => void;
  onSubmit: (values: GenerateTrainingReportRequest) => Promise<void>;
  onHome: () => void;
  onReport: () => void;
}

interface FieldErrors {
  participantCount?: string;
  survivorCount?: string;
}

const TrainingEndModal = ({
  open,
  completed,
  participantCount,
  isSubmitting,
  canClose,
  onClose,
  onSubmit,
  onHome,
  onReport,
}: TrainingEndModalProps) => {
  const [survivorCount, setSurvivorCount] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;

    setSurvivorCount('');
    setErrors({});
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedSurvivorCount = Number(survivorCount);
    const nextErrors: FieldErrors = {};

    if (!Number.isInteger(participantCount) || participantCount < 1) {
      nextErrors.participantCount = '총 참가 인원을 1명 이상 입력해 주세요.';
    }

    if (!Number.isInteger(parsedSurvivorCount) || parsedSurvivorCount < 0) {
      nextErrors.survivorCount = '생존 인원을 0명 이상 입력해 주세요.';
    } else if (Number.isInteger(participantCount) && parsedSurvivorCount > participantCount) {
      nextErrors.survivorCount = '생존 인원은 총 참가 인원보다 많을 수 없습니다.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      participantCount,
      survivorCount: parsedSurvivorCount,
    });
  };

  if (completed) {
    return (
      <Modal
        open={open}
        onClose={() => undefined}
        size="md"
        variant="confirm"
        className={styles.modal}
        confirmBodyClassName={styles.confirmBody}
        icon={<span className={styles.successIcon}>✓</span>}
        title="분석 보고서가 생성되었습니다"
        description="훈련 결과가 저장되었습니다. 이동할 페이지를 선택해 주세요."
        footer={
          <div className={styles.actions}>
            <Button type="button" variant="ghost" size="lg" onClick={onHome}>
              홈으로
            </Button>
            <Button type="button" size="lg" onClick={onReport}>
              분석 보고서 보기
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <Modal
      open={open}
      onClose={canClose && !isSubmitting ? onClose : () => undefined}
      showCloseButton={canClose && !isSubmitting}
      size="md"
      className={styles.modal}
      title="훈련 결과 입력"
      description="예상 참가 인원을 확인하고 훈련 종료 시점의 생존 인원을 입력해 주세요."
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onClose}
            disabled={!canClose || isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" size="lg" form="training-result-form" isLoading={isSubmitting}>
            훈련 종료 및 보고서 생성
          </Button>
        </>
      }
    >
      <form id="training-result-form" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGrid}>
          <TextField
            label="총 참가 인원"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="예: 52"
            value={participantCount}
            errorMessage={errors.participantCount}
            readOnly
          />
          <TextField
            label="생존 인원"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="예: 50"
            value={survivorCount}
            errorMessage={errors.survivorCount}
            onChange={(event) => setSurvivorCount(event.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
        </div>
        <p className={styles.helperText}>
          총 참가 인원은 시나리오의 예상 참가 인원이며, 생존 인원에는 안전하게 대피를 완료한 인원을
          입력해 주세요.
        </p>
      </form>
    </Modal>
  );
};

export default TrainingEndModal;
