import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
  padding: vars.space.s6,
  width: '100%',
});

export const left = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s4,
});

export const iconBox = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.primaryLight2,
  width: '4.8rem',
  height: '4.8rem',
  color: vars.color.primary,
});

export const info = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
});

export const nameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const name = style({
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '1.8rem',
  fontWeight: vars.fontWeight.bold,
});

export const right = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  alignItems: 'flex-end',
  gap: '0.4rem',
});

export const count = style({
  lineHeight: 1,
  letterSpacing: '-0.02em',
  color: vars.color.primary,
  fontSize: '2.8rem',
  fontWeight: vars.fontWeight.bold,
});

export const countLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});
