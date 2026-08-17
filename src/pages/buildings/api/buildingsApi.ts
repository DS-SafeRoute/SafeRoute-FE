import type {
  BuildingResponse,
  CreateBuildingRequest,
  UpdateBuildingRequest,
} from '@apis/__generated__/data-contracts';
import { request, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type { Building } from '../types/buildings';

// BuildingResponse는 스펙상 전 필드가 optional이라, 응답이 실제로 비어있는 경우를 대비해 기본값을 채워 UI가 다루기 쉬운 형태로 변환
export const toBuilding = (response: BuildingResponse): Building => ({
  id: response.id ?? '',
  name: response.name ?? '',
  address: response.address ?? '',
  buildingType: response.buildingType ?? 'CLASSROOM',
  totalFloors: response.totalFloors ?? 0,
  isActive: response.isActive ?? true,
  lastTrainedAt: response.lastTrainedAt ?? null,
});

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

export const createBuilding = async (body: CreateBuildingRequest) => {
  const building = await request<BuildingResponse, CreateBuildingRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.BUILDINGS.ROOT,
    body,
  });
  return toBuilding(building);
};

export const updateBuilding = async (buildingId: string, body: UpdateBuildingRequest) => {
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
