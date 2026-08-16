import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.s4,
});

export const rowLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s4,
  minWidth: 0,
});

export const floorBadge = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primaryLight,
  width: '4.2rem',
  height: '4.2rem',
  color: vars.color.primary,
  fontSize: '1.4rem',
  fontWeight: vars.fontWeight.bold,
});

export const rowInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s1,
  minWidth: 0,
});

export const rowFloorName = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
  fontSize: '1.6rem',
});

export const rowStatus = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const rowStatusDone = style({
  color: vars.color.success,
  ...vars.typography.caption,
});

export const rowActions = style({
  display: 'flex',
  flexShrink: 0,
  gap: vars.space.s2,
});

export const reuploadButton = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s4}`,
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const deleteButton = style({
  border: `1px solid ${vars.color.dangerLight}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s4}`,
  color: vars.color.danger,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: '#FFF5F5' },
  },
});

export const uploadButton = style({
  border: 'none',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primary,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s4}`,
  color: vars.color.white,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.primaryHover },
  },
});
