import { keyframes, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const wrap = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s3,
  padding: `${vars.space.s12} 0`,
});

export const wrapCompact = style({
  flexDirection: 'row',
  padding: `${vars.space.s5} 0`,
});

export const spinner = style({
  flexShrink: 0,
  border: `3px solid ${vars.color.gray100}`,
  borderRadius: '50%',
  borderTopColor: vars.color.primary,
  width: '3.2rem',
  height: '3.2rem',
  animation: `${spin} 0.7s linear infinite`,
});

export const spinnerSmall = style({
  borderWidth: '2px',
  width: '2rem',
  height: '2rem',
});

export const message = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});
