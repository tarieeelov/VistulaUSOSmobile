import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProcessedClass } from '../types/usos';
import {
  ThemeColors,
  DarkColors,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
} from '../constants/theme';
import { ClassCard } from './ClassCard';

export interface TimelineItemProps {
  item: ProcessedClass;
  colors?: ThemeColors;
  isFirst?: boolean;
  isLast?: boolean;
  showCurrentTimeAbove?: boolean;
  currentTimeStr?: string;
  onPress?: () => void;
}

function extractTime(timeStr?: string): string {
  if (!timeStr) return '--:--';
  try {
    const parts = timeStr.split(' ');
    if (parts.length > 1 && parts[1].includes(':')) {
      const tp = parts[1].split(':');
      return `${tp[0]}:${tp[1]}`;
    }
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : timeStr.slice(0, 5);
  } catch {
    return '--:--';
  }
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  colors = DarkColors,
  isFirst = false,
  isLast = false,
  showCurrentTimeAbove = false,
  currentTimeStr = '',
  onPress,
}) => {
  const startTime = extractTime(item.start_time);
  const endTime = extractTime(item.end_time);

  const durationText = useMemo(() => {
    try {
      const matchS = item.start_time?.match(/(\d{2}):(\d{2})/);
      const matchE = item.end_time?.match(/(\d{2}):(\d{2})/);
      if (matchS && matchE) {
        const s = Number(matchS[1]) * 60 + Number(matchS[2]);
        const e = Number(matchE[1]) * 60 + Number(matchE[2]);
        const diff = e - s;
        if (diff > 0) return `${diff}m`;
      }
    } catch {}
    return '90m';
  }, [item.start_time, item.end_time]);

  const isActive = item.status === 'active';
  const isPast = item.status === 'past';
  const isUpcoming = item.status === 'upcoming';

  return (
    <View style={styles.container}>
      {/* Current Time Indicator if happening right before this class */}
      {showCurrentTimeAbove && (
        <View style={styles.currentTimeRow}>
          <View style={styles.currentTimeTimeCol}>
            <Text style={[styles.currentTimeText, { color: colors.danger || '#FF6B6B' }]}>
              {currentTimeStr}
            </Text>
          </View>
          <View style={styles.currentTimeTrackCol}>
            <View
              style={[
                styles.currentTimeDot,
                { backgroundColor: colors.danger || '#FF6B6B' },
              ]}
            />
          </View>
          <View
            style={[
              styles.currentTimeLine,
              { backgroundColor: colors.danger || '#FF6B6B' },
            ]}
          />
        </View>
      )}

      {/* Main Timeline Row */}
      <View style={styles.mainRow}>
        {/* Left: Time column */}
        <View style={styles.timeCol}>
          <Text style={[styles.startTimeText, { color: colors.text }]}>
            {startTime}
          </Text>
          <Text style={[styles.endTimeText, { color: colors.textTertiary }]}>
            {endTime}
          </Text>
          <View
            style={[
              styles.durationBadge,
              { backgroundColor: colors.surfaceHighlight },
            ]}
          >
            <Text style={[styles.durationText, { color: colors.textTertiary }]}>
              {durationText}
            </Text>
          </View>
        </View>

        {/* Center: Rail track with connecting line & dot */}
        <View style={styles.railCol}>
          {/* Upper connecting line */}
          <View
            style={[
              styles.lineUpper,
              {
                backgroundColor: isFirst ? 'transparent' : colors.borderLight,
              },
            ]}
          />

          {/* Node Dot */}
          <View
            style={[
              styles.nodeBase,
              isActive && [
                styles.nodeActive,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primaryMuted,
                },
              ],
              isUpcoming && [
                styles.nodeUpcoming,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.surface,
                },
              ],
              isPast && [
                styles.nodePast,
                {
                  backgroundColor: colors.textTertiary,
                },
              ],
              !isActive && !isUpcoming && !isPast && [
                styles.nodeFuture,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ],
            ]}
          >
            {isActive && (
              <View
                style={[
                  styles.nodeActiveInner,
                  { backgroundColor: '#FFFFFF' },
                ]}
              />
            )}
          </View>

          {/* Lower connecting line */}
          <View
            style={[
              styles.lineLower,
              {
                backgroundColor: isLast ? 'transparent' : colors.borderLight,
              },
            ]}
          />
        </View>

        {/* Right: Class Card */}
        <View style={styles.cardCol}>
          <ClassCard
            item={item}
            colors={colors}
            hideTime={true}
            onPress={onPress}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 110,
  },
  timeCol: {
    width: 52,
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingRight: Spacing.sm,
  },
  startTimeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    letterSpacing: -0.3,
  },
  endTimeText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
  durationBadge: {
    marginTop: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    letterSpacing: 0.2,
  },
  railCol: {
    width: 22,
    alignItems: 'center',
    position: 'relative',
  },
  lineUpper: {
    position: 'absolute',
    top: 0,
    bottom: '50%',
    width: 2,
  },
  lineLower: {
    position: 'absolute',
    top: 24,
    bottom: 0,
    width: 2,
  },
  nodeBase: {
    marginTop: 14,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
  },
  nodeActiveInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  nodeUpcoming: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
  },
  nodePast: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeFuture: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
  cardCol: {
    flex: 1,
    paddingBottom: Spacing.xs,
  },
  currentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginVertical: 4,
  },
  currentTimeTimeCol: {
    width: 52,
    alignItems: 'flex-end',
    paddingRight: Spacing.sm,
  },
  currentTimeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  currentTimeTrackCol: {
    width: 22,
    alignItems: 'center',
  },
  currentTimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  currentTimeLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.8,
  },
});

export default TimelineItem;
