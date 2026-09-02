import {
  splitTargetEvacuationTime,
  toTargetEvacuationSec,
} from '@pages/scenarioSettings/utils/scenarioSettings';

import * as styles from './TargetEvacuationTimeField.css';

interface TargetEvacuationTimeFieldProps {
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
}

const createOptions = (length: number) =>
  Array.from({ length }, (_, value) => ({
    label: String(value).padStart(2, '0'),
    value: String(value),
  }));

const MINUTE_SECOND_OPTIONS = createOptions(60);

const TargetEvacuationTimeField = ({
  value,
  disabled = false,
  readOnly = false,
  onChange,
}: TargetEvacuationTimeFieldProps) => {
  const time = splitTargetEvacuationTime(value);
  const isInactive = disabled || readOnly;

  const handleChange = (unit: 'hours' | 'minutes' | 'seconds', nextValue: string) => {
    const nextTime = { ...time, [unit]: nextValue };
    onChange(toTargetEvacuationSec(nextTime.hours, nextTime.minutes, nextTime.seconds));
  };

  const renderSelect = (
    unit: 'minutes' | 'seconds',
    label: string,
    options: readonly { label: string; value: string }[],
  ) => (
    <span className={styles.segment}>
      <select
        className={styles.select}
        value={time[unit]}
        aria-label={`목표 대피 시간 ${label}`}
        disabled={isInactive}
        onChange={(event) => handleChange(unit, event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.unit}>{label}</span>
    </span>
  );

  return (
    <label className={styles.root}>
      <span className={styles.label}>목표 대피 시간</span>
      <span className={styles.fieldShell({ disabled: isInactive })}>
        <span className={styles.segment}>
          <input
            type="number"
            className={styles.hourInput}
            value={time.hours}
            min={0}
            step={1}
            inputMode="numeric"
            aria-label="목표 대피 시간 시간"
            disabled={isInactive}
            onChange={(event) => handleChange('hours', event.target.value)}
          />
          <span className={styles.unit}>시간</span>
        </span>
        <span className={styles.divider} aria-hidden="true" />
        {renderSelect('minutes', '분', MINUTE_SECOND_OPTIONS)}
        <span className={styles.divider} aria-hidden="true" />
        {renderSelect('seconds', '초', MINUTE_SECOND_OPTIONS)}
      </span>
    </label>
  );
};

export default TargetEvacuationTimeField;
