import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
});

export const fireConditionField = style({
  marginTop: vars.space.s4,
  width: 'calc(50% - 0.8rem)',
});

export const fireLocationLabel = style({
  marginTop: vars.space.s5,
  marginBottom: vars.space.s2,
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const mapToolbar = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(18rem, 0.35fr) minmax(0, 1fr)',
  alignItems: 'end',
  gap: vars.space.s4,
  marginBottom: vars.space.s3,
});

export const mapGuide = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.s3,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.gray50,
  padding: vars.space.s3,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const setupNotice = style({
  marginTop: vars.space.s3,
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const setupButton = style({
  display: 'block',
  marginTop: vars.space.s3,
  marginLeft: 'auto',
});
