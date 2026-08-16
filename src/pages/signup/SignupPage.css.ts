import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const page = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.gradient.landing,
  padding: vars.space.s6,
  minHeight: '100vh',
  color: vars.color.textHigh,
});

export const signupCard = style({
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s8,
  width: 'min(100%, 47rem)',
});

export const brand = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s3,
  color: vars.color.gray900,
  ...vars.typography.h4,
});

export const logoIcon = style({
  width: vars.space.s7,
  height: vars.space.s7,
});

export const title = style({
  marginTop: vars.space.s8,
  color: vars.color.gray900,
  ...vars.typography.h3,
});

export const fieldGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s5,
  marginTop: vars.space.s8,
  marginBottom: vars.space.s8,
});

export const loginGuide = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s1,
  marginTop: vars.space.s3,
  color: vars.color.gray500,
  ...vars.typography.body14,
});

export const loginButton = style({
  color: vars.color.primary,
  ...vars.typography.body14Bold,
});
