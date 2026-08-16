import type { ReactNode } from 'react';

import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';

import * as styles from './ScenarioField.css';

interface ScenarioFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  leadingIcon?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
}

const ScenarioField = ({
  label,
  value,
  options,
  leadingIcon,
  disabled = false,
  readOnly = false,
}: ScenarioFieldProps) => {
  const isInactive = disabled || readOnly;

  return (
    <label className={styles.root}>
      <span className={styles.label}>{label}</span>
      <span className={styles.fieldShell({ disabled })}>
        {leadingIcon ? <span className={styles.withLeadingIcon}>{leadingIcon}</span> : null}
        <select
          className={styles.select({ disabled, readOnly })}
          defaultValue={value}
          aria-label={label}
          disabled={isInactive}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {!isInactive ? (
          <span className={styles.trailingIcon}>
            <ChevronDownIcon />
          </span>
        ) : null}
      </span>
    </label>
  );
};

export default ScenarioField;
