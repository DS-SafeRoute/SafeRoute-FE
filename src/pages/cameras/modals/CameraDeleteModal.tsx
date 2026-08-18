import { Button } from '@components/Button';
import Modal from '@components/modal';

import type { Camera } from '../types/cameras';

interface CameraDeleteModalProps {
  open: boolean;
  onClose: () => void;
  camera: Camera;
  onConfirm: () => void;
}

const CameraDeleteModal = ({ open, onClose, camera, onConfirm }: CameraDeleteModalProps) => (
  <Modal
    variant="confirm"
    open={open}
    onClose={onClose}
    title="카메라 삭제"
    description={`정말로 '${camera.name}'을(를) 삭제하시겠습니까?`}
    warning="이 작업은 되돌릴 수 없습니다. 카메라 및 스트림 정보가 영구적으로 삭제됩니다."
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

export default CameraDeleteModal;
