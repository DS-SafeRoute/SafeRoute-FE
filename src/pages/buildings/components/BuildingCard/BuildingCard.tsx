import CameraIcon from '@assets/icons/ic-camera.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';
import EditIcon from '@assets/icons/ic-edit.svg?react';
import LayersIcon from '@assets/icons/ic-layers.svg?react';
import TrashIcon from '@assets/icons/ic-trash.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';

import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './BuildingCard.css';

import type { Building } from '../../types/buildings';

interface BuildingCardProps {
  building: Building;
  onEdit: (building: Building) => void;
  onDelete: (building: Building) => void;
  onFloorPlan: (building: Building) => void;
}

const BuildingCard = ({ building, onEdit, onDelete, onFloorPlan }: BuildingCardProps) => {
  const isIotWarning = building.iotOnline < building.iotTotal;

  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.name}>{building.name}</span>
          <span className={styles.lastTraining}>최근 훈련 · {building.lastTrainingDate}</span>
        </div>
        <StatusBadge
          label={building.status === 'normal' ? '정상' : '점검 필요'}
          color={building.status === 'normal' ? 'green' : 'yellow'}
          dot
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>
            <LayersIcon className={styles.statIcon} width={14} height={14} />
            층수
          </span>
          <span className={styles.statValue}>{building.totalFloors}층</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>
            <CameraIcon className={styles.cctvIcon} width={14} height={14} />
            CCTV
          </span>
          <span className={styles.statValue}>
            {building.cctvOnline}/{building.cctvTotal}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>
            <WifiIcon className={styles.iotIcon} width={14} height={14} />
            IoT 유도등
          </span>
          {isIotWarning ? (
            <span className={styles.statValueWarning}>
              {building.iotOnline}/{building.iotTotal}
              <span>⚠</span>
            </span>
          ) : (
            <span className={styles.statValue}>
              {building.iotOnline}/{building.iotTotal}
            </span>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.floorPlanButton}
          onClick={() => onFloorPlan(building)}
        >
          도면 관리
          <ChevronRightIcon width={14} height={14} />
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.editButton}`}
          aria-label="건물 수정"
          onClick={() => onEdit(building)}
        >
          <EditIcon width={16} height={16} />
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.deleteButton}`}
          aria-label="건물 삭제"
          onClick={() => onDelete(building)}
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>
    </article>
  );
};

export default BuildingCard;
