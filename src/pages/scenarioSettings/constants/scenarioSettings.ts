export const SCENARIO_BUILDING_OPTIONS = [
  'A동 · 본관 · 3층',
  'A동 · 본관 · 5층',
  'B동 · 별관 · 4층',
  'C동 · 연구동 · 2층',
] as const;

export const FIRE_ORIGIN_OPTIONS = [
  '305호 · 동측 창가',
  '302호 · 중앙 복도',
  '301호 · 서측 출입문',
  '복도 천장 센서 구역',
] as const;

export const FIRE_SPREAD_OPTIONS = ['낮음 (0.6 m/s)', '중간 (1.2 m/s)', '높음 (1.8 m/s)'] as const;

export const SMOKE_DENSITY_OPTIONS = ['낮음', '보통', '높음'] as const;

export const GUIDE_LIGHT_OPTIONS = ['없음', '북측 차단', '서측 차단', '전구간 차단'] as const;
