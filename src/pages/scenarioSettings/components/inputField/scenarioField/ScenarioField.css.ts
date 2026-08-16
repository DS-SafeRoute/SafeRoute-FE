import { globalStyle, style } from '@vanilla-extract/css';
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
    gap: vars.space.s3,
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.md,
    backgroundColor: vars.color.white,
    padding: '0 1.6rem',
    height: '4.4rem',
    color: vars.color.textHigh,
    ...vars.typography.body14,
  },
  variants: {
    disabled: {
      true: {
        backgroundColor: vars.color.gray50,
      },
      false: {},
    },
  },
});

export const withLeadingIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.danger,
});

globalStyle(`${withLeadingIcon} svg`, {
  width: '1.4rem',
  height: '1.4rem',
});

export const select = recipe({
  base: {
    appearance: 'none',
    opacity: 1,
    outline: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
    color: vars.color.textHigh,
    WebkitAppearance: 'none',
    ...vars.typography.body14,
  },
  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        color: vars.color.textLow,
      },
      false: {},
    },
    readOnly: {
      true: {
        cursor: 'default',
      },
      false: {},
    },
  },
});

export const trailingIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.textLow,
});

globalStyle(`${trailingIcon} svg`, {
  width: '1.4rem',
  height: '1.4rem',
});
