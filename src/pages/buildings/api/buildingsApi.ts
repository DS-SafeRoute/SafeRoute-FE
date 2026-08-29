import type {
  BuildingResponse,
  CreateBuildingRequest,
  UpdateBuildingRequest,
} from '@apis/__generated__/data-contracts';
import { request, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type { Building } from '../types/buildings';

// 필수 필드가 비어 있으면 상세 조회/수정/삭제 요청에 잘못된 id가 쓰이는 등 오류가 조용히 전파되므로, 기본값으로 채우지 않고 즉시 에러를 던짐
export const toBuilding = (response: BuildingResponse): Building => {
  const {
    id,
    name,
    address,
    buildingType,
    groundFloorCount,
    basementFloorCount,
    totalFloors,
    isActive,
    lastTrainedAt,
  } = response;
  if (
    !id ||
    !name ||
    !address ||
    !buildingType ||
    groundFloorCount === undefined ||
    basementFloorCount === undefined ||
    totalFloors === undefined ||
    isActive === undefined
  ) {
    throw new Error('건물 응답에 필수 필드가 누락되었습니다.');
  }
  return {
    id,
    name,
    address,
    buildingType,
    groundFloorCount,
    basementFloorCount,
    totalFloors,
    isActive,
    lastTrainedAt: lastTrainedAt ?? null,
  };
};

export const getBuildings = async () => {
  const buildings = await request<BuildingResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.BUILDINGS.ROOT,
  });
  return buildings.map(toBuilding);
};

export const getBuilding = async (buildingId: string) => {
  const building = await request<BuildingResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.BUILDINGS.DETAIL(buildingId),
  });
  return toBuilding(building);
};

export const postBuilding = async (body: CreateBuildingRequest) => {
  const building = await request<BuildingResponse, CreateBuildingRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.BUILDINGS.ROOT,
    body,
  });
  return toBuilding(building);
};

export const putBuilding = async (buildingId: string, body: UpdateBuildingRequest) => {
  const building = await request<BuildingResponse, UpdateBuildingRequest>({
    method: HTTP_METHOD.PUT,
    url: API_ENDPOINTS.BUILDINGS.DETAIL(buildingId),
    body,
  });
  return toBuilding(building);
};

export const deleteBuilding = (buildingId: string) => {
  return request<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.BUILDINGS.DETAIL(buildingId),
  });
};
