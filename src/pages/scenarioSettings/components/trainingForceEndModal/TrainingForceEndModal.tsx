import { Button } from '@components/Button';
import Modal from '@components/modal';

interface TrainingForceEndModalProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TrainingForceEndModal = ({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: TrainingForceEndModalProps) => {
  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      variant="confirm"
      title="오류로 훈련 중단"
      description="장비 또는 서버 오류로 정상 종료할 수 없을 때 사용합니다."
      warning="중단한 훈련은 ‘오류’ 상태로 기록됩니다."
      footer={
        <>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isSubmitting}>
            오류로 중단
          </Button>
        </>
      }
    />
  );
};

export default TrainingForceEndModal;
