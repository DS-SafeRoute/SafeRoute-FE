import type { ReactNode } from 'react';

import type { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';

import type { HOME_GRADE_BADGE_COLOR } from '../constants/home';

export type MetricIconTone = 'blue' | 'yellow' | 'green' | 'purple';
export type MetricIconKey = 'activity' | 'clock' | 'trend' | 'user';

export type HomeMetric = {
  id: string;
  title: string;
  value: string;
  valueSuffix?: string;
  iconTone: MetricIconTone;
  iconKey: MetricIconKey;
  icon?: ReactNode;
};

export type TrainingRecord = {
  id: number;
  name: string;
  date: string;
  participants: string;
  evacuationTime: string;
  survivalRate: string;
  grade: keyof typeof HOME_GRADE_BADGE_COLOR;
};

// 예정된 훈련의 홈 상태 상세 응답
export interface ScheduledTrainingStatusResponse {
  buildingName: string;
  totalFloors: number;
  scheduledAt: string;
  expectedParticipants: number;
}

// 진행 중인 훈련의 홈 상태 상세 응답
export interface RunningTrainingStatusResponse {
  buildingName: string;
  elapsedSeconds: number;
  actualParticipants: number;
  currentSurvivalRate: number;
}

export type HomeTrainingStatusResponse =
  | ScheduledTrainingStatusResponse
  | RunningTrainingStatusResponse;

export type ScheduledTraining = {
  id: string;
  name: string;
  building: string;
  date: string;
  time: string;
  participants: string;
  startedAt?: string;
  status: typeof TRAINING_SESSION_STATUS.RUNNING | typeof TRAINING_SESSION_STATUS.SCHEDULED;
};
