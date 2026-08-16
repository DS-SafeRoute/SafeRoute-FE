import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

import { paddedCard } from './ReportCard.css';

export const card = style([
  paddedCard,
  {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space.s5,
  },
]);

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s4,
});

export const titleGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const iconBox = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.primary,
});

export const title = style({
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  color: vars.color.textMid,
  ...vars.typography.body16,
});

export const paragraphLabel = style({
  color: vars.color.textHigh,
  fontWeight: vars.fontWeight.bold,
});

export const successText = style({
  color: vars.color.success,
});

export const warningText = style({
  color: vars.color.warning,
});
