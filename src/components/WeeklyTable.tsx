import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Clock, Calendar, Check } from 'lucide-react-native';
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

export interface WeeklyTableProps {
  timetable: ProcessedClass[];
  selectedDate: Date;
  colors?: ThemeColors;
  onSelectDay: (date: Date) => void;
  onSelectClass: (item: ProcessedClass) => void;
}

const DAY_SHORT_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getMondayDate(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.getFullYear(), date.getMonth(), diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function parseDateTime(dateStr?: string): Date {
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

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

interface TableSlot {
  id: string;
  startMinutesMin: number;
  startMinutesMax: number;
  endMinutesMax: number;
  displayStart: string;
  displayEnd: string;
  classesByDay: { [dayIndex: number]: ProcessedClass };
}

export const WeeklyTable: React.FC<WeeklyTableProps> = ({
  timetable,
  selectedDate,
  colors = DarkColors,
  onSelectDay,
  onSelectClass,
}) => {
  const monday = useMemo(() => getMondayDate(selectedDate), [selectedDate]);
  const today = useMemo(() => new Date(), []);

  // Compute days of this week (0=Mon, ..., 6=Sun)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d,
        dayIndex: i,
        dayName: DAY_SHORT_NAMES[i],
        dayNumber: d.getDate(),
        isToday: isSameDay(d, today),
        isSelected: isSameDay(d, selectedDate),
      };
    });
  }, [monday, today, selectedDate]);

  // Check if weekend has classes
  const weekendHasClasses = useMemo(() => {
    return timetable.some((item) => {
      const d = parseDateTime(item.start_time);
      const day = d.getDay(); // 0 is Sun, 6 is Sat
      return day === 0 || day === 6;
    });
  }, [timetable]);

  // Allow user to toggle between 5 days (Mon-Fri) and 7 days
  const [showFullWeek, setShowFullWeek] = useState<boolean>(weekendHasClasses);

  const displayedDays = useMemo(() => {
    return showFullWeek ? weekDays : weekDays.slice(0, 5);
  }, [showFullWeek, weekDays]);

  // Cluster classes into time slots for the rows
  const tableSlots: TableSlot[] = useMemo(() => {
    if (!timetable || timetable.length === 0) return [];

    // Extract start/end minutes and dayIndex for each class
    const prepared = timetable.map((item) => {
      const d = parseDateTime(item.start_time);
      const dayRaw = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const dayIndex = dayRaw === 0 ? 6 : dayRaw - 1; // 0=Mon, ..., 6=Sun

      const startParts = extractTime(item.start_time).split(':').map(Number);
      const endParts = extractTime(item.end_time).split(':').map(Number);
      const startMin = (startParts[0] || 0) * 60 + (startParts[1] || 0);
      const endMin = (endParts[0] || 0) * 60 + (endParts[1] || 0);

      return {
        item,
        dayIndex,
        startMin,
        endMin,
      };
    });

    // Sort chronologically by startMin
    prepared.sort((a, b) => a.startMin - b.startMin);

    const slots: TableSlot[] = [];

    // Cluster classes into slots
    for (const p of prepared) {
      // Find an existing slot where:
      // 1. This day is not yet occupied
      // 2. Start time is within ~75 minutes of the slot start
      let foundSlot = slots.find((s) => {
        const notOccupied = !s.classesByDay[p.dayIndex];
        const closeInTime = Math.abs(p.startMin - s.startMinutesMin) <= 75;
        return notOccupied && closeInTime;
      });

      if (foundSlot) {
        foundSlot.classesByDay[p.dayIndex] = p.item;
        foundSlot.startMinutesMin = Math.min(foundSlot.startMinutesMin, p.startMin);
        foundSlot.startMinutesMax = Math.max(foundSlot.startMinutesMax, p.startMin);
        foundSlot.endMinutesMax = Math.max(foundSlot.endMinutesMax, p.endMin);
      } else {
        const newSlot: TableSlot = {
          id: `slot-${slots.length}-${p.startMin}`,
          startMinutesMin: p.startMin,
          startMinutesMax: p.startMin,
          endMinutesMax: p.endMin,
          displayStart: '',
          displayEnd: '',
          classesByDay: { [p.dayIndex]: p.item },
        };
        slots.push(newSlot);
      }
    }

    // Sort slots by start time
    slots.sort((a, b) => a.startMinutesMin - b.startMinutesMin);

    // Format display start & end times
    return slots.map((s) => {
      const sh = Math.floor(s.startMinutesMin / 60);
      const sm = s.startMinutesMin % 60;
      const eh = Math.floor(s.endMinutesMax / 60);
      const em = s.endMinutesMax % 60;
      const displayStart = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      const displayEnd = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

      return {
        ...s,
        displayStart,
        displayEnd,
      };
    });
  }, [timetable]);

  if (timetable.length === 0) {
    return (
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
    );
  }

  return (
    <View style={styles.container}>
      {/* Table Subheader: Controls (5 Days / 7 Days toggle) */}
      <View style={styles.topControlRow}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.classLecture }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>Lecture</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.classLab }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>Lab</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.classExercise }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>Exercises</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.dayCountToggle,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowFullWeek(!showFullWeek)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dayCountText, { color: colors.textSecondary }]}>
            {showFullWeek ? '7 Days' : '5 Days (Mon–Fri)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Table Grid */}
      <View
        style={[
          styles.tableCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Table Header Row: Days of the week */}
        <View
          style={[
            styles.tableHeaderRow,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surfaceElevated,
            },
          ]}
        >
          {/* Time Column Header */}
          <View style={styles.timeHeaderCell}>
            <Clock size={11} color={colors.textTertiary} strokeWidth={1.8} />
            <Text style={[styles.timeHeaderText, { color: colors.textTertiary }]}>
              TIME
            </Text>
          </View>

          {/* Day Column Headers */}
          {displayedDays.map((day) => (
            <TouchableOpacity
              key={day.dayName}
              style={[
                styles.dayHeaderCell,
                day.isToday && [
                  styles.dayHeaderCellToday,
                  { backgroundColor: colors.primaryMuted },
                ],
              ]}
              onPress={() => onSelectDay(day.date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayHeaderName,
                  {
                    color: day.isToday ? colors.primary : colors.textSecondary,
                    fontFamily: day.isToday ? Fonts.bold : Fonts.semiBold,
                  },
                ]}
              >
                {day.dayName}
              </Text>
              <View
                style={[
                  styles.dayNumberPill,
                  day.isToday && [
                    styles.dayNumberPillToday,
                    { backgroundColor: colors.primary },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.dayHeaderNumber,
                    {
                      color: day.isToday ? '#FFFFFF' : colors.textTertiary,
                    },
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Table Body: Time Slot Rows */}
        {tableSlots.map((slot, rowIndex) => {
          const isLastRow = rowIndex === tableSlots.length - 1;

          return (
            <View
              key={slot.id}
              style={[
                styles.tableRow,
                !isLastRow && {
                  borderBottomColor: colors.borderLight,
                  borderBottomWidth: 1,
                },
              ]}
            >
              {/* Time Column for this row */}
              <View
                style={[
                  styles.timeCell,
                  {
                    borderRightColor: colors.borderLight,
                  },
                ]}
              >
                <Text style={[styles.timeCellStart, { color: colors.text }]}>
                  {slot.displayStart}
                </Text>
                <Text style={[styles.timeCellEnd, { color: colors.textTertiary }]}>
                  {slot.displayEnd}
                </Text>
              </View>

              {/* Day Cells for this row */}
              {displayedDays.map((day) => {
                const classItem = slot.classesByDay[day.dayIndex];

                if (!classItem) {
                  return (
                    <View
                      key={day.dayName}
                      style={[
                        styles.dayCellEmpty,
                        day.isToday && {
                          backgroundColor: colors.primaryMuted ? `${colors.primaryMuted}` : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[styles.emptyCellDash, { color: colors.border }]}>
                        ·
                      </Text>
                    </View>
                  );
                }

                const courseName = resolveL(classItem.name) || 'Class';
                const classType = resolveL(classItem.classtype_name) || '';
                const typeColor = getClassTypeColor(classType, colors);
                const classStart = extractTime(classItem.start_time);
                const classEnd = extractTime(classItem.end_time);
                const isActive = classItem.status === 'active';

                return (
                  <TouchableOpacity
                    key={day.dayName}
                    style={[
                      styles.dayCellFilled,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderLeftColor: typeColor,
                        borderColor: isActive ? colors.primary : colors.borderLight,
                      },
                      isActive && styles.dayCellActive,
                    ]}
                    onPress={() => onSelectClass(classItem)}
                    activeOpacity={0.7}
                  >
                    {/* Exact Time */}
                    <Text
                      style={[styles.cellTime, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {classStart}
                    </Text>

                    {/* Course Title */}
                    <Text
                      style={[
                        styles.cellTitle,
                        { color: colors.text },
                      ]}
                      numberOfLines={2}
                    >
                      {courseName}
                    </Text>

                    {/* Room Badge */}
                    {classItem.room_number ? (
                      <View style={styles.cellRoomRow}>
                        <Text
                          style={[
                            styles.cellRoomText,
                            { color: colors.textTertiary },
                          ]}
                          numberOfLines={1}
                        >
                          s. {classItem.room_number}
                        </Text>
                      </View>
                    ) : null}

                    {/* Active Pulse Dot */}
                    {isActive && (
                      <View
                        style={[
                          styles.activeDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  dayCountToggle: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  dayCountText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  tableCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    height: 44,
  },
  timeHeaderCell: {
    width: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.04)',
  },
  timeHeaderText: {
    fontFamily: Fonts.bold,
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.03)',
  },
  dayHeaderCellToday: {
    borderRadius: 2,
  },
  dayHeaderName: {
    fontSize: 9.5,
    letterSpacing: 0.2,
  },
  dayNumberPill: {
    marginTop: 1,
    paddingHorizontal: 4,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },
  dayNumberPillToday: {
    paddingVertical: 0.5,
  },
  dayHeaderNumber: {
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 74,
  },
  timeCell: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    paddingHorizontal: 1,
  },
  timeCellStart: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    letterSpacing: -0.2,
  },
  timeCellEnd: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    marginTop: 1,
  },
  dayCellEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.02)',
  },
  emptyCellDash: {
    fontSize: 14,
    opacity: 0.4,
  },
  dayCellFilled: {
    flex: 1,
    borderLeftWidth: 2.5,
    borderWidth: 0.5,
    margin: 1.5,
    borderRadius: 4,
    padding: 3,
    justifyContent: 'space-between',
    position: 'relative',
  },
  dayCellActive: {
    borderWidth: 1,
  },
  cellTime: {
    fontFamily: Fonts.bold,
    fontSize: 8.5,
    letterSpacing: -0.2,
  },
  cellTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: -0.1,
    marginVertical: 1,
  },
  cellRoomRow: {
    alignItems: 'flex-start',
  },
  cellRoomText: {
    fontFamily: Fonts.medium,
    fontSize: 8.5,
  },
  activeDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.lg,
  },
  emptyIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.base,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    textAlign: 'center',
    lineHeight: FontSizes.xs * 1.5,
  },
});

export default WeeklyTable;
