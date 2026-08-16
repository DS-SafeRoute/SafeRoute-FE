import { HOME_TRAINING_STATUS } from '../constants/home';

import type {
  HomeMetric,
  ScheduledTraining,
  SystemStatusItem,
  TrainingRecord,
} from '../types/home';

export const homeMetrics: HomeMetric[] = [
  {
    id: 'sessions',
    title: '총 훈련 세션',
    value: '247',
    iconTone: 'blue',
    iconKey: 'activity',
  },
  {
    id: 'response-time',
    title: '평균 대피 시간',
    value: '3:42',
    valueSuffix: '분',
    iconTone: 'yellow',
    iconKey: 'clock',
  },
  {
    id: 'survival-rate',
    title: '평균 생존율',
    value: '94.7',
    valueSuffix: '%',
    iconTone: 'green',
    iconKey: 'trend',
  },
  {
    id: 'participants',
    title: '총 참가 인원',
    value: '1,842',
    iconTone: 'purple',
    iconKey: 'user',
  },
];

export const recentTrainingRecords: TrainingRecord[] = [
  {
    id: 1,
    name: 'A동 · 3층',
    date: '2026-04-14',
    participants: '45명',
    evacuationTime: '3:15',
    survivalRate: '96.2%',
    grade: 'A',
  },
  {
    id: 2,
    name: 'B동 · 2층',
    date: '2026-04-13',
    participants: '32명',
    evacuationTime: '4:02',
    survivalRate: '91.5%',
    grade: 'B+',
  },
  {
    id: 3,
    name: 'C동 · 1층',
    date: '2026-04-12',
    participants: '58명',
    evacuationTime: '2:58',
    survivalRate: '98.1%',
    grade: 'A+',
  },
  {
    id: 4,
    name: 'A동 · 5층',
    date: '2026-04-11',
    participants: '41명',
    evacuationTime: '3:44',
    survivalRate: '89.7%',
    grade: 'B',
  },
  {
    id: 5,
    name: 'D동 · 4층',
    date: '2026-04-10',
    participants: '37명',
    evacuationTime: '3:21',
    survivalRate: '93.4%',
    grade: 'A',
  },
];

export const initialTraining: ScheduledTraining = {
  building: 'B동',
  floor: '4층',
  date: '2026-04-15',
  time: '10:00',
  participants: '52명',
  status: HOME_TRAINING_STATUS.SCHEDULED,
};

export const systemStatusItems: SystemStatusItem[] = [
  { id: 'overall', label: '정상', tone: 'green', dot: true },
  { id: 'cctv', label: 'CCTV', value: '30/30', tone: 'green' },
  { id: 'iot', label: 'IoT 유도등', value: '58/60', tone: 'yellow' },
  { id: 'ai', label: 'AI 분석 엔진', value: '정상', tone: 'green', iconKey: 'success' },
];
