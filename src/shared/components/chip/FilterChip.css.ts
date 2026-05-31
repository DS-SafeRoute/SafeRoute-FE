import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const chip = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.pill,
    backgroundColor: vars.color.white,
    padding: '0.6rem 1.2rem',
    height: '3.3rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    color: vars.color.textHigh,
  },
  variants: {
    selected: {
      true: {
        borderColor: vars.color.primary,
        backgroundColor: vars.color.primary,
        color: vars.color.textInverse,
      },
      false: {},
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      false: {},
    },
  },
});

const labelBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...vars.typography.captionMedium,
} as const;

export const label = recipe({
  base: {
    ...labelBase,
  },
  variants: {
    selected: {
      true: {
        color: vars.color.textInverse,
      },
      false: {},
    },
    interactive: {
      true: {
        ':disabled': {
          cursor: 'not-allowed',
        },
      },
      false: {},
    },
  },
});

export const removeButton = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: '0.3rem',
  color: 'currentColor',

  ':disabled': {
    cursor: 'not-allowed',
  },
});

export const icon = style({
  width: '1.5rem',
  height: '1.5rem',
});
