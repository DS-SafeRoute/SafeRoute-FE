export type BuildingStatus = 'normal' | 'warning';

export interface Organization {
  id: number;
  name: string;
  address: string;
  registeredAt: string;
  isRepresentative: boolean;
}

export interface Building {
  id: number;
  name: string;
  area: number;
  status: BuildingStatus;
  lastTrainingDate: string;
  aboveFloors: number;
  belowFloors: number;
  cctvTotal: number;
  cctvOnline: number;
  iotTotal: number;
  iotOnline: number;
}
