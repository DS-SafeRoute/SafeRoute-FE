import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const label = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const fieldShell = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    transition: 'border-color 120ms ease, background-color 120ms ease',
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.md,
    backgroundColor: vars.color.white,
    ...vars.typography.body14,
    padding: '1rem 1.4rem',
    height: '4.4rem',
  },
  variants: {
    isError: {
      true: {
        borderColor: vars.color.danger,
      },
      false: {},
    },
    isFocused: {
      true: {
        borderColor: vars.color.primary,
      },
      false: {},
    },
    disabled: {
      true: {
        borderColor: vars.color.gray100,
        backgroundColor: vars.color.gray50,
        color: vars.color.textLow,
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        isError: true,
        isFocused: true,
      },
      style: {
        borderColor: vars.color.danger,
      },
    },
  ],
});

export const input = style({
  outline: 'none',
  border: 'none',
  background: 'transparent',
  width: '100%',
  ...vars.typography.body14,
  color: vars.color.textHigh,
  selectors: {
    '&::placeholder': {
      color: vars.color.textLow,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      color: vars.color.textLow,
    },
  },
});

export const iconButton = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.textLow,
  ':disabled': {
    cursor: 'not-allowed',
  },
});

export const leftIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.textLow,
});

export const icon = style({
  width: '1.6rem',
  height: '1.6rem',
});

export const helperText = recipe({
  base: {
    ...vars.typography.caption,
  },
  variants: {
    isError: {
      true: {
        color: vars.color.danger,
      },
      false: {
        color: vars.color.textLow,
      },
    },
  },
});
