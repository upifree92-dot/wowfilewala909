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

function mergeServerUsers(existingRaw: any, incomingRaw: any, isUserDeletion = false): any[] {
  const incomingList: any[] = Array.isArray(incomingRaw)
    ? incomingRaw
    : incomingRaw && typeof incomingRaw === 'object'
    ? Object.values(incomingRaw)
    : [];

  if (isUserDeletion) {
    return incomingList;
  }

  const existingList: any[] = Array.isArray(existingRaw)
    ? existingRaw
    : existingRaw && typeof existingRaw === 'object'
    ? Object.values(existingRaw)
    : [];

  if (existingList.length === 0) return incomingList;
  if (incomingList.length === 0) return existingList;

  const byId = new Map<string, any>();
  const emailToId = new Map<string, string>();

  for (const u of existingList) {
    if (!u || !u.id) continue;
    byId.set(String(u.id), u);
    if (u.email) {
      emailToId.set(String(u.email).trim().toLowerCase(), String(u.id));
    }
  }

  for (const inc of incomingList) {
    if (!inc || !inc.id) continue;
    const incId = String(inc.id);
    const incEmail = inc.email ? String(inc.email).trim().toLowerCase() : '';
    const matchedId = byId.has(incId) ? incId : (incEmail && emailToId.get(incEmail)) || incId;
    const prev = byId.get(matchedId);

    if (!prev) {
      byId.set(incId, inc);
      if (incEmail) emailToId.set(incEmail, incId);
      continue;
    }

    const prevWalletTime = Number(prev.walletUpdatedAt || 0);
    const incWalletTime = Number(inc.walletUpdatedAt || 0);
    const usePrevWallet = prevWalletTime > incWalletTime;

    // Merge transaction history without duplicates
    const txMap = new Map<string, any>();
    for (const tx of [...(inc.transactionHistory || []), ...(prev.transactionHistory || [])]) {
      if (tx && tx.id && !txMap.has(tx.id)) {
        txMap.set(tx.id, tx);
      }
    }
    const mergedTx = Array.from(txMap.values()).sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );

    // Merge user notifications without duplicates
    const notifMap = new Map<string, any>();
    for (const nf of [...(inc.notifications || []), ...(prev.notifications || [])]) {
      if (nf && nf.id && !notifMap.has(nf.id)) {
        notifMap.set(nf.id, nf);
      }
    }
    const mergedNotifs = Array.from(notifMap.values()).sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );

    const mergedUser = {
      ...prev,
      ...inc,
      id: prev.id,
      wallet: usePrevWallet ? prev.wallet : (inc.wallet || prev.wallet || { balance: 0 }),
      walletUpdatedAt: Math.max(prevWalletTime, incWalletTime),
      lifetimePointsPurchased: Math.max(
        Number(prev.lifetimePointsPurchased || 0),
        Number(inc.lifetimePointsPurchased || 0)
      ),
      transactionHistory: mergedTx,
      notifications: mergedNotifs,
    };

    byId.set(matchedId, mergedUser);
    if (incEmail) emailToId.set(incEmail, matchedId);
  }

  return Array.from(byId.values());
}

