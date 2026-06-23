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

export const title = style({
  color: vars.color.textHigh,
  ...vars.typography.body16Bold,
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
});

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  borderTop: `1px solid ${vars.color.gray100}`,
  padding: `${vars.space.s4} 0`,

  selectors: {
    '&:first-child': {
      borderTop: 'none',
      paddingTop: 0,
    },
    '&:last-child': {
      paddingBottom: 0,
    },
  },
});

export const itemHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const itemTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const description = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});
