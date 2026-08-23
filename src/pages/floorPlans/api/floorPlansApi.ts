import { getBuildings } from '@pages/buildings/api/buildingsApi';

import type { FloorResponse } from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type { Floor, FloorBuilding, SegmentationStatus } from '../types/floorPlans';

const BASE = '/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

// mapImageKey(S3 key) → 브라우저에서 바로 쓸 수 있는 URL로 변환하는 규칙이 아직 팀 확인 전이라
// 우선 key를 그대로 반환함. 실제 이미지가 안 뜰 수 있음 — 규칙 확정되면 여기만 고치면 됨
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

export async function uploadFloor(
  buildingId: string,
  floorNum: number,
  file: File,
): Promise<Floor> {
  const form = new FormData();
  form.append('buildingId', buildingId);
  form.append('floorNum', String(floorNum));
  form.append('mapImage', file);
  return request<Floor>(`${BASE}/floors`, { method: 'POST', body: form });
}

export async function deleteFloor(floorId: string): Promise<void> {
  const res = await fetch(`${BASE}/floors/${floorId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}: DELETE /floors/${floorId}`);
}

export type SegmentationResponse = { status: SegmentationStatus };

export async function segmentFloor(
  floorId: string,
  params: { realWidth: number; realHeight: number; gridScale: number },
): Promise<SegmentationResponse> {
  return request<SegmentationResponse>(`${BASE}/floors/${floorId}/segment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}
