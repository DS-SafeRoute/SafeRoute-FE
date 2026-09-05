import type { TrainingSessionSummaryResponse } from '@apis/__generated__/data-contracts';

export type TrainingSessionStatus = NonNullable<TrainingSessionSummaryResponse['status']>;

export const MAX_TRAINING_DURATION_MS = 10 * 60 * 1000;

// 훈련 세션 상태
export const TRAINING_SESSION_STATUS = {
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const satisfies Record<string, TrainingSessionStatus>;
