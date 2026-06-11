import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import Avatar from '@components/avatar';

import * as styles from './GNB.css';

type BreadcrumbItem = {
  label: string;
};

type Props = {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  userName: string;
  userRole?: string;
};

const GNB = ({ breadcrumbs, title, description, userName, userRole }: Props) => (
  <header className={styles.container}>
    <div className={styles.left}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={index} className={styles.breadcrumb}>
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
      <Avatar name={userName} size="sm" role={userRole} showNameGroup />
    </div>
  </header>
);

export default GNB;
