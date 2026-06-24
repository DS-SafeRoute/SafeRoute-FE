import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import * as styles from './CameraCard.css';

import type { StreamCamera } from '../../types/trainingAnalysis';

interface CameraCardProps {
  camera: StreamCamera;
  onClick: (camera: StreamCamera) => void;
}

const CameraCard = ({ camera, onClick }: CameraCardProps) => (
  <div className={styles.card} onClick={() => onClick(camera)}>
    <div className={styles.video}>
      <div className={styles.badgeRow}>
        {camera.status === 'online' ? (
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE
          </div>
        ) : (
          <div className={styles.offlineBadge}>OFFLINE</div>
        )}
        {camera.status === 'online' && (
          <div className={styles.personCount}>
            <UsersIcon width={11} height={11} />
            {camera.detectedCount}
          </div>
        )}
      </div>
      {camera.status === 'offline' && <div className={styles.offlineOverlay}>신호 없음</div>}
    </div>

    <div className={styles.info}>
      <div>
        <div className={styles.name}>{camera.name}</div>
        <div className={styles.zone}>{camera.zone}</div>
      </div>
      {camera.status === 'online' && (
        <div className={styles.meta}>
          {camera.fps}fps · {camera.latencyMs}ms
        </div>
      )}
    </div>
  </div>
);

export default CameraCard;
