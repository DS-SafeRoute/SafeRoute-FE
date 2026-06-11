import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const trigger = recipe({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space.s2,
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.pill,
    backgroundColor: vars.color.white,
    cursor: 'pointer',
    padding: `${vars.space.s2} ${vars.space.s3} ${vars.space.s2} ${vars.space.s4}`,
    color: vars.color.textHigh,
    ...vars.typography.body14Medium,
    selectors: {
      '&:hover': { borderColor: vars.color.gray300 },
      '&[aria-expanded="true"]': { borderColor: vars.color.primary },
    },
  },
  variants: {
    disabled: {
      true: {
        opacity: 0.4,
        cursor: 'not-allowed',
        selectors: {
          '&:hover': { borderColor: vars.color.gray100 },
        },
      },
    },
  },
});

export const chevron = style({
  flexShrink: 0,
  transition: 'transform 0.15s ease',
  color: vars.color.textMid,
  selectors: {
    '[aria-expanded="true"] &': { transform: 'rotate(180deg)' },
  },
});

export const panel = style({
  position: 'absolute',
  zIndex: 200,
  borderRadius: vars.radius.lg,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
  backgroundColor: vars.color.white,
  padding: `${vars.space.s2} 0`,
  minWidth: '18rem',
  overflow: 'hidden',
});

export const option = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s3,
  cursor: 'pointer',
  padding: `${vars.space.s3} ${vars.space.s4}`,
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
    '&[aria-selected="true"]': {
      backgroundColor: vars.color.primaryLight2,
      color: vars.color.primary,
      fontWeight: vars.fontWeight.medium,
    },
  },
});

export const checkIcon = style({
  flexShrink: 0,
  color: vars.color.primary,
});
