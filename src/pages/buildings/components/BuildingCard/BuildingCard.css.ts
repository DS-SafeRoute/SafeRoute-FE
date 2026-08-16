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

export const headerRight = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: vars.space.s2,
});

export const nameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
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

export const kebabWrapper = style({
  position: 'relative',
});

export const kebabButton = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.3rem',
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  width: '2.8rem',
  height: '2.8rem',
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const kebabDot = style({
  display: 'block',
  borderRadius: '50%',
  backgroundColor: vars.color.textMid,
  width: '0.3rem',
  height: '0.3rem',
});

export const menu = style({
  position: 'absolute',
  zIndex: 10,
  top: 'calc(100% + 0.4rem)',
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  backgroundColor: vars.color.white,
  width: 'max-content',
  overflow: 'hidden',
});

export const menuItem = style({
  cursor: 'pointer',
  padding: `${vars.space.s3} ${vars.space.s4}`,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const menuItemDanger = style({
  cursor: 'pointer',
  padding: `${vars.space.s3} ${vars.space.s4}`,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  color: vars.color.danger,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.dangerLight },
  },
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

export const cctvIcon = style({
  flexShrink: 0,
  color: vars.color.purple,
});

export const iotIcon = style({
  flexShrink: 0,
  color: vars.color.primary,
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
