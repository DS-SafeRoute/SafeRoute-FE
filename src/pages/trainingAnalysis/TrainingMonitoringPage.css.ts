import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  padding: vars.space.s8,
  paddingTop: '0.5rem',
});
