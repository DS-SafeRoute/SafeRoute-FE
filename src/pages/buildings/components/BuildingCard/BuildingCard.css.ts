import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
  overflow: 'hidden',
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.space.s3,
  padding: `${vars.space.s4} ${vars.space.s4} 0`,
});

export const headerLeft = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
});

export const name = style({
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.semibold,
});

export const lastTraining = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const stats = style({
  display: 'flex',
  gap: vars.space.s8,
  padding: `${vars.space.s4} ${vars.space.s4}`,
});

export const statItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
});

export const statLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const statIcon = style({
  flexShrink: 0,
  color: vars.color.textLow,
});

export const statValue = style({
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.semibold,
});

export const statValueWarning = style({
  letterSpacing: '-0.02em',
  color: vars.color.warning,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.semibold,
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  borderTop: `1px solid ${vars.color.gray100}`,
  padding: `${vars.space.s3} ${vars.space.s4}`,
});

export const floorPlanButton = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  gap: vars.space.s1,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const iconButton = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  width: '3.2rem',
  height: '3.2rem',
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const editButton = style({
  color: vars.color.textMid,
});

export const deleteButton = style({
  color: vars.color.danger,
});
