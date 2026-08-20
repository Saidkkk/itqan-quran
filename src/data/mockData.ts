import { Country, Halaqah, HalaqahSession, StudentEnrollment, User } from '../types';

export const INITIAL_COUNTRIES: Country[] = [
  {
    id: 'cnt-sa',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    code: 'SA',
    dialects: [
      { id: 'dia-sa-hijazi', name: 'الحجازية', code: 'hijazi', countryId: 'cnt-sa', description: 'لهجة المنطقة الغربية (مكة المكرمة والمدينة المنورة وجدة)' },
      { id: 'dia-sa-najdi', name: 'النجدية', code: 'najdi', countryId: 'cnt-sa', description: 'لهجة المنطقة الوسطى' },
      { id: 'dia-sa-eastern', name: 'الشرقية', code: 'eastern', countryId: 'cnt-sa', description: 'لهجة المنطقة الشرقية' },
      { id: 'dia-sa-southern', name: 'الجنوبية', code: 'southern', countryId: 'cnt-sa', description: 'لهجة عسير وجازان ونجران' },
    ]
  },
  {
    id: 'cnt-eg',
    nameAr: 'جمهورية مصر العربية',
    nameEn: 'Egypt',
    code: 'EG',
    dialects: [
      { id: 'dia-eg-cairo', name: 'القاهرية / الوجه البحري', code: 'cairo', countryId: 'cnt-eg', description: 'اللهجة المصرية العامة' },
      { id: 'dia-eg-saidi', name: 'الصعيدية', code: 'saidi', countryId: 'cnt-eg', description: 'لهجة صعيد مصر' },
      { id: 'dia-eg-alex', name: 'السكندرية', code: 'alex', countryId: 'cnt-eg', description: 'لهجة الإسكندرية والساحل' },
    ]
  },
  {
    id: 'cnt-ma',
    nameAr: 'المملكة المغربية',
    nameEn: 'Morocco',
    code: 'MA',
    dialects: [
      { id: 'dia-ma-darija', name: 'الدارجة المغربية', code: 'darija', countryId: 'cnt-ma', description: 'اللهجة المغربية الشائعة' },
      { id: 'dia-ma-chamal', name: 'الشمالية (طنجة وتطوان)', code: 'chamali', countryId: 'cnt-ma', description: 'لهجة الشمال' },
      { id: 'dia-ma-soussi', name: 'السوسية / الأمازيغية', code: 'soussi', countryId: 'cnt-ma', description: 'لهجة منطقة سوس' },
    ]
  },
  {
    id: 'cnt-jo',
    nameAr: 'المملكة الأردنية الهاشمية',
    nameEn: 'Jordan',
    code: 'JO',
    dialects: [
      { id: 'dia-jo-ammani', name: 'العمانية / المدنية', code: 'ammani', countryId: 'cnt-jo', description: 'لهجة العاصمة والمدن' },
      { id: 'dia-jo-badawi', name: 'البدوية', code: 'badawi', countryId: 'cnt-jo', description: 'لهجة البادية' },
      { id: 'dia-jo-falahi', name: 'الفلاحية / الريفية', code: 'falahi', countryId: 'cnt-jo', description: 'لهجة قرى الشمال والوسط' },
    ]
  },
  {
    id: 'cnt-ae',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    code: 'AE',
    dialects: [
      { id: 'dia-ae-emirati', name: 'الإماراتية الأصيلة', code: 'emirati', countryId: 'cnt-ae', description: 'لهجة أهل الإمارات والخليج' },
    ]
  }
];

