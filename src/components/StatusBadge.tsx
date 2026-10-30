import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BorderRadius, FontSizes, Fonts, Spacing } from '../constants/theme';

export interface StatusBadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

/**
 * Converts a hex color string to rgba with given opacity.
 */
function getSemiTransparentColor(color: string, opacity: number = 0.2): string {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    let r = 0;
    let g = 0;
    let b = 0;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color,
  size = 'md',
  style,
}) => {
  const isSmall = size === 'sm';
  const backgroundColor = getSemiTransparentColor(color, 0.2);

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSm : styles.badgeMd,
        { backgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSmall ? styles.textSm : styles.textMd,
          { color },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  text: {
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  textSm: {
    fontSize: FontSizes.xs,
    lineHeight: FontSizes.xs * 1.3,
  },
  textMd: {
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.3,
  },
});
