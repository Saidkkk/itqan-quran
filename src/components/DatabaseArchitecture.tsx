import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Copy, 
  Database, 
  FileCode2, 
  Key, 
  Layers, 
  Lock, 
  Network, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  Table, 
  Workflow 
} from 'lucide-react';

export const DatabaseArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ERD' | 'FLOW' | 'RBAC' | 'DDL'>('ERD');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>('users');

  const TABLES = [
    {
      name: 'users',
      nameAr: 'المستخدمين (مدير، مشرف، معلم، طالب)',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      fields: [
        { name: 'id', type: 'UUID / VARCHAR', pk: true, desc: 'المعرف الفريد للمستخدم' },
        { name: 'name', type: 'VARCHAR(150)', req: true, desc: 'الاسم الثلاثي' },
        { name: 'phone', type: 'VARCHAR(25)', req: true, unique: true, desc: 'رقم الهاتف (مفتاح فريد)' },
        { name: 'email', type: 'VARCHAR(100)', unique: true, desc: 'البريد الإلكتروني' },
        { name: 'password_hash', type: 'VARCHAR(255)', req: true, desc: 'تشفير bcrypt/argon2' },
        { name: 'role', type: 'VARCHAR(20)', req: true, desc: 'ADMIN | SUPERVISOR | TEACHER | STUDENT' },
        { name: 'country_id', type: 'UUID', fk: 'countries.id', desc: 'الدولة' },
        { name: 'dialect_id', type: 'UUID', fk: 'dialects.id', desc: 'اللهجة' },
        { name: 'supervisor_id', type: 'UUID', fk: 'users.id', desc: 'المشرف المباشر (للمعلمين)' },
        { name: 'is_active', type: 'BOOLEAN', def: 'true', desc: 'حالة الحساب' },
        { name: 'created_at', type: 'TIMESTAMPTZ', def: 'NOW()', desc: 'تاريخ الإنشاء' }
      ],
      indexes: ['idx_users_role (role)', 'idx_users_phone (phone)', 'idx_users_supervisor (supervisor_id)']
    },
    {
      name: 'countries',
      nameAr: 'الدول',
      color: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
      fields: [
        { name: 'id', type: 'UUID / VARCHAR', pk: true, desc: 'معرف الدولة' },
        { name: 'name_ar', type: 'VARCHAR(100)', req: true, desc: 'اسم الدولة بالعربية' },
        { name: 'code', type: 'VARCHAR(10)', req: true, unique: true, desc: 'رمز ISO (SA, EG, ...)' }
      ],
      indexes: ['idx_countries_code (code)']
    },
    {
      name: 'dialects',
      nameAr: 'اللهجات',
      color: 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
      fields: [
        { name: 'id', type: 'UUID / VARCHAR', pk: true, desc: 'معرف اللهجة' },
        { name: 'name', type: 'VARCHAR(100)', req: true, desc: 'اسم اللهجة (حجازية، نجدية...)' },
        { name: 'country_id', type: 'UUID', fk: 'countries.id', desc: 'الدولة التابعة لها' },
        { name: 'description', type: 'TEXT', desc: 'وصف النطاق الجغرافي' }
      ],
      indexes: ['idx_dialects_country (country_id)']
    },
    {
      name: 'halaqat',
      nameAr: 'الحلقات القرآنية',
      color: 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300',
      fields: [
        { name: 'id', type: 'UUID / VARCHAR', pk: true, desc: 'معرف الحلقة' },
        { name: 'name', type: 'VARCHAR(150)', req: true, desc: 'اسم الحلقة (حلقة نافع...)' },
        { name: 'code', type: 'VARCHAR(50)', unique: true, desc: 'رمز كودي فريد' },
        { name: 'teacher_id', type: 'UUID', fk: 'users.id', desc: 'المعلم المسؤول' },
        { name: 'supervisor_id', type: 'UUID', fk: 'users.id', desc: 'المشرف المتابع' },
        { name: 'target_juz', type: 'INTEGER', def: '3', desc: 'مستهدف الأجزاء للحلقة' },
        { name: 'level', type: 'VARCHAR(50)', desc: 'مبتدئ / متوسط / متقدم / إجازة' },
        { name: 'schedule_days', type: 'JSONB / TEXT[]', desc: 'أيام انعقاد الحلقة' },
        { name: 'time_slot', type: 'VARCHAR(100)', desc: 'توقيت الانعقاد' },
        { name: 'is_active', type: 'BOOLEAN', def: 'true', desc: 'حالة نشاط الحلقة' }
      ],
      indexes: ['idx_halaqat_teacher (teacher_id)', 'idx_halaqat_supervisor (supervisor_id)']
    },
    {
      name: 'student_enrollments',
      nameAr: 'تسجيل الطلاب بالحلقات (علاقة N:M)',
      color: 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300',
      fields: [
        { name: 'id', type: 'UUID / VARCHAR', pk: true, desc: 'معرف التسجيل' },
        { name: 'circle_id', type: 'UUID', fk: 'halaqat.id', desc: 'الحلقة' },
        { name: 'student_id', type: 'UUID', fk: 'users.id', desc: 'الطالب' },
        { name: 'status', type: 'VARCHAR(20)', def: "'ACTIVE'", desc: 'ACTIVE / PAUSED / GRADUATED' },
        { name: 'enrolled_at', type: 'DATE', def: 'CURRENT_DATE', desc: 'تاريخ الانضمام' }
      ],
      indexes: ['unique_student_circle (student_id, circle_id)', 'idx_enrollments_student (student_id)']
    },
    {
      name: 'sessions',
      nameAr: 'جلسات الحلقات (اليومية)',
      color: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      fields: [
        { name: 'id', type: 'UUID / VARCHAR', pk: true, desc: 'معرف الجلسة' },
        { name: 'circle_id', type: 'UUID', fk: 'halaqat.id', desc: 'الحلقة' },
        { name: 'teacher_id', type: 'UUID', fk: 'users.id', desc: 'المعلم المسجل' },
        { name: 'session_date', type: 'DATE', req: true, desc: 'تاريخ الجلسة (YYYY-MM-DD)' },
        { name: 'status', type: 'VARCHAR(20)', def: "'COMPLETED'", desc: 'حالة الجلسة' },
        { name: 'notes', type: 'TEXT', desc: 'ملاحظات وتوجيهات المعلم' },
        { name: 'created_at', type: 'TIMESTAMPTZ', def: 'NOW()', desc: 'وقت التوثيق الفعلي' }
      ],
      indexes: ['idx_sessions_circle_date (circle_id, session_date)', 'idx_sessions_teacher (teacher_id)']
    },
    {
      name: 'session_evaluations',
      nameAr: 'تفاصيل التسميع والدرجات والحضور',
      color: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      fields: [
        { name: 'id', type: 'UUID / VARCHAR', pk: true, desc: 'معرف التقييم' },
        { name: 'session_id', type: 'UUID', fk: 'sessions.id', desc: 'الجلسة التابعة' },
        { name: 'student_id', type: 'UUID', fk: 'users.id', desc: 'الطالب' },
        { name: 'attendance', type: 'VARCHAR(20)', req: true, desc: 'PRESENT | ABSENT | LATE | EXCUSED' },
        // New Memorization
        { name: 'new_memo_enabled', type: 'BOOLEAN', def: 'true', desc: 'حفظ جديد' },
        { name: 'new_from_surah', type: 'INTEGER', desc: 'من سورة (1-114)' },
        { name: 'new_from_ayah', type: 'INTEGER', desc: 'من آية' },
        { name: 'new_to_surah', type: 'INTEGER', desc: 'إلى سورة (1-114)' },
        { name: 'new_to_ayah', type: 'INTEGER', desc: 'إلى آية' },
        { name: 'new_grade', type: 'VARCHAR(20)', desc: 'EXCELLENT | VERY_GOOD | GOOD | ...' },
        { name: 'new_score', type: 'NUMERIC(5,2)', desc: 'الدرجة الرقمية (0-100)' },
        { name: 'new_mistakes', type: 'INTEGER', def: '0', desc: 'عدد الأخطاء الجلية' },
        { name: 'new_hesitations', type: 'INTEGER', def: '0', desc: 'التردد واللحن' },
        // Near Revision
        { name: 'near_rev_enabled', type: 'BOOLEAN', def: 'true', desc: 'مراجعة قريب' },
        { name: 'near_from_surah', type: 'INTEGER', desc: 'سورة البداية' },
        { name: 'near_to_surah', type: 'INTEGER', desc: 'سورة النهاية' },
        { name: 'near_grade', type: 'VARCHAR(20)', desc: 'درجة مراجعة القريب' },
        // Far Revision
        { name: 'far_rev_enabled', type: 'BOOLEAN', def: 'false', desc: 'مراجعة بعيد' },
        { name: 'far_from_surah', type: 'INTEGER', desc: 'سورة البداية' },
        { name: 'far_to_surah', type: 'INTEGER', desc: 'سورة النهاية' },
        { name: 'far_grade', type: 'VARCHAR(20)', desc: 'درجة مراجعة البعيد' },
        // Points & Notes
        { name: 'points_earned', type: 'INTEGER', def: '0', desc: 'النقاط المكتسبة' },
        { name: 'notes', type: 'TEXT', desc: 'توجيهات فردية' }
      ],
      indexes: [
        'idx_eval_session (session_id)',
        'idx_eval_student (student_id)',
        'idx_eval_student_attendance (student_id, attendance)'
      ]
    }
  ];

  const SQL_DDL_CODE = `-- =========================================================================
-- نظام إتقان لإدارة حلقات تحفيظ القرآن الكريم
-- PostgreSQL Schema مع الفهارس المركبة لضمان أقصى سرعة للأداء (High Performance)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول الدول (Countries)
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول اللهجات (Dialects)
CREATE TABLE dialects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_dialects_country_id ON dialects(country_id);

-- 3. جدول المستخدمين (Users & RBAC)
CREATE TYPE user_role AS ENUM ('ADMIN', 'SUPERVISOR', 'TEACHER', 'STUDENT');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL UNIQUE,
    email VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
    dialect_id UUID REFERENCES dialects(id) ON DELETE SET NULL,
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_supervisor ON users(supervisor_id) WHERE role = 'TEACHER';
CREATE INDEX idx_users_phone ON users(phone);

-- 4. جدول الحلقات القرآنية (Halaqat)
CREATE TABLE halaqat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_juz INTEGER DEFAULT 3,
    level VARCHAR(50) DEFAULT 'متوسط',
    schedule_days TEXT[] NOT NULL DEFAULT ARRAY['الأحد', 'الثلاثاء', 'الخميس'],
    time_slot VARCHAR(100),
    max_students INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_halaqat_teacher ON halaqat(teacher_id);
CREATE INDEX idx_halaqat_supervisor ON halaqat(supervisor_id);

-- 5. جدول تسجيل الطلاب بالحلقات (Student Enrollments)
CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID NOT NULL REFERENCES halaqat(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    enrolled_at DATE DEFAULT CURRENT_DATE,
    CONSTRAINT uq_student_circle UNIQUE (student_id, circle_id)
);
CREATE INDEX idx_enrollments_circle ON student_enrollments(circle_id);
CREATE INDEX idx_enrollments_student ON student_enrollments(student_id);

-- 6. جدول الجلسات اليومية (Sessions)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID NOT NULL REFERENCES halaqat(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_circle_session_date UNIQUE (circle_id, session_date)
);
CREATE INDEX idx_sessions_circle_date ON sessions(circle_id, session_date DESC);
CREATE INDEX idx_sessions_teacher_date ON sessions(teacher_id, session_date DESC);

-- 7. جدول تفاصيل التسميع والدرجات والحضور (Session Evaluations)
CREATE TYPE attendance_type AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE grade_rating AS ENUM ('EXCELLENT', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE', 'NOT_MEMORIZED');

CREATE TABLE session_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance attendance_type NOT NULL DEFAULT 'PRESENT',
    
    -- الحفظ الجديد (New Memorization)
    new_memo_enabled BOOLEAN DEFAULT TRUE,
    new_from_surah INTEGER CHECK (new_from_surah BETWEEN 1 AND 114),
    new_from_ayah INTEGER,
    new_to_surah INTEGER CHECK (new_to_surah BETWEEN 1 AND 114),
    new_to_ayah INTEGER,
    new_grade grade_rating DEFAULT 'EXCELLENT',
    new_score NUMERIC(5, 2) DEFAULT 95.0,
    new_mistakes INTEGER DEFAULT 0,
    new_hesitations INTEGER DEFAULT 0,
    
    -- مراجعة القريب (Near Revision)
    near_rev_enabled BOOLEAN DEFAULT TRUE,
    near_from_surah INTEGER,
    near_from_ayah INTEGER,
    near_to_surah INTEGER,
    near_to_ayah INTEGER,
    near_grade grade_rating DEFAULT 'EXCELLENT',
    near_mistakes INTEGER DEFAULT 0,
    
    -- مراجعة البعيد (Far Revision)
    far_rev_enabled BOOLEAN DEFAULT FALSE,
    far_from_surah INTEGER,
    far_from_ayah INTEGER,
    far_to_surah INTEGER,
    far_to_ayah INTEGER,
    far_grade grade_rating,
    
    points_earned INTEGER DEFAULT 25,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);
CREATE INDEX idx_eval_session ON session_evaluations(session_id);
CREATE INDEX idx_eval_student_performance ON session_evaluations(student_id, created_at DESC);
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SQL_DDL_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              المخطط الهيكلي وقاعدة البيانات وتدفق العمليات
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            نماذج PostgreSQL، مخطط تدفق بيانات تسجيل الجلسة، وهيكل الصلاحيات والأمان (RBAC + JWT)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('ERD')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'ERD'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مخطط العلاقات (ERD)</span>
          </button>

          <button
            onClick={() => setActiveTab('FLOW')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'FLOW'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>تدفق تسجيل الجلسة</span>
          </button>

          <button
            onClick={() => setActiveTab('RBAC')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'RBAC'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>مصفوفة الصلاحيات (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab('DDL')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'DDL'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>كود SQL DDL</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: مخطط العلاقات التفاعلي (Interactive ERD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ERD' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TABLES.map(tbl => {
              const isSelected = selectedTable === tbl.name;
              return (
                <div
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all p-4 shadow-xs cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-emerald-600" />
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {tbl.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {tbl.nameAr}
                      </span>
                    </div>

                    <div className="py-2.5 space-y-1.5 text-xs max-h-56 overflow-y-auto">
                      {tbl.fields.map(f => (
                        <div
                          key={f.name}
                          className="flex items-center justify-between p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <div className="flex items-center gap-1.5">
                            {f.pk && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">PK</span>}
                            {f.fk && <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-bold">FK</span>}
                            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                              {f.name}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {f.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">الفهارس (Indexes): </span>
                    {tbl.indexes.length} فهارس للأداء
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Table Detail Card */}
          {selectedTable && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>تفاصيل الجدول والعلاقات: </span>
                  <span className="font-mono text-emerald-600 font-bold">{selectedTable}</span>
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5">اسم الحقل</th>
                      <th className="p-2.5">النوع في Postgres</th>
                      <th className="p-2.5">القيود والمفاتيح</th>
                      <th className="p-2.5">الوصف والوظيفة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {TABLES.find(t => t.name === selectedTable)?.fields.map(f => (
                      <tr key={f.name}>
                        <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">{f.name}</td>
                        <td className="p-2.5 font-mono text-emerald-600">{f.type}</td>
                        <td className="p-2.5">
                          {f.pk && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold ml-1">مفتاح رئيسي PK</span>}
                          {f.fk && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold ml-1">مفتاح أجنبي ➔ {f.fk}</span>}
                          {f.unique && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold ml-1">UNIQUE</span>}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: مخطط تدفق بيانات تسجيل الجلسة (Data Flow Sequence)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'FLOW' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="text-right">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              مخطط تدفق بيانات تسجيل جلسة التحفيظ (Session Recording Flow)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              رحلة البيانات من نقرة المعلم في واجهة الموبايل حتى تخزينها بقاعدة البيانات وتحديث التقارير
            </p>
          </div>

          {/* Visual Step-by-Step Flow */}
          <div className="space-y-4">
            {[
              {
                step: '١',
                title: 'واجهة المعلم (Teacher Mobile UI)',
                desc: 'المعلم يفتح التطبيق على الموبايل، يختار الحلقة والتاريخ، ويضغط نقرة واحدة لتحديد حضور الطلاب ودرجات الحفظ (حفظ جديد، مراجعة قريب، مراجعة بعيد).',
                tech: 'React / NiceGUI Mobile Touch Cards • Local In-Memory State',
                color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              },
              {
                step: '٢',
                title: 'التحقق الأمني وصلاحية المعلم (JWT Auth & RBAC Guard)',
                desc: 'إرسال Payload الجلسة إلى Backend (FastAPI / Express) مع ترويسة Authorization: Bearer <token>. يتأكد الـ Middleware أن المعلم يملك صلاحية TEACHER وأن الحلقة تتبع له فعلياً.',
                tech: 'OAuth2 / PyJWT • Role-Based Access Control Middleware',
                color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
              },
              {
                step: '٣',
                title: 'المعاملة الذرية وقاعدة البيانات (Atomic DB Transaction)',
                desc: 'فتح Database Transaction لحفظ سجل الجلسة في جدول `sessions` مع إدراج تفصيلي لكافة تقييمات الطلاب في جدول `session_evaluations` (Bulk Upsert) بضمان عدم التكرار.',
                tech: 'PostgreSQL • SQLAlchemy async_session • ON CONFLICT DO UPDATE',
                color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
              },
              {
                step: '٤',
                title: 'تحديث مؤشرات التقدم وخارطة المصحف (Progress Analytics Aggregation)',
                desc: 'إعادة احتساب نسبة إنجاز الطالب في المصحف الشريف، تحديث عداد الآيات المحفوظة، وتحديث نقاط وأوسمة التميز للمتصدرين في الحلقة.',
                tech: 'SQL Aggregations / Background Worker • Real-time State Sync',
                color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
              },
              {
                step: '٥',
                title: 'إشعارات أولياء الأمور وتقارير المشرف (Notifications & Audit)',
                desc: 'توليد رسائل واتساب مهيأة مسبقاً لكل طالب، وإتاحة التقارير فوراً في لوحة المشرف والمدير للاطلاع والتدقيق.',
                tech: 'WhatsApp Deep Links / Twilio API • Audit Log Record',
                color: 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
              }
            ].map(item => (
              <div
                key={item.step}
                className={`p-4 rounded-2xl border-2 ${item.color} flex items-start gap-3.5`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center shrink-0 text-sm">
                  {item.step}
                </div>
                <div className="space-y-1 text-right flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className="font-mono text-[11px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md font-semibold">
                      {item.tech}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: مصفوفة الصلاحيات والأمان (RBAC & JWT Security Matrix)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'RBAC' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* JWT Specs Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                آلية التوثيق عبر JWT وتأمين التطبيق
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white mb-1">Access Token (رمز الوصول):</div>
                <p className="text-slate-500">
                  مشفر بخوارزمية HS256 / RS256 مع مدة صلاحية قصيرة (15-60 دقيقة). يحتوي على `sub` (User ID) و `role` و `circle_ids`.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white mb-1">Refresh Token (رمز التجديد):</div>
                <p className="text-slate-500">
                  صلاحية طويلة (7-30 يوماً) مخزن في كوكيز آمنة `HttpOnly` لتجديد الجلسة دون مقاطعة المعلم أثناء التسميع.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white mb-1">حماية التشفير والكلمات:</div>
                <p className="text-slate-500">
                  تشفير كلمات المرور باستخدام `bcrypt` مع Salt Rounds = 12 لمنع أي هجمات Rainbow Table.
                </p>
              </div>
            </div>
          </div>

          {/* RBAC Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                مصفوفة صلاحيات الأدوار (RBAC Permission Matrix)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">الصلاحية / الإجراء</th>
                    <th className="p-3 text-center text-rose-700">مدير النظام (Admin)</th>
                    <th className="p-3 text-center text-purple-700">المشرف (Supervisor)</th>
                    <th className="p-3 text-center text-blue-700">المعلم (Teacher)</th>
                    <th className="p-3 text-center text-emerald-700">الطالب / الولي (Student)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {[
                    { action: 'إدارة الدول واللهجات الأساسية', admin: true, sup: false, tch: false, std: false },
                    { action: 'إنشاء وتعديل وتعيين الحلقات القرآنية', admin: true, sup: true, tch: false, std: false },
                    { action: 'إنشاء المستخدمين وتعيين الأدوار (RBAC)', admin: true, sup: false, tch: false, std: false },
                    { action: 'تسجيل وتعديل جلسات التسميع والدرجات', admin: false, sup: false, tch: true, std: false },
                    { action: 'الاطلاع على تقارير المعلمين والحلقات المتابعة', admin: true, sup: true, tch: false, std: false },
                    { action: 'الاطلاع على سجل تسميعه الشخصي وخارطة المصحف', admin: true, sup: true, tch: true, std: true },
                    { action: 'إرسال ملخصات الحفظ عبر واتساب', admin: false, sup: false, tch: true, std: false },
                    { action: 'تصدير التقارير الرسمية (PDF / Excel)', admin: true, sup: true, tch: true, std: false },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold">{row.action}</td>
                      <td className="p-3 text-center">{row.admin ? <span className="text-emerald-600 font-bold">✓ متاح</span> : <span className="text-slate-300">✗</span>}</td>
                      <td className="p-3 text-center">{row.sup ? <span className="text-emerald-600 font-bold">✓ متاح</span> : <span className="text-slate-300">✗</span>}</td>
                      <td className="p-3 text-center">{row.tch ? <span className="text-emerald-600 font-bold">✓ متاح</span> : <span className="text-slate-300">✗</span>}</td>
                      <td className="p-3 text-center">{row.std ? <span className="text-emerald-600 font-bold">✓ متاح</span> : <span className="text-slate-300">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: كود SQL DDL الكامل (PostgreSQL DDL Code)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'DDL' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                كود إنشاء قاعدة بيانات PostgreSQL مع فهارس الأداء العالي
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                جاهز للتنفيذ المباشر على خادم DigitalOcean / Cloud SQL
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed text-left" dir="ltr">
            <pre>{SQL_DDL_CODE}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
