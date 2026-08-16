export type CameraStatus = 'online' | 'offline';

export interface Camera {
  id: number;
  name: string;
  buildingId: number;
  buildingName: string;
  floorId: number;
  floor: number;
  zone: string;
  rtspUrl: string;
  username: string;
  password: string;
  ipAddress: string;
  isActive: boolean;
  status: CameraStatus;
  fps: number;
}
