import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

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

export const fieldShell = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.md,
    backgroundColor: vars.color.white,
    padding: '0 1.2rem',
    height: '4.4rem',
  },
  variants: {
    disabled: {
      true: {
        backgroundColor: vars.color.gray50,
        color: vars.color.textLow,
      },
      false: {},
    },
  },
});

export const segment = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  minWidth: 0,
});

export const select = style({
  outline: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  minWidth: '3.6rem',
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&:disabled': {
      opacity: 1,
      cursor: 'default',
      color: vars.color.textLow,
    },
  },
});

export const unit = style({
  flexShrink: 0,
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const divider = style({
  flexShrink: 0,
  backgroundColor: vars.color.gray100,
  width: '1px',
  height: '2rem',
});
