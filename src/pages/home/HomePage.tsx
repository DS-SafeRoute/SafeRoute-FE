import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { TRAINING_SESSION_STATUS } from '@apis/trainingSessions/trainingSessionConstants';
import { currentTrainingRouteQueryOptions } from '@apis/trainingSessions/useGetCurrentTrainingRouteQuery';
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

import { getTrainingCamerasPath } from '@constants/path';

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
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: trainings = [] } = useGetDashboardTrainingsQuery();
  const { data: runningSessions = [] } = useGetTrainingSessionsQuery(
    TRAINING_SESSION_STATUS.RUNNING,
  );
  const { data: scheduledSessions = [] } = useGetTrainingSessionsQuery(
    TRAINING_SESSION_STATUS.SCHEDULED,
    true,
    false,
  );
  const startTrainingSessionMutation = useStartTrainingSessionMutation();
  const selectedSession = runningSessions[0] ?? scheduledSessions[0];
  const { data: trainingStatus } = useGetTrainingStatusQuery(selectedSession?.sessionId);
  const training = toScheduledTraining(selectedSession, trainingStatus);
  // 실시간 이벤트는 RUNNING 세션에만 필요하다. SCHEDULED 세션은 목록·상태 조회만 사용한다.
  useTrainingSessionSocket({ sessionId: runningSessions[0]?.sessionId });

  const handleTrainingAction = async () => {
    if (!training) return;

    if (training.status === TRAINING_SESSION_STATUS.RUNNING) {
      // 훈련분석 개편으로 실시간 모니터링(TRAINING_MONITORING) 라우트는 제거됐지만,
      // 훈련분석의 카메라 목록·프레임 화면이 RUNNING 세션의 라이브 열람을 지원하므로 그쪽으로 보냄
      void navigate(getTrainingCamerasPath(training.id));
      return;
    }

    try {
      const currentRoute = await queryClient.fetchQuery({
        ...currentTrainingRouteQueryOptions(training.id),
        staleTime: 0,
      });
      if (!currentRoute.path?.length) {
        throw new Error('시작 지점에서 출구까지 연결된 기본 경로가 없습니다.');
      }

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
