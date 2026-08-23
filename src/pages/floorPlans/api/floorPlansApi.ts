import { getBuildings } from '@pages/buildings/api/buildingsApi';

import type { CreateFloorRequest, FloorResponse } from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type { Floor, FloorBuilding } from '../types/floorPlans';

// 백엔드에서 도면별 presigned GET URL 발급 API를 추가 예정(2026-08-24 확인, 일정 미정) — 그 전까지는
// key를 그대로 반환함. 실제 이미지가 안 뜰 수 있음. API 나오면 이 함수를 그 호출로 바꾸면 됨(비동기 전환 필요)
const resolveFloorImageUrl = (mapImageKey?: string): string | null => {
  if (!mapImageKey) return null;
  if (import.meta.env.DEV) {
    console.warn(
      '[floorPlansApi] mapImageKey → URL 변환 규칙이 미확정 상태라 key를 그대로 사용 중:',
      mapImageKey,
    );
  }
  return mapImageKey;
};

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
    mapImageUrl: resolveFloorImageUrl(mapImageKey),
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
export async function createFloor(buildingId: string, floorNum: number): Promise<Floor> {
  const floor = await apiRequest<FloorResponse, CreateFloorRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.FLOORS.ROOT(buildingId),
    body: { floorNum },
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
