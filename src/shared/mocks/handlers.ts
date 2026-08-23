import { http, HttpResponse } from 'msw';

import { mockFloorBuildings } from '@pages/floorPlans/mocks/floorPlansData';

const BASE = '/api/v1';

export const handlers = [
  // 건물 목록/도면 조회는 실제 API로 연동돼서 관련 mock 핸들러 제거함 (건물관리 페이지 실제 API와 충돌 방지)

  /* ── 도면 업로드 ── */
  http.post(`${BASE}/floors`, async ({ request }) => {
    const form = await request.formData();
    const buildingId = String(form.get('buildingId'));
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

  /* ── AI 세그멘테이션 요청 ── */
  http.post(`${BASE}/floors/:floorId/segment`, () => {
    return HttpResponse.json({ data: { status: 'PROCESSING' } });
  }),

  /* ── AI 세그멘테이션 상태 조회 (3초 후 DONE 시뮬레이션) ── */
  (() => {
    const startTimes = new Map<string, number>();
    return http.get(`${BASE}/floors/:floorId/segment/status`, ({ params }) => {
      const id = String(params.floorId);
      const now = Date.now();
      if (!startTimes.has(id)) startTimes.set(id, now);
      const elapsed = now - (startTimes.get(id) ?? now);
      const status = elapsed >= 3000 ? 'DONE' : 'PROCESSING';
      if (status === 'DONE') startTimes.delete(id);
      return HttpResponse.json({ data: { status } });
    });
  })(),
];
