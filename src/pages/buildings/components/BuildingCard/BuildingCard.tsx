import CameraIcon from '@assets/icons/ic-camera.svg?react';
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

const formatTrainingDate = (date: string) => (date === '-' ? date : date.split('-').join('.'));

const BuildingCard = ({ building, onEdit, onDelete, onFloorPlan }: BuildingCardProps) => {
  const isIotWarning = building.iotOnline < building.iotTotal;

  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.name}>{building.name}</span>
          <span className={styles.lastTraining}>
            최근 훈련 · {formatTrainingDate(building.lastTrainingDate)}
          </span>
        </div>
        <div className={styles.headerRight}>
          <StatusBadge
            label={building.status === 'normal' ? '정상' : '점검 필요'}
            color={building.status === 'normal' ? 'green' : 'yellow'}
            dot
          />
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>
            <LayersIcon className={styles.statIcon} width={14} height={14} />
            층수
          </span>
          <span className={styles.statValue}>{building.aboveFloors}층</span>
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
              <span aria-label="경고">⚠</span>
            </span>
          ) : (
            <span className={styles.statValue}>
              {building.iotOnline}/{building.iotTotal}
            </span>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.floorPlanButton}
          onClick={() => onFloorPlan(building)}
        >
          도면 관리
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="수정"
          onClick={() => onEdit(building)}
        >
          <EditIcon width={14} height={14} />
        </button>
        <button
          type="button"
          className={styles.iconButtonDanger}
          aria-label="삭제"
          onClick={() => onDelete(building)}
        >
          <TrashIcon width={14} height={14} />
        </button>
      </div>
    </article>
  );
};

export default BuildingCard;
