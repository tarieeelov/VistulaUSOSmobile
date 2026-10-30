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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Moon,
  Sun,
  Trash2,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
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
  Shadows,
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

  const handleClearCache = () => {
    Alert.alert(
      'Clear Offline Cache',
      'This will delete all stored timetable and grade cache on this device. You will need an active connection to reload data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearingCache(true);
              await cacheClearAll();
              Alert.alert('Cache Cleared', 'Offline data has been successfully removed.');
            } catch (err) {
              console.warn('[Profile] Clear cache error:', err);
              Alert.alert('Error', 'Failed to clear cache.');
            } finally {
              setIsClearingCache(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from Vistula USOS?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (err) {
              console.warn('[Profile] Logout error:', err);
              router.replace('/login');
            }
          },
        },
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
        {/* Demo Mode Notice */}
        {isDemo && (
          <View
            style={[
              styles.demoBanner,
              {
                backgroundColor: colors.accentMuted,
                borderColor: `${colors.accent}44`,
              },
            ]}
          >
            <Sparkles size={16} color={colors.accent} />
            <Text style={[styles.demoBannerText, { color: colors.accent }]}>
              Demo Mode Active — Showing sample student data
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
            Quick Links
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
                borderColor: colors.borderLight,
              },
            ]}
          >
            {/* Dark Mode Switch Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: colors.primaryMuted },
                  ]}
                >
                  {isDark ? (
                    <Moon size={18} color={colors.primary} />
                  ) : (
                    <Sun size={18} color={colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Dark Mode
                  </Text>
                  <Text
                    style={[
                      styles.settingSubLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {isDark ? 'Dark theme active' : 'Light theme active'}
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
                    { backgroundColor: colors.warningMuted },
                  ]}
                >
                  <Trash2 size={18} color={colors.warning} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Clear Offline Cache
                  </Text>
                  <Text
                    style={[
                      styles.settingSubLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Free stored timetable and grade cache
                  </Text>
                </View>
              </View>

              {isClearingCache ? (
                <ActivityIndicator size="small" color={colors.warning} />
              ) : (
                <ChevronRight size={18} color={colors.textTertiary} />
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
                borderColor: `${colors.danger}66`,
                backgroundColor: colors.dangerMuted,
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={18} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <ShieldCheck size={14} color={colors.textTertiary} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Vistula USOS • v1.0.0
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
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  demoBannerText: {
    fontFamily: Fonts.medium,
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
    ...Shadows.sm,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
    letterSpacing: -0.2,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.sm,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
  },
  settingSubLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    marginLeft: 64,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
});
