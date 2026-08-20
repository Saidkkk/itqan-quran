import { QURAN_SURAHS } from '../data/quranData';
import { GradeRating, StudentSessionEvaluation, User } from '../types';

export const getSurahName = (surahNumber: number): string => {
  const surah = QURAN_SURAHS.find(s => s.number === surahNumber);
  return surah ? `سورة ${surah.name}` : `سورة ${surahNumber}`;
};

export const getGradeArabic = (grade: GradeRating): string => {
  switch (grade) {
    case 'EXCELLENT':
      return 'ممتاز 🌟';
    case 'VERY_GOOD':
      return 'جيد جداً 👍';
    case 'GOOD':
      return 'جيد';
    case 'ACCEPTABLE':
      return 'مقبول';
    case 'NOT_MEMORIZED':
      return 'لم يحفظ ⚠️';
    default:
      return grade;
  }
};

export const getAttendanceArabic = (attendance: string): { label: string; color: string; badgeBg: string } => {
  switch (attendance) {
    case 'PRESENT':
      return { label: 'حاضر', color: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800' };
    case 'ABSENT':
      return { label: 'غائب', color: 'text-rose-700 dark:text-rose-300', badgeBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800' };
    case 'LATE':
      return { label: 'متأخر', color: 'text-amber-700 dark:text-amber-300', badgeBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800' };
    case 'EXCUSED':
      return { label: 'معذور', color: 'text-blue-700 dark:text-blue-300', badgeBg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800' };
    default:
      return { label: attendance, color: 'text-slate-600 dark:text-slate-400', badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300' };
  }
};

export const generateWhatsAppMessage = (
  student: User,
  evalData: StudentSessionEvaluation,
  circleName: string,
  teacherName: string,
  sessionDate: string
): string => {
  const attendance = getAttendanceArabic(evalData.attendance).label;
  let text = `🌿 *تقرير جلسة تحفيظ القرآن الكريم* 🌿\n`;
  text += `📅 *التاريخ:* ${sessionDate}\n`;
  text += `🕌 *الحلقة:* ${circleName}\n`;
  text += `👤 *الطالب:* ${student.name}\n`;
  text += `👳‍♂️ *المعلم:* ${teacherName}\n`;
  text += `📌 *حالة الحضور:* ${attendance}\n`;
  text += `──────────────────────\n`;

  if (evalData.attendance === 'ABSENT') {
    text += `⚠️ *تنبيه:* تغيب الطالب عن جلسة اليوم، نرجو المتابعة وحثه على الحضور والالتزام.\n`;
  } else {
    if (evalData.newMemorization.enabled) {
      const fromS = getSurahName(evalData.newMemorization.fromSurah);
      const toS = getSurahName(evalData.newMemorization.toSurah);
      text += `📖 *الحفظ الجديد:* من ${fromS} (${evalData.newMemorization.fromAyah}) إلى ${toS} (${evalData.newMemorization.toAyah})\n`;
      text += `⭐ *التقييم:* ${getGradeArabic(evalData.newMemorization.grade)} (${evalData.newMemorization.numericScore || 100}%)\n`;
      if (evalData.newMemorization.mistakesCount > 0) {
        text += `🔍 عدد الأخطاء: ${evalData.newMemorization.mistakesCount} | التردد: ${evalData.newMemorization.hesitationsCount}\n`;
      }
    }

    if (evalData.nearRevision.enabled) {
      const fromS = getSurahName(evalData.nearRevision.fromSurah);
      const toS = getSurahName(evalData.nearRevision.toSurah);
      text += `🔄 *مراجعة القريب:* من ${fromS} (${evalData.nearRevision.fromAyah}) إلى ${toS} (${evalData.nearRevision.toAyah}) - [${getGradeArabic(evalData.nearRevision.grade)}]\n`;
    }

    if (evalData.farRevision.enabled) {
      const fromS = getSurahName(evalData.farRevision.fromSurah);
      const toS = getSurahName(evalData.farRevision.toSurah);
      text += `📚 *مراجعة البعيد:* من ${fromS} (${evalData.farRevision.fromAyah}) إلى ${toS} (${evalData.farRevision.toAyah}) - [${getGradeArabic(evalData.farRevision.grade)}]\n`;
    }

    if (evalData.generalNotes) {
      text += `\n💬 *ملاحظات وتوجيه المعلم:* ${evalData.generalNotes}\n`;
    }

    text += `🏆 *النقاط المكتسبة اليوم:* +${evalData.pointsEarned} نقطة\n`;
  }

  text += `──────────────────────\n`;
  text += `جزاكم الله خيراً وبارك في أبنائكم ووفقهم لخدمة كتاب الله تعالى. ✨`;

  return text;
};

export const exportToCSV = (filename: string, rows: (string | number)[][], headers: string[]) => {
  const processRow = (row: (string | number)[]) => {
    return row.map(val => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    }).join(',');
  };

  const csvContent = '\uFEFF' + [processRow(headers), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
