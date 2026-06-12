import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const row = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.space.s4,
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  borderTop: `1px solid ${vars.color.gray100}`,
  paddingTop: vars.space.s4,
});

export const sectionLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});
