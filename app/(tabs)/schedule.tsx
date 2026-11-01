import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CloudOff,
  Calendar,
  CalendarDays,
  CalendarRange,
} from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import {
  ClassStatus,
  ProcessedClass,
  TimetableEntry,
} from '../../src/types/usos';
import { usosFetch } from '../../src/services/usosApi';
import { getMockTimetable } from '../../src/services/mockData';
import { DaySelector } from '../../src/components/DaySelector';
import { ClassCard } from '../../src/components/ClassCard';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Spacing,
} from '../../src/constants/theme';

const DAY_FULL_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
}

function getMondayDate(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.getFullYear(), date.getMonth(), diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function parseDateTime(dateStr: string): Date {
  if (!dateStr) return new Date();
  try {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      const [, y, m, d, h, min, s] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0));
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  return new Date();
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function processTimetableEntries(entries: TimetableEntry[]): ProcessedClass[] {
  const now = new Date();
  const nowMs = now.getTime();

  // Sort chronologically
  const sorted = [...entries].sort((a, b) => {
    return parseDateTime(a.start_time).getTime() - parseDateTime(b.start_time).getTime();
  });

  let hasFoundFirstFuture = false;

  return sorted.map((entry) => {
    const start = parseDateTime(entry.start_time);
    const end = parseDateTime(entry.end_time);
    const startMs = start.getTime();
    const endMs = end.getTime();

    let status: ClassStatus;
    let progress: number | undefined;
    let startsInMinutes: number | undefined;

    if (nowMs >= endMs) {
      status = 'past';
    } else if (nowMs >= startMs && nowMs < endMs) {
      status = 'active';
      const duration = endMs - startMs;
      progress = duration > 0 ? Math.min(1, Math.max(0, (nowMs - startMs) / duration)) : 1;
    } else {
      if (!hasFoundFirstFuture) {
        status = 'upcoming';
        hasFoundFirstFuture = true;
        startsInMinutes = Math.max(1, Math.round((startMs - nowMs) / 60000));
      } else {
        status = 'future';
      }
    }

    return {
      ...entry,
      status,
      progress,
      startsInMinutes,
    };
  });
}

export default function ScheduleScreen() {
  const { isDemo } = useAuth();
  const { colors } = useTheme();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [timetable, setTimetable] = useState<ProcessedClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);

  const currentWeekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);

  const loadTimetable = useCallback(
    async (weekStart: string, isRefresh = false) => {
      try {
        if (!isRefresh) {
          setLoading(true);
        }

        let rawEntries: TimetableEntry[] = [];

        if (isDemo) {
          rawEntries = getMockTimetable(weekStart);
          setFromCache(false);
          const now = new Date();
          setLastUpdated(
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
        } else {
          const response: any = await usosFetch<TimetableEntry[]>(
            'services/tt/student',
            {
              start: weekStart,
              days: '7',
              fields:
                'start_time|end_time|name|building_name|room_number|course_id|classtype_name',
            }
          );

          if (response && response.data !== undefined) {
            rawEntries = Array.isArray(response.data) ? response.data : [];
            setFromCache(Boolean(response.fromCache));
            if (response.cachedAt) {
              const d = new Date(response.cachedAt);
              setLastUpdated(
                d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              );
            } else {
              const now = new Date();
              setLastUpdated(
                now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              );
            }
          } else if (Array.isArray(response)) {
            rawEntries = response;
            setFromCache(false);
            const now = new Date();
            setLastUpdated(
              now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );
          }
        }

        const processed = processTimetableEntries(rawEntries);
        setTimetable(processed);
      } catch (error) {
        console.warn('[Schedule] Failed to load timetable:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isDemo]
  );

  // Fetch timetable on mount and when week changes
  useEffect(() => {
    loadTimetable(currentWeekStart);
  }, [currentWeekStart, loadTimetable]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTimetable(currentWeekStart, true);
  }, [currentWeekStart, loadTimetable]);

  const handleWeekChange = useCallback((direction: -1 | 1) => {
    setSelectedDate((prevDate) => {
      const nextDate = new Date(prevDate);
      nextDate.setDate(prevDate.getDate() + direction * 7);
      return nextDate;
    });
  }, []);

  // Filter classes for the currently selected day
  const filteredClasses = useMemo(() => {
    return timetable.filter((item) => {
      const classDate = parseDateTime(item.start_time);
      return isSameDay(classDate, selectedDate);
    });
  }, [timetable, selectedDate]);

  // Group classes by all 7 days of the selected week for Week View
  const weekDaysData = useMemo(() => {
    const monday = getMondayDate(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const classesForDay = timetable.filter((item) => {
        const classDate = parseDateTime(item.start_time);
        return isSameDay(classDate, d);
      });
      return {
        date: d,
        dayName: DAY_FULL_NAMES[i],
        formattedDate: `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`,
        isToday: isSameDay(d, new Date()),
        classes: classesForDay,
      };
    });
  }, [selectedDate, timetable]);

  const totalWeeklyClasses = useMemo(() => timetable.length, [timetable]);

  const subtitleText = useMemo(() => {
    if (viewMode === 'week') {
      return `${totalWeeklyClasses} ${totalWeeklyClasses === 1 ? 'class' : 'classes'} scheduled`;
    }
    if (fromCache && lastUpdated) {
      return `Offline • ${lastUpdated}`;
    }
    if (lastUpdated) {
      return `Updated ${lastUpdated}`;
    }
    if (isDemo) {
      return 'Demo Schedule';
    }
    return '';
  }, [viewMode, totalWeeklyClasses, fromCache, lastUpdated, isDemo]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Top Editorial Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.titleColumn}>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Schedule</Text>
            {subtitleText ? (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitleText}
              </Text>
            ) : null}
          </View>

          <View style={styles.headerControls}>
            {fromCache && (
              <View
                style={[
                  styles.offlineBadge,
                  { backgroundColor: colors.warningMuted, borderColor: colors.border },
                ]}
              >
                <CloudOff size={11} color={colors.warning} />
                <Text style={[styles.offlineText, { color: colors.warning }]}>Offline</Text>
              </View>
            )}

            {/* View Mode Segment Control */}
            <View
              style={[
                styles.viewModeToggle,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  viewMode === 'day' && [
                    styles.toggleBtnActive,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => setViewMode('day')}
                activeOpacity={0.8}
                accessibilityLabel="Day view"
              >
                <CalendarDays
                  size={13}
                  color={viewMode === 'day' ? '#FFFFFF' : colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: viewMode === 'day' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  Day
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  viewMode === 'week' && [
                    styles.toggleBtnActive,
                    { backgroundColor: colors.primary },
                  ],
                ]}
                onPress={() => setViewMode('week')}
                activeOpacity={0.8}
                accessibilityLabel="Week view"
              >
                <CalendarRange
                  size={13}
                  color={viewMode === 'week' ? '#FFFFFF' : colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: viewMode === 'week' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  Week
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Day Selector (Week Navigator) */}
      <DaySelector
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          if (viewMode === 'week') {
            setViewMode('day');
          }
        }}
        onWeekChange={handleWeekChange}
      />

      {/* Main List Content */}
      {loading && timetable.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading timetable...
          </Text>
        </View>
      ) : viewMode === 'day' ? (
        /* DAY VIEW */
        <FlatList
          data={filteredClasses}
          keyExtractor={(item, index) =>
            `${item.course_id || 'course'}-${item.start_time}-${index}`
          }
          renderItem={({ item }) => <ClassCard item={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconBadge,
                  { backgroundColor: colors.surfaceHighlight },
                ]}
              >
                <Calendar size={22} color={colors.textTertiary} strokeWidth={1.7} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No scheduled classes
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                No lectures or laboratory sessions registered for this date.
              </Text>
            </View>
          }
        />
      ) : (
        /* WEEK VIEW (All 7 Days on One Screen) */
        <ScrollView
          contentContainerStyle={styles.weekListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {timetable.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconBadge,
                  { backgroundColor: colors.surfaceHighlight },
                ]}
              >
                <Calendar size={22} color={colors.textTertiary} strokeWidth={1.7} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No classes this week
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                No lectures or labs are scheduled for this calendar week.
              </Text>
            </View>
          ) : (
            weekDaysData.map((day) => (
              <View key={day.date.toISOString()} style={styles.weekDaySection}>
                {/* Day Header Banner */}
                <View
                  style={[
                    styles.weekDayHeader,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: day.isToday ? colors.primary : colors.border,
                    },
                    day.isToday && {
                      borderLeftWidth: 3,
                      borderLeftColor: colors.primary,
                    },
                  ]}
                >
                  <View style={styles.weekDayHeaderLeft}>
                    <Text
                      style={[
                        styles.weekDayName,
                        { color: day.isToday ? colors.primary : colors.text },
                      ]}
                    >
                      {day.dayName}
                    </Text>
                    <Text
                      style={[
                        styles.weekDayDate,
                        { color: colors.textTertiary },
                      ]}
                    >
                      {day.formattedDate}
                    </Text>

                    {day.isToday && (
                      <View
                        style={[
                          styles.todayTag,
                          {
                            backgroundColor: colors.primaryMuted,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.todayTagText,
                            { color: colors.primary },
                          ]}
                        >
                          Today
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.dayBadgeButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedDate(day.date);
                      setViewMode('day');
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel={`View ${day.dayName} only`}
                  >
                    <Text
                      style={[
                        styles.dayBadgeText,
                        {
                          color:
                            day.classes.length > 0
                              ? colors.text
                              : colors.textTertiary,
                        },
                      ]}
                    >
                      {day.classes.length > 0
                        ? `${day.classes.length} ${day.classes.length === 1 ? 'class' : 'classes'}`
                        : 'Free'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Day's Classes */}
                {day.classes.length > 0 ? (
                  <View style={styles.weekDayClassesList}>
                    {day.classes.map((cls, idx) => (
                      <ClassCard
                        key={`${cls.course_id || 'course'}-${cls.start_time}-${idx}`}
                        item={cls}
                        colors={colors}
                      />
                    ))}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.freeDayRow,
                      {
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.freeDayText,
                        { color: colors.textTertiary },
                      ]}
                    >
                      No classes scheduled
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
  },
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxl,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    letterSpacing: 0.1,
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  offlineText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  viewModeToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  toggleBtnActive: {},
  toggleBtnText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.1,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  weekListContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  weekDaySection: {
    marginBottom: Spacing.base,
  },
  weekDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  weekDayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  weekDayName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    letterSpacing: -0.2,
  },
  weekDayDate: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
  todayTag: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  todayTagText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dayBadgeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  dayBadgeText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  weekDayClassesList: {
    gap: Spacing.xs,
  },
  freeDayRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  freeDayText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
  },
  emptyCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  emptyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
    letterSpacing: -0.2,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.4,
    maxWidth: 260,
  },
});
