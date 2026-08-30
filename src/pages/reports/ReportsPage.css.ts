import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  padding: vars.space.s6,
});

export const toolbar = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const stateMessage = style({
  padding: vars.space.s12,
  textAlign: 'center',
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const pageState = style({
  minHeight: '32rem',
});

export const reportContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s5,
});

export const reportHeader = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: vars.space.s8,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.xl,
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
  padding: vars.space.s6,
  '@media': {
    'screen and (max-width: 960px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
});

export const reportTitleGroup = style({
  flexShrink: 0,
});

export const reportEyebrow = style({
  marginBottom: vars.space.s1,
  color: vars.color.primary,
  ...vars.typography.captionBold,
});

export const reportTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.h3,
});

export const reportMetaGrid = style({
  display: 'grid',
  flex: 1,
  gridTemplateColumns: 'repeat(5, minmax(10rem, 1fr))',
  width: '100%',
  '@media': {
    'screen and (max-width: 1200px)': {
      gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr))',
      rowGap: vars.space.s4,
    },
    'screen and (max-width: 640px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
});

export const reportMetaItem = style({
  borderLeft: `1px solid ${vars.color.gray100}`,
  padding: `0 ${vars.space.s4}`,
  selectors: {
    '&:first-child': {
      borderLeft: 0,
    },
  },
});

export const reportMetaLabel = style({
  marginBottom: vars.space.s1,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const reportMetaValue = style({
  wordBreak: 'keep-all',
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const topGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 38.4rem), 1fr))',
  gap: vars.space.s5,
});

export const bottomGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 43rem), 1fr))',
  gap: vars.space.s5,
});
