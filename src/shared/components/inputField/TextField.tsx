import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import clsx from 'clsx';

import EyeIcon from '@assets/icons/ic-eye.svg?react';

import RequiredFieldText from './RequiredFieldText';
import * as styles from './TextField.css';

export interface TextFieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'children'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      leftIcon,
      className,
      type = 'text',
      onFocus,
      onBlur,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const helperMessage = errorMessage ?? helperText;
    const isError = Boolean(errorMessage);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const isPassword = type === 'password';
    const resolvedType = isPassword && passwordVisible ? 'text' : type;

    return (
      <label className={styles.root}>
        {label ? (
          <span className={styles.label}>
            <RequiredFieldText label={label} />
          </span>
        ) : null}
        <span className={styles.fieldShell({ isError, isFocused, disabled })}>
          {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
          <input
            {...props}
            ref={inputRef}
            type={resolvedType}
            disabled={disabled}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            className={clsx(styles.input, className)}
          />
          {isPassword ? (
            <button
              type="button"
              className={styles.iconButton}
              aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
              aria-pressed={passwordVisible}
              onClick={() => {
                setPasswordVisible((prev) => !prev);
                inputRef.current?.focus();
              }}
              disabled={disabled}
            >
              <EyeIcon className={styles.icon} aria-hidden="true" focusable="false" />
            </button>
          ) : null}
        </span>
        {helperMessage ? (
          <span className={styles.helperText({ isError })}>{helperMessage}</span>
        ) : null}
      </label>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
