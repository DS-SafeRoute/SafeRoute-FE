import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

import { card } from './ReportCard.css';

export const gradeCard = style([
  card,
  {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: vars.gradient.reportGrade,
    padding: vars.space.s7,
    minHeight: '29rem',
    color: vars.color.textInverse,
  },
]);

export const eyebrow = style({
  color: vars.color.textInverseMid,
  ...vars.typography.captionMedium,
});

export const grade = style({
  marginTop: vars.space.s1,
  color: vars.color.textInverse,
  ...vars.typography.reportGrade,
});

export const summary = style({
  marginTop: vars.space.s3,
  color: vars.color.textInverseHigh,
  ...vars.typography.body16,
});

export const metricRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.space.s6,
});

export const metricLabel = style({
  display: 'block',
  marginBottom: vars.space.s1,
  color: vars.color.textInverseLow,
  ...vars.typography.body14,
});

export const metricValue = style({
  color: vars.color.textInverse,
  ...vars.typography.body16Bold,
});
