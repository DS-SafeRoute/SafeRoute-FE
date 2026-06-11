import { globalStyle, style, styleVariants } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

const summaryCardBase = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: '1.2rem',
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
});

export const summaryGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: vars.space.s4,
});

export const metricCard = style([
  summaryCardBase,
  {
    padding: '2.1rem',
    minHeight: '15.9rem',
  },
]);

export const metricHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '1.4rem',
});

export const metricIcon = styleVariants({
  blue: {
    backgroundColor: vars.color.primaryLight2,
    color: vars.color.primary,
  },
  yellow: {
    backgroundColor: vars.color.warningLight,
    color: vars.color.warning,
  },
  green: {
    backgroundColor: vars.color.successLight,
    color: vars.color.success,
  },
  purple: {
    backgroundColor: vars.color.purpleLight,
    color: vars.color.purple,
  },
});

export const metricIconBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1rem',
  width: '4rem',
  height: '4rem',
});

globalStyle(`${metricIconBase} svg`, {
  width: '2rem',
  height: '2rem',
});

export const metricTrend = styleVariants({
  positive: {
    color: vars.color.success,
  },
  negative: {
    color: vars.color.danger,
  },
});

export const metricTrendBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s1,
  ...vars.typography.captionBold,
});

globalStyle(`${metricTrendBase} svg`, {
  width: '1.2rem',
  height: '1.2rem',
});

export const metricValueRow = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.2rem',
  marginBottom: vars.space.s1,
});

export const metricValue = style({
  color: vars.color.gray900,
  ...vars.typography.title_b_28,
});

export const metricSuffix = style({
  color: vars.color.gray700,
  ...vars.typography.body14,
});

export const metricTitle = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});
