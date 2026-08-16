import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s8,
  padding: vars.space.s8,
  overflowY: 'auto',
});

export const buildingSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const buildingHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const buildingDot = style({
  flexShrink: 0,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.primary,
  width: '1.2rem',
  height: '1.2rem',
});

export const buildingName = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const buildingCount = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const floorGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: vars.space.s4,
});

export const floorCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
});

export const cardTop = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
});

export const cardIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primaryLight,
  width: '3.6rem',
  height: '3.6rem',
  color: vars.color.primary,
});

export const floorLabel = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
  fontSize: '1.8rem',
  fontWeight: vars.fontWeight.semibold,
});

export const divider = style({
  borderTop: `1px solid ${vars.color.gray100}`,
});

export const cardMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s1,
});

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const metaKey = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const metaValue = style({
  color: vars.color.textMid,
  ...vars.typography.caption,
});

export const metaValueDone = style({
  color: vars.color.success,
  ...vars.typography.caption,
});

export const metaValuePending = style({
  color: vars.color.warning,
  ...vars.typography.caption,
});

export const metaValueFailed = style({
  color: vars.color.danger,
  ...vars.typography.caption,
});

export const uploadButton = style({
  border: `1px solid ${vars.color.primary}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primary,
  cursor: 'pointer',
  padding: `${vars.space.s2} 0`,
  width: '100%',
  textAlign: 'center',
  color: vars.color.white,
  ...vars.typography.body14,
  selectors: {
    '&:hover': {
      borderColor: vars.color.primaryHover,
      backgroundColor: vars.color.primaryHover,
    },
  },
});

export const manageButton = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} 0`,
  width: '100%',
  textAlign: 'center',
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover:not(:disabled)': {
      borderColor: vars.color.gray300,
      backgroundColor: vars.color.gray25,
    },
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
});

export const cardActions = style({
  display: 'flex',
  gap: vars.space.s2,
});

export const reuploadButton = style({
  flex: 1,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} 0`,
  textAlign: 'center',
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': {
      borderColor: vars.color.gray300,
      backgroundColor: vars.color.gray25,
    },
  },
});

export const deleteButtonCard = style({
  flex: 1,
  border: `1px solid ${vars.color.dangerLight}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} 0`,
  textAlign: 'center',
  color: vars.color.danger,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: '#FFF5F5' },
  },
});
