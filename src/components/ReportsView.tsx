import React, { useState } from 'react';
import { 
  BarChart3, 
  BookCheck, 
  Calendar, 
  ChevronRight, 
  Download, 
  FileText, 
  Flame, 
  GraduationCap, 
  Printer, 
  Search, 
  Sparkles, 
  Star, 
  Trophy, 
  Users 
} from 'lucide-react';
import { QURAN_SURAHS } from '../data/quranData';
import { 
  CircleProductivityReport, 
  Halaqah, 
  HalaqahSession, 
  StudentProgressReport, 
  TeacherAuditReport, 
  User 
} from '../types';
import { exportToCSV, getAttendanceArabic, getGradeArabic, getSurahName } from '../utils/exportUtils';
import { QuranMushafTracker } from './QuranMushafTracker';

interface ReportsViewProps {
  currentUser: User;
  users: User[];
  halaqat: Halaqah[];
  sessions: HalaqahSession[];
  enrollments: { circleId: string; studentId: string }[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  users,
  halaqat,
  sessions,
  enrollments
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'STUDENT' | 'CIRCLE' | 'TEACHER'>('STUDENT');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('usr-std-1');
  const [selectedCircleId, setSelectedCircleId] = useState<string>('hlq-nafe-1');
  const [searchQuery, setSearchQuery] = useState('');

  const students = users.filter(u => u.role === 'STUDENT');
  const teachers = users.filter(u => u.role === 'TEACHER');
  const supervisors = users.filter(u => u.role === 'SUPERVISOR');

  // --- Student Report Logic ---
  const currentSelectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  
  // Calculate student metrics
  const studentSessions = sessions.filter(ses => ses.evaluations[currentSelectedStudent?.id]);
  const totalRecorded = studentSessions.length;
  const attendedCount = studentSessions.filter(s => s.evaluations[currentSelectedStudent.id]?.attendance === 'PRESENT').length;
  const attendanceRate = totalRecorded > 0 ? Math.round((attendedCount / totalRecorded) * 100) : 100;

  let totalScoreSum = 0;
  let scoreCount = 0;
  let totalPoints = 0;
  let excellentCount = 0;

  studentSessions.forEach(ses => {
    const ev = ses.evaluations[currentSelectedStudent.id];
    if (ev && ev.attendance !== 'ABSENT') {
      if (ev.newMemorization?.enabled && ev.newMemorization.numericScore) {
        totalScoreSum += ev.newMemorization.numericScore;
        scoreCount++;
        if (ev.newMemorization.grade === 'EXCELLENT') excellentCount++;
      }
      totalPoints += ev.pointsEarned || 20;
    }
  });

  const averageScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 95;

  // Student's enrolled circles
  const studentCircleIds = enrollments.filter(e => e.studentId === currentSelectedStudent?.id).map(e => e.circleId);
  const studentHalaqat = halaqat.filter(h => studentCircleIds.includes(h.id));

  // --- Export Handlers ---
  const handleExportStudentCSV = () => {
    const rows = studentSessions.map(ses => {
      const ev = ses.evaluations[currentSelectedStudent.id];
      return [
        ses.date,
        halaqat.find(h => h.id === ses.circleId)?.name || '',
        getAttendanceArabic(ev.attendance).label,
        ev.newMemorization.enabled ? `${getSurahName(ev.newMemorization.fromSurah)} (${ev.newMemorization.fromAyah}-${ev.newMemorization.toAyah})` : '-',
        ev.newMemorization.enabled ? getGradeArabic(ev.newMemorization.grade) : '-',
        ev.nearRevision.enabled ? `${getSurahName(ev.nearRevision.fromSurah)} (${ev.nearRevision.fromAyah}-${ev.nearRevision.toAyah})` : '-',
        ev.nearRevision.enabled ? getGradeArabic(ev.nearRevision.grade) : '-',
        ev.pointsEarned || 0,
        ev.generalNotes || ''
      ];
    });

    exportToCSV(
      `تقرير_الطالب_${currentSelectedStudent.name.replace(/\s+/g, '_')}`,
      rows,
      ['التاريخ', 'الحلقة', 'الحضور', 'الحفظ الجديد', 'درجة الحفظ', 'مراجعة القريب', 'درجة المراجعة', 'النقاط', 'ملاحظات']
    );
  };

  const handleExportCircleCSV = () => {
    const targetCircle = halaqat.find(h => h.id === selectedCircleId);
    const circleEnrolledIds = enrollments.filter(e => e.circleId === selectedCircleId).map(e => e.studentId);
    const circleStds = students.filter(s => circleEnrolledIds.includes(s.id));

    const rows = circleStds.map(st => {
      return [
        st.name,
        st.phone,
        `جزء ${st.currentJuz || 30}`,
        getSurahName(st.currentSurah || 67),
        st.totalMemorizedAyahs || 400,
        '96%',
        'منتظم'
      ];
    });

    exportToCSV(
      `تقرير_إنتاجية_${targetCircle?.name.replace(/\s+/g, '_') || 'الحلقة'}`,
      rows,
      ['اسم الطالب', 'رقم الهاتف', 'الجزء الحالي', 'السورة الحالية', 'إجمالي الآيات المحفوظة', 'نسبة الحضور', 'حالة الانتظام']
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Report Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              تقارير الأداء والإنتاجية القرآنية
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إحصائيات تفصيلية ومؤشرات إنجاز الطلاب والحلقات والمعلمين قابلة للتصدير والطباعة
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveReportTab('STUDENT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeReportTab === 'STUDENT'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>تقرير أداء الطالب</span>
          </button>

          <button
            onClick={() => setActiveReportTab('CIRCLE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeReportTab === 'CIRCLE'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إنتاجية الحلقة</span>
          </button>

          <button
            onClick={() => setActiveReportTab('TEACHER')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeReportTab === 'TEACHER'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookCheck className="w-4 h-4" />
            <span>متابعة المعلمين والمشرفين</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: تقرير أداء الطالب (Student Report)
      ───────────────────────────────────────────────────────────── */}
      {activeReportTab === 'STUDENT' && currentSelectedStudent && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Selector & Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                اختر الطالب للمعاينة:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportStudentCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>تصدير Excel / CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة التقرير الرسمي</span>
              </button>
            </div>
          </div>

          {/* Student Profile & KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>نسبة الحضور والالتزام</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {attendanceRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                حضر {attendedCount} من إجمالي {totalRecorded} جلسة
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>متوسط التقييم العام</span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {averageScore}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {excellentCount} جلسة بتقدير ممتاز
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>إجمالي النقاط والأوسمة</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                +{totalPoints}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                وسام الحافظ المتقن 🏅
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>المحفوظ الحالي</span>
                <BookCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white font-quran truncate">
                {getSurahName(currentSelectedStudent.currentSurah || 67)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                جزء {currentSelectedStudent.currentJuz || 30} ({currentSelectedStudent.totalMemorizedAyahs || 500} آية)
              </div>
            </div>
          </div>

          {/* Interactive 30-Juz Quran Mushaf Visual Tracker */}
          <QuranMushafTracker
            studentName={currentSelectedStudent.name}
            currentSurah={currentSelectedStudent.currentSurah || 67}
          />

          {/* Recent Sessions History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>سجل الجلسات والتسميع السابقة للطالب</span>
              </h3>
              <span className="text-xs text-slate-500">
                إجمالي {studentSessions.length} جلسة مسجلة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">الحلقة</th>
                    <th className="p-3">الحضور</th>
                    <th className="p-3">الحفظ الجديد</th>
                    <th className="p-3">مراجعة القريب</th>
                    <th className="p-3">الدرجة</th>
                    <th className="p-3">الأخطاء</th>
                    <th className="p-3">ملاحظات المعلم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {studentSessions.map((ses, i) => {
                    const ev = ses.evaluations[currentSelectedStudent.id];
                    if (!ev) return null;
                    const att = getAttendanceArabic(ev.attendance);
                    const circle = halaqat.find(h => h.id === ses.circleId);

                    return (
                      <tr key={ses.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-medium">{ses.date}</td>
                        <td className="p-3 font-semibold">{circle?.name || 'حلقة القرآن'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${att.badgeBg} ${att.color}`}>
                            {att.label}
                          </span>
                        </td>
                        <td className="p-3 font-quran">
                          {ev.newMemorization.enabled ? (
                            <span>
                              {getSurahName(ev.newMemorization.fromSurah)} ({ev.newMemorization.fromAyah}-{ev.newMemorization.toAyah})
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 font-quran">
                          {ev.nearRevision.enabled ? (
                            <span>
                              {getSurahName(ev.nearRevision.fromSurah)} ({ev.nearRevision.fromAyah}-{ev.nearRevision.toAyah})
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-emerald-600">
                          {ev.attendance === 'ABSENT' ? '-' : getGradeArabic(ev.newMemorization.grade)}
                        </td>
                        <td className="p-3">
                          {ev.newMemorization.mistakesCount > 0 ? (
                            <span className="text-rose-600 font-bold">{ev.newMemorization.mistakesCount} خطأ</span>
                          ) : (
                            <span className="text-emerald-600">بلا أخطاء ✓</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">
                          {ev.generalNotes || ev.newMemorization.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: تقرير إنتاجية الحلقة (Circle Productivity Report)
      ───────────────────────────────────────────────────────────── */}
      {activeReportTab === 'CIRCLE' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                اختر الحلقة القرآنية:
              </label>
              <select
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {halaqat.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCircleCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>تصدير تقرير الحلقة</span>
              </button>
            </div>
          </div>

          {/* Circle KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">الطلاب المسجلون</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {enrollments.filter(e => e.circleId === selectedCircleId).length} طالب
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">القدرة الاستيعابية: ١٥</div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">متوسط الحضور الأسبوعي</div>
              <div className="text-2xl font-black text-emerald-600">
                94.2%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">معدل التزام ممتاز</div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">إجمالي الآيات المسمعة</div>
              <div className="text-2xl font-black text-blue-600">
                1,840 آية
              </div>
              <div className="text-[11px] text-slate-400 mt-1">خلال الشهر الحالي</div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">الجلسات الموثقة</div>
              <div className="text-2xl font-black text-purple-600">
                {sessions.filter(s => s.circleId === selectedCircleId).length} جلسة
              </div>
              <div className="text-[11px] text-slate-400 mt-1">معدل إنجاز 100%</div>
            </div>
          </div>

          {/* Circle Student Standings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>لوحة شرف وإنجاز طلاب الحلقة</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">الترتيب</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">المحفوظ الحالي</th>
                    <th className="p-3">الآيات المنجزة</th>
                    <th className="p-3">نسبة الحضور</th>
                    <th className="p-3">النقاط والأوسمة</th>
                    <th className="p-3">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.slice(0, 5).map((st, i) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          i === 0 ? 'bg-amber-100 text-amber-800' : i === 1 ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {st.name}
                        {i === 0 && <span title="الأول على الحلقة">👑</span>}
                      </td>
                      <td className="p-3 font-quran">{getSurahName(st.currentSurah || 67)}</td>
                      <td className="p-3 font-mono">{st.totalMemorizedAyahs || 500} آية</td>
                      <td className="p-3 font-bold text-emerald-600">98%</td>
                      <td className="p-3 font-bold text-amber-600">+{85 - i * 10} نقطة</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            setActiveReportTab('STUDENT');
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                        >
                          عرض الملف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: تقرير متابعة المعلمين والمشرفين (Teacher & Supervisor Audit)
      ───────────────────────────────────────────────────────────── */}
      {activeReportTab === 'TEACHER' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teachers.map(teacher => {
              const supervisor = supervisors.find(s => s.id === teacher.supervisorId) || supervisors[0];
              const teacherHalaqat = halaqat.filter(h => h.teacherId === teacher.id);
              const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);

              return (
                <div
                  key={teacher.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-3">
                    {teacher.avatarUrl ? (
                      <img src={teacher.avatarUrl} alt={teacher.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center">
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {teacher.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        المشرف المباشر: {supervisor?.name || 'إدارة الحلقات'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">الحلقات المسندة:</span>
                      <span className="font-bold">{teacherHalaqat.length} حلقات</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">الجلسات الموثقة:</span>
                      <span className="font-bold text-emerald-600">{teacherSessions.length} جلسة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">نسبة الالتزام بالتوثيق:</span>
                      <span className="font-bold text-emerald-600">100% ✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">رقم الهاتف:</span>
                      <span dir="ltr" className="font-mono">{teacher.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      الحلقات التابعة:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {teacherHalaqat.map(h => (
                        <span key={h.id} className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          {h.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
