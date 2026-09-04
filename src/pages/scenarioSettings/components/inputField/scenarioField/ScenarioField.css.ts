import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  minWidth: 0,
});

export const label = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});
