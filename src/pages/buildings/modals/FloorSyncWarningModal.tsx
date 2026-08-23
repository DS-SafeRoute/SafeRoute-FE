import type { Floor } from '@pages/floorPlans/types/floorPlans';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import { formatFloor } from '@utils/floor';

interface FloorSyncWarningModalProps {
  open: boolean;
  onClose: () => void;
  buildingName: string;
  floorsToDelete: Floor[];
  onConfirm: () => void;
  isSubmitting?: boolean;
}

const FloorSyncWarningModal = ({
  open,
  onClose,
  buildingName,
  floorsToDelete,
  onConfirm,
  isSubmitting = false,
}: FloorSyncWarningModalProps) => {
  const sortedFloorsToDelete = [...floorsToDelete].sort((a, b) => b.floorNum - a.floorNum);
  const floorLabels = sortedFloorsToDelete.map((f) => formatFloor(f.floorNum)).join(', ');
  const floorsWithData = sortedFloorsToDelete.filter((f) => f.segmentationStatus !== 'NONE');
  const dataFloorLabels = floorsWithData.map((f) => formatFloor(f.floorNum)).join(', ');

  const description =
    floorsWithData.length > 0
      ? `'${buildingName}'의 ${floorLabels}가 삭제됩니다. 이 중 ${dataFloorLabels}에는 이미 등록된 도면이 있습니다.`
      : `'${buildingName}'의 ${floorLabels}가 삭제됩니다.`;

  return (
    <Modal
      variant="confirm"
      open={open}
      onClose={onClose}
      title="층수를 줄이면 도면 데이터가 삭제됩니다"
      description={description}
      warning="층수를 줄이면 해당 층의 도면 이미지·노드·CCTV·유도등 등 모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isSubmitting}>
            삭제하고 계속
          </Button>
        </>
      }
    />
  );
};

export default FloorSyncWarningModal;
