import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const tabNav = style({
  display: 'flex',
  gap: 0,
  borderBottom: `1px solid ${vars.color.gray100}`,
});

export const tabItem = style({
  transition: 'color 0.15s, border-color 0.15s',
  ...vars.typography.body14Medium,
  marginBottom: '-1px',
  borderBottom: '2px solid transparent',
  background: 'none',
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s4}`,
  color: vars.color.textLow,
  selectors: {
    '&:hover': {
      color: vars.color.textMid,
    },
  },
});

export const tabItemActive = style({
  borderBottomColor: vars.color.primary,
  color: vars.color.primary,
  fontWeight: vars.fontWeight.semibold,
});
