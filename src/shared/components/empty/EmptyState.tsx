import type { ReactNode } from 'react';

import clsx from 'clsx';

import * as styles from './EmptyState.css';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const EmptyState = ({ title, description, icon, action, className }: EmptyStateProps) => (
  <div className={clsx(styles.container, className)}>
    {icon ? (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    ) : null}

    <div className={styles.text}>
      <strong className={styles.title}>{title}</strong>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>

    {action}
  </div>
);

export default EmptyState;
