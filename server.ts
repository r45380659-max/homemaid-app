import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API: Verify Admin Access (Strict server-side role check against ADMIN_EMAIL)
app.post('/api/auth/verify-admin', (req: Request, res: Response) => {
  const { email } = req.body;
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim();

  if (!configuredAdminEmail) {
    return res.status(503).json({
      authorized: false,
      error: 'ADMIN_EMAIL_NOT_CONFIGURED',
      message: 'Server-side ADMIN_EMAIL is not yet configured. Please set ADMIN_EMAIL in your server environment secrets.',
    });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      authorized: false,
      error: 'INVALID_REQUEST',
      message: 'User email is required for administrator verification.',
    });
  }

  const cleanUserEmail = email.trim().toLowerCase();
  const cleanAdminEmail = configuredAdminEmail.toLowerCase();

  if (cleanUserEmail === cleanAdminEmail) {
    return res.json({
      authorized: true,
      role: 'admin',
      email: cleanUserEmail,
      message: 'Admin access verified securely by backend.',
    });
  } else {
    return res.status(403).json({
      authorized: false,
      error: 'UNAUTHORIZED_EMAIL',
      message: `Access Denied: The account ${cleanUserEmail} is not authorized as an administrator. Only the configured Gmail 2 address has access.`,
    });
  }
});

// API: Authorized Admin Information (Returns configured admin email for UI guidance, no secrets)
app.get('/api/auth/admin-info', (req: Request, res: Response) => {
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim();
  res.json({
    configured: Boolean(configuredAdminEmail),
    adminEmail: configuredAdminEmail || null,
  });
});

// API: System Configuration Status (Zero secrets exposed)
app.get('/api/system/status', (req: Request, res: Response) => {
  const hasAdminEmail = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.trim().length > 0);
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);

  res.json({
    status: 'ok',
    adminEmailConfigured: hasAdminEmail,
    supabaseEnvConfigured: hasSupabaseUrl,
    version: '1.0.1',
    appName: 'Homemaid',
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: mount Vite middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Homemaid] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Homemaid] Failed to start server:', err);
  process.exit(1);
});
