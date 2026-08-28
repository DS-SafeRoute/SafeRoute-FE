import type {
  DashboardStatsResponse,
  RecentTrainingReportResponse,
  TrainingSessionSummaryResponse,
} from '@apis/__generated__/data-contracts';
import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';

import { formatDate, formatDuration } from '@utils/format';

import type {
  HomeMetric,
  HomeTrainingStatusResponse,
  RunningTrainingStatusResponse,
  ScheduledTraining,
  ScheduledTrainingStatusResponse,
  TrainingRecord,
} from '../types/home';

const formatRate = (rate = 0) => (rate * 100).toFixed(1);

const formatTime = (iso?: string) => {
  if (!iso) return '-';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const isRunningTrainingStatus = (
  status?: HomeTrainingStatusResponse,
): status is RunningTrainingStatusResponse => Boolean(status && 'elapsedSeconds' in status);

const isScheduledTrainingStatus = (
  status?: HomeTrainingStatusResponse,
): status is ScheduledTrainingStatusResponse => Boolean(status && 'scheduledAt' in status);

const formatParticipants = (count?: number) =>
  count === undefined ? '-' : `${count.toLocaleString()}명`;

export const toHomeMetrics = (stats: DashboardStatsResponse): HomeMetric[] => [
  {
    id: 'sessions',
    title: '총 훈련 세션',
    value: (stats.totalSessions ?? 0).toLocaleString(),
    iconTone: 'blue',
    iconKey: 'activity',
  },
  {
    id: 'response-time',
    title: '평균 대피 시간',
    value: formatDuration(stats.avgEvacuationSec),
    valueSuffix: '분',
    iconTone: 'yellow',
    iconKey: 'clock',
  },
  {
    id: 'survival-rate',
    title: '평균 생존율',
    value: formatRate(stats.avgSurvivalRate),
    valueSuffix: '%',
    iconTone: 'green',
    iconKey: 'trend',
  },
  {
    id: 'participants',
    title: '총 참가 인원',
    value: (stats.totalParticipants ?? 0).toLocaleString(),
    iconTone: 'purple',
    iconKey: 'user',
  },
];

export const toTrainingRecord = (
  training: RecentTrainingReportResponse,
  index: number,
): TrainingRecord => ({
  id: index,
  name: training.scenarioName ?? '-',
  date: formatDate(training.startedAt),
  participants: `${training.participantCount ?? 0}명`,
  evacuationTime: formatDuration(training.avgEvacuationSec),
  survivalRate: `${formatRate(training.survivalRate)}%`,
  grade: training.grade ?? 'C',
});

export const toScheduledTraining = (
  session?: TrainingSessionSummaryResponse,
  trainingStatus?: HomeTrainingStatusResponse,
): ScheduledTraining | null => {
  if (!session?.sessionId) return null;

  const isRunning = session.status === TRAINING_SESSION_STATUS.RUNNING;
  const runningStatus = isRunningTrainingStatus(trainingStatus) ? trainingStatus : undefined;
  const scheduledStatus = isScheduledTrainingStatus(trainingStatus) ? trainingStatus : undefined;
  const scheduledAt = scheduledStatus?.scheduledAt ?? session.startedAt;

  return {
    id: session.sessionId,
    name: session.scenarioName ?? '-',
    building: trainingStatus?.buildingName ?? session.buildingName ?? '-',
    date: formatDate(scheduledAt),
    time: formatTime(scheduledAt),
    participants: formatParticipants(
      isRunning ? runningStatus?.actualParticipants : scheduledStatus?.expectedParticipants,
    ),
    startedAt: isRunning ? session.startedAt : undefined,
    status: isRunning ? TRAINING_SESSION_STATUS.RUNNING : TRAINING_SESSION_STATUS.SCHEDULED,
  };
};
