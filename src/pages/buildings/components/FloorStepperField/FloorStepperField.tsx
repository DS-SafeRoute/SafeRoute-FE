import { useId } from 'react';

import RequiredFieldText from '@components/inputField/RequiredFieldText';

import * as styles from './FloorStepperField.css';

interface FloorStepperFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  errorMessage?: string;
}

const FloorStepperField = ({
  label,
  value,
  onChange,
  min,
  errorMessage,
}: FloorStepperFieldProps) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const isRequired = label.includes(' *');
  const numeric = Number(value) || 0;
  const isError = Boolean(errorMessage);

  const handleStep = (delta: number) => {
    onChange(String(Math.max(min, numeric + delta)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw !== '' && !/^\d+$/.test(raw)) return;
    onChange(raw);
  };

  const handleBlur = () => {
    if (value.trim() === '') return;
    onChange(String(Math.max(min, Number(value))));
  };

  return (
    <div className={styles.container}>
      <label htmlFor={inputId} className={styles.label}>
        <RequiredFieldText label={label} />
      </label>
      <div className={styles.controls({ isError })}>
        <button
          type="button"
          className={styles.stepButton}
          aria-label={`${label} 감소`}
          disabled={numeric <= min}
          onClick={() => handleStep(-1)}
        >
          −
        </button>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          aria-required={isRequired}
          aria-invalid={isError}
          aria-describedby={isError ? errorId : undefined}
        />
        <button
          type="button"
          className={styles.stepButton}
          aria-label={`${label} 증가`}
          onClick={() => handleStep(1)}
        >
          +
        </button>
      </div>
      {errorMessage ? (
        <span id={errorId} className={styles.errorText}>
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
};

export default FloorStepperField;
