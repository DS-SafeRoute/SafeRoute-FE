import { globalStyle, style, styleVariants } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const systemCard = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: '2rem',
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
  padding: '2rem',
  minWidth: '36rem',
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const sectionTitleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const sectionTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14_bold,
});

export const systemList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.6rem',
  marginTop: '1.6rem',
});

export const systemRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s4,
});

export const systemLabel = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const systemValue = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s1,
  ...vars.typography.body14Medium,
});

export const systemValueTone = styleVariants({
  neutral: { color: vars.color.textMid },
  blue: { color: vars.color.infoText },
  green: { color: vars.color.success },
  yellow: { color: vars.color.warning },
  red: { color: vars.color.danger },
  purple: { color: vars.color.purpleText },
});

globalStyle(`${systemValue} svg`, {
  width: '1.4rem',
  height: '1.4rem',
});
