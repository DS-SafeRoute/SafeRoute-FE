import { useEffect, useRef, useState } from 'react';

import CameraIcon from '@assets/icons/ic-camera.svg?react';

import StatusBadge from '@components/chip/StatusBadge';

import * as styles from './CameraCard.css';

import type { Camera } from '../../types/cameras';

interface CameraCardProps {
  camera: Camera;
  onEdit: (camera: Camera) => void;
  onDelete: (camera: Camera) => void;
  onToggleActive: (camera: Camera) => void;
}

const CameraCard = ({ camera, onEdit, onDelete, onToggleActive }: CameraCardProps) => {
  const isOnline = camera.status === 'online';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <article className={styles.container({ inactive: !camera.isActive })}>
      <div className={styles.header}>
        <div className={styles.iconWrap({ inactive: !camera.isActive })}>
          <CameraIcon width={26} height={26} aria-hidden="true" />
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{camera.name}</span>
            {camera.isActive ? (
              <StatusBadge
                label={isOnline ? '온라인' : '오프라인'}
                color={isOnline ? 'green' : 'neutral'}
                dot
              />
            ) : (
              <StatusBadge label="비활성" color="neutral" />
            )}
          </div>
          <span className={styles.zone}>{camera.zone}</span>
          <span className={styles.building}>
            {camera.buildingName} ·{' '}
            {camera.floor > 0 ? `${camera.floor}층` : `B${Math.abs(camera.floor)}층`}
          </span>
        </div>

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
                  onEdit(camera);
                }}
              >
                수정
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false);
                  onToggleActive(camera);
                }}
              >
                {camera.isActive ? '비활성화' : '활성화'}
              </button>
              <button
                type="button"
                className={styles.menuItemDanger}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(camera);
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>IP 주소</span>
          <span className={styles.statValue}>{camera.ipAddress}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>FPS</span>
          <span className={styles.statValue}>{isOnline && camera.isActive ? camera.fps : '-'}</span>
        </div>
      </div>
    </article>
  );
};

export default CameraCard;
