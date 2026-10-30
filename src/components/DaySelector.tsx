import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius, FontSizes, Fonts, Spacing } from '../constants/theme';

export interface DaySelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onWeekChange: (direction: -1 | 1) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.getFullYear(), date.getMonth(), diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDate,
  onSelectDate,
  onWeekChange,
}) => {
  const { colors } = useTheme();
  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(() => {
    const monday = getMonday(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const monthLabel = useMemo(() => {
    const monday = weekDays[0];
    const sunday = weekDays[6];
    if (monday.getMonth() === sunday.getMonth()) {
      return `${MONTH_NAMES[monday.getMonth()]} ${monday.getFullYear()}`;
    }
    return `${MONTH_NAMES[monday.getMonth()].slice(0, 3)} - ${MONTH_NAMES[sunday.getMonth()].slice(0, 3)} ${sunday.getFullYear()}`;
  }, [weekDays]);

  const handleTodayPress = () => {
    onSelectDate(new Date());
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <Text style={[styles.monthText, { color: colors.text }]}>
          {monthLabel}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => onWeekChange(-1)}
            activeOpacity={0.7}
            accessibilityLabel="Previous week"
          >
            <ChevronLeft size={18} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.todayButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={handleTodayPress}
            activeOpacity={0.7}
            accessibilityLabel="Jump to today"
          >
            <Text style={[styles.todayText, { color: colors.primary }]}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => onWeekChange(1)}
            activeOpacity={0.7}
            accessibilityLabel="Next week"
          >
            <ChevronRight size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Day Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {weekDays.map((date, index) => {
          const selected = isSameDay(date, selectedDate);
          const isCurrentDay = isSameDay(date, today);
          const dayName = DAY_NAMES[index];
          const dayNumber = date.getDate();

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelectDate(date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: selected
                      ? 'rgba(255,255,255,0.8)'
                      : colors.textSecondary,
                  },
                ]}
              >
                {dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: selected ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {dayNumber}
              </Text>

              {/* Today indicator dot */}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isCurrentDay
                      ? selected
                        ? '#FFFFFF'
                        : colors.accent
                      : 'transparent',
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  monthText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    paddingHorizontal: Spacing.md,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    width: 48,
    height: 68,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  dayName: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});
