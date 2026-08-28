import { useNavigate } from 'react-router';

import type {
  DashboardStatsResponse,
  RecentTrainingReportResponse,
  TrainingSessionSummaryResponse,
} from '@apis/__generated__/data-contracts';
import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionsApi';
import { useStartTrainingSessionMutation } from '@apis/trainingSessions/useTrainingSessionMutations';
import { useTrainingSessionSocket } from '@apis/trainingSessions/useTrainingSessionSocket';
import { useTrainingSessionsQuery } from '@apis/trainingSessions/useTrainingSessionsQuery';

import ActivityIcon from '@assets/icons/ic-activity.svg?react';
import ArrowRightIcon from '@assets/icons/ic-arrow-right.svg?react';
import CalendarIcon from '@assets/icons/ic-calendar.svg?react';
import ClockIcon from '@assets/icons/ic-clock.svg?react';
import UsersIcon from '@assets/icons/ic-multi-user.svg?react';
import PlayIcon from '@assets/icons/ic-play.svg?react';
import TrendUpIcon from '@assets/icons/ic-trendup.svg?react';

import useToast from '@components/toast/useToast';

import { ROUTES } from '@constants/path';

import { formatDate, formatDuration } from '@utils/format';

import { useGetDashboardStatsQuery } from './api/useDashboardStatsQuery';
import { useGetDashboardTrainingsQuery } from './api/useDashboardTrainingsQuery';
import HomeSummarySection from './components/homeSummarySection/HomeSummarySection';
import RecentTrainingSection from './components/recentTrainingSection/RecentTrainingSection';
import ScheduledTrainingSection from './components/scheduledTrainingSection/ScheduledTrainingSection';
import { HOME_TRAINING_STATUS } from './constants/home';
import * as styles from './HomePage.css';

import type { HomeMetric, ScheduledTraining, TrainingRecord } from './types/home';

const metricIcons: Record<HomeMetric['iconKey'], JSX.Element> = {
  activity: <ActivityIcon />,
  clock: <ClockIcon />,
  trend: <TrendUpIcon />,
  user: <UsersIcon />,
};

const sectionIcons = {
  calendar: <CalendarIcon />,
  action: <ArrowRightIcon />,
  play: <PlayIcon />,
};

const formatRate = (rate = 0) => (rate * 100).toFixed(1);

const toHomeMetrics = (stats: DashboardStatsResponse): HomeMetric[] => [
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

const toTrainingRecord = (
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

const toScheduledTraining = (
  session?: TrainingSessionSummaryResponse,
): ScheduledTraining | null => {
  if (!session?.sessionId) return null;

  return {
    id: session.sessionId,
    name: session.scenarioName ?? '-',
    building: session.buildingName ?? '-',
    date: formatDate(session.startedAt),
    time: formatTime(session.startedAt),
    status:
      session.status === TRAINING_SESSION_STATUS.RUNNING
        ? HOME_TRAINING_STATUS.IN_PROGRESS
        : HOME_TRAINING_STATUS.SCHEDULED,
  };
};

const HomePage = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: trainings = [] } = useGetDashboardTrainingsQuery();
  const { data: runningSessions = [] } = useTrainingSessionsQuery(TRAINING_SESSION_STATUS.RUNNING);
  const { data: scheduledSessions = [] } = useTrainingSessionsQuery(
    TRAINING_SESSION_STATUS.SCHEDULED,
  );
  const startTrainingSessionMutation = useStartTrainingSessionMutation();
  const training =
    toScheduledTraining(runningSessions[0]) ?? toScheduledTraining(scheduledSessions[0]);
  useTrainingSessionSocket({ sessionId: training?.id });

  const handleTrainingAction = async () => {
    if (!training) return;

    if (training.status === HOME_TRAINING_STATUS.IN_PROGRESS) {
      void navigate(ROUTES.TRAINING_MONITORING);
      return;
    }

    try {
      await startTrainingSessionMutation.mutateAsync(training.id);
      show({ title: '훈련이 시작되었습니다.', variant: 'success' });
    } catch {
      show({ title: '훈련 시작에 실패했습니다.', variant: 'error' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionContainer}>
        <HomeSummarySection
          metrics={toHomeMetrics(stats ?? {}).map((metric) => ({
            ...metric,
            icon: metricIcons[metric.iconKey],
          }))}
        />

        <div className={styles.contentGrid}>
          <RecentTrainingSection
            records={trainings.map(toTrainingRecord)}
            actionIcon={sectionIcons.action}
          />

          <div className={styles.sideColumn}>
            <ScheduledTrainingSection
              training={training}
              onAction={() => void handleTrainingAction()}
              isLoading={startTrainingSessionMutation.isPending}
              sectionIcon={sectionIcons.calendar}
              actionIcon={sectionIcons.play}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
