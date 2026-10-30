import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { GraduationCap, ShieldCheck } from 'lucide-react-native';
import { UserProfile } from '../types/usos';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Shadows,
  Spacing,
  ThemeColors,
} from '../constants/theme';
import { StatusBadge } from './StatusBadge';

export interface StudentCardProps {
  profile: UserProfile;
  colors: ThemeColors;
}

export const StudentCard: React.FC<StudentCardProps> = ({ profile, colors }) => {
  const [imageError, setImageError] = useState(false);

  const photoUri =
    profile.photo_urls?.['200x200'] ||
    profile.photo_urls?.['100x100'] ||
    profile.photo_urls?.['50x50'];

  const initials = [profile.first_name?.[0], profile.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  const studentNumber = profile.student_number || 'N/A';

  // Determine student status
  const isActive = profile.student_status === 1;
  const isGraduated = profile.student_status === 2;
  const statusLabel = isActive
    ? 'Active Student'
    : isGraduated
    ? 'Graduated'
    : 'Inactive';
  const statusColor = isActive
    ? colors.success
    : isGraduated
    ? colors.accent
    : colors.danger;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Decorative background glow accents */}
      <View
        style={[
          styles.decorativeGlow,
          {
            backgroundColor: colors.primary,
          },
        ]}
      />

      {/* Card Header: Institution Branding */}
      <View style={styles.cardHeader}>
        <View style={styles.brandingGroup}>
          <GraduationCap size={20} color={colors.primary} />
          <View>
            <Text style={[styles.institutionName, { color: colors.text }]}>
              VISTULA UNIVERSITY
            </Text>
            <Text
              style={[styles.institutionSub, { color: colors.textTertiary }]}
            >
              STUDENT ID CARD
            </Text>
          </View>
        </View>

        <ShieldCheck size={20} color={colors.accent} />
      </View>

      {/* Main Content: Avatar + Student Information */}
      <View style={styles.body}>
        {photoUri && !imageError ? (
          <Image
            source={{ uri: photoUri }}
            style={[styles.avatar, { borderColor: colors.border }]}
            onError={() => setImageError(true)}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.initialsText, { color: colors.primary }]}>
              {initials || 'VU'}
            </Text>
          </View>
        )}

        <View style={styles.infoCol}>
          <Text
            style={[styles.studentName, { color: colors.text }]}
            numberOfLines={2}
          >
            {fullName || 'Student Name'}
          </Text>

          <View style={styles.numberRow}>
            <Text
              style={[styles.numberLabel, { color: colors.textSecondary }]}
            >
              Student ID:
            </Text>
            <Text style={[styles.numberValue, { color: colors.text }]}>
              {studentNumber}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Footer: Status Badge + Verification */}
      <View
        style={[
          styles.cardFooter,
          {
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        <StatusBadge label={statusLabel} color={statusColor} size="sm" />
        <Text style={[styles.verifiedText, { color: colors.textSecondary }]}>
          Verified by USOS
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.lg,
  },
  decorativeGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  brandingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  institutionName: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    letterSpacing: 0.8,
  },
  institutionSub: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg * 1.25,
    marginBottom: Spacing.xs,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  numberLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
  numberValue: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  verifiedText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
});
