import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ──────────────────────────────────────────────
// Color Palettes
// ──────────────────────────────────────────────

export const DarkColors = {
  background: '#09090B',
  surface: '#18181B',
  surfaceElevated: '#1F1F23',
  surfaceHighlight: '#27272A',
  primary: '#6B8AFF',
  primaryMuted: '#6B8AFF12',
  accent: '#6B8AFF',
  accentMuted: '#6B8AFF12',
  danger: '#FF6B6B',
  dangerMuted: '#FF6B6B0A',
  warning: '#FFA94D',
  warningMuted: '#FFA94D0A',
  success: '#69DB7C',
  successMuted: '#69DB7C0A',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textTertiary: '#52525B',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.04)',
  tabBar: '#09090B',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(0,0,0,0.6)',
  // Grade colors
  gradeExcellent: '#69DB7C',
  gradeGood: '#6B8AFF',
  gradeSatisfactory: '#FFA94D',
  gradeFail: '#FF6B6B',
  gradeNone: '#52525B',
  // Class type colors
  classLecture: '#6B8AFF',
  classLab: '#69DB7C',
  classExercise: '#FFA94D',
  classSeminar: '#FF6B6B',
  classOther: '#A1A1AA',
};

export const LightColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F8F8FA',
  surfaceHighlight: '#F0F0F4',
  primary: '#3B5BDB',
  primaryMuted: '#3B5BDB10',
  accent: '#3B5BDB',
  accentMuted: '#3B5BDB10',
  danger: '#C92A2A',
  dangerMuted: '#C92A2A0A',
  warning: '#E67700',
  warningMuted: '#E677000A',
  success: '#2B8A3E',
  successMuted: '#2B8A3E0A',
  text: '#1A1A1A',
  textSecondary: '#71717A',
  textTertiary: '#A1A1AA',
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.04)',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(0,0,0,0.4)',
  // Grade colors
  gradeExcellent: '#2B8A3E',
  gradeGood: '#3B5BDB',
  gradeSatisfactory: '#E67700',
  gradeFail: '#C92A2A',
  gradeNone: '#A1A1AA',
  // Class type colors
  classLecture: '#3B5BDB',
  classLab: '#2B8A3E',
  classExercise: '#E67700',
  classSeminar: '#C92A2A',
  classOther: '#71717A',
};

export type ThemeColors = typeof DarkColors;

// ──────────────────────────────────────────────
// Typography
// ──────────────────────────────────────────────

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Fallbacks for before fonts load
  regularFallback: 'System',
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 26,
  xxl: 32,
  hero: 40,
} as const;

// ──────────────────────────────────────────────
// Spacing & Layout
// ──────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

// ──────────────────────────────────────────────
// Shadows (subtle, no glow)
// ──────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
} as const;

// Backward-compatible lowercase aliases
export const fonts = Fonts;
export const fontSizes = FontSizes;
export const spacing = Spacing;
export const borderRadius = BorderRadius;
export const shadows = Shadows;

// ──────────────────────────────────────────────
// Helper: get grade color
// ──────────────────────────────────────────────

export function getGradeColor(grade: string | null, colors: ThemeColors = DarkColors): string {
  if (!grade) return colors.gradeNone;
  const num = parseFloat(grade);
  if (isNaN(num)) return colors.gradeNone;
  if (num >= 4.5) return colors.gradeExcellent;
  if (num >= 3.5) return colors.gradeGood;
  if (num >= 3.0) return colors.gradeSatisfactory;
  return colors.gradeFail;
}

// ──────────────────────────────────────────────
// Helper: get class type color
// ──────────────────────────────────────────────

export function getClassTypeColor(classType: string | null, colors: ThemeColors = DarkColors): string {
  if (!classType) return colors.classOther;
  const lower = classType.toLowerCase();
  if (lower.includes('lecture') || lower.includes('wykład')) return colors.classLecture;
  if (lower.includes('lab') || lower.includes('labor')) return colors.classLab;
  if (lower.includes('exercise') || lower.includes('ćwicz')) return colors.classExercise;
  if (lower.includes('semin')) return colors.classSeminar;
  return colors.classOther;
}

export { SCREEN_WIDTH };
