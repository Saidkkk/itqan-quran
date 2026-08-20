import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../utils/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('الرجاء إدخال رقم الهاتف أو البريد الإلكتروني');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(identifier, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'بيانات الدخول غير صحيحة، يرجى التحقق من الرقم أو البريد');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleName: 'admin' | 'teacher' | 'student') => {
    setLoading(true);
    setError(null);
    let demoPhone = '+966500000000';
    if (roleName === 'teacher') demoPhone = '+966551122334';
    if (roleName === 'student') demoPhone = '+966509988776';

    try {
      const res = await api.login(demoPhone);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        // Fallback for immediate response
        const users = await api.getUsers();
        const found = users.find(u => u.role.toLowerCase() === roleName) || users[0];
        onLoginSuccess(found);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xl">
              📖
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">تسجيل الدخول لمنصة إتقان</h3>
              <p className="text-xs text-slate-500">حلقات القرآن الكريم والتقييم اليومي</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم الهاتف المحمول أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="مثال: 0551122334 أو teacher@katatibi.com"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                dir="auto"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">يمكن للطلاب والمعلمين الدخول برقم الجوال المسجل مباشرة</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                كلمة المرور (اختياري للتجربة)
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-sm hover:shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">⏳</span>
                <span>جاري التحقق والدخول...</span>
              </>
            ) : (
              <span>تسجيل الدخول 🚀</span>
            )}
          </button>
        </form>

        {/* Quick Test Demo Roles */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-500 mb-2.5 text-center">أو اختر حساباً تجريبياً سريعاً بنقرة واحدة:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition text-center"
            >
              🛡️ مدير النظام
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition text-center"
            >
              👨‍🏫 المعلم
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition text-center"
            >
              👦 الطالب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
