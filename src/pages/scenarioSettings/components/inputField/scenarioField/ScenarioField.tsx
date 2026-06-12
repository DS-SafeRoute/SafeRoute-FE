import type { ReactNode } from 'react';

import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';

import * as styles from './ScenarioField.css';

interface ScenarioFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  leadingIcon?: ReactNode;
}

const ScenarioField = ({ label, value, options, leadingIcon }: ScenarioFieldProps) => (
  <label className={styles.root}>
    <span className={styles.label}>{label}</span>
    <span className={styles.fieldShell}>
      {leadingIcon ? <span className={styles.withLeadingIcon}>{leadingIcon}</span> : null}
      <select className={styles.select} defaultValue={value} aria-label={label}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className={styles.trailingIcon}>
        <ChevronDownIcon />
      </span>
    </span>
  </label>
);

export default ScenarioField;