export const INITIAL_USERS: User[] = [
  // Admin
  {
    id: 'usr-admin-1',
    name: 'الشيخ عبد الله بن فهد المنصور',
    email: 'admin@itqan-quran.org',
    phone: '+966501112233',
    role: 'ADMIN',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-najdi',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-01-10',
    notes: 'المشرف العام ومدير النظام المركزي'
  },
  // Supervisors
  {
    id: 'usr-sup-1',
    name: 'الشيخ د. عثمان الشنقيطي',
    email: 'othman.sh@itqan-quran.org',
    phone: '+966502223344',
    role: 'SUPERVISOR',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-hijazi',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-01-12',
    notes: 'مشرف حلقات قطاع مكة المكرمة وجدة'
  },
  {
    id: 'usr-sup-2',
    name: 'الشيخ أحمد مصطفى المعصراوي',
    email: 'maasarawi@itqan-quran.org',
    phone: '+201003334455',
    role: 'SUPERVISOR',
    countryId: 'cnt-eg',
    dialectId: 'dia-eg-cairo',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-01-15',
    notes: 'مشرف حلقات الإتقان والإجازات بالسند'
  },
  // Teachers
  {
    id: 'usr-tch-1',
    name: 'الشيخ محمود بن خليل الحافظ',
    email: 'mahmoud.khalil@itqan-quran.org',
    phone: '+966504445566',
    role: 'TEACHER',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-hijazi',
    supervisorId: 'usr-sup-1',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-01',
    notes: 'معلم حلقة الإمام عاصم وحلقة الإمام نافع'
  },
  {
    id: 'usr-tch-2',
    name: 'الشيخ إبراهيم الدوسري',
    email: 'ibrahim.d@itqan-quran.org',
    phone: '+966505556677',
    role: 'TEACHER',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-najdi',
    supervisorId: 'usr-sup-1',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-05',
    notes: 'معلم حلقة الإمام ابن كثير'
  },
  {
    id: 'usr-tch-3',
    name: 'الشيخ حمزة بن عبد الله التازي',
    email: 'hamza.tazi@itqan-quran.org',
    phone: '+212606667788',
    role: 'TEACHER',
    countryId: 'cnt-ma',
    dialectId: 'dia-ma-darija',
    supervisorId: 'usr-sup-2',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-10',
    notes: 'معلم حلقة الإمام ورش وقالون'
  },
  // Students
  {
    id: 'usr-std-1',
    name: 'عمر بن عبد العزيز الحربي',
    email: 'omar.harbi@student.itqan.org',
    phone: '+966551122331',
    role: 'STUDENT',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-hijazi',
    teacherId: 'usr-tch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-15',
    currentJuz: 28,
    currentSurah: 67, // Al-Mulk
    totalMemorizedAyahs: 620,
    notes: 'طالب متميز وسريع الحفظ وملتزم بالحضور'
  },
  {
    id: 'usr-std-2',
    name: 'عبد الله بن أحمد السبيعي',
    email: 'abdullah.ahmed@student.itqan.org',
    phone: '+966551122332',
    role: 'STUDENT',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-najdi',
    teacherId: 'usr-tch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-16',
    currentJuz: 30,
    currentSurah: 78, // An-Naba
    totalMemorizedAyahs: 450,
    notes: 'يحتاج لمزيد من المراجعة البعيدة وضبط الإدغام'
  },
  {
    id: 'usr-std-3',
    name: 'يوسف بن طارق المنصوري',
    email: 'youssef.m@student.itqan.org',
    phone: '+971501122333',
    role: 'STUDENT',
    countryId: 'cnt-ae',
    dialectId: 'dia-ae-emirati',
    teacherId: 'usr-tch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-18',
    currentJuz: 29,
    currentSurah: 71, // Nuh
    totalMemorizedAyahs: 510,
    notes: 'صوت جميل وحسن الأداء'
  },
  {
    id: 'usr-std-4',
    name: 'معاذ بن صالح الزهراني',
    email: 'muadh.z@student.itqan.org',
    phone: '+966551122334',
    role: 'STUDENT',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-southern',
    teacherId: 'usr-tch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-20',
    currentJuz: 28,
    currentSurah: 62, // Al-Jumu'ah
    totalMemorizedAyahs: 730,
    notes: 'أنهى جزء عمّ وتبارك بتقدير ممتاز'
  },
  {
    id: 'usr-std-5',
    name: 'حمزة بن علي الشريف',
    email: 'hamza.ali@student.itqan.org',
    phone: '+966551122335',
    role: 'STUDENT',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-hijazi',
    teacherId: 'usr-tch-1',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-22',
    currentJuz: 30,
    currentSurah: 85, // Al-Buruj
    totalMemorizedAyahs: 280,
    notes: 'طالب في حلقة الإمام عاصم أيضاً'
  },
  {
    id: 'usr-std-6',
    name: 'أنس بن محمد القحطاني',
    email: 'anas.q@student.itqan.org',
    phone: '+966551122336',
    role: 'STUDENT',
    countryId: 'cnt-sa',
    dialectId: 'dia-sa-najdi',
    teacherId: 'usr-tch-2',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2025-02-25',
    currentJuz: 30,
    currentSurah: 93, // Ad-Duha
    totalMemorizedAyahs: 190,
    notes: 'مستمر في حلقة ابن كثير'
  }
];

