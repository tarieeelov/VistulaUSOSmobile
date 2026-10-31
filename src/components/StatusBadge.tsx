import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { fonts, fontSizes, spacing, borderRadius } from '../constants/theme';

export interface StatusBadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

/**
 * StatusBadge — A subtle, minimal status indicator.
 * Uses alpha 0.08 background tint for a quiet, editorial feel.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color,
  style,
  textStyle,
  icon,
}) => {
  // Parse hex color to rgba with very low alpha for background
  const bgColor = hexToRgba(color, 0.08);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.label, { color }, textStyle]}>{label}</Text>
    </View>
  );
};

/**
 * Convert a hex color string to rgba with a given alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  iconWrapper: {
    marginRight: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    letterSpacing: 0.1,
    lineHeight: fontSizes.xs * 1.4,
  },
});

export { StatusBadge };
export default StatusBadge;
