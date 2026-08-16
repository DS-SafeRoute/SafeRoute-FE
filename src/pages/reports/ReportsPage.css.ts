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
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 38.4rem), 1fr))',
  gap: vars.space.s5,
});

export const bottomGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 43rem), 1fr))',
  gap: vars.space.s5,
});