export const INITIAL_HALAQAT: Halaqah[] = [
  {
    id: 'hlq-nafe-1',
    name: 'حلقة الإمام نافع المدني',
    code: 'HLQ-NAF-01',
    description: 'حلقة مخصصة لحفظ وضبط جزء عمّ وتبارك مع أحكام التجويد الأساسية',
    teacherId: 'usr-tch-1',
    supervisorId: 'usr-sup-1',
    scheduleDays: ['الأحد', 'الثلاثاء', 'الخميس'],
    timeSlot: 'بعد صلاة العصر (4:30 - 6:00 م)',
    targetJuz: 2,
    level: 'متوسط',
    maxStudents: 15,
    isActive: true,
    createdAt: '2025-02-01'
  },
  {
    id: 'hlq-asim-2',
    name: 'حلقة الإمام عاصم بن أبي النجود',
    code: 'HLQ-ASM-02',
    description: 'حلقة الإتقان والختمات برواية حفص عن عاصم من طريق الشاطبية',
    teacherId: 'usr-tch-1',
    supervisorId: 'usr-sup-1',
    scheduleDays: ['السبت', 'الاثنين', 'الأربعاء'],
    timeSlot: 'بعد صلاة المغرب (6:45 - 8:15 م)',
    targetJuz: 5,
    level: 'متقدم',
    maxStudents: 12,
    isActive: true,
    createdAt: '2025-02-05'
  },
  {
    id: 'hlq-kathir-3',
    name: 'حلقة الإمام ابن كثير المكي',
    code: 'HLQ-KTH-03',
    description: 'حلقة البراعم والناشئة لتحفيظ قصار السور والتلقين السليم',
    teacherId: 'usr-tch-2',
    supervisorId: 'usr-sup-1',
    scheduleDays: ['الأحد', 'الثلاثاء', 'الخميس'],
    timeSlot: 'بعد صلاة العصر (4:00 - 5:15 م)',
    targetJuz: 1,
    level: 'مبتدئ',
    maxStudents: 18,
    isActive: true,
    createdAt: '2025-02-08'
  },
  {
    id: 'hlq-qaloon-4',
    name: 'حلقة الإمام قالون ورواية ورش',
    code: 'HLQ-QLN-04',
    description: 'حلقة المغاربة لإتقان روايتي قالون وورش وتثبيت المتون',
    teacherId: 'usr-tch-3',
    supervisorId: 'usr-sup-2',
    scheduleDays: ['السبت', 'الثلاثاء', 'الجمعة'],
    timeSlot: 'بعد صلاة العشاء (8:30 - 10:00 م)',
    targetJuz: 10,
    level: 'إجازة وإتقان',
    maxStudents: 10,
    isActive: true,
    createdAt: '2025-02-12'
  }
];

export const INITIAL_ENROLLMENTS: StudentEnrollment[] = [
  { id: 'enr-1', circleId: 'hlq-nafe-1', studentId: 'usr-std-1', enrolledAt: '2025-02-15', status: 'ACTIVE' },
  { id: 'enr-2', circleId: 'hlq-nafe-1', studentId: 'usr-std-2', enrolledAt: '2025-02-16', status: 'ACTIVE' },
  { id: 'enr-3', circleId: 'hlq-nafe-1', studentId: 'usr-std-3', enrolledAt: '2025-02-18', status: 'ACTIVE' },
  { id: 'enr-4', circleId: 'hlq-nafe-1', studentId: 'usr-std-4', enrolledAt: '2025-02-20', status: 'ACTIVE' },
  { id: 'enr-5', circleId: 'hlq-nafe-1', studentId: 'usr-std-5', enrolledAt: '2025-02-22', status: 'ACTIVE' },
  // Student 5 also in circle 2 (multi-circle enrollment)
  { id: 'enr-6', circleId: 'hlq-asim-2', studentId: 'usr-std-5', enrolledAt: '2025-02-22', status: 'ACTIVE' },
  { id: 'enr-7', circleId: 'hlq-asim-2', studentId: 'usr-std-1', enrolledAt: '2025-02-22', status: 'ACTIVE' },
  { id: 'enr-8', circleId: 'hlq-kathir-3', studentId: 'usr-std-6', enrolledAt: '2025-02-25', status: 'ACTIVE' },
];

