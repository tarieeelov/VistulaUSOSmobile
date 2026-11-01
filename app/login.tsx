import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogIn } from 'lucide-react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Shadows,
  Spacing,
} from '../src/constants/theme';

export default function LoginScreen() {
  const { login, enterDemoMode, status } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Navigate when authenticated or demo mode is entered
  useEffect(() => {
    if (status === 'authenticated' || status === 'demo') {
      router.replace('/(tabs)/schedule');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    if (isLoggingIn) return;
    try {
      setIsLoggingIn(true);
      setErrorMessage(null);
      await login();
    } catch (err: unknown) {
      setIsLoggingIn(false);
      const msg =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    }
  };

  const handleDemoMode = () => {
    setErrorMessage(null);
    enterDemoMode();
    router.replace('/(tabs)/schedule');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderLight,
              },
            ]}
          >
            {/* Icon Badge — text-based "VU" mark */}
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Text style={[styles.iconBadgeText, { color: colors.primary }]}>
                VU
              </Text>
            </View>

            {/* App Title & Tagline */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.heroTitle}>
                <Text style={{ color: colors.text }}>Vistula </Text>
                <Text style={{ color: colors.primary }}>USOS</Text>
              </Text>
              <Text style={[styles.tagline, { color: colors.textTertiary }]}>
                SCHEDULE · GRADES · PROFILE
              </Text>
            </View>

            {/* Error Message Display */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: colors.dangerMuted,
                    borderLeftColor: colors.danger,
                  },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              {/* Primary: Sign in with USOS */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.primary,
                    ...Shadows.sm,
                  },
                ]}
                onPress={handleSignIn}
                activeOpacity={0.85}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Connecting…</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <LogIn size={18} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.primaryButtonText}>Sign in with USOS</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Secondary: Try Demo Mode */}
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: colors.border },
                ]}
                onPress={handleDemoMode}
                activeOpacity={0.8}
                disabled={isLoggingIn}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Try Demo Mode
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security note */}
            <Text style={[styles.securityText, { color: colors.textTertiary }]}>
              Secured via OAuth 1.0a
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  animatedContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    letterSpacing: -0.3,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.hero,
    letterSpacing: -1,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    marginBottom: Spacing.base,
    width: '100%',
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    lineHeight: FontSizes.xs * 1.5,
  },
  actionSection: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
  },
  secondaryButton: {
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.base,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  securityText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xl,
  },
});
