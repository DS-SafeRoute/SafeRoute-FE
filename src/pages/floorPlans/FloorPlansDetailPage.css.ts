import { keyframes, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

/* 도면 상 구역 의미 색상 — 문·출입구/계단 표시에서 반복 사용되므로 한 곳에서만 정의 */
const zoneDoorColor = '#2563EB';
const zoneStairColor = '#F97316';

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

/* ── 장비/구역 추가 ── */
export const canvasActionFloat = style({
  position: 'absolute',
  zIndex: 10,
  top: vars.space.s6,
  right: vars.space.s6,
  display: 'flex',
  gap: vars.space.s2,
});

export const canvasActionButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s1,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.sm,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const canvasActionButtonActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const gridSizeLabelRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const gridSizeValue = style({
  color: vars.color.primary,
  ...vars.typography.body14Medium,
});

export const gridSizeSlider = style({
  appearance: 'none',
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray100,
  cursor: 'pointer',
  width: '100%',
  height: '0.6rem',
  selectors: {
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      borderRadius: '50%',
      backgroundColor: vars.color.primary,
      cursor: 'pointer',
      width: '1.6rem',
      height: '1.6rem',
    },
    '&::-moz-range-thumb': {
      border: 'none',
      borderRadius: '50%',
      backgroundColor: vars.color.primary,
      cursor: 'pointer',
      width: '1.6rem',
      height: '1.6rem',
    },
  },
});

export const gridSetupPopup = style({
  position: 'absolute',
  zIndex: 15,
  top: '5.6rem',
  right: vars.space.s6,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
  width: '25rem',
});

/* ── 발화점 지정 안내/확정 패널 ── */
export const fireOriginPopup = style({
  position: 'absolute',
  zIndex: 15,
  top: '5.6rem',
  left: vars.space.s6,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
  width: '25rem',
});

/* ── 카메라 시야 구역 지정 안내 ── */
/* ── 장비 추가 팝업 ── */
export const nodeAddPopup = style({
  position: 'absolute',
  zIndex: 15,
  top: '9.6rem',
  right: vars.space.s6,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s4,
  width: '25rem',
});

export const nodeAddHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s2,
});

export const nodeAddTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const nodeAddStepBadge = style({
  flexShrink: 0,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray50,
  padding: `0.2rem ${vars.space.s2}`,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const nodeAddHint = style({
  marginTop: `calc(-1 * ${vars.space.s2})`,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const nodeAddField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s1,
});

export const nodeAddLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const edgeBidirectionalField = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  cursor: 'pointer',
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const deviceTypeChips = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.s2,
});

export const deviceTypeChip = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const deviceTypeChipActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const nodeAddInput = style({
  outline: 'none',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textHigh,
  ...vars.typography.body14,
  selectors: {
    '&:focus': { borderColor: vars.color.primary },
  },
});

export const nodeAddActions = style({
  display: 'flex',
  gap: vars.space.s2,
});

export const nodeAddBackBtn = style({
  flexShrink: 0,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const nodeAddCancelBtn = style({
  flex: 1,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: vars.space.s2,
  color: vars.color.textMid,
  ...vars.typography.body14,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const nodeAddSubmitBtn = style({
  flex: 1,
  border: 'none',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primary,
  cursor: 'pointer',
  padding: vars.space.s2,
  color: vars.color.white,
  ...vars.typography.body14,
  selectors: {
    '&:hover:not(:disabled)': { backgroundColor: vars.color.primaryHover },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
});

export const zoneLegendTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const zoneLegendItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

export const zoneLegendLabel = style({
  flex: 1,
  color: vars.color.textMid,
  ...vars.typography.caption,
});

/* ── 마크 설명(노드/구역 종류) 범례 ── */
export const nodeTypeLegend = style({
  position: 'absolute',
  zIndex: 10,
  right: vars.space.s6,
  bottom: '7.6rem',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.md,
  backgroundColor: vars.color.white,
  padding: vars.space.s5,
  width: '16rem',
});

export const nodeTypeLegendSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const nodeTypeLegendDivider = style({
  borderTop: `1px solid ${vars.color.gray100}`,
});

export const nodeTypeDot = style({
  flexShrink: 0,
  borderRadius: '50%',
  width: '0.8rem',
  height: '0.8rem',
});

export const nodeTypeDotDoor = style({ backgroundColor: zoneDoorColor });
export const nodeTypeDotStair = style({ backgroundColor: zoneStairColor });
export const nodeTypeDotIot = style({ backgroundColor: vars.color.success });
export const nodeTypeDotLight = style({ backgroundColor: '#d97706' });

export const nodeTypeAreaSwatch = style({
  flexShrink: 0,
  border: '1px solid',
  borderRadius: vars.radius.sm,
  width: '1.2rem',
  height: '1.2rem',
});

export const nodeTypeAreaSwatchStair = style({
  borderColor: zoneStairColor,
  backgroundColor: 'rgba(249,115,22,0.25)',
});
export const nodeTypeAreaSwatchGeneral = style({
  borderColor: vars.color.gray500,
  backgroundColor: 'rgba(107,114,128,0.15)',
});
export const nodeTypeAreaSwatchCamera = style({
  borderColor: vars.color.purple,
  backgroundColor: 'rgba(139,92,246,0.18)',
});

export const nodeTypeCctvBadge = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.purple,
  width: '1.6rem',
  height: '1.6rem',
  color: vars.color.white,
  fontSize: '0.9rem',
  fontWeight: 700,
});

/* ── 우측 장비 목록 패널 ── */
export const devicePanel = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  borderLeft: `1px solid ${vars.color.gray100}`,
  backgroundColor: vars.color.white,
  width: '32rem',
  overflowY: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
});

export const devicePanelInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  paddingRight: vars.space.s5,
  paddingBottom: vars.space.s5,
  paddingLeft: vars.space.s5,
});

