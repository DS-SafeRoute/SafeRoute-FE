import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  minWidth: 0,
});

export const label = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const trigger = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  padding: '0 1.6rem',
  width: '100%',
  height: '4.4rem',
  textAlign: 'left',
  color: vars.color.textHigh,
});

export const icon = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.textLow,
});

globalStyle(`${icon} svg`, {
  width: '2rem',
  height: '2rem',
});

export const value = style({
  color: vars.color.textHigh,
  ...vars.typography.body14,
});

export const hiddenInput = style({
  position: 'absolute',
  opacity: 0,
  pointerEvents: 'none',
  width: 0,
  height: 0,
  selectors: {
    '&::-webkit-calendar-picker-indicator': {
      display: 'none',
      WebkitAppearance: 'none',
    },
  },
});
