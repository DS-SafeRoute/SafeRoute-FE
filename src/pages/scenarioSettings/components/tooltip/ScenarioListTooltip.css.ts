import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const trigger = style({
  position: 'relative',
  display: 'inline-flex',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.color.primary}`,
      outlineOffset: '2px',
      borderRadius: vars.radius.md,
    },
  },
});

export const content = style({
  position: 'absolute',
  zIndex: 300,
  right: 0,
  bottom: 'calc(100% + 0.8rem)',
  transform: 'translateY(0.4rem)',
  transition: 'opacity 120ms ease, transform 120ms ease, visibility 120ms ease',
  visibility: 'hidden',
  opacity: 0,
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.md,
  backgroundColor: vars.color.gray700,
  pointerEvents: 'none',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  width: 'max-content',
  maxWidth: '24rem',
  textAlign: 'center',
  color: vars.color.white,
  ...vars.typography.caption,
  selectors: {
    [`${trigger}:hover &`]: {
      transform: 'translateY(0)',
      visibility: 'visible',
      opacity: 1,
    },
    [`${trigger}:focus-visible &`]: {
      transform: 'translateY(0)',
      visibility: 'visible',
      opacity: 1,
    },
  },
});
