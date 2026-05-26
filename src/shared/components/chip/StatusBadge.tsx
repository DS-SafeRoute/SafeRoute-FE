import type { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import * as styles from './StatusBadge.css';

export type StatusBadgeColor = 'neutral' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export type StatusBadgeProps = {
  label: string;
  color?: StatusBadgeColor;
  dot?: boolean;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children'>;

const StatusBadge = ({
  label,
  color = 'neutral',
  dot = false,
  className,
  ...props
}: StatusBadgeProps) => (
  <span className={clsx(styles.badge({ color }), className)} {...props}>
    {dot ? <span aria-hidden="true" className={styles.dot} /> : null}
    <span>{label}</span>
  </span>
);

export default StatusBadge;
