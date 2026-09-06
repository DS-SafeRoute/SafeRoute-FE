import type { RouteRecalculationSummaryResponse } from '@apis/__generated__/data-contracts';
import { TRAINING_EVENT_TYPE } from '@apis/trainingSessions/websocket/trainingSessionEvents';
import type {
  RouteRecalculationEventData,
  TrainingSessionEvent,
  TrainingEventType,
} from '@apis/trainingSessions/websocket/trainingSessionEvents';

export interface RouteEventState {
  sessionId?: string | null;
  processedEventKeys: Set<string>;
  resolvedRecalculationIds: Set<string>;
}

export const ROUTE_RECALCULATION_EVENT_TYPES: readonly TrainingEventType[] = [
  TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_REQUESTED,
  TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_APPROVED,
  TRAINING_EVENT_TYPE.EVACUATION_ROUTE_UPDATED,
  TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_REJECTED,
  TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_CANCELLED,
];

export const createRouteEventState = (sessionId?: string | null): RouteEventState => ({
  sessionId,
  processedEventKeys: new Set<string>(),
  resolvedRecalculationIds: new Set<string>(),
});

export const isResolvedRecalculation = (
  state: RouteEventState,
  sessionId: string | null | undefined,
  recalculationId: string,
) => state.sessionId === sessionId && state.resolvedRecalculationIds.has(recalculationId);

export const getRouteEventStatus = (
  event: TrainingSessionEvent<RouteRecalculationEventData>,
): RouteRecalculationEventData['status'] => {
  if (
    event.eventType === TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_APPROVED ||
    event.eventType === TRAINING_EVENT_TYPE.EVACUATION_ROUTE_UPDATED
  ) {
    return 'APPROVED';
  }
  if (event.eventType === TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_REJECTED) return 'REJECTED';
  if (event.eventType === TRAINING_EVENT_TYPE.ROUTE_RECALCULATION_CANCELLED) return 'CANCELLED';
  return event.data?.status ?? 'PENDING';
};

export const getRouteEventKeys = (
  event: TrainingSessionEvent<RouteRecalculationEventData>,
  status: RouteRecalculationEventData['status'],
) => {
  const keys: string[] = [];
  if (event.data?.eventId) keys.push(`event:${event.data.eventId}`);
  if (event.data?.recalculationId) {
    keys.push(`recalculation:${event.data.recalculationId}:${status}`);
  }
  return keys;
};

export const getResolvedRecalculationId = (
  data: RouteRecalculationEventData | undefined,
  recalculations: RouteRecalculationSummaryResponse[],
) => {
  if (data?.recalculationId) return data.recalculationId;
  if (!data?.eventId) return undefined;

  return recalculations.find(
    (item) => item.recalculationId && data.eventId?.startsWith(item.recalculationId),
  )?.recalculationId;
};
