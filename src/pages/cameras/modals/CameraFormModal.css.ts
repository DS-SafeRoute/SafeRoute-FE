import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const row = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.space.s4,
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  borderTop: `1px solid ${vars.color.gray100}`,
  paddingTop: vars.space.s4,
});

export const sectionLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const fieldWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const fieldLabel = style({
  display: 'block',
  color: vars.color.textHigh,
  ...vars.typography.body14,
});

export const select = style({
  appearance: 'none',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundPosition: 'right 1.2rem center',
  backgroundRepeat: 'no-repeat',
  ...vars.typography.body14,
  cursor: 'pointer',
  padding: '0 1.4rem',
  width: '100%',
  height: '4.4rem',
  color: vars.color.textHigh,
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: vars.color.primary,
    },
    '&:disabled': {
      backgroundColor: vars.color.gray50,
      cursor: 'not-allowed',
      color: vars.color.textLow,
    },
  },
});

export const selectError = style({
  borderColor: vars.color.danger,
  selectors: {
    '&:focus': {
      borderColor: vars.color.danger,
    },
  },
});

export const errorText = style({
  color: vars.color.danger,
  ...vars.typography.caption,
});
