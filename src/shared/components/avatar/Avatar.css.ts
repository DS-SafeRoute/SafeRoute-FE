import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const wrapper = style({
  position: 'relative',
  display: 'inline-flex',
  flexShrink: 0,
});

export const avatar = recipe({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.radius.pill,
    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 60%, #7C3AED 100%)',
    overflow: 'hidden',
    userSelect: 'none',
    letterSpacing: '-0.02em',
    color: vars.color.white,
    fontFamily: vars.fontFamily.base,
    fontWeight: vars.fontWeight.semibold,
  },
  variants: {
    size: {
      sm: { width: '3.2rem', height: '3.2rem', fontSize: '1.2rem' },
      md: { width: '4.4rem', height: '4.4rem', fontSize: '1.6rem' },
      lg: { width: '6rem', height: '6rem', fontSize: '2.2rem' },
    },
  },
  defaultVariants: { size: 'md' },
});

export const image = style({
  position: 'absolute',
  inset: 0,
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const statusDot = recipe({
  base: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    border: `2px solid ${vars.color.white}`,
    borderRadius: vars.radius.pill,
  },
  variants: {
    size: {
      sm: { width: '0.9rem', height: '0.9rem' },
      md: { width: '1.2rem', height: '1.2rem' },
      lg: { width: '1.6rem', height: '1.6rem' },
    },
    status: {
      online: { backgroundColor: vars.color.success },
      away: { backgroundColor: vars.color.warning },
      offline: { backgroundColor: vars.color.gray300 },
    },
  },
  defaultVariants: { size: 'md', status: 'online' },
});

export const nameGroup = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.white,
  paddingTop: '0.4rem',
  paddingRight: vars.space.s4,
  paddingBottom: '0.4rem',
  paddingLeft: '0.4rem',
});

export const nameLabel = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});
