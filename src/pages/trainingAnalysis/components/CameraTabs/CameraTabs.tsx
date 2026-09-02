import clsx from 'clsx';

import * as styles from './CameraTabs.css';

import type { MonitoringCamera } from '../../types/trainingAnalysis';

interface CameraTabsProps {
  cameras: MonitoringCamera[];
  activeCctvId: string;
  onSelect: (camera: MonitoringCamera) => void;
}

// 같은 세션의 다른 카메라로 넘어갈 때마다 카메라 목록 페이지로 되돌아가야 하는 게
// 번거로워서, 상세 페이지에서 바로 다른 카메라로 전환할 수 있게 둠.
// 탭 패널을 전환하는 게 아니라 다른 프레임 경로로 이동하는 동작이라 tablist/tab 역할 대신
// nav + 일반 버튼으로 두고, 현재 카메라는 aria-current로 표시함
const CameraTabs = ({ cameras, activeCctvId, onSelect }: CameraTabsProps) => (
  <nav className={styles.tabs} aria-label="카메라 선택">
    {cameras.map((camera) => {
      const disabled = camera.capturedAt === null;
      const active = camera.cctvId === activeCctvId;
      return (
        <button
          key={camera.cctvId}
          type="button"
          aria-current={active ? 'page' : undefined}
          disabled={disabled}
          className={clsx(styles.tab, active && styles.tabActive)}
          onClick={() => onSelect(camera)}
        >
          <span className={styles.tabCode}>{camera.code}</span>
          <span className={styles.tabLocation}>{disabled ? '프레임 없음' : camera.location}</span>
        </button>
      );
    })}
  </nav>
);

export default CameraTabs;
