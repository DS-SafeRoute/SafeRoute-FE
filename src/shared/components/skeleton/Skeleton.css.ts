import { keyframes, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const skeleton = style({
  display: 'inline-block',
  flexShrink: 0,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.gray100,
  animation: `${pulse} 1.4s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});
