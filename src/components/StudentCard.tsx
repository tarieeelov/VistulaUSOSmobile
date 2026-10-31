import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { UserProfile } from '../types/usos';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Spacing,
  ThemeColors,
} from '../constants/theme';
import StatusBadge from './StatusBadge';

export interface StudentCardProps {
  profile: UserProfile;
  colors: ThemeColors;
}

/**
 * StudentCard — An editorial Bento Box digital student ID card.
 * Minimalist, monochrome elegance with subtle accent details.
 */
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
  const studentNumber = profile.student_number || '—';

  // Student status determination
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
    ? colors.primary
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
      {/* Header: Clean Editorial Branding */}
      <View style={styles.cardHeader}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.brandMark,
              { backgroundColor: colors.primaryMuted },
            ]}
          >
            <Text style={[styles.brandMarkText, { color: colors.primary }]}>
              VU
            </Text>
          </View>
          <View>
            <Text style={[styles.institutionName, { color: colors.text }]}>
              VISTULA UNIVERSITY
            </Text>
            <Text
              style={[styles.institutionSub, { color: colors.textTertiary }]}
            >
              STUDENT IDENTITY
            </Text>
          </View>
        </View>

        <StatusBadge label={statusLabel} color={statusColor} />
      </View>

      {/* Body: Photo + Student Details */}
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
                backgroundColor: colors.surfaceHighlight,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.initialsText, { color: colors.textSecondary }]}>
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
              style={[styles.numberLabel, { color: colors.textTertiary }]}
            >
              ID NUMBER
            </Text>
            <Text style={[styles.numberValue, { color: colors.textSecondary }]}>
              {studentNumber}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer: Editorial meta line */}
      <View
        style={[
          styles.cardFooter,
          {
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Verified by USOS API
        </Text>
        <Text style={[styles.footerMeta, { color: colors.textTertiary }]}>
          OFFICIAL RECORD
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
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    letterSpacing: 0.5,
  },
  institutionName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs + 1,
    letterSpacing: 0.8,
  },
  institutionSub: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 1,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
    letterSpacing: 0.5,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * 1.3,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs + 2,
  },
  numberLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  numberValue: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    letterSpacing: 0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  footerMeta: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    letterSpacing: 1.2,
  },
});

export default StudentCard;
