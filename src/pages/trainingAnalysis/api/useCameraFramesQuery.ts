import { useInfiniteQuery } from '@tanstack/react-query';

import { getCameraFrames } from './monitoringApi';
import { monitoringQueryKeys } from './monitoringQueryKeys';

const FRAMES_PAGE_SIZE = 20;

// 카메라별 프레임 목록 — 최신순 커서 페이지네이션. 프레임 탐색에서 필요한 만큼만 이어서 불러옴
export const useCameraFramesQuery = (sessionId: string | undefined, cctvId: string | undefined) =>
  useInfiniteQuery({
    queryKey: monitoringQueryKeys.frameLists(sessionId ?? '', cctvId ?? ''),
    queryFn: ({ pageParam, signal }) =>
      getCameraFrames(
        sessionId as string,
        cctvId as string,
        { limit: FRAMES_PAGE_SIZE, cursor: pageParam },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(sessionId && cctvId),
  });
