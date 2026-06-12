import { useEffect, useState } from 'react';

import EditIcon from '@assets/icons/ic-edit.svg?react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './FloorPlanModal.css';

import type { Building } from '../types/buildings';

interface FloorPlanModalProps {
  open: boolean;
  onClose: () => void;
  building: Building;
  onUpdate: (
    buildingId: number,
    patch: Partial<Pick<Building, 'aboveFloors' | 'belowFloors' | 'floorPlans'>>,
  ) => void;
}

type ConfirmState =
  | { type: 'deleteFloor'; floor: number }
  | { type: 'removeAbove'; next: number; affected: number[] }
  | { type: 'removeBelow'; next: number; affected: number[] }
  | null;

const floorLabel = (floor: number) => (floor > 0 ? `${floor}층` : `B${Math.abs(floor)}층`);
const floorBadgeLabel = (floor: number) => (floor > 0 ? `${floor}F` : `B${Math.abs(floor)}`);

const FloorPlanModal = ({ open, onClose, building, onUpdate }: FloorPlanModalProps) => {
  const [uploadedFloors, setUploadedFloors] = useState<number[]>(building.floorPlans);
  const [aboveFloors, setAboveFloors] = useState(building.aboveFloors);
  const [belowFloors, setBelowFloors] = useState(building.belowFloors);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [isEditingFloors, setIsEditingFloors] = useState(false);

  useEffect(() => {
    if (open) {
      setUploadedFloors(building.floorPlans);
      setAboveFloors(building.aboveFloors);
      setBelowFloors(building.belowFloors);
      setConfirm(null);
      setIsEditingFloors(false);
    }
  }, [open, building]);

  const isUploaded = (floor: number) => uploadedFloors.includes(floor);

  const handleUpload = (floor: number) => {
    const next = [...uploadedFloors, floor];
    setUploadedFloors(next);
    onUpdate(building.id, { floorPlans: next });
  };

  const handleFloorDelete = (floor: number) => setConfirm({ type: 'deleteFloor', floor });

  const handleConfirmFloorDelete = () => {
    if (confirm?.type !== 'deleteFloor') return;
    const next = uploadedFloors.filter((f) => f !== confirm.floor);
    setUploadedFloors(next);
    onUpdate(building.id, { floorPlans: next });
    setConfirm(null);
  };

  // 지상층 증감
  const handleAboveChange = (delta: number) => {
    const next = aboveFloors + delta;
    if (next < 1) return;
    if (delta < 0) {
      const affected = uploadedFloors.filter((f) => f > next && f > 0);
      if (affected.length > 0) {
        setConfirm({ type: 'removeAbove', next, affected });
        return;
      }
    }
    setAboveFloors(next);
    onUpdate(building.id, { aboveFloors: next });
  };

  // 지하층 증감
  const handleBelowChange = (delta: number) => {
    const next = belowFloors + delta;
    if (next < 0) return;
    if (delta < 0) {
      const affected = uploadedFloors.filter((f) => f < -next + 1 && f < 0);
      if (affected.length > 0) {
        setConfirm({ type: 'removeBelow', next, affected });
        return;
      }
    }
    setBelowFloors(next);
    onUpdate(building.id, { belowFloors: next });
  };

  const handleConfirmFloorChange = () => {
    if (!confirm) return;
    if (confirm.type === 'removeAbove') {
      const next = uploadedFloors.filter((f) => !(f > confirm.next && f > 0));
      setUploadedFloors(next);
      setAboveFloors(confirm.next);
      onUpdate(building.id, { aboveFloors: confirm.next, floorPlans: next });
    } else if (confirm.type === 'removeBelow') {
      const next = uploadedFloors.filter((f) => !(f < -confirm.next + 1 && f < 0));
      setUploadedFloors(next);
      setBelowFloors(confirm.next);
      onUpdate(building.id, { belowFloors: confirm.next, floorPlans: next });
    }
    setConfirm(null);
  };

  const aboveList = Array.from({ length: aboveFloors }, (_, i) => aboveFloors - i);
  const belowList = Array.from({ length: belowFloors }, (_, i) => -(i + 1));
  const floors = [...aboveList, ...belowList];

  const confirmDescription = () => {
    if (!confirm) return '';
    if (confirm.type === 'deleteFloor')
      return `${floorLabel(confirm.floor)} 도면을 삭제하시겠습니까?`;
    return `${confirm.affected.map(floorLabel).join(', ')}에 업로드된 도면이 삭제됩니다. 계속하시겠습니까?`;
  };

  const handleConfirmAction = () => {
    if (confirm?.type === 'deleteFloor') handleConfirmFloorDelete();
    else handleConfirmFloorChange();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`${building.name} 층별 관리`}
        description="층 구성을 변경하거나 도면을 업로드할 수 있습니다"
        size="lg"
        footer={
          <Button variant="ghost" onClick={onClose} style={{ width: '100%' }}>
            닫기
          </Button>
        }
      >
        {/* 층 구성 */}
        <div className={styles.floorConfig}>
          <div className={styles.floorConfigItem}>
            <span className={styles.floorConfigLabel}>지상 층수</span>
            {isEditingFloors ? (
              <div className={styles.floorConfigControls}>
                <button
                  type="button"
                  className={styles.floorConfigButton}
                  disabled={aboveFloors <= 1}
                  onClick={() => handleAboveChange(-1)}
                >
                  −
                </button>
                <span className={styles.floorConfigCount}>{aboveFloors}</span>
                <button
                  type="button"
                  className={styles.floorConfigButton}
                  onClick={() => handleAboveChange(1)}
                >
                  +
                </button>
              </div>
            ) : (
              <span className={styles.floorConfigCountReadonly}>{aboveFloors}</span>
            )}
          </div>
          <div className={styles.configDivider} />
          <div className={styles.floorConfigItem}>
            <span className={styles.floorConfigLabel}>지하 층수</span>
            {isEditingFloors ? (
              <div className={styles.floorConfigControls}>
                <button
                  type="button"
                  className={styles.floorConfigButton}
                  disabled={belowFloors <= 0}
                  onClick={() => handleBelowChange(-1)}
                >
                  −
                </button>
                <span className={styles.floorConfigCount}>{belowFloors}</span>
                <button
                  type="button"
                  className={styles.floorConfigButton}
                  onClick={() => handleBelowChange(1)}
                >
                  +
                </button>
              </div>
            ) : (
              <span className={styles.floorConfigCountReadonly}>{belowFloors}</span>
            )}
          </div>
          <div className={styles.configDivider} />
          <button
            type="button"
            className={
              isEditingFloors ? styles.floorConfigDoneButton : styles.floorConfigEditButton
            }
            aria-label={isEditingFloors ? '수정 완료' : '층 수정'}
            onClick={() => setIsEditingFloors((prev) => !prev)}
          >
            {isEditingFloors ? '완료' : <EditIcon width={14} height={14} />}
          </button>
        </div>

        {/* 층별 도면 목록 */}
        <div className={styles.floorList}>
          {floors.map((floor) => (
            <div key={floor} className={styles.floorRow}>
              <div className={styles.floorLeft}>
                <span className={styles.floorBadge}>{floorBadgeLabel(floor)}</span>
                <div className={styles.floorInfo}>
                  <span className={styles.floorName}>{floorLabel(floor)}</span>
                  {isUploaded(floor) ? (
                    <span className={styles.floorStatusUploaded}>도면 업로드 완료</span>
                  ) : (
                    <span className={styles.floorStatus}>도면 미업로드</span>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                {isUploaded(floor) ? (
                  <>
                    <button
                      type="button"
                      className={styles.reuploadButton}
                      onClick={() => handleUpload(floor)}
                    >
                      재업로드
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleFloorDelete(floor)}
                    >
                      삭제
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => handleUpload(floor)}
                  >
                    업로드
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        variant="confirm"
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title="도면 삭제"
        description={confirmDescription()}
        warning="삭제된 도면은 복구할 수 없습니다."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleConfirmAction}>
              삭제
            </Button>
          </>
        }
      />
    </>
  );
};

export default FloorPlanModal;
