import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const floorConfig = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s4,
  marginBottom: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  padding: `0 ${vars.space.s6}`,
  height: '6rem',
});

export const floorConfigItem = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s3,
});

export const floorConfigLabel = style({
  whiteSpace: 'nowrap',
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const floorConfigControls = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s3,
  minWidth: '9.6rem',
});

export const floorConfigCount = style({
  minWidth: '2rem',
  textAlign: 'center',
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.semibold,
});

export const floorConfigCountReadonly = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '9.6rem',
  textAlign: 'center',
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.semibold,
});

export const floorConfigButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  width: '2.8rem',
  height: '2.8rem',
  color: vars.color.textMid,
  fontSize: '1.6rem',
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

export const configDivider = style({
  alignSelf: 'stretch',
  backgroundColor: vars.color.gray100,
  width: '1px',
});

export const floorConfigEditButton = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  width: '2.8rem',
  height: '2.8rem',
  color: vars.color.textMid,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const floorConfigDoneButton = style({
  flexShrink: 0,
  border: `1px solid ${vars.color.primaryLight}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primaryLight2,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.primary,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { backgroundColor: vars.color.primaryLight },
  },
});

export const floorList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const floorRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  padding: `${vars.space.s4} ${vars.space.s6}`,
});

export const floorLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s4,
});

export const floorBadge = style({
  flexShrink: 0,
  minWidth: '3rem',
  letterSpacing: '0.02em',
  color: vars.color.textLow,
  fontSize: '1.2rem',
  fontWeight: vars.fontWeight.semibold,
});

export const floorInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
});

export const floorName = style({
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.semibold,
});

export const floorStatus = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const floorStatusUploaded = style({
  color: vars.color.primary,
  ...vars.typography.caption,
});

export const actions = style({
  display: 'flex',
  flexShrink: 0,
  gap: vars.space.s2,
});

export const reuploadButton = style({
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s4}`,
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const deleteButton = style({
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${vars.color.dangerLight}`,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s4}`,
  color: vars.color.danger,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.dangerLight },
  },
});

export const uploadButton = style({
  display: 'flex',
  alignItems: 'center',
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
