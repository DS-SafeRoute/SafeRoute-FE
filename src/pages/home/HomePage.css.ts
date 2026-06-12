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
  gap: vars.space.s6,
  padding: '2.4rem',
});

export const sectionCardBase = style({
  border: `1px solid ${vars.color.gray100}`,
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
});

export const contentGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 35rem',
  alignItems: 'start',
  gap: vars.space.s4,
});

export const sideColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
});
