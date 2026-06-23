import type { ReactNode } from 'react';

import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import Avatar from '@components/avatar';

import * as styles from './GNB.css';

interface BreadcrumbItem {
  label: string;
}

export interface GNBProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  userName?: string;
  userRole?: string;
  actions?: ReactNode;
  onProfileClick?: () => void;
}

const GNB = ({
  breadcrumbs,
  title,
  description,
  userName = '',
  userRole,
  actions,
  onProfileClick,
}: GNBProps) => (
  <header className={styles.container}>
    <div className={styles.left}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className={styles.breadcrumb}>
              {index > 0 && (
                <ChevronRightIcon className={styles.breadcrumbSep} width={12} height={12} />
              )}
              <span>{item.label}</span>
            </span>
          ))}
          <ChevronRightIcon className={styles.breadcrumbSep} width={12} height={12} />
          <span className={styles.breadcrumbCurrent}>{title}</span>
        </nav>
      )}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </div>

    <div className={styles.right}>
      {actions}
      <button
        type="button"
        className={styles.profileButton}
        aria-label="마이페이지 열기"
        onClick={onProfileClick}
      >
        <Avatar name={userName} size="sm" role={userRole} showNameGroup />
      </button>
    </div>
  </header>
);

export default GNB;
