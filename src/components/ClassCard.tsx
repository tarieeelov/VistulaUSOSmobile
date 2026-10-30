import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MapPin, Clock, User } from 'lucide-react-native';
import { ProcessedClass, resolveL } from '../types/usos';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Shadows,
  Spacing,
  ThemeColors,
  getClassTypeColor,
} from '../constants/theme';
import { StatusBadge } from './StatusBadge';

export interface ClassCardProps {
  item: ProcessedClass;
  colors: ThemeColors;
}

function extractTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(' ');
  const timePart = parts.length > 1 ? parts[1] : parts[0];
  return timePart.slice(0, 5);
}

export const ClassCard: React.FC<ClassCardProps> = ({ item, colors }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isActive = item.status === 'active';
  const isUpcoming = item.status === 'upcoming';
  const isPast = item.status === 'past';

  // Pulse animation for active classes
  useEffect(() => {
    if (isActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.45,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  const startTime = extractTime(item.start_time);
  const endTime = extractTime(item.end_time);
  const timeRange = `${startTime} - ${endTime}`;

  const courseName = resolveL(item.name) || 'Untitled Class';
  const classType = resolveL(item.classtype_name);
  const classColor = getClassTypeColor(classType, colors);

  const building = resolveL(item.building_name);
  const room = item.room_number;
  const locationText = [building, room ? `Room ${room}` : null]
    .filter(Boolean)
    .join(', ');

  const progressPercent = Math.min(
    Math.max(Math.round((item.progress ?? 0) * 100), 0),
    100
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          opacity: isPast ? 0.6 : 1,
        },
        isActive && {
          borderLeftWidth: 4,
          borderLeftColor: colors.accent,
        },
      ]}
    >
      {/* Top Header: Time range + Badges */}
      <View style={styles.topRow}>
        <View style={styles.timeContainer}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {timeRange}
          </Text>
        </View>

        <View style={styles.badgeGroup}>
          {classType ? (
            <StatusBadge label={classType} color={classColor} size="sm" />
          ) : null}

          {isActive && (
            <Animated.View style={{ opacity: pulseAnim }}>
              <StatusBadge
                label="Happening Now"
                color={colors.accent}
                size="sm"
              />
            </Animated.View>
          )}

          {isUpcoming && (
            <StatusBadge
              label={`Starts in ${item.startsInMinutes ?? 0}m`}
              color={colors.warning}
              size="sm"
            />
          )}
        </View>
      </View>

      {/* Course Title */}
      <Text
        style={[styles.courseTitle, { color: colors.text }]}
        numberOfLines={2}
      >
        {courseName}
      </Text>

      {/* Location info */}
      {locationText ? (
        <View style={styles.infoRow}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text
            style={[styles.infoText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {locationText}
          </Text>
        </View>
      ) : null}

      {/* Lecturer info (if available) */}
      {item.lecturer_name ? (
        <View style={styles.infoRow}>
          <User size={14} color={colors.textTertiary} />
          <Text
            style={[styles.infoText, { color: colors.textTertiary }]}
            numberOfLines={1}
          >
            {item.lecturer_name}
          </Text>
        </View>
      ) : null}

      {/* Progress Bar for Active Class */}
      {isActive && (
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.surfaceElevated },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.accent,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  courseTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * 1.3,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  infoText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    flexShrink: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
