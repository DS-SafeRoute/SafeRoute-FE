import type { ReactNode } from 'react';

import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';

import * as styles from './ScenarioField.css';

export interface ScenarioFieldOption {
  label: string;
  value: string;
}

interface ScenarioFieldProps {
  label: string;
  value: string;
  options: readonly (string | ScenarioFieldOption)[];
  leadingIcon?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

const ScenarioField = ({
  label,
  value,
  options,
  leadingIcon,
  disabled = false,
  readOnly = false,
  onChange,
}: ScenarioFieldProps) => {
  const isInactive = disabled || readOnly;

  return (
    <label className={styles.root}>
      <span className={styles.label}>{label}</span>
      <span className={styles.fieldShell({ disabled })}>
        {Boolean(leadingIcon) && <span className={styles.withLeadingIcon}>{leadingIcon}</span>}
        <select
          className={styles.select({ disabled, readOnly })}
          value={onChange ? value : undefined}
          defaultValue={onChange ? undefined : value}
          aria-label={label}
          disabled={isInactive}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {options.map((option) => {
            const item = typeof option === 'string' ? { label: option, value: option } : option;

            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </select>
        {!isInactive && (
          <span className={styles.trailingIcon}>
            <ChevronDownIcon />
          </span>
        )}
      </span>
    </label>
  );
};

export default ScenarioField;
