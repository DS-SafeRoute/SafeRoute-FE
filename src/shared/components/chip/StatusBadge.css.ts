import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@/shared/styles/global.css';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space.s1,
    borderRadius: vars.radius.pill,
    padding: '0.3rem 1rem',
    width: 'fit-content',
    minWidth: '4.1rem',
    height: '2.4rem',
    whiteSpace: 'nowrap',
    ...vars.typography.captionBold,
  },
  variants: {
    color: {
      neutral: {
        backgroundColor: vars.color.gray50,
        color: vars.color.textMid,
      },
      blue: {
        backgroundColor: vars.color.infoLight,
        color: vars.color.infoText,
      },
      green: {
        backgroundColor: vars.color.successLight,
        color: vars.color.successText,
      },
      yellow: {
        backgroundColor: vars.color.warningLight,
        color: vars.color.warningText,
      },
      red: {
        backgroundColor: vars.color.dangerLight,
        color: vars.color.dangerText,
      },
      purple: {
        backgroundColor: vars.color.purpleLight,
        color: vars.color.purpleText,
      },
    },
  },
  defaultVariants: {
    color: 'neutral',
  },
});

export const dot = style({
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: 'currentColor',
  width: '0.6rem',
  height: '0.6rem',
});
