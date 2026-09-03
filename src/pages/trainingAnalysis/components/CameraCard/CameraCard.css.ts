import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

// 카드는 항상 클릭 가능함(썸네일 유무와 무관하게 상세 페이지로 이동) — disabled 상태 없음
export const card = style({
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.15s',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  overflow: 'hidden',
  textAlign: 'left',
  selectors: {
    '&:hover': {
      boxShadow: vars.shadow.md,
    },
  },
});

export const thumb = style({
  aspectRatio: '16 / 9',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.color.gray900,
});

export const thumbImg = style({
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const thumbPlaceholder = style({
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(255,255,255,0.15)',
  width: '15%',
  height: '25%',
});

export const timeBadge = style({
  position: 'absolute',
  top: vars.space.s2,
  right: vars.space.s2,
  color: 'rgba(255,255,255,0.75)',
  ...vars.typography.caption,
});

export const noFrame = style({
  color: 'rgba(255,255,255,0.4)',
  ...vars.typography.captionBold,
});

export const info = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s2,
  padding: vars.space.s4,
});

export const name = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const location = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const link = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: '0.2rem',
  color: vars.color.primary,
  ...vars.typography.body14Bold,
});
