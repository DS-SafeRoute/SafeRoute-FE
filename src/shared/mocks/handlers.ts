// 건물/도면/그리드/CCTV/IoT/맵그래프 전부 실제 API로 연동 완료돼서 관련 mock 핸들러 전부 제거함
// (옛 경로 /api/v1/floors, /api/v1/floors/:id/segment 등은 실제로 쓰는 /api/v1/buildings/:id/floors,
// /api/v1/{floorId}/analyse 와 경로가 달라 아무것도 가로채지 못하는 죽은 코드였음)
export const handlers = [];
