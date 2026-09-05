import type {
  AllUserZoneResponse,
  CellResponse,
  UserZoneCellsResponse,
  UserZoneResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
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

export const toUserZone = (response: UserZoneResponse): UserZone => {
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

export const getFloorUserZones = async (
  floorId: string,
  signal?: AbortSignal,
): Promise<UserZone[]> => {
  const response = await request<AllUserZoneResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.USER_ZONES.ROOT(floorId),
    signal,
  });
  return (response.userzones ?? []).map(toUserZone);
};

// 목록 조회(getFloorUserZones)는 이름만 내려주고 셀 정보가 없어서, 실제로 그려주려면 구역마다 상세를 따로 조회해야 함
export const getUserZoneDetail = async (
  floorId: string,
  userZoneId: string,
  signal?: AbortSignal,
): Promise<UserZoneDetail> => {
  const response = await request<UserZoneCellsResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.USER_ZONES.DETAIL(floorId, userZoneId),
    signal,
  });
  if (!response.response) {
    throw new Error('사용자 지정 영역 상세 응답에 필수 필드가 누락되었습니다.');
  }
  const zone = toUserZone(response.response);
  return { ...zone, cells: (response.cells ?? []).map(toUserZoneCellRef) };
};
