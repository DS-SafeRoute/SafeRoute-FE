export type BuildingType = 'CLASSROOM' | 'CAFETERIA' | 'LIBRARY' | 'DORMITORY' | 'GYM';

export interface Building {
  id: string;
  name: string;
  address: string;
  buildingType: BuildingType;
  // 서버가 계산하는 읽기 전용 값으로, 층 추가·삭제 결과를 반영한다.
  groundFloorCount: number;
  basementFloorCount: number;
  totalFloors: number;
  isActive: boolean;
  lastTrainedAt: string | null;
}
