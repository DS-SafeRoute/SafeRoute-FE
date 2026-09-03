import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const tabs = style({
  display: 'flex',
  gap: vars.space.s2,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const tab = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  gap: '0.2rem',
  transition: 'background-color 0.15s, border-color 0.15s',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textMid,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray25,
    },
  },
});

export const tabActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const tabCode = style({
  color: 'inherit',
  ...vars.typography.body14Bold,
});

export const tabLocation = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});
