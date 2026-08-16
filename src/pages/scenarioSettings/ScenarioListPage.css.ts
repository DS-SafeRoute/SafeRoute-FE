import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s6,
  padding: vars.space.s6,
  minHeight: '100%',
});

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s3,
});

export const addButton = style({
  marginLeft: 'auto',
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const emptyState = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s5,
  border: `1px dashed ${vars.color.gray200}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  minHeight: '36rem',
});

export const emptyIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: vars.color.primaryLight2,
  width: vars.space.s15,
  height: vars.space.s15,
  color: vars.color.primary,
});

globalStyle(`${emptyIcon} svg`, {
  width: vars.space.s7,
  height: vars.space.s7,
});

export const emptyText = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.s2,
  textAlign: 'center',
});

export const emptyTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const emptyDescription = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const filterEmpty = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px dashed ${vars.color.gray200}`,
  borderRadius: vars.radius.lg,
  minHeight: '18rem',
  color: vars.color.textLow,
  ...vars.typography.body14,
});
