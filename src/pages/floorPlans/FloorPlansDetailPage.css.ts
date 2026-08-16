import { globalStyle, keyframes, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

/* ── 전체 레이아웃 ── */
export const layout = style({
  display: 'flex',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
});

/* ── 좌측 사이드바 ── */
export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  borderRight: `1px solid ${vars.color.gray100}`,
  backgroundColor: vars.color.white,
  width: '28rem',
  overflowY: 'auto',
});

export const sidebarInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  minHeight: 'min-content',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const sectionLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const divider = style({
  borderTop: `1px solid ${vars.color.gray100}`,
});

/* ── 건물/층 선택 ── */
export const selectWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const selectField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
});

export const selectFieldLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const dropdownFullWidth = style({
  display: 'block',
  width: '100%',
});

/* ── 층 목록 ── */
export const floorNavCard = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
});

export const floorNavHeader = style({
  borderBottom: `1px solid ${vars.color.gray100}`,
  padding: `${vars.space.s3} ${vars.space.s4}`,
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const floorNavList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const floorNavItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: 'none',
  borderBottom: `1px solid ${vars.color.gray100}`,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  padding: `${vars.space.s3} ${vars.space.s4}`,
  width: '100%',
  textAlign: 'left',
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const floorNavItemActive = style({
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

globalStyle(`${dropdownFullWidth} button`, {
  justifyContent: 'space-between',
  borderRadius: vars.radius.md,
  width: '100%',
});

globalStyle(`${dropdownFullWidth} ul`, {
  width: '100%',
});

/* ── AI 영역 분할 ── */
export const aiLayerList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
});

export const aiLayerItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  cursor: 'pointer',
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const aiLayerCheckbox = style({
  flexShrink: 0,
  cursor: 'pointer',
  width: '1.6rem',
  height: '1.6rem',
  accentColor: vars.color.primary,
});

/* ── 편집 모드 탭 ── */
export const modeGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s1,
});

export const modeTabGroup = style({
  display: 'flex',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  overflow: 'hidden',
});

