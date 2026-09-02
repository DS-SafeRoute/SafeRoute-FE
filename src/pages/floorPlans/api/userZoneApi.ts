import type {
  AllUserZoneResponse,
  CellResponse,
  UserZoneCellsResponse,
  UserZoneCreateRequest,
  UserZoneResponse,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface UserZone {
  id: string;
  name: string;
  floorNum: number;
}

export interface UserZoneCellRef {
  cellId: string;
  rowIndex: number;
  columnIndex: number;
}

export interface UserZoneDetail extends UserZone {
  cells: UserZoneCellRef[];
}

const toUserZone = (response: UserZoneResponse): UserZone => {
  const { userZoneId, userZoneName, floorNum } = response;
  if (!userZoneId || !userZoneName || floorNum === undefined) {
    throw new Error('사용자 지정 영역 응답에 필수 필드가 누락되었습니다.');
  }
  return { id: userZoneId, name: userZoneName, floorNum };
};

const toUserZoneCellRef = (response: CellResponse): UserZoneCellRef => {
  const { cellId, rowIndex, columnIndex } = response;
  if (!cellId || rowIndex === undefined || columnIndex === undefined) {
    throw new Error('사용자 지정 영역 셀 응답에 필수 필드가 누락되었습니다.');
  }
  return { cellId, rowIndex, columnIndex };
};

export async function getFloorUserZones(floorId: string): Promise<UserZone[]> {
  const response = await apiRequest<AllUserZoneResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.USER_ZONES.ROOT(floorId),
  });
  return (response.userzones ?? []).map(toUserZone);
}

// 목록 조회(getFloorUserZones)는 이름만 내려주고 셀 정보가 없어서, 실제로 그려주려면 구역마다 상세를 따로 조회해야 함
export async function getUserZoneDetail(
  floorId: string,
  userZoneId: string,
): Promise<UserZoneDetail> {
  const response = await apiRequest<UserZoneCellsResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.USER_ZONES.DETAIL(floorId, userZoneId),
  });
  if (!response.response) {
    throw new Error('사용자 지정 영역 상세 응답에 필수 필드가 누락되었습니다.');
  }
  const zone = toUserZone(response.response);
  return { ...zone, cells: (response.cells ?? []).map(toUserZoneCellRef) };
}

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
