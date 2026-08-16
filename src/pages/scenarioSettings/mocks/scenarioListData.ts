import { SCENARIO_STATUS, type ScenarioSummary } from '../types/scenarioList';

export const scenarioListData: ScenarioSummary[] = [
  {
    id: 'april-regular',
    name: '2026년 4월 정기 훈련',
    location: 'A동 · 본관 · 3층',
    scheduledAt: '2026.04.15 10:00',
    expectedParticipants: 52,
    status: SCENARIO_STATUS.READY,
    deletable: true,
  },
  {
    id: 'march-night',
    name: '3월 야간 대피 훈련',
    location: 'B동 · 별관 · 2층',
    scheduledAt: '2026.03.20 14:00',
    expectedParticipants: 38,
    status: SCENARIO_STATUS.COMPLETED,
    deletable: false,
  },
  {
    id: 'freshmen-evacuation',
    name: '신입생 대상 대피 훈련',
    location: 'A동 · 본관 · 1층',
    scheduledAt: '2026.04.16 09:00',
    expectedParticipants: 45,
    status: SCENARIO_STATUS.IN_PROGRESS,
    deletable: false,
  },
  {
    id: 'draft-scenario',
    name: '임시 저장된 시나리오',
    location: 'C동 · 체육관 · 2층',
    scheduledAt: '2026.04.10 11:00',
    expectedParticipants: 30,
    status: SCENARIO_STATUS.DRAFT,
    deletable: true,
  },
];

export const scenarioStatusFilterOptions = [
  { label: '전체 상태', value: 'ALL' },
  { label: '임시저장', value: SCENARIO_STATUS.DRAFT },
  { label: '준비완료', value: SCENARIO_STATUS.READY },
  { label: '진행중', value: SCENARIO_STATUS.IN_PROGRESS },
  { label: '완료', value: SCENARIO_STATUS.COMPLETED },
] as const;