export const modeTab = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRight: `1px solid ${vars.color.gray100}`,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s1}`,
  color: vars.color.textMid,
  ...vars.typography.caption,
  selectors: {
    '&:last-child': { borderRight: 'none' },
    '&:hover:not(:disabled)': { backgroundColor: vars.color.gray50 },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

export const modeTabActive = style({
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
  fontWeight: 700,
});

export const modeButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover:not(:disabled)': { backgroundColor: vars.color.gray50 },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

export const modeButtonActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
  ...vars.typography.body14Medium,
});

/* ── 플로팅 줌 컨트롤 ── */
export const canvasZoomFloat = style({
  position: 'absolute',
  zIndex: 10,
  right: '2.4rem',
  bottom: '2.4rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.md,
  backgroundColor: vars.color.white,
  padding: `0.4rem ${vars.space.s2}`,
});

/* ── 시뮬레이션 설정 ── */
export const simSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const simResetButton = style({
  border: 'none',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.danger,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  width: '100%',
  color: vars.color.white,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
  },
});

/* ── 혼잡도 히트맵 ── */
export const heatmapRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  cursor: 'pointer',
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const heatmapCheckbox = style({
  flexShrink: 0,
  cursor: 'pointer',
  width: '1.6rem',
  height: '1.6rem',
  accentColor: vars.color.primary,
});

/* ── 보기 설정 (줌) ── */
export const zoomRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const zoomLabel = style({
  flex: 1,
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const zoomValue = style({
  minWidth: '3.2rem',
  ...vars.typography.body14Medium,
  textAlign: 'center',
  color: vars.color.textHigh,
});

export const zoomButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

/* ── 범례 ── */
export const legend = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  marginTop: 'auto',
  paddingTop: vars.space.s4,
});

export const legendItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  color: vars.color.textMid,
  ...vars.typography.caption,
});

export const legendDot = style({
  flexShrink: 0,
  borderRadius: '50%',
  width: '1rem',
  height: '1rem',
});

export const legendDotIot = style({ backgroundColor: vars.color.success });
export const legendDotCctv = style({ backgroundColor: vars.color.primary });

/* ── 중앙 캔버스 영역 ── */
export const canvasArea = style({
  position: 'relative',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  backgroundColor: vars.color.gray50,
  overflow: 'hidden',
});

export const canvasHeader = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: vars.space.s2,
  margin: vars.space.s4,
  marginBottom: 0,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: `${vars.radius.lg} ${vars.radius.lg} 0 0`,
  backgroundColor: vars.color.white,
  padding: `${vars.space.s3} ${vars.space.s4}`,
});

export const canvasHeaderIcon = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.primary,
  width: '2rem',
  height: '2rem',
  color: vars.color.white,
  fontSize: '1rem',
  fontWeight: 700,
});

export const canvasHeaderText = style({
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const canvasHeaderFloor = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const canvasBody = style({
  display: 'flex',
  flex: 1,
  alignItems: 'flex-start',
  justifyContent: 'center',
  margin: vars.space.s4,
  marginTop: 0,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: `0 0 ${vars.radius.lg} ${vars.radius.lg}`,
  backgroundColor: vars.color.white,
  padding: vars.space.s6,
  overflow: 'auto',
});

export const mapWrap = style({
  position: 'relative',
  display: 'inline-block',
  flexShrink: 0,
  transformOrigin: 'top center',
  transition: 'transform 0.15s ease',
  overflow: 'visible',
});

export const mapImage = style({
  display: 'block',
  objectFit: 'contain',
  maxWidth: '100%',
  maxHeight: '100%',
  userSelect: 'none',
});

/* ── 마커 공통 ── */
export const markerWrap = style({
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.3rem',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
});

export const markerCircle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.1s',
  border: '2px solid white',
  borderRadius: '50%',
  boxShadow: vars.shadow.md,
  width: '2.4rem',
  height: '2.4rem',
  selectors: {
    '&:hover': { transform: 'scale(1.15)' },
  },
});

export const markerSelected = style({
  transform: 'scale(1.2)',
  outline: `3px solid ${vars.color.primary}`,
  outlineOffset: '2px',
});

export const markerLabel = style({
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(0,0,0,0.65)',
  pointerEvents: 'none',
  padding: `0.2rem ${vars.space.s2}`,
  whiteSpace: 'nowrap',
  color: vars.color.white,
  ...vars.typography.caption,
});

export const markerCctv = style({ backgroundColor: vars.color.primary, color: vars.color.white });
export const markerCctvOffline = style({
  backgroundColor: vars.color.gray300,
  color: vars.color.white,
});
export const markerIot = style({ backgroundColor: vars.color.success, color: vars.color.white });
export const markerExit = style({ backgroundColor: '#16a34a', color: vars.color.white });
export const markerStair = style({
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.primary,
  color: vars.color.white,
});
export const markerFire = style({ backgroundColor: vars.color.danger, color: vars.color.white });

/* ── Canvase placeholder ── */
export const canvasPlaceholder = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s3,
  width: '100%',
  height: '100%',
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const canvasPlaceholderTitle = style({
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
});

/* ── 히트맵 오버레이 ── */
export const heatmapOverlay = style({
  position: 'absolute',
  zIndex: 2,
  inset: 0,
  pointerEvents: 'none',
});

/* ── 시뮬레이션 경로 ── */
export const simPath = style({
  position: 'absolute',
  zIndex: 2,
  inset: 0,
  pointerEvents: 'none',
});

/* ── 우측: 선택 정보 패널 ── */
export const infoPanel = style({
  position: 'absolute',
  zIndex: 10,
  right: vars.space.s6,
  bottom: vars.space.s6,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.md,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
  width: '22rem',
});

export const infoPanelHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space.s1,
});

export const infoPanelTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const infoPanelClose = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: vars.space.s1,
  color: vars.color.textLow,
  selectors: {
    '&:hover': { color: vars.color.textHigh },
  },
});

export const infoPanelThumb = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.gray50,
  height: '7rem',
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const infoPanelRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: '0.4rem',
  paddingBottom: '0.4rem',
});

export const infoPanelKey = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const infoPanelValue = style({
  textAlign: 'right',
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const infoPanelActions = style({
  display: 'flex',
  gap: vars.space.s2,
  marginTop: vars.space.s2,
});

export const infoPanelActionBtn = style({ flex: 1 });

/* ── 시뮬레이션 경로 애니메이션 ── */
const dashMove = keyframes({
  from: { strokeDashoffset: 300 },
  to: { strokeDashoffset: 0 },
});

export const simPathAnimated = style({
  animation: `${dashMove} 1.8s linear forwards`,
  strokeDasharray: '8 5',
  strokeDashoffset: 300,
});

/* ── 시뮬레이션 결과 패널 ── */
export const simResultPanel = style({
  position: 'absolute',
  zIndex: 10,
  bottom: vars.space.s6,
  left: vars.space.s6,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.md,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
  width: '24rem',
});

export const simResultTitle = style({
  marginBottom: vars.space.s1,
  ...vars.typography.body14Medium,
  color: vars.color.textHigh,
});

export const simResultRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.space.s2,
  borderTop: `1px solid ${vars.color.gray50}`,
  paddingTop: '0.4rem',
  paddingBottom: '0.4rem',
});

export const simResultKey = style({
  flexShrink: 0,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const simResultValue = style({
  textAlign: 'right',
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const simResultBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  borderRadius: vars.radius.sm,
  padding: `0.2rem ${vars.space.s2}`,
  ...vars.typography.caption,
});

export const simResultBadgeSafe = style({
  backgroundColor: 'rgba(220,252,231,0.8)',
  color: '#15803d',
});

export const simResultBadgeDanger = style({
  backgroundColor: 'rgba(254,226,226,0.8)',
  color: '#b91c1c',
});

export const simRunButton = style({
  border: 'none',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primary,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  width: '100%',
  color: vars.color.white,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover:not(:disabled)': { opacity: 0.9 },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

/* ── POI 유형 선택 ── */
export const poiTypeGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.space.s1,
});

export const poiTypeBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} vars.space.s2`,
  color: vars.color.textMid,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const poiTypeBtnActive = style({
  fontWeight: 600,
});

