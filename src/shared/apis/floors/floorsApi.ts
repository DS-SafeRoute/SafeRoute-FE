import type { FloorImageUrlResponse, FloorResponse } from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

export interface BuildingFloor {
  id: string;
  floorNum: number;
  mapImageKey: string | null;
  segmentationStatus: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
  processedAt: string | null;
}

export interface FloorImageUrl {
  imageUrl: string;
  expiresAt: string;
}

const toBuildingFloor = (response: FloorResponse): BuildingFloor => {
  const { id, floorNum, segmentationStatus } = response;
  if (!id || floorNum === undefined || !segmentationStatus) {
    throw new Error('층 응답에 필수 필드가 누락되었습니다.');
  }

  return {
    id,
    floorNum,
    mapImageKey: response.mapImageKey ?? null,
    segmentationStatus,
    processedAt: response.processedAt ?? null,
  };
};

export const getBuildingFloors = async (buildingId: string, signal?: AbortSignal) => {
  const floors = await request<FloorResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOORS.ROOT(buildingId),
    signal,
  });

  return floors.map(toBuildingFloor);
};

export const getFloorImageUrl = async (
  buildingId: string,
  floorId: string,
  signal?: AbortSignal,
): Promise<FloorImageUrl> => {
  const response = await request<FloorImageUrlResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOORS.IMAGE_URL(buildingId, floorId),
    signal,
  });
  const { imageUrl, expiresAt } = response;
  if (!imageUrl || !expiresAt) {
    throw new Error('도면 이미지 URL 응답에 필수 필드가 누락되었습니다.');
  }

  return { imageUrl, expiresAt };
};
