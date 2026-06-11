import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const overlay = style({
  position: 'fixed',
  zIndex: 100,
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(16, 24, 40, 0.45)',
});

export const container = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: vars.radius.xl,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    backgroundColor: vars.color.white,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
  variants: {
    size: {
      sm: { maxWidth: '40rem' },
      md: { maxWidth: '54rem' },
      lg: { maxWidth: '72rem' },
    },
  },
  defaultVariants: { size: 'md' },
});

// form 모달 헤더
export const header = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.space.s4,
  padding: `${vars.space.s8} ${vars.space.s8} ${vars.space.s4}`,
});

export const headerText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
});

export const title = style({
  lineHeight: '1.4',
  letterSpacing: '-0.02em',
  color: vars.color.textHigh,
  fontSize: '2rem',
  fontWeight: '700',
});

export const description = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const closeButton = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  width: '2.8rem',
  height: '2.8rem',
  color: vars.color.gray300,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
      color: vars.color.textMid,
    },
  },
});

export const body = style({
  flex: 1,
  padding: `0 ${vars.space.s8} ${vars.space.s6}`,
  overflowY: 'auto',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
  scrollbarWidth: 'none',
});

export const footer = style({
  display: 'grid',
  flexShrink: 0,
  gridAutoColumns: '1fr',
  gridAutoFlow: 'column',
  gap: vars.space.s3,
  padding: `${vars.space.s4} ${vars.space.s8} ${vars.space.s8}`,
});

// confirm 모달 (X 없음)
export const confirmBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  padding: `${vars.space.s8} ${vars.space.s8} ${vars.space.s6}`,
});

export const confirmTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const confirmDescription = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const warningBox = style({
  border: `1px solid ${vars.color.dangerLight}`,
  borderRadius: vars.radius.md,
  backgroundColor: '#FFF5F5',
  padding: vars.space.s4,
  color: vars.color.danger,
  ...vars.typography.body14,
});
