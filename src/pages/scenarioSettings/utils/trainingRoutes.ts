import type {
  EvacuationRouteResponse,
  FloorResponse,
  MapNodeResponse,
  RouteRecalculationDetailResponse,
  RouteRecalculationSummaryResponse,
  RouteSegment,
} from '@apis/__generated__/data-contracts';

const ROOM_NUMBER_PATTERN = /(\d{3,4})\s*호?/;

const getRoomNumber = (value: string) => value.match(ROOM_NUMBER_PATTERN)?.[1];

const getNodeLabel = (node?: MapNodeResponse) => node?.name || node?.code || '이름 없는 지점';

export const selectTrainingFloor = (floors: FloorResponse[], fireOrigin: string) => {
  const roomNumber = getRoomNumber(fireOrigin);
  const floorNumber = roomNumber ? Number(roomNumber.slice(0, -2)) : undefined;

  if (floorNumber !== undefined) {
    const matchingFloor = floors.find((floor) => floor.floorNum === floorNumber);
    if (matchingFloor) return matchingFloor;
  }

  return floors.length === 1 ? floors[0] : undefined;
};

export const findRouteStartNode = (nodes: MapNodeResponse[], fireOrigin: string) => {
  const roomNumber = getRoomNumber(fireOrigin);
  if (!roomNumber) return undefined;

  return nodes.find((node) => {
    const nodeRoomNumber = getRoomNumber(`${node.code ?? ''} ${node.name ?? ''}`);
    return nodeRoomNumber === roomNumber && Boolean(node.id);
  });
};

export const formatEvacuationRoute = (route?: EvacuationRouteResponse) => {
  const labels = route?.path?.map((node) => getNodeLabel(node)).filter(Boolean) ?? [];
  if (labels.length === 0) return '현재 대피 경로 정보가 없습니다.';
  return labels.join(' → ');
};

const formatRouteSegment = (segment: RouteSegment | undefined, nodes: MapNodeResponse[]) => {
  const nodeById = new Map(nodes.flatMap((node) => (node.id ? [[node.id, node]] : [])));
  const labels = segment?.nodeIds?.map((nodeId) => getNodeLabel(nodeById.get(nodeId))) ?? [];
  return labels.length > 0 ? labels.join(' → ') : '경로 상세 정보 없음';
};

export const formatRouteProposal = (
  detail: RouteRecalculationDetailResponse | undefined,
  nodes: MapNodeResponse[],
) => {
  if (!detail) return null;

  const density =
    detail.density === undefined ? null : `${Math.round(detail.density * 100)}% 밀집도 감지`;
  const source = detail.cctvCode ?? null;
  const reason = [source, density].filter(Boolean).join(' · ');
  const previousRoute = formatRouteSegment(detail.previousRoute, nodes);
  const candidateRoute = formatRouteSegment(detail.candidateRoute, nodes);

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