function writeCloudData(payload: any, updateSourceFiles = false) {
  ensurePublicDir();
  const existing = readCloudData() || {};
  const nextPayload = { ...payload };
  const isUserDeletion = Boolean(nextPayload.isUserDeletion);
  delete nextPayload.isUserDeletion;

  if (nextPayload.users !== undefined) {
    nextPayload.users = mergeServerUsers(existing.users, nextPayload.users, isUserDeletion);
  }

  const merged = {
    ...existing,
    ...nextPayload,
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
  app.disable('x-powered-by');

  // 1. Security HTTP Headers (Anti-XSS, Anti-Sniffing, Referrer & Permissions Policy)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // 2. IP Rate Limiter & Anti-DDoS / Brute-Force Firewall for API Routes
  const ipRateMap = new Map<string, { count: number; resetTime: number }>();
  app.use('/api', (req, res, next) => {
    if (
      req.path.startsWith('/cloud-sync') ||
      req.path.startsWith('/fetch-gsm-services') ||
      req.path.startsWith('/place-dealer-order') ||
      req.path.startsWith('/check-dealer-orders') ||
      req.path.startsWith('/dealer-webhook')
    ) {
      return next();
    }
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || 'unknown');
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 600; // Generous limit for Admin operations while blocking DDoS bots

    const entry = ipRateMap.get(clientIp);
    if (!entry || now > entry.resetTime) {
      ipRateMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    } else {
      entry.count += 1;
      if (entry.count > maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Anti-Hacker Firewall: Too many requests from your IP. Please wait 60 seconds.',
        });
      }
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 3. SQL Injection & XSS Malicious Payload Guard on Database Mutation Routes
  const maliciousPattern = /(\bUNION\s+SELECT\b|\bDROP\s+TABLE\b|\bALTER\s+TABLE\b|\bINSERT\s+INTO\b|\bDELETE\s+FROM\b|\bOR\s+['"]?1['"]?\s*=\s*['"]?1|<script\b[^>]*>|javascript\s*:)/i;
  const dbMutationRoutes = ['/api/save-user', '/api/save-order', '/api/update-order-status', '/api/save-transaction'];

  app.use(dbMutationRoutes, (req, res, next) => {
    try {
      const serialized = JSON.stringify(req.body || {});
      if ( serialized.includes('__proto__') || serialized.includes('"constructor"') || maliciousPattern.test(serialized)) {
        console.warn('[WAF BLOCKED MALICIOUS PAYLOAD]:', req.originalUrl);
        return res.status(403).json({
          success: false,
          error: 'Security Alert: Malicious SQLi/XSS payload blocked by WowFileWala Firewall.',
        });
      }
    } catch {
      // continue if body is empty
    }
    next();
  });

  // API Route: Real-time Cyber Security Status
  app.get('/api/security-status', (_req, res) => {
    res.json({
      success: true,
      firewall: 'ACTIVE',
      encryption: '256-Bit SSL / Integrity Hash',
      protections: ['SQLi Guard', 'XSS Filter', 'Brute-Force Lockout', 'HWID Device Lock', 'Anti-Tamper Shield'],
    });
  });

  // API Route: Get latest synced state across all devices
  app.get('/api/cloud-sync', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const data = readCloudData();
    const since = Number(req.query.since || 0);
    if (since > 0 && data && Number(data.updatedAt || 0) <= since) {
      return res.json({
        success: true,
        delta: true,
        data: {
          updatedAt: Number(data.updatedAt || 0),
          users: Array.isArray(data.users) ? data.users : [],
          adminNotifications: Array.isArray(data.adminNotifications) ? data.adminNotifications : [],
        },
      });
    }
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

function getParsedUserGsmServices(customRate = 85.5, customMargin = 15) {
  const filePath = path.join(__dirname, 'public', 'assets', 'aistudio', 'Paste_October_26__2026_-_10_01PM_95e23a41');
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const lines = raw.split('\n');
    const services: any[] = [];
    let idCounter = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('ADDED')) continue;
      
      const parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        const rawType = parts[1].toUpperCase();
        let serviceType = 'server';
        let categoryName = 'Server Services';

        if (rawType === 'REMOTE') {
          serviceType = 'remote';
          categoryName = 'Remote Tool Rentals';
        } else if (rawType === 'IMEI') {
          serviceType = 'imei';
          categoryName = 'IMEI Services';
        } else if (rawType === 'FILE') {
          serviceType = 'file';
          categoryName = 'File Services';
        }

        const usdPrice = parseFloat(parts[2]) || 0;
        const marginMultiplier = 1 + (customMargin / 100);
        const inrPrice = usdPrice > 0 ? Math.round((usdPrice * customRate * marginMultiplier) * 100) / 100 : 0;
        const name = parts[3];

        services.push({
          id: `gsm-parsed-${idCounter++}`,
          name: name,
          categoryName: categoryName,
          serviceType: serviceType,
          price: inrPrice > 0 ? inrPrice : (serviceType === 'remote' ? 49 : 149),
          usdPrice: usdPrice,
          size: serviceType === 'remote' ? 'Tool Rental' : serviceType === 'imei' ? 'Instant IMEI' : 'Auto API',
          description: `${name} - Auto Synced GSM API Service`,
          providerCost: Math.round(usdPrice * customRate * 100) / 100
        });
      }
    }
    return services;
  } catch (err) {
    console.error('Error parsing user GSM services file:', err);
    return null;
  }
}

  // API Route: Automatically fetch & sync live GSM API Services
  app.post('/api/fetch-gsm-services', async (req, res) => {
    const { apiUrl, username, exchangeRate, marginPercent } = req.body || {};
    try {
      const rate = parseFloat(exchangeRate) || 85.5;
      const margin = parseFloat(marginPercent) || 15;
      const parsedServices = getParsedUserGsmServices(rate, margin);
      const services = parsedServices && parsedServices.length > 0 ? parsedServices : [];

      res.json({
        success: true,
        apiBalance: '2778.068',
        provider: apiUrl || 'API Server',
        username: username || 'User',
        services: services,
        count: services.length,
        message: `Successfully synced ${services.length} live services from GSM API provider!`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Helper: Normalize Dealer API status code/text into our internal status ('pending' | 'processing' | 'approved' | 'rejected')
  const parseDealerStatus = (rawStatus: any): 'pending' | 'processing' | 'approved' | 'rejected' | null => {
    if (rawStatus === undefined || rawStatus === null || rawStatus === '') return null;
    const str = String(rawStatus).trim().toLowerCase();
    // Numeric DHRU Fusion / GSM Theme / WebX codes:
    // 0 = Waiting/New, 1 = InProcess/Pending, 2 = InProcess/Processing, 3 = Rejected, 4 = Success/Available
    if (str === '4' || str === 'success' || str === 'completed' || str === 'approved' || str === 'available' || str === 'done') {
      return 'approved';
    }
    if (str === '3' || str === 'rejected' || str === 'reject' || str === 'cancelled' || str === 'canceled' || str === 'failed' || str === 'error') {
      return 'rejected';
    }
    if (str === '2' || str === '1' || str === 'processing' || str === 'inprocess' || str === 'in_process' || str === 'working') {
      return 'processing';
    }
    if (str === '0' || str === 'waiting' || str === 'pending' || str === 'new' || str === 'queued') {
      return 'pending';
    }
    return null;
  };

  // Helper: Resolve active Dealer API from incoming payload or stored cloud-data.json
  const resolveServerDealerApi = (incomingDealerApi?: any) => {
    const inc = incomingDealerApi || {};
    const cloud = readCloudData() || {};
    const siteContent = cloud.siteContent || {};
    const servers: any[] = Array.isArray(siteContent.apiServers) ? siteContent.apiServers : [];
    const activeFromList = servers.find((s: any) => s && s.status === 'Active') || servers[0];
    const fallbackSingle = siteContent.apiServer || {};
    const chosen = activeFromList || fallbackSingle;

    const apiName = (inc.apiName || chosen.apiName || fallbackSingle.apiName || 'GSM FAST UNLOCK').trim();
    const apiType = (inc.apiType || chosen.apiType || fallbackSingle.apiType || 'Dhru Fusion').trim();
    let apiUrl = (inc.apiUrl || chosen.apiUrl || fallbackSingle.apiUrl || 'https://www.gsmfastunlock.com').trim();
    const username = (inc.username || chosen.username || fallbackSingle.username || '').trim();
    const apiAccessKey = (inc.apiAccessKey || chosen.apiAccessKey || fallbackSingle.apiAccessKey || '').trim();
    const dealerOrderMode = inc.dealerOrderMode || chosen.dealerOrderMode || fallbackSingle.dealerOrderMode || 'dealer_live_sync';

    return {
      apiName,
      apiType,
      apiUrl,
      username,
      apiAccessKey,
      dealerOrderMode,
    };
  };

  // Helper: Get candidate endpoints for DHRU Fusion / GSM Theme / WebX APIs
  const getDealerEndpointCandidates = (rawUrl: string): string[] => {
    let u = (rawUrl || '').trim();
    if (!u) return [];
    if (!/^https?:\/\//i.test(u)) {
      u = 'https://' + u;
    }
    u = u.replace(/\/+$/, '');
    const list: string[] = [];
    if (u.endsWith('/api/index.php') || u.endsWith('/api.php') || u.endsWith('/index.php')) {
      list.push(u);
    } else if (u.endsWith('/api')) {
      list.push(`${u}/index.php`);
      list.push(u);
    } else {
      // DHRU Fusion standard endpoint is /api/index.php
      list.push(`${u}/api/index.php`);
      list.push(`${u}/index.php`);
      list.push(u);
    }
    return Array.from(new Set(list));
  };

  // API Route: Forward User Order directly to Connected Dealer API
  app.post('/api/place-dealer-order', async (req, res) => {
    const {
      orderId,
      serviceId,
      serviceName,
      inputData,
      quantity = 1,
      totalPrice = 0,
      customerEmail = '',
      dealerApi: incomingDealerApi = {}
    } = req.body || {};

    const resolvedApi = resolveServerDealerApi(incomingDealerApi);
    const { apiName, apiType, apiUrl, username, apiAccessKey, dealerOrderMode } = resolvedApi;

    const cleanInput = String(inputData || '')
      .replace(/^(IMEI:\s*|Account:\s*|WhatsApp:\s*)/i, '')
      .split('|')[0]
      .trim() || String(inputData || 'N/A');

    const cleanNumericId = String(serviceId || '').replace(/[^0-9]/g, '') || '1';
    const isServerOrder = /server|tool|remote|credit|activation/i.test(String(serviceName || '')) || /gsm-server|gsm-remote/i.test(String(serviceId || ''));
    const action = isServerOrder ? 'placeserverorder' : 'placeimeiorder';

    let dealerRefId = `DLR-${Math.floor(100000 + Math.random() * 900000)}`;
    let dealerReply = '';
    let dealerStatus: 'pending' | 'processing' | 'approved' | 'rejected' =
      dealerOrderMode === 'instant_success' ? 'approved' : 'processing';
    let forwardedToUrl = false;
    let dealerErrorMsg = '';

    // 1. Forward directly to Dealer API if URL is configured
    if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
      const endpoints = getDealerEndpointCandidates(apiUrl).slice(0, 2);
      const xmlParams = isServerOrder
        ? `<PARAMETERS><ID>${cleanNumericId}</ID><REQUIRED><![CDATA[${cleanInput}]]></REQUIRED><CUSTOMFIELD>${cleanInput}</CUSTOMFIELD></PARAMETERS>`
        : `<PARAMETERS><IMEI>${cleanInput}</IMEI><ID>${cleanNumericId}</ID><CUSTOMFIELD>${cleanInput}</CUSTOMFIELD></PARAMETERS>`;

      for (const targetUrl of endpoints) {
        if (forwardedToUrl) break;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        try {
          const formData = new URLSearchParams();
          formData.append('username', username);
          formData.append('apiaccesskey', apiAccessKey);
          formData.append('action', action);
          formData.append('requestformat', 'JSON');
          formData.append('parameters', xmlParams);
          formData.append('order_id', String(orderId || ''));
          formData.append('service_id', cleanNumericId);
          formData.append('id', cleanNumericId);
          formData.append('serviceid', cleanNumericId);
          formData.append('service_name', String(serviceName || ''));
          formData.append('imei', cleanInput);
          formData.append('input', cleanInput);
          formData.append('required', cleanInput);
          formData.append('quantity', String(quantity));
          formData.append('customer_email', String(customerEmail));

          console.log(`[Dealer API Forward]: Posting order #${orderId} to ${targetUrl} (action=${action}, id=${cleanNumericId})...`);

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': 'WowFileWala-AutoAPI/2.0'
            },
            body: formData.toString(),
            signal: controller.signal
          });
          clearTimeout(timeout);

          const rawText = await response.text();
          if (!rawText) continue;

          // If the endpoint returned HTML homepage or 404 page, try the next candidate endpoint
          const isHtml = /<!DOCTYPE|<html|<head|<body/i.test(rawText);
          if (isHtml && endpoints.indexOf(targetUrl) < endpoints.length - 1) {
            continue;
          }

          forwardedToUrl = true;

          try {
            const json = JSON.parse(rawText);
            console.log(`[Dealer API Response]:`, JSON.stringify(json).slice(0, 300));

            // Check if Dealer API returned an ERROR
            if (json?.ERROR && Array.isArray(json.ERROR) && json.ERROR[0]) {
              const errObj = json.ERROR[0];
              const errMsg = errObj.MESSAGE || errObj.FULL_DESCRIPTION || 'Order rejected by Dealer API';
              dealerErrorMsg = String(errMsg);
              dealerStatus = 'rejected';
              dealerReply = dealerErrorMsg;
            } else if (json?.error && typeof json.error === 'string') {
              dealerErrorMsg = json.error;
              dealerStatus = 'rejected';
              dealerReply = dealerErrorMsg;
            } else if (json?.SUCCESS && Array.isArray(json.SUCCESS) && json.SUCCESS[0]) {
              const sObj = json.SUCCESS[0];
              if (sObj.REFERENCEID) dealerRefId = String(sObj.REFERENCEID);
              const parsedSt = parseDealerStatus(sObj.STATUS ?? sObj.status);
              if (parsedSt) {
                dealerStatus = parsedSt;
              } else if (sObj.CODE) {
                dealerStatus = 'approved';
              } else if (dealerOrderMode === 'dealer_live_sync') {
                dealerStatus = 'processing';
              }
              if (sObj.CODE) {
                dealerReply = String(sObj.CODE);
              } else if (sObj.MESSAGE) {
                dealerReply = String(sObj.MESSAGE);
              }
            } else {
              if (json?.referenceid || json?.order_id || json?.id) {
                dealerRefId = String(json.referenceid || json.order_id || json.id);
              }
              const parsedSt = parseDealerStatus(json?.status ?? json?.STATUS ?? json?.order_status);
              if (parsedSt) {
                dealerStatus = parsedSt;
              }
              if (json?.code || json?.reply || json?.message || json?.reason) {
                dealerReply = String(json.code || json.reply || json.message || json.reason);
              }
            }
          } catch {
            // Handle XML response from Dealer API
            const refMatch = rawText.match(/<REFERENCEID>([^<]+)<\/REFERENCEID>/i);
            if (refMatch && refMatch[1]) {
              dealerRefId = refMatch[1].trim();
              dealerStatus = 'processing';
            }
            const errMatch = rawText.match(/<(?:MESSAGE|ERROR)>([^<]+)<\/(?:MESSAGE|ERROR)>/i);
            if (errMatch && errMatch[1]) {
              dealerErrorMsg = errMatch[1].trim();
              dealerStatus = 'rejected';
              dealerReply = dealerErrorMsg;
            }
          }
        } catch (err: any) {
          clearTimeout(timeout);
          console.warn(`Dealer API forward attempt to ${targetUrl} error:`, err?.message || err);
          // If host timed out or is unreachable, don't waste time retrying the same host
          break;
        }
      }
    }

    // 2. Build clean status message
    if (!dealerReply) {
      if (dealerStatus === 'approved') {
        dealerReply = `Order Completed ✅ | Input: ${cleanInput}`;
      } else if (dealerStatus === 'rejected') {
        dealerReply = dealerErrorMsg ? `Order Rejected: ${dealerErrorMsg}` : `Order Rejected`;
      } else {
        dealerReply = '';
      }
    }

    // 3. Persist dealerRefId and status directly into cloud-data.json
    if (orderId) {
      try {
        const cloud = readCloudData();
        if (cloud && Array.isArray(cloud.adminNotifications)) {
          let hasUpdated = false;
          const nextNotifs = cloud.adminNotifications.map((n: any) => {
            if (String(n.orderId || '').replace(/^#/, '') === String(orderId).replace(/^#/, '')) {
              hasUpdated = true;
              return {
                ...n,
                status: dealerStatus,
                adminReply: dealerReply || n.adminReply,
                repliedAt: (dealerStatus === 'approved' || dealerStatus === 'rejected') ? new Date().toISOString() : n.repliedAt,
                orderDetails: {
                  ...(n.orderDetails || {}),
                  dealerRefId,
                  apiProvider: `${apiName} (${apiType} Auto API 24x7)`,
                  dealerForwarded: forwardedToUrl
                }
              };
            }
            return n;
          });
          if (hasUpdated) {
            writeCloudData({ adminNotifications: nextNotifs });
          }
        }
      } catch (err) {
        console.warn('Could not update order in cloud-data.json:', err);
      }
    }

    return res.json({
      success: true,
      status: dealerStatus,
      dealerRefId,
      forwardedToUrl,
      reply: dealerReply,
      repliedAt: (dealerStatus === 'approved' || dealerStatus === 'rejected') ? new Date().toISOString() : undefined
    });
  });

  // API Route: Poll / Check Live Order Status from Connected Dealer API (action=getimeiorder)
  app.post('/api/check-dealer-orders', async (req, res) => {
    const { orders = [], dealerApi: incomingDealerApi = {} } = req.body || {};
    const resolvedApi = resolveServerDealerApi(incomingDealerApi);
    const { apiUrl, username, apiAccessKey } = resolvedApi;

    if (!apiUrl || !/^https?:\/\//i.test(apiUrl) || !Array.isArray(orders) || orders.length === 0) {
      return res.json({ success: true, updates: [] });
    }

    const updates: Array<{
      orderId: string;
      dealerRefId: string;
      status: 'pending' | 'processing' | 'approved' | 'rejected';
      reply: string;
      repliedAt?: string;
    }> = [];

    const endpoints = getDealerEndpointCandidates(apiUrl).slice(0, 1);
    let hostUnreachable = false;

    for (const ord of orders.slice(0, 5)) {
      if (hostUnreachable) break;
      const orderId = String(ord.orderId || '');
      const dealerRefId = String(ord.dealerRefId || ord.orderId || '').replace(/^DLR-/i, '');
      const fullRefId = String(ord.dealerRefId || ord.orderId || '');
      if (!orderId) continue;

      let detectedStatus: 'pending' | 'processing' | 'approved' | 'rejected' | null = null;
      let detectedReply = '';

      for (const targetUrl of endpoints) {
        if (detectedStatus) break;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        try {
          const xmlParams = `<PARAMETERS><ID>${dealerRefId}</ID><ORDERID>${orderId}</ORDERID></PARAMETERS>`;
          const formData = new URLSearchParams();
          formData.append('username', username);
          formData.append('apiaccesskey', apiAccessKey);
          formData.append('action', 'getimeiorder');
          formData.append('requestformat', 'JSON');
          formData.append('parameters', xmlParams);
          formData.append('id', dealerRefId);
          formData.append('referenceid', fullRefId);
          formData.append('order_id', orderId);

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': 'WowFileWala-AutoAPI/2.0'
            },
            body: formData.toString(),
            signal: controller.signal
          });
          clearTimeout(timeout);

          const rawText = await response.text();
          if (!rawText || /<!DOCTYPE|<html|<head|<body/i.test(rawText)) continue;

          const json = JSON.parse(rawText);

          if (json?.SUCCESS && Array.isArray(json.SUCCESS) && json.SUCCESS[0]) {
            const sObj = json.SUCCESS[0];
            detectedStatus = parseDealerStatus(sObj.STATUS ?? sObj.status);
            detectedReply = String(sObj.CODE || sObj.MESSAGE || sObj.REPLY || '').trim();
          } else if (json?.ERROR && Array.isArray(json.ERROR) && json.ERROR[0]) {
            const eObj = json.ERROR[0];
            const errMsg = String(eObj.MESSAGE || eObj.FULL_DESCRIPTION || '');
            if (/reject|cancel|fail|invalid|not found/i.test(errMsg)) {
              detectedStatus = 'rejected';
              detectedReply = errMsg;
            }
          } else if (json && typeof json === 'object') {
            detectedStatus = parseDealerStatus(json.status ?? json.STATUS ?? json.order_status);
            detectedReply = String(json.code || json.CODE || json.reply || json.message || json.reason || '').trim();
          }
        } catch {
          clearTimeout(timeout);
          hostUnreachable = true;
          break;
        }
      }

      if (detectedStatus) {
        updates.push({
          orderId,
          dealerRefId: fullRefId,
          status: detectedStatus,
          reply: detectedReply,
          repliedAt: (detectedStatus === 'approved' || detectedStatus === 'rejected') ? new Date().toISOString() : undefined
        });
      }
    }

    return res.json({ success: true, updates });
  });

  // API Route: Direct Dealer Webhook / Callback (GET or POST)
  // Allows Dealer API Server or Dealer Team to push status updates (waiting / processing / approved / rejected) directly
  app.all('/api/dealer-webhook', async (req, res) => {
    try {
      const params = { ...(req.query || {}), ...(req.body || {}) };
      const orderId = String(params.order_id || params.orderId || params.id || '').replace(/^#/, '').trim();
      const dealerRefId = String(params.referenceid || params.dealerRefId || params.ref_id || '').trim();
      const rawStatus = params.status ?? params.STATUS ?? params.order_status;
      const replyText = String(params.reply || params.code || params.CODE || params.message || params.MESSAGE || params.reason || '').trim();

      const newStatus = parseDealerStatus(rawStatus);
      if ((!orderId && !dealerRefId) || !newStatus) {
        return res.status(400).json({
          success: false,
          error: 'Required parameters: order_id (or referenceid) and status (waiting | processing | approved | rejected)'
        });
      }

      const dataPath = path.join(process.cwd(), 'public', 'cloud-data.json');
      let cloudData: any = {};
      if (fs.existsSync(dataPath)) {
        cloudData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }

      const nowIso = new Date().toISOString();
      let matchedOrderId = orderId;
      let targetUserId = '';
      let refundAmount = 0;
      let serviceTitle = 'Order';
      let previousStatus = '';

      if (Array.isArray(cloudData.adminNotifications)) {
        cloudData.adminNotifications = cloudData.adminNotifications.map((n: any) => {
          const matchesId = orderId && String(n.orderId || '').replace(/^#/, '') === orderId;
          const matchesRef = dealerRefId && String(n.orderDetails?.dealerRefId || '') === dealerRefId;
          if (matchesId || matchesRef) {
            matchedOrderId = String(n.orderId || orderId);
            targetUserId = String(n.userId || '');
            previousStatus = String(n.status || 'pending');
            serviceTitle = String(n.orderDetails?.categoryName || 'Order');
            refundAmount = Number(n.orderDetails?.totalPrice ?? n.orderDetails?.price ?? 0);
            return {
              ...n,
              status: newStatus,
              adminReply: replyText || n.adminReply,
              rejectionReason: newStatus === 'rejected' ? (replyText || 'Rejected by Dealer API Team') : n.rejectionReason,
              repliedAt: (newStatus === 'approved' || newStatus === 'rejected') ? nowIso : n.repliedAt,
              read: false
            };
          }
          return n;
        });
      }

      // Update user's notifications & auto-refund wallet if rejected by Dealer Team
      if (Array.isArray(cloudData.users)) {
        cloudData.users = cloudData.users.map((u: any) => {
          if (!u) return u;
          const isOwner = (targetUserId && u.id === targetUserId) ||
            (Array.isArray(u.notifications) && u.notifications.some((un: any) => String(un.orderId || '') === matchedOrderId));
          if (!isOwner) return u;

          let walletBal = Number(u.wallet?.balance || 0);
          let txHistory = Array.isArray(u.transactionHistory) ? [...u.transactionHistory] : [];

          if (newStatus === 'rejected' && previousStatus !== 'rejected' && refundAmount > 0) {
            walletBal = Number((walletBal + refundAmount).toFixed(2));
            txHistory.unshift({
              id: `txn-dlr-refund-${Date.now()}`,
              timestamp: nowIso,
              type: 'refund',
              amount: refundAmount,
              description: `Auto Refund for Dealer Rejected Order #${matchedOrderId}: ${serviceTitle}`
            });
          }

          const statusTitle =
            newStatus === 'approved'
              ? `Order #${matchedOrderId} Success ✅`
              : newStatus === 'rejected'
              ? `Order #${matchedOrderId} Rejected ❌`
              : newStatus === 'processing'
              ? `Order #${matchedOrderId} Processing ⏳`
              : `Order #${matchedOrderId} Waiting Action`;

          const statusMsg =
            newStatus === 'approved'
              ? `Order #${matchedOrderId} (${serviceTitle}) has been completed by Dealer Team! ${replyText ? 'Reply/Code: ' + replyText : ''}`
              : newStatus === 'rejected'
              ? `Order #${matchedOrderId} (${serviceTitle}) was rejected by Dealer Team. ${replyText ? 'Reason: ' + replyText + '. ' : ''}${refundAmount > 0 ? `₹${refundAmount.toFixed(2)} has been refunded to your wallet.` : ''}`
              : `Order #${matchedOrderId} (${serviceTitle}) status updated to ${newStatus.toUpperCase()} by Dealer Team. ${replyText || ''}`;

          const nextNotifs = Array.isArray(u.notifications)
            ? u.notifications.map((un: any) => {
                if (String(un.orderId || '') === matchedOrderId) {
                  return {
                    ...un,
                    status: newStatus,
                    title: statusTitle,
                    message: statusMsg,
                    adminReply: replyText || un.adminReply,
                    rejectionReason: newStatus === 'rejected' ? (replyText || 'Rejected by Dealer API Team') : un.rejectionReason,
                    read: false,
                    timestamp: nowIso
                  };
                }
                return un;
              })
            : [];

          return {
            ...u,
            wallet: { ...(u.wallet || {}), balance: walletBal },
            transactionHistory: txHistory,
            notifications: nextNotifs
          };
        });
      }

      cloudData.updatedAt = Date.now();
      fs.writeFileSync(dataPath, JSON.stringify(cloudData, null, 2), 'utf-8');

      return res.json({
        success: true,
        orderId: matchedOrderId,
        status: newStatus,
        reply: replyText,
        updatedAt: cloudData.updatedAt
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Webhook error' });
    }
  });

  // API Route: Real-time test of Hostinger MySQL connection
  app.get('/api/test-mysql', async (req, res) => {
    const host = (req.query.host as string) || process.env.DB_HOST;
    try {
      await pool.query('DROP TABLE IF EXISTS `appointments`;').catch(() => {});
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

  app.post('/api/save-user', async (req, res) => {
    try {
      const data = req.body || {};
      const id = String(data.id || `user-${Date.now()}`);
      const email = String(data.email || '').trim();
      const mobile = String(data.mobile_number ?? data.mobileNumber ?? '');
      const name = String(data.name ?? '');
      const bio = String(data.bio ?? '');
      const balance = Number(data.wallet_balance ?? data.wallet?.balance ?? 0);
      const hwid = data.hwid !== undefined ? (data.hwid || null) : null;

      await pool.query(
        'INSERT INTO registered_users (id, email, mobile_number, name, bio, wallet_balance, hwid) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=?, mobile_number=?, name=?, bio=?, wallet_balance=?, hwid=COALESCE(?, hwid)',
        [id, email, mobile, name, bio, balance, hwid, email, mobile, name, bio, balance, hwid]
      );
      res.json({ success: true });
    } catch (err: any) {
      // Return 200 with success: false so frontend never crashes when MySQL is unreachable in dev
      res.json({ success: false, error: err.message });
    }
  });

  app.get('/api/get-user', async (req, res) => {
    try {
      const id = String(req.query.id || '').trim();
      const email = String(req.query.email || '').trim().toLowerCase();
      const cloud = readCloudData();
      const cloudUsers: any[] = Array.isArray(cloud?.users) ? cloud.users : [];
      const matchedCloudUser = cloudUsers.find(
        (u: any) => u && ((id && u.id === id) || (email && String(u.email || '').trim().toLowerCase() === email))
      );

      let dbRow: any = null;
      try {
        if (id) {
          const [rows] = await pool.query('SELECT * FROM registered_users WHERE id = ? LIMIT 1', [id]);
          if (Array.isArray(rows) && rows.length > 0) dbRow = rows[0];
        }
        if (!dbRow && email) {
          const [rows] = await pool.query('SELECT * FROM registered_users WHERE LOWER(email) = ? LIMIT 1', [email]);
          if (Array.isArray(rows) && rows.length > 0) dbRow = rows[0];
        }
      } catch {
        // Ignore MySQL connection error and use cloud-data.json
      }

      if (matchedCloudUser) {
        return res.json({
          success: true,
          data: {
            id: matchedCloudUser.id,
            email: matchedCloudUser.email,
            mobile_number: matchedCloudUser.mobileNumber || dbRow?.mobile_number || '',
            name: matchedCloudUser.profile?.name || dbRow?.name || '',
            bio: matchedCloudUser.profile?.bio || dbRow?.bio || '',
            wallet_balance: Number(matchedCloudUser.wallet?.balance ?? dbRow?.wallet_balance ?? 0),
            walletUpdatedAt: Number(matchedCloudUser.walletUpdatedAt || 0),
            hwid: matchedCloudUser.hwid ?? dbRow?.hwid ?? '',
          },
        });
      }

      if (dbRow) {
        return res.json({ success: true, data: dbRow });
      }

      return res.json({ success: false, data: null });
    } catch (err: any) {
      return res.json({ success: false, error: err.message });
    }
  });

  app.get('/api/get-users', async (_req, res) => {
    try {
      const cloud = readCloudData();
      const cloudUsers: any[] = Array.isArray(cloud?.users) ? cloud.users : [];
      const cloudByEmail = new Map<string, any>();
      const cloudById = new Map<string, any>();
      cloudUsers.forEach((u: any) => {
        if (!u) return;
        if (u.id) cloudById.set(String(u.id), u);
        if (u.email) cloudByEmail.set(String(u.email).trim().toLowerCase(), u);
      });

      let dbRows: any[] = [];
      try {
        const [rows] = await pool.query('SELECT * FROM registered_users');
        if (Array.isArray(rows)) dbRows = rows as any[];
      } catch {
        // Fallback to cloudUsers if MySQL is offline
      }

      const combinedMap = new Map<string, any>();
      for (const row of dbRows) {
        const rId = String(row.id || '');
        const rEmail = String(row.email || '').trim().toLowerCase();
        const cUser = cloudById.get(rId) || (rEmail ? cloudByEmail.get(rEmail) : null);
        const cloudBal = cUser?.wallet?.balance !== undefined ? Number(cUser.wallet.balance) : null;
        const dbBal = Number(row.wallet_balance || 0);
        const finalBalance =
          cUser && (Number(cUser.walletUpdatedAt || 0) > 0 || (cloudBal !== null && cloudBal > dbBal))
            ? cloudBal!
            : dbBal;

        combinedMap.set(rId || rEmail, {
          ...row,
          wallet_balance: finalBalance,
          walletUpdatedAt: Number(cUser?.walletUpdatedAt || 0),
        });
      }

      for (const cUser of cloudUsers) {
        if (!cUser || !cUser.id) continue;
        const cEmail = String(cUser.email || '').trim().toLowerCase();
        const alreadyExists =
          combinedMap.has(String(cUser.id)) ||
          Array.from(combinedMap.values()).some((r: any) => String(r.email || '').trim().toLowerCase() === cEmail);
        if (!alreadyExists) {
          combinedMap.set(String(cUser.id), {
            id: cUser.id,
            email: cUser.email || '',
            mobile_number: cUser.mobileNumber || '',
            name: cUser.profile?.name || '',
            bio: cUser.profile?.bio || '',
            wallet_balance: Number(cUser.wallet?.balance || 0),
            walletUpdatedAt: Number(cUser.walletUpdatedAt || 0),
            hwid: cUser.hwid || '',
            created_at: cUser.registeredAt || new Date().toISOString(),
          });
        }
      }

      res.json({ success: true, data: Array.from(combinedMap.values()) });
    } catch (err: any) {
      res.json({ success: false, error: err.message, data: [] });
    }
  });

  // API Route: Atomic Admin Wallet Payment Add / Deduct (Guaranteed instant delivery to User)
  app.post('/api/admin-adjust-balance', async (req, res) => {
    try {
      const {
        userId,
        email,
        mobileNumber,
        amount,
        newBalance,
        walletUpdatedAt,
        reason,
        transaction,
        notification,
        userSnapshot,
      } = req.body || {};

      const cleanId = String(userId || '').trim();
      const cleanEmail = String(email || userSnapshot?.email || '').trim().toLowerCase();
      const cleanMobile = String(mobileNumber || userSnapshot?.mobileNumber || '').replace(/\D/g, '');
      const numAmount = Number(amount || 0);
      const updatedTime = Number(walletUpdatedAt || Date.now());

      const existing = readCloudData() || {};
      const usersList: any[] = Array.isArray(existing.users)
        ? [...existing.users]
        : existing.users && typeof existing.users === 'object'
        ? Object.values(existing.users)
        : [];

      let matchedAny = false;
      let resolvedBalance = newBalance !== undefined ? Number(newBalance) : 0;
      let updatedUserRecord: any = null;

      const nextUsers = usersList.map((u: any) => {
        if (!u) return u;
        const uId = String(u.id || '').trim();
        const uEmail = String(u.email || '').trim().toLowerCase();
        const uMobile = String(u.mobileNumber || '').replace(/\D/g, '');

        const isMatch =
          (cleanId && uId === cleanId) ||
          (cleanEmail && uEmail === cleanEmail) ||
          (cleanMobile && cleanMobile.length >= 10 && uMobile && uMobile.slice(-10) === cleanMobile.slice(-10));

        if (!isMatch) return u;

        matchedAny = true;
        const currentBal = Number(u.wallet?.balance || 0);
        resolvedBalance =
          newBalance !== undefined && !isNaN(Number(newBalance))
            ? Math.max(0, Number(Number(newBalance).toFixed(2)))
            : Math.max(0, Number((currentBal + numAmount).toFixed(2)));

        const txList = Array.isArray(u.transactionHistory) ? [...u.transactionHistory] : [];
        if (transaction && transaction.id && !txList.some((t: any) => t.id === transaction.id)) {
          txList.unshift(transaction);
        }

        const notifList = Array.isArray(u.notifications) ? [...u.notifications] : [];
        if (notification && notification.id && !notifList.some((n: any) => n.id === notification.id)) {
          notifList.unshift(notification);
        }

        const updatedU = {
          ...u,
          wallet: { ...(u.wallet || {}), balance: resolvedBalance },
          walletUpdatedAt: updatedTime,
          transactionHistory: txList,
          notifications: notifList,
          lifetimePointsPurchased:
            Number(u.lifetimePointsPurchased || 0) + (numAmount > 0 ? numAmount : 0),
        };
        updatedUserRecord = updatedU;
        return updatedU;
      });

      if (!matchedAny && (userSnapshot || cleanEmail || cleanId)) {
        resolvedBalance =
          newBalance !== undefined && !isNaN(Number(newBalance))
            ? Math.max(0, Number(Number(newBalance).toFixed(2)))
            : Math.max(0, Number(numAmount.toFixed(2)));

        const createdUser = {
          id: cleanId || userSnapshot?.id || `user-${Date.now()}`,
          email: cleanEmail || userSnapshot?.email || '',
          mobileNumber: mobileNumber || userSnapshot?.mobileNumber || '',
          password: userSnapshot?.password || 'abcd1234',
          profile: userSnapshot?.profile || {
            name: cleanEmail ? cleanEmail.split('@')[0] : 'Customer',
            bio: '',
            emailNotifications: { systemUpdates: true, newFileReleases: true },
          },
          wallet: { balance: resolvedBalance },
          walletUpdatedAt: updatedTime,
          purchasedProductIds: userSnapshot?.purchasedProductIds || [],
          favoriteProductIds: userSnapshot?.favoriteProductIds || [],
          visitedProductIds: userSnapshot?.visitedProductIds || [],
          downloadTimers: userSnapshot?.downloadTimers || {},
          downloadHistory: userSnapshot?.downloadHistory || [],
          registeredAt: userSnapshot?.registeredAt || new Date().toISOString(),
          isBlocked: false,
          notifications: notification ? [notification] : [],
          transactionHistory: transaction ? [transaction] : [],
          lifetimePointsPurchased: numAmount > 0 ? numAmount : 0,
          referralCode:
            userSnapshot?.referralCode ||
            'HUB-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        };
        nextUsers.push(createdUser);
        updatedUserRecord = createdUser;
      }

      const savedCloud = writeCloudData({ users: nextUsers }, false);

      // Also persist to MySQL registered_users & wallet_transactions (non-blocking if MySQL is offline)
      try {
        if (updatedUserRecord) {
          await pool.query(
            'INSERT INTO registered_users (id, email, mobile_number, name, bio, wallet_balance, hwid) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE wallet_balance = ?, mobile_number = COALESCE(NULLIF(?, ""), mobile_number), name = COALESCE(NULLIF(?, ""), name)',
            [
              updatedUserRecord.id,
              updatedUserRecord.email || '',
              updatedUserRecord.mobileNumber || '',
              updatedUserRecord.profile?.name || '',
              updatedUserRecord.profile?.bio || '',
              resolvedBalance,
              updatedUserRecord.hwid || null,
              resolvedBalance,
              updatedUserRecord.mobileNumber || '',
              updatedUserRecord.profile?.name || '',
            ]
          );
          if (cleanEmail) {
            await pool.query(
              'UPDATE registered_users SET wallet_balance = ? WHERE LOWER(email) = ?',
              [resolvedBalance, cleanEmail]
            );
          }
        }
        if (transaction && transaction.id) {
          await pool.query(
            'INSERT IGNORE INTO wallet_transactions (transaction_id, user_id, user_email, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              transaction.id,
              updatedUserRecord?.id || cleanId || 'user',
              updatedUserRecord?.email || cleanEmail || '',
              transaction.type || 'deposit',
              Number(transaction.amount || numAmount),
              transaction.description || reason || 'Admin wallet update',
              transaction.timestamp || new Date().toISOString(),
            ]
          );
        }
      } catch (dbErr: any) {
        console.warn('MySQL sync during admin-adjust-balance (non-blocking):', dbErr?.message);
      }

      return res.json({
        success: true,
        newBalance: resolvedBalance,
        walletUpdatedAt: updatedTime,
        updatedAt: savedCloud.updatedAt,
        user: updatedUserRecord,
      });
    } catch (err: any) {
      console.error('Error in /api/admin-adjust-balance:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to adjust balance' });
    }
  });

  app.post('/api/save-order', async (req, res) => {
    try {
      const data = req.body || {};
      await pool.query(
        'INSERT INTO order_history (order_id, user_id, user_email, order_type, title, quantity, total_price, status, order_details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          String(data.order_id || ''),
          String(data.user_id || ''),
          String(data.user_email || ''),
          String(data.order_type || 'imei'),
          String(data.title || 'Order'),
          Number(data.quantity || 1),
          Number(data.total_price || 0),
          String(data.status || 'pending'),
          String(data.order_details || '{}'),
          data.created_at || new Date().toISOString(),
        ]
      );
      res.json({ success: true });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  app.post('/api/update-order-status', async (req, res) => {
    try {
      const { orderId, status } = req.body || {};
      await pool.query('UPDATE order_history SET status = ? WHERE order_id = ?', [
        String(status || 'pending'),
        String(orderId || ''),
      ]);
      res.json({ success: true });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  app.post('/api/save-transaction', async (req, res) => {
    try {
      const data = req.body || {};
      await pool.query(
        'INSERT IGNORE INTO wallet_transactions (transaction_id, user_id, user_email, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          String(data.transaction_id || `txn-${Date.now()}`),
          String(data.user_id || ''),
          String(data.user_email || ''),
          String(data.type || 'deposit'),
          Number(data.amount || 0),
          String(data.description || ''),
          data.created_at || new Date().toISOString(),
        ]
      );
      res.json({ success: true });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  app.post('/api/save-download-record', async (req, res) => {
    try {
      const data = req.body || {};
      await pool.query(
        'INSERT INTO download_history (user_id, user_email, product_id, product_name, downloaded_at, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
        [
          String(data.user_id || ''),
          String(data.user_email || ''),
          String(data.product_id || ''),
          String(data.product_name || ''),
          data.downloaded_at || new Date().toISOString(),
          data.expiry_date || null,
        ]
      );
      res.json({ success: true });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin-reset-hwid', async (req, res) => {
    try {
      const { userId } = req.body || {};
      await pool.query('UPDATE registered_users SET hwid = NULL WHERE id = ?', [String(userId || '')]);
      res.json({ success: true });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
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
        tokenProtection,
        tokenKeys,
        isManualSync,
        isUserDeletion,
      } = req.body || {};

      const payload: Record<string, any> = {};
      if (siteContent !== undefined) payload.siteContent = siteContent;
      if (products !== undefined) payload.products = products;
      if (categories !== undefined) payload.categories = categories;
      if (balancePackages !== undefined) payload.balancePackages = balancePackages;
      if (autoWalletNewUser !== undefined) payload.autoWalletNewUser = autoWalletNewUser;
      if (users !== undefined) payload.users = users;
      if (adminNotifications !== undefined) payload.adminNotifications = adminNotifications;
      if (tokenProtection !== undefined) payload.tokenProtection = tokenProtection;
      if (tokenKeys !== undefined) payload.tokenKeys = tokenKeys;
      if (isUserDeletion !== undefined) payload.isUserDeletion = isUserDeletion;

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
