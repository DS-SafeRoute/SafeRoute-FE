import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const modal = style({
  width: '48rem',
});

globalStyle(`${modal} > div:first-child`, {
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

export const footerContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  width: '100%',
});

export const actions = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.space.s3,
});

export const autoRedirect = style({
  textAlign: 'center',
  color: vars.color.textLow,
  ...vars.typography.caption,
});
