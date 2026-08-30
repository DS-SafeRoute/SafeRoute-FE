import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

const fireSurface = '#FCD9CC';
const fireBorder = '#FF7A45';

export const panel = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.gray25,
  padding: vars.space.s3,
  minHeight: '20rem',
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
  borderTop: `1px solid ${vars.color.gray200}`,
  borderLeft: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  width: '100%',
  minWidth: 0,
});

export const cell = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRight: `1px solid ${vars.color.gray200}`,
  borderBottom: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  minWidth: 0,
  height: '4.4rem',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.warningSurface,
    },
    '&:focus-visible': {
      zIndex: 1,
      outline: `2px solid ${vars.color.primary}`,
      outlineOffset: '-2px',
    },
    '&:disabled': {
      cursor: 'default',
    },
  },
});

export const selectedCell = style([
  cell,
  {
    boxShadow: `inset 0 0 0 1px ${fireBorder}`,
    backgroundColor: fireSurface,
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: fireSurface,
      },
    },
  },
]);

export const fireMarker = style({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.1rem',
  whiteSpace: 'nowrap',
  color: vars.color.dangerText,
  ...vars.typography.captionBold,
});

export const fireIcon = style({
  lineHeight: 1,
  fontSize: '1.8rem',
});

export const emptyMessage = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: vars.radius.pill,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
  ...vars.typography.body14,
});
