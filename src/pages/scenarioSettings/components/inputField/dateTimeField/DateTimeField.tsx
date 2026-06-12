import { useRef, useState } from 'react';

import CalendarIcon from '@assets/icons/ic-calendar.svg?react';

import * as styles from './DateTimeField.css';

interface DateTimeFieldProps {
  label: string;
  defaultValue: string;
}

const formatDateTime = (value: string) => {
  if (!value) return '';

  const [datePart] = value.split('T');
  const [year = '', month = '', day = ''] = datePart.split('-');

  return `${year}.${month}.${day}`;
};

const DateTimeField = ({ label, defaultValue }: DateTimeFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);

  return (
    <label className={styles.root}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => {
          inputRef.current?.showPicker?.();
          inputRef.current?.focus();
        }}
      >
        <span className={styles.icon}>
          <CalendarIcon />
        </span>
        <span className={styles.value}>{formatDateTime(value)}</span>
      </button>
      <input
        ref={inputRef}
        type="date"
        defaultValue={defaultValue}
        className={styles.hiddenInput}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
    </label>
  );
};

export default DateTimeField;
