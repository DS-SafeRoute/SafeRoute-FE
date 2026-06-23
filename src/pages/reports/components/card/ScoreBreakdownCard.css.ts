import { style, styleVariants } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const scoreCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s6,
  padding: vars.space.s6,
});

export const scoreList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const scoreHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s4,
  marginBottom: vars.space.s1,
});

export const scoreLabel = style({
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
});

export const weight = style({
  color: vars.color.textLow,
  fontWeight: vars.fontWeight.regular,
});

export const value = style({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: vars.space.s2,
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const denominator = style({
  color: vars.color.textLow,
  ...vars.typography.body14Medium,
});

export const track = style({
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray50,
  height: '0.7rem',
  overflow: 'hidden',
});

export const barBase = style({
  borderRadius: vars.radius.pill,
  height: '100%',
});

export const barColor = styleVariants({
  primary: {
    backgroundColor: vars.color.primary,
  },
  success: {
    backgroundColor: vars.color.success,
  },
});
