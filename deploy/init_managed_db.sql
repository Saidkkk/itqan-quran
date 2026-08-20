# =========================================================================
# سكربت تهيئة قاعدة بيانات DigitalOcean Managed PostgreSQL
# النطاق: itqan.gizawysystems.com
# =========================================================================

-- تفعيل ملحق UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إنشاء الأنواع المخصصة (ENUMs)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'SUPERVISOR', 'TEACHER', 'STUDENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_type AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grade_rating AS ENUM ('EXCELLENT', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE', 'NOT_MEMORIZED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. جدول الدول
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول اللهجات
CREATE TABLE IF NOT EXISTS dialects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dialects_country_id ON dialects(country_id);

-- 3. جدول المستخدمين (مع دعم التشفير والصلاحيات)
CREATE TABLE IF NOT EXISTS users (
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
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_supervisor ON users(supervisor_id) WHERE role = 'TEACHER';
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 4. جدول الحلقات القرآنية
CREATE TABLE IF NOT EXISTS halaqat (
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
CREATE INDEX IF NOT EXISTS idx_halaqat_teacher ON halaqat(teacher_id);
CREATE INDEX IF NOT EXISTS idx_halaqat_supervisor ON halaqat(supervisor_id);

-- 5. جدول تسجيل الطلاب بالحلقات
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID NOT NULL REFERENCES halaqat(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    enrolled_at DATE DEFAULT CURRENT_DATE,
    CONSTRAINT uq_student_circle UNIQUE (student_id, circle_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_circle ON student_enrollments(circle_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON student_enrollments(student_id);

-- 6. جدول الجلسات اليومية
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID NOT NULL REFERENCES halaqat(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_circle_session_date UNIQUE (circle_id, session_date)
);
CREATE INDEX IF NOT EXISTS idx_sessions_circle_date ON sessions(circle_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher_date ON sessions(teacher_id, session_date DESC);

-- 7. جدول تفاصيل التسميع والدرجات والحضور
CREATE TABLE IF NOT EXISTS session_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance attendance_type NOT NULL DEFAULT 'PRESENT',
    
    -- الحفظ الجديد
    new_memo_enabled BOOLEAN DEFAULT TRUE,
    new_from_surah INTEGER CHECK (new_from_surah BETWEEN 1 AND 114),
    new_from_ayah INTEGER,
    new_to_surah INTEGER CHECK (new_to_surah BETWEEN 1 AND 114),
    new_to_ayah INTEGER,
    new_grade grade_rating DEFAULT 'EXCELLENT',
    new_score NUMERIC(5, 2) DEFAULT 95.0,
    new_mistakes INTEGER DEFAULT 0,
    new_hesitations INTEGER DEFAULT 0,
    
    -- مراجعة القريب
    near_rev_enabled BOOLEAN DEFAULT TRUE,
    near_from_surah INTEGER,
    near_from_ayah INTEGER,
    near_to_surah INTEGER,
    near_to_ayah INTEGER,
    near_grade grade_rating DEFAULT 'EXCELLENT',
    near_mistakes INTEGER DEFAULT 0,
    
    -- مراجعة البعيد
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
CREATE INDEX IF NOT EXISTS idx_eval_session ON session_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_eval_student_performance ON session_evaluations(student_id, created_at DESC);

-- بيانات أولية تجريبية للتشغيل الفوري (Seed Data)
INSERT INTO countries (id, name_ar, name_en, code)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'المملكة العربية السعودية', 'Saudi Arabia', 'SA'),
    ('22222222-2222-2222-2222-222222222222', 'جمهورية مصر العربية', 'Egypt', 'EG'),
    ('33333333-3333-3333-3333-333333333333', 'دولة الكويت', 'Kuwait', 'KW')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dialects (id, country_id, name, code, description)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'الحجازية', 'hejaz', 'منطقة مكة المكرمة والمدينة المنورة وجدة'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'النجدية', 'najd', 'منطقة الرياض والقصيم وحائل'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'القاهرية', 'cairo', 'القاهرة الكبرى والوجه البحري')
ON CONFLICT DO NOTHING;

-- حساب افتراضي لمدير النظام Admin (كلمة المرور الافتراضية: Admin123!456)
INSERT INTO users (id, name, phone, email, password_hash, role, country_id, dialect_id, is_active)
VALUES (
    '99999999-9999-9999-9999-999999999999',
    'مدير نظام إتقان',
    '+966500000000',
    'admin@gizawysystems.com',
    '$2b$12$e8x/y8vL3aF4Vn9Z6E0M.uA91kM2oO3pQ4rS5tU6vW7xY8z0A1B2C', -- bcrypt hash
    'ADMIN',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    TRUE
)
ON CONFLICT (phone) DO NOTHING;
