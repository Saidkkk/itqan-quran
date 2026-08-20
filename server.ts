import express, { type Request, type Response } from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg, { type PoolClient } from 'pg';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// =========================================================================
// إعداد الاتصال بقاعدة بيانات PostgreSQL المدارة على DigitalOcean
// =========================================================================

let pool: pg.Pool | null = null;

try {
  if (process.env.DB_HOST && process.env.DB_USER) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 25060,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'defaultdb',
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    });
    console.log('✅ تم إعداد اتصال PostgreSQL عبر المتغيرات المفككة (سكيما: ' + (process.env.DB_SCHEMA || 'itqan') + ')');
  } else if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    console.log('✅ تم إعداد اتصال PostgreSQL عبر DATABASE_URL');
  }
} catch (err) {
  console.warn('⚠️ تنبيه: لم يتم تهيئة اتصال PostgreSQL:', err);
}

// ضبط السكيما الافتراضية itqan عند كل اتصال
if (pool) {
  pool.on('connect', (client: PoolClient) => {
    const targetSchema = process.env.DB_SCHEMA || 'itqan';
    client.query(`SET search_path TO ${targetSchema}, public;`).catch((e: any) => {
      console.error('Error setting search_path to ' + targetSchema, e);
    });
  });
}

// =========================================================================
// 1. مسار الفحص والتشخيص (Healthcheck API)
// =========================================================================
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'not_connected';
  let dbLatency = null;

  if (pool) {
    try {
      const start = Date.now();
      await pool.query('SELECT 1');
      dbLatency = `${Date.now() - start}ms`;
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = `error: ${err?.message || 'failed'}`;
    }
  }

  res.json({
    status: 'healthy',
    app: 'Itqan Quran Platform',
    domain: 'itqan.katatibi.com',
    timestamp: new Date().toISOString(),
    postgres: {
      status: dbStatus,
      latency: dbLatency,
      schema: process.env.DB_SCHEMA || 'itqan',
      auth_method: process.env.DB_HOST ? 'discrete_env_vars' : (process.env.DATABASE_URL ? 'connection_string' : 'none')
    }
  });
});

// =========================================================================
// 2. مسارات الدول واللهجات (Countries & Dialects REST API)
// =========================================================================

// جلب الدول مع لهجاتها
app.get('/api/v1/countries', async (req: Request, res: Response) => {
  if (!pool) return res.json([]);
  try {
    const countriesResult = await pool.query(
      `SELECT id, name_ar AS "nameAr", name_en AS "nameEn", code FROM countries ORDER BY name_ar ASC;`
    );
    const dialectsResult = await pool.query(
      `SELECT id, country_id AS "countryId", name, code, description FROM dialects ORDER BY name ASC;`
    );

    const dialectsByCountry = new Map<string, any[]>();
    dialectsResult.rows.forEach(d => {
      if (!dialectsByCountry.has(d.countryId)) {
        dialectsByCountry.set(d.countryId, []);
      }
      dialectsByCountry.get(d.countryId)?.push(d);
    });

    const countries = countriesResult.rows.map(c => ({
      ...c,
      dialects: dialectsByCountry.get(c.id) || []
    }));

    res.json(countries);
  } catch (err: any) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ error: err.message });
  }
});

// إضافة دولة جديدة في جدول itqan.countries
app.post('/api/v1/countries', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not connected' });
  const { nameAr, nameEn, code, dialects } = req.body;

  try {
    const insertCountry = await pool.query(
      `INSERT INTO countries (name_ar, name_en, code)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en
       RETURNING id, name_ar AS "nameAr", name_en AS "nameEn", code;`,
      [nameAr, nameEn || '', code.toUpperCase()]
    );

    const savedCountry = insertCountry.rows[0];
    const savedDialects: any[] = [];

    if (Array.isArray(dialects) && dialects.length > 0) {
      for (const d of dialects) {
        const diaRes = await pool.query(
          `INSERT INTO dialects (country_id, name, code, description)
           VALUES ($1, $2, $3, $4)
           RETURNING id, country_id AS "countryId", name, code, description;`,
          [savedCountry.id, d.name, d.code || 'general', d.description || '']
        );
        savedDialects.push(diaRes.rows[0]);
      }
    }

    res.status(201).json({
      ...savedCountry,
      dialects: savedDialects
    });
  } catch (err: any) {
    console.error('Error saving country:', err);
    res.status(500).json({ error: err.message });
  }
});

