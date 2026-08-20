import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Healthcheck Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'Itqan Quran Platform',
    domain: 'itqan.gizawysystems.com',
    timestamp: new Date().toISOString(),
    postgres_configured: Boolean(process.env.DATABASE_URL)
  });
});

// Mock / Live Bridge for Session Recording
app.post('/api/v1/sessions', (req: Request, res: Response) => {
  const sessionData = req.body;
  // If running with PostgreSQL DATABASE_URL, can persist to Postgres
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
