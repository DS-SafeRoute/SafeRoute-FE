import { useRef } from 'react';

import { getStartOfToday } from '@pages/scenarioSettings/utils/scenarioSettings';

import CalendarIcon from '@assets/icons/ic-calendar.svg?react';

import * as styles from './DateTimeField.css';

interface DateTimeFieldProps {
  label: string;
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
}

const formatDateTime = (value: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (number: number) => String(number).padStart(2, '0');

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const toInputValue = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const DateTimeField = ({
  label,
  value,
  disabled = false,
  readOnly = false,
  onChange,
}: DateTimeFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isInactive = disabled || readOnly;
  const inputValue = toInputValue(value);
  const minimumInputValue = toInputValue(getStartOfToday().toISOString());

  return (
    <label className={styles.root}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={styles.trigger({ disabled, readOnly })}
        disabled={isInactive}
        onClick={() => {
          inputRef.current?.showPicker?.();
          inputRef.current?.focus();
        }}
      >
        <span className={styles.icon}>
          <CalendarIcon />
        </span>
        <span className={styles.value({ disabled })}>{formatDateTime(value)}</span>
      </button>
      <input
        ref={inputRef}
        type="datetime-local"
        min={minimumInputValue}
        disabled={isInactive}
        value={inputValue}
        className={styles.hiddenInput}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </label>
  );
};

export default DateTimeField;
