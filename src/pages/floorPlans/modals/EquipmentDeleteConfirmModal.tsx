import { Button } from '@components/Button';
import Modal from '@components/modal';

interface EquipmentDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  onConfirm: () => void;
}

const EquipmentDeleteConfirmModal = ({
  open,
  onClose,
  label,
  onConfirm,
}: EquipmentDeleteConfirmModalProps) => (
  <Modal
    variant="confirm"
    open={open}
    onClose={onClose}
    title="장비 삭제"
    description={`'${label}'을(를) 삭제하시겠습니까?`}
    warning="경고: 이 작업은 되돌릴 수 없습니다. 도면에서 해당 장비 노드가 제거됩니다."
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          삭제
        </Button>
      </>
    }
  />
);

export default EquipmentDeleteConfirmModal;
