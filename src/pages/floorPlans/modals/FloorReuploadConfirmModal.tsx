import { Button } from '@components/Button';
import Modal from '@components/modal';

import { formatFloor } from '@utils/floor';

interface FloorReuploadConfirmModalProps {
  open: boolean;
  onClose: () => void;
  floorNum: number;
  onConfirm: () => void;
}

const FloorReuploadConfirmModal = ({
  open,
  onClose,
  floorNum,
  onConfirm,
}: FloorReuploadConfirmModalProps) => (
  <Modal
    variant="confirm"
    open={open}
    onClose={onClose}
    title="도면 재업로드"
    description={`'${formatFloor(floorNum)}' 도면을 재업로드하시겠습니까?`}
    warning="경고: 재업로드하면 현재 도면에 지정된 노드·구역 등 편집 내용이 모두 삭제되며 되돌릴 수 없습니다."
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button onClick={onConfirm}>재업로드</Button>
      </>
    }
  />
);

export default FloorReuploadConfirmModal;
