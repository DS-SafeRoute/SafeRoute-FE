// 백엔드 enum에는 'NONE'이 없음 — 도면 미업로드 여부는 mapImageUrl 유무로 판단해야 함
export type SegmentationStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

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
  id: string;
  buildingId: string;
  floorNum: number;
  mapImageUrl: string | null;
  segmentationStatus: SegmentationStatus;
  processedAt: string | null;
  devices: DeviceMarker[];
  pois: PoiMarker[];
}

export interface FloorBuilding {
  id: string;
  name: string;
  floors: Floor[];
}
