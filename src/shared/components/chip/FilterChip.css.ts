import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@/shared/styles/global.css';

export const chip = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    textAlign: 'center',
    height: '3.3rem',
    padding: '0.6rem 1.2rem',
    borderRadius: vars.radius.pill,
    border: `1px solid ${vars.color.gray100}`,
    backgroundColor: vars.color.white,
    color: vars.color.textHigh,
    whiteSpace: 'nowrap',
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
  alignItems: 'center',
  justifyContent: 'center',
  color: 'currentColor',
  paddingLeft: '0.3rem',
  flexShrink: 0,

  ':disabled': {
    cursor: 'not-allowed',
  },
});

export const icon = style({
  width: '1.5rem',
  height: '1.5rem',
});
