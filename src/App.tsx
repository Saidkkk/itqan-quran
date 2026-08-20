import React, { useState, useEffect } from 'react';
import { 
  getStoredCountries, 
  getStoredEnrollments, 
  getStoredHalaqat, 
  getStoredSessions, 
  getStoredUsers, 
  resetAllData, 
  setStoredCountries, 
  setStoredEnrollments, 
  setStoredHalaqat, 
  setStoredSessions, 
  setStoredUsers 
} from './utils/storage';
import { Country, Halaqah, HalaqahSession, StudentEnrollment, User } from './types';
import { Navbar } from './components/Navbar';
import { TeacherSessionRecorder } from './components/TeacherSessionRecorder';
import { ReportsView } from './components/ReportsView';
import { AdminManagement } from './components/AdminManagement';
import { DatabaseArchitecture } from './components/DatabaseArchitecture';
import { SwaggerApiDocs } from './components/SwaggerApiDocs';
import { BookOpen, Shield, Sparkles, UserCheck } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {
      // fallback
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState<'TEACHER_RECORDER' | 'REPORTS' | 'ADMIN' | 'ARCHITECTURE' | 'DOCS'>('TEACHER_RECORDER');
  
  // Persistent Data States
  const [users, setUsersState] = useState<User[]>(getStoredUsers);
  const [countries, setCountriesState] = useState<Country[]>(getStoredCountries);
  const [halaqat, setHalaqatState] = useState<Halaqah[]>(getStoredHalaqat);
  const [enrollments, setEnrollmentsState] = useState<StudentEnrollment[]>(getStoredEnrollments);
  const [sessions, setSessionsState] = useState<HalaqahSession[]>(getStoredSessions);

  // Active Simulated User
  const [currentUserId, setCurrentUserId] = useState<string>('usr-tch-1'); // Default to Teacher
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Sync dark mode class with html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Setters with storage sync
  const setUsers = (newUsers: User[]) => {
    setUsersState(newUsers);
    setStoredUsers(newUsers);
  };

  const setCountries = (newCountries: Country[]) => {
    setCountriesState(newCountries);
    setStoredCountries(newCountries);
  };

  const setHalaqat = (newHalaqat: Halaqah[]) => {
    setHalaqatState(newHalaqat);
    setStoredHalaqat(newHalaqat);
  };

  const handleSaveSession = (newSession: HalaqahSession) => {
    const existingIndex = sessions.findIndex(s => s.id === newSession.id || (s.circleId === newSession.circleId && s.date === newSession.date));
    let updatedSessions: HalaqahSession[];
    if (existingIndex >= 0) {
      updatedSessions = [...sessions];
      updatedSessions[existingIndex] = newSession;
    } else {
      updatedSessions = [newSession, ...sessions];
    }
    setSessionsState(updatedSessions);
    setStoredSessions(updatedSessions);
  };

  const handleResetData = () => {
    if (window.confirm('هل تريد إعادة تعيين جميع البيانات التجريبية إلى حالتها الأصلية؟')) {
      resetAllData();
      window.location.reload();
    }
  };

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      if (targetUser.role === 'TEACHER') setCurrentTab('TEACHER_RECORDER');
      else if (targetUser.role === 'ADMIN') setCurrentTab('ADMIN');
      else if (targetUser.role === 'SUPERVISOR' || targetUser.role === 'STUDENT') setCurrentTab('REPORTS');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Navbar adhering strictly to the Top Bar contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onResetData={handleResetData}
      />

      {/* Role Banner / Context Indicator */}
      <div className="bg-emerald-800 text-white py-2 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 px-2 py-0.5 rounded font-bold">
              {currentUser.role === 'ADMIN' && '🛡️ مدير النظام'}
              {currentUser.role === 'SUPERVISOR' && '👳‍♂️ مشرف الحلقات'}
              {currentUser.role === 'TEACHER' && '👨‍🏫 معلم الحلقة'}
              {currentUser.role === 'STUDENT' && '👦 الطالب'}
            </span>
            <span>أنت مسجل حالياً باسم: <strong className="underline">{currentUser.name}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-emerald-100">
            <span>النسخة: 2.0 (Mobile-First / Postgres Architecture)</span>
            <button
              onClick={handleResetData}
              className="hover:underline text-emerald-200 hover:text-white"
            >
              إعادة ضبط البيانات ↺
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'TEACHER_RECORDER' && (
          <TeacherSessionRecorder
            currentTeacher={currentUser.role === 'TEACHER' ? currentUser : users.find(u => u.role === 'TEACHER') || users[0]}
            halaqat={halaqat}
            allStudents={users.filter(u => u.role === 'STUDENT')}
            enrollments={enrollments}
            sessions={sessions}
            onSaveSession={handleSaveSession}
          />
        )}

        {currentTab === 'REPORTS' && (
          <ReportsView
            currentUser={currentUser}
            users={users}
            halaqat={halaqat}
            sessions={sessions}
            enrollments={enrollments}
          />
        )}

        {currentTab === 'ADMIN' && (
          <AdminManagement
            countries={countries}
            setCountries={setCountries}
            halaqat={halaqat}
            setHalaqat={setHalaqat}
            users={users}
            setUsers={setUsers}
          />
        )}

        {currentTab === 'ARCHITECTURE' && (
          <DatabaseArchitecture />
        )}

        {currentTab === 'DOCS' && (
          <SwaggerApiDocs />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} إتقان | نظام متكامل ومبسط لإدارة وتوثيق حلقات القرآن الكريم</p>
          <p className="font-mono text-[11px]">PostgreSQL • SQLAlchemy 2.0 • FastAPI / NiceGUI • Mobile-First</p>
        </div>
      </footer>
    </div>
  );
}
