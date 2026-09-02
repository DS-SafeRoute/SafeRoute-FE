import type {
  CreateSessionRequest,
  CurrentRouteResponse,
  TrainingSessionResponse,
  TrainingSessionSummaryResponse,
} from '@apis/__generated__/data-contracts';
import { HTTP_METHOD, request } from '@apis/config/request';
import { API_ENDPOINTS } from '@apis/constants/endpoints';

import type { TrainingSessionStatus } from './trainingSessionConstants';

// 훈련 세션 등록 요청에 필요한 값
export interface CreateTrainingSessionVariables {
  scenarioId: string;
  body: CreateSessionRequest;
}

// 상태별 훈련 세션 목록 조회
export const getTrainingSessions = async (status: TrainingSessionStatus, signal?: AbortSignal) => {
  const result = await request<{ sessions?: TrainingSessionSummaryResponse[] }>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.TRAINING_SESSIONS.ROOT,
    query: { status },
    signal,
  });

  return result.sessions ?? [];
};

// 훈련 세션 등록
export const postTrainingSession = ({ scenarioId, body }: CreateTrainingSessionVariables) =>
  request<TrainingSessionResponse, CreateSessionRequest>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.TRAINING_SESSIONS.CREATE(scenarioId),
    body,
    responseMode: 'raw',
  });

// 훈련 세션 시작
export const postStartTrainingSession = (sessionId: string) =>
  request<TrainingSessionResponse>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.TRAINING_SESSIONS.START(sessionId),
  });

// 훈련 세션 정상 종료
export const postEndTrainingSession = (sessionId: string) =>
  request<TrainingSessionResponse>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.TRAINING_SESSIONS.END(sessionId),
  });

// 훈련 세션 강제 종료
export const postForceEndTrainingSession = (sessionId: string) =>
  request<TrainingSessionResponse>({
    method: HTTP_METHOD.POST,
    url: API_ENDPOINTS.TRAINING_SESSIONS.FORCE_END(sessionId),
  });

// 훈련 세션에서 현재 안내 중인 대피 경로 조회
export const getCurrentTrainingRoute = (sessionId: string, signal?: AbortSignal) =>
  request<CurrentRouteResponse>({
    method: HTTP_METHOD.GET,
    url: API_ENDPOINTS.TRAINING_SESSIONS.CURRENT_ROUTE(sessionId),
    signal,
  });
