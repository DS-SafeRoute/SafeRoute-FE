import { globalStyle, createGlobalTheme } from '@vanilla-extract/css';

const baseFontFamily = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const vars = createGlobalTheme(':root', {
  color: {
    infoText: '#1E40AF',
    // Brand
    primary: '#2563EB',
    primaryDark: '#1E3A8A',
    primaryHover: '#104ED8',
    primaryLight: '#DBEAFE',
    primaryLight2: '#EFF6FF',

    // Text
    textHigh: '#101828',
    textInverse: '#FFFFFF',
    textLow: '#99A1AF',
    textMid: '#4A5563',

    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    dangerText: '#991B1B',
    info: '#2563EB',
    infoLight: '#DBEAFE',
    purple: '#8B5CF6',
    purpleLight: '#EDE9FE',
    purpleText: '#5B21B6',
    // Semantic
    success: '#10B981',
    successLight: '#D1FAE5',
    successText: '#065F46',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningText: '#92400E',

    gray25: '#F9FAFB',
    gray50: '#F3F4F6',
    gray100: '#E5E7EB',
    gray300: '#9CA3AF',
    gray500: '#4B5563',
    gray700: '#1F2937',
    gray900: '#0A0F1A',
    // Neutrals
    white: '#FFFFFF',
  },
  fontFamily: {
    base: baseFontFamily,
  },
  fontWeight: {
    bold: '700',
    medium: '500',
    regular: '400',
    semibold: '600',
  },
  radius: {
    lg: '12px',
    md: '8px',
    pill: '999px',
    sm: '6px',
    xl: '16px',
  },
  shadow: {
    card: '1px 0 3px 0 rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
  },
  space: {
    s1: '0.4rem',
    s2: '0.8rem',
    s3: '1.2rem',
    s4: '1.6rem',
    s6: '2.4rem',
    s8: '3.2rem',
    s12: '4.8rem',
  },
  typography: {
    body14Bold: {
      fontFamily: baseFontFamily,
      fontSize: '1.4rem',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.5',
    },
    body14: {
      fontFamily: baseFontFamily,
      fontSize: '1.4rem',
      fontWeight: '400',
      letterSpacing: '-0.02em',
      lineHeight: '1.5',
    },
    body14Medium: {
      fontFamily: baseFontFamily,
      fontSize: '1.4rem',
      fontWeight: '500',
      letterSpacing: '-0.02em',
      lineHeight: '1.5',
    },
    body16: {
      fontFamily: baseFontFamily,
      fontSize: '1.6rem',
      fontWeight: '400',
      letterSpacing: '-0.02em',
      lineHeight: '1.5',
    },
    caption: {
      fontFamily: baseFontFamily,
      fontSize: '1.2rem',
      fontWeight: '400',
      letterSpacing: '-0.02em',
      lineHeight: '1.5',
    },
    captionBold: {
      fontFamily: baseFontFamily,
      fontSize: '1.2rem',
      fontWeight: '700',
      letterSpacing: '-0.012rem',
      lineHeight: '1.68rem',
    },
    captionMedium: {
      fontFamily: baseFontFamily,
      fontSize: '1.2rem',
      fontWeight: '500',
      letterSpacing: '-0.02em',
      lineHeight: '1.5',
    },
    caption13Bold: {
      fontFamily: baseFontFamily,
      fontSize: '1.3rem',
      fontWeight: '700',
      letterSpacing: '-0.012rem',
      lineHeight: '1.68rem',
    },
    h1: {
      fontFamily: baseFontFamily,
      fontSize: '4.8rem',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.25',
    },
    h2: {
      fontFamily: baseFontFamily,
      fontSize: '3rem',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.3',
    },
    h3: {
      fontFamily: baseFontFamily,
      fontSize: '2rem',
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.4',
    },
    h4: {
      fontFamily: baseFontFamily,
      fontSize: '1.8rem',
      fontWeight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.4',
    },
    titleBold: {
      fontFamily: baseFontFamily,
      fontSize: '1.7rem',
      fontWeight: '700',
      letterSpacing: '-0.03em',
      lineHeight: '1.4',
    },
    titleBold28: {
      fontFamily: baseFontFamily,
      fontSize: '2.8rem',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.4',
    },
  },
});

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html', {
  fontSize: '62.5%',
});

globalStyle('html, body', {
  overscrollBehaviorY: 'none',
});

globalStyle('body', {
  backgroundColor: vars.color.white,
  overflowX: 'hidden',
  overflowY: 'auto',
  scrollBehavior: 'smooth',
  color: vars.color.textHigh,
  fontFamily: vars.fontFamily.base,
});

globalStyle('button,input, textarea, select', {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  WebkitTapHighlightColor: 'transparent',
});

globalStyle('a', {
  textDecoration: 'none',
  color: 'inherit',
});

globalStyle('ul, ol', {
  listStyle: 'none',
});

globalStyle('img', {
  display: 'block',
  maxWidth: '100%',
});
