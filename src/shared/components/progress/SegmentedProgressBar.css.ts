import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const track = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.2rem',
  width: '100%',
});

export const segment = style({
  flex: 1,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray200,
  height: '0.5rem',
});

export const segmentFilled = recipe({
  base: {
    backgroundColor: vars.color.primary,
  },
  variants: {
    tone: {
      neutral: { backgroundColor: vars.color.gray300 },
      progress: { backgroundColor: vars.color.warning },
      done: { backgroundColor: vars.color.success },
    },
  },
  defaultVariants: {
    tone: 'progress',
  },
});
