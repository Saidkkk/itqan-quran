import React, { useState } from 'react';
import { 
  Building, 
  Check, 
  Globe, 
  Languages, 
  Plus, 
  Shield, 
  Trash2, 
  UserPlus, 
  Users, 
  X,
  Edit2,
  Sparkles
} from 'lucide-react';
import { Country, Dialect, Halaqah, User, UserRole } from '../types';

interface AdminManagementProps {
  countries: Country[];
  setCountries: (countries: Country[]) => void;
  halaqat: Halaqah[];
  setHalaqat: (halaqat: Halaqah[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  countries,
  setCountries,
  halaqat,
  setHalaqat,
  users,
  setUsers
}) => {
  const [activeTab, setActiveTab] = useState<'DEFINITIONS' | 'HALAQAT' | 'USERS'>('DEFINITIONS');

  // Country / Dialect Modal State
  const [isAddCountryModalOpen, setIsAddCountryModalOpen] = useState(false);
  const [newCountryNameAr, setNewCountryNameAr] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');

  const [isAddDialectModalOpen, setIsAddDialectModalOpen] = useState(false);
  const [selectedCountryForDialect, setSelectedCountryForDialect] = useState<string>('');
  const [newDialectName, setNewDialectName] = useState('');
  const [newDialectDescription, setNewDialectDescription] = useState('');

  // Halaqah Modal State
  const [isAddHalaqahModalOpen, setIsAddHalaqahModalOpen] = useState(false);
  const [newHalaqahName, setNewHalaqahName] = useState('');
  const [newHalaqahTeacherId, setNewHalaqahTeacherId] = useState('');
  const [newHalaqahSupervisorId, setNewHalaqahSupervisorId] = useState('');
  const [newHalaqahLevel, setNewHalaqahLevel] = useState<'مبتدئ' | 'متوسط' | 'متقدم' | 'إجازة وإتقان'>('متوسط');
  const [newHalaqahTargetJuz, setNewHalaqahTargetJuz] = useState<number>(3);
  const [newHalaqahTime, setNewHalaqahTime] = useState('بعد صلاة العصر');

  // User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT');
  const [newUserCountryId, setNewUserCountryId] = useState(countries[0]?.id || '');
  const [newUserDialectId, setNewUserDialectId] = useState(countries[0]?.dialects[0]?.id || '');
  const [newUserSupervisorId, setNewUserSupervisorId] = useState('');
  const [newUserTeacherId, setNewUserTeacherId] = useState('');

  const teachers = users.filter(u => u.role === 'TEACHER');
  const supervisors = users.filter(u => u.role === 'SUPERVISOR');

  // Country / Dialect handlers
  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryNameAr.trim()) return;

    const newCountry: Country = {
      id: `cnt-${Date.now()}`,
      nameAr: newCountryNameAr.trim(),
      nameEn: newCountryCode.trim() || 'Country',
      code: newCountryCode.trim().toUpperCase() || 'XX',
      dialects: []
    };

