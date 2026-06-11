import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const containerStyle = style({
  position: 'fixed',
  zIndex: 9999,
  top: vars.space.s6,
  right: vars.space.s6,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  pointerEvents: 'none',
});

globalStyle(`${containerStyle} > *`, {
  pointerEvents: 'auto',
});
