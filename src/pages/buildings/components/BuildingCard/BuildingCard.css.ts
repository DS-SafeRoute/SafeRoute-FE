import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.space.s3,
  padding: `${vars.space.s6} ${vars.space.s6} ${vars.space.s4}`,
});

export const headerLeft = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s1,
});

export const name = style({
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '2rem',
  fontWeight: vars.fontWeight.bold,
});

export const lastTraining = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const stats = style({
  display: 'flex',
  gap: vars.space.s6,
  borderTop: `1px solid ${vars.color.gray100}`,
  borderBottom: `1px solid ${vars.color.gray100}`,
  padding: `${vars.space.s4} ${vars.space.s6}`,
});

export const statItem = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s2,
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
  fontSize: '1.8rem',
  fontWeight: vars.fontWeight.bold,
});

export const statValueWarning = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  letterSpacing: '-0.02em',
  color: vars.color.warning,
  fontSize: '1.8rem',
  fontWeight: vars.fontWeight.bold,
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  padding: `${vars.space.s4} ${vars.space.s6}`,
});

export const floorPlanButton = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s1,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  height: '3.6rem',
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
  width: '3.6rem',
  height: '3.6rem',
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const editButton = style({
  border: `1px solid ${vars.color.gray100}`,
  color: vars.color.textMid,
});

export const deleteButton = style({
  border: `1px solid ${vars.color.gray100}`,
  color: vars.color.danger,
  selectors: {
    '&:hover': { backgroundColor: vars.color.dangerLight },
  },
});

export const cctvIcon = style({
  flexShrink: 0,
  color: vars.color.purple,
});

export const iotIcon = style({
  flexShrink: 0,
  color: vars.color.primary,
});
