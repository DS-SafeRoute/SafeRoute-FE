import { useCallback, useState } from 'react';

import { Outlet, useLocation } from 'react-router';

import GNB from '@components/gnb';
import MyPageModal from '@components/myPageModal/MyPageModal';
import Sidebar from '@components/sideBar/Sidebar';

import { getGNBConfig } from '@constants/gnbConfig';
import { sidebarItems } from '@constants/sidebar';

import * as styles from './AppLayout.css';

const currentUser = {
  name: '김안전',
  role: '관리자',
};

const AppLayout = () => {
  const location = useLocation();
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState(currentUser.name);
  const gnbConfig = getGNBConfig(location);

  const handleProfileClick = useCallback(() => {
    setSelectedUserName(currentUser.name);
    setIsMyPageOpen(true);
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar brand="SAFE ROUTE" menuItems={sidebarItems} onLogout={() => undefined} />

      <main className={styles.main}>
        <GNB
          {...gnbConfig}
          userName={currentUser.name}
          userRole={currentUser.role}
          onProfileClick={handleProfileClick}
        />
        <Outlet />
      </main>

      <MyPageModal
        open={isMyPageOpen}
        initialName={selectedUserName}
        onClose={() => setIsMyPageOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
