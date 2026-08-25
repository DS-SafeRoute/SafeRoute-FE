import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s5,
  textAlign: 'center',
});

export const icon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: vars.color.primaryLight2,
  width: vars.space.s15,
  height: vars.space.s15,
  color: vars.color.primary,
});

globalStyle(`${icon} svg`, {
  width: vars.space.s7,
  height: vars.space.s7,
});

export const text = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const title = style({
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const description = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});
