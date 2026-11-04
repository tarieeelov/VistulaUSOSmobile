import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import {
  X,
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar,
  ArrowRight,
} from 'lucide-react-native';
import { ProcessedClass, resolveL } from '../types/usos';
import {
  ThemeColors,
  DarkColors,
  getClassTypeColor,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import StatusBadge from './StatusBadge';

export interface ClassDetailModalProps {
  visible: boolean;
  item: ProcessedClass | null;
  colors?: ThemeColors;
  onClose: () => void;
  onViewDay?: (date: Date) => void;
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

function parseDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  try {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  } catch {}
  return new Date();
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  visible,
  item,
  colors = DarkColors,
  onClose,
  onViewDay,
}) => {
  if (!item) return null;

  const courseName = resolveL(item.name) || 'Unknown Course';
  const polishName = item.name?.pl;
  const englishName = item.name?.en;
  const hasBothNames = Boolean(polishName && englishName && polishName !== englishName);

  const classType = resolveL(item.classtype_name) || 'Class';
  const typeColor = getClassTypeColor(classType, colors);

  const startTime = extractTime(item.start_time);
  const endTime = extractTime(item.end_time);

  const durationMin = useMemo(() => {
    try {
      const matchS = item.start_time?.match(/(\d{2}):(\d{2})/);
      const matchE = item.end_time?.match(/(\d{2}):(\d{2})/);
      if (matchS && matchE) {
        const s = Number(matchS[1]) * 60 + Number(matchS[2]);
        const e = Number(matchE[1]) * 60 + Number(matchE[2]);
        const diff = e - s;
        if (diff > 0) return diff;
      }
    } catch {}
    return 90;
  }, [item.start_time, item.end_time]);

  const lecturer = item.lecturer_name?.trim() || null;
  const building = resolveL(item.building_name);
  const room = item.room_number ? `Room ${item.room_number}` : null;
  const location = [room, building].filter(Boolean).join(' · ');

  const handleOpenDay = () => {
    if (onViewDay && item.start_time) {
      onViewDay(parseDate(item.start_time));
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header Bar */}
              <View style={styles.header}>
                <View style={styles.badgeRow}>
                  <StatusBadge label={classType} color={typeColor} />
                  {item.status === 'active' && (
                    <StatusBadge label="Happening Now" color={colors.primary} />
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    { backgroundColor: colors.surfaceHighlight },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Close"
                >
                  <X size={16} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Course Title */}
              <View style={styles.titleSection}>
                <Text style={[styles.courseTitle, { color: colors.text }]}>
                  {courseName}
                </Text>
                {hasBothNames && (
                  <Text style={[styles.subTitle, { color: colors.textTertiary }]}>
                    {englishName === courseName ? polishName : englishName}
                  </Text>
                )}
              </View>

              {/* Details List */}
              <View
                style={[
                  styles.detailsCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                {/* Time row */}
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: colors.surfaceHighlight },
                    ]}
                  >
                    <Clock size={15} color={colors.textSecondary} strokeWidth={1.8} />
                  </View>
                  <View style={styles.detailTextCol}>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {startTime} – {endTime}
                    </Text>
                    <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                      {durationMin} minutes duration
                    </Text>
                  </View>
                </View>

                {/* Location row */}
                {location.length > 0 && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.surfaceHighlight },
                      ]}
                    >
                      <MapPin size={15} color={colors.textSecondary} strokeWidth={1.8} />
                    </View>
                    <View style={styles.detailTextCol}>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {location}
                      </Text>
                      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                        Location & Room
                      </Text>
                    </View>
                  </View>
                )}

                {/* Lecturer row */}
                {lecturer && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.surfaceHighlight },
                      ]}
                    >
                      <User size={15} color={colors.textSecondary} strokeWidth={1.8} />
                    </View>
                    <View style={styles.detailTextCol}>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {lecturer}
                      </Text>
                      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                        Instructor / Lecturer
                      </Text>
                    </View>
                  </View>
                )}

                {/* Course ID row */}
                {item.course_id && (
                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.surfaceHighlight },
                      ]}
                    >
                      <BookOpen size={15} color={colors.textSecondary} strokeWidth={1.8} />
                    </View>
                    <View style={styles.detailTextCol}>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {item.course_id}
                      </Text>
                      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                        Course Code
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                {onViewDay && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtnPrimary,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleOpenDay}
                    activeOpacity={0.8}
                  >
                    <Calendar size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.actionBtnPrimaryText}>View in Day Timeline</Text>
                    <ArrowRight size={14} color="#FFFFFF" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: Spacing.base,
  },
  courseTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    letterSpacing: -0.4,
    lineHeight: FontSizes.lg * 1.3,
  },
  subTitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: 4,
  },
  detailsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailTextCol: {
    flex: 1,
  },
  detailValue: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    letterSpacing: -0.1,
  },
  detailLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    flex: 1,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
  },
});

export default ClassDetailModal;
