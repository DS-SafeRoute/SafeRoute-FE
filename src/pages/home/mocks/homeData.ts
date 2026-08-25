import { HOME_TRAINING_STATUS } from '../constants/home';

import type { ScheduledTraining } from '../types/home';

export const initialTraining: ScheduledTraining = {
  building: 'B동',
  floor: '4층',
  date: '2026-04-15',
  time: '10:00',
  participants: '52명',
  status: HOME_TRAINING_STATUS.SCHEDULED,
};
