import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: vars.space.s3,
  padding: vars.space.s8,
  paddingTop: vars.space.s4,
  overflow: 'auto',
  // 스크롤은 그대로 되지만 오른쪽 스크롤바만 안 보이게 함
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});
