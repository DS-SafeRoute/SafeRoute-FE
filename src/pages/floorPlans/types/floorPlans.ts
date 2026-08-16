export type SegmentationStatus = 'NONE' | 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export type DeviceType = 'cctv' | 'iot' | 'fire';

export type PoiType = 'exit' | 'stair' | 'fire_zone';

export type EditMode = 'view' | 'poi' | 'simulation';

export type AiLayer = 'wall' | 'corridor' | 'stairwell' | 'exit' | 'room';

export interface DeviceMarker {
  id: string;
  type: DeviceType;
  label: string;
  x: number;
  y: number;
  model?: string;
  status: 'online' | 'offline';
  resolution?: string;
  zone: string;
}

export interface PoiMarker {
  id: string;
  type: PoiType;
  label: string;
  x: number;
  y: number;
}

export interface Floor {
  id: number;
  buildingId: number;
  floorNum: number;
  mapImageUrl: string | null;
  segmentationStatus: SegmentationStatus;
  processedAt: string | null;
  devices: DeviceMarker[];
  pois: PoiMarker[];
}

export interface FloorBuilding {
  id: number;
  name: string;
  floors: Floor[];
}