export const devicePanelSticky = style({
  position: 'sticky',
  zIndex: 2,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  backgroundColor: vars.color.white,
  paddingTop: vars.space.s5,
  paddingBottom: vars.space.s3,
});

export const devicePanelList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const filterTabs = style({
  display: 'flex',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  overflow: 'hidden',
});

export const filterTab = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: vars.space.s2,
  color: vars.color.textMid,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const filterTabActive = style({
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
  fontWeight: vars.fontWeight.semibold,
});

export const subFilterChips = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.s1,
});

export const subFilterChip = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: '0.4rem 1rem',
  color: vars.color.textMid,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const subFilterChipActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const devicePanelEmpty = style({
  margin: 0,
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const deviceCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  cursor: 'pointer',
  padding: vars.space.s4,
});

export const deviceCardSelected = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
});

export const zoneCardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s2,
});

export const zoneCardTitleGroup = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  gap: vars.space.s2,
  minWidth: 0,
});

export const zoneCardDot = style({
  flexShrink: 0,
  borderRadius: '50%',
  width: '0.7rem',
  height: '0.7rem',
});

export const zoneCardDotDoor = style({ backgroundColor: zoneDoorColor });
export const zoneCardDotStair = style({ backgroundColor: zoneStairColor });
export const zoneCardDotHallway = style({ backgroundColor: '#0891B2' });
export const zoneCardDotGeneral = style({ backgroundColor: vars.color.gray500 });

export const finalExitToggle = style({
  flexShrink: 0,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `0.1rem ${vars.space.s2}`,
  color: vars.color.textLow,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { borderColor: vars.color.gray300, color: vars.color.textMid },
  },
});

export const finalExitBadge = style({
  flexShrink: 0,
  border: 'none',
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.successLight,
  cursor: 'pointer',
  padding: `0.1rem ${vars.space.s2}`,
  color: vars.color.successText,
  ...vars.typography.caption,
});

export const deviceCardName = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const deviceCardNameInput = style({
  outline: 'none',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.white,
  padding: `${vars.space.s1} ${vars.space.s2}`,
  width: '100%',
  minWidth: 0,
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
  selectors: {
    '&:focus': { borderColor: vars.color.primary },
  },
});

export const deviceCardValueInput = style({
  outline: 'none',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.white,
  padding: `0 ${vars.space.s2}`,
  width: '14rem',
  textAlign: 'right',
  color: vars.color.textHigh,
  ...vars.typography.caption,
  selectors: {
    '&:focus': { borderColor: vars.color.primary },
  },
});

export const deviceCardRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const deviceCardKey = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const deviceCardValue = style({
  color: vars.color.textHigh,
  ...vars.typography.caption,
});

export const deviceCardActions = style({
  display: 'flex',
  gap: vars.space.s2,
  marginTop: vars.space.s1,
});

export const deviceCardEditBtn = style({
  flex: 1,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: vars.space.s2,
  color: vars.color.textMid,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const deviceCardDoneBtn = style({
  flex: 1,
  border: `1px solid ${vars.color.primary}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.primary,
  cursor: 'pointer',
  padding: vars.space.s2,
  color: vars.color.white,
  ...vars.typography.caption,
  selectors: {
    '&:hover': {
      borderColor: vars.color.primaryHover,
      backgroundColor: vars.color.primaryHover,
    },
  },
});

export const deviceCardDeleteBtn = style({
  flex: 1,
  border: `1px solid ${vars.color.dangerLight}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: vars.space.s2,
  color: vars.color.danger,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { backgroundColor: '#FFF5F5' },
  },
});

/* ── 구역/문/계단 카드 — 한 줄로 압축, 수정·삭제는 아이콘 버튼 ── */
export const zoneCardHeaderActions = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: vars.space.s1,
});

export const zoneCardIconBtn = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  width: '2.6rem',
  height: '2.6rem',
  color: vars.color.textMid,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const zoneCardIconBtnDone = style([
  zoneCardIconBtn,
  {
    borderColor: vars.color.primary,
    backgroundColor: vars.color.primary,
    color: vars.color.white,
    selectors: {
      '&:hover': {
        borderColor: vars.color.primaryHover,
        backgroundColor: vars.color.primaryHover,
      },
    },
  },
]);

export const zoneCardIconBtnDelete = style([
  zoneCardIconBtn,
  {
    borderColor: vars.color.dangerLight,
    color: vars.color.danger,
    selectors: {
      '&:hover': { backgroundColor: '#FFF5F5' },
    },
  },
]);

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

export const backButton = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: vars.radius.sm,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.textMid,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const backButtonIcon = style({
  transform: 'rotate(180deg)',
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
  position: 'relative',
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

export const canvasBodyWithActions = style({
  paddingTop: '8rem',
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

export const markerCctv = style({ backgroundColor: vars.color.purple, color: vars.color.white });
export const markerCctvOffline = style({
  backgroundColor: vars.color.gray300,
  color: vars.color.white,
});
export const markerIot = style({ backgroundColor: vars.color.success, color: vars.color.white });

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.4 },
});

export const stagedCameraMarker = style({
  position: 'absolute',
  zIndex: 2,
  transform: 'translate(-50%, -50%)',
  border: `2px dashed ${vars.color.purple}`,
  borderRadius: '50%',
  backgroundColor: 'rgba(139,92,246,0.25)',
  pointerEvents: 'none',
  width: '2.4rem',
  height: '2.4rem',
  animation: `${pulse} 1.4s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

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

export const canvasPlaceholderText = style({
  margin: 0,
  color: 'inherit',
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
