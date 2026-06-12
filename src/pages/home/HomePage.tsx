import { useState } from 'react';

import ActivityIcon from '@assets/icons/ic-activity.svg?react';
import ArrowRightIcon from '@assets/icons/ic-arrow-right.svg?react';
import CalendarIcon from '@assets/icons/ic-calendar.svg?react';
import CheckCircleIcon from '@assets/icons/ic-check-circle.svg?react';
import ClockIcon from '@assets/icons/ic-clock.svg?react';
import UsersIcon from '@assets/icons/ic-multi-user.svg?react';
import PlayIcon from '@assets/icons/ic-play.svg?react';
import TrendDownIcon from '@assets/icons/ic-trenddown.svg?react';
import TrendUpIcon from '@assets/icons/ic-trendup.svg?react';

import GNB from '@components/gnb';

import HomeSummarySection from './components/homeSummarySection/HomeSummarySection';
import RecentTrainingSection from './components/recentTrainingSection/RecentTrainingSection';
import ScheduledTrainingSection from './components/scheduledTrainingSection/ScheduledTrainingSection';
import SystemStatusSection from './components/systemStatusSection/SystemStatusSection';
import { HOME_TRAINING_STATUS } from './constants/home';
import * as styles from './HomePage.css';
import {
  homeMetrics,
  initialTraining,
  recentTrainingRecords,
  systemStatusItems,
} from './mocks/homeData';

import type { HomeMetric } from './types/home';

const metricIcons: Record<HomeMetric['iconKey'], JSX.Element> = {
  activity: <ActivityIcon />,
  clock: <ClockIcon />,
  trend: <TrendUpIcon />,
  user: <UsersIcon />,
};

const trendIcons: Record<HomeMetric['trendDirection'], JSX.Element> = {
  up: <TrendUpIcon />,
  down: <TrendDownIcon />,
};

const sectionIcons = {
  calendar: <CalendarIcon />,
  action: <ArrowRightIcon />,
  play: <PlayIcon />,
  success: <CheckCircleIcon />,
};

const HomePage = () => {
  const [training, setTraining] = useState(initialTraining);

  const handleTrainingStart = () => {
    setTraining((current) =>
      current.status === HOME_TRAINING_STATUS.IN_PROGRESS
        ? current
        : { ...current, status: HOME_TRAINING_STATUS.IN_PROGRESS },
    );
  };

  return (
    <div className={styles.container}>
      <header>
        <GNB
          title="홈"
          description="화재 대피 훈련 현황을 한눈에 확인하세요."
          userName="김안전"
          userRole="관리자"
        />
      </header>
      <div className={styles.sectionContainer}>
        <HomeSummarySection
          metrics={homeMetrics.map((metric) => ({
            ...metric,
            icon: metricIcons[metric.iconKey],
            trendIcon: trendIcons[metric.trendDirection],
          }))}
        />

        <div className={styles.contentGrid}>
          <RecentTrainingSection records={recentTrainingRecords} actionIcon={sectionIcons.action} />

          <div className={styles.sideColumn}>
            <ScheduledTrainingSection
              training={training}
              onStart={handleTrainingStart}
              sectionIcon={sectionIcons.calendar}
              actionIcon={sectionIcons.play}
            />
            <SystemStatusSection
              items={systemStatusItems.map((item) => ({
                ...item,
                icon: item.iconKey === 'success' ? sectionIcons.success : undefined,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
