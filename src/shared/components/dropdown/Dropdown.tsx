import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { createPortal } from 'react-dom';

import CheckIcon from '@assets/icons/ic-check.svg?react';
import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';

import * as styles from './Dropdown.css';

interface PanelRect {
  top: number;
  left: number;
  width: number;
}

export interface DropdownOption<T extends string = string> {
  label: string;
  value: T;
}

export interface DropdownProps<T extends string = string> {
  options: readonly DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  shape?: 'pill' | 'rounded';
}

const Dropdown = <T extends string = string>({
  options,
  value,
  onChange,
  placeholder = '선택',
  disabled = false,
  className,
  shape = 'pill',
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  // 패널을 document.body에 포탈로 띄우고 뷰포트 좌표(position: fixed)로 직접 배치함 —
  // 모달 안에서 열리면 모달의 overflow: hidden에 패널이 잘리는 문제를 피하기 위함
  const [panelRect, setPanelRect] = useState<PanelRect | null>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    const updatePanelRect = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    updatePanelRect();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) setOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', updatePanelRect, true);
    window.addEventListener('resize', updatePanelRect);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', updatePanelRect, true);
      window.removeEventListener('resize', updatePanelRect);
    };
  }, [open]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={clsx(styles.container, className)}>
      <button
        type="button"
        className={styles.trigger({ disabled, shape })}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected ? selected.label : placeholder}
        <ChevronDownIcon className={styles.chevron} width={16} height={16} />
      </button>

      {open &&
        panelRect &&
        createPortal(
          <ul
            ref={panelRef}
            className={styles.panel}
            role="listbox"
            style={{ top: panelRect.top, left: panelRect.left, width: panelRect.width }}
          >
            {options.map((option) => (
              <li
                key={option.value}
                className={styles.option}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {option.value === value && (
                  <CheckIcon className={styles.checkIcon} width={16} height={16} />
                )}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
};

export default Dropdown;
