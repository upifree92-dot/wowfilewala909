import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CLOUD_DATA_FILE = path.join(PUBLIC_DIR, 'cloud-data.json');
const DIST_CLOUD_DATA_FILE = path.join(__dirname, 'dist', 'cloud-data.json');
const SITE_CONTENT_TS_FILE = path.join(__dirname, 'siteContent.ts');

function ensurePublicDir() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
}

function readCloudData(): any {
  try {
    if (fs.existsSync(CLOUD_DATA_FILE)) {
      const raw = fs.readFileSync(CLOUD_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    if (fs.existsSync(DIST_CLOUD_DATA_FILE)) {
      const raw = fs.readFileSync(DIST_CLOUD_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading cloud-data.json:', err);
  }
  return null;
}

function writeCloudData(payload: any, updateSourceFiles = false) {
  ensurePublicDir();
  const existing = readCloudData() || {};
  const merged = {
    ...existing,
    ...payload,
    updatedAt: Date.now(),
  };

  fs.writeFileSync(CLOUD_DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');

  // If dist directory exists, also keep dist/cloud-data.json in sync
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    try {
      fs.writeFileSync(DIST_CLOUD_DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (e) {
      // ignore if read-only in some environments
    }
  }

  // When Admin triggers Sync, also persist INITIAL_SITE_CONTENT into siteContent.ts
  // so source code & future builds / GitHub pushes permanently include all edits & uploaded photos
  if (updateSourceFiles && merged.siteContent) {
    try {
      const tsContent = `\nexport const INITIAL_SITE_CONTENT = ${JSON.stringify(merged.siteContent, null, 2)};\n`;
      fs.writeFileSync(SITE_CONTENT_TS_FILE, tsContent, 'utf-8');
    } catch (err) {
      console.warn('Could not update siteContent.ts on disk:', err);
    }
  }

  return merged;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Route: Get latest synced state across all devices
  app.get('/api/cloud-sync', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const data = readCloudData();
    res.json({
      success: true,
      data,
    });
  });

  // API Route: Return permanent IPv4 addresses for Hostinger Remote MySQL configuration
  app.get('/api/my-ip', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache');
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '');
    res.json({
      success: true,
      serverIpv4: '34.34.244.150',
      clientIpv4: clientIp.replace('::ffff:', ''),
      wildcard: '%',
    });
  });

  // API Route: Real-time test of Hostinger MySQL connection
  app.get('/api/test-mysql', async (req, res) => {
    const host = (req.query.host as string) || process.env.DB_HOST;
    try {
      const [rows] = await pool.query('SHOW TABLES;');
      const filteredTables = (rows as any[]).filter((row: any) => Object.values(row)[0] !== 'information_schema');
      res.json({
        success: true,
        host,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        message: 'Hostinger MySQL Database se connection 100% SUCCESSFUL & LIVE hai!',
        tables: filteredTables,
      });
    } catch (err: any) {
      res.json({
        success: false,
        host,
        error: err.message,
        message: err.message.includes('Access denied')
          ? `Hostinger Remote MySQL me IP 34.34.244.150 ya % add karein. (${err.message})`
          : err.message,
      });
    }
  });

  app.post('/api/save-appointment', async (req, res) => {
    try {
      const data = req.body;
      await pool.query('INSERT INTO appointments (name, email, phone, device_model, service_needed, appointment_date, appointment_time, description, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.name, data.email, data.phone, data.device_model, data.service_needed, data.appointment_date, data.appointment_time, data.description, 'pending', data.user_id || 'anonymous']);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/save-user', async (req, res) => {
    try {
      const data = req.body;
      await pool.query('INSERT INTO registered_users (id, email, mobile_number, name, bio, wallet_balance, hwid) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=?, mobile_number=?, name=?, bio=?, wallet_balance=?, hwid=?',
        [data.id, data.email, data.mobile_number, data.name, data.bio, data.wallet_balance, data.hwid, data.email, data.mobile_number, data.name, data.bio, data.wallet_balance, data.hwid]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/get-users', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM registered_users');
      res.json({ success: true, data: rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/save-order', async (req, res) => {
    try {
      const data = req.body;
      await pool.query('INSERT INTO order_history (order_id, user_id, user_email, order_type, title, quantity, total_price, status, order_details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.order_id, data.user_id, data.user_email, data.order_type, data.title, data.quantity, data.total_price, data.status, data.order_details, data.created_at]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/update-order-status', async (req, res) => {
    try {
      const { orderId, status } = req.body;
      await pool.query('UPDATE order_history SET status = ? WHERE order_id = ?', [status, orderId]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/save-transaction', async (req, res) => {
    try {
      const data = req.body;
      await pool.query('INSERT INTO wallet_transactions (transaction_id, user_id, user_email, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.transaction_id, data.user_id, data.user_email, data.type, data.amount, data.description, data.created_at]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin-reset-hwid', async (req, res) => {
    try {
      const { userId } = req.body;
      await pool.query('UPDATE registered_users SET hwid = NULL WHERE id = ?', [userId]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Save & broadcast state across all devices
  app.post('/api/cloud-sync', (req, res) => {
    try {
      const {
        siteContent,
        products,
        categories,
        balancePackages,
        autoWalletNewUser,
        users,
        adminNotifications,
        isManualSync,
      } = req.body || {};

      const payload: Record<string, any> = {};
      if (siteContent !== undefined) payload.siteContent = siteContent;
      if (products !== undefined) payload.products = products;
      if (categories !== undefined) payload.categories = categories;
      if (balancePackages !== undefined) payload.balancePackages = balancePackages;
      if (autoWalletNewUser !== undefined) payload.autoWalletNewUser = autoWalletNewUser;
      if (users !== undefined) payload.users = users;
      if (adminNotifications !== undefined) payload.adminNotifications = adminNotifications;

      const saved = writeCloudData(payload, Boolean(isManualSync));
      res.json({
        success: true,
        updatedAt: saved.updatedAt,
        message: 'Synced to live server and persisted across all devices.',
      });
    } catch (err: any) {
      console.error('Error in POST /api/cloud-sync:', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to save cloud sync data',
      });
    }
  });

  // API Route: Build and download ready-to-upload Hostinger public_html ZIP
  app.get('/api/download-hostinger-zip', (_req, res) => {
    try {
      // Run fresh production build so dist/ has all latest code + cloud-data.json + cloud-sync.php + .htaccess
      execSync('npm run build', { cwd: __dirname, stdio: 'pipe' });

      const zipFilePath = path.join(__dirname, 'wowfilewala-hostinger-public_html.zip');
      execSync('python3 zip-package.py', { cwd: __dirname, stdio: 'pipe' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="wowfilewala-hostinger-public_html.zip"');
      res.sendFile(zipFilePath);
    } catch (err: any) {
      console.error('Failed to generate Hostinger ZIP:', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to build Hostinger ZIP package',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.endsWith('.php')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
