import type { Scenario } from '@pages/scenarioSettings/types/scenarioList';
import type { BasicInfo } from '@pages/scenarioSettings/types/scenarioSettings';

// 시나리오 상세 데이터로 기본 정보 폼의 초기값 구성
export const getInitialBasicInfo = (scenario?: Scenario): BasicInfo => ({
  scenarioName: scenario?.name ?? '',
  targetBuilding: scenario?.buildingId ?? '',
  scheduledAt: scenario?.scheduledAt ?? '',
  expectedParticipants: scenario ? String(scenario.expectedParticipants) : '',
  targetEvacuationSec: '',
  startNodeId: scenario?.startNodeId ?? '',
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

// 초 단위 목표 대피 시간을 시간·분·초 선택값으로 분리
export const splitTargetEvacuationTime = (value: string) => {
  if (!value) return { hours: '0', minutes: '0', seconds: '0' };

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return { hours: '0', minutes: '0', seconds: '0' };

  const totalSeconds = Math.max(0, Math.trunc(parsedValue));
  return {
    hours: String(Math.floor(totalSeconds / 3600)),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)),
    seconds: String(totalSeconds % 60),
  };
};

// 시간·분·초 선택값을 API에서 사용하는 전체 초 단위 문자열로 변환
export const toTargetEvacuationSec = (hours: string, minutes: string, seconds: string) => {
  const hourValue = Math.max(0, Math.trunc(Number(hours) || 0));
  const minuteValue = Math.max(0, Math.trunc(Number(minutes) || 0));
  const secondValue = Math.min(59, Math.max(0, Math.trunc(Number(seconds) || 0)));
  if (hourValue === 0 && minuteValue === 0 && secondValue === 0) return '';

  return String(hourValue * 3600 + minuteValue * 60 + secondValue);
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
