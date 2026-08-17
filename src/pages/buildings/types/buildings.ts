export interface Organization {
  id: number;
  name: string;
  address: string;
}

export interface Building {
  id: number;
  name: string;
  area: number;
  lastTrainingDate: string;
  aboveFloors: number;
  belowFloors: number;
  cctvTotal: number;
  cctvOnline: number;
  iotTotal: number;
  iotOnline: number;
}
