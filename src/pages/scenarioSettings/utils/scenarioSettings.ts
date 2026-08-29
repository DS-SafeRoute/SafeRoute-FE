import type { Scenario } from '@pages/scenarioSettings/types/scenarioList';
import type { BasicInfo } from '@pages/scenarioSettings/types/scenarioSettings';

export const getInitialBasicInfo = (scenario?: Scenario): BasicInfo => ({
  scenarioName: scenario?.name ?? '',
  targetBuilding: scenario?.buildingId ?? '',
  scheduledAt: scenario?.scheduledAt ?? '',
  expectedParticipants: scenario ? String(scenario.expectedParticipants) : '',
});

export const toScheduledAt = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const formatScenarioScheduledAt = (scheduledAt: string) => {
  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) return scheduledAt;

  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};
