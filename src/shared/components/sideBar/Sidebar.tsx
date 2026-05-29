import type * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import LogoIcon from '@/shared/assets/icons/logo.svg?react';
import LogoutIcon from '@/shared/assets/icons/ic-logout.svg?react';
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
}

const Sidebar = ({ brand, menuItems, onLogout }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      void navigate(path);
    }
  };

  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <LogoIcon className={styles.logo} aria-hidden="true" focusable="false" />
        <strong className={styles.brand}>{brand}</strong>
      </header>

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
                      const isActive = location.pathname === child.path;

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

            const isActive = location.pathname === item.path;

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
        <button type="button" onClick={onLogout} className={styles.item()}>
          <LogoutIcon className={styles.icon} aria-hidden="true" focusable="false" />
          <span>로그아웃</span>
        </button>
      </footer>
    </aside>
  );
};

export default Sidebar;
