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

export const gridSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s5,
});

// "카메라 목록"이라는 별도 제목은 세션 카드 바로 아래에서 어색해서 뺐고,
// 보조 정보만 우측 정렬로 가볍게 남겨둠 (목록 페이지 "총 N건"과 같은 톤)
export const gridHeadRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const gridSubtitle = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const floorGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const floorHeadRow = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space.s2,
});

export const floorLabel = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const floorCount = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space.s4,
});
