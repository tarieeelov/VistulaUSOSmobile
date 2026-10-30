import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ──────────────────────────────────────────────
// Color Palettes
// ──────────────────────────────────────────────

export const DarkColors = {
  background: '#0A0A0F',
  surface: '#16161F',
  surfaceElevated: '#1E1E2A',
  surfaceHighlight: '#252536',
  primary: '#6C63FF',
  primaryMuted: '#6C63FF22',
  accent: '#00D4AA',
  accentMuted: '#00D4AA22',
  danger: '#FF6B6B',
  dangerMuted: '#FF6B6B22',
  warning: '#FFB84D',
  warningMuted: '#FFB84D22',
  success: '#4ADE80',
  successMuted: '#4ADE8022',
  text: '#EEEEF2',
  textSecondary: '#8888A0',
  textTertiary: '#555566',
  border: '#2A2A3A',
  borderLight: '#1F1F2F',
  tabBar: '#0D0D14',
  tabBarBorder: '#1A1A28',
  overlay: 'rgba(0,0,0,0.6)',
  // Grade colors
  gradeExcellent: '#4ADE80',
  gradeGood: '#6C63FF',
  gradeSatisfactory: '#FFB84D',
  gradeFail: '#FF6B6B',
  gradeNone: '#555566',
  // Class type colors
  classLecture: '#6C63FF',
  classLab: '#00D4AA',
  classExercise: '#FFB84D',
  classSeminar: '#FF6B9D',
  classOther: '#8888A0',
};

export const LightColors = {
  background: '#F5F5FA',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F0F8',
  surfaceHighlight: '#E8E8F2',
  primary: '#5046E5',
  primaryMuted: '#5046E522',
  accent: '#00B894',
  accentMuted: '#00B89422',
  danger: '#E74C3C',
  dangerMuted: '#E74C3C22',
  warning: '#F39C12',
  warningMuted: '#F39C1222',
  success: '#27AE60',
  successMuted: '#27AE6022',
  text: '#1A1A2E',
  textSecondary: '#6B6B80',
  textTertiary: '#9999AA',
  border: '#E0E0EA',
  borderLight: '#ECECF2',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0EA',
  overlay: 'rgba(0,0,0,0.35)',
  // Grade colors
  gradeExcellent: '#27AE60',
  gradeGood: '#5046E5',
  gradeSatisfactory: '#F39C12',
  gradeFail: '#E74C3C',
  gradeNone: '#9999AA',
  // Class type colors
  classLecture: '#5046E5',
  classLab: '#00B894',
  classExercise: '#F39C12',
  classSeminar: '#E74C3C',
  classOther: '#6B6B80',
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
  xl: 24,
  xxl: 28,
  hero: 34,
} as const;

// ──────────────────────────────────────────────
// Spacing & Layout
// ──────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
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
// Shadows (iOS-style)
// ──────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  }),
} as const;

// ──────────────────────────────────────────────
// Helper: get grade color
// ──────────────────────────────────────────────

export function getGradeColor(grade: string | null, colors: ThemeColors): string {
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

export function getClassTypeColor(classType: string | null, colors: ThemeColors): string {
  if (!classType) return colors.classOther;
  const lower = classType.toLowerCase();
  if (lower.includes('lecture') || lower.includes('wykład')) return colors.classLecture;
  if (lower.includes('lab') || lower.includes('labor')) return colors.classLab;
  if (lower.includes('exercise') || lower.includes('ćwicz')) return colors.classExercise;
  if (lower.includes('semin')) return colors.classSeminar;
  return colors.classOther;
}

export { SCREEN_WIDTH };
