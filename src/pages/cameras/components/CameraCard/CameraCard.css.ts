import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
  padding: vars.space.s6,
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space.s4,
});

export const iconWrap = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.gray50,
  width: '4.4rem',
  height: '4.4rem',
  color: vars.color.textLow,
});

export const info = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: '0.2rem',
  minWidth: 0,
});

export const nameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const name = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textHigh,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.bold,
});

export const zone = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...vars.typography.body14,
  whiteSpace: 'nowrap',
  color: vars.color.textMid,
});

export const building = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...vars.typography.caption,
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
});

export const editButton = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  width: '2.8rem',
  height: '2.8rem',
  color: vars.color.textLow,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const stats = style({
  display: 'flex',
  gap: vars.space.s6,
  borderTop: `1px solid ${vars.color.gray100}`,
  paddingTop: vars.space.s4,
});

export const statItem = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s1,
});

export const statLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const statValue = style({
  color: vars.color.textHigh,
  fontWeight: vars.fontWeight.semibold,
  ...vars.typography.body14,
});
