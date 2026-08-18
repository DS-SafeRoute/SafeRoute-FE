import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s6,
  padding: vars.space.s8,
});

export const listHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const listCount = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: vars.space.s4,
});

export const stateMessage = style({
  padding: `${vars.space.s5} 0`,
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const errorMessage = style({
  padding: `${vars.space.s5} 0`,
  color: vars.color.danger,
  ...vars.typography.body14,
});
