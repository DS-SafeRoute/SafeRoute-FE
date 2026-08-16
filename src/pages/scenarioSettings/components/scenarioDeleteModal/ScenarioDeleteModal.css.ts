import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const modal = style({
  width: '48rem',
});

export const confirmBody = style({
  gap: vars.space.s4,
  padding: `${vars.space.s8} 4rem 0`,
});

export const footer = style({
  gap: vars.space.s3,
  padding: `${vars.space.s7} 4rem 4rem`,
});
