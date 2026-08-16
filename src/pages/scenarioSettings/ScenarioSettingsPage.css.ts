import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  padding: vars.space.s6,
  minHeight: '100%',
});

export const sectionCardBase = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
});

export const mainSectionCard = style([
  sectionCardBase,
  {
    padding: vars.space.s6,
  },
]);

export const mainSectionTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const sectionTitleRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s4,
});

export const lockBadge = style({
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray50,
  padding: '0.3rem 1rem',
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const fieldGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.space.s4,
  marginTop: vars.space.s4,
});

export const sideCardTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const contentGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 38rem',
  alignItems: 'start',
  gap: vars.space.s4,
});

export const sideColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
});
