import { Button } from '@components/Button';
import Modal from '@components/modal';

import { formatFloor } from '@utils/floor';

import * as styles from './FloorManageModal.css';

import type { Floor } from '../types/floorPlans';

interface FloorManageModalProps {
  open: boolean;
  onClose: () => void;
  buildingName: string;
  floors: Floor[];
  onUpload: (floor: Floor) => void;
  onReupload: (floor: Floor) => void;
  onDelete: (floor: Floor) => void;
}

const floorBadgeLabel = (n: number) => (n > 0 ? `${n}F` : `B${Math.abs(n)}`);

const FloorManageModal = ({
  open,
  onClose,
  buildingName,
  floors,
  onUpload,
  onReupload,
  onDelete,
}: FloorManageModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    size="lg"
    title={`${buildingName} 층별 관리`}
    description="각 층별 도면을 업로드하거나 삭제할 수 있습니다"
    footer={
      <Button variant="ghost" onClick={onClose} style={{ width: '100%' }}>
        닫기
      </Button>
    }
  >
    <div className={styles.list}>
      {[...floors]
        .sort((a, b) => b.floorNum - a.floorNum)
        .map((floor) => {
          const isUploaded = floor.segmentationStatus !== 'NONE';
          return (
            <div key={floor.id} className={styles.row}>
              <div className={styles.rowLeft}>
                <div className={styles.floorBadge}>{floorBadgeLabel(floor.floorNum)}</div>
                <div className={styles.rowInfo}>
                  <span className={styles.rowFloorName}>{formatFloor(floor.floorNum)}</span>
                  <span className={isUploaded ? styles.rowStatusDone : styles.rowStatus}>
                    {isUploaded ? '도면 업로드 완료' : '도면 미업로드'}
                  </span>
                </div>
              </div>
              <div className={styles.rowActions}>
                {isUploaded ? (
                  <>
                    <button
                      type="button"
                      className={styles.reuploadButton}
                      onClick={() => onReupload(floor)}
                    >
                      재업로드
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => onDelete(floor)}
                    >
                      삭제
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => onUpload(floor)}
                  >
                    업로드
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  </Modal>
);

export default FloorManageModal;
