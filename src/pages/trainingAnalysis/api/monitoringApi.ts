import type {
  MonitoringCamera,
  MonitoringEvent,
  MonitoringFrame,
} from '@pages/trainingAnalysis/types/trainingAnalysis';

import type {
  MonitoringCameraResponse,
  MonitoringEventResponse,
  MonitoringFrameResponse,
} from '@apis/__generated__/data-contracts';
import { request as apiRequest, HTTP_METHOD } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

// 캡처된 프레임이 아직 없는 카메라는 thumbnailUrl/capturedAt/urlExpiresAt이 정상적으로 없는
// 상태라 필수값으로 취급하지 않음(카드에서 "프레임 없음"으로 표시)
const toMonitoringCamera = (response: MonitoringCameraResponse): MonitoringCamera => {
  const { cctvId, code, name, buildingName, floorName, location } = response;
  if (!cctvId || !code || !name || !buildingName || !floorName || !location) {
    throw new Error('모니터링 카메라 응답에 필수 필드가 누락되었습니다.');
  }
  return {
    cctvId,
    code,
    name,
    buildingName,
    floorName,
    location,
    thumbnailUrl: response.thumbnailUrl ?? null,
    capturedAt: response.capturedAt ?? null,
    urlExpiresAt: response.urlExpiresAt ?? null,
  };
};

// 이미지 업로드가 아직 안 끝난 프레임은 imageUrl/urlExpiresAt이 없을 수 있어서 필수값에서 뺌
const toMonitoringFrame = (response: MonitoringFrameResponse): MonitoringFrame => {
  const { frameId, capturedAt, headcount, density, congestionLevel } = response;
  if (
    !frameId ||
    capturedAt === undefined ||
    headcount === undefined ||
    density === undefined ||
    !congestionLevel
  ) {
    throw new Error('모니터링 프레임 응답에 필수 필드가 누락되었습니다.');
  }
  return {
    frameId,
    capturedAt,
    imageUrl: response.imageUrl ?? null,
    urlExpiresAt: response.urlExpiresAt ?? null,
    headcount,
    density,
    congestionLevel,
  };
};

const toMonitoringEvent = (response: MonitoringEventResponse): MonitoringEvent => {
  const { eventId, type, severity, occurredAt, cctvCode, congestionLevel, message } = response;
  if (
    !eventId ||
    !type ||
    !severity ||
    occurredAt === undefined ||
    !cctvCode ||
    !congestionLevel ||
    !message
  ) {
    throw new Error('모니터링 이벤트 응답에 필수 필드가 누락되었습니다.');
  }
  return { eventId, type, severity, occurredAt, cctvCode, congestionLevel, message };
};

// 훈련 세션의 카메라별 최신 캡처 목록 (카메라 목록 화면)
export async function getSessionCameras(
  sessionId: string,
  signal?: AbortSignal,
): Promise<MonitoringCamera[]> {
  const response = await apiRequest<{ cameras?: MonitoringCameraResponse[] }>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.TRAINING_SESSIONS.MONITORING_CAMERAS(sessionId),
    signal,
  });
  return (response.cameras ?? []).map(toMonitoringCamera);
}

export interface CameraFramesPage {
  frames: MonitoringFrame[];
  nextCursor: string | null;
  hasNext: boolean;
}

// 카메라별 프레임 목록 (최신순 커서 페이지네이션 — 프레임 상세 화면)
export async function getCameraFrames(
  sessionId: string,
  cctvId: string,
  options?: { limit?: number; cursor?: string },
  signal?: AbortSignal,
): Promise<CameraFramesPage> {
  const response = await apiRequest<{
    frames?: MonitoringFrameResponse[];
    nextCursor?: string;
    hasNext?: boolean;
  }>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.TRAINING_SESSIONS.MONITORING_FRAMES(sessionId, cctvId),
    query: { limit: options?.limit, cursor: options?.cursor },
    signal,
  });
  return {
    frames: (response.frames ?? []).map(toMonitoringFrame),
    nextCursor: response.nextCursor ?? null,
    hasNext: response.hasNext ?? false,
  };
}

// 훈련 세션의 이벤트 타임라인. cctvCode로 특정 카메라 이벤트만 필터링 가능
export async function getSessionEvents(
  sessionId: string,
  cctvCode?: string,
  signal?: AbortSignal,
): Promise<MonitoringEvent[]> {
  const response = await apiRequest<{ events?: MonitoringEventResponse[] }>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.TRAINING_SESSIONS.MONITORING_EVENTS(sessionId),
    query: { cctvCode },
    signal,
  });
  return (response.events ?? []).map(toMonitoringEvent);
}
