import { useEffect, useRef, useState } from 'react';

import CameraIcon from '@assets/icons/ic-camera.svg?react';
import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';
import LayersIcon from '@assets/icons/ic-layers.svg?react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isIotWarning = building.iotOnline < building.iotTotal;

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
          <span className={styles.name}>{building.name}</span>
          <span className={styles.lastTraining}>최근 훈련 · {building.lastTrainingDate}</span>
        </div>
        <div className={styles.headerRight}>
          <StatusBadge
            label={building.status === 'normal' ? '정상' : '점검 필요'}
            color={building.status === 'normal' ? 'green' : 'yellow'}
            dot
          />
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
                  수정
                </button>
                <button
                  type="button"
                  className={styles.menuItemDanger}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(building);
                  }}
                >
                  삭제
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
          <span className={styles.statValue}>
            {building.aboveFloors}F{building.belowFloors > 0 ? ` / B${building.belowFloors}` : ''}
          </span>
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
          <ChevronRightIcon width={14} height={14} />
        </button>
      </div>
    </article>
  );
};

export default BuildingCard;
