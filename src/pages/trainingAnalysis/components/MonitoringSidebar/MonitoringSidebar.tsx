import { useState } from 'react';

import clsx from 'clsx';

import UsersIcon from '@assets/icons/ic-multi-user.svg?react';

import Dropdown from '@components/dropdown';

import * as styles from './MonitoringSidebar.css';

import type { AiVisionStatus, StreamCamera } from '../../types/trainingAnalysis';

interface MonitoringSidebarProps {
  aiStatus: AiVisionStatus;
  cameras: StreamCamera[];
  activeCameraId?: string;
  onCameraSelect?: (camera: StreamCamera) => void;
}

const ALL_BUILDING = '전체';

const MonitoringSidebar = ({
  aiStatus,
  cameras,
  activeCameraId,
  onCameraSelect,
}: MonitoringSidebarProps) => {
  const [buildingFilter, setBuildingFilter] = useState(ALL_BUILDING);

  const buildingOptions = [
    { label: '전체', value: ALL_BUILDING },
    ...Array.from(new Set(cameras.map((c) => c.building))).map((b) => ({
      label: b,
      value: b,
    })),
  ];

  const filteredCameras =
    buildingFilter === ALL_BUILDING
      ? cameras
      : cameras.filter((c) => c.building === buildingFilter);

  return (
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
        <div className={styles.streamHeader}>
          <span className={styles.streamTitle}>카메라 스트림</span>
          <Dropdown
            options={buildingOptions}
            value={buildingFilter}
            onChange={setBuildingFilter}
            className={styles.zoneDropdown}
          />
        </div>
        <ul className={styles.streamList}>
          {filteredCameras.map((cam) => (
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
                  <span className={styles.streamMeta}>
                    {cam.building} · {cam.zone}
                  </span>
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
};

export default MonitoringSidebar;
