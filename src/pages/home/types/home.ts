import type { ReactNode } from 'react';

import type { HOME_GRADE_BADGE_COLOR, HOME_TRAINING_STATUS } from '../constants/home';

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

export type TrainingStatus = (typeof HOME_TRAINING_STATUS)[keyof typeof HOME_TRAINING_STATUS];

export type ScheduledTraining = {
  id: string;
  name: string;
  building: string;
  date: string;
  time: string;
  status: TrainingStatus;
};
