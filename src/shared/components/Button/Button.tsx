import type { ButtonHTMLAttributes, ReactNode } from 'react';

import {
  base,
  variantStyles,
  sizeStyles,
  iconOnlySizes,
  iconWrapper,
  fullWidthStyle,
  spinnerStyle,
} from './Button.css';

export type ButtonVariant = 'primary' | 'outlined' | 'danger' | 'dangerOutlined' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  iconOnly = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const cls = [
    base,
    variantStyles[variant],
    sizeStyles[size],
    iconOnly ? iconOnlySizes[size] : null,
    fullWidth ? fullWidthStyle : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const icon = (node: ReactNode) => (
    <span className={iconWrapper} aria-hidden="true">
      {node}
    </span>
  );

  return (
    <button
      type="button"
      className={cls}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={spinnerStyle} aria-hidden="true" />
      ) : iconOnly ? (
        icon(children)
      ) : (
        <>
          {leftIcon && icon(leftIcon)}
          {children}
          {rightIcon && icon(rightIcon)}
        </>
      )}
    </button>
  );
}
