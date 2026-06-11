import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s6,
  padding: '2.4rem',
  minHeight: '100%',
});

export const contentGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 35rem',
  gap: vars.space.s4,
});

export const sideColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});
