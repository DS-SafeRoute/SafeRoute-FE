import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import * as styles from './CameraCard.css';
import { formatCapturedTime } from '../../utils/trainingAnalysis';

import type { MonitoringCamera } from '../../types/trainingAnalysis';

interface CameraCardProps {
  camera: MonitoringCamera;
  onClick: (camera: MonitoringCamera) => void;
}

// 훈련 종료 후 카메라별 최신 캡처 프레임을 보여주는 카드.
// LIVE/fps 같은 실시간 스트리밍 지표는 API에 없어서 캡처 시각만 표시함
const CameraCard = ({ camera, onClick }: CameraCardProps) => {
  const hasFrame = camera.thumbnailUrl !== null;
  const capturedTime = formatCapturedTime(camera.capturedAt);

  return (
    <button
      type="button"
      className={styles.card}
      disabled={!hasFrame}
      onClick={() => onClick(camera)}
    >
      <div className={styles.thumb}>
        {hasFrame ? (
          <>
            {capturedTime ? <span className={styles.timeBadge}>{capturedTime}</span> : null}
            <span className={styles.thumbPlaceholder} aria-hidden="true" />
          </>
        ) : (
          <span className={styles.noFrame}>프레임 없음</span>
        )}
      </div>

      <div className={styles.info}>
        <div>
          <div className={styles.name}>{camera.name}</div>
          <div className={styles.location}>{camera.location}</div>
        </div>
        {hasFrame ? (
          <span className={styles.link}>
            영상 분석 보기
            <ChevronRightIcon width={12} height={12} />
          </span>
        ) : (
          <span className={styles.linkDisabled}>프레임 없음</span>
        )}
      </div>
    </button>
  );
};

export default CameraCard;
