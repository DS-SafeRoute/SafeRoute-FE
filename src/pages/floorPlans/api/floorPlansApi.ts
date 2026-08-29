import { getBuildings } from '@pages/buildings/api/buildingsApi';

import type { FloorImageUrlResponse, FloorResponse } from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type { Floor, FloorBuilding } from '../types/floorPlans';

// devices/pois는 CCTV·IoT·맵그래프 API 연동 전까지 빈 배열로 둠 (다음 단위에서 채울 예정)
export const toFloor = (response: FloorResponse, buildingId: string): Floor => {
  const { id, floorNum, segmentationStatus, processedAt, mapImageKey } = response;
  if (!id || floorNum === undefined || !segmentationStatus) {
    throw new Error('층 응답에 필수 필드가 누락되었습니다.');
  }
  return {
    id,
    buildingId,
    floorNum,
    // 목록/사이드바 등에서는 "도면이 등록됐는지"만 boolean으로 판단하면 되고 실제 이미지를 그리지는
    // 않아서, mapImageKey 존재 여부만 truthy 값으로 씀(도면 개수만큼 presigned URL을 미리 다
    // 발급받는 낭비를 피하기 위함). 실제 화면에 그릴 이미지 URL은 getFloorImageUrl로 따로 조회
    mapImageUrl: mapImageKey ?? null,
    segmentationStatus,
    processedAt: processedAt ?? null,
    devices: [],
    pois: [],
  };
};

export async function getBuildingFloors(buildingId: string): Promise<Floor[]> {
  const floors = await apiRequest<FloorResponse[]>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOORS.ROOT(buildingId),
  });
  return floors.map((f) => toFloor(f, buildingId));
}

export async function getFloorDetail(buildingId: string, floorId: string): Promise<Floor> {
  const floor = await apiRequest<FloorResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOORS.DETAIL(buildingId, floorId),
  });
  return toFloor(floor, buildingId);
}

/** 목록 페이지용: 모든 건물 + 해당 도면 목록을 한 번에 가져옴 */
export async function getFloorBuildings(): Promise<FloorBuilding[]> {
  const buildings = await getBuildings();
  const results = await Promise.all(
    buildings.map(async (b) => {
      const floors = await getBuildingFloors(b.id);
      return { id: b.id, name: b.name, floors } satisfies FloorBuilding;
    }),
  );
  return results;
}

// 도면 이미지 없이 층 번호만 먼저 등록 — 새 건물처럼 층이 하나도 없을 때 업로드 카드가 뜰 자리를 만들기 위함
// 이 엔드포인트는 스웨거상 requestBody가 없고 floorNum을 쿼리 파라미터로 받음(JSON body 아님)
export async function createFloor(buildingId: string, floorNum: number): Promise<Floor> {
  const floor = await apiRequest<FloorResponse>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.FLOORS.ROOT(buildingId),
    query: { floorNum },
  });
  return toFloor(floor, buildingId);
}

export async function uploadFloor(
  buildingId: string,
  floorNum: number,
  file: File,
  realWidth: number,
  realHeight: number,
): Promise<Floor> {
  const form = new FormData();
  form.append('floorNum', String(floorNum));
  form.append('realWidth', String(realWidth));
  form.append('realHeight', String(realHeight));
  form.append('file', file);
  const floor = await apiRequest<FloorResponse, FormData>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.FLOORS.UPLOAD(buildingId),
    body: form,
  });
  return toFloor(floor, buildingId);
}

export async function deleteFloor(buildingId: string, floorId: string): Promise<void> {
  await apiRequest<void>({
    method: HTTP_METHOD.DELETE,
    url: API_ENDPOINTS.FLOORS.DETAIL(buildingId, floorId),
  });
}

// 세그멘테이션 요청 자체는 비동기로 처리되고 결과는 별도 폴링/조회로 반영되는 구조라 응답 바디를 쓰지 않음
export async function analyzeFloor(floorId: string): Promise<void> {
  await apiRequest<unknown>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.FLOORS.ANALYZE(floorId),
  });
}

export interface FloorImageUrl {
  imageUrl: string;
  expiresAt: string;
}

// 실제 캔버스에 그릴 도면 이미지의 presigned URL — 상세페이지에서 조회 중인 층 하나에 대해서만 호출
// (목록 페이지에서 도면마다 미리 다 발급받으면 낭비라 getBuildingFloors/toFloor에는 안 넣음)
export async function getFloorImageUrl(
  buildingId: string,
  floorId: string,
): Promise<FloorImageUrl> {
  const response = await apiRequest<FloorImageUrlResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.FLOORS.IMAGE_URL(buildingId, floorId),
  });
  const { imageUrl, expiresAt } = response;
  if (!imageUrl || !expiresAt) {
    throw new Error('도면 이미지 URL 응답에 필수 필드가 누락되었습니다.');
  }
  return { imageUrl, expiresAt };
}
