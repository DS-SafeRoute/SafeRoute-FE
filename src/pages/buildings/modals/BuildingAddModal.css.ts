import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});
