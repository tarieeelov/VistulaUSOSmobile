import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Spacing,
} from '../constants/theme';

export interface SemesterPickerProps {
  semesters: string[];
  selected: string;
  onSelect: (term: string) => void;
  style?: ViewStyle;
}

/**
 * Formats USOS term identifiers to human-readable strings.
 * e.g. "2025L" -> "Summer 2025", "2025Z" -> "Winter 2025"
 */
export function formatTermId(termId: string): string {
  if (!termId) return '';
  const trimmed = termId.trim();
  const lastChar = trimmed.slice(-1).toUpperCase();
  const prefix = trimmed.slice(0, -1).trim();

  if (lastChar === 'L') {
    return `Summer ${prefix}`;
  }
  if (lastChar === 'Z') {
    return `Winter ${prefix}`;
  }
  return trimmed;
}

export const SemesterPicker: React.FC<SemesterPickerProps> = ({
  semesters,
  selected,
  onSelect,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={[styles.container, style]}
    >
      {semesters.map((termId) => {
        const isSelected = termId === selected;
        const formattedLabel = formatTermId(termId);

        return (
          <TouchableOpacity
            key={termId}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(termId)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                  fontFamily: isSelected ? Fonts.semiBold : Fonts.medium,
                },
              ]}
            >
              {formattedLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  pill: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: FontSizes.xs + 1,
    letterSpacing: 0.1,
  },
});

export default SemesterPicker;
