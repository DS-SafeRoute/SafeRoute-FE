import type { Floor, FloorBuilding } from '../types/floorPlans';

const BASE = '/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export type BuildingSummary = { id: number; name: string };

export async function getBuildings(): Promise<BuildingSummary[]> {
  return request<BuildingSummary[]>(`${BASE}/buildings`);
}

export async function getBuildingFloors(buildingId: number): Promise<Floor[]> {
  return request<Floor[]>(`${BASE}/floors?buildingId=${buildingId}`);
}

export async function getFloorDetail(floorId: number): Promise<Floor> {
  return request<Floor>(`${BASE}/floors/${floorId}`);
}

/** 목록 페이지용: 모든 건물 + 해당 도면 목록을 한 번에 가져옴 */
export async function getFloorBuildings(): Promise<FloorBuilding[]> {
  const buildings = await getBuildings();
  const results = await Promise.all(
    buildings.map(async (b) => {
      const floors = await getBuildingFloors(b.id);
      return { ...b, floors } satisfies FloorBuilding;
    }),
  );
  return results;
}

export async function uploadFloor(
  buildingId: number,
  floorNum: number,
  file: File,
): Promise<Floor> {
  const form = new FormData();
  form.append('buildingId', String(buildingId));
  form.append('floorNum', String(floorNum));
  form.append('mapImage', file);
  return request<Floor>(`${BASE}/floors`, { method: 'POST', body: form });
}

export async function deleteFloor(floorId: number): Promise<void> {
  await fetch(`${BASE}/floors/${floorId}`, { method: 'DELETE' });
}
