import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.space.s4,
  borderBottom: `1px solid ${vars.color.gray100}`,
  backgroundColor: vars.color.white,
  padding: `${vars.space.s6} ${vars.space.s8}`,
  width: '100%',
});

export const left = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
});

export const breadcrumb = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s1,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const breadcrumbSep = style({
  flexShrink: 0,
  color: vars.color.gray300,
});

export const breadcrumbCurrent = style({
  color: vars.color.textMid,
  ...vars.typography.captionMedium,
});

export const title = style({
  lineHeight: '1.3',
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '2.4rem',
  fontWeight: vars.fontWeight.bold,
});

export const description = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const right = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: vars.space.s3,
  paddingTop: '0.4rem',
});
