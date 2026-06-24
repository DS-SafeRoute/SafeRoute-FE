import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: 0,
  width: '100%',
  overflow: 'hidden',
  textAlign: 'left',
  selectors: {
    '&:hover': {
      borderColor: vars.color.primary,
    },
  },
});

export const video = style({
  aspectRatio: '16/9',
  position: 'relative',
  backgroundColor: '#0a0f1a',
});

export const badgeRow = style({
  position: 'absolute',
  top: vars.space.s2,
  right: vars.space.s2,
  left: vars.space.s2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const liveBadge = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s1,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.danger,
  padding: '0.15rem 0.6rem',
  color: vars.color.white,
  ...vars.typography.caption,
  fontWeight: vars.fontWeight.semibold,
});

export const liveDot = style({
  borderRadius: '50%',
  backgroundColor: vars.color.white,
  width: '0.5rem',
  height: '0.5rem',
});

export const offlineBadge = style({
  display: 'flex',
  alignItems: 'center',
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: '0.15rem 0.6rem',
  color: 'rgba(255,255,255,0.6)',
  ...vars.typography.caption,
});

export const personCount = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: '0.15rem 0.6rem',
  color: vars.color.white,
  ...vars.typography.caption,
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

export const info = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.s2} ${vars.space.s3}`,
});

export const name = style({
  color: vars.color.textHigh,
  ...vars.typography.captionBold,
});

export const zone = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const meta = style({
  textAlign: 'right',
  ...vars.typography.caption,
  color: vars.color.textLow,
});
