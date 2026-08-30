export const formatFloor = (n: number): string => {
  if (n > 0) return `${n}층`;
  if (n < 0) return `B${Math.abs(n)}층`;
  return 'B1층';
};

// 백엔드 segmentationStatus에는 '아직 업로드 안 됨'에 해당하는 값이 없어서(NONE 없음),
// 도면 등록 여부는 mapImageUrl 유무로 판단해야 함 — 여러 파일에서 각자 반복하지 않도록 여기 모음
export const hasFloorPlan = (floor: { mapImageUrl: string | null }): boolean => !!floor.mapImageUrl;
