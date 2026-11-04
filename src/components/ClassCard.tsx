import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { ProcessedClass, resolveL } from '../types/usos';
import {
  ThemeColors,
  DarkColors,
  getClassTypeColor,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
} from '../constants/theme';
import StatusBadge from './StatusBadge';

export interface ClassCardProps {
  item: ProcessedClass;
  colors?: ThemeColors;
  hideTime?: boolean;
  onPress?: () => void;
}

function parseTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      const [, y, m, d, h, min, s] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0)).getTime();
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.getTime();
  } catch {}
  return 0;
}

/**
 * Extracts a readable time string (HH:MM) from a date/time string.
 */
function extractTime(timeStr: string): string {
  try {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(' ');
    if (parts.length > 1 && parts[1].includes(':')) {
      const timeParts = parts[1].split(':');
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    return timeStr.slice(0, 5);
  } catch {
    return '--:--';
  }
}

/**
 * Convert a hex color string to rgba with a given alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith('#')) return `rgba(107, 138, 255, ${alpha})`;
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) || 0;
  const g = parseInt(cleaned.substring(2, 4), 16) || 0;
  const b = parseInt(cleaned.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * ClassCard — A clean, editorial-style class schedule card.
 *
 * - Active classes: subtle 3px left accent border + small dot indicator
 * - Past classes: subdued opacity (0.5)
 * - Bento box aesthetic: generous padding, clean border, refined typography
 */
export const ClassCard: React.FC<ClassCardProps> = ({
  item,
  colors = DarkColors,
  hideTime = false,
  onPress,
}) => {
  const courseName = resolveL(item.name) || 'Unknown Course';
  const classType = resolveL(item.classtype_name) || 'Class';
  const typeColor = getClassTypeColor(classType, colors);

  const startTime = extractTime(item.start_time);
  const endTime = extractTime(item.end_time);

  const isPast = item.status === 'past';
  const isActive = item.status === 'active';

  const durationMinutes = useMemo(() => {
    const s = parseTimestamp(item.start_time);
    const e = parseTimestamp(item.end_time);
    const diff = Math.round((e - s) / 60000);
    return diff > 0 ? diff : 90;
  }, [item.start_time, item.end_time]);

  // Build location string
  const locationParts: string[] = [];
  if (item.room_number) {
    locationParts.push(`Room ${item.room_number}`);
  }
  if (item.building_name) {
    const buildingName = resolveL(item.building_name);
    if (buildingName) {
      locationParts.push(buildingName);
    }
  }
  const locationString = locationParts.join(' · ');

  // Lecturer name
  const lecturerName = item.lecturer_name?.trim() || null;

  // Progress calculation for active classes
  const progress = useMemo(() => {
    if (!isActive) return 0;
    if (typeof item.progress === 'number') return item.progress;
    try {
      const now = Date.now();
      const start = parseTimestamp(item.start_time);
      const end = parseTimestamp(item.end_time);
      const total = end - start;
      if (total <= 0) return 0;
      const elapsed = now - start;
      return Math.min(Math.max(elapsed / total, 0), 1);
    } catch {
      return 0.5;
    }
  }, [isActive, item.progress, item.start_time, item.end_time]);

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      {...(onPress ? { activeOpacity: 0.85, onPress } : {})}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isActive && {
          borderLeftColor: typeColor,
          borderLeftWidth: 3,
        },
        isPast && { opacity: 0.5 },
      ]}
    >
      {/* Header: Type badge + Time */}
      <View style={styles.header}>
        <StatusBadge label={classType} color={typeColor} />
        {!hideTime ? (
          <View style={styles.timeContainer}>
            <Clock
              size={13}
              color={colors.textTertiary}
              strokeWidth={1.8}
              style={styles.timeIcon}
            />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {startTime} – {endTime}
            </Text>
          </View>
        ) : (
          <View style={[styles.durationBadge, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.durationText, { color: colors.textTertiary }]}>
              {durationMinutes} min
            </Text>
          </View>
        )}
      </View>

      {/* Course name */}
      <Text
        style={[styles.courseName, { color: colors.text }]}
        numberOfLines={2}
      >
        {courseName}
      </Text>

      {/* Lecturer */}
      {lecturerName && (
        <Text
          style={[styles.lecturerName, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {lecturerName}
        </Text>
      )}

      {/* Location */}
      {locationString.length > 0 && (
        <View style={styles.locationRow}>
          <MapPin
            size={13}
            color={colors.textTertiary}
            strokeWidth={1.8}
            style={styles.locationIcon}
          />
          <Text
            style={[styles.locationText, { color: colors.textTertiary }]}
            numberOfLines={1}
          >
            {locationString}
          </Text>
        </View>
      )}

      {/* Active class indicator + progress */}
      {isActive && (
        <View style={styles.activeSection}>
          <View style={styles.activeIndicator}>
            <View style={[styles.activeDot, { backgroundColor: typeColor }]} />
            <Text style={[styles.activeLabel, { color: typeColor }]}>
              Happening Now
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: hexToRgba(typeColor, 0.12) },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: typeColor,
                  width: `${Math.round(progress * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.base + 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: Spacing.xs,
  },
  timeText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    letterSpacing: 0.2,
  },
  durationBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  durationText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.2,
  },
  courseName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.35,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  lecturerName: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.4,
    marginBottom: Spacing.xs + 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    marginRight: Spacing.xs,
  },
  locationText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.4,
    flex: 1,
  },
  activeSection: {
    marginTop: Spacing.md,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs + 2,
  },
  activeLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },
});

export default ClassCard;
