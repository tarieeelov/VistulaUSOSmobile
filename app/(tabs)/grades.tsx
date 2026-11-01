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
import { Award, BookCheck } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import {
  CourseEdition,
  GradeEntry,
  TermGrades,
  resolveL,
} from '../../src/types/usos';
import { usosFetch } from '../../src/services/usosApi';
import { MOCK_GRADES, MOCK_COURSE_EDITIONS } from '../../src/services/mockData';
import { SemesterPicker } from '../../src/components/SemesterPicker';
import { GradeRow } from '../../src/components/GradeRow';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Spacing,
  getGradeColor,
} from '../../src/constants/theme';

interface FlattenedGradeItem {
  id: string;
  courseName: string;
  grade: string | null;
  session: number;
}

export default function GradesScreen() {
  const { isDemo } = useAuth();
  const { colors } = useTheme();

  const [grades, setGrades] = useState<TermGrades[]>([]);
  const [courses, setCourses] = useState<CourseEdition[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) {
          setLoading(true);
        }

        if (isDemo) {
          setGrades(MOCK_GRADES);
          setCourses(MOCK_COURSE_EDITIONS);
          if (MOCK_GRADES.length > 0 && !selectedTerm) {
            setSelectedTerm(MOCK_GRADES[0].term_id);
          }
        } else {
          // Fetch real data from USOS
          const [gradesRes, coursesRes]: [any, any] = await Promise.all([
            usosFetch('services/grades/terms2'),
            usosFetch('services/courses/user'),
          ]);

          const rawGrades = gradesRes?.data !== undefined ? gradesRes.data : gradesRes;
          const rawCourses = coursesRes?.data !== undefined ? coursesRes.data : coursesRes;

          let normalizedGrades: TermGrades[] = [];
          if (Array.isArray(rawGrades)) {
            normalizedGrades = rawGrades;
          } else if (rawGrades && typeof rawGrades === 'object') {
            normalizedGrades = Object.entries(rawGrades).map(
              ([term_id, value]: [string, any]) => ({
                term_id,
                courses: Array.isArray(value?.courses) ? value.courses : [],
              })
            );
          }

          let normalizedCourses: CourseEdition[] = [];
          if (Array.isArray(rawCourses)) {
            normalizedCourses = rawCourses;
          } else if (rawCourses && typeof rawCourses === 'object') {
            normalizedCourses = Object.values(rawCourses);
          }

          setGrades(normalizedGrades);
          setCourses(normalizedCourses);

          if (normalizedGrades.length > 0 && !selectedTerm) {
            setSelectedTerm(normalizedGrades[0].term_id);
          }
        }
      } catch (error) {
        console.warn('[Grades] Error loading grades:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isDemo, selectedTerm]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  // Extract all distinct terms and sort descending
  const availableTerms = useMemo(() => {
    const termSet = new Set<string>();
    grades.forEach((g) => {
      if (g.term_id) termSet.add(g.term_id);
    });
    courses.forEach((c) => {
      if (c.term_id) termSet.add(c.term_id);
    });
    return Array.from(termSet).sort((a, b) => b.localeCompare(a));
  }, [grades, courses]);

  // Ensure an active selected term
  useEffect(() => {
    if (availableTerms.length > 0 && (!selectedTerm || !availableTerms.includes(selectedTerm))) {
      setSelectedTerm(availableTerms[0]);
    }
  }, [availableTerms, selectedTerm]);

  // Current term grades data
  const currentTermData = useMemo(() => {
    return grades.find((g) => g.term_id === selectedTerm);
  }, [grades, selectedTerm]);

  // Statistics calculation for the selected term
  const { gpa, passedRatio, totalCount, gpaColor } = useMemo(() => {
    if (!currentTermData || !currentTermData.courses.length) {
      return {
        gpa: null,
        passedRatio: '0 / 0',
        totalCount: 0,
        gpaColor: colors.gradeNone,
      };
    }

    const numericGrades: number[] = [];
    let passed = 0;
    const total = currentTermData.courses.length;

    currentTermData.courses.forEach((item) => {
      let isPassed = false;
      const gradesList: GradeEntry[] = Array.isArray(item.grades)
        ? item.grades
        : Object.values(item.grades || {});

      gradesList.forEach((g) => {
        if (g && g.value_symbol) {
          const num = parseFloat(g.value_symbol);
          if (!isNaN(num)) {
            if (g.counts_into_average !== false) {
              numericGrades.push(num);
            }
            if (num >= 3.0) {
              isPassed = true;
            }
          } else if (g.value_symbol.toLowerCase().includes('zal')) {
            isPassed = true;
          }
        }
      });

      if (isPassed) {
        passed++;
      }
    });

    const average =
      numericGrades.length > 0
        ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2)
        : null;

    return {
      gpa: average,
      passedRatio: `${passed} / ${total}`,
      totalCount: total,
      gpaColor: getGradeColor(average, colors),
    };
  }, [currentTermData, colors]);

  // Flatten courses into GradeRow items
  const flattenedRows: FlattenedGradeItem[] = useMemo(() => {
    if (!currentTermData) return [];

    const rows: FlattenedGradeItem[] = [];
    currentTermData.courses.forEach((item, courseIdx) => {
      const courseName = resolveL(item.course?.course_name) || 'Unknown Course';
      const gradesList: GradeEntry[] = Array.isArray(item.grades)
        ? item.grades
        : Object.values(item.grades || {});

      if (gradesList.length > 0) {
        gradesList.forEach((gradeEntry, gradeIdx) => {
          rows.push({
            id: `${item.course?.course_id || courseIdx}-${gradeEntry?.exam_session_number || gradeIdx}-${gradeIdx}`,
            courseName,
            grade: gradeEntry?.value_symbol ?? null,
            session: gradeEntry?.exam_session_number || 1,
          });
        });
      } else {
        rows.push({
          id: `${item.course?.course_id || courseIdx}-empty`,
          courseName,
          grade: null,
          session: 1,
        });
      }
    });

    return rows;
  }, [currentTermData]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Top Editorial Header */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Grades</Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
          Academic evaluation & performance
        </Text>
      </View>

      {/* Semester Picker */}
      {availableTerms.length > 0 ? (
        <SemesterPicker
          semesters={availableTerms}
          selected={selectedTerm}
          onSelect={setSelectedTerm}
          style={styles.picker}
        />
      ) : null}

      {loading && grades.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading grades...
          </Text>
        </View>
      ) : (
        <FlatList
          data={flattenedRows}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GradeRow
              courseName={item.courseName}
              grade={item.grade}
              session={item.session}
              colors={colors}
            />
          )}
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
          ListHeaderComponent={
            /* Bento Summary Card */
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Left Column: GPA */}
              <View style={styles.gpaSection}>
                <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>
                  SEMESTER GPA
                </Text>
                <Text style={[styles.gpaNumber, { color: gpaColor }]}>
                  {gpa ?? '—'}
                </Text>
                <View style={styles.gpaBadgeRow}>
                  <Text style={[styles.standingText, { color: gpaColor }]}>
                    {gpa && parseFloat(gpa) >= 4.5
                      ? 'Excellent'
                      : gpa && parseFloat(gpa) >= 3.5
                      ? 'Good Standing'
                      : gpa
                      ? 'Passing'
                      : 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Vertical Divider */}
              <View
                style={[styles.divider, { backgroundColor: colors.borderLight }]}
              />

              {/* Right Column: Statistics */}
              <View style={styles.statsSection}>
                <View style={styles.statRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.surfaceHighlight },
                    ]}
                  >
                    <BookCheck size={15} color={colors.textSecondary} strokeWidth={1.8} />
                  </View>
                  <View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {passedRatio}
                    </Text>
                    <Text
                      style={[styles.statCaption, { color: colors.textTertiary }]}
                    >
                      Passed Courses
                    </Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.surfaceHighlight },
                    ]}
                  >
                    <Award size={15} color={colors.textSecondary} strokeWidth={1.8} />
                  </View>
                  <View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {totalCount} Total
                    </Text>
                    <Text
                      style={[styles.statCaption, { color: colors.textTertiary }]}
                    >
                      Enrolled Courses
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
                <Award size={22} color={colors.textTertiary} strokeWidth={1.7} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No academic records
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textTertiary }]}
              >
                No registered grades found for the selected semester.
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
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxl,
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    letterSpacing: 0.1,
    marginTop: 2,
  },
  picker: {
    marginVertical: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  gpaSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  gpaNumber: {
    fontFamily: Fonts.bold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1,
  },
  gpaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  standingText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.base,
  },
  statsSection: {
    flex: 1.2,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm + 1,
    letterSpacing: -0.2,
  },
  statCaption: {
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
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.4,
    maxWidth: 260,
  },
});
