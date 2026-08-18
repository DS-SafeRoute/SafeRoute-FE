import type { BuildingType } from '../types/buildings';

export const BUILDING_TYPE_OPTIONS = [
  { value: 'CLASSROOM', label: '교실' },
  { value: 'CAFETERIA', label: '식당' },
  { value: 'LIBRARY', label: '도서관' },
  { value: 'DORMITORY', label: '기숙사' },
  { value: 'GYM', label: '체육관' },
] as const satisfies readonly { value: BuildingType; label: string }[];
