import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarCheck2, CloudOff, Sparkles } from 'lucide-react-native';
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
  Shadows,
  Spacing,
} from '../../src/constants/theme';

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

function parseDateTime(dateStr: string): Date {
  if (!dateStr) return new Date();
  const formatted = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  return new Date(formatted);
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

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
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

  const subtitleText = useMemo(() => {
    if (fromCache && lastUpdated) {
      return `Offline data • ${lastUpdated}`;
    }
    if (lastUpdated) {
      return `Updated at ${lastUpdated}`;
    }
    if (isDemo) {
      return 'Demo Schedule';
    }
    return '';
  }, [fromCache, lastUpdated, isDemo]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Schedule</Text>
          {fromCache && (
            <View
              style={[
                styles.offlineBadge,
                { backgroundColor: colors.warningMuted, borderColor: colors.warning },
              ]}
            >
              <CloudOff size={12} color={colors.warning} />
              <Text style={[styles.offlineText, { color: colors.warning }]}>Offline</Text>
            </View>
          )}
        </View>

        {subtitleText ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitleText}
          </Text>
        ) : null}
      </View>

      {/* Day Selector */}
      <DaySelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onWeekChange={handleWeekChange}
      />

      {/* Main List */}
      {loading && timetable.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading timetable...
          </Text>
        </View>
      ) : (
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
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconBadge,
                  { backgroundColor: colors.accentMuted },
                ]}
              >
                <Sparkles size={32} color={colors.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No classes today 🎉
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Enjoy your free time, review coursework, or relax!
              </Text>
            </View>
          }
        />
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
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxl,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  offlineText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
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
    ...Shadows.sm,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
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