    setCountries([...countries, newCountry]);
    setNewCountryNameAr('');
    setNewCountryCode('');
    setIsAddCountryModalOpen(false);
  };

  const handleAddDialect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDialectName.trim() || !selectedCountryForDialect) return;

    const newDialect: Dialect = {
      id: `dia-${Date.now()}`,
      name: newDialectName.trim(),
      code: newDialectName.trim().toLowerCase().replace(/\s+/g, '-'),
      countryId: selectedCountryForDialect,
      description: newDialectDescription.trim()
    };

    setCountries(countries.map(c => {
      if (c.id === selectedCountryForDialect) {
        return { ...c, dialects: [...c.dialects, newDialect] };
      }
      return c;
    }));

    setNewDialectName('');
    setNewDialectDescription('');
    setIsAddDialectModalOpen(false);
  };

  // Halaqah handler
  const handleAddHalaqah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHalaqahName.trim()) return;

    const newHalaqah: Halaqah = {
      id: `hlq-${Date.now()}`,
      name: newHalaqahName.trim(),
      code: `HLQ-${Date.now().toString().slice(-4)}`,
      teacherId: newHalaqahTeacherId || teachers[0]?.id || 'usr-tch-1',
      supervisorId: newHalaqahSupervisorId || supervisors[0]?.id || 'usr-sup-1',
      scheduleDays: ['الأحد', 'الثلاثاء', 'الخميس'],
      timeSlot: newHalaqahTime,
      targetJuz: newHalaqahTargetJuz,
      level: newHalaqahLevel,
      maxStudents: 15,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setHalaqat([...halaqat, newHalaqah]);
    setNewHalaqahName('');
    setIsAddHalaqahModalOpen(false);
  };

  // User handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) return;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim() || `${Date.now()}@itqan-quran.org`,
      phone: newUserPhone.trim(),
      role: newUserRole,
      countryId: newUserCountryId || countries[0]?.id || '',
      dialectId: newUserDialectId || '',
      supervisorId: newUserRole === 'TEACHER' ? (newUserSupervisorId || supervisors[0]?.id) : undefined,
      teacherId: newUserRole === 'STUDENT' ? (newUserTeacherId || teachers[0]?.id) : undefined,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      currentJuz: newUserRole === 'STUDENT' ? 30 : undefined,
      currentSurah: newUserRole === 'STUDENT' ? 78 : undefined
    };

    setUsers([...users, newUser]);
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setIsAddUserModalOpen(false);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              لوحة تحكم مدير النظام والتعريفات الأساسية
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة الدول واللهجات، حلقات التحفيظ، والمستخدمين مع ضبط أدوار الصلاحيات (RBAC)
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('DEFINITIONS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'DEFINITIONS'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>الدول واللهجات</span>
          </button>

          <button
            onClick={() => setActiveTab('HALAQAT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'HALAQAT'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>إدارة الحلقات ({halaqat.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'USERS'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين والأدوار ({users.length})</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: الدول واللهجات (Countries & Dialects)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DEFINITIONS' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-600" />
              <span>قائمة الدول واللهجات المعتمدة بالنظام</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCountryForDialect(countries[0]?.id || '');
                  setIsAddDialectModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة لهجة جديدة</span>
              </button>

              <button
                onClick={() => setIsAddCountryModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة دولة</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {countries.map(country => (
              <div
                key={country.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-xs">
                      {country.code}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {country.nameAr}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">
                    {country.dialects.length} لهجات مسجلة
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    اللهجات التابعة:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {country.dialects.map(d => (
                      <div
                        key={d.id}
                        className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs flex flex-col gap-0.5"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {d.name}
                        </span>
                        {d.description && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {d.description}
                          </span>
                        )}
                      </div>
                    ))}
                    {country.dialects.length === 0 && (
                      <span className="text-xs text-slate-400">لا توجد لهجات مسجلة بعد</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: إدارة الحلقات (Halaqat)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'HALAQAT' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>قائمة الحلقات القرآنية ومسؤوليها</span>
            </h3>

            <button
              onClick={() => {
                setNewHalaqahTeacherId(teachers[0]?.id || '');
                setNewHalaqahSupervisorId(supervisors[0]?.id || '');
                setIsAddHalaqahModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء حلقة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {halaqat.map(h => {
              const teacher = users.find(u => u.id === h.teacherId);
              const supervisor = users.find(u => u.id === h.supervisorId);

              return (
                <div
                  key={h.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {h.name}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                        {h.code} • المستوى: {h.level}
                      </span>
                    </div>

                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      مستهدف: {h.targetJuz} أجزاء
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">المعلم المباشر:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {teacher?.name || 'غير معين'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">المشرف العام:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {supervisor?.name || 'غير معين'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">مواعيد الحلقة:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {h.scheduleDays.join(' - ')} ({h.timeSlot})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: المستخدمين والأدوار (Users & RBAC)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>دليل المستخدمين وإدارة الصلاحيات (RBAC)</span>
            </h3>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم جديد</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">الاسم والمستخدم</th>
                    <th className="p-3">الدور / الصلاحية</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">الدولة واللهجة</th>
                    <th className="p-3">الارتباط (مشرف / معلم)</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map(u => {
                    const country = countries.find(c => c.id === u.countryId);
                    const dialect = country?.dialects.find(d => d.id === u.dialectId);
                    const supervisor = users.find(x => x.id === u.supervisorId);
                    const teacher = users.find(x => x.id === u.teacherId);

                    const roleBadges: Record<UserRole, { label: string; color: string }> = {
                      ADMIN: { label: 'مدير النظام (Admin)', color: 'bg-rose-100 text-rose-800 border-rose-200' },
                      SUPERVISOR: { label: 'مشرف (Supervisor)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                      TEACHER: { label: 'معلم (Teacher)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      STUDENT: { label: 'طالب (Student)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                    };

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${roleBadges[u.role].color}`}>
                            {roleBadges[u.role].label}
                          </span>
                        </td>
                        <td className="p-3 font-mono" dir="ltr">{u.phone}</td>
                        <td className="p-3">
                          <div>{country?.nameAr || 'غير محدد'}</div>
                          <div className="text-[11px] text-slate-400">{dialect?.name || '-'}</div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {u.role === 'TEACHER' && supervisor && (
                            <span>مشرفه: {supervisor.name}</span>
                          )}
                          {u.role === 'STUDENT' && teacher && (
                            <span>معلمه: {teacher.name}</span>
                          )}
                          {!u.supervisorId && !u.teacherId && '-'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {u.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
                          >
                            {u.isActive ? 'تعطيل الحساب' : 'تفعيل'}
                          </button>
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
          MODALS
      ───────────────────────────────────────────────────────────── */}
      {/* 1. Add Country Modal */}
      {isAddCountryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddCountry} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm">إضافة دولة جديدة</h4>
              <button type="button" onClick={() => setIsAddCountryModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">اسم الدولة بالعربية:</label>
              <input
                type="text"
                required
                placeholder="مثلاً: دولة الكويت"
                value={newCountryNameAr}
                onChange={e => setNewCountryNameAr(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">رمز الدولة (ISO 2):</label>
              <input
                type="text"
                placeholder="مثلاً: KW"
                value={newCountryCode}
                onChange={e => setNewCountryCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddCountryModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">إلغاء</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">حفظ الدولة</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Add Dialect Modal */}
      {isAddDialectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddDialect} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm">إضافة لهجة تابعة لدولة</h4>
              <button type="button" onClick={() => setIsAddDialectModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">اختر الدولة:</label>
              <select
                value={selectedCountryForDialect}
                onChange={e => setSelectedCountryForDialect(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
              >
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">اسم اللهجة:</label>
              <input
                type="text"
                required
                placeholder="مثلاً: الحجازية أو النجدية أو السكندرية"
                value={newDialectName}
                onChange={e => setNewDialectName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">وصف أو نطاق اللهجة:</label>
              <input
                type="text"
                placeholder="وصف اختياري للمنطقة..."
                value={newDialectDescription}
                onChange={e => setNewDialectDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddDialectModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">إلغاء</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">حفظ اللهجة</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Add Halaqah Modal */}
      {isAddHalaqahModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddHalaqah} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 max-w-lg w-full space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm">إنشاء حلقة تحفيظ جديدة</h4>
              <button type="button" onClick={() => setIsAddHalaqahModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">اسم الحلقة:</label>
              <input
                type="text"
                required
                placeholder="مثلاً: حلقة الإمام الكسائي"
                value={newHalaqahName}
                onChange={e => setNewHalaqahName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">المعلم المسؤول:</label>
                <select
                  value={newHalaqahTeacherId}
                  onChange={e => setNewHalaqahTeacherId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">المشرف المتابع:</label>
                <select
                  value={newHalaqahSupervisorId}
                  onChange={e => setNewHalaqahSupervisorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                >
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">المستوى:</label>
                <select
                  value={newHalaqahLevel}
                  onChange={e => setNewHalaqahLevel(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                >
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                  <option value="إجازة وإتقان">إجازة وإتقان</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">مستهدف الأجزاء:</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newHalaqahTargetJuz}
                  onChange={e => setNewHalaqahTargetJuz(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddHalaqahModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">إلغاء</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">إنشاء الحلقة</button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddUser} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 max-w-lg w-full space-y-4 shadow-xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm">إضافة مستخدم وتعيين الدور (RBAC)</h4>
              <button type="button" onClick={() => setIsAddUserModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="الاسم الثلاثي..."
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  placeholder="+9665..."
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">نوع الدور (Role):</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs font-bold outline-none"
                >
                  <option value="STUDENT">طالب (Student)</option>
                  <option value="TEACHER">معلم (Teacher)</option>
                  <option value="SUPERVISOR">مشرف (Supervisor)</option>
                  <option value="ADMIN">مدير النظام (Admin)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  placeholder="user@itqan.org"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">الدولة:</label>
                <select
                  value={newUserCountryId}
                  onChange={e => setNewUserCountryId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.nameAr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">اللهجة:</label>
                <select
                  value={newUserDialectId}
                  onChange={e => setNewUserDialectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-2.5 text-xs outline-none"
                >
                  {countries.find(c => c.id === newUserCountryId)?.dialects.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">إلغاء</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">إضافة المستخدم</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
