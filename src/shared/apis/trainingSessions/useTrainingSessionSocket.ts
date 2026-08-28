import { useEffect, useRef } from 'react';

import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';

import { scenarioQueryKeys } from '@apis/scenarios/scenarioQueryKeys';

import { getAccessToken } from '@shared/auth/tokenStorage';

import { TRAINING_EVENT_TYPE } from './trainingSessionEvents';
import { trainingSessionQueryKeys } from './trainingSessionQueryKeys';

import type { TrainingSessionEvent } from './trainingSessionEvents';

// WebSocket 구독 대상 세션과 이벤트 처리 함수
interface UseTrainingSessionSocketOptions {
  sessionId?: string | null;
  onEvent?: (event: TrainingSessionEvent) => void;
}

// 세션별 STOMP 구독 경로 생성
const getTrainingSessionTopic = (sessionId: string) => `/topic/training-sessions/${sessionId}`;

// 훈련 세션 WebSocket 연결 및 이벤트 구독
export const useTrainingSessionSocket = ({
  sessionId,
  onEvent,
}: UseTrainingSessionSocketOptions) => {
  const queryClient = useQueryClient();
  const onEventRef = useRef(onEvent);

  // 콜백 변경 시 WebSocket을 재연결하지 않고 최신 함수만 참조
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // JWT로 STOMP 서버에 연결하고 해당 훈련 세션 topic 구독
  useEffect(() => {
    const accessToken = getAccessToken();
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL?.replace(/\/$/, '');

    if (!sessionId || !accessToken || !wsBaseUrl) return;

    const client = new Client({
      brokerURL: `${wsBaseUrl}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        client.subscribe(getTrainingSessionTopic(sessionId), (message) => {
          try {
            const event = JSON.parse(message.body) as TrainingSessionEvent;

            if (event.sessionId !== sessionId) return;

            // 상태 변경 시 세션·홈 상태·시나리오를 다시 조회해 서버 상태와 동기화
            if (event.eventType === TRAINING_EVENT_TYPE.STATUS_UPDATED) {
              void Promise.all([
                queryClient.invalidateQueries({
                  queryKey: trainingSessionQueryKeys.lists(),
                }),
                queryClient.invalidateQueries({
                  queryKey: trainingSessionQueryKeys.status(sessionId),
                }),
                queryClient.invalidateQueries({
                  queryKey: scenarioQueryKeys.all,
                }),
              ]);
            }

            onEventRef.current?.(event);
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('훈련 WebSocket 이벤트를 해석하지 못했습니다.', error);
            }
          }
        });
      },
    });

    client.activate();

    // 화면 이탈 또는 구독 세션 변경 시 연결 해제
    return () => {
      void client.deactivate();
    };
  }, [queryClient, sessionId]);
};