/* ── 줌 리셋 ── */
export const zoomValueClickable = style({
  borderRadius: vars.radius.sm,
  ...vars.typography.body14Medium,
  cursor: 'pointer',
  padding: '0.1rem 0.4rem',
  minWidth: '3.2rem',
  textAlign: 'center',
  color: vars.color.primary,
  selectors: {
    '&:hover': { backgroundColor: vars.color.primaryLight2 },
  },
});

/* ── 토스트 ── */
const toastIn = keyframes({
  from: { transform: 'translateY(8px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
});

const toastOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

export const toast = style({
  position: 'absolute',
  zIndex: 20,
  top: vars.space.s4,
  left: '50%',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  transform: 'translateX(-50%)',
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.md,
  backgroundColor: '#1e1e2e',
  pointerEvents: 'none',
  padding: `${vars.space.s2} ${vars.space.s4}`,
  animation: `${toastIn} 0.2s ease forwards`,
  whiteSpace: 'nowrap',
  color: '#fff',
  ...vars.typography.body14,
});

export const toastFading = style({
  animation: `${toastOut} 0.3s ease forwards`,
});

/* ── 시뮬레이션 우측 패널 ── */
export const simPanel = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  borderLeft: `1px solid ${vars.color.gray100}`,
  backgroundColor: vars.color.white,
  width: '28rem',
  overflowY: 'auto',
});

export const simPanelInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  padding: '2rem 2rem 2.4rem',
  minHeight: 'min-content',
});

export const simPanelTitle = style({
  marginBottom: vars.space.s2,
  ...vars.typography.body14Medium,
  borderBottom: `1px solid ${vars.color.gray100}`,
  paddingBottom: vars.space.s2,
  color: vars.color.textHigh,
  fontWeight: 700,
});

export const simClickModeBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  width: '100%',
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { borderColor: vars.color.gray300, backgroundColor: vars.color.gray50 },
  },
});

export const simClickModeBtnActive = style({
  border: `1.5px solid #2563eb`,
  backgroundColor: 'rgba(37,99,235,0.07)',
  color: '#2563eb',
  fontWeight: 600,
});

export const simFireItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: `1px solid #f87171`,
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(254,202,202,0.5)',
  padding: '0.4rem 0.8rem',
  color: '#b91c1c',
  fontSize: '1.2rem',
});

export const simStartInfo = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: `1px solid #86efac`,
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(220,252,231,0.5)',
  padding: '0.5rem 0.8rem',
  color: '#166534',
  fontSize: '1.2rem',
});

export const simResultSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  marginTop: vars.space.s2,
  borderTop: `2px solid ${vars.color.gray100}`,
  paddingTop: vars.space.s4,
});
