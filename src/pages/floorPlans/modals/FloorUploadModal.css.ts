import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const dropzone = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s2,
  transition: 'border-color 0.15s, background-color 0.15s',
  border: `2px dashed ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  cursor: 'pointer',
  padding: vars.space.s8,
  selectors: {
    '&:hover': {
      borderColor: vars.color.primary,
      backgroundColor: vars.color.primaryLight2,
    },
  },
});

export const dropzoneActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
});

export const dropzoneIcon = style({
  color: vars.color.primary,
});

export const dropzoneText = style({
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
});

export const dropzoneHint = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const fileInput = style({
  display: 'none',
});

export const previewWrap = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.s4,
});

export const previewImg = style({
  borderRadius: vars.radius.md,
  objectFit: 'contain',
  maxWidth: '100%',
  maxHeight: '20rem',
});

export const previewName = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const changeButton = style({
  border: 'none',
  background: 'none',
  ...vars.typography.caption,
  cursor: 'pointer',
  padding: 0,
  color: vars.color.primary,
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.gray50,
  padding: `${vars.space.s2} ${vars.space.s3}`,
});

export const infoLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const infoValue = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});
