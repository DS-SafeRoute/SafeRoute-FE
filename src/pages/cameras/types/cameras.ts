export type CameraStatus = 'online' | 'offline';

// 카메라 추가/수정 폼의 건물·층 선택용 — 건물관리 도메인의 실제 API 타입과는 분리된, 이 페이지 전용 목업 타입
export interface CameraBuildingOption {
  id: number;
  name: string;
  aboveFloors: number;
  belowFloors: number;
}

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
