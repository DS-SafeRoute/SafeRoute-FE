import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { useLogoutMutation } from '@apis/auth/useLogoutMutation';

import Sidebar from '@components/sideBar/Sidebar';
import useToast from '@components/toast/useToast';

import { ROUTES } from '@constants/path';
import { sidebarItems } from '@constants/sidebar';

import { clearAccessToken } from '@shared/auth/tokenStorage';

const AppSidebar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      show({ title: '로그아웃되었습니다.', variant: 'success' });
    } catch {
      show({
        title: '서버 로그아웃에 실패했지만 이 기기에서는 로그아웃되었습니다.',
        variant: 'error',
      });
    } finally {
      clearAccessToken();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return (
    <Sidebar
      brand="SAFE ROUTE"
      menuItems={sidebarItems}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    />
  );
};

export default AppSidebar;
