import type { ReactNode } from 'react';

import ChevronDownIcon from '@assets/icons/ic-chevron-down.svg?react';

import * as styles from './ScenarioField.css';

interface ScenarioFieldBaseProps {
  label: string;
  leadingIcon?: ReactNode;
}

interface ScenarioInputFieldProps extends ScenarioFieldBaseProps {
  type?: 'text';
  value: string;
  placeholder?: string;
  readOnly?: boolean;
}

interface ScenarioSelectFieldProps extends ScenarioFieldBaseProps {
  type: 'select';
  value: string;
  options: readonly string[];
}

interface ScenarioStaticFieldProps extends ScenarioFieldBaseProps {
  type: 'static';
  value: string;
}

type ScenarioFieldProps =
  | ScenarioInputFieldProps
  | ScenarioSelectFieldProps
  | ScenarioStaticFieldProps;

const ScenarioField = ({ label, leadingIcon, ...props }: ScenarioFieldProps) => (
  <label className={styles.root}>
    <span className={styles.label}>{label}</span>
    <span className={styles.fieldShell}>
      {leadingIcon ? <span className={styles.withLeadingIcon}>{leadingIcon}</span> : null}

      {props.type === 'select' ? (
        <>
          <select className={styles.select} defaultValue={props.value} aria-label={label}>
            {props.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className={styles.trailingIcon}>
            <ChevronDownIcon />
          </span>
        </>
      ) : props.type === 'static' ? (
        <span className={styles.valueText}>{props.value}</span>
      ) : (
        <input
          type="text"
          className={styles.input}
          {...(props.readOnly ? { value: props.value } : { defaultValue: props.value })}
          placeholder={props.placeholder}
          readOnly={props.readOnly}
        />
      )}
    </span>
  </label>
);

export default ScenarioField;
