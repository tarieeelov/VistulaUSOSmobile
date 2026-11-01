import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Moon,
  Sun,
  Trash2,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { UserProfile } from '../../src/types/usos';
import { usosFetch } from '../../src/services/usosApi';
import { MOCK_PROFILE } from '../../src/services/mockData';
import { cacheClearAll } from '../../src/services/cache';
import { StudentCard } from '../../src/components/StudentCard';
import { QuickLinks } from '../../src/components/QuickLinks';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Spacing,
} from '../../src/constants/theme';

export default function ProfileScreen() {
  const { isDemo, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setProfile(MOCK_PROFILE);
      } else {
        const response: any = await usosFetch<UserProfile>(
          'services/users/user',
          {
            fields:
              'id|first_name|last_name|student_number|photo_urls[200x200]|student_status',
          }
        );
        const data = response?.data !== undefined ? response.data : response;
        if (data && typeof data === 'object') {
          setProfile(data);
        }
      }
    } catch (error) {
      console.warn('[Profile] Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleClearCache = async () => {
    const executeClear = async () => {
      try {
        setIsClearingCache(true);
        await cacheClearAll();
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Offline data has been successfully removed.');
        } else {
          Alert.alert('Cache Cleared', 'Offline data has been successfully removed.');
        }
      } catch (err) {
        console.warn('[Profile] Clear cache error:', err);
      } finally {
        setIsClearingCache(false);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Clear Offline Cache?\nThis will delete all stored timetable and grade cache on this device.')) {
        await executeClear();
      }
      return;
    }

    Alert.alert(
      'Clear Offline Cache',
      'This will delete all stored timetable and grade cache on this device. You will need an active connection to reload data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Cache', style: 'destructive', onPress: executeClear },
      ]
    );
  };

  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        await logout();
        router.replace('/login');
      } catch (err) {
        console.warn('[Profile] Logout error:', err);
        router.replace('/login');
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Are you sure you want to log out from Vistula USOS?')) {
        await executeLogout();
      }
      return;
    }

    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from Vistula USOS?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: executeLogout },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Editorial Header */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Student identity & portal settings
          </Text>
        </View>

        {/* Demo Mode Notice */}
        {isDemo && (
          <View
            style={[
              styles.demoBanner,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.demoDot,
                { backgroundColor: colors.primary },
              ]}
            />
            <Text style={[styles.demoBannerText, { color: colors.textSecondary }]}>
              Demo Mode Active — Displaying sample student credentials
            </Text>
          </View>
        )}

        {/* Student Card Section */}
        {loading && !profile ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading student profile...
            </Text>
          </View>
        ) : profile ? (
          <StudentCard profile={profile} colors={colors} />
        ) : null}

        {/* Quick Links Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            University Portals
          </Text>
          <QuickLinks colors={colors} />
        </View>

        {/* Settings & Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Dark Mode Switch Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.surfaceHighlight },
                  ]}
                >
                  {isDark ? (
                    <Moon size={16} color={colors.textSecondary} strokeWidth={1.8} />
                  ) : (
                    <Sun size={16} color={colors.textSecondary} strokeWidth={1.8} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Dark Theme
                  </Text>
                  <Text
                    style={[
                      styles.settingSubLabel,
                      { color: colors.textTertiary },
                    ]}
                  >
                    {isDark ? 'Graphite dark mode' : 'Minimal clean white'}
                  </Text>
                </View>
              </View>

              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[styles.rowDivider, { backgroundColor: colors.borderLight }]}
            />

            {/* Clear Offline Cache Row */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleClearCache}
              activeOpacity={0.7}
              disabled={isClearingCache}
            >
              <View style={styles.settingInfo}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.surfaceHighlight },
                  ]}
                >
                  <Trash2 size={16} color={colors.textSecondary} strokeWidth={1.8} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Clear Offline Cache
                  </Text>
                  <Text
                    style={[
                      styles.settingSubLabel,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Free cached timetable & grade data
                  </Text>
                </View>
              </View>

              {isClearingCache ? (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              ) : (
                <ChevronRight size={16} color={colors.textTertiary} strokeWidth={1.8} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account / Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={16} color={colors.danger} strokeWidth={1.8} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Vistula USOS · Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingBottom: Spacing.sm + 2,
  },
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxl,
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    letterSpacing: 0.1,
    marginTop: 2,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  demoBannerText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    flex: 1,
  },
  loadingCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 180,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm + 2,
    letterSpacing: -0.2,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    letterSpacing: -0.2,
  },
  settingSubLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    letterSpacing: 0.1,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
