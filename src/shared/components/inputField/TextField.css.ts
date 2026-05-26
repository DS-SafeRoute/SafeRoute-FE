import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/shared/styles/global.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const label = style({
  color: vars.color.textHigh,
  ...vars.typography.body14,
});

export const fieldShell = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    height: '4.4rem',
    padding: '1rem 1.4rem',
    borderRadius: vars.radius.md,
    border: `1px solid ${vars.color.gray100}`,
    backgroundColor: vars.color.white,
    ...vars.typography.body14,
    transition: 'border-color 120ms ease, background-color 120ms ease',
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
        backgroundColor: vars.color.gray50,
        borderColor: vars.color.gray100,
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
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&::placeholder': {
      color: vars.color.textLow,
    },
    '&:disabled': {
      color: vars.color.textLow,
      cursor: 'not-allowed',
    },
  },
});

export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.textLow,
  flexShrink: 0,
  ':disabled': {
    cursor: 'not-allowed',
  },
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
