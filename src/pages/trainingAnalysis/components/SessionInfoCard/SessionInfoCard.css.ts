import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

// 카메라 목록(밝은 화면)과 프레임 상세("모니터링 콘솔", 어두운 화면) 양쪽에서 같은 컴포넌트를
// 쓰기 위한 톤 변형. 상세 화면은 CCTV 콘솔 느낌을 주려고 사이드바·뷰어와 함께 어둡게 감쌈
export const card = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space.s2,
    borderRadius: vars.radius.lg,
    padding: vars.space.s5,
  },
  variants: {
    tone: {
      light: {
        border: `1px solid ${vars.color.gray100}`,
        backgroundColor: vars.color.white,
      },
      dark: {
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: vars.color.gray900,
      },
    },
  },
  defaultVariants: { tone: 'light' },
});

export const headRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

// 도면 관리 상세(FloorPlansDetailPage)의 캔버스 헤더 뒤로가기와 동일한 톤
export const backButton = recipe({
  base: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s',
    borderRadius: vars.radius.sm,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    width: '2.4rem',
    height: '2.4rem',
  },
  variants: {
    tone: {
      light: {
        color: vars.color.textMid,
        selectors: { '&:hover': { backgroundColor: vars.color.gray50 } },
      },
      dark: {
        color: 'rgba(255,255,255,0.7)',
        selectors: { '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } },
      },
    },
  },
  defaultVariants: { tone: 'light' },
});

export const backIcon = style({
  transform: 'rotate(180deg)',
});

export const name = recipe({
  base: vars.typography.body16Bold,
  variants: {
    tone: {
      light: { color: vars.color.textHigh },
      dark: { color: vars.color.white },
    },
  },
  defaultVariants: { tone: 'light' },
});

export const meta = recipe({
  base: vars.typography.body14,
  variants: {
    tone: {
      light: { color: vars.color.textMid },
      dark: { color: 'rgba(255,255,255,0.6)' },
    },
  },
  defaultVariants: { tone: 'light' },
});

// 색이 채워진 박스로 강조하던 걸 뺌(문구 하나 띄우는 데 배경색 블록까지 쓰는 게 과했음) —
// 점 하나 + 옅은 텍스트로만 "지금 상태"를 담담하게 알려주는 상태줄로 바꿈
export const notice = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.space.s2,
    ...vars.typography.caption,
  },
  variants: {
    tone: {
      light: { color: vars.color.textLow },
      dark: { color: 'rgba(255,255,255,0.55)' },
    },
  },
  defaultVariants: { tone: 'light' },
});

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.3 },
});

// 진행 중 상태 표시용 점 — 텍스트를 읽기 전에도 "지금 살아있는 값"이라는 걸 알 수 있게 함
export const noticeLiveDot = style({
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: vars.color.success,
  width: '0.6rem',
  height: '0.6rem',
  animation: `${pulse} 1.6s ease-in-out infinite`,
});
