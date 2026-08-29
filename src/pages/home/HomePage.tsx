import { useNavigate } from 'react-router';

import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { useGetTrainingSessionsQuery } from '@apis/trainingSessions/useGetTrainingSessionsQuery';
import { useStartTrainingSessionMutation } from '@apis/trainingSessions/useTrainingSessionMutations';
import { useTrainingSessionSocket } from '@apis/trainingSessions/websocket/useTrainingSessionSocket';

import ActivityIcon from '@assets/icons/ic-activity.svg?react';
import ArrowRightIcon from '@assets/icons/ic-arrow-right.svg?react';
import CalendarIcon from '@assets/icons/ic-calendar.svg?react';
import ClockIcon from '@assets/icons/ic-clock.svg?react';
import UsersIcon from '@assets/icons/ic-multi-user.svg?react';
import PlayIcon from '@assets/icons/ic-play.svg?react';
import TrendUpIcon from '@assets/icons/ic-trendup.svg?react';

import useToast from '@components/toast/useToast';

import { ROUTES } from '@constants/path';

import { useGetDashboardStatsQuery } from './api/useDashboardStatsQuery';
import { useGetDashboardTrainingsQuery } from './api/useDashboardTrainingsQuery';
import { useGetTrainingStatusQuery } from './api/useTrainingStatusQuery';
import HomeSummarySection from './components/homeSummarySection/HomeSummarySection';
import RecentTrainingSection from './components/recentTrainingSection/RecentTrainingSection';
import ScheduledTrainingSection from './components/scheduledTrainingSection/ScheduledTrainingSection';
import * as styles from './HomePage.css';
import { toHomeMetrics, toScheduledTraining, toTrainingRecord } from './utils/home';

import type { HomeMetric } from './types/home';

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

const HomePage = () => {
  const navigate = useNavigate();
  const { show } = useToast();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: trainings = [] } = useGetDashboardTrainingsQuery();
  const { data: runningSessions = [] } = useGetTrainingSessionsQuery(
    TRAINING_SESSION_STATUS.RUNNING,
  );
  const { data: scheduledSessions = [] } = useGetTrainingSessionsQuery(
    TRAINING_SESSION_STATUS.SCHEDULED,
  );
  const startTrainingSessionMutation = useStartTrainingSessionMutation();
  const selectedSession = runningSessions[0] ?? scheduledSessions[0];
  const { data: trainingStatus } = useGetTrainingStatusQuery(selectedSession?.sessionId);
  const training = toScheduledTraining(selectedSession, trainingStatus);
  useTrainingSessionSocket({ sessionId: selectedSession?.sessionId });

  const handleTrainingAction = async () => {
    if (!training) return;

    if (training.status === TRAINING_SESSION_STATUS.RUNNING) {
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
