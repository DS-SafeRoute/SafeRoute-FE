import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

const fireSurface = 'rgba(252, 217, 204, 0.8)';
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

export const map = style({
  display: 'block',
  border: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  width: '100%',
  minWidth: 0,
  maxHeight: '28rem',
});

export const route = style({
  fill: 'none',
  stroke: vars.color.success,
  strokeDasharray: '7 5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 4,
});

export const gridCell = style({
  fill: 'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(156, 163, 175, 0.55)',
  strokeWidth: 0.6,
});

export const selectedFireCell = style({
  cursor: 'pointer',
  fill: 'rgba(255, 122, 69, 0.3)',
  stroke: fireBorder,
  strokeWidth: 2,
});

export const fireCell = style({
  fill: fireSurface,
  stroke: fireBorder,
  strokeWidth: 2,
});

export const fireMarker = style({
  pointerEvents: 'none',
  fontSize: '11px',
  fontWeight: vars.fontWeight.bold,
  fill: vars.color.dangerText,
  textAnchor: 'middle',
});

export const selectedFireMarker = style({
  pointerEvents: 'none',
  fontSize: '14px',
  textAnchor: 'middle',
  dominantBaseline: 'middle',
});

export const inactiveStartNode = style({
  fill: '#f9a8d4',
  stroke: vars.color.white,
  strokeWidth: 1.5,
});

export const startNode = style({
  cursor: 'pointer',
  fill: '#db2777',
  stroke: vars.color.white,
  strokeWidth: 1.5,
});

export const selectedStartNode = style({
  cursor: 'pointer',
  fill: '#7c3aed',
  stroke: vars.color.white,
  strokeWidth: 3,
});

export const statusMessage = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: vars.radius.pill,
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
  ...vars.typography.body14,
});
