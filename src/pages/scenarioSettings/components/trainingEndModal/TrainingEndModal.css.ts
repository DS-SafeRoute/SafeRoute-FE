import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const modal = style({
  width: '48rem',
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  paddingTop: vars.space.s2,
});

export const inputGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.space.s4,
  '@media': {
    'screen and (max-width: 560px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const helperText = style({
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primaryLight2,
  padding: vars.space.s3,
  color: vars.color.infoText,
  ...vars.typography.caption,
});

export const confirmBody = style({
  alignItems: 'center',
  gap: '0.6rem',
  padding: `${vars.space.s8} ${vars.space.s8} ${vars.space.s6}`,
  textAlign: 'center',
});

export const successIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.6rem',
  borderRadius: '50%',
  backgroundColor: vars.color.successLight,
  width: '5.6rem',
  height: '5.6rem',
  lineHeight: 1,
  color: vars.color.success,
  fontSize: '2.8rem',
});

export const actions = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.space.s3,
  width: '100%',
});
