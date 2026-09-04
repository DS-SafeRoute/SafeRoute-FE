import type * as React from 'react';

import { useLocation, useNavigate } from 'react-router';

import LogoutIcon from '@assets/icons/ic-logout.svg?react';
import LogoIcon from '@assets/icons/logo.svg?react';

import { ROUTES } from '@constants/path';

import * as styles from './Sidebar.css';

interface SidebarProps {
  brand: string;
  menuItems: Array<{
    label: string;
    icon: React.ComponentType<React.ComponentProps<'svg'>>;
    path?: string;
    items?: Array<{
      label: string;
      icon: React.ComponentType<React.ComponentProps<'svg'>>;
      path: string;
    }>;
  }>;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

const Sidebar = ({ brand, menuItems, onLogout, isLoggingOut = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      void navigate(path);
    }
  };

  return (
    <aside className={styles.container}>
      <button onClick={() => handleNavigate(ROUTES.HOME)} aria-label="홈으로 이동">
        <header className={styles.header}>
          <LogoIcon className={styles.logo} aria-hidden="true" focusable="false" />
          <strong className={styles.brand}>{brand}</strong>
        </header>
      </button>

      <nav aria-label="사이드바 메뉴" className={styles.navigation}>
        <ul className={styles.list}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const subItems = item.items;

            if (subItems) {
              return (
                <li key={item.label} className={styles.group}>
                  <div className={styles.groupLabel}>
                    <Icon className={styles.icon} aria-hidden="true" focusable="false" />
                    <span>{item.label}</span>
                  </div>

                  <ul className={styles.groupList}>
                    {subItems.map((child) => {
                      const ChildIcon = child.icon;
                      const isActive =
                        child.path === '/'
                          ? location.pathname === child.path
                          : location.pathname === child.path ||
                            location.pathname.startsWith(`${child.path}/`);

                      return (
                        <li key={child.label}>
                          <button
                            type="button"
                            onClick={() => handleNavigate(child.path)}
                            className={styles.item({ active: isActive })}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <ChildIcon
                              className={styles.icon}
                              aria-hidden="true"
                              focusable="false"
                            />
                            <span>{child.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            }

            const isActive =
              item.path === '/'
                ? location.pathname === item.path
                : location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path ?? ''}/`);

            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.path) {
                      handleNavigate(item.path);
                    }
                  }}
                  className={styles.item({ active: isActive })}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={styles.icon} aria-hidden="true" focusable="false" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className={styles.footer}>
        <button
          type="button"
          onClick={onLogout}
          className={styles.item()}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          <LogoutIcon className={styles.icon} aria-hidden="true" focusable="false" />
          <span>로그아웃</span>
        </button>
      </footer>
    </aside>
  );
};

export default Sidebar;
