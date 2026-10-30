import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'surface' | 'elevated';
  children?: React.ReactNode;
}

/**
 * A themed container component that adapts its background color
 * according to current theme mode and variant.
 */
export const ThemedView: React.FC<ThemedViewProps> = ({
  variant = 'default',
  style,
  children,
  ...rest
}) => {
  const { colors } = useTheme();

  const backgroundColor =
    variant === 'elevated'
      ? colors.surfaceElevated
      : variant === 'surface'
      ? colors.surface
      : colors.background;

  return (
    <View style={[styles.base, { backgroundColor }, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    // Default base styles
  },
});
