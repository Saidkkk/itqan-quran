import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Code, 
  Copy, 
  Download, 
  FileCode, 
  Play, 
  Send, 
  Server, 
  Terminal 
} from 'lucide-react';

export const SwaggerApiDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SWAGGER' | 'SQLALCHEMY' | 'FASTAPI' | 'NICEGUI' | 'DOCKER'>('SWAGGER');
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>('post-session');
  const [simulatedResponse, setSimulatedResponse] = useState<{ id: string; status: number; body: string } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const API_ENDPOINTS = [
    {
      id: 'post-login',
      method: 'POST',
      path: '/api/v1/auth/login',
      title: 'تسجيل الدخول وإصدار رمز JWT (OAuth2 Password Bearer)',
      role: 'PUBLIC',
      summary: 'يستقبل رقم الهاتف وكلمة المرور ويعيد Access Token + Refresh Token',
      requestBody: {
        phone: "+966504445566",
        password: "secure_password_123"
      },
      responseBody: {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        token_type: "bearer",
        expires_in: 3600,
        user: {
          id: "usr-tch-1",
          name: "الشيخ محمود بن خليل الحافظ",
          role: "TEACHER",
          phone: "+966504445566"
        }
      }
    },
    {
      id: 'post-session',
      method: 'POST',
      path: '/api/v1/sessions',
      title: 'تسجيل واعتماد جلسة حلقة (حفظ ومراجعة وحضور)',
      role: 'TEACHER ONLY',
      summary: 'واجهة المعلم السريعة لتسجيل حضور ودرجات جميع طلاب الحلقة بضغطة واحدة',
      requestBody: {
        circle_id: "hlq-nafe-1",
        session_date: "2026-08-19",
        status: "COMPLETED",
        notes: "تسميع سورة الملك ومراجعة سورة النبأ",
        evaluations: [
          {
            student_id: "usr-std-1",
            attendance: "PRESENT",
            new_memorization: {
              enabled: true,
              from_surah: 67,
              from_ayah: 1,
              to_surah: 67,
              to_ayah: 15,
              grade: "EXCELLENT",
              numeric_score: 98,
              mistakes_count: 0,
              hesitations_count: 1
            },
            near_revision: {
              enabled: true,
              from_surah: 68,
              from_ayah: 1,
              to_surah: 68,
              to_ayah: 20,
              grade: "EXCELLENT",
              numeric_score: 95
            },
            points_earned: 25
          }
        ]
      },
      responseBody: {
        status: "success",
        message: "تم حفظ واعتماد الجلسة بنجاح وتحديث خارطة المصحف للطلاب",
        session_id: "ses-2026-08-19-1",
        students_evaluated: 5,
        total_points_distributed: 90
      }
    },
    {
      id: 'get-student-report',
      method: 'GET',
      path: '/api/v1/reports/students/{student_id}',
      title: 'تقرير أداء الطالب وخارطة المصحف الشريف',
      role: 'STUDENT / TEACHER / SUPERVISOR / ADMIN',
      summary: 'يعيد نسبة الحضور، معدل الدرجات، السور المحفوظة، وسجل الجلسات',
      requestBody: null,
      responseBody: {
        student_id: "usr-std-1",
        student_name: "عمر بن عبد العزيز الحربي",
        attendance_rate: 96.5,
        memorized_juz_count: 3,
        total_memorized_ayahs: 620,
        average_grade: 97.4,
        total_points: 340,
        recent_sessions_count: 12
      }
    },
    {
      id: 'get-circles',
      method: 'GET',
      path: '/api/v1/halaqat',
      title: 'استرجاع قائمة الحلقات القرآنية (مفلترة بالصلاحيات)',
      role: 'AUTHENTICATED',
      summary: 'المعلم يرى حلقاته فقط، المشرف يرى حلقات قطاعه، والمدير يرى الجميع',
      requestBody: null,
      responseBody: [
        {
          id: "hlq-nafe-1",
          name: "حلقة الإمام نافع المدني",
          teacher_name: "الشيخ محمود بن خليل الحافظ",
          students_count: 12,
          level: "متوسط"
        }
      ]
    }
  ];

  const SQLALCHEMY_CODE = `# ==========================================================
# models.py - SQLAlchemy 2.0 & SQLModel Database Models
# ==========================================================
from datetime import date, datetime
from typing import Optional, List
from enum import Enum
import uuid
from sqlalchemy import (
    Column, String, Boolean, Integer, Numeric, Date,
    DateTime, ForeignKey, Text, Enum as SQLEnum, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SUPERVISOR = "SUPERVISOR"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"

class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"

class GradeRating(str, Enum):
    EXCELLENT = "EXCELLENT"
    VERY_GOOD = "VERY_GOOD"
    GOOD = "GOOD"
    ACCEPTABLE = "ACCEPTABLE"
    NOT_MEMORIZED = "NOT_MEMORIZED"

class Country(Base):
    __tablename__ = "countries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_ar = Column(String(100), nullable=False)
    name_en = Column(String(100))
    code = Column(String(10), unique=True, nullable=False)
    
    dialects = relationship("Dialect", back_populates="country", cascade="all, delete-orphan")
    users = relationship("User", back_populates="country")

class Dialect(Base):
    __tablename__ = "dialects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_id = Column(UUID(as_uuid=True), ForeignKey("countries.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(Text)
    
    country = relationship("Country", back_populates="dialects")

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    phone = Column(String(25), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.STUDENT, index=True)
    
    country_id = Column(UUID(as_uuid=True), ForeignKey("countries.id", ondelete="SET NULL"))
    dialect_id = Column(UUID(as_uuid=True), ForeignKey("dialects.id", ondelete="SET NULL"))
    supervisor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    country = relationship("Country", back_populates="users")
    supervised_teachers = relationship("User", backref="supervisor", remote_side=[id])

class Halaqah(Base):
    __tablename__ = "halaqat"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    supervisor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    target_juz = Column(Integer, default=3)
    level = Column(String(50), default="متوسط")
    schedule_days = Column(ARRAY(String), default=["الأحد", "الثلاثاء", "الخميس"])
    time_slot = Column(String(100))
    is_active = Column(Boolean, default=True)

class Session(Base):
    __tablename__ = "sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    circle_id = Column(UUID(as_uuid=True), ForeignKey("halaqat.id", ondelete="CASCADE"), nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    session_date = Column(Date, nullable=False, index=True)
    status = Column(String(20), default="COMPLETED")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    evaluations = relationship("SessionEvaluation", back_populates="session", cascade="all, delete-orphan")

class SessionEvaluation(Base):
    __tablename__ = "session_evaluations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance = Column(SQLEnum(AttendanceStatus), nullable=False, default=AttendanceStatus.PRESENT)
    
    # الحفظ الجديد
    new_memo_enabled = Column(Boolean, default=True)
    new_from_surah = Column(Integer)
    new_from_ayah = Column(Integer)
    new_to_surah = Column(Integer)
    new_to_ayah = Column(Integer)
    new_grade = Column(SQLEnum(GradeRating), default=GradeRating.EXCELLENT)
    new_score = Column(Numeric(5, 2), default=95.0)
    new_mistakes = Column(Integer, default=0)
    new_hesitations = Column(Integer, default=0)
    
    # مراجعة القريب
    near_rev_enabled = Column(Boolean, default=True)
    near_from_surah = Column(Integer)
    near_to_surah = Column(Integer)
    near_grade = Column(SQLEnum(GradeRating))
    
    # مراجعة البعيد
    far_rev_enabled = Column(Boolean, default=False)
    far_from_surah = Column(Integer)
    far_to_surah = Column(Integer)
    far_grade = Column(SQLEnum(GradeRating))
    
    points_earned = Column(Integer, default=25)
    notes = Column(Text)
    
    session = relationship("Session", back_populates="evaluations")
`;

  const FASTAPI_CODE = `# ==========================================================
# main_fastapi.py - FastAPI Backend with JWT & RBAC
# ==========================================================
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

SECRET_KEY = "ITQAN_QURAN_SUPER_SECURE_JWT_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

app = FastAPI(
    title="إتقان | Quran Memorization Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ----------------- RBAC Dependencies -----------------
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_id, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك الصلاحية الكافية للوصول لهذا المورد"
            )
        return current_user
    return role_checker

# ----------------- Routes -----------------
@app.post("/api/v1/sessions", tags=["Teacher Sessions"])
async def record_circle_session(
    session_data: dict,
    user: dict = Depends(require_role(["TEACHER", "ADMIN"]))
):
    """
    تسجيل جلسة الحلقة بواسطة المعلم مع حفظ درجات الحضور والتسميع
    """
    return {
        "status": "success",
        "message": "تم حفظ وتوثيق الجلسة بنجاح",
        "recorded_by": user["id"],
        "timestamp": datetime.utcnow()
    }

@app.get("/api/v1/reports/students/{student_id}", tags=["Reports"])
async def get_student_report(
    student_id: str,
    user: dict = Depends(get_current_user)
):
    """
    استرجاع تقرير أداء الطالب وخارطة المصحف الشريف
    """
    return {
        "student_id": student_id,
        "attendance_rate": 96.5,
        "memorized_juz": 3,
        "total_points": 340
    }
`;

  const NICEGUI_CODE = `# ==========================================================
# main_nicegui.py - Complete Python NiceGUI Mobile UI
# ==========================================================
from nicegui import ui, app
import httpx

# Theme Styling
ui.add_head_html('''
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&family=Amiri+Quran&display=swap');
  body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; }
  .font-quran { font-family: 'Amiri Quran', serif; }
</style>
''')

@ui.page('/')
def index_page():
    with ui.column().classes('w-full max-w-lg mx-auto p-4 gap-4'):
        # Header
        with ui.card().classes('w-full bg-emerald-700 text-white rounded-2xl p-4 shadow-lg'):
            ui.label('🌿 منصة إتقان لتحفيظ القرآن').classes('text-lg font-bold')
            ui.label('واجهة المعلم السريعة للجوال').classes('text-xs opacity-80')

        # Circle Selector
        with ui.row().classes('w-full items-center justify-between'):
            ui.select(
                options=['حلقة الإمام نافع', 'حلقة الإمام عاصم', 'حلقة ابن كثير'],
                value='حلقة الإمام نافع'
            ).classes('flex-1 rounded-xl')
            ui.input(type='date', value='2026-08-19').classes('w-36')

        # Fast Student Attendance Card
        students = [
            {'name': 'عمر بن عبد العزيز الحربي', 'surah': 'سورة الملك (1-15)'},
            {'name': 'عبد الله بن أحمد السبيعي', 'surah': 'سورة النبأ (1-20)'},
            {'name': 'يوسف بن طارق المنصوري', 'surah': 'سورة نوح (1-15)'}
        ]

        for s in students:
            with ui.card().classes('w-full border rounded-2xl p-3 shadow-sm'):
                with ui.row().classes('w-full items-center justify-between'):
                    ui.label(s['name']).classes('font-bold text-sm')
                    with ui.row().classes('gap-1'):
                        ui.button('حاضر ✓', color='emerald').props('dense rounded')
                        ui.button('غائب ✗', color='rose').props('dense flat rounded')

                ui.label(f"📖 الحفظ المقرر: {s['surah']}").classes('text-xs text-slate-500 font-quran mt-1')

                with ui.row().classes('w-full gap-1 mt-2'):
                    ui.button('ممتاز 🌟', color='emerald').props('dense outline')
                    ui.button('جيد جداً', color='teal').props('dense outline')
                    ui.button('جيد', color='blue').props('dense outline')

        ui.button('💾 حفظ واعتماد درجات الجلسة', color='emerald').classes('w-full py-3 text-base font-bold rounded-xl shadow-md')

ui.run(port=3000, title="إتقان | NiceGUI", reload=False)
`;

  const DOCKER_CODE = `# ==========================================================
# Dockerfile - DigitalOcean Droplet Deployment
# ==========================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2 and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose HTTP port
EXPOSE 3000

# Run with Gunicorn + Uvicorn workers for production speed
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:3000", "main_fastapi:app"]

# ----------------------------------------------------------
# docker-compose.yml
# ----------------------------------------------------------
# version: '3.8'
# services:
#   db:
#     image: postgres:15-alpine
#     environment:
#       POSTGRES_DB: itqan_quran_db
#       POSTGRES_USER: itqan_user
#       POSTGRES_PASSWORD: StrongPassword_123!
#     volumes:
#       - postgres_data:/var/lib/postgresql/data
#     ports:
#       - "5432:5432"
#
#   app:
#     build: .
#     ports:
#       - "3000:3000"
#     environment:
#       DATABASE_URL: postgresql://itqan_user:StrongPassword_123!@db:5432/itqan_quran_db
#       SECRET_KEY: Production_Super_Secret_Key_Here
#     depends_on:
#       - db
#
# volumes:
#   postgres_data:
`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              التوثيق البرمجي وواجهات Swagger & Python
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            واجهات Swagger التفاعلية، كود SQLAlchemy & FastAPI & NiceGUI، وإعدادات النشر على DigitalOcean
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('SWAGGER')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'SWAGGER' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Swagger API
          </button>
          <button
            onClick={() => setActiveTab('SQLALCHEMY')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'SQLALCHEMY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            SQLAlchemy
          </button>
          <button
            onClick={() => setActiveTab('FASTAPI')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'FASTAPI' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            FastAPI
          </button>
          <button
            onClick={() => setActiveTab('NICEGUI')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'NICEGUI' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            NiceGUI Python
          </button>
          <button
            onClick={() => setActiveTab('DOCKER')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'DOCKER' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Docker & Deploy
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: تفاعلي Swagger UI Explorer
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'SWAGGER' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-4 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">OAS 3.0</span>
              <span className="font-bold text-emerald-900 dark:text-emerald-200">
                توثيق Swagger التفاعلي للـ API — يمكنك اختبار الاستجابات الحية بنقرة واحدة
              </span>
            </div>
            <span className="font-mono text-emerald-700 dark:text-emerald-300">Base URL: https://api.itqan.org/v1</span>
          </div>

          <div className="space-y-3">
            {API_ENDPOINTS.map(ep => {
              const isExp = expandedEndpoint === ep.id;
              const methodColor = ep.method === 'POST'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white';

              return (
                <div
                  key={ep.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  <div
                    onClick={() => setExpandedEndpoint(isExp ? null : ep.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${methodColor}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200" dir="ltr">
                        {ep.path}
                      </span>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        • {ep.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {ep.role}
                      </span>
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExp && (
                    <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-right">
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        {ep.summary}
                      </p>

                      {ep.requestBody && (
                        <div>
                          <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Request Body (JSON Payload):
                          </div>
                          <div className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-[11px] text-left" dir="ltr">
                            <pre>{JSON.stringify(ep.requestBody, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Response 200 OK (Expected Output):
                          </span>
                          <button
                            onClick={() => {
                              setSimulatedResponse({
                                id: ep.id,
                                status: 200,
                                body: JSON.stringify(ep.responseBody, null, 2)
                              });
                            }}
                            className="flex items-center gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold transition"
                          >
                            <Play className="w-3 h-3" />
                            <span>تجربة واستدعاء مباشر (Try it out)</span>
                          </button>
                        </div>

                        <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] text-left" dir="ltr">
                          <pre>{JSON.stringify(ep.responseBody, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CODE VIEWER TABS
      ───────────────────────────────────────────────────────────── */}
      {activeTab !== 'SWAGGER' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>
                {activeTab === 'SQLALCHEMY' && 'نماذج SQLAlchemy 2.0 & SQLModel'}
                {activeTab === 'FASTAPI' && 'تطبيق FastAPI مع JWT & RBAC Middleware'}
                {activeTab === 'NICEGUI' && 'تطبيق Python NiceGUI الجوال الكامل'}
                {activeTab === 'DOCKER' && 'ملفات Docker & Docker Compose للنشر السحابي'}
              </span>
            </h3>

            <button
              onClick={() => {
                let code = SQLALCHEMY_CODE;
                if (activeTab === 'FASTAPI') code = FASTAPI_CODE;
                if (activeTab === 'NICEGUI') code = NICEGUI_CODE;
                if (activeTab === 'DOCKER') code = DOCKER_CODE;
                copyToClipboard(code);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed text-left" dir="ltr">
            <pre>
              {activeTab === 'SQLALCHEMY' && SQLALCHEMY_CODE}
              {activeTab === 'FASTAPI' && FASTAPI_CODE}
              {activeTab === 'NICEGUI' && NICEGUI_CODE}
              {activeTab === 'DOCKER' && DOCKER_CODE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
