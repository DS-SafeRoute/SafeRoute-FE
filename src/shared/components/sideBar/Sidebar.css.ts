import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/shared/styles/global.css';

const menuText = {
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
};

export const container = style({
  position: 'sticky',
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
  padding: '2rem 1.6rem',
  width: '24rem',
  height: '100vh',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1.6rem',
  padding: '0.8rem',
});

export const logo = style({
  flexShrink: 0,
  width: '2.8rem',
  height: '2.8rem',
});

export const brand = style({
  color: vars.color.textHigh,
  ...vars.typography.titleBold,
});

export const navigation = style({
  flex: 1,
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
});

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
});

export const groupList = style({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '1rem',
});

export const groupLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1.2rem',
  padding: '1rem 1.2rem',
  ...menuText,
});

export const item = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem',
    borderRadius: vars.radius.md,
    backgroundColor: vars.color.white,
    padding: '1rem 1.2rem',
    width: '100%',
    ...menuText,

    selectors: {
      '&:hover': {
        backgroundColor: vars.color.gray25,
      },
    },
  },
  variants: {
    active: {
      false: {},
      true: {
        backgroundColor: vars.color.primaryLight2,
        color: vars.color.primary,
        fontWeight: vars.fontWeight.bold,

        selectors: {
          '&:hover': {
            backgroundColor: vars.color.primaryLight2,
          },
        },
      },
    },
  },
});

export const icon = style({
  flexShrink: 0,
  width: '2rem',
  height: '2rem',
});

export const footer = style({
  marginTop: 'auto',
  padding: '7.2rem 1.2rem 1.2rem',
});
