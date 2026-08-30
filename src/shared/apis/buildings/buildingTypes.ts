export type BuildingType = 'CLASSROOM' | 'CAFETERIA' | 'LIBRARY' | 'DORMITORY' | 'GYM';

export interface Building {
  id: string;
  name: string;
  address: string;
  buildingType: BuildingType;
  groundFloorCount: number;
  basementFloorCount: number;
  totalFloors: number;
  isActive: boolean;
  lastTrainedAt: string | null;
  cctvTotal?: number;
  cctvOnline?: number;
  iotTotal?: number;
  iotOnline?: number;
}
