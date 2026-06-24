import clsx from 'clsx';

import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import * as styles from './MonitoringSidebar.css';

import type { AiVisionStatus, StreamCamera } from '../../types/trainingAnalysis';

interface MonitoringSidebarProps {
  aiStatus: AiVisionStatus;
  cameras: StreamCamera[];
  activeCameraId?: string;
  onCameraSelect?: (camera: StreamCamera) => void;
}

const MonitoringSidebar = ({
  aiStatus,
  cameras,
  activeCameraId,
  onCameraSelect,
}: MonitoringSidebarProps) => (
  <aside className={styles.sidebar}>
    {/* AI 비전 상태 */}
    <div className={styles.aiStatusBox}>
      <span className={styles.aiStatusTitle}>AI 비전 상태</span>
      <div className={styles.aiStatusGrid}>
        <div className={styles.aiStatCard}>
          <span className={styles.aiStatValue}>{aiStatus.detectedCount}</span>
          <span className={styles.aiStatLabel}>감지</span>
        </div>
        <div className={styles.aiStatCard}>
          <span className={styles.aiStatValue}>{aiStatus.trackedCount}</span>
          <span className={styles.aiStatLabel}>추적</span>
        </div>
        <div className={styles.aiStatCard}>
          <span className={styles.aiStatValue}>{aiStatus.confidencePct}</span>
          <span className={styles.aiStatLabel}>신뢰도 %</span>
        </div>
      </div>
    </div>

    {/* 카메라 스트림 */}
    <div className={styles.streamBox}>
      <span className={styles.streamTitle}>카메라 스트림</span>
      <ul className={styles.streamList}>
        {cameras.map((cam) => (
          <li
            key={cam.id}
            className={clsx(
              styles.streamItem,
              activeCameraId === cam.id && styles.streamItemActive,
            )}
            onClick={() => onCameraSelect?.(cam)}
          >
            <div className={styles.streamLeft}>
              <span
                className={styles.statusDot}
                style={{
                  backgroundColor: cam.status === 'online' ? '#10B981' : '#9CA3AF',
                }}
              />
              <div className={styles.streamInfo}>
                <span className={styles.streamName}>{cam.name}</span>
                <span className={styles.streamMeta}>{cam.zone}</span>
                {cam.status === 'online' && (
                  <span className={styles.streamMeta}>
                    {cam.fps} fps / {cam.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
            <div className={styles.streamCount}>
              <UsersIcon width={12} height={12} />
              {cam.detectedCount}
            </div>
          </li>
        ))}
      </ul>
    </div>
  </aside>
);

export default MonitoringSidebar;
