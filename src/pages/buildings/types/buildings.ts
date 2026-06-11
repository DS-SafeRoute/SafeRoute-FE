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
  status: BuildingStatus;
  lastTrainingDate: string;
  totalFloors: number;
  cctvTotal: number;
  cctvOnline: number;
  iotTotal: number;
  iotOnline: number;
}
