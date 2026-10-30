import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GraduationCap,
  Sparkles,
  LogIn,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react-native';
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

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
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
      const msg =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoMode = () => {
    setErrorMessage(null);
    enterDemoMode();
    router.replace('/(tabs)/schedule');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Subtle ambient lighting orbs in background */}
      <View
        style={[
          styles.ambientOrbTop,
          { backgroundColor: colors.primary, opacity: 0.12 },
        ]}
      />
      <View
        style={[
          styles.ambientOrbBottom,
          { backgroundColor: colors.accent, opacity: 0.08 },
        ]}
      />

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
          {/* Glassmorphic Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            {/* University Logo / Graduation Icon Badge */}
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: colors.primaryMuted,
                  borderColor: `${colors.primary}44`,
                },
              ]}
            >
              <GraduationCap size={44} color={colors.primary} strokeWidth={2} />
            </View>

            {/* App Title & Tagline */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.heroTitle}>
                <Text style={{ color: colors.text }}>Vistula </Text>
                <Text style={{ color: colors.primary }}>USOS</Text>
              </Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                Your university companion
              </Text>
            </View>

            {/* University Sub-label */}
            <View
              style={[
                styles.pillBadge,
                {
                  backgroundColor: colors.surfaceHighlight,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Text style={[styles.pillBadgeText, { color: colors.textTertiary }]}>
                Vistula University & VSH
              </Text>
            </View>

            {/* Error Message Display */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: colors.dangerMuted,
                    borderColor: `${colors.danger}66`,
                  },
                ]}
              >
                <AlertCircle size={18} color={colors.danger} />
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
                    ...Shadows.glow(colors.primary),
                  },
                ]}
                onPress={handleSignIn}
                activeOpacity={0.85}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Connecting to USOS...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <LogIn size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Sign in with USOS</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Secondary: Try Demo Mode */}
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: colors.surfaceHighlight,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleDemoMode}
                activeOpacity={0.8}
                disabled={isLoggingIn}
              >
                <View style={styles.buttonContent}>
                  <Sparkles size={18} color={colors.accent} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    Try Demo Mode
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Security note */}
            <View style={styles.securityNote}>
              <ShieldCheck size={14} color={colors.textTertiary} />
              <Text style={[styles.securityText, { color: colors.textTertiary }]}>
                Secure OAuth 1.0a connection via USOS API
              </Text>
            </View>
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
  ambientOrbTop: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  ambientOrbBottom: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
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
    ...Shadows.lg,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.hero,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.base,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  pillBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  pillBadgeText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.base,
    width: '100%',
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
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
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
  },
  secondaryButton: {
    height: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  securityText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
});
