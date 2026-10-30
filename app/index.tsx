import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';

export default function AuthIndex() {
  const { status } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' || status === 'demo') {
      router.replace('/(tabs)/schedule');
    } else if (status === 'idle') {
      router.replace('/login');
    }
  }, [status, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
