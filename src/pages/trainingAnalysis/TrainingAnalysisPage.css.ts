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

const GRID_COLUMNS = '2fr 1fr 0.8fr 1fr 14rem';
// rowMain 버튼 내부에서 쓰는 본문 4개 열 — 헤더의 앞 4개 열과 폭 비율이 같아 정렬이 유지됨
const MAIN_COLUMNS = '2fr 1fr 0.8fr 1fr';

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
  gridTemplateColumns: '1fr 14rem',
  alignItems: 'center',
  selectors: {
    '&:not(:last-child)': {
      borderBottom: `1px solid ${vars.color.gray100}`,
    },
  },
});

// display:contents로 두면 브라우저·보조기술 조합에 따라 버튼 역할·포커스 표시가 누락될 수 있어
// 실제 grid item으로 두고, 내부에서 본문 열을 다시 grid로 나눔
export const rowMain = style({
  display: 'grid',
  gridTemplateColumns: MAIN_COLUMNS,
  alignItems: 'center',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: 0,
  width: '100%',
  textAlign: 'left',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.gray25,
    },
    '&:disabled': {
      cursor: 'default',
    },
  },
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
