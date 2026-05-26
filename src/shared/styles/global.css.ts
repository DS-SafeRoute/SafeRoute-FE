import { globalStyle, createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  fontFamily: {
    base: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  color: {
    // Brand
    primary: '#2563EB',
    primaryHover: '#104ED8',
    primaryLight: '#DBEAFE',
    primaryLight2: '#EFF6FF',
    primaryDark: '#1E3A8A',
    infoText: '#1E40AF',

    // Text
    textHigh: '#101828',
    textMid: '#4A5563',
    textLow: '#99A1AF',
    textInverse: '#FFFFFF',

    // Semantic
    success: '#10B981',
    successLight: '#D1FAE5',
    successText: '#047857',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningText: '#B45309',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    dangerText: '#B42318',
    info: '#2563EB',
    infoLight: '#DBEAFE',
    purple: '#8B5CF6',
    purpleLight: '#EDE9FE',
    purpleText: '#6D28D9',

    // Neutrals
    white: '#FFFFFF',
    gray25: '#F9FAFB',
    gray50: '#F3F4F6',
    gray100: '#E5E7EB',
    gray300: '#9CA3AF',
    gray500: '#4B5563',
    gray700: '#1F2937',
    gray900: '#0A0F1A',
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
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  typography: {
    h1: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '4.8rem',
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '3rem',
      fontWeight: '700',
      lineHeight: '1.3',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '2rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '1.8rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '-0.02em',
    },
    body16: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '1.6rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.02em',
    },
    body14: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '1.4rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.02em',
    },
    body14Medium: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '1.4rem',
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: '-0.02em',
    },
    caption: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '1.2rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.02em',
    },
    captionMedium: {
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '1.2rem',
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: '-0.02em',
    },
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    card: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
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

globalStyle('body', {
  fontFamily: vars.fontFamily.base,
  fontSize: vars.typography.body16.fontSize,
  fontWeight: vars.typography.body16.fontWeight,
  color: vars.color.textHigh,
  backgroundColor: vars.color.gray25,
  lineHeight: vars.typography.body16.lineHeight,
  letterSpacing: vars.typography.body16.letterSpacing,
});

globalStyle('button', {
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle('ul, ol', {
  listStyle: 'none',
});

globalStyle('img', {
  maxWidth: '100%',
  display: 'block',
});

globalStyle('input, textarea, select', {
  fontFamily: 'inherit',
  fontSize: 'inherit',
});
