import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const previewPanel = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: vars.space.s4,
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.gray25,
  padding: vars.space.s3,
  minHeight: '21.2rem',
});

export const floorPlan = style({
  position: 'relative',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  width: '100%',
  height: '18rem',
  overflow: 'hidden',
});

export const room = style({
  position: 'absolute',
  inset: 0,
  border: '2px solid #374151',
});

export const divider = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  borderLeft: '2px solid #374151',
});

export const firstDivider = style({
  left: '46%',
});

export const secondDivider = style({
  left: '69%',
});

export const roomLabel = style({
  position: 'absolute',
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const roomLabel301 = style({
  top: '58%',
  left: '25%',
});

export const roomLabel302 = style({
  top: '58%',
  left: '53%',
});

export const roomLabel305 = style({
  top: '58%',
  right: '12%',
});

export const routeLine = style({
  position: 'absolute',
  top: '72%',
  left: '22%',
  borderBottom: `4px dashed ${vars.color.success}`,
  width: '43%',
});

export const routeRise = style({
  position: 'absolute',
  top: '30%',
  left: '64.5%',
  borderLeft: `4px dashed ${vars.color.success}`,
  height: '44%',
});

export const routeTop = style({
  position: 'absolute',
  top: '29%',
  left: '64.5%',
  borderBottom: `4px dashed ${vars.color.success}`,
  width: '22%',
});

export const routeArrow = style({
  position: 'absolute',
  top: '69.8%',
  left: '20.2%',
  borderTop: '0.6rem solid transparent',
  borderRight: `1rem solid ${vars.color.success}`,
  borderBottom: '0.6rem solid transparent',
  width: 0,
  height: 0,
});

export const fireHalo = style({
  position: 'absolute',
  top: '2.6rem',
  right: '6.2rem',
  borderRadius: '50%',
  backgroundColor: 'rgba(239, 68, 68, 0.14)',
  width: '7.2rem',
  height: '7.2rem',
});

export const firePin = style({
  position: 'absolute',
  top: '4.6rem',
  right: '8.2rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: vars.color.danger,
  width: '3.2rem',
  height: '3.2rem',
  color: vars.color.white,
});

globalStyle(`${firePin} svg`, {
  width: '1.6rem',
  height: '1.6rem',
});
