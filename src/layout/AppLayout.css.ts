import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  backgroundColor: vars.color.gray50,
  height: '100%',
});

export const main = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minWidth: 0,
});
