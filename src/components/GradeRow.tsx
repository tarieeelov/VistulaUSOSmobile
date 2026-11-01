import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  ThemeColors,
  DarkColors,
  getGradeColor,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
} from '../constants/theme';

export interface GradeRowProps {
  courseName: string;
  grade: string | null;
  session?: number;
  colors?: ThemeColors;
  ects?: number | null;
  semester?: string | null;
  style?: ViewStyle;
}

/**
 * GradeRow — A clean, editorial-style grade display row.
 *
 * - Hairline bottom border separator
 * - Grade pill: 28px height, min-width 44px, borderRadius 8
 * - No-grade ("—") uses a muted outline style instead of filled
 */
export const GradeRow: React.FC<GradeRowProps> = ({
  courseName,
  grade,
  session,
  colors = DarkColors,
  ects,
  semester,
  style,
}) => {
  const hasGrade = grade !== null && grade !== undefined && grade !== '' && grade !== '—';
  const displayGrade = hasGrade ? grade : '—';
  const gradeColor = hasGrade ? getGradeColor(grade!, colors) : null;
  const sessionLabel = session != null ? `Exam #${session}` : null;

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.borderLight,
        },
        style,
      ]}
    >
      {/* Left: Course info */}
      <View style={styles.courseInfo}>
        <Text
          style={[styles.courseName, { color: colors.text }]}
          numberOfLines={2}
        >
          {courseName}
        </Text>
        <View style={styles.metaRow}>
          {sessionLabel && (
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {sessionLabel}
            </Text>
          )}
          {sessionLabel && (ects != null || semester) && (
            <Text style={[styles.metaDot, { color: colors.textTertiary }]}>·</Text>
          )}
          {ects != null && (
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {ects} ECTS
            </Text>
          )}
          {ects != null && semester && (
            <Text style={[styles.metaDot, { color: colors.textTertiary }]}>·</Text>
          )}
          {semester && (
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {semester}
            </Text>
          )}
        </View>
      </View>

      {/* Right: Grade pill */}
      {hasGrade && gradeColor ? (
        <View
          style={[
            styles.gradePill,
            {
              backgroundColor: hexToRgba(gradeColor, 0.12),
            },
          ]}
        >
          <Text style={[styles.gradeText, { color: gradeColor }]}>
            {displayGrade}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.gradePillOutline,
            {
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.gradeTextMuted, { color: colors.textTertiary }]}>
            {displayGrade}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Convert a hex color string to rgba with a given alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith('#')) return `rgba(107, 138, 255, ${alpha})`;
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) || 0;
  const g = parseInt(cleaned.substring(2, 4), 16) || 0;
  const b = parseInt(cleaned.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  courseInfo: {
    flex: 1,
    marginRight: Spacing.base,
  },
  courseName: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.4,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    lineHeight: FontSizes.xs * 1.4,
  },
  metaDot: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginHorizontal: Spacing.xs,
  },
  gradePill: {
    height: 28,
    minWidth: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  gradeText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    letterSpacing: 0.2,
  },
  gradePillOutline: {
    height: 28,
    minWidth: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
  },
  gradeTextMuted: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    letterSpacing: 0.2,
  },
});

export default GradeRow;
