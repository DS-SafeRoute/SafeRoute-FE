import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const scheduledCard = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: '2rem',
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
  padding: '2rem',
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

export const titleIcon = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  width: '2rem',
  height: '2rem',
  color: vars.color.primary,
});

export const sectionTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14_bold,
});

export const scheduleInfoPanel = style({
  marginTop: '1.8rem',
  borderRadius: '1.8rem',
  backgroundColor: vars.color.primaryLight2,
  padding: '1.8rem',
});

export const subtleLabel = style({
  color: vars.color.primary,
  ...vars.typography.body14Medium,
});

export const schedulePlace = style({
  marginTop: vars.space.s1,
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const scheduleMetaGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '1.8rem',
  marginTop: '1.2rem',
});

export const scheduleMetaItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
});

export const metaLabel = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const metaValue = style({
  lineHeight: '1.4',
  letterSpacing: '-0.03em',
  color: vars.color.gray900,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.bold,
});

export const scheduleButton = style({
  marginTop: vars.space.s4,
});
