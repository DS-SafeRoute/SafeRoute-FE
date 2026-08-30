import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

import { paddedCard } from '../card/ReportCard.css';

export const chartGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 42rem), 1fr))',
  gap: vars.space.s5,
});

export const chartCard = style([
  paddedCard,
  {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space.s6,
    minHeight: '24rem',
  },
]);

export const chartTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body16Bold,
});

export const chartBody = style({
  flex: 1,
  minHeight: '18rem',
});
