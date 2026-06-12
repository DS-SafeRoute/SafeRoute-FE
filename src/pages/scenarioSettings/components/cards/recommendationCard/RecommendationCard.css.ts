import { globalStyle, style } from '@vanilla-extract/css';

import { sectionCardBase } from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import { vars } from '@styles/global.css';

export const card = style([
  sectionCardBase,
  {
    backgroundColor: vars.color.gray200,
    padding: '2rem',
    minWidth: '36rem',
  },
]);

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  marginBottom: vars.space.s2,
});

export const title = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

globalStyle(`${titleRow} svg`, {
  width: '1.8rem',
  height: '1.8rem',
});

export const message = style({
  color: vars.color.textHigh,
  ...vars.typography.body14,
});
