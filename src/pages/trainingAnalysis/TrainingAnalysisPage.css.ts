import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s5,
  padding: vars.space.s8,
  paddingTop: vars.space.s4,
  overflow: 'auto',
});

export const stateMessage = style({
  padding: `${vars.space.s5} 0`,
  color: vars.color.textLow,
  ...vars.typography.body14,
});

const GRID_COLUMNS = '2fr 1fr 0.8fr 1fr 14rem';

export const table = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  overflow: 'hidden',
});

export const headRow = style({
  display: 'grid',
  gridTemplateColumns: GRID_COLUMNS,
  alignItems: 'center',
  borderBottom: `1px solid ${vars.color.gray100}`,
  backgroundColor: vars.color.gray25,
  padding: `${vars.space.s3} ${vars.space.s5}`,
});

export const headCell = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const headCellAction = style({});

export const row = style({
  display: 'grid',
  gridTemplateColumns: GRID_COLUMNS,
  alignItems: 'center',
  selectors: {
    '&:not(:last-child)': {
      borderBottom: `1px solid ${vars.color.gray100}`,
    },
  },
});

export const rowMain = style({
  display: 'contents',
  textAlign: 'left',
});

export const name = style({
  padding: `${vars.space.s4} ${vars.space.s5}`,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const building = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const startedAt = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const action = style({
  display: 'flex',
  justifyContent: 'center',
  padding: `${vars.space.s3} ${vars.space.s5}`,
});

export const actionHint = style({
  textAlign: 'center',
  color: vars.color.textLow,
  ...vars.typography.body14,
});
