import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const fieldLabel = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const input = style({
  outline: 'none',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space.s2} ${vars.space.s3}`,
  ...vars.typography.body14,
  color: vars.color.textHigh,
  selectors: {
    '&:focus': {
      borderColor: vars.color.primary,
    },
  },
});

export const hint = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});
