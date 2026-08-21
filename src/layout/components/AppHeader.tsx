import { useState } from 'react';

import { useLocation } from 'react-router';

import type { UpdateUserProfileRequest } from '@apis/__generated__/data-contracts';
import { useMyProfileQuery } from '@apis/users/useMyProfileQuery';
import { useUpdateMyProfileMutation } from '@apis/users/useUpdateMyProfileMutation';

import GNB from '@components/gnb';
import MyPageModal from '@components/myPageModal/MyPageModal';
import useToast from '@components/toast/useToast';

import { getGNBConfig } from '@constants/gnbConfig';

const USER_ROLE_LABEL = {
  MANAGER: '관리자',
  NORMAL: '일반 사용자',
} as const;

const AppHeader = () => {
  const location = useLocation();
  const { show } = useToast();
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const { data: currentUser, isPending: isProfileLoading } = useMyProfileQuery();
  const updateMyProfileMutation = useUpdateMyProfileMutation();
  const gnbConfig = getGNBConfig(location);

  const handleSaveProfile = async (form: UpdateUserProfileRequest) => {
    if (!currentUser) return;

    try {
      await updateMyProfileMutation.mutateAsync(form);
      show({ title: '회원 정보가 수정되었습니다.', variant: 'success' });
      setIsMyPageOpen(false);
    } catch {
      show({ title: '회원 정보 수정에 실패했습니다.', variant: 'error' });
    }
  };

  const handleProfileClick = () => {
    if (isProfileLoading) return;

    if (!currentUser) {
      show({ title: '회원 정보를 불러오지 못했습니다.', variant: 'error' });
      return;
    }

    setIsMyPageOpen(true);
  };

  return (
    <>
      <GNB
        {...gnbConfig}
        userName={currentUser?.username ?? ''}
        userRole={currentUser?.role ? USER_ROLE_LABEL[currentUser.role] : undefined}
        onProfileClick={handleProfileClick}
      />

      <MyPageModal
        open={isMyPageOpen}
        profile={currentUser}
        isLoading={isProfileLoading || !currentUser}
        isSaving={updateMyProfileMutation.isPending}
        onClose={() => setIsMyPageOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default AppHeader;
