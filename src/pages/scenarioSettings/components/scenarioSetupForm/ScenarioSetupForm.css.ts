import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
});

export const fireConditionField = style({
  marginTop: vars.space.s4,
  width: 'calc(50% - 0.8rem)',
});

export const fireLocationLabel = style({
  marginTop: vars.space.s5,
  marginBottom: vars.space.s2,
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});
