import { globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/global.css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const dangerHover = '#DC2626';
const dangerDark = '#B91C1C';

export const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6rem',
  fontFamily: 'inherit',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  border: '1.5px solid transparent',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      backgroundColor: vars.color.gray50,
      borderColor: vars.color.gray100,
      color: vars.color.gray300,
      pointerEvents: 'none',
    },
  },
});

export const variantStyles = styleVariants({
  primary: {
    backgroundColor: vars.color.primary,
    borderColor: vars.color.primary,
    color: '#fff',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: vars.color.primaryHover,
        borderColor: vars.color.primaryHover,
      },
      '&:active:not(:disabled)': {
        backgroundColor: vars.color.primaryDark,
        borderColor: vars.color.primaryDark,
      },
    },
  },
  outlined: {
    backgroundColor: '#fff',
    borderColor: vars.color.primary,
    color: vars.color.primary,
    selectors: {
      '&:hover:not(:disabled)': { backgroundColor: vars.color.primaryLight2 },
      '&:active:not(:disabled)': { backgroundColor: vars.color.primaryLight },
    },
  },
  danger: {
    backgroundColor: vars.color.danger,
    borderColor: vars.color.danger,
    color: '#fff',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: dangerHover,
        borderColor: dangerHover,
      },
      '&:active:not(:disabled)': {
        backgroundColor: dangerDark,
        borderColor: dangerDark,
      },
    },
  },
  dangerOutlined: {
    backgroundColor: '#fff',
    borderColor: vars.color.danger,
    color: vars.color.danger,
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: '#FEF2F2',
        borderColor: dangerHover,
        color: dangerHover,
      },
      '&:active:not(:disabled)': { backgroundColor: '#FEE2E2' },
    },
  },
  ghost: {
    backgroundColor: '#fff',
    borderColor: vars.color.gray100,
    color: vars.color.textMid,
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: vars.color.gray25,
        borderColor: vars.color.gray300,
      },
      '&:active:not(:disabled)': { backgroundColor: vars.color.gray50 },
    },
  },
});

export const sizeStyles = styleVariants({
  sm: { height: '3.2rem', padding: '0 1.2rem', fontSize: '1.3rem', borderRadius: vars.radius.sm },
  md: {
    height: '4.0rem',
    padding: '0 1.6rem',
    fontSize: vars.fontSize.body14,
    borderRadius: vars.radius.md,
  },
  lg: { height: '4.8rem', padding: '0 2.0rem', fontSize: '1.5rem', borderRadius: '1.0rem' },
});

export const iconOnlySizes = styleVariants({
  sm: { width: '3.2rem', padding: 0 },
  md: { width: '4.0rem', padding: 0 },
  lg: { width: '4.8rem', padding: 0 },
});

export const iconWrapper = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

globalStyle(`${iconWrapper} svg`, {
  width: '1.6rem',
  height: '1.6rem',
});

export const fullWidthStyle = style({ width: '100%' });

export const spinnerStyle = style({
  display: 'inline-block',
  width: '1.4rem',
  height: '1.4rem',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
  flexShrink: 0,
});
