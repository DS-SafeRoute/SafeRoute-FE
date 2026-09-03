import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s5,
  padding: vars.space.s8,
  paddingTop: vars.space.s4,
  overflow: 'auto',
});

export const gridSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s5,
});

export const floorGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const floorHeadRow = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space.s2,
});

export const floorLabel = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const floorCount = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space.s4,
});
