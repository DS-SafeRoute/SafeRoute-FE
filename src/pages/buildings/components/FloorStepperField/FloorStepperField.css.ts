import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const label = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const controls = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.md,
    width: 'fit-content',
    overflow: 'hidden',
  },
  variants: {
    isError: {
      true: { borderColor: vars.color.danger },
      false: {},
    },
  },
});

export const stepButton = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: vars.color.gray50,
  cursor: 'pointer',
  width: '3.6rem',
  height: '4.4rem',
  color: vars.color.textMid,
  fontSize: '1.8rem',
  selectors: {
    '&:hover:not(:disabled)': { backgroundColor: vars.color.gray100 },
    '&:disabled': { cursor: 'not-allowed', color: vars.color.textLow },
  },
});

export const input = style({
  outline: 'none',
  border: 'none',
  backgroundColor: vars.color.white,
  width: '5.2rem',
  height: '4.4rem',
  textAlign: 'center',
  ...vars.typography.body14,
  color: vars.color.textHigh,
});

export const errorText = style({
  color: vars.color.danger,
  ...vars.typography.caption,
});
