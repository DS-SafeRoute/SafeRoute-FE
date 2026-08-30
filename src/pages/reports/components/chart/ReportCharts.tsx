import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
} from 'recharts';

import { vars } from '@styles/global.css';

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

const ReportCharts = ({ evacuationAccumulation, recentEvacuationTimes }: ReportChartsProps) => (
  <div className={styles.chartGrid}>
    <section className={styles.chartCard}>
      <h2 className={styles.chartTitle}>대피 인원 누적</h2>
      <div className={styles.chartBody}>
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
      </div>
    </section>

    <section className={styles.chartCard}>
      <h2 className={styles.chartTitle}>최근 5회 대피 시간</h2>
      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={recentEvacuationTimes} margin={CHART_MARGIN}>
            <CartesianGrid vertical={false} stroke={vars.color.gray100} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={vars.color.success}
              strokeWidth={CHART_STROKE_WIDTH}
              dot={DOT_STYLE}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  </div>
);

export default ReportCharts;
