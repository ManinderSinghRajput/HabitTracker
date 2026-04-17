export const theme = {
  bg: '#0E0E10',
  surface: '#18181B',
  surfaceElevated: '#1F1F23',
  surfaceAlt: '#222226',
  border: '#1E1E22',
  borderStrong: '#2A2A30',
  text: '#F5F5F7',
  textDim: '#9A9AA2',
  textSubtle: '#6C6C74',
  primary: '#E6305E',
  primaryAlt: '#FF5478',
  primarySoft: '#3A1321',
  success: '#4CAF50',
  warning: '#F5A623',
  danger: '#E5484D',
  pending: '#F5A623',
  accentGreen: '#8BC53F',
  accentOrange: '#F19934',
  accentRed: '#E45D3E',
  accentPink: '#E6305E',
  accentBlue: '#2FA1E8',
  accentPurple: '#A06AE3',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

// Named typography scale — premium apps lean on ~5 sizes, not ad-hoc numbers.
export const type = {
  display: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  title:   { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  body:    { fontSize: 15, fontWeight: '500' as const },
  label:   { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};

export const palette = [
  '#E6305E', '#F19934', '#F5A623', '#8BC53F',
  '#4CAF50', '#2FA1E8', '#A06AE3', '#E45D3E',
  '#D9475B', '#58B09C', '#EC6B9E', '#7C8CF8',
];
