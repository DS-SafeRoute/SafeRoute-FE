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
  // CCTV/IoT 등록 대수는 건물 응답에 없음 — BuildingCard가 useBuildingDeviceStatsQuery로
  // 층별 목록을 합산해 직접 표시함
}
