import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const container = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space.s4,
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.xl,
    backgroundColor: vars.color.white,
    padding: vars.space.s6,
  },
  variants: {
    inactive: {
      true: {
        opacity: 0.7,
        backgroundColor: vars.color.gray50,
      },
      false: {},
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space.s4,
});

export const iconWrap = recipe({
  base: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${vars.color.gray100}`,
    borderRadius: vars.radius.lg,
    backgroundColor: vars.color.gray50,
    width: '5.6rem',
    height: '5.6rem',
    color: vars.color.textLow,
  },
  variants: {
    inactive: {
      true: {
        backgroundColor: vars.color.gray100,
      },
      false: {},
    },
  },
});

export const info = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: '0.4rem',
  minWidth: 0,
});

export const nameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const name = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  letterSpacing: '-0.02em',
  whiteSpace: 'nowrap',
  color: vars.color.textHigh,
  fontSize: '1.8rem',
  fontWeight: vars.fontWeight.bold,
});

export const zone = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...vars.typography.body14,
  whiteSpace: 'nowrap',
  color: vars.color.textMid,
});

export const building = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...vars.typography.caption,
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
});

export const kebabWrapper = style({
  position: 'relative',
  flexShrink: 0,
});

export const kebabButton = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.3rem',
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  width: '2.8rem',
  height: '2.8rem',
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const kebabDot = style({
  display: 'block',
  borderRadius: '50%',
  backgroundColor: vars.color.textMid,
  width: '0.3rem',
  height: '0.3rem',
});

export const menu = style({
  position: 'absolute',
  zIndex: 10,
  top: 'calc(100% + 0.4rem)',
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  backgroundColor: vars.color.white,
  minWidth: '10rem',
  overflow: 'hidden',
});

export const menuItem = style({
  cursor: 'pointer',
  padding: `${vars.space.s3} ${vars.space.s4}`,
  textAlign: 'center',
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const menuItemDanger = style({
  cursor: 'pointer',
  padding: `${vars.space.s3} ${vars.space.s4}`,
  textAlign: 'center',
  color: vars.color.danger,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.dangerLight },
  },
});

export const stats = style({
  display: 'flex',
  gap: vars.space.s6,
  borderTop: `1px solid ${vars.color.gray100}`,
  paddingTop: vars.space.s4,
});

export const statItem = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s1,
});

export const statLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const statValue = style({
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '1.6rem',
  fontWeight: vars.fontWeight.bold,
});
