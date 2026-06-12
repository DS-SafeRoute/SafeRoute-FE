import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  minWidth: 0,
});

export const label = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const fieldShell = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  padding: '0 1.6rem',
  minHeight: '4.8rem',
  color: vars.color.textHigh,
  ...vars.typography.body14,
});

export const withLeadingIcon = style({
  color: vars.color.textLow,
});

globalStyle(`${withLeadingIcon} svg`, {
  width: '1.6rem',
  height: '1.6rem',
});

export const select = style({
  appearance: 'none',
  outline: 'none',
  border: 'none',
  background: 'transparent',
  width: '100%',
  color: vars.color.textHigh,
  WebkitAppearance: 'none',
  ...vars.typography.body14,
});

export const trailingIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.textLow,
});

globalStyle(`${trailingIcon} svg`, {
  width: '1.6rem',
  height: '1.6rem',
});
