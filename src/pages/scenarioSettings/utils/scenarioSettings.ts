import type { Scenario } from '@pages/scenarioSettings/types/scenarioList';
import type { BasicInfo } from '@pages/scenarioSettings/types/scenarioSettings';

// 시나리오 상세 데이터로 기본 정보 폼의 초기값 구성
export const getInitialBasicInfo = (scenario?: Scenario): BasicInfo => ({
  scenarioName: scenario?.name ?? '',
  targetBuilding: scenario?.buildingId ?? '',
  scheduledAt: scenario?.scheduledAt ?? '',
  expectedParticipants: scenario ? String(scenario.expectedParticipants) : '',
});

// 오늘 날짜의 00시 00분 00초 반환
export const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// 로컬 날짜·시간 입력값을 API 전송용 ISO 문자열로 변환
export const toScheduledAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date < getStartOfToday()) return null;
  return date.toISOString();
};

// 시나리오 실시 일시를 목록 화면용 날짜·시간 문자열로 포맷
export const formatScenarioScheduledAt = (scheduledAt: string) => {
  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) return scheduledAt;

  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};
