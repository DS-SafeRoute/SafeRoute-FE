import { Outlet } from 'react-router';

import Sidebar from '@components/sideBar/Sidebar';

import { sidebarItems } from '@constants/sidebar';

import * as styles from './AppLayout.css';

const AppLayout = () => (
  <div className={styles.container}>
    <Sidebar brand="SAFE ROUTE" menuItems={sidebarItems} onLogout={() => undefined} />

    <main className={styles.main}>
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
