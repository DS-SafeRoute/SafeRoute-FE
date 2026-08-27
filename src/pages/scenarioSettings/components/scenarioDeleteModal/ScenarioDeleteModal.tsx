import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './ScenarioDeleteModal.css';

interface ScenarioDeleteModalProps {
  open: boolean;
  scenarioName: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const ScenarioDeleteModal = ({
  open,
  scenarioName,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ScenarioDeleteModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    variant="confirm"
    className={styles.modal}
    confirmBodyClassName={styles.confirmBody}
    footerClassName={styles.footer}
    title="시나리오 삭제"
    description={`정말로 '${scenarioName}'을(를) 삭제하시겠습니까?`}
    warning="이 작업은 되돌릴 수 없습니다. 삭제된 시나리오와 관련된 모든 설정 정보가 영구적으로 삭제됩니다."
    footer={
      <>
        <Button type="button" variant="ghost" size="lg" onClick={onClose} disabled={isSubmitting}>
          취소
        </Button>
        <Button
          type="button"
          variant="danger"
          size="lg"
          onClick={onConfirm}
          isLoading={isSubmitting}
        >
          삭제
        </Button>
      </>
    }
  />
);

export default ScenarioDeleteModal;
