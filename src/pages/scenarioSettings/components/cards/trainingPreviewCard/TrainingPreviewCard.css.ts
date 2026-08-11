import { style } from '@vanilla-extract/css';

import { sectionCardBase } from '@pages/scenarioSettings/ScenarioSettingsPage.css';

import { vars } from '@styles/global.css';

export const card = style([
  sectionCardBase,
  {
    padding: vars.space.s5,
  },
]);

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s3,
});

export const metricList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  marginTop: vars.space.s5,
});

export const metricRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s3,
});

export const metricLabel = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const metricValue = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});
