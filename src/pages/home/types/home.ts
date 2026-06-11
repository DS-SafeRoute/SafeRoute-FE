import type { ReactNode } from 'react';

import type { StatusBadgeColor } from '@components/chip/StatusBadge';

import type { HOME_TRAINING_STATUS } from '../constants/home';

export type MetricIconTone = 'blue' | 'yellow' | 'green' | 'purple';
export type TrendTone = 'positive' | 'negative';
export type MetricIconKey = 'activity' | 'clock' | 'trend' | 'user';
export type TrendDirection = 'up' | 'down';

export type HomeMetric = {
  id: string;
  title: string;
  value: string;
  valueSuffix?: string;
  trend: string;
  trendTone: TrendTone;
  iconTone: MetricIconTone;
  iconKey: MetricIconKey;
  trendDirection: TrendDirection;
  icon?: ReactNode;
  trendIcon?: ReactNode;
};

export type TrainingRecord = {
  id: number;
  name: string;
  date: string;
  participants: string;
  evacuationTime: string;
  survivalRate: string;
  grade: string;
};

export type TrainingStatus = (typeof HOME_TRAINING_STATUS)[keyof typeof HOME_TRAINING_STATUS];

export type ScheduledTraining = {
  building: string;
  floor: string;
  date: string;
  time: string;
  participants: string;
  status: TrainingStatus;
};

export type SystemStatusItem = {
  id: string;
  label: string;
  value?: string;
  tone: StatusBadgeColor;
  dot?: boolean;
  iconKey?: 'success';
  icon?: ReactNode;
};
