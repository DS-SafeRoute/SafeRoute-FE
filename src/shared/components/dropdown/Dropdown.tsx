import { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import CheckIcon from '@assets/icons/ic-check.svg?react';
import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';

import * as styles from './Dropdown.css';

export interface DropdownOption<T extends string = string> {
  label: string;
  value: T;
}

export interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const Dropdown = <T extends string = string>({
  options,
  value,
  onChange,
  placeholder = '선택',
  disabled = false,
  className,
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
        className={styles.trigger({ disabled })}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected ? selected.label : placeholder}
        <ChevronDownIcon className={styles.chevron} width={16} height={16} />
      </button>

      {open && (
        <ul className={styles.panel} role="listbox">
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
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
