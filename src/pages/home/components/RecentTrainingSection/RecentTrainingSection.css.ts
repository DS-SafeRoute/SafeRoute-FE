import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const recordsSection = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: '2rem',
  boxShadow: vars.shadow.card,
  backgroundColor: vars.color.white,
  padding: 0,
  minHeight: '69rem',
  overflow: 'hidden',
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '2rem 2.4rem',
});

export const sectionTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.titleBold,
});

export const headerAction = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s1,
  color: vars.color.primary,
  ...vars.typography.body14Medium,
});

export const headerActionButton = style([
  headerAction,
  {
    border: 'none',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    padding: 0,
    height: 'auto',
    minHeight: 'auto',
    selectors: {
      '&&:hover:not(:disabled)': {
        border: 'none',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        color: vars.color.primaryHover,
      },
    },
  },
]);

export const recordsTable = style({
  width: '100%',
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
});

export const tableHeadCell = style({
  borderTop: `1px solid ${vars.color.gray100}`,
  borderBottom: `1px solid ${vars.color.gray100}`,
  backgroundColor: vars.color.gray25,
  padding: '1.2rem 2rem',
  color: vars.color.textMid,
  ...vars.typography.captionBold,
});

export const tableCell = recipe({
  base: {
    borderBottom: `1px solid ${vars.color.gray100}`,
    padding: '1.7rem 2rem',
    textAlign: 'center',
    ...vars.typography.body14,
    color: vars.color.textHigh,
  },
  variants: {
    tone: {
      default: {},
      emphasis: {
        color: vars.color.textHigh,
        fontWeight: vars.fontWeight.bold,
      },
      date: {
        color: vars.color.textMid,
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});
