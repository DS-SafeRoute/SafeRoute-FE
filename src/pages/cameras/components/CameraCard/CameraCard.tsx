import CameraIcon from '@assets/icons/ic-camera.svg?react';
import EditIcon from '@assets/icons/ic-edit.svg?react';

import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './CameraCard.css';

import type { Camera } from '../../types/cameras';

interface CameraCardProps {
  camera: Camera;
  onEdit: (camera: Camera) => void;
  onDelete: (camera: Camera) => void;
}

const CameraCard = ({ camera, onEdit, onDelete: _onDelete }: CameraCardProps) => {
  const isOnline = camera.status === 'online';

  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <CameraIcon width={22} height={22} aria-hidden="true" />
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{camera.name}</span>
            <StatusBadge
              label={isOnline ? '온라인' : '오프라인'}
              color={isOnline ? 'green' : 'neutral'}
              dot
            />
          </div>
          <span className={styles.zone}>{camera.zone}</span>
          <span className={styles.building}>
            {camera.buildingName} ·{' '}
            {camera.floor > 0 ? `${camera.floor}층` : `B${Math.abs(camera.floor)}층`}
          </span>
        </div>

        <button
          type="button"
          className={styles.editButton}
          aria-label="카메라 수정"
          onClick={() => onEdit(camera)}
        >
          <EditIcon width={18} height={18} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>IP 주소</span>
          <span className={styles.statValue}>{camera.ipAddress}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>FPS</span>
          <span className={styles.statValue}>{isOnline ? camera.fps : '-'}</span>
        </div>
      </div>
    </article>
  );
};

export default CameraCard;
