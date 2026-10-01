import { useEffect, useRef, useState } from 'react';

import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';
import PlusIcon from '@assets/icons/ic-plus.svg?react';

import * as styles from '../FloorPlansDetailPage.css';

/* ── 툴바 "+ 추가" 메뉴 — 노드/구역/엣지 추가를 각각 버튼으로 늘어놓지 않고 하나로 묶음 ── */
const AddActionMenu = ({
  onAddNode,
  onAddZone,
  onAddEdge,
}: {
  onAddNode: () => void;
  onAddZone: () => void;
  onAddEdge: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const items = [
    { label: '노드 추가', onClick: onAddNode },
    { label: '구역 추가', onClick: onAddZone },
    { label: '엣지 연결', onClick: onAddEdge },
  ];

  return (
    <div ref={containerRef} className={styles.addMenuContainer}>
      <button
        type="button"
        className={styles.canvasActionButton}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <PlusIcon width={14} height={14} />
        추가
        <ChevronDownIcon width={14} height={14} className={styles.addMenuChevron} />
      </button>
      {open && (
        <div className={styles.addMenuPanel} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={styles.addMenuItem}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddActionMenu;
