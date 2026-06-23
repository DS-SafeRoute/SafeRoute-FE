import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s5,
  padding: vars.space.s6,
});

export const topGrid = style({
  display: 'grid',
  gridTemplateColumns: '38.4rem minmax(0, 1fr)',
  gap: vars.space.s5,
});

export const bottomGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 43rem',
  gap: vars.space.s5,
});
