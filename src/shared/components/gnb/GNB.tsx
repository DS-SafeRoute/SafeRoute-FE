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
      {/* breadcrumbs가 undefined면(대부분의 화면) 브레드크럼 자체를 안 그림 — 기존과 동일.
          breadcrumbs를 빈 배열([])로 명시하면(더 상위 단계가 없는 "홈"급 화면) 이전 단계
          없이 title 하나만 현재 위치로 보여줌 — 앞 단계가 없는데 title을 그대로 한 번 더
          붙이면 "훈련 분석 › 훈련 분석"처럼 같은 말이 중복돼 보이는 문제를 해결함 */}
      {breadcrumbs && (
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className={styles.breadcrumb}>
              {index > 0 && (
                <ChevronRightIcon className={styles.breadcrumbSep} width={12} height={12} />
              )}
              <span>{item.label}</span>
            </span>
          ))}
          {breadcrumbs.length > 0 && (
            <ChevronRightIcon className={styles.breadcrumbSep} width={12} height={12} />
          )}
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
