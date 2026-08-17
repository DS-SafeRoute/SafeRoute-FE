import { useRef, useState } from 'react';

import CalendarIcon from '@assets/icons/ic-calendar.svg?react';

import * as styles from './DateTimeField.css';

interface DateTimeFieldProps {
  label: string;
  defaultValue: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const formatDateTime = (value: string) => {
  if (!value) return '';

  const [datePart] = value.split('T');
  const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(datePart);

  if (!isDateFormat) return '';

  const [year, month, day] = datePart.split('-');

  return `${year}.${month}.${day}`;
};

const DateTimeField = ({
  label,
  defaultValue,
  disabled = false,
  readOnly = false,
}: DateTimeFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const isInactive = disabled || readOnly;

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
        type="date"
        disabled={isInactive}
        value={value}
        className={styles.hiddenInput}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
    </label>
  );
};

export default DateTimeField;
