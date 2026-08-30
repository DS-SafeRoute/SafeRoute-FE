import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  borderTop: `1px solid ${vars.color.gray100}`,
  paddingTop: vars.space.s4,
  selectors: {
    '&:first-child': {
      borderTop: 'none',
      paddingTop: 0,
    },
  },
});

export const sectionTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const rowButtons = style({
  display: 'flex',
  gap: vars.space.s2,
});

export const toggleButton = style({
  flex: 1,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} 0`,
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const toggleButtonActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const select = style({
  outline: 'none',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  ...vars.typography.body14,
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textHigh,
});

export const textInput = style({
  outline: 'none',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space.s2} ${vars.space.s3}`,
  ...vars.typography.body14,
  color: vars.color.textHigh,
});

export const saveRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const hint = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});
