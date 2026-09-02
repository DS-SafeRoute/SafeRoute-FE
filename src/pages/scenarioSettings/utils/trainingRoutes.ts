import type {
  CurrentRouteResponse,
  RouteRecalculationDetailResponse,
  RouteRecalculationSummaryResponse,
  RouteSegment,
} from '@apis/__generated__/data-contracts';

export const formatCurrentRoute = (route?: CurrentRouteResponse) => {
  const labels = route?.path?.map((node) => node.name || '이름 없는 지점').filter(Boolean) ?? [];
  if (labels.length === 0) return '현재 대피 경로 정보가 없습니다.';
  return labels.join(' → ');
};

export const formatRouteSegment = (segment?: RouteSegment) => {
  const nodeCount = segment?.nodeIds?.length ?? 0;
  if (nodeCount === 0) return '현재 대피 경로 정보가 없습니다.';

  const weight = segment?.totalWeight;
  return weight === undefined ? `${nodeCount}개 지점` : `${nodeCount}개 지점 · 가중치 ${weight}`;
};

export const formatRouteProposal = (detail: RouteRecalculationDetailResponse | undefined) => {
  if (!detail) return null;

  const density =
    detail.density === undefined ? null : `${Math.round(detail.density * 100)}% 밀집도 감지`;
  const source = detail.cctvCode ?? null;
  const reason = [source, density].filter(Boolean).join(' · ');
  const previousRoute = formatRouteSegment(detail.previousRoute);
  const candidateRoute = formatRouteSegment(detail.candidateRoute);

  return {
    message: reason || '혼잡 감지로 새 대피 경로가 제안되었습니다.',
    previousRoute,
    candidateRoute,
  };
};

export const getLatestRecalculation = (items: RouteRecalculationSummaryResponse[]) =>
  [...items].sort((a, b) => {
    const aTime = a.requestedAt ? Date.parse(a.requestedAt) : 0;
    const bTime = b.requestedAt ? Date.parse(b.requestedAt) : 0;
    return bTime - aTime;
  })[0];

export const formatRecalculationTime = (requestedAt?: string) => {
  if (!requestedAt) return '기록 없음';
  const date = new Date(requestedAt);
  if (Number.isNaN(date.getTime())) return '기록 없음';

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1_000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}초 전`;
  if (elapsedSeconds < 3_600) return `${Math.floor(elapsedSeconds / 60)}분 전`;

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};
