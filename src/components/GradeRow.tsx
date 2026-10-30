import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Spacing,
  ThemeColors,
  getGradeColor,
} from '../constants/theme';

export interface GradeRowProps {
  courseName: string;
  grade: string | null;
  session: number;
  colors: ThemeColors;
}

export const GradeRow: React.FC<GradeRowProps> = ({
  courseName,
  grade,
  session,
  colors,
}) => {
  const gradeColor = getGradeColor(grade, colors);
  const displayGrade = grade && grade.trim().length > 0 ? grade.trim() : '—';
  const sessionLabel = `Exam #${session}`;

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      {/* Course Details (Left) */}
      <View style={styles.courseInfo}>
        <Text
          style={[styles.courseName, { color: colors.text }]}
          numberOfLines={2}
        >
          {courseName}
        </Text>
        <Text style={[styles.sessionText, { color: colors.textSecondary }]}>
          {sessionLabel}
        </Text>
      </View>

      {/* Grade Pill (Right) */}
      <View style={[styles.gradePill, { backgroundColor: gradeColor }]}>
        <Text style={styles.gradeText}>{displayGrade}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  courseInfo: {
    flex: 1,
    paddingRight: Spacing.base,
  },
  courseName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.3,
  },
  sessionText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  gradePill: {
    minWidth: 48,
    height: 32,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
    textAlign: 'center',
  },
});
