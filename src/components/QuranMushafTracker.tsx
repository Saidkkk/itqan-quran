import React, { useState } from 'react';
import { QURAN_SURAHS, JUZ_NAMES } from '../data/quranData';
import { BookOpen, CheckCircle2, Award, Sparkles, Filter } from 'lucide-react';

interface QuranMushafTrackerProps {
  memorizedSurahs?: number[];
  currentSurah?: number;
  studentName?: string;
  onSurahClick?: (surahNumber: number) => void;
}

export const QuranMushafTracker: React.FC<QuranMushafTrackerProps> = ({
  memorizedSurahs = [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
  currentSurah = 67,
  studentName,
  onSurahClick
}) => {
  const [selectedJuz, setSelectedJuz] = useState<number | 'ALL'>(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<'ALL' | 'MEMORIZED' | 'IN_PROGRESS' | 'REMAINING'>('ALL');

  const filteredSurahs = QURAN_SURAHS.filter(surah => {
    if (selectedJuz !== 'ALL' && surah.startJuz !== selectedJuz) return false;
    if (searchQuery.trim() && !surah.name.includes(searchQuery.trim()) && !surah.number.toString().includes(searchQuery.trim())) {
      return false;
    }
    const isMemorized = memorizedSurahs.includes(surah.number);
    const isCurrent = surah.number === currentSurah;

    if (viewFilter === 'MEMORIZED' && !isMemorized) return false;
    if (viewFilter === 'IN_PROGRESS' && !isCurrent) return false;
    if (viewFilter === 'REMAINING' && (isMemorized || isCurrent)) return false;

    return true;
  });

  const totalMemorizedCount = memorizedSurahs.length;
  const progressPercentage = Math.round((totalMemorizedCount / 114) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              خارطة المصحف الشريف وسجل الحفظ
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {studentName ? `متابعة إنجاز الطالب: ${studentName}` : 'مخطط 114 سورة قرآنية مع التوزيع على الأجزاء الـ 30'}
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-4 py-2 rounded-xl">
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-right">
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">نسبة إتمام الحفظ</div>
            <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
              {progressPercentage}% <span className="text-xs font-normal text-slate-500">({totalMemorizedCount} من 114 سورة)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Juz Dropdown */}
        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300">الجزء:</label>
          <select
            value={selectedJuz}
            onChange={(e) => setSelectedJuz(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="ALL">جميع أجزاء المصحف (1 - 30)</option>
            {JUZ_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick View Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              viewFilter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setViewFilter('MEMORIZED')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              viewFilter === 'MEMORIZED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            تم حفظها ({totalMemorizedCount})
          </button>
          <button
            onClick={() => setViewFilter('REMAINING')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              viewFilter === 'REMAINING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            المتبقي ({114 - totalMemorizedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="بحث عن سورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Surah Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto p-1">
        {filteredSurahs.map(surah => {
          const isMemorized = memorizedSurahs.includes(surah.number);
          const isCurrent = surah.number === currentSurah;

          let statusClass = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
          let badgeText = 'لم يُحفظ';
          let badgeColor = 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

          if (isMemorized) {
            statusClass = 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
            badgeText = 'تم الحفظ ✓';
            badgeColor = 'bg-emerald-600 text-white font-bold';
          } else if (isCurrent) {
            statusClass = 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40';
            badgeText = 'قيد الحفظ الآن';
            badgeColor = 'bg-amber-500 text-white font-bold animate-pulse';
          }

          return (
            <div
              key={surah.number}
              onClick={() => onSurahClick && onSurahClick(surah.number)}
              className={`p-3 rounded-xl border transition-all text-right cursor-pointer hover:scale-[1.02] shadow-xs flex flex-col justify-between ${statusClass}`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                    #{surah.number}
                  </span>
                  <span>{surah.revelationTypeAr}</span>
                </div>
                <div className="font-quran text-base font-bold truncate">
                  سورة {surah.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {surah.numberOfAyahs} آية • جزء {surah.startJuz}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {badgeText}
                </span>
                {isMemorized && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                {isCurrent && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
          لا توجد سور مطابقة لخيارات البحث أو التصفية الحالية
        </div>
      )}
    </div>
  );
};
