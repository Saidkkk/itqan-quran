import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCheck, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Flame, 
  MessageCircle, 
  Plus, 
  Minus, 
  Save, 
  Search, 
  Sparkles, 
  Star, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { QURAN_SURAHS } from '../data/quranData';
import { 
  AttendanceStatus, 
  GradeRating, 
  Halaqah, 
  HalaqahSession, 
  StudentSessionEvaluation, 
  User 
} from '../types';
import { WhatsAppSummaryModal } from './WhatsAppSummaryModal';

interface TeacherSessionRecorderProps {
  currentTeacher: User;
  halaqat: Halaqah[];
  allStudents: User[];
  enrollments: { circleId: string; studentId: string }[];
  sessions: HalaqahSession[];
  onSaveSession: (session: HalaqahSession) => void;
}

export const TeacherSessionRecorder: React.FC<TeacherSessionRecorderProps> = ({
  currentTeacher,
  halaqat,
  allStudents,
  enrollments,
  sessions,
  onSaveSession
}) => {
  // Filter halaqat assigned to current teacher (or all if teacher has multiple)
  const teacherCircles = halaqat.filter(h => h.teacherId === currentTeacher.id || currentTeacher.role === 'ADMIN');
  const [selectedCircleId, setSelectedCircleId] = useState<string>(teacherCircles[0]?.id || halaqat[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAttendanceFilter, setActiveAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>('ALL');
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  // WhatsApp Modal State
  const [whatsAppModalStudent, setWhatsAppModalStudent] = useState<{
    student: User;
    evalData: StudentSessionEvaluation;
  } | null>(null);

  // Get enrolled students for the selected circle
  const enrolledStudentIds = enrollments
    .filter(e => e.circleId === selectedCircleId)
    .map(e => e.studentId);

  const circleStudents = allStudents.filter(s => enrolledStudentIds.includes(s.id));

  // Find existing session for this circle and date, or initialize a fresh state
  const existingSession = sessions.find(s => s.circleId === selectedCircleId && s.date === sessionDate);

  // Local evaluation state for the active session
  const [evaluations, setEvaluations] = useState<Record<string, StudentSessionEvaluation>>(() => {
    if (existingSession) {
      return existingSession.evaluations;
    }
    const initial: Record<string, StudentSessionEvaluation> = {};
    circleStudents.forEach(student => {
      initial[student.id] = createDefaultEvaluation(student.id, student.currentSurah || 67);
    });
    return initial;
  });

  // Re-sync when circle or date changes
  const handleCircleChange = (newCircleId: string) => {
    setSelectedCircleId(newCircleId);
    const existing = sessions.find(s => s.circleId === newCircleId && s.date === sessionDate);
    if (existing) {
      setEvaluations(existing.evaluations);
      setSessionNotes(existing.notes || '');
    } else {
      const newEnrolledIds = enrollments.filter(e => e.circleId === newCircleId).map(e => e.studentId);
      const newStudents = allStudents.filter(s => newEnrolledIds.includes(s.id));
      const fresh: Record<string, StudentSessionEvaluation> = {};
      newStudents.forEach(student => {
        fresh[student.id] = createDefaultEvaluation(student.id, student.currentSurah || 67);
      });
      setEvaluations(fresh);
      setSessionNotes('');
    }
  };

  const handleDateChange = (newDate: string) => {
    setSessionDate(newDate);
    const existing = sessions.find(s => s.circleId === selectedCircleId && s.date === newDate);
    if (existing) {
      setEvaluations(existing.evaluations);
      setSessionNotes(existing.notes || '');
    }
  };

  function createDefaultEvaluation(studentId: string, defaultSurah = 67): StudentSessionEvaluation {
    return {
      id: `eval-${Date.now()}-${studentId}`,
      sessionId: `ses-${sessionDate}-${selectedCircleId}`,
      studentId,
      attendance: 'PRESENT',
      newMemorization: {
        enabled: true,
        fromSurah: defaultSurah,
        fromAyah: 1,
        toSurah: defaultSurah,
        toAyah: 15,
        grade: 'EXCELLENT',
        numericScore: 95,
        mistakesCount: 0,
        hesitationsCount: 0,
        tajweedRating: 'ممتاز',
        notes: ''
      },
      nearRevision: {
        enabled: true,
        fromSurah: defaultSurah + 1 <= 114 ? defaultSurah + 1 : 1,
        fromAyah: 1,
        toSurah: defaultSurah + 1 <= 114 ? defaultSurah + 1 : 1,
        toAyah: 20,
        grade: 'EXCELLENT',
        numericScore: 95,
        mistakesCount: 0,
        hesitationsCount: 1
      },
      farRevision: {
        enabled: false,
        fromSurah: 78,
        fromAyah: 1,
        toSurah: 80,
        toAyah: 20,
        grade: 'VERY_GOOD',
        numericScore: 90,
        mistakesCount: 1,
        hesitationsCount: 2
      },
      pointsEarned: 25,
      recordedAt: new Date().toISOString()
    };
  }

  const updateStudentEval = (studentId: string, updater: (prev: StudentSessionEvaluation) => StudentSessionEvaluation) => {
    setEvaluations(prev => {
      const current = prev[studentId] || createDefaultEvaluation(studentId);
      const updated = updater(current);
      return {
        ...prev,
        [studentId]: updated
      };
    });
  };

  // Quick Attendance 1-tap handler
  const setAttendance = (studentId: string, status: AttendanceStatus) => {
    updateStudentEval(studentId, prev => {
      let points = 25;
      if (status === 'ABSENT') points = 0;
      else if (status === 'LATE') points = 15;
      else if (status === 'EXCUSED') points = 10;
      return {
        ...prev,
        attendance: status,
        pointsEarned: points
      };
    });
  };

  // Quick Grade 1-tap handler
  const setQuickGrade = (studentId: string, category: 'newMemorization' | 'nearRevision' | 'farRevision', grade: GradeRating) => {
    let score = 95;
    if (grade === 'EXCELLENT') {
      score = 98;
      // Trigger joyful confetti on excellence!
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 }
      });
    } else if (grade === 'VERY_GOOD') score = 88;
    else if (grade === 'GOOD') score = 78;
    else if (grade === 'ACCEPTABLE') score = 65;
    else if (grade === 'NOT_MEMORIZED') score = 0;

    updateStudentEval(studentId, prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        grade,
        numericScore: score
      }
    }));
  };

  // Bulk Actions
  const handleMarkAllPresent = () => {
    setEvaluations(prev => {
      const next = { ...prev };
      circleStudents.forEach(st => {
        if (next[st.id]) {
          next[st.id] = { ...next[st.id], attendance: 'PRESENT', pointsEarned: 25 };
        } else {
          next[st.id] = createDefaultEvaluation(st.id, st.currentSurah || 67);
        }
      });
      return next;
    });
  };

  const handleSetAllExcellent = () => {
    setEvaluations(prev => {
      const next = { ...prev };
      circleStudents.forEach(st => {
        if (next[st.id] && next[st.id].attendance !== 'ABSENT') {
          next[st.id] = {
            ...next[st.id],
            newMemorization: { ...next[st.id].newMemorization, grade: 'EXCELLENT', numericScore: 98, mistakesCount: 0 },
            nearRevision: { ...next[st.id].nearRevision, grade: 'EXCELLENT', numericScore: 95, mistakesCount: 0 }
          };
        }
      });
      return next;
    });
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  // Save Session
  const handleSaveAll = () => {
    const sessionObj: HalaqahSession = {
      id: existingSession?.id || `ses-${Date.now()}-${selectedCircleId}`,
      circleId: selectedCircleId,
      teacherId: currentTeacher.id,
      date: sessionDate,
      status: 'COMPLETED',
      notes: sessionNotes,
      evaluations
    };

    onSaveSession(sessionObj);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 3000);
  };

  const currentCircle = halaqat.find(h => h.id === selectedCircleId) || halaqat[0];

  // Filtering for search and attendance filter
  const filteredStudents = circleStudents.filter(student => {
    const evalData = evaluations[student.id];
    if (activeAttendanceFilter !== 'ALL') {
      if (!evalData || evalData.attendance !== activeAttendanceFilter) return false;
    }
    if (searchQuery.trim() && !student.name.includes(searchQuery.trim()) && !student.phone.includes(searchQuery.trim())) {
      return false;
    }
    return true;
  });

  const presentCount = circleStudents.filter(s => evaluations[s.id]?.attendance === 'PRESENT').length;
  const absentCount = circleStudents.filter(s => evaluations[s.id]?.attendance === 'ABSENT').length;
  const lateCount = circleStudents.filter(s => evaluations[s.id]?.attendance === 'LATE').length;

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {savedSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">تم حفظ واعتماد درجات وحضور الجلسة بنجاح! ✨</span>
        </div>
      )}

      {/* Top Mobile Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                تسجيل جلسة الحلقة اليومية
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              المعلم: {currentTeacher.name} • المشرف: الشيخ د. عثمان الشنقيطي
            </p>
          </div>

          {/* Quick Date and Circle Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 sm:flex-none">
              <select
                value={selectedCircleId}
                onChange={(e) => handleCircleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {halaqat.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Attendance Counter & Quick Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              حاضر: {presentCount}
            </span>
            <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
              غائب: {absentCount}
            </span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              متأخر: {lateCount}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">
              (إجمالي {circleStudents.length} طلاب)
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={handleMarkAllPresent}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold transition active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>تحضير الكل</span>
            </button>

            <button
              onClick={handleSetAllExcellent}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl font-bold transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ممتاز للجميع</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>حفظ واعتماد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث عن طالب بالاسم أو الجوال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-[11px]">
          {(['ALL', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(filterKey => {
            const labels = { ALL: 'الكل', PRESENT: 'الحاضرون', ABSENT: 'الغائبون', LATE: 'المتأخرون', EXCUSED: 'المعذورون' };
            const isActive = activeAttendanceFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setActiveAttendanceFilter(filterKey)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {labels[filterKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student List - Mobile First Touch Cards */}
      <div className="space-y-3">
        {filteredStudents.map((student, idx) => {
          const evalData = evaluations[student.id] || createDefaultEvaluation(student.id, student.currentSurah || 67);
          const isExpanded = expandedStudentId === student.id;
          const isAbsent = evalData.attendance === 'ABSENT';

          return (
            <div
              key={student.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-xs overflow-hidden ${
                isAbsent
                  ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20'
                  : evalData.attendance === 'LATE'
                  ? 'border-amber-200 dark:border-amber-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Main Student Header Row (Compact & Fast) */}
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-base">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {student.name}
                      </h4>
                      {evalData.newMemorization?.grade === 'EXCELLENT' && !isAbsent && (
                        <span className="text-amber-500 text-xs" title="ممتاز">⭐</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>جزء {student.currentJuz || 30}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]" dir="ltr">{student.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Quick 1-Tap Attendance Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
                  <button
                    onClick={() => setAttendance(student.id, 'PRESENT')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                      evalData.attendance === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    حاضر ✓
                  </button>

                  <button
                    onClick={() => setAttendance(student.id, 'LATE')}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                      evalData.attendance === 'LATE'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    متأخر ⏳
                  </button>

                  <button
                    onClick={() => setAttendance(student.id, 'ABSENT')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                      evalData.attendance === 'ABSENT'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    غائب ✗
                  </button>

                  <button
                    onClick={() => setAttendance(student.id, 'EXCUSED')}
                    className={`flex-1 sm:flex-none px-2 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                      evalData.attendance === 'EXCUSED'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    معذور
                  </button>
                </div>

                {/* Expand / WhatsApp Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setWhatsAppModalStudent({ student, evalData })}
                    className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition text-xs font-bold flex items-center gap-1"
                    title="مشاركة تقرير الجلسة عبر واتساب"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">واتساب</span>
                  </button>

                  <button
                    onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                  >
                    <span>{isExpanded ? 'طي التفاصيل' : 'تفاصيل الحفظ والمراجعة'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Fast Evaluation Summary Strip (When collapsed) */}
              {!isExpanded && !isAbsent && (
                <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-4">
                    {evalData.newMemorization.enabled && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">حفظ جديد:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-quran">
                          {QURAN_SURAHS.find(s => s.number === evalData.newMemorization.fromSurah)?.name} ({evalData.newMemorization.fromAyah}-{evalData.newMemorization.toAyah})
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold text-[10px]">
                          {evalData.newMemorization.grade === 'EXCELLENT' ? 'ممتاز' : evalData.newMemorization.grade}
                        </span>
                      </div>
                    )}

                    {evalData.nearRevision.enabled && (
                      <div className="hidden sm:flex items-center gap-1">
                        <span className="text-slate-500">مراجعة قريب:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-quran">
                          {QURAN_SURAHS.find(s => s.number === evalData.nearRevision.fromSurah)?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    النقاط: <span className="font-bold text-emerald-600">+{evalData.pointsEarned}</span>
                  </div>
                </div>
              )}

              {/* Expandable Fast Mobile Grading Drawer */}
              {isExpanded && !isAbsent && (
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-4 text-right animate-in fade-in duration-100">
                  {/* Category 1: حفظ جديد (New Memorization) */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          ١. الحفظ الجديد (تسميع اليوم)
                        </h5>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={evalData.newMemorization.enabled}
                          onChange={(e) => updateStudentEval(student.id, p => ({
                            ...p,
                            newMemorization: { ...p.newMemorization, enabled: e.target.checked }
                          }))}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>مفعل</span>
                      </label>
                    </div>

                    {evalData.newMemorization.enabled && (
                      <div className="space-y-3 pt-1">
                        {/* Surah & Ayah Pickers */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">من سورة:</label>
                            <select
                              value={evalData.newMemorization.fromSurah}
                              onChange={(e) => {
                                const num = Number(e.target.value);
                                updateStudentEval(student.id, p => ({
                                  ...p,
                                  newMemorization: { ...p.newMemorization, fromSurah: num, toSurah: num }
                                }));
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-quran text-xs font-bold outline-none"
                            >
                              {QURAN_SURAHS.map(s => (
                                <option key={s.number} value={s.number}>
                                  {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">من الآية:</label>
                            <input
                              type="number"
                              min={1}
                              max={286}
                              value={evalData.newMemorization.fromAyah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, fromAyah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">إلى سورة:</label>
                            <select
                              value={evalData.newMemorization.toSurah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, toSurah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-quran text-xs font-bold outline-none"
                            >
                              {QURAN_SURAHS.map(s => (
                                <option key={s.number} value={s.number}>
                                  {s.number}. سورة {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">إلى الآية:</label>
                            <input
                              type="number"
                              min={1}
                              max={286}
                              value={evalData.newMemorization.toAyah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, toAyah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                          </div>
                        </div>

                        {/* Fast 1-Tap Grade Pills */}
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">الدرجة والتقييم السريع:</label>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                            {[
                              { key: 'EXCELLENT', label: 'ممتاز 🌟', color: 'bg-emerald-600 text-white' },
                              { key: 'VERY_GOOD', label: 'جيد جداً 👍', color: 'bg-teal-600 text-white' },
                              { key: 'GOOD', label: 'جيد', color: 'bg-blue-600 text-white' },
                              { key: 'ACCEPTABLE', label: 'مقبول', color: 'bg-amber-600 text-white' },
                              { key: 'NOT_MEMORIZED', label: 'لم يحفظ ⚠️', color: 'bg-rose-600 text-white' },
                            ].map(item => {
                              const isSel = evalData.newMemorization.grade === item.key;
                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={() => setQuickGrade(student.id, 'newMemorization', item.key as GradeRating)}
                                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition active:scale-95 ${
                                    isSel
                                      ? `${item.color} shadow-xs border-transparent`
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mistakes & Hesitations Counters */}
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">عدد الأخطاء:</span>
                            <button
                              type="button"
                              onClick={() => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, mistakesCount: Math.max(0, p.newMemorization.mistakesCount - 1) }
                              }))}
                              className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs w-4 text-center text-rose-600">
                              {evalData.newMemorization.mistakesCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, mistakesCount: p.newMemorization.mistakesCount + 1 }
                              }))}
                              className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">التردد / اللحن:</span>
                            <button
                              type="button"
                              onClick={() => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, hesitationsCount: Math.max(0, p.newMemorization.hesitationsCount - 1) }
                              }))}
                              className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs w-4 text-center text-amber-600">
                              {evalData.newMemorization.hesitationsCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, hesitationsCount: p.newMemorization.hesitationsCount + 1 }
                              }))}
                              className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex-1 min-w-[150px]">
                            <input
                              type="text"
                              placeholder="ملاحظات الحفظ وتوجيه الطالب..."
                              value={evalData.newMemorization.notes || ''}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                newMemorization: { ...p.newMemorization, notes: e.target.value }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category 2: مراجعة قريب (Near Revision) */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          ٢. مراجعة القريب (الماضي القريب - آخر ٥ أجزاء أو سور)
                        </h5>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={evalData.nearRevision.enabled}
                          onChange={(e) => updateStudentEval(student.id, p => ({
                            ...p,
                            nearRevision: { ...p.nearRevision, enabled: e.target.checked }
                          }))}
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span>مفعل</span>
                      </label>
                    </div>

                    {evalData.nearRevision.enabled && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">من سورة:</label>
                            <select
                              value={evalData.nearRevision.fromSurah}
                              onChange={(e) => {
                                const num = Number(e.target.value);
                                updateStudentEval(student.id, p => ({
                                  ...p,
                                  nearRevision: { ...p.nearRevision, fromSurah: num, toSurah: num }
                                }));
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-quran text-xs font-bold outline-none"
                            >
                              {QURAN_SURAHS.map(s => (
                                <option key={s.number} value={s.number}>
                                  {s.number}. سورة {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">من الآية:</label>
                            <input
                              type="number"
                              value={evalData.nearRevision.fromAyah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                nearRevision: { ...p.nearRevision, fromAyah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">إلى سورة:</label>
                            <select
                              value={evalData.nearRevision.toSurah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                nearRevision: { ...p.nearRevision, toSurah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-quran text-xs font-bold outline-none"
                            >
                              {QURAN_SURAHS.map(s => (
                                <option key={s.number} value={s.number}>
                                  {s.number}. سورة {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">إلى الآية:</label>
                            <input
                              type="number"
                              value={evalData.nearRevision.toAyah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                nearRevision: { ...p.nearRevision, toAyah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                          </div>
                        </div>

                        {/* Grade Buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                          {[
                            { key: 'EXCELLENT', label: 'ممتاز 🌟', color: 'bg-emerald-600 text-white' },
                            { key: 'VERY_GOOD', label: 'جيد جداً 👍', color: 'bg-teal-600 text-white' },
                            { key: 'GOOD', label: 'جيد', color: 'bg-blue-600 text-white' },
                            { key: 'ACCEPTABLE', label: 'مقبول', color: 'bg-amber-600 text-white' },
                            { key: 'NOT_MEMORIZED', label: 'لم يحفظ ⚠️', color: 'bg-rose-600 text-white' },
                          ].map(item => {
                            const isSel = evalData.nearRevision.grade === item.key;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => setQuickGrade(student.id, 'nearRevision', item.key as GradeRating)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition active:scale-95 ${
                                  isSel
                                    ? `${item.color} shadow-xs border-transparent`
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category 3: مراجعة بعيد (Far Revision) */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          ٣. مراجعة البعيد (تثبيت المحفوظ القديم والختمات)
                        </h5>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={evalData.farRevision.enabled}
                          onChange={(e) => updateStudentEval(student.id, p => ({
                            ...p,
                            farRevision: { ...p.farRevision, enabled: e.target.checked }
                          }))}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span>مفعل</span>
                      </label>
                    </div>

                    {evalData.farRevision.enabled && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">من سورة:</label>
                            <select
                              value={evalData.farRevision.fromSurah}
                              onChange={(e) => {
                                const num = Number(e.target.value);
                                updateStudentEval(student.id, p => ({
                                  ...p,
                                  farRevision: { ...p.farRevision, fromSurah: num, toSurah: num }
                                }));
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-quran text-xs font-bold outline-none"
                            >
                              {QURAN_SURAHS.map(s => (
                                <option key={s.number} value={s.number}>
                                  {s.number}. سورة {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">من الآية:</label>
                            <input
                              type="number"
                              value={evalData.farRevision.fromAyah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                farRevision: { ...p.farRevision, fromAyah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">إلى سورة:</label>
                            <select
                              value={evalData.farRevision.toSurah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                farRevision: { ...p.farRevision, toSurah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-quran text-xs font-bold outline-none"
                            >
                              {QURAN_SURAHS.map(s => (
                                <option key={s.number} value={s.number}>
                                  {s.number}. سورة {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-500 block mb-1">إلى الآية:</label>
                            <input
                              type="number"
                              value={evalData.farRevision.toAyah}
                              onChange={(e) => updateStudentEval(student.id, p => ({
                                ...p,
                                farRevision: { ...p.farRevision, toAyah: Number(e.target.value) }
                              }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                          </div>
                        </div>

                        {/* Grade Buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                          {[
                            { key: 'EXCELLENT', label: 'ممتاز 🌟', color: 'bg-emerald-600 text-white' },
                            { key: 'VERY_GOOD', label: 'جيد جداً 👍', color: 'bg-teal-600 text-white' },
                            { key: 'GOOD', label: 'جيد', color: 'bg-blue-600 text-white' },
                            { key: 'ACCEPTABLE', label: 'مقبول', color: 'bg-amber-600 text-white' },
                            { key: 'NOT_MEMORIZED', label: 'لم يحفظ ⚠️', color: 'bg-rose-600 text-white' },
                          ].map(item => {
                            const isSel = evalData.farRevision.grade === item.key;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => setQuickGrade(student.id, 'farRevision', item.key as GradeRating)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition active:scale-95 ${
                                  isSel
                                    ? `${item.color} shadow-xs border-transparent`
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 text-sm">
            لا يوجد طلاب مطابقين للبحث في هذه الحلقة
          </div>
        )}
      </div>

      {/* WhatsApp Modal */}
      {whatsAppModalStudent && (
        <WhatsAppSummaryModal
          isOpen={true}
          onClose={() => setWhatsAppModalStudent(null)}
          student={whatsAppModalStudent.student}
          evalData={whatsAppModalStudent.evalData}
          circleName={currentCircle.name}
          teacherName={currentTeacher.name}
          sessionDate={sessionDate}
        />
      )}
    </div>
  );
};
