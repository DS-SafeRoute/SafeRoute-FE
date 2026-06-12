import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const layout = style({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
});

export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  gap: vars.space.s4,
  borderRight: `1px solid ${vars.color.gray100}`,
  padding: vars.space.s4,
  width: '24rem',
  overflowY: 'auto',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const sectionLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const selectWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const select = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  padding: `${vars.space.s2} ${vars.space.s3}`,
  width: '100%',
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: vars.color.primary,
    },
  },
});

export const divider = style({
  borderTop: `1px solid ${vars.color.gray100}`,
});

export const aiButton = style({
  width: '100%',
});

export const statusRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const statusLabel = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const modeGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const modeButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  width: '100%',
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray25,
    },
  },
});

export const modeButtonActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const modeDesc = style({
  paddingLeft: vars.space.s2,
  ...vars.typography.caption,
  color: vars.color.textLow,
});

export const canvas = style({
  position: 'relative',
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.color.gray50,
  overflow: 'hidden',
});

export const canvasPlaceholder = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s3,
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const canvasPlaceholderTitle = style({
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
});

export const mapImage = style({
  objectFit: 'contain',
  maxWidth: '100%',
  maxHeight: '100%',
  userSelect: 'none',
});
