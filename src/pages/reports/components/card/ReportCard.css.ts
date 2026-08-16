import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const card = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
});

export const paddedCard = style([
  card,
  {
    padding: vars.space.s6,
  },
]);

export const cardTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body16Bold,
});
