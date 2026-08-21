import type {
  UpdateUserProfileRequest,
  UserProfileResponse,
} from '@apis/__generated__/data-contracts';
import { request, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export const getMyProfile = () => {
  return request<UserProfileResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.USERS.ME,
  });
};

export const patchMyProfile = (body: UpdateUserProfileRequest) => {
  return request<UserProfileResponse, UpdateUserProfileRequest>({
    method: HTTP_METHOD.PATCH,
    url: API_ENDPOINTS.USERS.ME,
    body,
  });
};
