export type CameraStatus = 'online' | 'offline';

export interface Camera {
  id: number;
  name: string;
  buildingId: number;
  buildingName: string;
  floor: number;
  zone: string;
  rtspUrl: string;
  username: string;
  password: string;
  status: CameraStatus;
  ipAddress: string;
  fps: number;
}
