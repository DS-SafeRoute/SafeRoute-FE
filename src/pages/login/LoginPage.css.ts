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

export const content = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 38rem) minmax(0, 42.4rem)',
  alignItems: 'center',
  gap: vars.space.s20,
  width: 'min(100%, 88.4rem)',
});

export const intro = style({
  display: 'flex',
  flexDirection: 'column',
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
  ...vars.typography.h1,
});

export const description = style({
  marginTop: vars.space.s6,
  color: vars.color.gray500,
  ...vars.typography.body16,
});

export const featureList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  marginTop: vars.space.s8,
});

export const featureItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  padding: `${vars.space.s3} ${vars.space.s4}`,
  width: '30.5rem',
  minHeight: vars.space.s14,
  color: vars.color.textHigh,
  ...vars.typography.body14,
});

export const featureIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primaryLight2,
  width: vars.space.s8,
  height: vars.space.s8,
  color: vars.color.primary,
});

export const featureIconSvg = style({
  width: vars.space.s4,
  height: vars.space.s4,
});

export const loginCard = style({
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s8,
});

export const formHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const formTitle = style({
  color: vars.color.gray900,
  ...vars.typography.h3,
});

export const fieldGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  marginTop: vars.space.s6,
});

export const formOptions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s3,
  marginTop: vars.space.s4,
  marginBottom: vars.space.s5,
});

export const checkboxLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s2,
  color: vars.color.gray500,
  ...vars.typography.captionMedium,
});

export const checkbox = style({
  flexShrink: 0,
  width: vars.space.s4,
  height: vars.space.s4,
  accentColor: vars.color.primary,
});

export const textButton = style({
  color: vars.color.primary,
  ...vars.typography.captionBold,
});

export const divider = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  gap: vars.space.s3,
  marginTop: vars.space.s6,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const dividerLine = style({
  backgroundColor: vars.color.gray100,
  height: '1px',
});

export const signupGuide = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s1,
  marginTop: vars.space.s5,
  color: vars.color.gray500,
  ...vars.typography.body14,
});

export const signupButton = style({
  color: vars.color.primary,
  ...vars.typography.body14Bold,
});
