import type { UserZoneCreateRequest, UserZoneResponse } from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';
import { toUserZone } from '@apis/floors/userZoneApi';
import type { UserZone } from '@apis/floors/userZoneApi';

export { getFloorUserZones, getUserZoneDetail } from '@apis/floors/userZoneApi';
export type { UserZone, UserZoneCellRef, UserZoneDetail } from '@apis/floors/userZoneApi';

export async function createUserZone(
  floorId: string,
  body: UserZoneCreateRequest,
): Promise<UserZone> {
  const response = await apiRequest<UserZoneResponse, UserZoneCreateRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.USER_ZONES.ROOT(floorId),
    body,
  });
  return toUserZone(response);
}

// 이 엔드포인트만 스웨거상 200 응답에 본문이 없음(다른 삭제 API들은 ApiResponseVoid로
// 감싸서 내려줌) — 기본(wrapped) 모드로 받으면 빈 응답을 isSuccess 있는 객체로 잘못 해석해
// 실제로는 성공한 삭제를 실패로 표시하는 버그가 있었음(새로고침하면 지워져 있던 이유)
export async function deleteUserZone(floorId: string, userZoneId: string): Promise<void> {
  await apiRequest<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.USER_ZONES.DETAIL(floorId, userZoneId),
    responseMode: 'raw',
  });
}
