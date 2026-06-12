import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
});

export const sectionContainer = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  padding: vars.space.s6,
});

export const sectionCardBase = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: '2rem',
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

export const mainColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
});

export const sideColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
});