export const INITIAL_SESSIONS: HalaqahSession[] = [
  {
    id: 'ses-2026-08-19-1',
    circleId: 'hlq-nafe-1',
    teacherId: 'usr-tch-1',
    date: '2026-08-19',
    status: 'COMPLETED',
    notes: 'جلسة اليوم الصباحية: تسميع سورة الملك ومراجعة سورة النبأ والنازعات',
    evaluations: {
      'usr-std-1': {
        id: 'eval-1',
        sessionId: 'ses-2026-08-19-1',
        studentId: 'usr-std-1',
        attendance: 'PRESENT',
        newMemorization: {
          enabled: true,
          fromSurah: 67, // Al-Mulk
          fromAyah: 1,
          toSurah: 67,
          toAyah: 15,
          grade: 'EXCELLENT',
          numericScore: 98,
          mistakesCount: 0,
          hesitationsCount: 1,
          tajweedRating: 'ممتاز',
          notes: 'حفظ متقن ومخارج حروف سليمة'
        },
        nearRevision: {
          enabled: true,
          fromSurah: 68, // Al-Qalam
          fromAyah: 1,
          toSurah: 68,
          toAyah: 20,
          grade: 'EXCELLENT',
          numericScore: 95,
          mistakesCount: 0,
          hesitationsCount: 2
        },
        farRevision: {
          enabled: true,
          fromSurah: 78, // An-Naba
          fromAyah: 1,
          toSurah: 79,
          toAyah: 46,
          grade: 'VERY_GOOD',
          numericScore: 90,
          mistakesCount: 1,
          hesitationsCount: 3
        },
        pointsEarned: 25,
        recordedAt: '2026-08-19T10:00:00Z',
        generalNotes: 'ما شاء الله تبارك الله، تميز واضح في التسميع'
      },
      'usr-std-2': {
        id: 'eval-2',
        sessionId: 'ses-2026-08-19-1',
        studentId: 'usr-std-2',
        attendance: 'PRESENT',
        newMemorization: {
          enabled: true,
          fromSurah: 78,
          fromAyah: 1,
          toSurah: 78,
          toAyah: 20,
          grade: 'GOOD',
          numericScore: 82,
          mistakesCount: 2,
          hesitationsCount: 4,
          tajweedRating: 'جيد',
          notes: 'تنبيه على أحكام النون الساكنة والتنوين'
        },
        nearRevision: {
          enabled: true,
          fromSurah: 79,
          fromAyah: 1,
          toSurah: 79,
          toAyah: 15,
          grade: 'GOOD',
          numericScore: 80,
          mistakesCount: 3,
          hesitationsCount: 2
        },
        farRevision: {
          enabled: false,
          fromSurah: 80,
          fromAyah: 1,
          toSurah: 80,
          toAyah: 20,
          grade: 'NOT_MEMORIZED',
          numericScore: 0,
          mistakesCount: 0,
          hesitationsCount: 0
        },
        pointsEarned: 15,
        recordedAt: '2026-08-19T10:15:00Z',
        generalNotes: 'تم التوجيه بالاستماع للشيخ الحصري لتثبيت الترتيل'
      },
      'usr-std-3': {
        id: 'eval-3',
        sessionId: 'ses-2026-08-19-1',
        studentId: 'usr-std-3',
        attendance: 'LATE',
        newMemorization: {
          enabled: true,
          fromSurah: 71,
          fromAyah: 1,
          toSurah: 71,
          toAyah: 15,
          grade: 'VERY_GOOD',
          numericScore: 88,
          mistakesCount: 1,
          hesitationsCount: 2,
          tajweedRating: 'ممتاز'
        },
        nearRevision: {
          enabled: true,
          fromSurah: 72,
          fromAyah: 1,
          toSurah: 72,
          toAyah: 12,
          grade: 'EXCELLENT',
          numericScore: 95,
          mistakesCount: 0,
          hesitationsCount: 1
        },
        farRevision: {
          enabled: true,
          fromSurah: 85,
          fromAyah: 1,
          toSurah: 86,
          toAyah: 17,
          grade: 'VERY_GOOD',
          numericScore: 89,
          mistakesCount: 1,
          hesitationsCount: 2
        },
        pointsEarned: 20,
        recordedAt: '2026-08-19T10:30:00Z',
        generalNotes: 'حضر متأخراً 15 دقيقة بعذر مقبول'
      },
      'usr-std-4': {
        id: 'eval-4',
        sessionId: 'ses-2026-08-19-1',
        studentId: 'usr-std-4',
        attendance: 'PRESENT',
        newMemorization: {
          enabled: true,
          fromSurah: 62,
          fromAyah: 1,
          toSurah: 62,
          toAyah: 11,
          grade: 'EXCELLENT',
          numericScore: 100,
          mistakesCount: 0,
          hesitationsCount: 0,
          tajweedRating: 'ممتاز',
          notes: 'حفظ تام للسورة كاملة بدون أي خطأ'
        },
        nearRevision: {
          enabled: true,
          fromSurah: 63,
          fromAyah: 1,
          toSurah: 63,
          toAyah: 11,
          grade: 'EXCELLENT',
          numericScore: 98,
          mistakesCount: 0,
          hesitationsCount: 1
        },
        farRevision: {
          enabled: true,
          fromSurah: 80,
          fromAyah: 1,
          toSurah: 82,
          toAyah: 19,
          grade: 'EXCELLENT',
          numericScore: 96,
          mistakesCount: 0,
          hesitationsCount: 2
        },
        pointsEarned: 30,
        recordedAt: '2026-08-19T10:45:00Z',
        generalNotes: 'نال نجمة التميز الأسبوعية'
      },
      'usr-std-5': {
        id: 'eval-5',
        sessionId: 'ses-2026-08-19-1',
        studentId: 'usr-std-5',
        attendance: 'ABSENT',
        newMemorization: {
          enabled: false,
          fromSurah: 85,
          fromAyah: 1,
          toSurah: 85,
          toAyah: 10,
          grade: 'NOT_MEMORIZED',
          numericScore: 0,
          mistakesCount: 0,
          hesitationsCount: 0
        },
        nearRevision: {
          enabled: false,
          fromSurah: 86,
          fromAyah: 1,
          toSurah: 86,
          toAyah: 17,
          grade: 'NOT_MEMORIZED',
          numericScore: 0,
          mistakesCount: 0,
          hesitationsCount: 0
        },
        farRevision: {
          enabled: false,
          fromSurah: 87,
          fromAyah: 1,
          toSurah: 88,
          toAyah: 26,
          grade: 'NOT_MEMORIZED',
          numericScore: 0,
          mistakesCount: 0,
          hesitationsCount: 0
        },
        pointsEarned: 0,
        recordedAt: '2026-08-19T10:50:00Z',
        generalNotes: 'غائب بدون عذر مسبق، تم إرسال إشعار لولي أمره'
      }
    }
  },
  {
    id: 'ses-2026-08-17-1',
    circleId: 'hlq-nafe-1',
    teacherId: 'usr-tch-1',
    date: '2026-08-17',
    status: 'COMPLETED',
    notes: 'جلسة يوم الاثنين: مراجعة عامة وضبط أحكام القلقلة والمدود',
    evaluations: {
      'usr-std-1': {
        id: 'eval-prev-1',
        sessionId: 'ses-2026-08-17-1',
        studentId: 'usr-std-1',
        attendance: 'PRESENT',
        newMemorization: {
          enabled: true,
          fromSurah: 68,
          fromAyah: 1,
          toSurah: 68,
          toAyah: 25,
          grade: 'EXCELLENT',
          numericScore: 96,
          mistakesCount: 0,
          hesitationsCount: 2,
          tajweedRating: 'ممتاز'
        },
        nearRevision: {
          enabled: true,
          fromSurah: 69,
          fromAyah: 1,
          toSurah: 69,
          toAyah: 20,
          grade: 'EXCELLENT',
          numericScore: 94,
          mistakesCount: 1,
          hesitationsCount: 1
        },
        farRevision: {
          enabled: true,
          fromSurah: 83,
          fromAyah: 1,
          toSurah: 84,
          toAyah: 25,
          grade: 'VERY_GOOD',
          numericScore: 91,
          mistakesCount: 1,
          hesitationsCount: 3
        },
        pointsEarned: 24,
        recordedAt: '2026-08-17T16:45:00Z'
      }
    }
  }
];
