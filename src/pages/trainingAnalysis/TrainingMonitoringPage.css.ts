import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s4,
  padding: vars.space.s8,
  paddingTop: '0.5rem',
  overflow: 'hidden',
});

export const body = style({
  display: 'flex',
  flex: 1,
  gap: vars.space.s5,
  minHeight: 0,
  overflow: 'hidden',
});

/* ── 그리드 뷰 ── */
export const mainArea = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
  overflow: 'hidden',
});

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s3,
});

export const toolbarTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const filterGroup = style({
  display: 'flex',
  gap: vars.space.s2,
});

export const filterBtn = style({
  transition: 'background 0.15s, color 0.15s',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s1} ${vars.space.s3}`,
  color: vars.color.textMid,
  ...vars.typography.captionBold,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
    },
  },
});

export const filterBtnActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight,
  color: vars.color.primary,
});

export const gridScroll = style({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const cameraGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space.s4,
});

export const liveDot = style({
  borderRadius: '50%',
  backgroundColor: vars.color.white,
  width: '0.5rem',
  height: '0.5rem',
});

export const offlineOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255,255,255,0.4)',
  ...vars.typography.captionBold,
});

/* ── 상세 뷰 ── */
export const detailMain = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s3,
  minWidth: 0,
  overflow: 'hidden',
});

export const detailActionBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const backBtn = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s1,
  transition: 'color 0.15s',
  border: 'none',
  borderRadius: vars.radius.md,
  background: 'none',
  cursor: 'pointer',
  padding: `${vars.space.s1} ${vars.space.s2}`,
  color: vars.color.textMid,
  ...vars.typography.captionBold,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
      color: vars.color.textHigh,
    },
  },
});

export const backIcon = style({
  transform: 'scaleX(-1)',
});

export const detailControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const iconBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.textMid,
  ...vars.typography.caption,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
    },
  },
});

export const detailHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
});

export const detailCameraName = style({
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const detailMetaRow = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const detailVideo = style({
  position: 'relative',
  flex: 1,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  minHeight: 0,
  overflow: 'hidden',
});

export const liveStreamBadge = style({
  position: 'absolute',
  top: vars.space.s3,
  left: vars.space.s3,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s1,
  color: vars.color.danger,
  ...vars.typography.captionBold,
});

export const detailPersonCount = style({
  position: 'absolute',
  top: vars.space.s3,
  right: vars.space.s3,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s1,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.gray50,
  padding: '0.3rem 0.8rem',
  color: vars.color.textMid,
  ...vars.typography.captionBold,
});
