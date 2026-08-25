export const HOME_TRAINING_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
} as const;

export const HOME_GRADE_BADGE_COLOR = {
  'A+': 'green',
  A: 'green',
  'B+': 'blue',
  B: 'blue',
  C: 'yellow',
  D: 'red',
  F: 'red',
} as const;

export const HOME_RECENT_TRAINING_TABLE_HEADERS = [
  '훈련명',
  '날짜',
  '참가',
  '대피시간',
  '생존율',
  '등급',
] as const;
