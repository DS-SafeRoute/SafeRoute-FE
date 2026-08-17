import type {
  BuildingResponse,
  CreateBuildingRequest,
  UpdateBuildingRequest,
} from '@apis/__generated__/data-contracts';
import { request, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export const getBuildings = () => {
  return request<BuildingResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.BUILDINGS.ROOT,
  });
};

export const getBuilding = (buildingId: string) => {
  return request<BuildingResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.BUILDINGS.DETAIL(buildingId),
  });
};

export const createBuilding = (body: CreateBuildingRequest) => {
  return request<BuildingResponse, CreateBuildingRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.BUILDINGS.ROOT,
    body,
  });
};

export const updateBuilding = (buildingId: string, body: UpdateBuildingRequest) => {
  return request<BuildingResponse, UpdateBuildingRequest>({
    method: HTTP_METHOD.PUT,
    url: API_ENDPOINTS.BUILDINGS.DETAIL(buildingId),
    body,
  });
};

export const deleteBuilding = (buildingId: string) => {
  return request<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.BUILDINGS.DETAIL(buildingId),
  });
};
