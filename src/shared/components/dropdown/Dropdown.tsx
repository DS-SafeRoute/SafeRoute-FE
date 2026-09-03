import { useEffect, useId, useRef, useState } from 'react';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
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

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePanelRect, true);
    window.addEventListener('resize', updatePanelRect);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePanelRect, true);
      window.removeEventListener('resize', updatePanelRect);
    };
  }, [open]);

  useEffect(() => {
    if (open && panelRect) panelRef.current?.focus();
  }, [open, panelRect]);

  const getSelectedIndex = () => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    return selectedIndex >= 0 ? selectedIndex : 0;
  };

  const openList = (initialIndex = getSelectedIndex()) => {
    if (options.length === 0) return;
    setActiveIndex(initialIndex);
    setOpen(true);
  };

  const closeList = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    closeList();
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeList();
      return;
    }
    if (event.key === 'Tab') {
      closeList();
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => (current + direction + options.length) % options.length);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) handleSelect(option.value);
    }
  };

  return (
    <div
      ref={containerRef}
      className={clsx(styles.container, fullWidth && styles.containerFullWidth, className)}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger({ disabled, shape, size, fullWidth })}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          openList();
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          const initialIndex = event.key === 'ArrowDown' ? getSelectedIndex() : options.length - 1;
          openList(initialIndex);
        }}
      >
        {selected ? selected.label : placeholder}
        <ChevronDownIcon className={styles.chevron} width={16} height={16} />
      </button>

      {open &&
        panelRect &&
        createPortal(
          <ul
            ref={panelRef}
            id={listboxId}
            className={styles.panel}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel ?? '선택 옵션'}
            aria-activedescendant={`${listboxId}-option-${activeIndex}`}
            onKeyDown={handleListKeyDown}
            style={{ top: panelRect.top, left: panelRect.left, width: panelRect.width }}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                className={styles.option}
                role="option"
                aria-selected={option.value === value}
                data-active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
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
