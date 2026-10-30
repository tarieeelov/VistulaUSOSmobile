import {
  TimetableEntry,
  UserProfile,
  TermGrades,
  CourseEdition,
} from '../types/usos';

// ──────────────────────────────────────────────
// Mock Profile: Computer Engineering Student
// ──────────────────────────────────────────────

export const MOCK_PROFILE: UserProfile = {
  id: '123456',
  first_name: 'Jan',
  last_name: 'Kowalski',
  student_number: 's23456',
  photo_urls: {
    '200x200':
      'https://ui-avatars.com/api/?name=Jan+Kowalski&size=200&background=6C63FF&color=fff&bold=true',
  },
  student_status: 1,
};

// ──────────────────────────────────────────────
// Mock Course Editions (Across 2 Semesters: 2024Z & 2025L)
// ──────────────────────────────────────────────

export const MOCK_COURSE_EDITIONS: CourseEdition[] = [
  // Semester 2 (Summer 2025L)
  {
    course_id: 'CS-101',
    course_name: {
      pl: 'Programowanie w języku Java',
      en: 'Programming in Java',
    },
    term_id: '2025L',
  },
  {
    course_id: 'CS-102',
    course_name: {
      pl: 'Systemy baz danych',
      en: 'Database Systems',
    },
    term_id: '2025L',
  },
  {
    course_id: 'CS-103',
    course_name: {
      pl: 'Sieci komputerowe',
      en: 'Computer Networks',
    },
    term_id: '2025L',
  },
  {
    course_id: 'CS-104',
    course_name: {
      pl: 'Matematyka dyskretna',
      en: 'Discrete Mathematics',
    },
    term_id: '2025L',
  },
  {
    course_id: 'CS-105',
    course_name: {
      pl: 'Systemy operacyjne',
      en: 'Operating Systems',
    },
    term_id: '2025L',
  },
  {
    course_id: 'CS-106',
    course_name: {
      pl: 'Inżynieria oprogramowania',
      en: 'Software Engineering',
    },
    term_id: '2025L',
  },

  // Semester 1 (Winter 2024Z)
  {
    course_id: 'CS-001',
    course_name: {
      pl: 'Wstęp do informatyki',
      en: 'Introduction to Computer Science',
    },
    term_id: '2024Z',
  },
  {
    course_id: 'CS-002',
    course_name: {
      pl: 'Algorytmy i struktury danych',
      en: 'Algorithms and Data Structures',
    },
    term_id: '2024Z',
  },
  {
    course_id: 'CS-003',
    course_name: {
      pl: 'Analiza matematyczna',
      en: 'Mathematical Analysis',
    },
    term_id: '2024Z',
  },
  {
    course_id: 'CS-004',
    course_name: {
      pl: 'Architektura komputerów',
      en: 'Computer Architecture',
    },
    term_id: '2024Z',
  },
];

// ──────────────────────────────────────────────
// Mock Grades (2 Semesters with Realistic Distribution)
// ──────────────────────────────────────────────

