import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

import EmptyState from '@components/empty';

import { vars } from '@styles/global.css';

import { formatDuration } from '@utils/format';

import * as styles from './ReportCharts.css';

import type { TrendPoint } from '../../types/report';

interface ReportChartsProps {
  evacuationAccumulation: TrendPoint[];
  recentEvacuationTimes: TrendPoint[];
}

const CHART_MARGIN = { top: 16, right: 16, bottom: 8, left: 16 };
const CHART_STROKE_WIDTH = 3;
const DOT_STYLE = {
  fill: vars.color.success,
  r: 4,
  strokeWidth: 0,
};

const axisTick = {
  fill: vars.color.textLow,
  fontFamily: vars.fontFamily.base,
  fontSize: vars.typography.caption.fontSize,
};

const formatEvacuationTime = (value: unknown) =>
  typeof value === 'number' ? formatDuration(value) : '';

const ReportCharts = ({ evacuationAccumulation, recentEvacuationTimes }: ReportChartsProps) => (
  <div className={styles.chartGrid}>
    <section className={styles.chartCard}>
      <h2 className={styles.chartTitle}>대피 인원 누적</h2>
      <div className={styles.chartBody}>
        {evacuationAccumulation.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evacuationAccumulation} margin={CHART_MARGIN}>
              <CartesianGrid vertical={false} stroke={vars.color.gray100} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={axisTick}
                interval="preserveStartEnd"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={vars.color.primary}
                strokeWidth={CHART_STROKE_WIDTH}
                fill={vars.color.primaryLight}
                fillOpacity={0.72}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            className={styles.emptyState}
            title="대피 인원 기록이 없습니다."
            description="누적 대피 데이터가 수집되면 그래프로 표시됩니다."
          />
        )}
      </div>
    </section>

    <section className={styles.chartCard}>
      <h2 className={styles.chartTitle}>최근 5회 대피 시간</h2>
      <div className={styles.chartBody}>
        {recentEvacuationTimes.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentEvacuationTimes} margin={CHART_MARGIN}>
              <CartesianGrid vertical={false} stroke={vars.color.gray100} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip
                formatter={(value) => [formatEvacuationTime(value), '대피 시간']}
                labelStyle={{ color: vars.color.textMid }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={vars.color.success}
                strokeWidth={CHART_STROKE_WIDTH}
                dot={DOT_STYLE}
                activeDot={false}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={formatEvacuationTime}
                  fill={vars.color.textMid}
                  fontSize={12}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            className={styles.emptyState}
            title="최근 대피 기록이 없습니다."
            description="훈련 기록이 쌓이면 최근 5회 결과를 비교할 수 있습니다."
          />
        )}
      </div>
    </section>
  </div>
);

export default ReportCharts;
