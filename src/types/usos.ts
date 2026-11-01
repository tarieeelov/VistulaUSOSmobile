// ──────────────────────────────────────────────
// USOS API TypeScript Definitions
// ──────────────────────────────────────────────

/** Bilingual string returned by USOS API */
export interface LangDict {
  pl: string;
  en: string | null;
}

/** Resolve bilingual string – prefer English, fallback to Polish */
export function resolveL(dict: LangDict | string | null | undefined): string {
  if (!dict) return '';
  if (typeof dict === 'string') return dict;
  return dict.en ?? dict.pl ?? '';
}

// ── OAuth Tokens ──

export interface OAuthTokenPair {
  oauth_token: string;
  oauth_token_secret: string;
}

// ── Timetable ──

export interface TimetableEntry {
  start_time: string;       // "2026-10-22 08:00:00"
  end_time: string;         // "2026-10-22 09:30:00"
  name: LangDict;
  building_name: LangDict | null;
  room_number: string | null;
  course_id: string | null;
  classtype_name: LangDict | null;
  lecturer_name?: string;   // not always present
}

export type ClassStatus = 'past' | 'active' | 'upcoming' | 'future';

export interface ProcessedClass extends TimetableEntry {
  status: ClassStatus;
  progress?: number;       // 0-1 for active class
  startsInMinutes?: number; // for upcoming class
}

// ── Grades ──

export interface GradeEntry {
  value_symbol: string | null;   // "5.0", "4.5", "2.0", null
  value_description: LangDict | null;
  exam_id: number | null;
  exam_session_number: number;
  counts_into_average: boolean;
}

export interface CourseEdition {
  course_id: string;
  course_name: LangDict;
  term_id: string;
}

export interface TermGrades {
  term_id: string;
  courses: Array<{
    course: CourseEdition;
    grades: GradeEntry[] | Record<string, GradeEntry>;
  }>;
}

// ── Profile ──

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  photo_urls?: {
    '200x200'?: string;
    '100x100'?: string;
    '50x50'?: string;
  };
  student_status: number | null; // 0 = inactive, 1 = active, 2 = graduated
}

// ── API Response Wrapper ──

export interface CachedResponse<T> {
  data: T;
  fromCache: boolean;
  cachedAt: string | null;  // ISO timestamp
}
