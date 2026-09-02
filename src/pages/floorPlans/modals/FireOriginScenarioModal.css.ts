import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const hint = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});
