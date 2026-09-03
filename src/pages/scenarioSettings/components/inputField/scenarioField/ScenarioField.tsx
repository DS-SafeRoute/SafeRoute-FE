import Dropdown from '@components/dropdown';
import type { DropdownOption } from '@components/dropdown';

import * as styles from './ScenarioField.css';

export type ScenarioFieldOption = DropdownOption;

interface ScenarioFieldProps {
  label: string;
  value: string;
  options: readonly (string | ScenarioFieldOption)[];
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

const ScenarioField = ({
  label,
  value,
  options,
  disabled = false,
  readOnly = false,
  onChange,
}: ScenarioFieldProps) => {
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  );

  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>
      <Dropdown
        fullWidth
        shape="rounded"
        size="lg"
        options={normalizedOptions}
        value={value}
        disabled={disabled || readOnly}
        ariaLabel={label}
        onChange={(nextValue) => onChange?.(nextValue)}
      />
    </div>
  );
};

export default ScenarioField;
