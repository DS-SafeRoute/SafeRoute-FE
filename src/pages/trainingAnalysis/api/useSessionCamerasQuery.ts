import { useQuery } from '@tanstack/react-query';

import { getSessionCameras } from './monitoringApi';
import { monitoringQueryKeys } from './monitoringQueryKeys';

// 세션의 카메라별 최신 캡처 목록 (카메라 목록 화면)
export const useSessionCamerasQuery = (sessionId: string | undefined) =>
  useQuery({
    queryKey: monitoringQueryKeys.cameras(sessionId ?? ''),
    queryFn: ({ signal }) => getSessionCameras(sessionId as string, signal),
    enabled: Boolean(sessionId),
  });
