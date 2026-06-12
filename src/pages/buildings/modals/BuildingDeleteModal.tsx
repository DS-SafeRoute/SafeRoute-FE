import { Button } from '@components/Button';
import Modal from '@components/modal';

import type { Building } from '../types/buildings';

interface BuildingDeleteModalProps {
  open: boolean;
  onClose: () => void;
  building: Building;
  onConfirm: () => void;
}

const BuildingDeleteModal = ({ open, onClose, building, onConfirm }: BuildingDeleteModalProps) => (
  <Modal
    variant="confirm"
    open={open}
    onClose={onClose}
    title="건물 삭제"
    description={`정말로 '${building.name}'을(를) 삭제하시겠습니까?`}
    warning="경고: 이 작업은 되돌릴 수 없습니다. 건물과 관련된 모든 도면 데이터가 영구적으로 삭제됩니다."
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

export default BuildingDeleteModal;
