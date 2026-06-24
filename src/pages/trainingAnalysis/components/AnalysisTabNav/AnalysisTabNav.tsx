import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router';

import { ROUTES } from '@constants/path';

import * as styles from './AnalysisTabNav.css';

const TABS = [
  { label: '영상 분석', path: ROUTES.TRAINING_ANALYSIS },
  { label: '모니터링', path: ROUTES.TRAINING_MONITORING },
] as const;

const AnalysisTabNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === ROUTES.TRAINING_ANALYSIS) {
      return pathname === ROUTES.TRAINING_ANALYSIS;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className={styles.tabNav}>
      {TABS.map((tab) => (
        <button
          key={tab.path}
          type="button"
          className={clsx(styles.tabItem, isActive(tab.path) && styles.tabItemActive)}
          onClick={() => void navigate(tab.path)}
          aria-current={isActive(tab.path) ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default AnalysisTabNav;
