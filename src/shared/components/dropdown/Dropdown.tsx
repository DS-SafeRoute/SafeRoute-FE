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
  size?: 'md' | 'lg';
  // 트리거 버튼을 컨테이너 100% 너비로 늘림 — 켜면 목록 패널 너비도 같이 늘어남(패널 너비를
  // 트리거의 실제 렌더 너비에서 그대로 구해오기 때문)
  fullWidth?: boolean;
  // 화면에 별도 <label>이 없는 사용처(카드 인라인 편집 등)를 위한 접근성 이름 — 스크린리더가
  // 옆의 텍스트 라벨과 이 트리거의 연결을 알 수 없다는 코드래빗 리뷰 반영
  ariaLabel?: string;
}

const Dropdown = <T extends string = string>({
  options,
  value,
  onChange,
  placeholder = '선택',
  disabled = false,
  className,
  shape = 'pill',
  size = 'md',
  fullWidth = false,
  ariaLabel,
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
    <div
      ref={containerRef}
      className={clsx(styles.container, fullWidth && styles.containerFullWidth, className)}
    >
      <button
        type="button"
        className={styles.trigger({ disabled, shape, size, fullWidth })}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
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