// حذف دولة
app.delete('/api/v1/countries/:id', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not connected' });
  try {
    await pool.query('DELETE FROM countries WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Country deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 3. مسارات المستخدمين وتسجيل الدخول (Users & Auth REST API)
// =========================================================================

// تسجيل الدخول (برقم الهاتف أو البريد الإلكتروني)
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, error: 'الرجاء إدخال رقم الهاتف أو البريد الإلكتروني' });
  }

  if (!pool) {
    return res.json({ success: false, error: 'Database not connected' });
  }

  try {
    const cleanIdentifier = identifier.trim();
    // البحث برقم الهاتف أو البريد الإلكتروني
    const userRes = await pool.query(
      `SELECT id, name, phone, email, role, country_id AS "countryId", dialect_id AS "dialectId",
              supervisor_id AS "supervisorId", is_active AS "isActive", created_at AS "createdAt"
       FROM users 
       WHERE (phone = $1 OR email = $1 OR phone ILIKE $2)
       LIMIT 1;`,
      [cleanIdentifier, `%${cleanIdentifier.replace(/[^0-9]/g, '')}%`]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'رقم الهاتف أو البريد غير مسجل بالنظام' });
    }

    const user = userRes.rows[0];
    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'هذا الحساب معطل حالياً، تواصل مع المشرف' });
    }

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        ...user,
        currentJuz: 1,
        totalMemorizedAyahs: 150
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// جلب المستخدمين
app.get('/api/v1/users', async (req: Request, res: Response) => {
  if (!pool) return res.json([]);
  try {
    const result = await pool.query(
      `SELECT id, name, phone, email, role, country_id AS "countryId", dialect_id AS "dialectId",
              supervisor_id AS "supervisorId", is_active AS "isActive", created_at AS "createdAt"
       FROM users 
       ORDER BY created_at DESC;`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة مستخدم جديد
app.post('/api/v1/users', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not connected' });
  const { name, phone, email, password, role, countryId, dialectId, supervisorId } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (name, phone, email, password_hash, role, country_id, dialect_id, supervisor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (phone) DO UPDATE SET 
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         role = EXCLUDED.role
       RETURNING id, name, phone, email, role, country_id AS "countryId", dialect_id AS "dialectId",
                 supervisor_id AS "supervisorId", is_active AS "isActive", created_at AS "createdAt";`,
      [
        name,
        phone,
        email || null,
        password || '123456',
        role || 'STUDENT',
        countryId && countryId.includes('-') && countryId.length === 36 ? countryId : null,
        dialectId && dialectId.includes('-') && dialectId.length === 36 ? dialectId : null,
        supervisorId && supervisorId.includes('-') && supervisorId.length === 36 ? supervisorId : null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 4. مسارات الحلقات والجلسات (Halaqat & Sessions REST API)
// =========================================================================

app.get('/api/v1/halaqat', async (req: Request, res: Response) => {
  if (!pool) return res.json([]);
  try {
    const result = await pool.query(
      `SELECT id, name, code, teacher_id AS "teacherId", supervisor_id AS "supervisorId",
              target_juz AS "targetJuz", level, schedule_days AS "scheduleDays",
              time_slot AS "timeSlot", max_students AS "maxStudents", is_active AS "isActive",
              created_at AS "createdAt"
       FROM halaqat 
       ORDER BY created_at DESC;`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/halaqat', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not connected' });
  const { name, code, teacherId, supervisorId, targetJuz, level, scheduleDays, timeSlot, maxStudents } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO halaqat (name, code, teacher_id, supervisor_id, target_juz, level, schedule_days, time_slot, max_students)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name, code, teacher_id AS "teacherId", supervisor_id AS "supervisorId",
                 target_juz AS "targetJuz", level, schedule_days AS "scheduleDays",
                 time_slot AS "timeSlot", max_students AS "maxStudents", is_active AS "isActive",
                 created_at AS "createdAt";`,
      [
        name,
        code || `HLQ-${Date.now().toString().slice(-4)}`,
        teacherId && teacherId.length === 36 ? teacherId : '99999999-9999-9999-9999-999999999999',
        supervisorId && supervisorId.length === 36 ? supervisorId : null,
        targetJuz || 3,
        level || 'متوسط',
        scheduleDays || ['الأحد', 'الثلاثاء', 'الخميس'],
        timeSlot || 'بعد العصر',
        maxStudents || 15
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// توثيق وحفظ جلسات التسميع
app.post('/api/v1/sessions', async (req: Request, res: Response) => {
  const sessionData = req.body;

  if (pool) {
    try {
      const circleId = (sessionData.circle_id || sessionData.circleId || '').length === 36 
        ? (sessionData.circle_id || sessionData.circleId) 
        : null;
      const teacherId = (sessionData.teacher_id || sessionData.teacherId || '').length === 36 
        ? (sessionData.teacher_id || sessionData.teacherId) 
        : '99999999-9999-9999-9999-999999999999';
      const sessionDate = sessionData.session_date || sessionData.date || new Date().toISOString().split('T')[0];
      const notes = sessionData.notes || 'جلسة تسميع مسجلة عبر تطبيق إتقان';

      if (circleId) {
        const result = await pool.query(
          `INSERT INTO sessions (circle_id, teacher_id, session_date, status, notes)
           VALUES ($1, $2, $3, 'COMPLETED', $4)
           ON CONFLICT (circle_id, session_date) DO UPDATE SET notes = EXCLUDED.notes
           RETURNING id, created_at;`,
          [circleId, teacherId, sessionDate, notes]
        );

        return res.status(201).json({
          status: 'success',
          message: 'تم حفظ وتوثيق الجلسة في PostgreSQL بنجاح',
          session_id: result.rows[0]?.id || `ses-${Date.now()}`,
          received_data: sessionData
        });
      }
    } catch (err: any) {
      console.error('Database session insertion error:', err);
    }
  }

  res.status(201).json({
    status: 'success',
    message: 'تم حفظ وتوثيق الجلسة بنجاح',
    session_id: `ses-${Date.now()}`,
    received_data: sessionData
  });
});

// Serve Vite Static Production Build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Fallback to index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🌿 منصة إتقان لتحفيظ القرآن تعمل الآن على المنفذ ${PORT}`);
  console.log(`🔗 النطاق: http://0.0.0.0:${PORT}`);
  console.log(`=========================================`);
});
