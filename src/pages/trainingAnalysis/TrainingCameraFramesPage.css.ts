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

export const mainGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 32rem',
  alignItems: 'start',
  gap: vars.space.s5,
});

// minWidth:0 필수 — 없으면 grid item의 기본 min-width가 콘텐츠 크기(auto)로 잡혀서,
// 프레임이 20개로 늘어난 뒤 필름스트립의 콘텐츠 폭만큼 이 컬럼 전체가 밀려 커지고
// 우측 패널이 화면 밖으로 빠지는 가로 오버플로우가 생겼음
export const leftCol = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minWidth: 0,
});

/* 프레임 뷰어. 16:9 비율은 유지한 채 maxWidth로 상한을 둬서 화면이 넓어도 찌그러지지 않고
   가운데 정렬로 작아지게 함 (maxHeight로 누르면 비율이 깨져서 납작해짐) */
export const viewer = style({
  aspectRatio: '16 / 9',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.gray900,
  width: '100%',
  maxWidth: '64rem',
  overflow: 'hidden',
});

export const viewerTime = style({
  position: 'absolute',
  top: vars.space.s3,
  left: vars.space.s3,
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: '0.4rem 1rem',
  color: 'rgba(255,255,255,0.85)',
  ...vars.typography.caption,
});

export const viewerIndex = style({
  position: 'absolute',
  top: vars.space.s3,
  right: vars.space.s3,
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: '0.4rem 1rem',
  color: 'rgba(255,255,255,0.85)',
  ...vars.typography.captionBold,
});

export const navBtn = style({
  position: 'absolute',
  top: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateY(-50%)',
  transition: 'background 0.15s',
  border: 'none',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.1)',
  cursor: 'pointer',
  width: '4rem',
  height: '4rem',
  color: vars.color.white,
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    '&:disabled': {
      opacity: 0.3,
      cursor: 'default',
    },
  },
});

export const navIconPrev = style({
  transform: 'scaleX(-1)',
});

/* 지표 3종 — 카드 톤을 rightCol의 panel과 맞춤(padding s5로 통일) */
export const statRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space.s3,
});

export const statBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s5,
});

export const statLabel = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const statValue = style({
  color: vars.color.textHigh,
  ...vars.typography.h4,
});

export const statSub = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

/* 프레임 탐색 — 별도 카드로 감싸지 않고 뷰어 아래 흐름에 바로 이어지게 함.
   제목/개수 문구는 우측 "세션 정보" 패널의 저장 프레임 수와 중복이라 뺌 */
export const filmstripSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  minWidth: 0,
});

export const filmstripNavBtn = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: '50%',
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  width: '3.2rem',
  height: '3.2rem',
  color: vars.color.textMid,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

// justify-content: center로 하면 20개가 넘쳐서 스크롤이 필요할 때 시작 쪽(왼쪽) 프레임이
// 스크롤로 닿지 않는 브라우저 동작이 있어서 뺐음(오버플로우 상태에서 center/end 정렬은
// 시작 쪽 스크롤 가능 영역이 없어지는 크로미움 이슈) — 넘치지 않을 때만 자연스레 왼쪽 정렬됨
export const filmstrip = style({
  display: 'flex',
  flex: 1,
  gap: vars.space.s2,
  minWidth: 0,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const filmstripItem = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'outline-color 0.15s, box-shadow 0.15s',
  outline: `3px solid transparent`,
  outlineOffset: '-3px',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.gray900,
  cursor: 'pointer',
  width: '12rem',
  height: '8rem',
});

// 어두운 썸네일 위에서도 또렷이 보이도록 outline(진한 파랑) + 바깥쪽 은은한 링(box-shadow)을 같이 줌
export const filmstripItemActive = style({
  outlineColor: vars.color.primary,
  boxShadow: `0 0 0 2px ${vars.color.primaryLight}`,
});

export const filmstripIndex = style({
  position: 'absolute',
  top: '0.5rem',
  right: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: 'rgba(0,0,0,0.55)',
  width: '1.8rem',
  height: '1.8rem',
  lineHeight: 1,
  color: 'rgba(255,255,255,0.9)',
  fontSize: '1rem',
  fontWeight: vars.fontWeight.semibold,
});

export const filmstripAlert = style({
  color: '#F59E0B',
});

export const filmstripAlertDanger = style({
  color: vars.color.danger,
});

export const filmstripTime = style({
  position: 'absolute',
  bottom: '0.4rem',
  color: 'rgba(255,255,255,0.7)',
  ...vars.typography.caption,
});

/* 우측 패널 */
export const rightCol = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s5,
});

export const panelTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const infoKey = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const infoValue = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const emptyEvents = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const timelineList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const timelineItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space.s2,
});

export const timelineDot = style({
  flexShrink: 0,
  marginTop: '0.4rem',
  borderRadius: '50%',
  width: '0.8rem',
  height: '0.8rem',
});

export const timelineBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
});

export const timelineLabel = style({
  color: vars.color.textHigh,
  ...vars.typography.body14,
});

export const timelineMeta = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});
