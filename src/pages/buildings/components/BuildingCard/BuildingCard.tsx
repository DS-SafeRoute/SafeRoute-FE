import { useEffect, useRef, useState } from 'react';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import LayersIcon from '@assets/icons/ic-layers.svg?react';
import WifiIcon from '@assets/icons/ic-wifi.svg?react';

import * as styles from './BuildingCard.css';
import { useBuildingDeviceStatsQuery } from '../../api/useBuildingDeviceStatsQuery';

import type { Building } from '../../types/buildings';

interface BuildingCardProps {
  building: Building;
  onEdit: (building: Building) => void;
  onDelete: (building: Building) => void;
}

const formatTrainingDate = (date: string | null) => {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const BuildingCard = ({ building, onEdit, onDelete }: BuildingCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // 층별 CCTV/유도등 목록을 합산한 실제 등록 대수 (건물 단위 집계 API가 없어 클라이언트에서 취합)
  const deviceStats = useBuildingDeviceStatsQuery(building.id);
  const { cctvTotal, cctvOnline, iotTotal, iotOnline } = deviceStats;
  const isIotWarning = iotOnline < iotTotal;
  const formatCount = (online: number, total: number) =>
    deviceStats.isLoading ? '–' : `${online}/${total}`;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{building.name}</span>
          </div>
          <span className={styles.lastTraining}>
            최근 훈련 · {formatTrainingDate(building.lastTrainedAt)}
          </span>
        </div>
        <div className={styles.headerRight}>
          <div ref={menuRef} className={styles.kebabWrapper}>
            <button
              type="button"
              className={styles.kebabButton}
              aria-label="더보기"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className={styles.kebabDot} />
              <span className={styles.kebabDot} />
              <span className={styles.kebabDot} />
            </button>
            {menuOpen && (
              <div className={styles.menu}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(building);
                  }}
                >
                  수정하기
                </button>
                <button
                  type="button"
                  className={styles.menuItemDanger}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(building);
                  }}
                >
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
          <span className={styles.statValue}>{formatCount(cctvOnline, cctvTotal)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>
            <WifiIcon className={styles.iotIcon} width={14} height={14} />
            IoT 유도등
          </span>
          {isIotWarning ? (
            <span className={styles.statValueWarning}>
              {formatCount(iotOnline, iotTotal)}
              <span role="img" aria-label="경고">
                ⚠
              </span>
            </span>
          ) : (
            <span className={styles.statValue}>{formatCount(iotOnline, iotTotal)}</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default BuildingCard;
