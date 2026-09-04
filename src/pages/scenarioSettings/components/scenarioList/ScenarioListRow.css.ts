import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const row = style({
  display: 'flex',
  alignItems: 'center',
  transition: 'background-color 120ms ease',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  minHeight: '9.2rem',
  overflow: 'visible',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray25,
    },
  },
});

export const mainButton = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  justifyContent: 'center',
  gap: vars.space.s2,
  borderRadius: `${vars.radius.lg} 0 0 ${vars.radius.lg}`,
  padding: vars.space.s5,
  minWidth: 0,
  textAlign: 'left',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.color.primary}`,
      outlineOffset: '-2px',
    },
  },
});

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s3,
  minWidth: 0,
});

export const title = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textHigh,
  ...vars.typography.body16Bold,
});

export const detail = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  paddingRight: vars.space.s5,
});

export const deleteButton = style({
  backgroundColor: vars.color.dangerSurface,
});

export const reportButton = style({
  backgroundColor: vars.color.primaryLight,
});

export const disabledDeleteButton = style({
  borderColor: vars.color.gray100,
  backgroundColor: vars.color.gray50,
  cursor: 'not-allowed',
  color: vars.color.gray300,
  selectors: {
    '&[aria-disabled="true"]:hover': {
      borderColor: vars.color.gray100,
      backgroundColor: vars.color.gray50,
      color: vars.color.gray300,
    },
  },
});
