import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const layout = style({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
});

export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  borderRight: `1px solid ${vars.color.gray100}`,
  width: '22rem',
  overflow: 'hidden',
});

export const sidebarHeader = style({
  borderBottom: `1px solid ${vars.color.gray100}`,
  padding: `${vars.space.s4} ${vars.space.s4} ${vars.space.s3}`,
  color: vars.color.textMid,
  ...vars.typography.caption,
});

export const buildingList = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflowY: 'auto',
});

export const buildingItem = style({
  borderLeft: '3px solid transparent',
  cursor: 'pointer',
  padding: `${vars.space.s3} ${vars.space.s4}`,
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray25,
    },
  },
});

export const buildingItemActive = style({
  borderLeftColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const main = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
});

export const mainHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${vars.color.gray100}`,
  padding: `${vars.space.s4} ${vars.space.s6}`,
});

export const mainTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const mainCount = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const floorList = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s3,
  padding: vars.space.s6,
  overflowY: 'auto',
});

export const floorCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
});

export const thumbnail = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.gray50,
  width: '7.2rem',
  height: '4.8rem',
  overflow: 'hidden',
});

export const thumbnailImg = style({
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const thumbnailPlaceholder = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const floorInfo = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s1,
});

export const floorLabel = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const floorMeta = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const floorActions = style({
  flexShrink: 0,
  marginLeft: 'auto',
});

export const emptyState = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s3,
  color: vars.color.textLow,
  ...vars.typography.body14,
});
