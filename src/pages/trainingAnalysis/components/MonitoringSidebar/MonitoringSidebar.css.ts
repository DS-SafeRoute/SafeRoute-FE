import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  gap: vars.space.s4,
  width: '30rem',
  minHeight: 0,
  overflow: 'hidden',
});

/* AI 비전 상태 */
export const aiStatusBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
});

export const aiStatusTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const aiStatusGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space.s2,
});

export const aiStatCard = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.s1,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.gray25,
  padding: vars.space.s3,
});

export const aiStatValue = style({
  color: vars.color.textHigh,
  ...vars.typography.h3,
  fontWeight: vars.fontWeight.bold,
});

export const aiStatLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

/* 카메라 스트림 리스트 */
export const streamBox = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
  minHeight: 0,
});

export const streamHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space.s1,
});

export const streamTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const zoneDropdown = style({
  width: '8rem',
});

export const streamList = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s1,
  minHeight: 0,
  overflowY: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const streamItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
    },
  },
});

export const streamItemActive = style({
  backgroundColor: vars.color.primaryLight2,
});

export const streamLeft = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space.s2,
});

export const statusDot = style({
  flexShrink: 0,
  marginTop: '0.25rem',
  borderRadius: '50%',
  width: '0.8rem',
  height: '0.8rem',
});

export const streamInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
});

export const streamName = style({
  color: vars.color.textHigh,
  ...vars.typography.captionBold,
});

export const streamMeta = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const streamCount = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: vars.space.s1,
  marginTop: '0.15rem',
  color: vars.color.textMid,
  ...vars.typography.caption,
});
