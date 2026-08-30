import type {
  RecommendationItem,
  ReportNarrative,
  ReportScoreItem,
  ReportSummary,
  TrendPoint,
} from '../types/report';

export const reportSummary: ReportSummary = {
  grade: 'A',
  scoreText: '92.4 / 100점',
};

export const reportScores: ReportScoreItem[] = [
  { label: '대피 완료율', weight: '30%', score: 96, color: 'success' },
  { label: '평균 대피 시간', weight: '25%', score: 88, color: 'primary' },
  { label: '병목 회피율', weight: '20%', score: 91, color: 'primary' },
  { label: '경로 준수율', weight: '15%', score: 94, color: 'primary' },
  { label: 'IoT 활용도', weight: '5%', score: 98, color: 'success' },
];

export const evacuationAccumulation: TrendPoint[] = [
  { label: '0:00', value: 8 },
  { label: '0:40', value: 24 },
  { label: '1:20', value: 58 },
  { label: '2:00', value: 79 },
  { label: '2:40', value: 91 },
  { label: '3:20', value: 96 },
  { label: '4:08', value: 98 },
];

export const recentEvacuationTimes: TrendPoint[] = [
  { label: '1회', value: 62 },
  { label: '2회', value: 69 },
  { label: '3회', value: 77 },
  { label: '4회', value: 72 },
  { label: '5회', value: 88 },
];

export const reportNarrative: ReportNarrative = {
  headlinePrefix:
    '본 훈련은 A동 3층 305호 발화 시나리오에서 진행되었으며, 참가자 52명 전원이 3분 42초 이내 대피를 완료하여 평가 등급',
  grade: 'A(92.4점)',
  headlineSuffix: '을 획득하였습니다.',
  strength:
    'IoT 유도등 응답률 98%, 1차 경로 산출 0.5초로 빠른 시스템 반응성을 확보했고, 참가자 96.2%가 권장 경로를 준수하였습니다.',
  improvementPrefix: '1층 로비 평균 밀집도가',
  improvementScore: '92%',
  improvementSuffix:
    '로 임계치(85%)를 초과해 약 18초간 병목이 발생했습니다. 서측 비상계단 분산 유도와 IoT 유도등 #E3-07 점검이 권고됩니다.',
};

export const recommendations: RecommendationItem[] = [
  {
    id: 'lobby-distribution',
    level: 'high',
    title: '1층 로비 분산 유도',
    description: '서측 비상계단 우회 경로 활성화',
  },
  {
    id: 'iot-sign-e3-07',
    level: 'medium',
    title: 'IoT 유도등 #E3-07 점검',
    description: '응답 지연 1.2초 감지',
  },
  {
    id: 'zone-b-guide',
    level: 'low',
    title: 'B구역 사전 안내 추가',
    description: '훈련 직전 음성 안내 도입',
  },
];
