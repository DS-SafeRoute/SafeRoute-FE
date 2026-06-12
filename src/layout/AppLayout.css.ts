import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  backgroundColor: vars.color.gray50,
  height: '100vh',
  overflow: 'hidden',
});

export const main = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  overflowY: 'auto',
});
