import { http, HttpResponse } from 'msw';

import { mockFloorBuildings } from '@pages/floorPlans/mocks/floorPlansData';

const BASE = '/api/v1';

export const handlers = [
  /* ── 건물 목록 ── */
  http.get(`${BASE}/buildings`, () => {
    const buildings = mockFloorBuildings.map(({ id, name }) => ({ id, name }));
    return HttpResponse.json({ data: buildings });
  }),

  /* ── 건물별 도면 목록 ── */
  http.get(`${BASE}/floors`, ({ request }) => {
    const buildingId = Number(new URL(request.url).searchParams.get('buildingId'));
    const building = mockFloorBuildings.find((b) => b.id === buildingId);
    if (!building) return HttpResponse.json({ data: [] });
    return HttpResponse.json({ data: building.floors });
  }),

  /* ── 도면 상세 조회 ── */
  http.get(`${BASE}/floors/:floorId`, ({ params }) => {
    const floorId = Number(params.floorId);
    for (const building of mockFloorBuildings) {
      const floor = building.floors.find((f) => f.id === floorId);
      if (floor) return HttpResponse.json({ data: floor });
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  /* ── 도면 업로드 ── */
  http.post(`${BASE}/floors`, async ({ request }) => {
    const form = await request.formData();
    const buildingId = Number(form.get('buildingId'));
    const floorNum = Number(form.get('floorNum'));
    const building = mockFloorBuildings.find((b) => b.id === buildingId);
    const floor = building?.floors.find((f) => f.floorNum === floorNum);
    if (!floor) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    const newFloor = {
      ...floor,
      segmentationStatus: 'PENDING' as const,
      processedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newFloor });
  }),

  /* ── 도면 삭제 ── */
  http.delete(`${BASE}/floors/:floorId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
