export type BuildingType = 'CLASSROOM' | 'CAFETERIA' | 'LIBRARY' | 'DORMITORY' | 'GYM';

export interface Building {
  id: string;
  name: string;
  address: string;
  buildingType: BuildingType;
  totalFloors: number;
  isActive: boolean;
  lastTrainedAt: string | null;
  // CCTV/IoT 집계를 내려주는 API가 아직 없어서 당분간 옵셔널로 둠 (팀 논의 대기)
  cctvTotal?: number;
  cctvOnline?: number;
  iotTotal?: number;
  iotOnline?: number;
}
