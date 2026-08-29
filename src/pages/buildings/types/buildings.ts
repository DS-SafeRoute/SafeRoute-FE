export type BuildingType = 'CLASSROOM' | 'CAFETERIA' | 'LIBRARY' | 'DORMITORY' | 'GYM';

export interface Building {
  id: string;
  name: string;
  address: string;
  buildingType: BuildingType;
  // 셋 다 서버가 계산하는 읽기 전용 값 — totalFloors = groundFloorCount + basementFloorCount,
  // 층수는 건물 등록/수정 요청으로는 바꿀 수 없고 오직 Floor 추가/삭제로만 변함
  groundFloorCount: number;
  basementFloorCount: number;
  totalFloors: number;
  isActive: boolean;
  lastTrainedAt: string | null;
  // CCTV/IoT 집계를 내려주는 API가 아직 없어서 당분간 옵셔널로 둠 (팀 논의 대기)
  cctvTotal?: number;
  cctvOnline?: number;
  iotTotal?: number;
  iotOnline?: number;
}