export const MOCK_GRADES: TermGrades[] = [
  // Semester 2 (Summer 2025L) - Active term, mix of grades and pending
  {
    term_id: '2025L',
    courses: [
      {
        course: {
          course_id: 'CS-101',
          course_name: {
            pl: 'Programowanie w języku Java',
            en: 'Programming in Java',
          },
          term_id: '2025L',
        },
        grades: [
          {
            value_symbol: '5.0',
            value_description: {
              pl: 'Bardzo dobry',
              en: 'Very Good',
            },
            exam_id: 101,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-102',
          course_name: {
            pl: 'Systemy baz danych',
            en: 'Database Systems',
          },
          term_id: '2025L',
        },
        grades: [
          {
            value_symbol: '4.5',
            value_description: {
              pl: 'Dobry plus',
              en: 'Good Plus',
            },
            exam_id: 102,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-103',
          course_name: {
            pl: 'Sieci komputerowe',
            en: 'Computer Networks',
          },
          term_id: '2025L',
        },
        grades: [
          {
            value_symbol: '3.0',
            value_description: {
              pl: 'Dostateczny',
              en: 'Satisfactory',
            },
            exam_id: 103,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-104',
          course_name: {
            pl: 'Matematyka dyskretna',
            en: 'Discrete Mathematics',
          },
          term_id: '2025L',
        },
        grades: [
          {
            value_symbol: '2.0',
            value_description: {
              pl: 'Niedostateczny',
              en: 'Unsatisfactory',
            },
            exam_id: 104,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-105',
          course_name: {
            pl: 'Systemy operacyjne',
            en: 'Operating Systems',
          },
          term_id: '2025L',
        },
        grades: [
          {
            value_symbol: null,
            value_description: {
              pl: 'Oczekująca',
              en: 'Pending',
            },
            exam_id: 105,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-106',
          course_name: {
            pl: 'Inżynieria oprogramowania',
            en: 'Software Engineering',
          },
          term_id: '2025L',
        },
        grades: [
          {
            value_symbol: null,
            value_description: {
              pl: 'Oczekująca',
              en: 'Pending',
            },
            exam_id: 106,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
    ],
  },

  // Semester 1 (Winter 2024Z) - Completed term with retake session
  {
    term_id: '2024Z',
    courses: [
      {
        course: {
          course_id: 'CS-001',
          course_name: {
            pl: 'Wstęp do informatyki',
            en: 'Introduction to Computer Science',
          },
          term_id: '2024Z',
        },
        grades: [
          {
            value_symbol: '5.0',
            value_description: {
              pl: 'Bardzo dobry',
              en: 'Very Good',
            },
            exam_id: 201,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-002',
          course_name: {
            pl: 'Algorytmy i struktury danych',
            en: 'Algorithms and Data Structures',
          },
          term_id: '2024Z',
        },
        grades: [
          {
            value_symbol: '2.0',
            value_description: {
              pl: 'Niedostateczny',
              en: 'Unsatisfactory',
            },
            exam_id: 202,
            exam_session_number: 1,
            counts_into_average: false,
          },
          {
            value_symbol: '4.0',
            value_description: {
              pl: 'Dobry',
              en: 'Good',
            },
            exam_id: 203,
            exam_session_number: 2,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-003',
          course_name: {
            pl: 'Analiza matematyczna',
            en: 'Mathematical Analysis',
          },
          term_id: '2024Z',
        },
        grades: [
          {
            value_symbol: '3.5',
            value_description: {
              pl: 'Dostateczny plus',
              en: 'Satisfactory Plus',
            },
            exam_id: 204,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
      {
        course: {
          course_id: 'CS-004',
          course_name: {
            pl: 'Architektura komputerów',
            en: 'Computer Architecture',
          },
          term_id: '2024Z',
        },
        grades: [
          {
            value_symbol: '4.5',
            value_description: {
              pl: 'Dobry plus',
              en: 'Good Plus',
            },
            exam_id: 205,
            exam_session_number: 1,
            counts_into_average: true,
          },
        ],
      },
    ],
  },
];

// ──────────────────────────────────────────────
// Timetable Generator Helpers
// ──────────────────────────────────────────────

interface ScheduleItemTemplate {
  dayOffset: number; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  course_id: string;
  name: { pl: string; en: string };
  classtype_name: { pl: string; en: string };
  building_name: { pl: string; en: string };
  room_number: string;
  lecturer_name: string;
}

const WEEKLY_SCHEDULE: ScheduleItemTemplate[] = [
  // Monday
  {
    dayOffset: 0,
    startHour: 8,
    startMinute: 30,
    endHour: 10,
    endMinute: 0,
    course_id: 'CS-104',
    name: { pl: 'Matematyka dyskretna', en: 'Discrete Mathematics' },
    classtype_name: { pl: 'Ćwiczenia', en: 'Exercises' },
    building_name: { pl: 'Budynek B', en: 'Building B' },
    room_number: '205',
    lecturer_name: 'prof. dr hab. Krzysztof Dąbrowski',
  },
  {
    dayOffset: 0,
    startHour: 10,
    startMinute: 15,
    endHour: 11,
    endMinute: 45,
    course_id: 'CS-101',
    name: { pl: 'Programowanie w języku Java', en: 'Programming in Java' },
    classtype_name: { pl: 'Wykład', en: 'Lecture' },
    building_name: { pl: 'Gmach Główny', en: 'Main Building' },
    room_number: '101',
    lecturer_name: 'dr inż. Adam Nowak',
  },

  // Tuesday
  {
    dayOffset: 1,
    startHour: 12,
    startMinute: 0,
    endHour: 13,
    endMinute: 30,
    course_id: 'CS-102',
    name: { pl: 'Systemy baz danych', en: 'Database Systems' },
    classtype_name: { pl: 'Laboratorium', en: 'Laboratory' },
    building_name: { pl: 'Centrum Laboratoryjne IT', en: 'IT Lab Center' },
    room_number: 'L3',
    lecturer_name: 'dr Ewa Kamińska',
  },
  {
    dayOffset: 1,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    course_id: 'CS-105',
    name: { pl: 'Systemy operacyjne', en: 'Operating Systems' },
    classtype_name: { pl: 'Wykład', en: 'Lecture' },
    building_name: { pl: 'Gmach Główny', en: 'Main Building' },
    room_number: '308',
    lecturer_name: 'dr hab. inż. Tomasz Lewandowski',
  },

  // Wednesday
  {
    dayOffset: 2,
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    course_id: 'CS-103',
    name: { pl: 'Sieci komputerowe', en: 'Computer Networks' },
    classtype_name: { pl: 'Laboratorium', en: 'Laboratory' },
    building_name: { pl: 'Centrum Laboratoryjne IT', en: 'IT Lab Center' },
    room_number: 'A12',
    lecturer_name: 'dr inż. Marek Zieliński',
  },

  // Thursday
  {
    dayOffset: 3,
    startHour: 13,
    startMinute: 45,
    endHour: 15,
    endMinute: 15,
    course_id: 'CS-106',
    name: { pl: 'Inżynieria oprogramowania', en: 'Software Engineering' },
    classtype_name: { pl: 'Wykład', en: 'Lecture' },
    building_name: { pl: 'Gmach Główny', en: 'Main Building' },
    room_number: '101',
    lecturer_name: 'dr Anna Wójcik',
  },

  // Friday
  {
    dayOffset: 4,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    course_id: 'CS-101',
    name: { pl: 'Programowanie w języku Java', en: 'Programming in Java' },
    classtype_name: { pl: 'Laboratorium', en: 'Laboratory' },
    building_name: { pl: 'Centrum Laboratoryjne IT', en: 'IT Lab Center' },
    room_number: 'L3',
    lecturer_name: 'mgr inż. Piotr Wiśniewski',
  },
];

/**
 * Parses arbitrary date input string into calendar date components.
 */
function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  if (dateStr) {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10) - 1,
        day: parseInt(match[3], 10),
      };
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
      };
    }
  }

  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

/**
 * Returns Monday of the week containing the given date.
 */
function getMondayOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() + diff);
  return monday;
}

/**
 * Formats a Date object and time into the USOS standard "YYYY-MM-DD HH:mm:ss".
 */
function formatUsosTime(date: Date, hours: number, minutes: number, seconds: number = 0): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

// ──────────────────────────────────────────────
// Dynamic Mock Timetable Generator
// ──────────────────────────────────────────────

/**
 * Returns ~5-7 realistic classes spread across Mon-Fri of the given week.
 *
 * Dynamically parses startDate to position classes on correct calendar days.
 * If viewed during typical university hours (08:00 - 18:00) during the current week,
 * dynamically places one class around the current time for 'Happening Now' testing.
 */
export function getMockTimetable(startDate: string): TimetableEntry[] {
  const { year, month, day } = parseDateParts(startDate);
  const baseDate = new Date(year, month, day);
  const monday = getMondayOfWeek(baseDate);

  const now = new Date();
  const currentHour = now.getHours();
  const isUniversityHours = currentHour >= 8 && currentHour < 18;

  // Day of week (0=Sun, 1=Mon, ..., 5=Fri, 6=Sat)
  const todayDayOfWeek = now.getDay();
  const isWeekday = todayDayOfWeek >= 1 && todayDayOfWeek <= 5;
  const todayOffset = isWeekday ? todayDayOfWeek - 1 : 0;

  // Determine if startDate's week encompasses today
  const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const mondayTime = monday.getTime();
  const sundayTime = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6).getTime();
  const isViewingCurrentWeek = todayDateOnly >= mondayTime && todayDateOnly <= sundayTime;

  let activeClassAssigned = false;

  return WEEKLY_SCHEDULE.map((item) => {
    const classDate = new Date(monday);
    classDate.setDate(monday.getDate() + item.dayOffset);

    // If viewing the current week during typical hours, adjust today's class to be active ("happening now")
    const isTodayClass = isViewingCurrentWeek && isWeekday && item.dayOffset === todayOffset;
    if (isTodayClass && isUniversityHours && !activeClassAssigned) {
      activeClassAssigned = true;
      // Start 30 minutes ago, end 60 minutes from now (90 min class duration)
      const dynamicStart = new Date(now.getTime() - 30 * 60 * 1000);
      const dynamicEnd = new Date(now.getTime() + 60 * 60 * 1000);

      return {
        start_time: formatUsosTime(
          dynamicStart,
          dynamicStart.getHours(),
          dynamicStart.getMinutes(),
          0
        ),
        end_time: formatUsosTime(
          dynamicEnd,
          dynamicEnd.getHours(),
          dynamicEnd.getMinutes(),
          0
        ),
        name: item.name,
        building_name: item.building_name,
        room_number: item.room_number,
        course_id: item.course_id,
        classtype_name: item.classtype_name,
        lecturer_name: item.lecturer_name,
      };
    }

    // Standard fixed university schedule for this day
    return {
      start_time: formatUsosTime(classDate, item.startHour, item.startMinute, 0),
      end_time: formatUsosTime(classDate, item.endHour, item.endMinute, 0),
      name: item.name,
      building_name: item.building_name,
      room_number: item.room_number,
      course_id: item.course_id,
      classtype_name: item.classtype_name,
      lecturer_name: item.lecturer_name,
    };
  });
}
