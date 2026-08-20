import React from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Database, 
  FileCode2, 
  Moon, 
  RotateCcw, 
  Shield, 
  Sparkles, 
  Sun, 
  UserCheck, 
  Users 
} from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentTab: 'TEACHER_RECORDER' | 'REPORTS' | 'ADMIN' | 'ARCHITECTURE' | 'DOCS';
  setCurrentTab: (tab: 'TEACHER_RECORDER' | 'REPORTS' | 'ADMIN' | 'ARCHITECTURE' | 'DOCS') => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  allUsers,
  onSwitchUser,
  isDarkMode,
  setIsDarkMode,
  onResetData
}) => {
  const navItems = [
    { id: 'TEACHER_RECORDER', label: 'تسجيل الجلسة' },
    { id: 'REPORTS', label: 'التقارير' },
    { id: 'ADMIN', label: 'التعريفات والأدوار' },
    { id: 'ARCHITECTURE', label: 'المخطط وقاعدة البيانات' },
    { id: 'DOCS', label: 'التوثيق البرمجي' }
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand (Single Text Element) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            إ
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white font-cairo whitespace-nowrap">
            منصة إتقان
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single line, 1-2 word labels) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`whitespace-nowrap shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Role Switcher & Dark Mode) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Fast Role Simulator Dropdown */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 hidden sm:inline">
              محاكاة الدور:
            </span>
            <select
              value={currentUser.id}
              onChange={(e) => onSwitchUser(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 outline-none cursor-pointer pr-1 py-1"
            >
              <optgroup label="المعلمون">
                {allUsers.filter(u => u.role === 'TEACHER').map(u => (
                  <option key={u.id} value={u.id} className="dark:bg-slate-900">
                    👨‍🏫 {u.name} (معلم)
                  </option>
                ))}
              </optgroup>
              <optgroup label="المشرفون">
                {allUsers.filter(u => u.role === 'SUPERVISOR').map(u => (
                  <option key={u.id} value={u.id} className="dark:bg-slate-900">
                    👳‍♂️ {u.name} (مشرف)
                  </option>
                ))}
              </optgroup>
              <optgroup label="الإدارة">
                {allUsers.filter(u => u.role === 'ADMIN').map(u => (
                  <option key={u.id} value={u.id} className="dark:bg-slate-900">
                    🛡️ {u.name} (مدير النظام)
                  </option>
                ))}
              </optgroup>
              <optgroup label="الطلاب">
                {allUsers.filter(u => u.role === 'STUDENT').map(u => (
                  <option key={u.id} value={u.id} className="dark:bg-slate-900">
                    👦 {u.name} (طالب)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
            title="تبديل المظهر"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (for small screens) */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-1 text-[11px] font-bold">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-2 py-1.5 rounded-lg transition whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
