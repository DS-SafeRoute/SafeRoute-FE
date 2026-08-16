import { Button } from '@components/Button';
import Modal from '@components/modal';

import { formatFloor } from '@utils/floor';

interface FloorDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  buildingName: string;
  floorNum: number;
  onConfirm: () => void;
}

const FloorDeleteConfirmModal = ({
  open,
  onClose,
  buildingName,
  floorNum,
  onConfirm,
}: FloorDeleteConfirmModalProps) => (
  <Modal
    variant="confirm"
    open={open}
    onClose={onClose}
    title="도면 삭제"
    description={`'${buildingName}'의 ${formatFloor(floorNum)} 도면을 삭제하시겠습니까?`}
    warning="이 작업은 되돌릴 수 없습니다. 도면 이미지와 지정된 노드·구역 등 편집 내용이 모두 영구적으로 삭제됩니다."
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

export default FloorDeleteConfirmModal;
