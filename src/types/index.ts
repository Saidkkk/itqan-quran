export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'TEACHER' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type GradeRating = 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'ACCEPTABLE' | 'NOT_MEMORIZED';

export type EvaluationCategory = 'NEW_MEMORIZATION' | 'NEAR_REVISION' | 'FAR_REVISION';

export interface Dialect {
  id: string;
  name: string;
  code: string;
  countryId: string;
  description?: string;
}

export interface Country {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  dialects: Dialect[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  countryId: string;
  dialectId: string;
  supervisorId?: string; // For teachers: their assigned supervisor
  teacherId?: string;    // For students: their primary teacher
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  notes?: string;
  // Student-specific metrics
  currentJuz?: number;
  currentSurah?: number;
  totalMemorizedAyahs?: number;
}

export interface Halaqah {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacherId: string;
  supervisorId: string;
  scheduleDays: string[]; // e.g. ["الأحد", "الثلاثاء", "الخميس"]
  timeSlot: string;       // e.g. "بعد صلاة العصر"
  targetJuz: number;      // e.g. 5
  level: 'مبتدئ' | 'متوسط' | 'متقدم' | 'إجازة وإتقان';
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
}

export interface StudentEnrollment {
  id: string;
  circleId: string;
  studentId: string;
  enrolledAt: string;
  status: 'ACTIVE' | 'PAUSED' | 'GRADUATED';
}

export interface EvaluationItem {
  enabled: boolean;
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
  grade: GradeRating;
  numericScore?: number; // 0 - 100
  mistakesCount: number;  // عدد الأخطاء الجلية
  hesitationsCount: number; // عدد الترددات واللحون الخفية
  tajweedRating?: 'ممتاز' | 'جيد' | 'يحتاج ضبط';
  notes?: string;
}

export interface StudentSessionEvaluation {
  id: string;
  sessionId: string;
  studentId: string;
  attendance: AttendanceStatus;
  newMemorization: EvaluationItem;
  nearRevision: EvaluationItem;
  farRevision: EvaluationItem;
  generalNotes?: string;
  pointsEarned: number;
  recordedAt: string;
}

export interface HalaqahSession {
  id: string;
  circleId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  startTime?: string;
  notes?: string;
  evaluations: Record<string, StudentSessionEvaluation>; // key: studentId
}

export interface StudentProgressReport {
  studentId: string;
  studentName: string;
  circleName: string;
  teacherName: string;
  attendanceRate: number;
  totalSessions: number;
  attendedSessions: number;
  memorizedJuzCount: number;
  memorizedSurahs: number[];
  averageScore: number;
  totalPoints: number;
  excellentCount: number;
  streakDays: number;
  lastSessionDate: string;
}

export interface CircleProductivityReport {
  circleId: string;
  circleName: string;
  teacherName: string;
  totalStudents: number;
  activeStudents: number;
  attendanceRate: number;
  totalAyahsMemorizedThisMonth: number;
  totalSessionsRecorded: number;
  averageGradeScore: number;
  topStudents: { studentId: string; studentName: string; points: number }[];
}

export interface TeacherAuditReport {
  teacherId: string;
  teacherName: string;
  supervisorName: string;
  assignedCirclesCount: number;
  totalStudents: number;
  sessionsCompleted: number;
  sessionsScheduled: number;
  complianceRate: number;
  lastActiveDate: string;
  supervisorNotes?: string;
}
