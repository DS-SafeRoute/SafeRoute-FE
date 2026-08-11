import { useEffect } from 'react';

import { Button } from '@components/Button';
import Modal from '@components/modal/Modal';

import * as styles from './TrainingEndModal.css';

interface TrainingEndModalProps {
  open: boolean;
  onHome: () => void;
  onReport: () => void;
}

const TrainingEndModal = ({ open, onHome, onReport }: TrainingEndModalProps) => {
  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(onReport, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [onReport, open]);

  return (
    <Modal
      open={open}
      onClose={() => undefined}
      size="md"
      variant="confirm"
      className={styles.modal}
      icon={<span className={styles.successIcon}>✓</span>}
      title="훈련이 종료되었습니다"
      description="수고하셨습니다. 이번 훈련 결과를 확인해보세요"
      footer={
        <div className={styles.footerContent}>
          <div className={styles.actions}>
            <Button type="button" variant="ghost" size="lg" onClick={onHome}>
              홈으로
            </Button>
            <Button type="button" size="lg" onClick={onReport}>
              훈련 리포트 보기
            </Button>
          </div>
          <p className={styles.autoRedirect}>5초 후 자동으로 리포트 페이지로 이동합니다</p>
        </div>
      }
    />
  );
};

export default TrainingEndModal;
