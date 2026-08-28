import { HOME_TRAINING_STATUS } from '../constants/home';

import type { ScheduledTraining } from '../types/home';

export const initialTraining: ScheduledTraining = {
  id: 'mock-session',
  name: 'B동 화재 대피 훈련',
  building: 'B동',
  date: '2026-04-15',
  time: '10:00',
  participants: '52명',
  status: HOME_TRAINING_STATUS.SCHEDULED,
};
