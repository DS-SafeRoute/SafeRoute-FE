import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';
import { vars } from '@/shared/styles/global.css';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space.s1,
    minWidth: '4.1rem',
    width: 'fit-content',
    height: '2.4rem',
    padding: '0.3rem 1rem',
    borderRadius: vars.radius.pill,
    whiteSpace: 'nowrap',
    ...vars.typography.captionBold,
  },
  variants: {
    color: {
      neutral: {
        color: vars.color.textMid,
        backgroundColor: vars.color.gray50,
      },
      blue: {
        color: vars.color.infoText,
        backgroundColor: vars.color.infoLight,
      },
      green: {
        color: vars.color.successText,
        backgroundColor: vars.color.successLight,
      },
      yellow: {
        color: vars.color.warningText,
        backgroundColor: vars.color.warningLight,
      },
      red: {
        color: vars.color.dangerText,
        backgroundColor: vars.color.dangerLight,
      },
      purple: {
        color: vars.color.purpleText,
        backgroundColor: vars.color.purpleLight,
      },
    },
  },
  defaultVariants: {
    color: 'neutral',
  },
});

export const dot = style({
  width: '0.6rem',
  height: '0.6rem',
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: 'currentColor',
});
