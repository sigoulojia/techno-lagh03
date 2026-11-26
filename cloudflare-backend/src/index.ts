import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  type Product,
  type ProductColorFamily,
  type ProductSeries,
  type ProductVariant,
  type StoreCategory,
} from './defaultProducts';

export interface Env {
  techno_products_kv: KVNamespace;
  BOT_TOKEN?: string;
  ORDERS_BOT_TOKEN?: string;
  ADMIN_CHAT_ID?: string;
  SITE_URL?: string;
  ENCRYPTION_SECRET?: string;
}

const DEFAULT_BOT_TOKEN = '9152103628:AAGioopVyeNlPd2Nf-NQr2_1MYWVxv2Yf30';
const DEFAULT_ORDERS_BOT_TOKEN = '8712010200:AAHc0FJjY2MpFbFPt20i2UZ7J2YgLnN3bA8';
const DEFAULT_ADMIN_CHAT_ID = '-1004434185578';
const DEFAULT_SITE_URL = 'https://techno-laghouat.pages.dev';
const NTFY_TOPIC = 'techno-laghouat';
const NTFY_SERVER = 'https://ntfy.sh';
const NTFY_TOPICS = [
  'techno-laghouat',
  'techno-laghouat-5586000352',
  'technoowner',
  'techno03',
  'techno',
];

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function maskPhoneNumber(phone: string): string {
  const cleaned = (phone || '').trim();
  if (cleaned.length <= 4) return '•••';
  const prefix = cleaned.slice(0, 2);
  const suffix = cleaned.slice(-2);
  return `${prefix} •• •• •• ${suffix}`;
}

function maskCustomerName(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'عميل محترم';
  if (parts.length === 1) {
    return parts[0].slice(0, 2) + '•••';
  }
  return parts[0] + ' ' + parts[parts.length - 1].slice(0, 1) + '•••';
}

function generateSecureToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ─── Cryptographic Security & PIN Utilities (PBKDF2-SHA256 & Salt) ─────────────

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sha256Hex(str: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyAdminPin(env: Env, submittedPin: string): Promise<boolean> {
  const pin = submittedPin.trim();
  if (!pin) return false;

  if (env.techno_products_kv) {
    const salt = await env.techno_products_kv.get('auth:pin_salt');
    const expectedHash = await env.techno_products_kv.get('auth:pin_hash');

    if (salt && expectedHash) {
      const computedHash = await hashPin(pin, salt);
      return timingSafeEqual(computedHash, expectedHash);
    }

    // Legacy unhashed PIN check & automatic migration
    const legacy = await env.techno_products_kv.get('admin_pin');
    const legacyPin = (legacy && legacy.trim()) || '03000';
    if (pin === legacyPin) {
      await setAdminPin(env, pin);
      return true;
    }
  }

  if (pin === '03000') {
    if (env.techno_products_kv) {
      await setAdminPin(env, '03000');
    }
    return true;
  }

  return false;
}

async function setAdminPin(env: Env, newPin: string): Promise<void> {
  if (!env.techno_products_kv) return;
  const pin = newPin.trim();
  const salt = crypto.randomUUID().replace(/-/g, '') + generateSecureToken();
  const hash = await hashPin(pin, salt);
  await env.techno_products_kv.put('auth:pin_salt', salt);
  await env.techno_products_kv.put('auth:pin_hash', hash);
  await env.techno_products_kv.delete('admin_pin');
}

async function createAdminSession(env: Env): Promise<string> {
  const rawToken = crypto.randomUUID().replace(/-/g, '') + '.' + generateSecureToken();
  if (env.techno_products_kv) {
    const tokenHash = await sha256Hex(rawToken);
    await env.techno_products_kv.put(
      `session:${tokenHash}`,
      JSON.stringify({ createdAt: Date.now() }),
      { expirationTtl: 7 * 86400 },
    );
  }
  return rawToken;
}

async function verifyAdminSession(env: Env, cookieHeader: string): Promise<boolean> {
  if (!cookieHeader || !env.techno_products_kv) return false;
  const match = cookieHeader.match(/admin_session=([a-zA-Z0-9._-]+)/);
  if (!match) return false;
  const rawToken = match[1];
  const tokenHash = await sha256Hex(rawToken);
  const sessionData = await env.techno_products_kv.get(`session:${tokenHash}`);
  return Boolean(sessionData);
}

async function destroyAdminSession(env: Env, cookieHeader: string): Promise<void> {
  if (!cookieHeader || !env.techno_products_kv) return;
  const match = cookieHeader.match(/admin_session=([a-zA-Z0-9._-]+)/);
  if (!match) return;
  const rawToken = match[1];
  const tokenHash = await sha256Hex(rawToken);
  await env.techno_products_kv.delete(`session:${tokenHash}`);
}

async function checkPinBruteForce(
  env: Env,
  clientIp: string,
): Promise<{ locked: boolean; remainingMinutes: number }> {
  if (!env.techno_products_kv) return { locked: false, remainingMinutes: 0 };
  const raw = await env.techno_products_kv.get(`rl:pinfail:${clientIp}`);
  if (!raw) return { locked: false, remainingMinutes: 0 };
  try {
    const data = JSON.parse(raw);
    const count = Number(data.count || 0);
    const lockedUntil = Number(data.lockedUntil || 0);
    const now = Date.now();
    if (lockedUntil > now) {
      const remainingMinutes = Math.max(1, Math.ceil((lockedUntil - now) / 60000));
      return { locked: true, remainingMinutes };
    }
    if (count >= 5) {
      const lockDurationMs = 15 * 60 * 1000;
      await env.techno_products_kv.put(
        `rl:pinfail:${clientIp}`,
        JSON.stringify({ count, lockedUntil: now + lockDurationMs }),
        { expirationTtl: 15 * 60 },
      );
      return { locked: true, remainingMinutes: 15 };
    }
  } catch {}
  return { locked: false, remainingMinutes: 0 };
}

async function recordFailedPinAttempt(env: Env, clientIp: string): Promise<void> {
  if (!env.techno_products_kv) return;
  const key = `rl:pinfail:${clientIp}`;
  const raw = await env.techno_products_kv.get(key);
  let count = 0;
  if (raw) {
    try {
      const data = JSON.parse(raw);
      count = Number(data.count || 0);
    } catch {}
  }
  count += 1;
  const now = Date.now();
  const lockedUntil = count >= 5 ? now + 15 * 60 * 1000 : 0;
  await env.techno_products_kv.put(
    key,
    JSON.stringify({ count, lockedUntil, lastAttempt: now }),
    { expirationTtl: 15 * 60 },
  );
}

async function resetFailedPinAttempts(env: Env, clientIp: string): Promise<void> {
  if (!env.techno_products_kv) return;
  await env.techno_products_kv.delete(`rl:pinfail:${clientIp}`);
}

// ─── Admin Access Logs Tracking (IP, Status, Device, Location) ───────────────

export interface AdminAccessLog {
  id: string;
  ip: string;
  status: 'success' | 'failed' | 'lockout';
  userAgent: string;
  country: string;
  city: string;
  timestamp: string;
}

async function recordAdminAccessLog(
  env: Env,
  entry: Omit<AdminAccessLog, 'id'>,
): Promise<void> {
  if (!env.techno_products_kv) return;
  try {
    const raw = await env.techno_products_kv.get('admin_access_logs');
    const logs: AdminAccessLog[] = raw ? JSON.parse(raw) : [];
    const newEntry: AdminAccessLog = {
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ...entry,
    };
    logs.unshift(newEntry);
    const trimmed = logs.slice(0, 100);
    await env.techno_products_kv.put('admin_access_logs', JSON.stringify(trimmed));
  } catch {}
}

async function getAdminAccessLogs(env: Env): Promise<AdminAccessLog[]> {
  if (!env.techno_products_kv) return [];
  try {
    const raw = await env.techno_products_kv.get('admin_access_logs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function computeLoyaltyTier(points: number): string {
  if (points >= 1500) return 'black_vip';
  if (points >= 600) return 'gold';
  if (points >= 200) return 'silver';
  return 'classic';
}

function formatUserAgent(ua: string): string {
  if (!ua) return 'غير محدد';
  if (ua.includes('iPhone')) return '📱 iPhone (Safari)';
  if (ua.includes('Android')) return '📱 Android (Mobile)';
  if (ua.includes('Windows')) return '💻 Windows PC';
  if (ua.includes('Macintosh')) return '💻 Mac OS';
  if (ua.includes('Linux')) return '💻 Linux';
  return ua.slice(0, 32);
}

// ─── Store Phone KV Helpers ───────────────────────────────────────────────────

async function getStorePhone(env: Env): Promise<{ display: string; href: string }> {
  if (env.techno_products_kv) {
    try {
      const stored = await env.techno_products_kv.get('store_phone');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.display && parsed?.href) return parsed;
        if (typeof parsed === 'string') {
          return { display: parsed, href: 'tel:' + parsed.replace(/[^+\d]/g, '') };
        }
      }
    } catch {}
  }
  return { display: '0560 15 46 63', href: 'tel:+213560154663' };
}

async function setStorePhone(env: Env, phone: string): Promise<void> {
  if (!env.techno_products_kv) return;
  const cleanPhone = phone.trim();
  const phoneObj = {
    display: cleanPhone,
    href: 'tel:' + cleanPhone.replace(/[^+\d]/g, ''),
  };
  await env.techno_products_kv.put('store_phone', JSON.stringify(phoneObj));
}


// ─── AES-256-GCM Customer Data Encryption At-Rest ─────────────────────────────

async function getMasterEncryptionKey(env: Env): Promise<CryptoKey> {
  let masterSecret: string | null = env.ENCRYPTION_SECRET || null;
  if (!masterSecret && env.techno_products_kv) {
    masterSecret = await env.techno_products_kv.get('sec:master_enc_key');
    if (!masterSecret) {
      masterSecret = crypto.randomUUID() + '-' + generateSecureToken() + '-' + crypto.randomUUID();
      await env.techno_products_kv.put('sec:master_enc_key', masterSecret);
    }
  }
  if (!masterSecret) {
    masterSecret = 'techno-laghouat-master-key-2026-fallback';
  }
  const enc = new TextEncoder();
  const keyData = await crypto.subtle.digest('SHA-256', enc.encode(masterSecret));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptCustomerData(env: Env, data: any): Promise<string> {
  try {
    const key = await getMasterEncryptionKey(env);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const plainBytes = enc.encode(typeof data === 'string' ? data : JSON.stringify(data));
    const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes);
    return JSON.stringify({
      enc: 'AES-256-GCM',
      v: 1,
      iv: uint8ToBase64(iv),
      data: uint8ToBase64(new Uint8Array(cipherBuffer)),
    });
  } catch (err) {
    console.error('Encryption error:', err);
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
}

async function decryptCustomerData(env: Env, payload: string): Promise<any> {
  if (!payload || typeof payload !== 'string') return payload;
  if (!payload.includes('"enc":"AES-256-GCM"')) {
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }
  try {
    const envelope = JSON.parse(payload);
    if (envelope.enc === 'AES-256-GCM' && envelope.iv && envelope.data) {
      const key = await getMasterEncryptionKey(env);
      const iv = base64ToUint8(envelope.iv);
      const cipherBytes = base64ToUint8(envelope.data);
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as any },
        key,
        cipherBytes as any,
      );
      const text = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(text);
    }
  } catch (err) {
    console.error('Decryption error:', err);
  }
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

// ─── Anti-Bot & Input Sanitization Helpers ─────────────────────────────────────

function cleanAlgerianPhone(raw: string): string {
  return (raw || '')
    .replace(/[\s\-().+]/g, '')
    .replace(/^213/, '0')
    .trim();
}

function isFakeOrSpamPhone(phone: string): boolean {
  const cleaned = cleanAlgerianPhone(phone);
  if (!/^0[567]\d{8}$/.test(cleaned)) return true;
  const body = cleaned.slice(2);
  if (/^(\d)\1{7}$/.test(body)) return true;
  if (body === '12345678' || body === '87654321' || body === '01234567') return true;
  return false;
}

function sanitizeString(str: any, maxLen = 200): string {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLen)
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

function hasSpamUrlsOrScripts(str: string): boolean {
  if (!str) return false;
  const lower = str.toLowerCase();
  return (
    lower.includes('<script') ||
    lower.includes('javascript:') ||
    lower.includes('onload=') ||
    lower.includes('onerror=') ||
    lower.includes('http://') ||
    lower.includes('https://') ||
    lower.includes('.ru') ||
    lower.includes('.xyz') ||
    lower.includes('.click') ||
    lower.includes('.top')
  );
}

async function checkOrderRateLimits(
  env: Env,
  clientIp: string,
  phone: string,
): Promise<{ allowed: boolean; reason?: string }> {
  if (!env.techno_products_kv) return { allowed: true };

  const ipKey = `rl:order_ip:${clientIp}`;
  const ipRaw = await env.techno_products_kv.get(ipKey);
  const ipCount = ipRaw ? parseInt(ipRaw, 10) || 0 : 0;
  if (ipCount >= 4) {
    return {
      allowed: false,
      reason: 'تجاوزت الحد المسموح به لعدد الطلبات في فترة قصيرة. يرجى الانتظار 10 دقائق.',
    };
  }

  const phoneKey = `rl:order_phone:${phone}`;
  const lastOrdered = await env.techno_products_kv.get(phoneKey);
  if (lastOrdered) {
    return {
      allowed: false,
      reason: 'تم استلام طلب بهذا الرقم منذ لحظات وهو قيد المعالجة. يرجى الانتظار دقيقتين قبل إرسال طلب جديد.',
    };
  }

  return { allowed: true };
}

async function recordSuccessfulOrderRate(
  env: Env,
  clientIp: string,
  phone: string,
): Promise<void> {
  if (!env.techno_products_kv) return;
  const ipKey = `rl:order_ip:${clientIp}`;
  const ipRaw = await env.techno_products_kv.get(ipKey);
  const nextCount = (ipRaw ? parseInt(ipRaw, 10) || 0 : 0) + 1;
  await env.techno_products_kv.put(ipKey, nextCount.toString(), { expirationTtl: 600 });

  const phoneKey = `rl:order_phone:${phone}`;
  await env.techno_products_kv.put(phoneKey, Date.now().toString(), { expirationTtl: 120 });
}

async function getAdminPin(env: Env): Promise<string> {
  return 'مشفّر بنظام PBKDF2 و Salt';
}

async function getOrdersBotToken(env: Env): Promise<string> {
  if (env.techno_products_kv) {
    const custom = await env.techno_products_kv.get('orders_bot_token');
    if (custom && custom.trim()) {
      return custom.trim();
    }
  }
  return env.ORDERS_BOT_TOKEN || DEFAULT_ORDERS_BOT_TOKEN;
}

async function sendOrderAlertToTelegram(
  env: Env,
  order: any,
  origin: string,
): Promise<{ success: boolean; messageId?: number; error?: string; botUsed?: string }> {
  try {
    const ordersBotToken = await getOrdersBotToken(env);
    const itemsBotToken = env.BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const targetChatIds = Array.from(
      new Set([
        env.ADMIN_CHAT_ID || DEFAULT_ADMIN_CHAT_ID,
        '8805828834', // Direct private message to store owner
      ]),
    );

    const deliveryMethod = order.customer?.deliveryMethod || 'home';
    const deliveryTitle =
      deliveryMethod === 'pickup' || deliveryMethod === 'store_pickup'
        ? 'استلام مباشر من متجر تكنو الأغواط (وسط المدينة)'
        : deliveryMethod === 'city_delivery' || deliveryMethod === 'laghouat_city'
        ? 'توصيل لباب المنزل داخل مدينة الأغواط (100 دج)'
        : deliveryMethod === 'stop_desk'
        ? 'استلام من مكتب التوصيل — Stop Desk (ZR Express)'
        : 'توصيل لباب المنزل — À Domicile (ZR Express)';

    const wilayaText = order.customer?.wilaya || '03 - الأغواط';
    const communeText = order.customer?.commune || '';
    const rawPhone = (order.customer?.phone || '').trim();
    const dialPhone = rawPhone.replace(/[^\d+]/g, '');
    const cleanAddress = (order.customer?.address || '').trim();

    const lines: string[] = [
      `🛍️ <b>طلب جديد معتمد — متجر تكنو الأغواط</b> 🏢`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📋 <b>رقم الطلب:</b> <code>#${escapeHtml(order.orderId || '')}</code>`,
      `👤 <b>الاسم:</b> ${escapeHtml(order.customer?.fullName || '')}`,
      `📞 <b>الهاتف:</b> <code>${escapeHtml(rawPhone)}</code>`,
      `🚚 <b>طريقة الاستلام:</b> ${escapeHtml(deliveryTitle)}`,
      `📍 <b>الولاية:</b> ${escapeHtml(wilayaText)}${communeText ? ` — ${escapeHtml(communeText)}` : ''}`,
    ];

    if (cleanAddress) {
      lines.push(`🏠 <b>العنوان:</b> ${escapeHtml(cleanAddress)}`);
    }

    if (order.customer?.notes) {
      lines.push(`📝 <b>ملاحظة:</b> <i>${escapeHtml(order.customer.notes)}</i>`);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(
      `📦 <b>المنتجات المطلوبة (${order.totals?.itemCount ?? order.items?.length ?? 1}):</b>`,
    );

    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const optionLabel = item.variantLabel
          ? `القياس: ${item.variantLabel}`
          : item.colorName || 'قياسي';
        lines.push(
          `• <b>${escapeHtml(item.name || '')}</b> [${escapeHtml(optionLabel)}] (رقم: <code>${escapeHtml(item.sku || '')}</code>) × ${item.quantity || 1} = <b>${Number(
            item.lineTotalDzd || 0,
          ).toLocaleString()} د.ج</b>`,
        );
      }
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    const shipping = Number(order.totals?.shippingFeeDzd || 0);
    lines.push(
      `🛵 <b>رسوم التوصيل:</b> ${
        shipping === 0 ? 'مجاني (0 د.ج)' : `${shipping.toLocaleString()} د.ج`
      }`,
    );
    lines.push(
      `💰 <b>المبلغ الإجمالي للدفع:</b> <b>${Number(
        order.totals?.totalDzd || 0,
      ).toLocaleString()} د.ج</b> (عند الاستلام)`,
    );

    const inlineKeyboard: any[][] = [];
    if (dialPhone) {
      inlineKeyboard.push([
        {
          text: `📞 اتصال بالزبون (${rawPhone})`,
          url: `tel:${dialPhone}`,
        },
      ]);
    }
    inlineKeyboard.push([
      {
        text: '📲 فتح إشعارات ntfy',
        url: 'https://ntfy.sh/techno-laghouat',
      },
    ]);

    const sendToChat = async (targetId: string) => {
      const payload = {
        chat_id: targetId,
        text: lines.join('\n'),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      };

      // Broadcast order alert concurrently to BOTH Bot 1 (@techno03bot) and Bot 2 (@items03bot)
      const botTokensToSend = Array.from(new Set([ordersBotToken, itemsBotToken].filter(Boolean))) as string[];

      const sendPromises = botTokensToSend.map(async (token) => {
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify(payload),
          });

          const data = (await res.json()) as any;
          if (res.ok && data.ok) {
            return { success: true, messageId: data.result?.message_id, botUsed: token === ordersBotToken ? 'ordersBot' : 'itemsBot' };
          }
          return { success: false, error: data?.description || `HTTP ${res.status}` };
        } catch (botErr: any) {
          return { success: false, error: botErr?.message || String(botErr) };
        }
      });

      const sendResults = await Promise.allSettled(sendPromises);
      const successfulResult = sendResults.find(
        (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.success,
      );

      if (successfulResult) {
        return successfulResult.value;
      }

      return { success: false, error: 'Both ordersBot and itemsBot failed to dispatch alert' };
    };

    const results = await Promise.allSettled(targetChatIds.map((id) => sendToChat(id)));
    const firstSuccess = results.find(
      (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.success,
    );

    if (firstSuccess) {
      return firstSuccess.value;
    }
    return { success: false, error: 'Failed to send alert to target chats' };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

async function sendOrderAlertToNtfy(
  order: any,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const deliveryMethod = order.customer?.deliveryMethod || 'home';
    const deliveryTitle =
      deliveryMethod === 'pickup' || deliveryMethod === 'store_pickup'
        ? 'استلام مباشر من متجر تكنو الأغواط (وسط المدينة)'
        : deliveryMethod === 'city_delivery' || deliveryMethod === 'laghouat_city'
        ? 'توصيل لباب المنزل داخل مدينة الأغواط (100 دج)'
        : deliveryMethod === 'stop_desk'
        ? 'استلام من مكتب التوصيل — Stop Desk (ZR Express)'
        : 'توصيل لباب المنزل — À Domicile (ZR Express)';

    const wilayaText = order.customer?.wilaya || '03 - الأغواط';
    const communeText = order.customer?.commune || '';
    const rawPhone = (order.customer?.phone || '').trim();
    const dialPhone = rawPhone.replace(/[^\d+]/g, '');

    let body = `طلب جديد #${order.orderId || ''}\n`;
    body += `━━━━━━━━━━━━━━━━━━━━\n`;
    body += `العميل: ${order.customer?.fullName || ''}\n`;
    body += `الهاتف: ${rawPhone}\n`;
    body += `طريقة الاستلام: ${deliveryTitle}\n`;
    body += `الولاية: ${wilayaText}${communeText ? ` — ${communeText}` : ''}\n`;
    if (order.customer?.address) {
      body += `العنوان: ${order.customer.address}\n`;
    }
    if (order.customer?.notes) {
      body += `ملاحظات: ${order.customer.notes}\n`;
    }
    body += `━━━━━━━━━━━━━━━━━━━━\n`;
    body += `المنتجات المطلوبة:\n`;
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const optionLabel = item.variantLabel
          ? `القياس: ${item.variantLabel}`
          : item.colorName || 'قياسي';
        body += `• ${item.name} (${optionLabel} · رقم ${item.sku || ''}) × ${item.quantity || 1} = ${Number(
          item.lineTotalDzd || 0,
        ).toLocaleString()} د.ج\n`;
      }
    }
    body += `━━━━━━━━━━━━━━━━━━━━\n`;
    const shipping = Number(order.totals?.shippingFeeDzd || 0);
    body += `رسوم التوصيل: ${shipping === 0 ? 'مجاني' : `${shipping.toLocaleString()} د.ج`}\n`;
    body += `المبلغ الإجمالي للدفع: ${Number(
      order.totals?.totalDzd || 0,
    ).toLocaleString()} د.ج (عند الاستلام)`;

    const targetTopics = ['techno-laghouat', 'technoowner', 'techno03', 'technolagh03', 'techno'];
    const sendResults = await Promise.allSettled(
      targetTopics.map(async (topic) => {
        const payload: any = {
          topic,
          title: `طلب جديد #${order.orderId || ''} (${Number(
            order.totals?.totalDzd || 0,
          ).toLocaleString()} د.ج)`,
          message: body,
          priority: 5, // Priority 5 = Urgent/Max alert in ntfy
          tags: ['package', 'moneybag'],
        };

        if (dialPhone) {
          payload.actions = [
            {
              action: 'view',
              label: `اتصال بالعميل (${rawPhone})`,
              url: `tel:${dialPhone}`,
            },
            {
              action: 'view',
              label: 'رابط المتجر',
              url: 'https://techno-laghouat.pages.dev',
            },
          ];
        }

        const res = await fetch(NTFY_SERVER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(4000),
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json().catch(() => ({}))) as any;
        return data?.id;
      }),
    );

    const fulfilled = sendResults.find(
      (r): r is PromiseFulfilledResult<string | undefined> => r.status === 'fulfilled',
    );

    if (fulfilled) {
      return { success: true, messageId: fulfilled.value };
    }
    return { success: false, error: 'Failed to send to all ntfy topics' };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// Helper: Get site base URL (from KV custom domain, or env, or default)
async function getSiteUrl(env: Env): Promise<string> {
  if (env.techno_products_kv) {
    const custom = await env.techno_products_kv.get('site_url');
    if (custom && custom.trim().startsWith('http')) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  return (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

// Helper: Generate next purely numeric product ID (e.g. 71638, 71639...)
async function getNextNumericId(
  env: Env,
  existingProducts: Product[],
  requestedId?: string,
): Promise<string> {
  // If user explicitly provided a numeric ID (e.g. 8200) and it's not taken, use it
  if (requestedId) {
    const cleanNum = requestedId.replace(/[^0-9]/g, '');
    if (cleanNum && cleanNum.length >= 2) {
      const exists = existingProducts.some((p) => p.id === cleanNum || p.sku === cleanNum);
      if (!exists) {
        return cleanNum;
      }
    }
  }

  // Calculate highest numeric ID among existing products
  let maxNum = 71637;
  for (const p of existingProducts) {
    const numFromId = parseInt(p.id.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numFromId) && numFromId > 100 && numFromId < 1000000 && numFromId > maxNum) {
      maxNum = numFromId;
    }
    const numFromSku = parseInt(p.sku.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numFromSku) && numFromSku > 100 && numFromSku < 1000000 && numFromSku > maxNum) {
      maxNum = numFromSku;
    }
  }

  // Check stored KV sequence counter if any
  if (env.techno_products_kv) {
    const stored = await env.techno_products_kv.get('seq:numeric_product_id');
    if (stored) {
      const storedNum = parseInt(stored, 10);
      if (!isNaN(storedNum) && storedNum > maxNum) {
        maxNum = storedNum;
      }
    }
  }

  const nextId = (maxNum + 1).toString();
  if (env.techno_products_kv) {
    await env.techno_products_kv.put('seq:numeric_product_id', (maxNum + 1).toString());
  }
  return nextId;
}

// Helper: Send push notification to ntfy with 1-click copy action button
async function sendProductAddedNtfy(product: Product, productUrl: string): Promise<void> {
  try {
    const body = {
      topic: NTFY_TOPIC,
      title: `🎉 تمت إضافة منتج جديد: ${product.name}`,
      message: `المعرف الرقمي: ${product.id}\nالسعر: ${product.priceDzd.toLocaleString()} د.ج\nرابط صفحة المنتج:\n${productUrl}`,
      priority: 4,
      tags: ['package', 'sparkles'],
      click: productUrl,
      actions: [
        {
          action: 'copy',
          label: '📋 نسخ الرابط بنقرة زر',
          value: productUrl,
        },
        {
          action: 'view',
          label: '🌐 فتح صفحة المنتج',
          url: productUrl,
        },
      ],
    };

    await fetch(NTFY_SERVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Error sending ntfy notification for new product:', err);
  }
}

// Helper: Get products from KV (empty array if none or uninitialized)
async function getProducts(env: Env): Promise<Product[]> {
  if (!env.techno_products_kv) {
    return [];
  }
  const raw = await env.techno_products_kv.get('products');
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper: Save products to KV
async function saveProducts(env: Env, products: Product[]): Promise<void> {
  if (env.techno_products_kv) {
    await env.techno_products_kv.put('products', JSON.stringify(products));
  }
}

// Helper: Get dynamic store categories from KV (empty array if none or uninitialized)
async function getCategories(env: Env): Promise<StoreCategory[]> {
  if (!env.techno_products_kv) return [];
  const raw = await env.techno_products_kv.get('categories');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper: Save categories to KV
async function saveCategories(env: Env, categories: StoreCategory[]): Promise<void> {
  if (env.techno_products_kv) {
    await env.techno_products_kv.put('categories', JSON.stringify(categories));
  }
}

export interface StorePack {
  id: string;
  sku: string;
  name: string;
  badge: string;
  targetAudience: string;
  tagline: string;
  description: string;
  items: string[];
  originalPriceDzd: number;
  packPriceDzd: number;
  savingsDzd: number;
  imageUrl?: string;
  featured?: boolean;
}

// Helper: Get store packs from KV
async function getPacks(env: Env): Promise<StorePack[]> {
  if (!env.techno_products_kv) return [];
  const raw = await env.techno_products_kv.get('packs');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper: Save packs to KV
async function savePacks(env: Env, packs: StorePack[]): Promise<void> {
  if (env.techno_products_kv) {
    await env.techno_products_kv.put('packs', JSON.stringify(packs));
  }
}

// Helper: Create or retrieve a category by exact Arabic/custom name
async function ensureCategory(env: Env, rawName: string): Promise<StoreCategory> {
  const cleanName = rawName.trim();
  const categories = await getCategories(env);
  const existing = categories.find(
    (c) => c.name.trim().toLowerCase() === cleanName.toLowerCase(),
  );
  if (existing) return existing;

  const newCat: StoreCategory = {
    id: `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    createdAt: new Date().toISOString(),
  };
  await saveCategories(env, [...categories, newCat]);
  return newCat;
}

// Helper: Build clean product URL ending directly with the product number
function buildCleanProductUrl(siteUrl: string, productNumber: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/p/${encodeURIComponent(productNumber.trim())}`;
}

// Helper: Parse size/shape/variant lines such as:
// "شكل قطة : 2500 : مبطنة بجيب إضافي" OR "صغير : 1800\nمتوسط : 2500\nكبير : 3400"
function parseVariantsText(raw: string): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const chunks = raw
    .split(/[\n,،]+/)
    .map((c) => c.trim())
    .filter(Boolean);

  chunks.forEach((chunk, index) => {
    // 3 parts: "اسم الشكل : السعر : الوصف"
    const match3 = chunk.match(/^(.+?)\s*[:=\-–—]\s*([0-9][0-9\s,.]*(?:\s*د\.?ج)?)\s*[:=\-–—]\s*(.+)$/);
    if (match3) {
      const label = match3[1].trim();
      const price = parseInt(match3[2].replace(/[^0-9]/g, ''), 10);
      const desc = match3[3].trim();
      if (label && price > 0) {
        let sku: string | undefined = undefined;
        const skuMatch = desc.match(/^(?:#|رقم\s*[:#]?|كود\s*[:#]?)\s*([0-9a-zA-Z\-_]+)$/i);
        if (skuMatch) {
          sku = skuMatch[1];
        }
        variants.push({
          id: `v-${index + 1}-${Date.now().toString(36).slice(-3)}`,
          label,
          name: label,
          priceDzd: price,
          sku,
          description: desc,
        });
        return;
      }
    }

    // 2 parts: "اسم الشكل : السعر"
    const match2 = chunk.match(/^(.+?)\s*[:=\-–—]\s*([0-9][0-9\s,.]*(?:\s*د\.?ج)?)$/);
    if (match2) {
      const label = match2[1].trim();
      const price = parseInt(match2[2].replace(/[^0-9]/g, ''), 10);
      if (label && price > 0) {
        variants.push({
          id: `v-${index + 1}-${Date.now().toString(36).slice(-3)}`,
          label,
          name: label,
          priceDzd: price,
        });
        return;
      }
    }

    // Fallback: "صغير 1800"
    const spaceMatch = chunk.match(/^(.+?)\s+([0-9]{2,7})$/);
    if (spaceMatch) {
      const label = spaceMatch[1].trim();
      const price = parseInt(spaceMatch[2], 10);
      if (label && price > 0) {
        variants.push({
          id: `v-${index + 1}-${Date.now().toString(36).slice(-3)}`,
          label,
          name: label,
          priceDzd: price,
        });
      }
    }
  });

  return variants;
}

interface WizardDraft {
  categoryId?: string;
  categoryName?: string;
  name?: string;
  productNumber?: string;
  priceDzd?: number;
  dimensions?: string;
  variants?: ProductVariant[];
  description?: string;
  targetPhotoCount?: number;
  images?: string[];
  targetProductId?: string; // Used when appending photos to an existing product
  currentShape?: {
    image?: string;
    name?: string;
    sku?: string;
    priceDzd?: number;
    description?: string;
    dimensions?: string;
    subSizes?: Array<{
      label: string;
      priceDzd: number;
      sku?: string;
      description?: string;
      dimensions?: string;
    }>;
  };
}

interface PackDraft {
  name?: string;
  badge?: string;
  targetAudience?: string;
  tagline?: string;
  description?: string;
  items?: string[];
  originalPriceDzd?: number;
  packPriceDzd?: number;
  savingsDzd?: number;
  imageUrl?: string;
}

interface BotSessionState {
  step:
    | 'cat_create_name'
    | 'prod_pick_category'
    | 'prod_create_category'
    | 'prod_name'
    | 'prod_number'
    | 'prod_pricing_mode'
    | 'prod_single_price'
    | 'prod_dimensions'
    | 'prod_variants'
    | 'prod_description'
    | 'prod_photo_count'
    | 'prod_photos'
    | 'shape_photo'
    | 'shape_name'
    | 'shape_pricing_choice'
    | 'shape_price'
    | 'shape_multi_sizes'
    | 'shape_desc'
    | 'shape_dims'
    | 'shape_ask_more'
    | 'existing_add_photos'
    | 'pack_name'
    | 'pack_desc'
    | 'pack_items'
    | 'pack_pricing'
    | 'pack_photo';
  draft: WizardDraft;
  packDraft?: PackDraft;
  updatedAt: number;
}

async function getSession(env: Env, chatId: any): Promise<BotSessionState | null> {
  if (!env.techno_products_kv) return null;
  const raw = await env.techno_products_kv.get(`wizard:${chatId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BotSessionState;
    // Expire stale sessions after 2 hours
    if (Date.now() - (parsed.updatedAt || 0) > 2 * 60 * 60 * 1000) {
      await clearSession(env, chatId);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function setSession(env: Env, chatId: any, state: BotSessionState): Promise<void> {
  if (!env.techno_products_kv) return;
  await env.techno_products_kv.put(
    `wizard:${chatId}`,
    JSON.stringify({ ...state, updatedAt: Date.now() }),
    { expirationTtl: 7200 },
  );
}

async function clearSession(env: Env, chatId: any): Promise<void> {
  if (!env.techno_products_kv) return;
  await env.techno_products_kv.delete(`wizard:${chatId}`);
}

// Helper: Send Telegram API request
async function callTelegram(
  botToken: string,
  method: string,
  body: Record<string, any>,
): Promise<any> {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Helper: Select the optimal lightweight web photo from Telegram's photo sizes array
// (Picks ~600-800px width/height, reducing file size by 75-85% while keeping retina clarity)
function selectOptimalWebPhoto(photos: any[]) {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  if (photos.length <= 2) return photos[photos.length - 1];
  const balanced = photos.find(
    (p) => (p.width >= 600 && p.width <= 900) || (p.height >= 600 && p.height <= 900),
  );
  if (balanced) return balanced;
  return photos[photos.length - 2];
}

// Helper: Download Telegram photo and store in KV
async function downloadTelegramPhoto(
  env: Env,
  botToken: string,
  fileId: string,
  origin: string,
): Promise<string> {
  try {
    const fileInfoRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
    );
    const fileInfo = (await fileInfoRes.json()) as any;
    if (!fileInfo.ok || !fileInfo.result?.file_path) {
      return '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg';
    }

    const filePath = fileInfo.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const imgRes = await fetch(downloadUrl);
    if (!imgRes.ok) {
      return downloadUrl;
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const imageKey = `img:${fileId}`;
    if (env.techno_products_kv) {
      await env.techno_products_kv.put(imageKey, arrayBuffer, {
        metadata: { contentType: 'image/jpeg' },
      });
      return `${origin}/api/images/${fileId}`;
    }
    return downloadUrl;
  } catch (e) {
    console.error('Error downloading Telegram photo:', e);
    return '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg';
  }
}

// Helper to parse product details from caption or text (Quick Mode)
function parseProductDetails(text: string) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  let name = '';
  let price = 0;
  let colorName = '';
  let colorFamily: ProductColorFamily = 'black';
  let series: ProductSeries = 'general';
  let seriesLabel = 'معروضات عامة';
  let description = '';
  let requestedId = '';
  let variants: ProductVariant[] = [];

  for (const line of lines) {
    if (line.includes('اسم:') || line.includes('الاسم:')) {
      name = line.split(':').slice(1).join(':').trim() || '';
    } else if (
      line.includes('قياسات:') ||
      line.includes('القياسات:') ||
      line.includes('احجام:') ||
      line.includes('الأحجام:') ||
      line.includes('مقاسات:') ||
      line.includes('المقاسات:') ||
      line.includes('أشكال:') ||
      line.includes('الأشكال:') ||
      line.includes('اشكال:') ||
      line.includes('الاشكال:') ||
      line.includes('موديلات:') ||
      line.includes('الموديلات:')
    ) {
      const rawVariants = line.split(':').slice(1).join(':').trim();
      variants = [...variants, ...parseVariantsText(rawVariants)];
    } else if (line.includes('سعر:') || line.includes('السعر:')) {
      const num = line.replace(/[^0-9]/g, '');
      price = parseInt(num, 10) || 0;
    } else if (line.includes('لون:') || line.includes('اللون:')) {
      colorName = line.split(':').slice(1).join(':').trim() || '';
      if (colorName.includes('اسود') || colorName.includes('أسود')) colorFamily = 'black';
      else if (colorName.includes('بني') || colorName.includes('جملي')) colorFamily = 'brown';
      else if (colorName.includes('ازرق') || colorName.includes('أزرق')) colorFamily = 'blue';
      else if (colorName.includes('احمر') || colorName.includes('أحمر')) colorFamily = 'red';
      else if (colorName.includes('اخضر') || colorName.includes('أخضر')) colorFamily = 'green';
      else colorFamily = 'other';
    } else if (
      line.includes('صنف:') ||
      line.includes('الصنف:') ||
      line.includes('قسم:') ||
      line.includes('القسم:') ||
      line.includes('فئة:') ||
      line.includes('الفئة:') ||
      line.includes('سلسلة:') ||
      line.includes('السلسلة:') ||
      line.includes('نوع:') ||
      line.includes('النوع:')
    ) {
      const val = line.split(':').slice(1).join(':').trim() || '';
      if (val) {
        seriesLabel = val;
        series = val;
      }
    } else if (line.includes('وصف:') || line.includes('الوصف:')) {
      description = line.split(':').slice(1).join(':').trim() || '';
    } else if (
      line.includes('رقم:') ||
      line.includes('الرقم:') ||
      line.includes('رقم المنتج:') ||
      line.includes('معرف:') ||
      line.includes('المعرف:') ||
      line.includes('مرجع:') ||
      line.includes('المرجع:') ||
      line.includes('كود:') ||
      line.toLowerCase().includes('id:') ||
      line.toLowerCase().includes('sku:')
    ) {
      const num = line.replace(/[^0-9]/g, '');
      if (num) requestedId = num;
    }
  }

  // Fallback if not labeled with colons: parse "Name | Price | Category | Description | Number"
  if (!name && text.includes('|')) {
    const parts = text.split('|').map((p) => p.trim());
    name = parts[0] || '';
    price = parseInt(parts[1]?.replace(/[^0-9]/g, '') || '0', 10) || 0;
    if (parts[2]) {
      seriesLabel = parts[2];
      series = parts[2];
    }
    if (parts[3]) description = parts[3];
    if (parts[4]) {
      const num = parts[4].replace(/[^0-9]/g, '');
      if (num) requestedId = num;
    }
  } else if (!name && lines.length >= 2) {
    name = lines[0];
    price = parseInt(lines[1].replace(/[^0-9]/g, ''), 10) || 0;
    if (lines[2]) description = lines.slice(2).join(' ');
  }

  const minVariantPrice =
    variants.length > 0 ? Math.min(...variants.map((v) => v.priceDzd)) : 0;
  const resolvedPrice = minVariantPrice > 0 ? minVariantPrice : price > 0 ? price : 1000;

  return {
    name: name || 'منتج جديد من تكنو الأغواط',
    price: resolvedPrice,
    variants,
    colorName: colorName || 'قياسي',
    colorFamily,
    colorHex:
      colorFamily === 'black'
        ? '#1F2024'
        : colorFamily === 'blue'
        ? '#1D4ED8'
        : colorFamily === 'red'
        ? '#DC2626'
        : colorFamily === 'green'
        ? '#15803D'
        : colorFamily === 'brown'
        ? '#6F3119'
        : '#4B5563',
    series,
    seriesLabel: seriesLabel || 'معروضات عامة',
    description: description || 'منتج أصلي معتمد متوفر في فرع تكنو الأغواط.',
    requestedId,
  };
}

// Helper: send or edit message smoothly
async function sendOrEditMessage(
  botToken: string,
  chatId: any,
  messageId: number | undefined,
  text: string,
  keyboard: any[][],
): Promise<any> {
  if (messageId) {
    try {
      const res = await callTelegram(botToken, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
      if (res && res.ok) return res;
    } catch {
      // Fallback to sendMessage
    }
  }
  return callTelegram(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard },
  });
}

// Helper: Send interactive central dashboard menu
async function sendDashboardMenu(
  botToken: string,
  chatId: any,
  env: Env,
  editMessageId?: number,
): Promise<void> {
  const products = await getProducts(env);
  const categories = await getCategories(env);
  const packs = await getPacks(env);
  const siteUrl = await getSiteUrl(env);
  const adminPin = await getAdminPin(env);

  const text =
    `🏢 <b>لوحة التحكم المركزية — متجر تكنو الأغواط</b> ✨\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `• 📦 <b>المنتجات المعروضة:</b> <code>${products.length}</code> منتج\n` +
    `• 🗂️ <b>الأقسام المنشأة:</b> <code>${categories.length}</code> أقسام\n` +
    `• 🎁 <b>الباقات الخاصة (Packs):</b> <code>${packs.length}</code> باقات\n` +
    `• 🌐 <b>رابط المتجر:</b> <code>${siteUrl}</code>\n` +
    `• 🔒 <b>حماية لوحة الإدارة (PIN):</b> مشفر بنظام PBKDF2 و Salt\n` +
    `• 🛡️ <b>تشفير بيانات الزبائن:</b> مشفرة بالكامل بـ AES-256-GCM\n` +
    `• ⚡ <b>المزامنة السحابية:</b> متصلة وفورية (Cloudflare KV)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>اختر من الأزرار التفاعلية أدناه لإدارة المعروضات والأقسام والباقات الحصرية:</i>`;

  const keyboard: any[][] = [
    [
      { text: '➕ إضافة منتج جديد (تفاعلي)', callback_data: 'menu:add_wizard' },
      { text: '🎁 إضافة باقة (Pack)', callback_data: 'menu:add_pack_wizard' },
    ],
    [
      { text: `🗂️ إدارة الأقسام (${categories.length})`, callback_data: 'menu:categories' },
      { text: `📦 قائمة المعروضات (${products.length})`, callback_data: 'menu:list' },
    ],
    [
      { text: `🎁 قائمة الباقات (${packs.length})`, callback_data: 'menu:packs_list' },
      { text: '🗑️ حذف منتج', callback_data: 'menu:delete' },
    ],
    [
      { text: '📊 إحصائيات المتجر', callback_data: 'menu:stats' },
      { text: '🔔 قنوات التنبيهات والطلبات', callback_data: 'menu:alerts_info' },
    ],
    [
      { text: '⚠️ مسح كل المنتجات', callback_data: 'menu:clear_ask' },
    ],
  ];

  await sendOrEditMessage(botToken, chatId, editMessageId, text, keyboard);
}

// Sub-helper: Send categories management menu
async function sendCategoriesMenu(
  botToken: string,
  chatId: any,
  env: Env,
  editMessageId?: number,
): Promise<void> {
  const categories = await getCategories(env);
  const products = await getProducts(env);

  let text =
    `📂 <b>إدارة أقسام متجر تكنو الأغواط (${categories.length}):</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`;

  if (categories.length === 0) {
    text +=
      'لم تقم بإضافة أي أقسام بعد.\n' +
      'اضغط على <b>«➕ إضافة قسم جديد»</b> أو أرسل الأمر:\n' +
      '<code>/addcat ساعات</code> أو <code>/addcat أدوات مكتبية</code>\n';
  } else {
    categories.forEach((cat, idx) => {
      const count = products.filter(
        (p) => p.categoryId === cat.id || p.seriesLabel === cat.name,
      ).length;
      text += `${idx + 1}. <b>${escapeHtml(cat.name)}</b> — (${count} منتج)\n`;
    });
  }

  const keyboard: any[][] = [
    [{ text: '➕ إضافة قسم جديد', callback_data: 'cat:add_prompt' }],
  ];

  if (categories.length > 0) {
    keyboard.push([{ text: '🗑️ حذف قسم', callback_data: 'cat:delete_menu' }]);
  }

  keyboard.push([
    { text: '➕ إضافة منتج لقسم', callback_data: 'menu:add_wizard' },
    { text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' },
  ]);

  await sendOrEditMessage(botToken, chatId, editMessageId, text, keyboard);
}

// Sub-helper: Send products list
async function sendProductsList(
  botToken: string,
  chatId: any,
  products: Product[],
  siteUrl: string,
  editMessageId?: number,
): Promise<void> {
  if (products.length === 0) {
    const emptyText =
      '⚠️ <b>المتجر فارغ حالياً!</b>\n\n' +
      'لا توجد أي معروضات حالياً في المتجر.\n' +
      'اضغط على «➕ إضافة منتج جديد» لاختيار القسم والقياسات وعدد الصور بسهولة.';
    const emptyKeyboard = [
      [{ text: '➕ إضافة منتج جديد (تفاعلي)', callback_data: 'menu:add_wizard' }],
      [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
    ];
    await sendOrEditMessage(botToken, chatId, editMessageId, emptyText, emptyKeyboard);
    return;
  }

  let text =
    `📋 <b>قائمة المعروضات في متجر تكنو الأغواط (${products.length}):</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`;

  const keyboard: any[][] = [];

  products.forEach((p, index) => {
    const itemUrl = buildCleanProductUrl(siteUrl, p.id);
    const photosCount = Array.isArray(p.images) && p.images.length > 0 ? p.images.length : 1;
    const variantsCount = Array.isArray(p.variants) ? p.variants.length : 0;
    const priceInfo =
      variantsCount > 0
        ? `ابتداءً من ${p.priceDzd.toLocaleString()} د.ج (${variantsCount} قياسات)`
        : `${p.priceDzd.toLocaleString()} د.ج`;

    text +=
      `${index + 1}. <b>${escapeHtml(p.name)}</b>\n` +
      `   📂 ${escapeHtml(p.categoryName || p.seriesLabel || 'عام')} · 📸 ${photosCount} صور · 🔢 رقم: <code>${p.id}</code>\n` +
      `   💰 ${priceInfo}\n` +
      `   🔗 <code>${itemUrl}</code>\n`;

    keyboard.push([
      {
        text: `📸 +صور (${p.id})`,
        callback_data: `addphotos:${p.id}`,
      },
      {
        text: `🗑️ حذف (${p.id})`,
        callback_data: `del_ask:${p.id}`,
      },
    ]);
  });

  keyboard.push([
    { text: '➕ إضافة منتج جديد', callback_data: 'menu:add_wizard' },
    { text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' },
  ]);

  await sendOrEditMessage(botToken, chatId, editMessageId, text, keyboard);
}

// Sub-helper: Send delete menu
async function sendDeleteMenu(
  botToken: string,
  chatId: any,
  products: Product[],
  editMessageId?: number,
): Promise<void> {
  if (products.length === 0) {
    const emptyText = '⚠️ <b>المتجر فارغ حالياً!</b>\nلا توجد أي منتجات لحذفها.';
    const emptyKeyboard = [
      [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
    ];
    await sendOrEditMessage(botToken, chatId, editMessageId, emptyText, emptyKeyboard);
    return;
  }

  const text = '🗑️ <b>اختر المنتج الذي تريد حذفه نهائياً من المتجر:</b>';
  const keyboard: any[][] = products.map((p) => [
    {
      text: `🗑️ حذف: ${p.shortName || p.name.slice(0, 22)} (${p.sku})`,
      callback_data: `del_ask:${p.id}`,
    },
  ]);

  keyboard.push([{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }]);

  await sendOrEditMessage(botToken, chatId, editMessageId, text, keyboard);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const botToken = env.BOT_TOKEN || DEFAULT_BOT_TOKEN;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 1. Health check & status
    if (url.pathname === '/' || url.pathname === '/api/health') {
      const products = await getProducts(env);
      return jsonResponse({
        status: 'online',
        service: 'Techno Laghouat Backend (Cloudflare Worker)',
        productsCount: products.length,
        bot: '@items03bot',
        ordersBot: '@techno03bot',
        endpoints: {
          products: '/api/products',
          orders: '/api/orders',
          webhook: '/telegram/webhook',
          setWebhook: '/telegram/set-webhook',
          ntfyApp: '/ntfy/open',
        },
      });
    }

    // 2. GET /api/products (includes dynamic categories)
    if (url.pathname === '/api/products' && request.method === 'GET') {
      const [products, categories] = await Promise.all([
        getProducts(env),
        getCategories(env),
      ]);
      return jsonResponse({
        success: true,
        count: products.length,
        products,
        categories,
      });
    }

    // 2b. GET /api/categories
    if (url.pathname === '/api/categories' && request.method === 'GET') {
      const categories = await getCategories(env);
      return jsonResponse({ success: true, count: categories.length, categories });
    }

    // 2c. POST /api/categories
    if (url.pathname === '/api/categories' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { name?: string };
        if (!body?.name || !body.name.trim()) {
          return jsonResponse({ error: 'Category name is required' }, 400);
        }
        const category = await ensureCategory(env, body.name.trim());
        const categories = await getCategories(env);
        return jsonResponse({ success: true, category, categories });
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    // 2d. GET /api/packs
    if (url.pathname === '/api/packs' && request.method === 'GET') {
      const packs = await getPacks(env);
      return jsonResponse({ success: true, count: packs.length, packs });
    }

    // 2e. POST /api/packs
    if (url.pathname === '/api/packs' && request.method === 'POST') {
      try {
        const body = (await request.json()) as Partial<StorePack>;
        if (!body.name || !body.packPriceDzd) {
          return jsonResponse({ error: 'Name and packPriceDzd are required' }, 400);
        }
        const packs = await getPacks(env);
        const newPack: StorePack = {
          id: body.id || `pack-${Date.now()}`,
          sku: body.sku || `PACK-${Math.floor(100 + Math.random() * 900)}`,
          name: body.name.trim(),
          badge: body.badge || 'باقة خاصة',
          targetAudience: body.targetAudience || 'المحترفين والطلبة',
          tagline: body.tagline || body.name.trim(),
          description: body.description || '',
          items: Array.isArray(body.items) ? body.items : [],
          originalPriceDzd: Number(body.originalPriceDzd || body.packPriceDzd),
          packPriceDzd: Number(body.packPriceDzd),
          savingsDzd: Number(body.savingsDzd || (Number(body.originalPriceDzd || 0) - Number(body.packPriceDzd))),
          imageUrl: body.imageUrl,
          featured: true,
        };
        packs.unshift(newPack);
        await savePacks(env, packs);
        return jsonResponse({ success: true, pack: newPack, count: packs.length }, 201);
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    // 2f. DELETE /api/packs/:id
    if (url.pathname.startsWith('/api/packs/') && request.method === 'DELETE') {
      const packId = decodeURIComponent(url.pathname.replace('/api/packs/', ''));
      const packs = await getPacks(env);
      const filtered = packs.filter((p) => p.id !== packId);
      await savePacks(env, filtered);
      return jsonResponse({ success: true, count: filtered.length });
    }

    // 2d. DELETE /api/categories/:id
    if (url.pathname.startsWith('/api/categories/') && request.method === 'DELETE') {
      const catId = decodeURIComponent(url.pathname.replace('/api/categories/', ''));
      const categories = await getCategories(env);
      const filtered = categories.filter((c) => c.id !== catId);
      await saveCategories(env, filtered);
      return jsonResponse({ success: true, categories: filtered });
    }

    // 3. POST /api/products (Add product via JSON REST)
    if (url.pathname === '/api/products' && request.method === 'POST') {
      try {
        const body = (await request.json()) as Partial<Product>;
        if (!body.name || (!body.priceDzd && (!body.variants || body.variants.length === 0))) {
          return jsonResponse({ error: 'Name and priceDzd or variants are required' }, 400);
        }

        const products = await getProducts(env);
        const newId = await getNextNumericId(env, products, body.id || body.sku);
        const newSku = newId;
        const images =
          Array.isArray(body.images) && body.images.length > 0
            ? body.images
            : [body.image || '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg'];
        const variants = Array.isArray(body.variants) ? body.variants : [];
        const basePrice =
          variants.length > 0
            ? Math.min(...variants.map((v) => Number(v.priceDzd)))
            : Number(body.priceDzd);

        const categoryLabel = body.categoryName || body.seriesLabel || 'معروضات عامة';
        const catObj = await ensureCategory(env, categoryLabel);

        const newProduct: Product = {
          id: newId,
          sku: newSku,
          name: body.name,
          shortName: body.shortName || body.name,
          brand: body.brand || 'TECHNO STATIONERY',
          series: catObj.id,
          seriesLabel: catObj.name,
          categoryId: catObj.id,
          categoryName: catObj.name,
          colorFamily: body.colorFamily || 'black',
          colorName: body.colorName || 'قياسي',
          colorHex: body.colorHex || '#1F2024',
          priceDzd: basePrice,
          image: images[0],
          images,
          ...(variants.length > 0 ? { variants } : {}),
          alt: body.alt || `${body.name} - رقم المنتج ${newSku}`,
          summary: body.summary || body.description || body.name,
          description: body.description || 'منتج أصلي متوفر في متجر تكنو الأغواط',
          availabilityText: 'متوفر في فرع الأغواط',
          featuredRank: 1,
          siblingIds: [],
          specs: body.specs || [
            { label: 'رقم المنتج', value: newSku },
            { label: 'القسم', value: catObj.name },
            ...(variants.length > 0
              ? [{ label: 'القياسات المتوفرة', value: variants.map((v) => v.label).join(' · ') }]
              : []),
          ],
          highlights: body.highlights || ['منتج أصلي معتمد متوفر في فرع تكنو الأغواط'],
        };

        const updated = [newProduct, ...products];
        await saveProducts(env, updated);

        const siteUrl = await getSiteUrl(env);
        const productUrl = buildCleanProductUrl(siteUrl, newProduct.id);
        ctx.waitUntil(sendProductAddedNtfy(newProduct, productUrl));

        return jsonResponse({
          success: true,
          product: newProduct,
          productUrl,
          count: updated.length,
        });
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    // 4. DELETE /api/products (Delete all products)
    if (url.pathname === '/api/products' && request.method === 'DELETE') {
      await saveProducts(env, []);
      return jsonResponse({ success: true, message: 'All products deleted', count: 0 });
    }

    // 4b. POST /api/clear (Clear all products)
    if (url.pathname === '/api/clear' && request.method === 'POST') {
      await saveProducts(env, []);
      return jsonResponse({ success: true, message: 'All products cleared', count: 0 });
    }

    // 4b2. POST/GET /api/reset or /api/seed (Wipes everything clean)
    if ((url.pathname === '/api/reset' || url.pathname === '/api/seed') && (request.method === 'POST' || request.method === 'GET')) {
      await saveProducts(env, []);
      await saveCategories(env, []);
      return jsonResponse({
        success: true,
        message: 'Store cleared to 0 products and 0 categories.',
        productsCount: 0,
        categoriesCount: 0,
        products: [],
      });
    }

    // 4c. DELETE /api/products/:id
    if (url.pathname.startsWith('/api/products/') && request.method === 'DELETE') {
      const idOrSku = url.pathname.replace('/api/products/', '');
      const products = await getProducts(env);
      const filtered = products.filter((p) => p.id !== idOrSku && p.sku !== idOrSku);
      const deletedCount = products.length - filtered.length;
      if (deletedCount === 0) {
        return jsonResponse({ error: 'Product not found' }, 404);
      }
      await saveProducts(env, filtered);
      return jsonResponse({ success: true, message: 'Product deleted', remainingCount: filtered.length });
    }

    // 5. GET /api/images/:id (Serve image stored in Cloudflare KV)
    if (url.pathname.startsWith('/api/images/')) {
      const imageId = url.pathname.replace('/api/images/', '');
      if (env.techno_products_kv) {
        const imageBytes = await env.techno_products_kv.get(`img:${imageId}`, 'arrayBuffer');
        if (imageBytes) {
          return new Response(imageBytes, {
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000, immutable',
              ...CORS_HEADERS,
            },
          });
        }
      }
      return new Response('Image not found', { status: 404 });
    }

        // 5b. POST /api/upload-image (Upload & store compressed product image in KV)
    if (url.pathname === '/api/upload-image' && request.method === 'POST') {
      try {
        const contentType = request.headers.get('content-type') || '';
        let imageBytes: ArrayBuffer | null = null;

        if (contentType.includes('application/json')) {
          const body: any = await request.json();
          const base64Data = body.data || body.image || '';
          if (base64Data) {
            const cleanBase64 = base64Data.replace(/^data:image\/[a-z0-9.+]+;base64,/, '');
            const binaryString = atob(cleanBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            imageBytes = bytes.buffer;
          }
        } else if (contentType.includes('multipart/form-data')) {
          const form = await request.formData();
          const file = form.get('image') || form.get('file');
          if (file && typeof (file as any).arrayBuffer === 'function') {
            imageBytes = await (file as any).arrayBuffer();
          }
        } else {
          imageBytes = await request.arrayBuffer();
        }

        if (!imageBytes || imageBytes.byteLength === 0) {
          return jsonResponse({ error: 'No image data provided' }, 400);
        }

        const imageId = `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
        if (env.techno_products_kv) {
          await env.techno_products_kv.put(`img:${imageId}`, imageBytes);
        }

        const imageUrl = `/api/images/${imageId}`;
        return jsonResponse({
          success: true,
          url: imageUrl,
          imageUrl,
          imageId,
          sizeKb: Math.round(imageBytes.byteLength / 1024),
        });
      } catch (err: any) {
        return jsonResponse({ error: err?.message || 'Upload failed' }, 500);
      }
    }

    // 6. GET /api/debug (Inspect last update received by webhook)
    if (url.pathname === '/api/debug') {
      let lastUpdate = null;
      let lastError = null;
      if (env.techno_products_kv) {
        lastUpdate = await env.techno_products_kv.get('debug:last_update');
        lastError = await env.techno_products_kv.get('debug:last_error');
      }
      return jsonResponse({
        lastUpdate: lastUpdate ? JSON.parse(lastUpdate) : null,
        lastError: lastError ? JSON.parse(lastError) : null,
      });
    }

    // 6b. GET /api/test-telegram (Diagnose Telegram bot delivery)
    if (url.pathname === '/api/test-telegram') {
      const ordersBotToken = env.ORDERS_BOT_TOKEN || DEFAULT_ORDERS_BOT_TOKEN;
      const itemsBotToken = env.BOT_TOKEN || DEFAULT_BOT_TOKEN;
      const chatId = env.ADMIN_CHAT_ID || DEFAULT_ADMIN_CHAT_ID;

      const [ordersBotMe, ordersBotChat, ordersBotSend, itemsBotSend] = await Promise.all([
        fetch(`https://api.telegram.org/bot${ordersBotToken}/getMe`).then((r) => r.json()).catch((e) => e.message),
        fetch(`https://api.telegram.org/bot${ordersBotToken}/getChat?chat_id=${chatId}`).then((r) => r.json()).catch((e) => e.message),
        fetch(`https://api.telegram.org/bot${ordersBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '🔔 تجربة فحص إرسال تنبيه من بوت الطلبات (@techno03bot) إلى مجموعة الإدارة',
          }),
        }).then((r) => r.json()).catch((e) => e.message),
        fetch(`https://api.telegram.org/bot${itemsBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '🔔 تجربة فحص إرسال تنبيه من بوت المعروضات (@items03bot) إلى مجموعة الإدارة',
          }),
        }).then((r) => r.json()).catch((e) => e.message),
      ]);

      return jsonResponse({
        chatId,
        ordersBotMe,
        ordersBotChat,
        ordersBotSend,
        itemsBotSend,
      });
    }

    // 7. GET /telegram/set-webhook (Auto registers webhook for BOTH @items03bot and @techno03bot)
    if (url.pathname === '/telegram/set-webhook') {
      const itemsWebhookUrl = `${url.origin}/telegram/webhook?bot=items`;
      const ordersWebhookUrl = `${url.origin}/telegram/webhook?bot=orders`;
      const ordersBotToken = await getOrdersBotToken(env);
      const itemsBotToken = env.BOT_TOKEN || DEFAULT_BOT_TOKEN;

      const [resItems, resOrders] = await Promise.all([
        fetch(
          `https://api.telegram.org/bot${itemsBotToken}/setWebhook?url=${encodeURIComponent(itemsWebhookUrl)}&drop_pending_updates=true`,
        ),
        fetch(
          `https://api.telegram.org/bot${ordersBotToken}/setWebhook?url=${encodeURIComponent(ordersWebhookUrl)}&drop_pending_updates=true`,
        ),
      ]);
      const dataItems = await resItems.json();
      const dataOrders = await resOrders.json();
      return jsonResponse({
        success: true,
        itemsBot: { result: dataItems, webhookUrl: itemsWebhookUrl },
        ordersBot: { result: dataOrders, webhookUrl: ordersWebhookUrl },
      });
    }

    // 8. POST /telegram/webhook (Receives Telegram Bot updates for either bot)
    if (url.pathname === '/telegram/webhook' && request.method === 'POST') {
      let update: any = null;
      try {
        update = (await request.json()) as any;
        const botParam = url.searchParams.get('bot');
        const ordersBotToken = await getOrdersBotToken(env);
        const itemsBotToken = env.BOT_TOKEN || DEFAULT_BOT_TOKEN;
        const activeBotToken = botParam === 'orders' ? ordersBotToken : itemsBotToken;

        if (env.techno_products_kv) {
          ctx.waitUntil(
            env.techno_products_kv
              .put(
                'debug:last_update',
                JSON.stringify({ receivedAt: new Date().toISOString(), bot: botParam, update }),
              )
              .catch(() => {}),
          );
        }
        await handleTelegramUpdate(update, env, activeBotToken, url.origin, ctx);
        return new Response('OK', { status: 200 });
      } catch (err: any) {
        console.error('Webhook error:', err);
        if (env.techno_products_kv) {
          await env.techno_products_kv.put(
            'debug:last_error',
            JSON.stringify({
              time: new Date().toISOString(),
              error: err?.message || String(err),
              stack: err?.stack,
              update,
            }),
          );
        }
        return new Response('OK', { status: 200 });
      }
    }

        // 8b. GET /api/store-info (Store Official Phone & Info)
    if (url.pathname === '/api/store-info' && request.method === 'GET') {
      const storePhone = await getStorePhone(env);
      return jsonResponse({
        phoneDisplay: storePhone.display,
        phoneHref: storePhone.href,
        hours: 'السبت إلى الخميس · 08:30 صباحاً – 20:00 مساءً',
        address: 'حي المقام بجانب المقبرة — وسط المدينة، الأغواط',
      });
    }

        // 9. GET & POST /admin, /orders, /ntfy/open (Complete Store Management Dashboard)
    if (
      url.pathname === '/admin' ||
      url.pathname === '/admin/' ||
      url.pathname === '/admin/orders' ||
      url.pathname === '/orders' ||
      url.pathname === '/orders/' ||
      url.pathname === '/ntfy/open' ||
      url.pathname === '/ntfy'
    ) {
      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
      const country = request.headers.get('cf-ipcountry') || 'DZ';
      const city = request.headers.get('cf-ipcity') || 'Laghouat';
      const userAgent = formatUserAgent(request.headers.get('user-agent') || '');
      const timestamp = new Date().toISOString();
      const basePath = url.pathname.replace(/\/+$/, '');

      // Logout support: clear cookie and redirect
      if (url.searchParams.get('logout') === '1') {
        await destroyAdminSession(env, request.headers.get('Cookie') || '');
        return new Response('Redirecting to login...', {
          status: 302,
          headers: {
            Location: basePath || '/admin',
            'Set-Cookie': `admin_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure; HttpOnly`,
            ...CORS_HEADERS,
          },
        });
      }

      // 1. Brute-Force Rate Limiting & Lockout Check
      const bruteCheck = await checkPinBruteForce(env, clientIp);
      if (bruteCheck.locked) {
        // Record lockout event in access logs
        await recordAdminAccessLog(env, {
          ip: clientIp,
          status: 'lockout',
          userAgent,
          country,
          city,
          timestamp,
        });

        const lockoutHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تم تعليق الدخول مؤقتاً — متجر تكنو الأغواط</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FEF2F2; color: #991B1B; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; direction: rtl; }
    .box { background: #fff; padding: 36px 28px; border-radius: 20px; max-width: 440px; border: 1px solid #FCA5A5; box-shadow: 0 10px 25px rgba(220,38,38,0.08); }
    h2 { font-size: 20px; margin-bottom: 10px; color: #991B1B; font-weight: bold; }
    p { font-size: 14px; line-height: 1.6; color: #7F1D1D; margin-bottom: 16px; }
    .timer { font-weight: bold; background: #FEE2E2; padding: 12px; border-radius: 12px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="box">
    <div style="font-size: 45px; margin-bottom: 12px;">🚫</div>
    <h2>تم قفل المحاولات مؤقتاً</h2>
    <p>تم إدخال رمز أمان خاطئ عدة مرات متتالية. لحماية لوحة الإدارة وبيانات الزبائن المشفرة، تم تعليق تسجيل الدخول مؤقتاً لهذا العنوان.</p>
    <div class="timer">⏳ يرجى الانتظار ${bruteCheck.remainingMinutes} دقيقة ثم إعادة المحاولة.</div>
  </div>
</body>
</html>`;
        return new Response(lockoutHtml, {
          status: 429,
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS },
        });
      }

      const cookieHeader = request.headers.get('Cookie') || '';
      const orderIdParam = url.searchParams.get('order');
      const tokenParam = url.searchParams.get('token') || '';
      let isPinWrong = false;

      // Handle PIN Submission via POST
      if (request.method === 'POST') {
        try {
          const formData = await request.formData();
          const submittedPin = formData.get('pin')?.toString() || '';
          if (submittedPin) {
            const isValid = await verifyAdminPin(env, submittedPin);
            if (isValid) {
              await resetFailedPinAttempts(env, clientIp);
              const sessionToken = await createAdminSession(env);
              await recordAdminAccessLog(env, {
                ip: clientIp,
                status: 'success',
                userAgent,
                country,
                city,
                timestamp,
              });
              return new Response('Redirecting to dashboard...', {
                status: 302,
                headers: {
                  Location: basePath + (orderIdParam ? `?order=${encodeURIComponent(orderIdParam)}` : ''),
                  'Set-Cookie': `admin_session=${sessionToken}; Path=/; Max-Age=604800; SameSite=Lax; Secure; HttpOnly`,
                  ...CORS_HEADERS,
                },
              });
            } else {
              isPinWrong = true;
              await recordFailedPinAttempt(env, clientIp);
              await recordAdminAccessLog(env, {
                ip: clientIp,
                status: 'failed',
                userAgent,
                country,
                city,
                timestamp,
              });
            }
          }
        } catch {}
      }

      const isSessionAuthorized = await verifyAdminSession(env, cookieHeader);

      // Lookup requested single order if orderIdParam is passed (Decrypted in memory)
      let singleOrder: any = null;
      if (orderIdParam && env.techno_products_kv) {
        const raw = await env.techno_products_kv.get(`order:${orderIdParam}`);
        if (raw) {
          try {
            singleOrder = await decryptCustomerData(env, raw);
          } catch {}
        }
      }

      // Authorization check (cryptographic token or verified PBKDF2 session)
      const isTokenValid = Boolean(tokenParam && singleOrder?.viewToken && tokenParam === singleOrder.viewToken);
      const isAuthorized = isTokenValid || isSessionAuthorized;

      const responseHeaders: Record<string, string> = {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...CORS_HEADERS,
      };

      if (!isAuthorized) {
        // Unauthorized: Security Lock Gate (Protected with PBKDF2 Hashing)
        const gateHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>بوابة إدارة متجر تكنو الأغواط</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #F8FAFC;
      color: #1E293B;
      padding: 40px 16px;
      direction: rtl;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: #FFFFFF;
      border-radius: 20px;
      padding: 32px 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid #E2E8F0;
      text-align: center;
    }
    .btn {
      display: block;
      width: 100%;
      background: #18181B;
      color: #FFFFFF !important;
      padding: 13px 20px;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: #E30613; }
    input[type="password"] {
      width: 100%;
      padding: 13px;
      border: 1.5px solid #CBD5E1;
      border-radius: 12px;
      font-size: 16px;
      text-align: center;
      margin-bottom: 12px;
      outline: none;
      background: #fff;
    }
    input[type="password"]:focus { border-color: #E30613; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px; margin-bottom: 12px;">🔐</div>
    <h2 style="font-size: 19px; color: #1E293B; margin-bottom: 8px; font-weight: bold;">
      لوحة تحكم تكنو الأغواط
    </h2>
    <p style="font-size: 13.5px; color: #64748B; line-height: 1.6; margin-bottom: 20px;">
      مخصصة لإدارة متجر تكنو الأغواط لمتابعة الطلبات، إدارة المنتجات، وإصدار بطاقات الوفاء. أدخل رمز الأمان (PIN):
    </p>

    ${
      isPinWrong
        ? `<div style="background: #FEE2E2; color: #DC2626; padding: 10px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; font-weight: bold;">
            ❌ رمز الأمان غير صحيح، يرجى المحاولة مجدداً
          </div>`
        : ''
    }

    <form method="POST" action="${basePath}${orderIdParam ? '?order=' + encodeURIComponent(orderIdParam) : ''}">
      <input type="password" name="pin" placeholder="رمز PIN الإداري" required autofocus />
      <button type="submit" class="btn">
        🔓 تسجيل الدخول
      </button>
    </form>

    <div style="margin-top: 18px; font-size: 12px; color: #94A3B8; border-top: 1px dashed #E2E8F0; padding-top: 14px;">
      🛡️ اللوحة محمية بنظام تشفير PBKDF2 وتسجيل الـ IP وحظر المحاولات المتكررة
    </div>
  </div>
</body>
</html>`;
        return new Response(gateHtml, { headers: responseHeaders });
      }

      // Fetch all orders from KV (Decrypted securely in memory)
      let ordersList: any[] = [];
      if (env.techno_products_kv) {
        const rawList = await env.techno_products_kv.get('orders');
        if (rawList) {
          try {
            ordersList = await decryptCustomerData(env, rawList);
            if (!Array.isArray(ordersList)) ordersList = [];
          } catch {}
        }
      }

      // ─── Authorized Actions Handler (POST & GET) ───────────────────────────

      // Handle Authorized POST Form Actions
      if (request.method === 'POST') {
        try {
          const form = await request.formData();
          const formAction = form.get('action')?.toString() || '';

          // Action: Add Product from Dashboard
          if (formAction === 'add_product') {
            const name = (form.get('name')?.toString() || '').trim();
            const categoryName = (form.get('category')?.toString() || 'أدوات مكتبية').trim();
            const customSku = (form.get('sku')?.toString() || '').trim();
            let price = parseInt(form.get('price')?.toString() || '0', 10);
            const singleDims = (form.get('dimensions')?.toString() || '').trim();
            const description = (form.get('description')?.toString() || '').trim();
            const variantsRaw = (form.get('variants_raw')?.toString() || '').trim();
            const colorFamily = (form.get('color')?.toString() || 'black').trim();

            let uploadedImages: string[] = [];

            // 1. URLs from client-side compressor (check both singular and plural parameter names)
            const hiddenUrls = [...form.getAll('uploaded_image_urls'), ...form.getAll('uploaded_images_urls')];
            if (hiddenUrls && hiddenUrls.length > 0) {
              for (const u of hiddenUrls) {
                const s = u?.toString().trim();
                if (s && (s.startsWith('/api/images/') || s.startsWith('data:image/') || s.startsWith('http'))) {
                  uploadedImages.push(s);
                }
              }
            }

            // 2. Base64 compressed images from client-side compressor
            const base64List = form.getAll('compressed_images_base64');
            if (base64List && base64List.length > 0 && env.techno_products_kv) {
              for (const b64 of base64List) {
                const rawStr = b64?.toString() || '';
                if (rawStr.startsWith('data:image/')) {
                  const cleanBase64 = rawStr.replace(/^data:image\/[a-z0-9.+]+;base64,/, '');
                  const binaryString = atob(cleanBase64);
                  const len = binaryString.length;
                  const bytes = new Uint8Array(len);
                  for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const imageId = `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
                  await env.techno_products_kv.put(`img:${imageId}`, bytes.buffer);
                  uploadedImages.push(`/api/images/${imageId}`);
                }
              }
            }

            // 3. Fallback manual image URL if provided
            const manualImage = (form.get('image')?.toString() || '').trim();
            if (manualImage) {
              uploadedImages.unshift(manualImage);
            }

            // Fallback default image if none provided
            if (uploadedImages.length === 0) {
              uploadedImages.push('/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg');
            }

            // 4. Multi-Shape JSON from Interactive Dashboard Builder
            let variantsFromJson: ProductVariant[] = [];
            const rawJson = (form.get('variants_json')?.toString() || '').trim();
            if (rawJson) {
              try {
                const arr = JSON.parse(rawJson);
                if (Array.isArray(arr) && arr.length > 0) {
                  for (let idx = 0; idx < arr.length; idx++) {
                    const item = arr[idx];
                    const shapeName = (item.name || `شكل ${idx + 1}`).trim();
                    const shapeSku = (item.sku || '').trim();
                    const shapeImg = (item.image || '').trim();
                    const shapeDesc = (item.description || '').trim();
                    const shapeDims = (item.dimensions || '').trim();
                    const basePrice = Number(item.priceDzd) || price || 1000;

                    const subParsed = shapeDims ? parseVariantsText(shapeDims) : [];
                    if (subParsed.length > 0) {
                      for (const sub of subParsed) {
                        variantsFromJson.push({
                          id: `var-${Date.now()}-${variantsFromJson.length + 1}`,
                          name: `${shapeName} (${sub.label})`,
                          label: sub.label,
                          sku: sub.sku || shapeSku || undefined,
                          priceDzd: sub.priceDzd,
                          image: shapeImg || uploadedImages[idx] || uploadedImages[0],
                          description: (sub.description || shapeDesc).trim(),
                          dimensions: (sub.dimensions || sub.label).trim(),
                        });
                      }
                    } else {
                      variantsFromJson.push({
                        id: `var-${Date.now()}-${variantsFromJson.length + 1}`,
                        name: shapeName,
                        label: shapeName,
                        sku: shapeSku || undefined,
                        priceDzd: basePrice,
                        image: shapeImg || uploadedImages[idx] || uploadedImages[0],
                        description: shapeDesc,
                        dimensions: shapeDims,
                      });
                    }
                  }
                }
              } catch {}
            }

            const parsedVariants =
              variantsFromJson.length > 0
                ? variantsFromJson
                : (variantsRaw ? parseVariantsText(variantsRaw) : []);

            if (parsedVariants.length > 0) {
              if (price <= 0) {
                price = Math.min(...parsedVariants.map((v) => v.priceDzd));
              }
              const shapeImages = parsedVariants.map((v) => v.image).filter(Boolean) as string[];
              if (shapeImages.length > 0) {
                uploadedImages = [...shapeImages, ...uploadedImages.filter((img) => !shapeImages.includes(img))];
              }
            }

            if (name && (price > 0 || parsedVariants.length > 0)) {
              if (price <= 0 && parsedVariants.length > 0) {
                price = Math.min(...parsedVariants.map((v) => v.priceDzd));
              }
              const products = await getProducts(env);
              const generatedId = await getNextNumericId(env, products);
              const finalSku = customSku || generatedId;
              const finalId = customSku && !products.some((p) => p.id === customSku) ? customSku : generatedId;
              const catObj = await ensureCategory(env, categoryName);

              // Link each uploaded image to its corresponding variant/shape
              const linkedVariants = parsedVariants.map((v, i) => ({
                ...v,
                name: v.name || v.label,
                image: v.image || uploadedImages[i] || uploadedImages[0],
              }));

              const mainDesc =
                description ||
                (linkedVariants.length > 0 && linkedVariants[0].description
                  ? linkedVariants[0].description
                  : 'منتج أصلي معتمد متوفر في فرع تكنو الأغواط.');

              const newProduct: Product = {
                id: finalId,
                sku: finalSku,
                name,
                shortName: name,
                brand: 'TECHNO STATIONERY',
                series: catObj.id,
                seriesLabel: catObj.name,
                categoryId: catObj.id,
                categoryName: catObj.name,
                colorFamily,
                colorName: colorFamily === 'red' ? 'أحمر' : colorFamily === 'blue' ? 'أزرق' : 'قياسي',
                colorHex: colorFamily === 'red' ? '#E30613' : colorFamily === 'blue' ? '#2563EB' : '#1F2024',
                priceDzd: price,
                image: uploadedImages[0],
                images: uploadedImages,
                ...(singleDims ? { dimensions: singleDims } : {}),
                ...(linkedVariants.length > 0 ? { variants: linkedVariants } : {}),
                alt: `${name} — رقم المنتج ${finalSku}`,
                summary: mainDesc,
                description: mainDesc,
                availabilityText: 'متوفر في فرع الأغواط',
                featuredRank: 1,
                siblingIds: [],
                specs: [
                  { label: 'رقم المنتج', value: finalSku },
                  { label: 'القسم', value: catObj.name },
                  ...(singleDims ? [{ label: 'القياسات والأبعاد', value: singleDims }] : []),
                  ...(linkedVariants.length > 0
                    ? [
                        {
                          label: 'الأشكال المتوفرة',
                          value: linkedVariants.map((v) => `${v.name || v.label} (${v.priceDzd.toLocaleString()} د.ج)`).join(' · '),
                        },
                      ]
                    : []),
                  ...(linkedVariants.some((v) => v.dimensions)
                    ? [
                        {
                          label: 'القياسات المتوفرة',
                          value: linkedVariants.map((v) => v.dimensions).filter(Boolean).join(' · '),
                        },
                      ]
                    : []),
                ],
                highlights: [
                  'منتج أصلي معتمد متوفر في فرع تكنو الأغواط',
                  'توصيل سريع للأغواط و54 ولاية عبر ZR Express والدفع عند الاستلام',
                ],
              };

              await saveProducts(env, [newProduct, ...products]);
              return new Response(null, {
                status: 302,
                headers: { Location: `${basePath}?tab=products&added=1`, ...responseHeaders },
              });
            }
          }
        } catch {}
      }

      // Handle Authorized GET Actions
      const action = url.searchParams.get('action') || '';
      const targetOrderId = url.searchParams.get('orderId') || '';

      if (action && env.techno_products_kv) {
        // Delete all orders
        if (action === 'delete_all') {
          if (ordersList.length > 0) {
            for (const o of ordersList) {
              if (o.orderId) {
                await env.techno_products_kv.delete(`order:${o.orderId}`);
              }
            }
          }
          await env.techno_products_kv.put('orders', await encryptCustomerData(env, []));
          return new Response(null, {
            status: 302,
            headers: { Location: `${basePath}?tab=orders`, ...responseHeaders },
          });
        }

        // Delete single product
        if (action === 'delete_product') {
          const prodId = (url.searchParams.get('id') || '').trim();
          if (prodId) {
            const products = await getProducts(env);
            const filtered = products.filter((p) => p.id !== prodId && p.sku !== prodId);
            await saveProducts(env, filtered);
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=products&deleted=1`, ...responseHeaders },
            });
          }
        }

        // Approve loyalty card with custom initial points
        if (action === 'approve_loyalty') {
          const targetPhone = (url.searchParams.get('phone') || '').trim();
          const manualCardNumber = (url.searchParams.get('card_number') || '').trim();
          let points = parseInt(url.searchParams.get('points') || '50', 10);
          if (isNaN(points) || points < 0) points = 50;

          if (targetPhone) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            const reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const idx = reqs.findIndex((r: any) => r.customerPhone === targetPhone);
            if (idx >= 0) {
              reqs[idx].status = 'approved_pending_pin';
              reqs[idx].approvedAt = new Date().toISOString();
              reqs[idx].points = points;
              reqs[idx].tier = computeLoyaltyTier(points);
              if (manualCardNumber) {
                reqs[idx].cardNumber = manualCardNumber;
              }
              await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            }
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards&approved=1`, ...responseHeaders },
            });
          }
        }

        // Update card points balance
        if (action === 'update_card_points') {
          const targetPhone = (url.searchParams.get('phone') || '').trim();
          const points = parseInt(url.searchParams.get('points') || '0', 10);
          if (targetPhone && !isNaN(points) && points >= 0) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            const reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const idx = reqs.findIndex((r: any) => r.customerPhone === targetPhone);
            if (idx >= 0) {
              reqs[idx].points = points;
              reqs[idx].tier = computeLoyaltyTier(points);
              await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            }
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards&updated_points=1`, ...responseHeaders },
            });
          }
        }

        // Update customer phone number on card
        if (action === 'update_customer_phone') {
          const oldPhone = (url.searchParams.get('phone') || '').trim();
          const newPhone = (url.searchParams.get('new_phone') || '').trim();
          if (oldPhone && newPhone) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            const reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const idx = reqs.findIndex((r: any) => r.customerPhone === oldPhone);
            if (idx >= 0) {
              reqs[idx].customerPhone = newPhone;
              await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            }
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards&updated_phone=1`, ...responseHeaders },
            });
          }
        }

        // Update store official phone number
        if (action === 'update_store_phone') {
          const newPhone = (url.searchParams.get('store_phone') || '').trim();
          if (newPhone) {
            await setStorePhone(env, newPhone);
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=settings&saved=1`, ...responseHeaders },
            });
          }
        }

        // Clear Admin Access Logs
        if (action === 'clear_logs') {
          await env.techno_products_kv.delete('admin_access_logs');
          return new Response(null, {
            status: 302,
            headers: { Location: `${basePath}?tab=logs&cleared=1`, ...responseHeaders },
          });
        }

        // Update card number
        if (action === 'update_card_number') {
          const targetPhone = url.searchParams.get('phone') || '';
          const manualCardNumber = (url.searchParams.get('card_number') || '').trim();
          if (targetPhone && manualCardNumber) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            const reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const idx = reqs.findIndex((r: any) => r.customerPhone === targetPhone);
            if (idx >= 0) {
              reqs[idx].cardNumber = manualCardNumber;
              await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            }
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards`, ...responseHeaders },
            });
          }
        }

        // Disable loyalty card
        if (action === 'disable_loyalty') {
          const targetPhone = url.searchParams.get('phone') || '';
          if (targetPhone) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            const reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const idx = reqs.findIndex((r: any) => r.customerPhone === targetPhone);
            if (idx >= 0) {
              reqs[idx].status = 'disabled';
              reqs[idx].disabledAt = new Date().toISOString();
              await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            }
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards`, ...responseHeaders },
            });
          }
        }

        // Enable loyalty card
        if (action === 'enable_loyalty') {
          const targetPhone = url.searchParams.get('phone') || '';
          if (targetPhone) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            const reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const idx = reqs.findIndex((r: any) => r.customerPhone === targetPhone);
            if (idx >= 0) {
              reqs[idx].status = reqs[idx].hasPin ? 'active' : 'approved_pending_pin';
              delete reqs[idx].disabledAt;
              await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            }
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards`, ...responseHeaders },
            });
          }
        }

        // Delete loyalty card
        if (action === 'delete_loyalty') {
          const targetPhone = url.searchParams.get('phone') || '';
          if (targetPhone) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            let reqs = rawReqs ? JSON.parse(rawReqs) : [];
            reqs = reqs.filter((r: any) => r.customerPhone !== targetPhone);
            await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards`, ...responseHeaders },
            });
          }
        }

        // Store owner manually adds a customer registered in the physical store
        if (action === 'add_manual_loyalty') {
          const fullName = (url.searchParams.get('customer_name') || '').trim();
          const phone = (url.searchParams.get('phone') || '').trim();
          let cardNumber = (url.searchParams.get('card_number') || '').trim();
          let points = parseInt(url.searchParams.get('points') || '50', 10);
          if (isNaN(points) || points < 0) points = 50;
          const birthDate = (url.searchParams.get('birth_date') || '').trim();
          const profession = (url.searchParams.get('profession') || '').trim();
          const email = (url.searchParams.get('email') || '').trim();
          const address = (url.searchParams.get('address') || '').trim();

          if (phone) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            let reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const existingIdx = reqs.findIndex((r: any) => r.customerPhone === phone);

            if (!cardNumber) {
              const num2 = Math.floor(1000 + Math.random() * 9000).toString();
              const num3 = Math.floor(1000 + Math.random() * 9000).toString();
              const num4 = (new Date().getFullYear() % 100).toString().padStart(2, '0') + Math.floor(10 + Math.random() * 90).toString();
              cardNumber = `03-${num2}-${num3}-${num4}`;
            }

            const record = {
              customerName: fullName || 'زبون تكنو المعتمد',
              firstName: fullName.split(' ')[0] || '',
              lastName: fullName.split(' ').slice(1).join(' ') || '',
              customerPhone: phone,
              cardNumber: cardNumber,
              points: points,
              tier: computeLoyaltyTier(points),
              status: 'active',
              hasPurchased: true,
              ordersCount: 1,
              totalSpent: points * 100,
              customerBirthDate: birthDate,
              customerProfession: profession,
              customerEmail: email,
              customerAddress: address,
              source: 'in_store_counter',
              requestedAt: new Date().toISOString(),
              approvedAt: new Date().toISOString(),
              activatedAt: new Date().toISOString(),
            };

            if (existingIdx >= 0) {
              reqs[existingIdx] = { ...reqs[existingIdx], ...record };
            } else {
              reqs.unshift(record);
            }

            await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            return new Response(null, {
              status: 302,
              headers: { Location: `${basePath}?tab=cards&added=true`, ...responseHeaders },
            });
          }
        }

        // Delete order
        if (action === 'delete' && targetOrderId) {
          await env.techno_products_kv.delete(`order:${targetOrderId}`);
          ordersList = ordersList.filter((o: any) => o.orderId !== targetOrderId);
          await env.techno_products_kv.put('orders', await encryptCustomerData(env, ordersList));
          return new Response(null, {
            status: 302,
            headers: { Location: `${basePath}?tab=orders`, ...responseHeaders },
          });
        }

        // Confirm order
        if (action === 'confirm' && targetOrderId) {
          let orderObj = ordersList.find((o: any) => o.orderId === targetOrderId);
          if (!orderObj) {
            const raw = await env.techno_products_kv.get(`order:${targetOrderId}`);
            if (raw) { try { orderObj = await decryptCustomerData(env, raw); } catch {} }
          }
          if (orderObj) {
            orderObj.status = 'confirmed';
            await env.techno_products_kv.put(`order:${targetOrderId}`, await encryptCustomerData(env, orderObj));
            ordersList = ordersList.map((o: any) => (o.orderId === targetOrderId ? orderObj : o));
            await env.techno_products_kv.put('orders', await encryptCustomerData(env, ordersList));
          }
          return new Response(null, {
            status: 302,
            headers: { Location: `${basePath}?tab=orders`, ...responseHeaders },
          });
        }

        // Cancel order
        if (action === 'cancel' && targetOrderId) {
          let orderObj = ordersList.find((o: any) => o.orderId === targetOrderId);
          if (!orderObj) {
            const raw = await env.techno_products_kv.get(`order:${targetOrderId}`);
            if (raw) { try { orderObj = await decryptCustomerData(env, raw); } catch {} }
          }
          if (orderObj) {
            orderObj.status = 'cancelled';
            await env.techno_products_kv.put(`order:${targetOrderId}`, await encryptCustomerData(env, orderObj));
            ordersList = ordersList.map((o: any) => (o.orderId === targetOrderId ? orderObj : o));
            await env.techno_products_kv.put('orders', await encryptCustomerData(env, ordersList));
          }
          return new Response(null, {
            status: 302,
            headers: { Location: `${basePath}?tab=orders`, ...responseHeaders },
          });
        }

        // Reset status order
        if (action === 'reset_status' && targetOrderId) {
          let orderObj = ordersList.find((o: any) => o.orderId === targetOrderId);
          if (!orderObj) {
            const raw = await env.techno_products_kv.get(`order:${targetOrderId}`);
            if (raw) { try { orderObj = await decryptCustomerData(env, raw); } catch {} }
          }
          if (orderObj) {
            orderObj.status = 'pending';
            await env.techno_products_kv.put(`order:${targetOrderId}`, await encryptCustomerData(env, orderObj));
            ordersList = ordersList.map((o: any) => (o.orderId === targetOrderId ? orderObj : o));
            await env.techno_products_kv.put('orders', await encryptCustomerData(env, ordersList));
          }
          return new Response(null, {
            status: 302,
            headers: { Location: `${basePath}?tab=orders`, ...responseHeaders },
          });
        }
      }

      // Fetch products, categories, logs, and store phone
      const productsList = await getProducts(env);
      const categoriesList = await getCategories(env);
      const logsList = await getAdminAccessLogs(env);
      const storePhone = await getStorePhone(env);

      // Read Loyalty Card Requests/Cards from KV
      let reqs: any[] = [];
      if (env.techno_products_kv) {
        try {
          const rawReqs = await env.techno_products_kv.get('loyalty_requests');
          reqs = rawReqs ? JSON.parse(rawReqs) : [];
        } catch {}
      }
      if (!Array.isArray(reqs)) reqs = [];

      const pendingCardsCount = reqs.filter((r: any) => r.status === 'pending').length;
      const activeCardsCount = reqs.filter((r: any) => r.status === 'active' || r.status === 'approved_pending_pin').length;
      const disabledCardsCount = reqs.filter((r: any) => r.status === 'disabled').length;

      // Tab handling: 'orders' | 'products' | 'cards' | 'logs' | 'settings'
      const currentTab = url.searchParams.get('tab') || 'orders';

      // ─── TAB 1: Orders Content ─────────────────────────────────────────────
      const renderOrderCard = (order: any, isSingle = false) => {
        const rawPhone = order.customer?.phone || '';
        const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
        const dm = order.customer?.deliveryMethod || 'home';
        const deliveryMethod =
          dm === 'pickup' || dm === 'store_pickup'
            ? 'استلام من المحل (وسط المدينة)'
            : dm === 'city_delivery' || dm === 'laghouat_city'
            ? 'توصيل منزلي داخل مدينة الأغواط (100 دج)'
            : dm === 'stop_desk'
            ? 'مكتب التوصيل Stop Desk (ZR Express)'
            : 'توصيل للمنزل À Domicile (ZR Express)';
        const wilaya = order.customer?.wilaya || 'الأغواط';
        const commune = order.customer?.commune || '';
        const status = order.status || 'pending';

        const statusBadge =
          status === 'confirmed'
            ? `<span class="badge badge-confirmed">مؤكد</span>`
            : status === 'cancelled'
            ? `<span class="badge badge-cancelled">ملغي</span>`
            : `<span class="badge badge-pending">قيد المعالجة</span>`;

        return `
        <div class="order-card ${status}">
          <div class="order-card-header">
            <div>
              <span class="order-id">#${escapeHtml(order.orderId || '')}</span>
              <span class="order-date">
                ${order.createdAtIso ? new Date(order.createdAtIso).toLocaleString('ar-DZ') : ''}
              </span>
            </div>
            <div>${statusBadge}</div>
          </div>

          <div class="order-card-body">
            <div class="customer-info">
              <div class="info-line">
                <span class="info-label">الزبون:</span>
                <span class="info-val"><b>${escapeHtml(order.customer?.fullName || '')}</b></span>
              </div>
              <div class="info-line">
                <span class="info-label">الاستلام:</span>
                <span class="info-val">${escapeHtml(deliveryMethod)} — <b>${escapeHtml(wilaya)}</b>${commune ? ` (${escapeHtml(commune)})` : ''}</span>
              </div>
              ${
                order.customer?.address
                  ? `<div class="info-line">
                      <span class="info-label">العنوان:</span>
                      <span class="info-val">${escapeHtml(order.customer.address)}</span>
                    </div>`
                  : ''
              }
              ${
                order.customer?.notes
                  ? `<div class="info-line">
                      <span class="info-label">ملاحظات:</span>
                      <span class="info-val"><i>${escapeHtml(order.customer.notes)}</i></span>
                    </div>`
                  : ''
              }
            </div>

            ${
              cleanPhone
                ? `<a href="tel:${cleanPhone}" class="btn-call">
                    اتصال بالزبون (${escapeHtml(rawPhone)})
                  </a>`
                : ''
            }

            <div class="items-list">
              <div class="items-title">المنتجات (${order.items?.length || 1}):</div>
              ${(order.items || [])
                .map(
                  (item: any) => `
                <div class="item-row">
                  <span>• ${escapeHtml(item.name || '')} ${item.variantLabel ? `[${escapeHtml(item.variantLabel)}]` : ''} × ${item.quantity || 1}</span>
                  <span class="font-mono">${Number(item.lineTotalDzd || 0).toLocaleString()} د.ج</span>
                </div>
              `,
                )
                .join('')}
            </div>

            <div class="totals-line">
              <span>رسوم التوصيل: ${Number(order.totals?.shippingFeeDzd || 0) === 0 ? 'مجاني' : Number(order.totals?.shippingFeeDzd || 0).toLocaleString() + ' د.ج'}</span>
              <span class="total-highlight">المبلغ الإجمالي: ${Number(order.totals?.totalDzd || 0).toLocaleString()} د.ج</span>
            </div>

            <div class="card-actions">
              ${
                status !== 'confirmed'
                  ? `<a href="${basePath}?action=confirm&orderId=${encodeURIComponent(order.orderId)}" class="btn-action btn-confirm">
                      تأكيد الطلب
                    </a>`
                  : `<a href="${basePath}?action=reset_status&orderId=${encodeURIComponent(order.orderId)}" class="btn-action btn-neutral">
                      إعادة لقيد المعالجة
                    </a>`
              }
              ${
                status !== 'cancelled'
                  ? `<a href="${basePath}?action=cancel&orderId=${encodeURIComponent(order.orderId)}" class="btn-action btn-cancel">
                      إلغاء الطلب
                    </a>`
                  : ''
              }
              <a href="${basePath}?action=delete&orderId=${encodeURIComponent(order.orderId)}" onclick="return confirm('هل تريد حذف هذا الطلب نهائياً؟')" class="btn-action btn-delete">
                حذف
              </a>
              ${!isSingle ? `<a href="${basePath}?order=${encodeURIComponent(order.orderId)}" class="btn-action btn-link">صفحة مستقلة »</a>` : ''}
            </div>
          </div>
        </div>`;
      };

      let ordersContent = '';
      if (orderIdParam) {
        const order = singleOrder || ordersList.find((o: any) => o.orderId === orderIdParam);
        if (!order) {
          ordersContent = `
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; text-align: center;">
              <h3 style="color: #1E293B; font-size: 16px; margin-bottom: 8px;">الطلب غير موجود</h3>
              <p style="color: #64748B; font-size: 13px; margin-bottom: 16px;">
                لم يتم العثور على طلب برقم: <code>#${escapeHtml(orderIdParam)}</code>
              </p>
              <a href="${basePath}?tab=orders" class="btn-action btn-neutral" style="display: inline-block;">
                العودة لجميع الطلبات (${ordersList.length})
              </a>
            </div>`;
        } else {
          ordersContent = `
            <div>
              <div style="margin-bottom: 14px;">
                <a href="${basePath}?tab=orders" style="font-size: 13px; color: #475569; text-decoration: none; font-weight: 600;">
                  « العودة لقائمة جميع الطلبات (${ordersList.length})
                </a>
              </div>
              ${renderOrderCard(order, true)}
            </div>`;
        }
      } else {
        if (ordersList.length === 0) {
          ordersContent = `
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 44px 20px; text-align: center;">
              <h3 style="color: #1E293B; font-size: 16px; font-weight: 700; margin-bottom: 6px;">لا توجد طلبات مسجلة حالياً</h3>
              <p style="color: #64748B; font-size: 13px; max-width: 380px; margin: 0 auto; line-height: 1.6;">
                عندما يؤكد أي زبون طلبه من المتجر، سيظهر هنا فوراً مع بيانات الاتصال ومحتويات السلة.
              </p>
            </div>`;
        } else {
          ordersContent = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${ordersList.map((order: any) => renderOrderCard(order, false)).join('')}
            </div>`;
        }
      }

      // ─── TAB 2: Products Content ───────────────────────────────────────────
      const isProductAdded = url.searchParams.get('added') === '1';
      const isProductDeleted = url.searchParams.get('deleted') === '1';

      const productsContent = `
        ${isProductAdded ? `
          <div style="background:#ECFDF5; border:1px solid #10B981; color:#065F46; padding:14px 18px; border-radius:12px; margin-bottom:18px; font-weight:600; font-size:13.5px;">
            <strong>تم حفظ ونشر المنتج الجديد بنجاح في المتجر</strong>
            <div style="font-size:12px; color:#047857; margin-top:2px;">المنتج متاح الآن لجميع زوار المتجر مع إمكانية الطلب المباشر.</div>
          </div>
        ` : ''}

        ${isProductDeleted ? `
          <div style="background:#FEF2F2; border:1px solid #F87171; color:#991B1B; padding:12px 16px; border-radius:12px; margin-bottom:18px; font-weight:600; font-size:13px;">
            تم حذف المنتج من المتجر بنجاح.
          </div>
        ` : ''}

        <!-- Add Product Form Card -->
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; padding:24px 22px; margin-bottom:24px; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
          <div style="margin-bottom:18px; border-bottom:1px solid #F1F5F9; padding-bottom:14px;">
            <h3 style="font-size:16px; font-weight:700; color:#0F172A; margin:0;">إضافة منتج جديد</h3>
            <p style="font-size:12.5px; color:#64748B; margin-top:3px;">حدد نمط المنتج (منتج منفرد ببياناته أو مجموعة موديلات وأشكال) لتنظيم العرض في المتجر.</p>
          </div>

          <form method="POST" action="${basePath}" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
            <input type="hidden" name="action" value="add_product" />
            <input type="hidden" id="prod-mode" name="prod_mode" value="single" />
            <input type="hidden" id="variants-json-input" name="variants_json" value="" />

            <!-- Mode Selector Switcher -->
            <div style="grid-column: 1 / -1; background:#F1F5F9; padding:4px; border-radius:10px; display:flex; gap:6px;">
              <button type="button" id="tab-single-prod" onclick="switchProductMode('single')" style="flex:1; padding:9px 12px; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; background:#FFFFFF; color:#0F172A; box-shadow:0 1px 2px rgba(0,0,0,0.06); transition:all 0.2s;">
                منتج منفرد (سعر، رقم تسلسلي، قياسات وصور)
              </button>
              <button type="button" id="tab-multi-prod" onclick="switchProductMode('multi')" style="flex:1; padding:9px 12px; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; background:transparent; color:#64748B; transition:all 0.2s;">
                مجموعة موديلات (لكل شكل صورته، اسمه، سعره، رقمه، وقياساته)
              </button>
            </div>

            <!-- Common fields -->
            <div style="grid-column: 1 / -1;">
              <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">اسم المنتج *</label>
              <input type="text" name="name" required placeholder="مثال: مقلمة مدرسية فاخرة تكنو 3 سحابات" style="width:100%; box-sizing:border-box; height:42px; padding:8px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:13.5px; font-weight:600; outline:none;" />
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">القسم / الفئة *</label>
              <input type="text" name="category" list="cat-suggestions" required placeholder="اختر أو اكتب اسماً جديداً..." style="width:100%; box-sizing:border-box; height:42px; padding:8px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:13.5px; outline:none;" />
              <datalist id="cat-suggestions">
                ${categoriesList.map((c) => `<option value="${escapeHtml(c.name)}">`).join('')}
                <option value="أدوات مدرسية">
                <option value="أدوات مكتبية">
                <option value="فنون ورسم">
                <option value="ورقيات ودفاتر">
                <option value="أقلام وألوان">
                <option value="محافظ وحقائب">
              </datalist>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">الرقم التسلسلي / الكود (SKU) <span style="font-size:11px; font-weight:400; color:#64748B;">(اختياري)</span></label>
              <input type="text" name="sku" placeholder="مثال: 71645 أو يترك فارغاً للترقيم التلقائي" style="width:100%; box-sizing:border-box; height:42px; padding:8px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; font-family:monospace; outline:none;" />
            </div>

            <div id="single-price-col">
              <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">السعر بالدينار الجزائري (د.ج) *</label>
              <input type="number" id="single-price-input" name="price" required min="10" placeholder="1800" style="width:100%; box-sizing:border-box; height:42px; padding:8px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:13.5px; font-family:monospace; font-weight:700; color:#0F172A; outline:none;" />
            </div>

            <div id="single-dims-col">
              <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">القياسات والأبعاد <span style="font-size:11px; font-weight:400; color:#64748B;">(اختياري)</span></label>
              <input type="text" name="dimensions" placeholder="مثال: 40x60 سم أو A4 أو سعة 500 مل" style="width:100%; box-sizing:border-box; height:42px; padding:8px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; outline:none;" />
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">اللون الرئيسي</label>
              <select name="color" style="width:100%; box-sizing:border-box; height:42px; padding:8px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; background:#fff; outline:none;">
                <option value="black">أسود / قياسي</option>
                <option value="red">أحمر تكنو</option>
                <option value="blue">أزرق</option>
                <option value="green">أخضر</option>
                <option value="brown">بني</option>
                <option value="other">متعدد الألوان</option>
              </select>
            </div>

            <!-- Single Product Photos Upload -->
            <div id="single-photos-section" style="grid-column: 1 / -1;">
              <label style="display:block; font-size:12.5px; font-weight:600; color:#334155; margin-bottom:6px;">
                صور المنتج (رفع مباشر مع ضغط تلقائي للحجم)
              </label>

              <!-- Upload Drag & Drop Area -->
              <div id="drop-area" onclick="document.getElementById('product-file-input').click()" style="border:1.5px dashed #CBD5E1; border-radius:12px; padding:20px 16px; text-align:center; cursor:pointer; background:#F8FAFC; transition:all 0.2s;">
                <div style="font-weight:700; font-size:14px; color:#0F172A;">اضغط هنا لاختيار صور المنتج من جهازك أو اسحبها إلى هنا</div>
                <div style="font-size:12px; color:#64748B; margin-top:4px;">
                  يتم تقليل وضغط حجم الصور فورياً في متصفحك لتسريع التصفح لزبائن المتجر.
                </div>
              </div>

              <input type="file" id="product-file-input" accept="image/*" multiple style="display:none;" onchange="handleProductFiles(this.files)" />

              <!-- Images Preview Gallery -->
              <div id="upload-status" style="margin-top:10px; font-size:12.5px; font-weight:600; color:#047857; display:none;"></div>
              <div id="image-previews" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px; margin-top:12px;"></div>
              <div id="hidden-inputs"></div>

              <!-- Optional manual URL fallback -->
              <details style="margin-top:10px; font-size:12px; color:#64748B;">
                <summary style="cursor:pointer; font-weight:600;">أو إدخال رابط صورة يدوي (اختياري)</summary>
                <div style="margin-top:6px;">
                  <input type="url" name="image" placeholder="https://... أو مسار الصورة" style="width:100%; box-sizing:border-box; height:38px; padding:8px 12px; border:1px solid #CBD5E1; border-radius:8px; font-size:12.5px; font-family:monospace; outline:none;" />
                </div>
              </details>
            </div>

            <!-- Multi-Shapes / Multi-Models Interactive Builder -->
            <div id="multi-shapes-section" style="grid-column: 1 / -1; display:none; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px; padding:18px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; border-bottom:1px solid #E2E8F0; padding-bottom:12px;">
                <div>
                  <h4 style="margin:0; font-size:14.5px; font-weight:700; color:#0F172A;">
                    موديلات وأشكال هذا المنتج
                  </h4>
                  <p style="margin:3px 0 0; font-size:12px; color:#64748B;">
                    أدخل لكل شكل صورته الخاصة، اسمه، رقمه، سعره، قياساته ووصفه ليظهر بشكل متزامن عند السكرول في المتجر.
                  </p>
                </div>
                <button type="button" onclick="addNewShapeCard()" style="background:#0F172A; color:#FFFFFF; border:none; padding:8px 14px; border-radius:8px; font-size:12.5px; font-weight:600; cursor:pointer;">
                  إضافة موديل جديد
                </button>
              </div>

              <!-- Container for Shape Cards -->
              <div id="shapes-cards-container" style="display:flex; flex-direction:column; gap:14px;"></div>

              <div style="margin-top:14px; display:flex; justify-content:center;">
                <button type="button" onclick="addNewShapeCard()" style="background:#FFFFFF; border:1px dashed #94A3B8; color:#334155; padding:9px 18px; border-radius:8px; font-size:12.5px; font-weight:600; cursor:pointer; width:100%; text-align:center;">
                  + إضافة موديل آخر لهذا المنتج
                </button>
              </div>
            </div>

            <div style="grid-column: 1 / -1;">
              <label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">وصف ومميزات المنتج (اختياري)</label>
              <textarea name="description" rows="2" placeholder="وصف موجز للمنتج، خامة الصنع، ومميزاته العامة..." style="width:100%; box-sizing:border-box; padding:10px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; font-family:inherit; outline:none;"></textarea>
            </div>

            <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end;">
              <button type="submit" style="background:#0F172A; color:#FFFFFF; border:none; padding:11px 26px; border-radius:8px; font-weight:700; font-size:13.5px; cursor:pointer;">
                حفظ ونشر المنتج
              </button>
            </div>
          </form>
        </div>

        <!-- Products List -->
        <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:16px; font-weight:700; color:#0F172A; margin:0;">
            قائمة المنتجات (${productsList.length})
          </h3>
          <span style="font-size:12px; color:#64748B;">تحديث فوري</span>
        </div>

        ${productsList.length === 0 ? `
          <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:44px 20px; text-align:center;">
            <h3 style="color:#1E293B; font-size:16px; font-weight:700; margin-bottom:6px;">لا توجد منتجات مسجلة حالياً</h3>
            <p style="color:#64748B; font-size:13px; max-width:380px; margin:0 auto; line-height:1.6;">
              استخدم النموذج أعلاه لإضافة منتجك الأول، أو أضف المنتجات عبر بوت التيليغرام.
            </p>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${productsList.map((p) => {
              const variantsCount = p.variants?.length || 0;
              return `
                <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                  <div style="display:flex; align-items:center; gap:12px; min-width:240px; flex:1;">
                    <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" style="width:52px; height:52px; object-fit:cover; border-radius:8px; border:1px solid #E2E8F0; background:#F8FAFC; flex-shrink:0;" onerror="this.src='/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg'" />
                    <div>
                      <div style="font-size:14px; font-weight:700; color:#0F172A;">${escapeHtml(p.name)}</div>
                      <div style="font-size:12px; color:#64748B; margin-top:2px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span style="font-family:monospace; background:#F1F5F9; padding:1px 6px; border-radius:4px; font-weight:600;">#${escapeHtml(p.sku || p.id)}</span>
                        <span>·</span>
                        <span style="background:#F1F5F9; color:#475569; padding:1px 8px; border-radius:6px; font-size:11px; font-weight:600;">${escapeHtml(p.categoryName || p.seriesLabel || 'عام')}</span>
                        ${variantsCount > 0 ? `<span style="background:#FEF3C7; color:#92400E; padding:1px 8px; border-radius:6px; font-size:11px; font-weight:600;">${variantsCount} أشكال</span>` : ''}
                      </div>
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:16px;">
                    <div style="font-family:monospace; font-size:15px; font-weight:700; color:#E30613;">
                      ${Number(p.priceDzd || 0).toLocaleString()} د.ج
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <a href="/${encodeURIComponent(p.id)}" target="_blank" style="background:#F1F5F9; color:#0F172A; text-decoration:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;">
                        عرض في المتجر
                      </a>
                      <a href="${basePath}?tab=products&action=delete_product&id=${encodeURIComponent(p.id)}" onclick="return confirm('هل تريد بالتأكيد حذف هذا المنتج نهائياً من المتجر؟')" style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; text-decoration:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;">
                        حذف
                      </a>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      `;

      // ─── TAB 3: Cards Content ──────────────────────────────────────────────
      const isCardAdded = url.searchParams.get('added') === 'true';
      const isCardApproved = url.searchParams.get('approved') === '1';
      const isPhoneUpdated = url.searchParams.get('updated_phone') === '1';
      const isPointsUpdated = url.searchParams.get('updated_points') === '1';

      const manualAddForm = `
        <div style="background:#FFFFFF; border:1.5px solid #10B981; border-radius:18px; padding:20px 22px; margin-bottom:24px; box-shadow:0 4px 15px rgba(16,185,129,0.08);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:26px;">🏪</span>
              <div>
                <h3 style="font-size:15px; font-weight:800; color:#065F46; margin:0;">إضافة زبون مسجل ببطاقة وفاء في المحل (تسجيل يدوي فوري)</h3>
                <p style="font-size:12px; color:#047857; margin-top:2px;">لإتاحة البطاقة الافتراضية للزبون فور دخوله للموقع ورؤيتها برقمها ورصيدها الحقيقي.</p>
              </div>
            </div>
          </div>

          <form method="GET" action="${basePath}" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
            <input type="hidden" name="tab" value="cards" />
            <input type="hidden" name="action" value="add_manual_loyalty" />

            <div>
              <label style="display:block; font-size:11.5px; font-weight:700; color:#334155; margin-bottom:4px;">👤 الاسم واللقب للزبون *</label>
              <input type="text" name="customer_name" required placeholder="مثال: أحمد مسعودي" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #CBD5E1; border-radius:10px; font-size:13px; font-weight:600;" />
            </div>

            <div>
              <label style="display:block; font-size:11.5px; font-weight:700; color:#334155; margin-bottom:4px;">📞 رقم الهاتف (10 أرقام) *</label>
              <input type="tel" name="phone" required placeholder="0661234567" dir="ltr" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #CBD5E1; border-radius:10px; font-size:13px; font-family:monospace; font-weight:600;" />
            </div>

            <div>
              <label style="display:block; font-size:11.5px; font-weight:700; color:#334155; margin-bottom:4px;">💳 رقم البطاقة المسلمة له *</label>
              <input type="text" name="card_number" required placeholder="03-8542-1092-7741" dir="ltr" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1.5px solid #10B981; border-radius:10px; font-size:13px; font-family:monospace; font-weight:700; color:#065F46; background:#F0FDF4;" />
            </div>

            <div>
              <label style="display:block; font-size:11.5px; font-weight:700; color:#334155; margin-bottom:4px;">⭐ رصيد النقاط الأولي للمالك اختياره *</label>
              <input type="number" name="points" value="50" min="0" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1.5px solid #D97706; border-radius:10px; font-size:13px; font-family:monospace; font-weight:700; color:#92400E; background:#FEF3C7;" />
            </div>

            <div>
              <label style="display:block; font-size:11.5px; font-weight:700; color:#334155; margin-bottom:4px;">💼 المهنة (اختياري)</label>
              <input type="text" name="profession" placeholder="مثال: أستاذ / مهندس / طالب" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #CBD5E1; border-radius:10px; font-size:13px;" />
            </div>

            <div>
              <label style="display:block; font-size:11.5px; font-weight:700; color:#334155; margin-bottom:4px;">📍 الحي أو العنوان (اختياري)</label>
              <input type="text" name="address" placeholder="مثال: حي المقام - الأغواط" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #CBD5E1; border-radius:10px; font-size:13px;" />
            </div>

            <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; margin-top:4px;">
              <button type="submit" style="background:#059669; color:#FFFFFF; border:none; padding:11px 24px; border-radius:12px; font-weight:800; font-size:13.5px; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 2px 6px rgba(5,150,105,0.25);">
                <span>✅ حفظ وإصدار البطاقة الافتراضية للزبون</span>
              </button>
            </div>
          </form>
        </div>
      `;

      let cardsContent = `
        ${isCardAdded ? `
          <div style="background:#ECFDF5; border:1.5px solid #10B981; color:#065F46; padding:14px 18px; border-radius:14px; margin-bottom:18px; font-weight:700; font-size:13.5px; display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">🎉</span>
            <div>
              <strong>تم حفظ وإصدار بطاقة الوفاء بنجاح!</strong>
              <div style="font-size:12px; font-weight:500; color:#047857; margin-top:2px;">الزبون الآن مسجل رسمياً ويمكنه الدخول إلى الموقع في أي وقت وإدخال رقم هاتفه لرؤية بطاقته الافتراضية.</div>
            </div>
          </div>
        ` : ''}

        ${isCardApproved ? `
          <div style="background:#ECFDF5; border:1.5px solid #10B981; color:#065F46; padding:12px 16px; border-radius:14px; margin-bottom:18px; font-weight:700; font-size:13px;">
            ✅ تم اعتماد طلب البطاقة وتعيين رصيد النقاط بنجاح!
          </div>
        ` : ''}

        ${isPhoneUpdated ? `
          <div style="background:#EFF6FF; border:1.5px solid #60A5FA; color:#1E40AF; padding:12px 16px; border-radius:14px; margin-bottom:18px; font-weight:700; font-size:13px;">
            📞 تم تحديث رقم هاتف الزبون بنجاح!
          </div>
        ` : ''}

        ${isPointsUpdated ? `
          <div style="background:#FFFBEB; border:1.5px solid #FCD34D; color:#92400E; padding:12px 16px; border-radius:14px; margin-bottom:18px; font-weight:700; font-size:13px;">
            ⭐ تم تحديث رصيد نقاط الزبون والترقية بنجاح!
          </div>
        ` : ''}

        ${manualAddForm}
      `;

      if (reqs.length === 0) {
        cardsContent += `
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 48px 20px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">💳</div>
            <h3 style="color: #1E293B; font-size: 17px; font-weight: bold; margin-bottom: 6px;">لا توجد أي بطاقات مسجلة حالياً</h3>
            <p style="color: #64748B; font-size: 13.5px; max-width: 380px; margin: 0 auto; line-height: 1.6;">
              يمكنك استخدام النموذج الأخضر أعلاه لإضافة أي زبون سلمتم له بطاقة في المحل، أو انتظار طلبات الزبائن الجديدة من الموقع.
            </p>
          </div>`;
      } else {
        cardsContent += `
          <div style="margin-bottom:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:12px 14px; text-align:center;">
              <div style="font-size:11px; color:#64748B; font-weight:600;">إجمالي البطاقات</div>
              <div style="font-size:20px; font-weight:800; color:#0F172A; margin-top:2px;">${reqs.length}</div>
            </div>
            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:12px 14px; text-align:center;">
              <div style="font-size:11px; color:#047857; font-weight:600;">مفعلة ونشطة</div>
              <div style="font-size:20px; font-weight:800; color:#047857; margin-top:2px;">${activeCardsCount}</div>
            </div>
            <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:14px; padding:12px 14px; text-align:center;">
              <div style="font-size:11px; color:#DC2626; font-weight:600;">معطلة من الإدارة</div>
              <div style="font-size:20px; font-weight:800; color:#DC2626; margin-top:2px;">${disabledCardsCount}</div>
            </div>
            <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:14px; padding:12px 14px; text-align:center;">
              <div style="font-size:11px; color:#B45309; font-weight:600;">بانتظار الموافقة</div>
              <div style="font-size:20px; font-weight:800; color:#B45309; margin-top:2px;">${pendingCardsCount}</div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            ${reqs.map((r: any) => {
              const isPending = r.status === 'pending';
              const isApprovedPendingPin = r.status === 'approved_pending_pin';
              const isActive = r.status === 'active';
              const isDisabled = r.status === 'disabled';

              let statusBadge = '';
              if (isDisabled) {
                statusBadge = '<span style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; padding:3px 10px; border-radius:20px; font-weight:700; font-size:12px;">🚫 معطلة من الإدارة</span>';
              } else if (isActive) {
                statusBadge = '<span style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; padding:3px 10px; border-radius:20px; font-weight:700; font-size:12px;">✅ نشطة ومفعلة</span>';
              } else if (isApprovedPendingPin) {
                statusBadge = '<span style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; padding:3px 10px; border-radius:20px; font-weight:700; font-size:12px;">🔑 معتمدة (بانتظار PIN)</span>';
              } else {
                statusBadge = '<span style="background:#FFFBEB; color:#B45309; border:1px solid #FDE68A; padding:3px 10px; border-radius:20px; font-weight:700; font-size:12px;">⏳ قيد الانتظار</span>';
              }

              return `
                <div style="background:#FFFFFF; border-radius:18px; border:1px solid ${isDisabled ? '#FECACA' : '#E2E8F0'}; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px; border-bottom:1px solid #F1F5F9; padding-bottom:12px;">
                    <div>
                      <div style="font-size:16px; font-weight:700; color:#0F172A; display:flex; align-items:center; gap:8px;">
                        <span>${escapeHtml(r.customerName)}</span>
                        ${statusBadge}
                      </div>

                      <div style="margin-top:6px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <!-- Inline Edit Phone Form -->
                        <form method="GET" action="${basePath}" style="display:inline-flex; align-items:center; gap:4px; background:#F8FAFC; padding:4px 8px; border-radius:8px; border:1px solid #E2E8F0;">
                          <input type="hidden" name="tab" value="cards" />
                          <input type="hidden" name="action" value="update_customer_phone" />
                          <input type="hidden" name="phone" value="${escapeHtml(r.customerPhone)}" />
                          <span style="font-size:12px;">📞</span>
                          <input type="tel" name="new_phone" value="${escapeHtml(r.customerPhone)}" dir="ltr" style="width:110px; font-size:12px; font-family:monospace; font-weight:700; padding:2px 6px; border:1px solid #CBD5E1; border-radius:6px;" title="تعديل رقم الهاتف" />
                          <button type="submit" style="padding:3px 7px; font-size:11px; background:#0F172A; color:#fff; border:none; border-radius:6px; cursor:pointer;" title="حفظ رقم الهاتف">💾</button>
                        </form>

                        <!-- Inline Edit Points Form -->
                        <form method="GET" action="${basePath}" style="display:inline-flex; align-items:center; gap:4px; background:#FEF3C7; padding:4px 8px; border-radius:8px; border:1px solid #FCD34D;">
                          <input type="hidden" name="tab" value="cards" />
                          <input type="hidden" name="action" value="update_card_points" />
                          <input type="hidden" name="phone" value="${escapeHtml(r.customerPhone)}" />
                          <span style="font-size:12px;">⭐</span>
                          <input type="number" name="points" value="${r.points || 0}" min="0" style="width:65px; font-size:12px; font-family:monospace; font-weight:700; padding:2px 6px; border:1px solid #F59E0B; border-radius:6px; color:#92400E;" title="تعديل رصيد النقاط" />
                          <button type="submit" style="padding:3px 7px; font-size:11px; background:#D97706; color:#fff; border:none; border-radius:6px; cursor:pointer;" title="حفظ النقاط">💾</button>
                        </form>

                        <span style="font-family:monospace; color:#334155; font-weight:700; font-size:12px; background:#F1F5F9; padding:4px 8px; border-radius:8px;">💳 ${escapeHtml(r.cardNumber || 'بانتظار التعيين')}</span>
                      </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="background:#F1F5F9; color:#475569; padding:4px 10px; border-radius:8px; font-size:12px; font-weight:600;">
                        الفئة: <b>${r.tier === 'black_vip' ? '🖤 VIP الأسود' : r.tier === 'gold' ? '💛 ذهبي' : r.tier === 'silver' ? '🥈 فضي' : '🎟️ كلاسيك'}</b>
                      </span>
                    </div>
                  </div>

                  <!-- Customer Details -->
                  <div style="font-size:12.5px; color:#475569; display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:6px; margin-bottom:12px; background:#F8FAFC; padding:10px 14px; border-radius:10px;">
                    <div>📅 تاريخ الميلاد: <b>${escapeHtml(r.customerBirthDate || 'غير محدد')}</b></div>
                    <div>💼 المهنة: <b>${escapeHtml(r.customerProfession || 'غير محدد')}</b></div>
                    <div>📍 العنوان: <b>${escapeHtml(r.customerAddress || 'الأغواط')}</b></div>
                    ${r.customerEmail ? `<div>✉️ البريد: <b>${escapeHtml(r.customerEmail)}</b></div>` : ''}
                  </div>

                  <!-- Action Bar -->
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="font-size:11.5px; color:#94A3B8;">
                      ${r.requestedAt ? `تاريخ الطلب: ${new Date(r.requestedAt).toLocaleString('ar-DZ')}` : ''}
                      ${r.approvedAt ? ` · <span style="color:#047857; font-weight:600;">تم الاعتماد: ${new Date(r.approvedAt).toLocaleDateString('ar-DZ')}</span>` : ''}
                    </div>

                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                      ${isPending ? `
                        <!-- Approve with custom initial points & card number -->
                        <form method="GET" action="${basePath}" style="display:inline-flex; align-items:center; gap:6px; background:#F0FDF4; padding:6px 10px; border-radius:10px; border:1px solid #A7F3D0;">
                          <input type="hidden" name="tab" value="cards" />
                          <input type="hidden" name="action" value="approve_loyalty" />
                          <input type="hidden" name="phone" value="${escapeHtml(r.customerPhone)}" />

                          <label style="font-size:11px; font-weight:700; color:#065F46;">رقم البطاقة:</label>
                          <input type="text" name="card_number" value="${escapeHtml(r.cardNumber || '')}" placeholder="03-XXXX-XXXX-XXXX" dir="ltr" style="width:130px; font-size:11.5px; font-family:monospace; padding:3px 6px; border:1px solid #A7F3D0; border-radius:6px;" required />

                          <label style="font-size:11px; font-weight:700; color:#065F46;">النقاط الأولية:</label>
                          <input type="number" name="points" value="50" min="0" style="width:60px; font-size:11.5px; font-family:monospace; padding:3px 6px; border:1px solid #A7F3D0; border-radius:6px; font-weight:700;" />

                          <button type="submit" style="background:#059669; color:#fff; border:none; padding:4px 12px; border-radius:6px; font-weight:700; font-size:11.5px; cursor:pointer;">
                            ✅ اعتماد وإصدار
                          </button>
                        </form>
                      ` : ''}

                      <a href="tel:${escapeHtml(r.customerPhone)}" style="background:#F1F5F9; color:#334155; text-decoration:none; padding:7px 12px; border-radius:10px; font-size:12px; font-weight:700;">📞 اتصال</a>

                      ${(isActive || isApprovedPendingPin) ? `
                        <a href="${basePath}?action=disable_loyalty&phone=${encodeURIComponent(r.customerPhone)}" onclick="return confirm('⚠️ هل أنت متأكد من تعطيل بطاقة الزبون (${escapeHtml(r.customerName)})؟')" style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; text-decoration:none; padding:7px 12px; border-radius:10px; font-size:12px; font-weight:700;">
                          🚫 تعطيل
                        </a>
                      ` : ''}

                      ${isDisabled ? `
                        <a href="${basePath}?action=enable_loyalty&phone=${encodeURIComponent(r.customerPhone)}" style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; text-decoration:none; padding:7px 12px; border-radius:10px; font-size:12px; font-weight:700;">
                          🔄 إعادة تفعيل
                        </a>
                      ` : ''}

                      <a href="${basePath}?action=delete_loyalty&phone=${encodeURIComponent(r.customerPhone)}" onclick="return confirm('هل تريد حذف سجل هذه البطاقة نهائياً؟')" style="background:#F1F5F9; color:#94A3B8; text-decoration:none; padding:7px 10px; border-radius:10px; font-size:12px;">
                        🗑️
                      </a>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      // ─── TAB 4: Logs Content (IP Access Records) ───────────────────────────
      const isLogsCleared = url.searchParams.get('cleared') === '1';

      const logsContent = `
        ${isLogsCleared ? `
          <div style="background:#ECFDF5; border:1.5px solid #10B981; color:#065F46; padding:12px 16px; border-radius:14px; margin-bottom:18px; font-weight:700; font-size:13px;">
            ✅ تم مسح سجل عناوين IP بنجاح!
          </div>
        ` : ''}

        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:18px; padding:20px 22px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h3 style="font-size:16px; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px;">
              <span>🛡️ سجل محاولات الدخول وعناوين IP</span>
              <span style="font-size:12px; background:#F1F5F9; color:#475569; padding:2px 8px; border-radius:12px;">${logsList.length} عملية مسجلة</span>
            </h3>
            <p style="font-size:12.5px; color:#64748B; margin-top:3px;">
              يتم تسجيل عنوان IP، الدولة والمدينة، ونوع المتصفح والجهاز تلقائياً لحماية لوحة الإدارة ومنع محاولات الاختراق.
            </p>
          </div>
          ${logsList.length > 0 ? `
            <a href="${basePath}?tab=logs&action=clear_logs" onclick="return confirm('هل أنت متأكد من مسح سجل الدخول بالكامل؟')" style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; text-decoration:none; padding:8px 16px; border-radius:10px; font-size:12px; font-weight:700;">
              🗑️ مسح السجل
            </a>
          ` : ''}
        </div>

        ${logsList.length === 0 ? `
          <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:18px; padding:48px 20px; text-align:center;">
            <div style="font-size:40px; margin-bottom:12px;">🛡️</div>
            <h3 style="color:#1E293B; font-size:17px; font-weight:bold; margin-bottom:6px;">السجل فارغ حالياً</h3>
            <p style="color:#64748B; font-size:13.5px; max-width:380px; margin:0 auto; line-height:1.6;">
              أي محاولة دخول ناجحة أو خاطئة أو حظر سيتم تدوينها هنا مع عنوان IP وتفاصيل الجهاز.
            </p>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${logsList.map((log) => {
              const statusBadge =
                log.status === 'success'
                  ? '<span style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; padding:3px 10px; border-radius:20px; font-weight:700; font-size:11.5px;">✅ دخول ناجح</span>'
                  : log.status === 'failed'
                  ? '<span style="background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; padding:3px 10px; border-radius:20px; font-weight:700; font-size:11.5px;">❌ PIN خاطئ</span>'
                  : '<span style="background:#450A0A; color:#FEF2F2; padding:3px 10px; border-radius:20px; font-weight:700; font-size:11.5px;">🚫 تم الحظر مؤقتاً</span>';

              return `
                <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:14px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div>${statusBadge}</div>
                    <div>
                      <div style="font-family:monospace; font-weight:800; font-size:14px; color:#0F172A;">
                        🌐 ${escapeHtml(log.ip)}
                      </div>
                      <div style="font-size:11.5px; color:#64748B; margin-top:2px;">
                        📍 ${escapeHtml(log.country)} · ${escapeHtml(log.city)}
                        <span> · </span>
                        <span>${escapeHtml(log.userAgent)}</span>
                      </div>
                    </div>
                  </div>

                  <div style="font-size:12px; color:#64748B; font-family:monospace; direction:ltr; text-align:right;">
                    ${log.timestamp ? new Date(log.timestamp).toLocaleString('ar-DZ') : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      `;

      // ─── TAB 5: Store Phone / Settings Content ─────────────────────────────
      const isStorePhoneSaved = url.searchParams.get('saved') === '1';

      const settingsContent = `
        ${isStorePhoneSaved ? `
          <div style="background:#ECFDF5; border:1.5px solid #10B981; color:#065F46; padding:12px 16px; border-radius:14px; margin-bottom:18px; font-weight:700; font-size:13px;">
            ✅ تم حفظ وتحديث رقم هاتف المتجر بنجاح! سيظهر لجميع الزبائن في المتجر.
          </div>
        ` : ''}

        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:18px; padding:24px 22px; box-shadow:0 2px 8px rgba(0,0,0,0.02); max-width:540px; margin:0 auto;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; border-bottom:1px solid #F1F5F9; padding-bottom:12px;">
            <div style="font-size:26px;">📞</div>
            <div>
              <h3 style="font-size:16px; font-weight:800; color:#0F172A; margin:0;">رقم هاتف المتجر الرسمي</h3>
              <p style="font-size:12px; color:#64748B; margin-top:2px;">يظهر هذا الرقم للزبائن في أعلى وأسفل المتجر وعند الاتصال بالفرع.</p>
            </div>
          </div>

          <form method="GET" action="${basePath}">
            <input type="hidden" name="tab" value="settings" />
            <input type="hidden" name="action" value="update_store_phone" />

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:6px;">رقم الهاتف الحالي للمتجر:</label>
              <input type="text" name="store_phone" value="${escapeHtml(storePhone.display)}" required dir="ltr" style="width:100%; box-sizing:border-box; padding:12px 14px; border:1.5px solid #CBD5E1; border-radius:10px; font-size:16px; font-family:monospace; font-weight:700; text-align:center; color:#0F172A;" />
              <div style="font-size:11.5px; color:#94A3B8; margin-top:6px;">
                يمكن كتابته بالصيغة المحلية (مثل: 0550 10 10 12) أو الدولية (+213 550 10 10 12).
              </div>
            </div>

            <button type="submit" style="width:100%; background:#0F172A; color:#FFD100; border:none; padding:12px 20px; border-radius:12px; font-weight:800; font-size:14px; cursor:pointer; box-shadow:0 3px 10px rgba(15,23,42,0.15);">
              💾 حفظ رقم الهاتف الجديد
            </button>
          </form>
        </div>
      `;

      // Main container layout
      const tabTitle =
        currentTab === 'products'
          ? 'إدارة المنتجات'
          : currentTab === 'cards'
          ? 'بطاقات الوفاء'
          : currentTab === 'logs'
          ? 'سجل الدخول'
          : currentTab === 'settings'
          ? 'هاتف المتجر'
          : 'طلبات المتجر';

      const tabSubtitle =
        currentTab === 'products'
          ? `إجمالي المنتجات: <b>${productsList.length}</b> منتج`
          : currentTab === 'cards'
          ? `إجمالي البطاقات: <b>${reqs.length}</b> (${activeCardsCount} مفعلة · ${pendingCardsCount} بانتظار الاعتماد)`
          : currentTab === 'logs'
          ? `السجلات: <b>${logsList.length}</b> عملية دخول`
          : currentTab === 'settings'
          ? `هاتف المتجر: <b>${escapeHtml(storePhone.display)}</b>`
          : `الطلبات المسجلة: <b>${ordersList.length}</b> طلب`;

      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tabTitle} — لوحة تحكم تكنو الأغواط</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #F8FAFC;
      color: #1E293B;
      padding: 24px 16px 60px;
      direction: rtl;
      line-height: 1.5;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      padding: 16px 20px;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      flex-wrap: wrap;
      gap: 12px;
    }
    .top-title {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .top-subtitle {
      font-size: 12.5px;
      color: #64748B;
      margin-top: 2px;
    }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-delete-all {
      background: #FEE2E2;
      color: #B91C1C !important;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-delete-all:hover { background: #FECACA; }
    .btn-logout {
      background: #F1F5F9;
      color: #475569 !important;
      text-decoration: none;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
    }
    .nav-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .nav-tab {
      flex: 1;
      min-width: 130px;
      text-align: center;
      padding: 11px 14px;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 700;
      font-size: 13.5px;
      transition: all 0.2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .nav-tab.active {
      background: #0F172A;
      color: #FFD100;
      box-shadow: 0 4px 12px rgba(15,23,42,0.15);
    }
    .nav-tab:not(.active) {
      background: #FFFFFF;
      color: #64748B;
      border: 1px solid #E2E8F0;
    }
    .nav-tab:not(.active):hover {
      background: #F1F5F9;
      color: #0F172A;
    }
    .order-card {
      background: #FFFFFF;
      border-radius: 18px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      transition: border-color 0.2s;
    }
    .order-card.confirmed { border-color: #A7F3D0; }
    .order-card.cancelled { border-color: #FECACA; opacity: 0.85; }
    .order-card-header {
      padding: 14px 18px;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .order-id {
      font-family: monospace;
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
    }
    .order-date {
      font-size: 11.5px;
      color: #64748B;
      margin-right: 8px;
    }
    .badge {
      font-size: 11.5px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      display: inline-block;
    }
    .badge-confirmed { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .badge-cancelled { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
    .badge-pending { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
    .order-card-body {
      padding: 18px;
    }
    .customer-info {
      font-size: 13.5px;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .info-line {
      display: flex;
      gap: 6px;
      margin-bottom: 3px;
    }
    .info-label {
      color: #64748B;
      flex-shrink: 0;
    }
    .info-val {
      color: #1E293B;
    }
    .btn-call {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #16A34A;
      color: #FFFFFF !important;
      padding: 11px 16px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14.5px;
      margin: 12px 0;
      transition: background 0.2s;
    }
    .btn-call:hover { background: #15803D; }
    .items-list {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 12.5px;
      margin: 12px 0;
    }
    .items-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      color: #475569;
      margin-bottom: 4px;
    }
    .totals-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px dashed #CBD5E1;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 13px;
      color: #475569;
    }
    .total-highlight {
      font-size: 15px;
      font-weight: 700;
      color: #E30613;
    }
    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #F1F5F9;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-confirm { background: #10B981; color: #FFFFFF !important; }
    .btn-cancel { background: #FEE2E2; color: #DC2626 !important; }
    .btn-neutral { background: #F1F5F9; color: #475569 !important; }
    .btn-delete { background: #F1F5F9; color: #94A3B8 !important; }
    .btn-delete:hover { background: #FEE2E2; color: #DC2626 !important; }
    .btn-link { background: transparent; color: #2563EB !important; padding-left: 0; padding-right: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-bar">
      <div>
        <h1 class="top-title">${tabTitle}</h1>
        <div class="top-subtitle">${tabSubtitle}</div>
      </div>
      <div class="top-actions">
        ${
          currentTab === 'orders' && ordersList.length > 0
            ? `<a href="${basePath}?action=delete_all" onclick="return confirm('هل أنت متأكد من حذف جميع الطلبات (${ordersList.length})؟ لا يمكن استرجاعها بعد الحذف.')" class="btn-delete-all">
                حذف كل الطلبات
              </a>`
            : ''
        }
        <a href="${basePath}?logout=1" class="btn-logout">خروج</a>
      </div>
    </div>

    <!-- Navigation Tabs: 5 Sections -->
    <div class="nav-tabs">
      <a href="${basePath}?tab=orders" class="nav-tab ${currentTab === 'orders' ? 'active' : ''}">
        الطلبات (${ordersList.length})
      </a>
      <a href="${basePath}?tab=products" class="nav-tab ${currentTab === 'products' ? 'active' : ''}">
        المنتجات (${productsList.length})
      </a>
      <a href="${basePath}?tab=cards" class="nav-tab ${currentTab === 'cards' ? 'active' : ''}">
        بطاقات الوفاء (${reqs.length})
        ${pendingCardsCount > 0 ? `<span style="background:#EF4444; color:#fff; font-size:10px; padding:2px 6px; border-radius:10px;">${pendingCardsCount}</span>` : ''}
      </a>
      <a href="${basePath}?tab=logs" class="nav-tab ${currentTab === 'logs' ? 'active' : ''}">
        سجل الدخول (${logsList.length})
      </a>
      <a href="${basePath}?tab=settings" class="nav-tab ${currentTab === 'settings' ? 'active' : ''}">
        هاتف المتجر
      </a>
    </div>

    ${
      currentTab === 'products'
        ? productsContent
        : currentTab === 'cards'
        ? cardsContent
        : currentTab === 'logs'
        ? logsContent
        : currentTab === 'settings'
        ? settingsContent
        : ordersContent
    }
  </div>

  <script>
    // Product Mode Switcher (Single vs Multi-Shapes)
    function switchProductMode(mode) {
      var isMulti = mode === 'multi';
      var singleBtn = document.getElementById('tab-single-prod');
      var multiBtn = document.getElementById('tab-multi-prod');
      var priceCol = document.getElementById('single-price-col');
      var dimsCol = document.getElementById('single-dims-col');
      var photosSec = document.getElementById('single-photos-section');
      var multiSection = document.getElementById('multi-shapes-section');
      var modeInput = document.getElementById('prod-mode');
      var priceInput = document.getElementById('single-price-input');

      if (modeInput) modeInput.value = mode;

      if (isMulti) {
        if (singleBtn) {
          singleBtn.style.background = 'transparent';
          singleBtn.style.color = '#64748B';
          singleBtn.style.boxShadow = 'none';
        }
        if (multiBtn) {
          multiBtn.style.background = '#FFFFFF';
          multiBtn.style.color = '#0F172A';
          multiBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }
        if (priceCol) priceCol.style.display = 'none';
        if (dimsCol) dimsCol.style.display = 'none';
        if (photosSec) photosSec.style.display = 'none';
        if (multiSection) multiSection.style.display = 'block';
        if (priceInput) priceInput.removeAttribute('required');

        var container = document.getElementById('shapes-cards-container');
        if (container && container.children.length === 0) {
          addNewShapeCard();
        }
      } else {
        if (singleBtn) {
          singleBtn.style.background = '#FFFFFF';
          singleBtn.style.color = '#0F172A';
          singleBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }
        if (multiBtn) {
          multiBtn.style.background = 'transparent';
          multiBtn.style.color = '#64748B';
          multiBtn.style.boxShadow = 'none';
        }
        if (priceCol) priceCol.style.display = 'block';
        if (dimsCol) dimsCol.style.display = 'block';
        if (photosSec) photosSec.style.display = 'block';
        if (multiSection) multiSection.style.display = 'none';
        if (priceInput) priceInput.setAttribute('required', 'true');
      }
    }

    // Client-side Canvas Image Compressor (max dimension 1000px, 0.82 JPEG quality)
    function compressImageFile(file, maxWidth, quality) {
      maxWidth = maxWidth || 1000;
      quality = quality || 0.82;
      return new Promise(function(resolve, reject) {
        if (!file || !file.type.startsWith('image/')) {
          return reject(new Error('الملف المحدد ليس صورة صالحة.'));
        }
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = new Image();
          img.onload = function() {
            var width = img.width;
            var height = img.height;
            if (width > maxWidth || height > maxWidth) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxWidth) / height);
                height = maxWidth;
              }
            }
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(function(blob) {
              if (blob) {
                resolve({
                  blob: blob,
                  originalSize: file.size,
                  compressedSize: blob.size,
                  dataUrl: canvas.toDataURL('image/jpeg', quality)
                });
              } else {
                reject(new Error('فشل ضغط الصورة'));
              }
            }, 'image/jpeg', quality);
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Upload compressed image blob to /api/upload-image (with fallbackDataUrl for 100% reliable upload)
    function uploadCompressedImageBlob(blob, fallbackDataUrl) {
      var formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      return fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      }).then(function(res) {
        if (!res.ok) throw new Error('فشل استجابة السيرفر');
        return res.json();
      }).then(function(data) {
        var url = data && (data.url || data.imageUrl);
        if (!url) throw new Error('استجابة غير صالحة من السيرفر');
        return url;
      }).catch(function(err) {
        if (fallbackDataUrl) {
          return fallbackDataUrl;
        }
        throw err;
      });
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Handle single mode product files upload
    function handleProductFiles(files) {
      if (!files || files.length === 0) return;
      var previewsContainer = document.getElementById('image-previews');
      var hiddenContainer = document.getElementById('hidden-inputs');
      var statusEl = document.getElementById('upload-status');
      if (!previewsContainer || !hiddenContainer) return;

      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#0284C7';
        statusEl.textContent = 'جاري ضغط ورفع ' + files.length + ' صور...';
      }

      var uploadPromises = [];
      for (var i = 0; i < files.length; i++) {
        (function(file) {
          var p = compressImageFile(file, 1000, 0.82).then(function(res) {
            return uploadCompressedImageBlob(res.blob, res.dataUrl).then(function(url) {
              var card = document.createElement('div');
              card.style.cssText = 'position:relative; border-radius:8px; overflow:hidden; border:1px solid #CBD5E1; background:#F8FAFC;';
              card.innerHTML = '<img src="' + url + '" style="width:100%; height:90px; object-fit:cover;" />' +
                '<div style="font-size:10px; color:#047857; padding:2px 4px; font-weight:600; text-align:center;">' + formatBytes(res.compressedSize) + ' (' + Math.round((1 - res.compressedSize / res.originalSize) * 100) + '% توفير)</div>';
              previewsContainer.appendChild(card);

              var input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'uploaded_image_urls';
              input.value = url;
              hiddenContainer.appendChild(input);
            });
          });
          uploadPromises.push(p);
        })(files[i]);
      }

      Promise.all(uploadPromises).then(function() {
        if (statusEl) {
          statusEl.style.color = '#047857';
          statusEl.textContent = 'تم ضغط ورفع جميع الصور بنجاح.';
        }
      }).catch(function(err) {
        if (statusEl) {
          statusEl.style.color = '#DC2626';
          statusEl.textContent = 'حدث تنبيه أثناء الرفع: ' + err.message;
        }
      });
    }

    // Trigger file dialog for a shape card
    function triggerShapeFileInput(btn) {
      var card = btn.closest('.shape-card');
      if (!card) return;
      var fileInput = card.querySelector('.shape-file-input');
      if (fileInput) fileInput.click();
    }

    // Handle shape photo upload with auto-compression
    function handleShapePhotoUpload(input) {
      var file = input.files && input.files[0];
      if (!file) return;
      var card = input.closest('.shape-card');
      if (!card) return;

      var thumb = card.querySelector('.shape-thumb');
      var label = card.querySelector('.shape-file-label');
      var status = card.querySelector('.shape-file-status');
      var hiddenUrl = card.querySelector('.shape-image-url');

      if (label) label.textContent = 'جاري ضغط ورفع الصورة...';
      if (status) status.textContent = 'تقليل الحجم لسرعة التحميل';

      compressImageFile(file, 1000, 0.82).then(function(res) {
        if (thumb) thumb.src = res.dataUrl;
        return uploadCompressedImageBlob(res.blob, res.dataUrl).then(function(url) {
          if (hiddenUrl) hiddenUrl.value = url;
          if (label) label.textContent = 'تم إرفاق الصورة بنجاح';
          if (status) {
            var savedPct = Math.round((1 - res.compressedSize / res.originalSize) * 100);
            status.textContent = 'الحجم: ' + formatBytes(res.compressedSize) + ' (تم تقليل ' + savedPct + '%)';
          }
          syncShapesToJson();
        });
      }).catch(function(err) {
        if (label) label.textContent = 'فشل الرفع';
        if (status) status.textContent = err.message || 'حدث خطأ';
      });
    }

    // Add new shape card
    function addNewShapeCard() {
      var container = document.getElementById('shapes-cards-container');
      if (!container) return;
      var index = container.children.length + 1;

      var card = document.createElement('div');
      card.className = 'shape-card';
      card.style.cssText = 'background:#FFFFFF; border:1px solid #CBD5E1; border-radius:12px; padding:16px; position:relative; box-shadow:0 1px 3px rgba(0,0,0,0.03);';
      card.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #F1F5F9; padding-bottom:8px;">' +
          '<span style="font-weight:700; font-size:13.5px; color:#0F172A;">الموديل رقم <span class="shape-num">' + index + '</span></span>' +
          '<button type="button" onclick="removeShapeCard(this)" class="remove-shape-btn" style="background:#FEE2E2; color:#DC2626; border:none; padding:4px 10px; border-radius:6px; font-size:11.5px; font-weight:600; cursor:pointer;' + (index === 1 ? 'display:none;' : '') + '">حذف هذا الموديل</button>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">' +
          '<div style="grid-column: 1 / -1;">' +
            '<label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">صورة الموديل (اضغط لاختيار صورة وسيتم تقليل حجمها تلقائياً) *</label>' +
            '<div class="shape-dropzone" onclick="triggerShapeFileInput(this)" style="border:1.5px dashed #CBD5E1; border-radius:10px; padding:12px 16px; text-align:center; cursor:pointer; background:#F8FAFC; display:flex; align-items:center; gap:12px;">' +
              '<img class="shape-thumb" src="/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg" style="width:48px; height:48px; object-fit:cover; border-radius:8px; border:1px solid #CBD5E1; flex-shrink:0;" />' +
              '<div style="text-align:right;">' +
                '<div style="font-size:13px; font-weight:600; color:#0F172A;" class="shape-file-label">اضغط لاختيار صورة هذا الموديل</div>' +
                '<div style="font-size:11.5px; color:#64748B;" class="shape-file-status">يتم تقليل وضغط الحجم تلقائياً لتسريع التصفح</div>' +
              '</div>' +
            '</div>' +
            '<input type="file" accept="image/*" class="shape-file-input" style="display:none;" onchange="handleShapePhotoUpload(this)" />' +
            '<input type="hidden" class="shape-image-url" value="" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">اسم الموديل أو الشكل *</label>' +
            '<input type="text" class="shape-name" placeholder="مثال: شكل قطة كرتونية / أزرق ملكي" style="width:100%; box-sizing:border-box; height:40px; padding:8px 12px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; font-weight:600; outline:none;" oninput="syncShapesToJson()" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">الرقم التسلسلي / كود الموديل (SKU)</label>' +
            '<input type="text" class="shape-sku" placeholder="مثال: 71645-A أو 101" style="width:100%; box-sizing:border-box; height:40px; padding:8px 12px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; font-family:monospace; outline:none;" oninput="syncShapesToJson()" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">السعر بالدينار الجزائري (د.ج) <span style="font-size:11px; font-weight:400; color:#64748B;">(أو حدد أسعار القياسات بالأسفل)</span></label>' +
            '<input type="number" class="shape-price" min="0" placeholder="مثال: 1800" style="width:100%; box-sizing:border-box; height:40px; padding:8px 12px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; font-family:monospace; font-weight:700; color:#0F172A; outline:none;" oninput="syncShapesToJson()" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">وصف ومميزات هذا الموديل (اختياري)</label>' +
            '<input type="text" class="shape-desc" placeholder="مثال: مبطنة بجيب إضافي" style="width:100%; box-sizing:border-box; height:40px; padding:8px 12px; border:1px solid #CBD5E1; border-radius:8px; font-size:13px; outline:none;" oninput="syncShapesToJson()" />' +
          '</div>' +
          '<div style="grid-column: 1 / -1;">' +
            '<label style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:5px;">القياسات والأبعاد (أو عدة قياسات بأسعارها)</label>' +
            '<textarea class="shape-dims" rows="2" placeholder="قياس واحد: 40x60 سم أو A4&#10;أو كل قياس بسعره (سطر لكل قياس):&#10;صغير : 1800&#10;متوسط : 2500&#10;كبير : 3400" style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #CBD5E1; border-radius:8px; font-size:12.5px; line-height:1.4; outline:none;" oninput="syncShapesToJson()"></textarea>' +
          '</div>' +
        '</div>';

      container.appendChild(card);
      updateShapeNumbers();
      syncShapesToJson();
    }

    // Remove shape card
    function removeShapeCard(btn) {
      var card = btn.closest('.shape-card');
      if (!card) return;
      card.remove();
      updateShapeNumbers();
      syncShapesToJson();
    }

    // Renumber shape cards
    function updateShapeNumbers() {
      var container = document.getElementById('shapes-cards-container');
      if (!container) return;
      var cards = container.querySelectorAll('.shape-card');
      cards.forEach(function(card, idx) {
        var numSpan = card.querySelector('.shape-num');
        if (numSpan) numSpan.textContent = idx + 1;
        var removeBtn = card.querySelector('.remove-shape-btn');
        if (removeBtn) {
          removeBtn.style.display = cards.length > 1 ? 'inline-block' : 'none';
        }
      });
    }

    // Sync shapes cards data into hidden variants_json field
    function syncShapesToJson() {
      var container = document.getElementById('shapes-cards-container');
      var jsonInput = document.getElementById('variants-json-input');
      var priceInput = document.getElementById('single-price-input');
      var modeInput = document.getElementById('prod-mode');
      if (!container || !jsonInput) return;

      var cards = container.querySelectorAll('.shape-card');
      var list = [];
      var minPrice = 0;

      cards.forEach(function(card, idx) {
        var nameInput = card.querySelector('.shape-name');
        var skuInput = card.querySelector('.shape-sku');
        var priceIn = card.querySelector('.shape-price');
        var descInput = card.querySelector('.shape-desc');
        var dimsInput = card.querySelector('.shape-dims');
        var imgInput = card.querySelector('.shape-image-url');

        var name = (nameInput && nameInput.value || '').trim();
        var sku = (skuInput && skuInput.value || '').trim();
        var price = parseFloat(priceIn && priceIn.value || '0');
        var desc = (descInput && descInput.value || '').trim();
        var dims = (dimsInput && dimsInput.value || '').trim();
        var image = (imgInput && imgInput.value || '').trim();

        if (name || sku || price > 0 || dims || image) {
          list.push({
            name: name || ('شكل ' + (idx + 1)),
            sku: sku || undefined,
            priceDzd: price || 0,
            description: desc,
            dimensions: dims,
            image: image
          });
          if (price > 0) {
            if (minPrice === 0 || price < minPrice) minPrice = price;
          }
        }
      });

      jsonInput.value = list.length > 0 ? JSON.stringify(list) : '';

      if (modeInput && modeInput.value === 'multi' && priceInput) {
        priceInput.value = minPrice > 0 ? minPrice : 1000;
      }
    }

    // Attach submit listener
    document.addEventListener('DOMContentLoaded', function() {
      var form = document.querySelector('form[action*="add_product"]') || document.querySelector('form');
      if (form) {
        form.addEventListener('submit', function() {
          syncShapesToJson();
        });
      }
    });
  </script>
</body>
</html>`;

      return new Response(html, {
        headers: responseHeaders,
      });
    }

    // 9a-loyalty. POST /api/loyalty/request (Public customer card request)
    if (url.pathname === '/api/loyalty/request' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const firstName = (body.firstName || '').trim();
        const lastName = (body.lastName || '').trim();
        const customerName = (body.customerName || `${firstName} ${lastName}`).trim();
        const customerPhone = (body.customerPhone || '').trim();
        const customerAddress = (body.customerAddress || '').trim();
        const customerEmail = (body.customerEmail || '').trim();
        const customerProfession = (body.customerProfession || '').trim();
        const customerBirthDate = (body.customerBirthDate || '').trim();
        let hasPurchased = !!body.hasPurchased;
        let ordersCount = Number(body.ordersCount) || 0;
        let totalSpent = Number(body.totalSpent) || 0;
        const cardNumber = (body.cardNumber || '').trim();

        if (env.techno_products_kv && customerPhone) {
          // Check orders in KV
          const rawOrders = await env.techno_products_kv.get('orders');
          if (rawOrders) {
            try {
              const decryptedOrders = await decryptCustomerData(env, rawOrders);
              if (Array.isArray(decryptedOrders)) {
                const matched = decryptedOrders.filter((o: any) => o.customer?.phone?.trim() === customerPhone);
                if (matched.length > 0) {
                  hasPurchased = true;
                  ordersCount = matched.length;
                  totalSpent = matched.reduce((s: number, o: any) => s + (o.totals?.totalDzd || 0), 0);
                }
              }
            } catch {}
          }

          const rawReqs = await env.techno_products_kv.get('loyalty_requests');
          const reqs = rawReqs ? JSON.parse(rawReqs) : [];
          const existingIdx = reqs.findIndex((r: any) => r.customerPhone === customerPhone);
          const newReq = {
            firstName,
            lastName,
            customerName,
            customerPhone,
            customerAddress,
            customerEmail,
            customerProfession,
            customerBirthDate,
            hasPurchased,
            ordersCount,
            totalSpent,
            cardNumber: cardNumber || (existingIdx >= 0 && reqs[existingIdx].cardNumber ? reqs[existingIdx].cardNumber : ''),
            status: 'pending',
            requestedAt: new Date().toISOString(),
          };
          if (existingIdx >= 0) {
            reqs[existingIdx] = newReq;
          } else {
            reqs.unshift(newReq);
          }
          await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
        }

        return jsonResponse({ success: true, status: 'pending', hasPurchased, ordersCount, totalSpent });
      } catch (err: any) {
        return jsonResponse({ error: err?.message || 'Failed to process loyalty request' }, 500);
      }
    }

    // 9a-loyalty. GET /api/loyalty/status
    if (url.pathname === '/api/loyalty/status' && request.method === 'GET') {
      const phone = (url.searchParams.get('phone') || '').trim();
      const query = (url.searchParams.get('query') || url.searchParams.get('card_number') || '').trim();
      const statusHeaders = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...CORS_HEADERS,
      };
      if ((!phone && !query) || !env.techno_products_kv) {
        return new Response(JSON.stringify({ exists: false }), { headers: statusHeaders });
      }
      const rawReqs = await env.techno_products_kv.get('loyalty_requests');
      const reqs = rawReqs ? JSON.parse(rawReqs) : [];
      const item = reqs.find((r: any) => {
        if (phone && r.customerPhone === phone) return true;
        if (query) {
          if (r.customerPhone === query) return true;
          if (r.cardNumber === query) return true;
          if (r.cardNumber && r.cardNumber.replace(/[-\s]/g, '') === query.replace(/[-\s]/g, '')) return true;
        }
        return false;
      });
      if (!item) return new Response(JSON.stringify({ exists: false }), { headers: statusHeaders });
      return new Response(JSON.stringify({ exists: true, status: item.status, request: item }), { headers: statusHeaders });
    }

    // 9a-loyalty. POST /api/loyalty/pin-set (Customer finished setting 6-digit PIN)
    if (url.pathname === '/api/loyalty/pin-set' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const phone = (body.phone || '').trim();
        if (phone && env.techno_products_kv) {
          const rawReqs = await env.techno_products_kv.get('loyalty_requests');
          const reqs = rawReqs ? JSON.parse(rawReqs) : [];
          const idx = reqs.findIndex((r: any) => r.customerPhone === phone);
          if (idx >= 0) {
            reqs[idx].status = 'active';
            reqs[idx].hasPin = true;
            reqs[idx].activatedAt = new Date().toISOString();
            await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            return jsonResponse({ success: true, status: 'active' });
          }
        }
        return jsonResponse({ error: 'Card not found' }, 404);
      } catch (err: any) {
        return jsonResponse({ error: err?.message }, 500);
      }
    }

    // 9a-loyalty. POST /api/loyalty/disable (Disable customer card)
    if (url.pathname === '/api/loyalty/disable' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const phone = (body.phone || '').trim();
        if (phone && env.techno_products_kv) {
          const rawReqs = await env.techno_products_kv.get('loyalty_requests');
          const reqs = rawReqs ? JSON.parse(rawReqs) : [];
          const idx = reqs.findIndex((r: any) => r.customerPhone === phone);
          if (idx >= 0) {
            reqs[idx].status = 'disabled';
            reqs[idx].disabledAt = new Date().toISOString();
            await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            return jsonResponse({ success: true, status: 'disabled' });
          }
        }
        return jsonResponse({ error: 'Card not found' }, 404);
      } catch (err: any) {
        return jsonResponse({ error: err?.message }, 500);
      }
    }

    // 9a-loyalty. POST /api/loyalty/approve
    if (url.pathname === '/api/loyalty/approve' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const phone = (body.phone || '').trim();
        const manualCardNumber = (body.cardNumber || body.card_number || '').trim();
        if (phone && env.techno_products_kv) {
          const rawReqs = await env.techno_products_kv.get('loyalty_requests');
          const reqs = rawReqs ? JSON.parse(rawReqs) : [];
          const idx = reqs.findIndex((r: any) => r.customerPhone === phone);
          if (idx >= 0) {
            reqs[idx].status = 'approved_pending_pin';
            reqs[idx].approvedAt = new Date().toISOString();
            if (manualCardNumber) {
              reqs[idx].cardNumber = manualCardNumber;
            }
            await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            return jsonResponse({ success: true, status: 'approved_pending_pin', cardNumber: reqs[idx].cardNumber });
          }
        }
        return jsonResponse({ error: 'Request not found' }, 404);
      } catch (err: any) {
        return jsonResponse({ error: err?.message || 'Failed to approve' }, 500);
      }
    }

    // 9b. GET /api/track (Public customer order tracking with privacy masking & encryption)
    if (url.pathname === '/api/track' && request.method === 'GET') {
      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';

      // Anti-Scraping Rate Limit for tracking (Max 35 lookups per minute)
      if (env.techno_products_kv) {
        const trackKey = `rl:track:${clientIp}`;
        const rawCount = await env.techno_products_kv.get(trackKey);
        const count = rawCount ? parseInt(rawCount, 10) || 0 : 0;
        if (count >= 35) {
          return jsonResponse({ error: 'تجاوزت الحد المسموح به للاستعلام، يرجى المحاولة بعد دقيقة' }, 429);
        }
        await env.techno_products_kv.put(trackKey, (count + 1).toString(), { expirationTtl: 60 });
      }

      const orderId = (url.searchParams.get('orderId') || url.searchParams.get('id') || '').trim();
      if (!orderId) {
        return jsonResponse({ error: 'Order ID is required' }, 400);
      }

      const cleanOrderId = orderId.toUpperCase();
      const strippedOrderId = cleanOrderId.replace(/[^A-Z0-9]/g, '');

      let order: any = null;
      if (env.techno_products_kv) {
        let raw = await env.techno_products_kv.get(`order:${cleanOrderId}`);
        if (!raw && cleanOrderId !== orderId) {
          raw = await env.techno_products_kv.get(`order:${orderId}`);
        }
        if (raw) {
          try {
            order = await decryptCustomerData(env, raw);
          } catch {}
        }
        if (!order) {
          const rawList = await env.techno_products_kv.get('orders');
          if (rawList) {
            try {
              const list = await decryptCustomerData(env, rawList);
              if (Array.isArray(list)) {
                order = list.find((o: any) => {
                  const oClean = (o.orderId || '').toUpperCase();
                  return (
                    oClean === cleanOrderId ||
                    oClean.replace(/[^A-Z0-9]/g, '') === strippedOrderId
                  );
                });
              }
            } catch {}
          }
        }
      }

      if (!order) {
        return jsonResponse({ success: true, found: false });
      }

      const status = order.status || 'pending';
      const statusLabel =
        status === 'confirmed'
          ? 'تم تأكيد الطلب'
          : status === 'cancelled'
          ? 'تم إلغاء الطلب'
          : 'تم استلام الطلب وهو تحت المعالجة';

      // Privacy-masked public tracking response: NEVER expose raw phone or exact street address!
      return jsonResponse({
        success: true,
        found: true,
        order: {
          orderId: order.orderId,
          status,
          statusLabel,
          customerName: maskCustomerName(order.customer?.fullName || ''),
          deliveryMethod: order.customer?.deliveryMethod || 'home',
          wilaya: order.customer?.wilaya || '',
          commune: order.customer?.commune || '',
          totalDzd: order.totals?.totalDzd || 0,
          shippingFeeDzd: order.totals?.shippingFeeDzd || 0,
          createdAtIso: order.createdAtIso,
          items: Array.isArray(order.items)
            ? order.items.map((i: any) => ({
                name: i.name,
                quantity: i.quantity || 1,
                variantLabel: i.variantLabel || i.colorName || '',
                lineTotalDzd: i.lineTotalDzd || 0,
              }))
            : [],
        },
      });
    }

    // 9c. POST /api/clear-all (Protected: Requires Authenticated Admin Session or Secret Authorization)
    if (url.pathname === '/api/clear-all') {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed. Use POST with authorization.' }, 405);
      }

      const cookieHeader = request.headers.get('Cookie') || '';
      const isAuthSession = await verifyAdminSession(env, cookieHeader);
      const authHeader = request.headers.get('Authorization') || '';
      const isBearerAuth =
        authHeader.startsWith('Bearer ') &&
        authHeader.slice(7).trim() === (env.ADMIN_CHAT_ID || DEFAULT_ADMIN_CHAT_ID);

      if (!isAuthSession && !isBearerAuth) {
        return jsonResponse({ error: 'غير مصرح: تتطلب هذه العملية تسجيل الدخول كمسؤول.' }, 401);
      }

      await saveProducts(env, []);
      await saveCategories(env, []);
      if (env.techno_products_kv) {
        const rawList = await env.techno_products_kv.get('orders');
        if (rawList) {
          try {
            const list = await decryptCustomerData(env, rawList);
            if (Array.isArray(list)) {
              for (const o of list) {
                if (o.orderId) {
                  await env.techno_products_kv.delete(`order:${o.orderId}`);
                }
              }
            }
          } catch {}
        }
        await env.techno_products_kv.put('orders', await encryptCustomerData(env, []));
      }
      return jsonResponse({
        success: true,
        message: 'All products, categories, and orders have been wiped. Store is 100% clean.',
        productsCount: 0,
        categoriesCount: 0,
      });
    }

    // 10. GET /api/orders (List recent orders - Protected with Admin Session or Verified PIN)
    if (url.pathname === '/api/orders' && request.method === 'GET') {
      const cookieHeader = request.headers.get('Cookie') || '';
      const isSessionAuth = await verifyAdminSession(env, cookieHeader);
      const pinParam = url.searchParams.get('pin');
      let isPinAuth = false;
      if (pinParam) {
        isPinAuth = await verifyAdminPin(env, pinParam);
      }
      const isAuthorized = isSessionAuth || isPinAuth;

      let orders: any[] = [];
      if (env.techno_products_kv) {
        const raw = await env.techno_products_kv.get('orders');
        if (raw) {
          try {
            orders = await decryptCustomerData(env, raw);
            if (!Array.isArray(orders)) orders = [];
          } catch {}
        }
      }

      // Hide customer phone number and exact address unless authenticated
      const safeOrders = orders.map((o) => {
        if (isAuthorized) return o;
        return {
          ...o,
          customer: {
            ...o.customer,
            phone: maskPhoneNumber(o.customer?.phone || ''),
            address: o.customer?.address ? 'محمي برمز الأمان' : '',
          },
        };
      });

      return jsonResponse({
        success: true,
        authenticated: isAuthorized,
        count: safeOrders.length,
        orders: safeOrders,
      });
    }

    // 11. POST /api/orders (Receive order from frontend, Anti-Bot & Anti-Spam Verification, Encrypt & Notify)
    if (url.pathname === '/api/orders' && request.method === 'POST') {
      try {
        const order = (await request.json()) as any;
        if (!order || !order.orderId || !order.customer) {
          return jsonResponse({ error: 'بيانات الطلب غير مكتملة' }, 400);
        }

        // 1. Anti-Bot Honeypot Trap
        if (order.b_company_field || order._hp || order.website_url) {
          return jsonResponse({ error: 'تم رفض الطلب لاشتباه نشاط آلي' }, 400);
        }

        // 2. Anti-Bot Timing Verification (humans require at least 2.5 seconds to fill order details)
        const duration =
          typeof order.formDurationMs === 'number'
            ? order.formDurationMs
            : typeof order._formLoadedAt === 'number'
            ? Date.now() - order._formLoadedAt
            : null;

        if (duration !== null && duration < 2500) {
          return jsonResponse(
            { error: 'تم رفض الطلب لاشتباه نشاط آلي غير بشري (سرعة إدخال غير طبيعية).' },
            400,
          );
        }

        // 3. Customer Name Validation & Sanitization
        const rawName = order.customer?.fullName || '';
        if (hasSpamUrlsOrScripts(rawName)) {
          return jsonResponse({ error: 'الاسم يحتوي على رموز أو روابط غير صالحة.' }, 400);
        }
        const sanitizedName = sanitizeString(rawName, 70);
        if (sanitizedName.length < 3) {
          return jsonResponse({ error: 'يرجى إدخال اسم حقيقي لا يقل عن 3 أحرف.' }, 400);
        }

        // 4. Strict Algerian Phone Number & Anti-Dummy Validation
        const cleanPhone = cleanAlgerianPhone(order.customer?.phone || '');
        if (isFakeOrSpamPhone(cleanPhone)) {
          return jsonResponse(
            { error: 'يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 مكون من 10 أرقام.' },
            400,
          );
        }

        // 5. Rate Limiting & Cooldown per IP and per Phone Number
        const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
        const rateCheck = await checkOrderRateLimits(env, clientIp, cleanPhone);
        if (!rateCheck.allowed) {
          return jsonResponse({ error: rateCheck.reason }, 429);
        }

        // 6. Cart Items Validation
        if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 20) {
          return jsonResponse({ error: 'قائمة المنتجات المطلوبة غير صالحة.' }, 400);
        }

        // Sanitize customer details
        order.customer.fullName = sanitizedName;
        order.customer.phone = cleanPhone;
        order.customer.address = sanitizeString(order.customer.address || '', 200);
        order.customer.commune = sanitizeString(order.customer.commune || '', 100);
        order.customer.notes = sanitizeString(order.customer.notes || '', 250);

        // Attach cryptographic view token & default status
        if (!order.viewToken) {
          order.viewToken = generateSecureToken();
        }
        if (!order.status) {
          order.status = 'pending';
        }

        // Encrypt & Store in KV (AES-256-GCM)
        if (env.techno_products_kv) {
          const encryptedOrder = await encryptCustomerData(env, order);
          await env.techno_products_kv.put(`order:${order.orderId}`, encryptedOrder);

          let ordersList: any[] = [];
          const raw = await env.techno_products_kv.get('orders');
          if (raw) {
            try {
              ordersList = await decryptCustomerData(env, raw);
              if (!Array.isArray(ordersList)) ordersList = [];
            } catch {}
          }
          ordersList = [order, ...ordersList.filter((o: any) => o.orderId !== order.orderId)].slice(0, 100);
          const encryptedList = await encryptCustomerData(env, ordersList);
          await env.techno_products_kv.put('orders', encryptedList);

          // Record rate limit success
          await recordSuccessfulOrderRate(env, clientIp, cleanPhone);
        }

        // Dispatch notifications in background so checkout response is fast (<100ms)
        ctx.waitUntil(
          Promise.allSettled([
            sendOrderAlertToTelegram(env, order, url.origin),
            sendOrderAlertToNtfy(order),
          ]).catch((err) => {
            console.error('Background order notifications error:', err);
          }),
        );

        return jsonResponse({
          success: true,
          orderId: order.orderId,
          viewToken: order.viewToken,
        });
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'Error processing order' }, 500);
      }
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  },
};

// Helper: Finalize a shape during interactive wizard and ask if user wants to add another shape
async function finalizeShapeAndPromptNext(
  env: Env,
  botToken: string,
  chatId: any,
  session: BotSessionState,
  editMessageId?: number,
): Promise<void> {
  const cur = session.draft.currentShape || {};
  const variants = session.draft.variants || [];
  const shapeIndex = variants.length + 1;
  const shapeName = (cur.name || `شكل ${shapeIndex}`).trim();
  const shapeImage = cur.image;
  const shapeDesc = (cur.description || '').trim();

  // If subSizes exist (e.g. صغير: 1800, متوسط: 2500, كبير: 3400)
  if (Array.isArray(cur.subSizes) && cur.subSizes.length > 0) {
    for (let sIdx = 0; sIdx < cur.subSizes.length; sIdx++) {
      const sub = cur.subSizes[sIdx];
      const vId = `var-${Date.now()}-${variants.length + 1}`;
      const vName = `${shapeName} (${sub.label})`;
      variants.push({
        id: vId,
        name: vName,
        label: sub.label,
        priceDzd: sub.priceDzd,
        sku: sub.sku || cur.sku,
        image: shapeImage,
        description: (sub.description || shapeDesc).trim(),
        dimensions: (sub.dimensions || sub.label).trim(),
      });
    }
  } else {
    // Single variant for this shape
    const shapePrice = cur.priceDzd || session.draft.priceDzd || 1000;
    const vId = `var-${Date.now()}-${variants.length + 1}`;
    variants.push({
      id: vId,
      name: shapeName,
      label: shapeName,
      priceDzd: shapePrice,
      sku: cur.sku,
      image: shapeImage,
      description: shapeDesc,
      dimensions: (cur.dimensions || '').trim(),
    });
  }

  session.draft.variants = variants;
  if (shapeImage && (!session.draft.images || !session.draft.images.includes(shapeImage))) {
    session.draft.images = [...(session.draft.images || []), shapeImage];
  }
  session.draft.currentShape = undefined;

  await setSession(env, chatId, {
    step: 'shape_ask_more',
    draft: session.draft,
    updatedAt: Date.now(),
  });

  // Build nice summary message
  let summaryDetails = '';
  if (cur.sku) {
    summaryDetails += `🔢 <b>رقم/كود هذا الشكل:</b> <code>#${escapeHtml(cur.sku)}</code>\n`;
  }
  if (cur.subSizes && cur.subSizes.length > 0) {
    summaryDetails =
      `📏 <b>القياسات والأسعار المعتمدة لهذا الشكل (${cur.subSizes.length}):</b>\n` +
      cur.subSizes.map((s) => `  • ${escapeHtml(s.label)} — <b>${s.priceDzd.toLocaleString()} د.ج</b>`).join('\n') +
      '\n';
  } else {
    const singleV = variants[variants.length - 1];
    summaryDetails =
      `💰 <b>السعر:</b> ${singleV.priceDzd.toLocaleString()} د.ج\n` +
      (singleV.dimensions ? `📏 <b>القياسات:</b> ${escapeHtml(singleV.dimensions)}\n` : '');
  }

  const msgText =
    `🎉 <b>تم حفظ هذا الشكل بنجاح!</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏷️ <b>الشكل:</b> ${escapeHtml(shapeName)}\n` +
    summaryDetails +
    (shapeDesc ? `📝 <b>الوصف:</b> ${escapeHtml(shapeDesc)}\n` : '') +
    `📸 <b>الصورة:</b> ${shapeImage ? 'تم إرفاقها ومزامنتها بنجاح لجميع القياسات' : 'افتراضية'}\n\n` +
    `📦 <b>إجمالي الخيارات المسجلة لهذا المنتج:</b> ${variants.length} خيارات\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `ماذا تريد أن تفعل الآن؟`;

  const keyboard = [
    [{ text: '➕ إضافة شكل آخر لهذا المنتج', callback_data: 'wiz:shape_add_another' }],
    [{ text: '✅ إنهاء ونشر المنتج الآن في المتجر', callback_data: 'wiz:shape_finish_publish' }],
    [{ text: '❌ إلغاء العملية', callback_data: 'wiz:cancel' }],
  ];

  if (editMessageId) {
    await sendOrEditMessage(botToken, chatId, editMessageId, msgText, keyboard);
  } else {
    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text: msgText,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }
}

// Helper: Finalize & publish a product from the interactive wizard draft
async function publishWizardDraft(
  env: Env,
  botToken: string,
  chatId: any,
  draft: WizardDraft,
): Promise<void> {
  const products = await getProducts(env);
  const newId = await getNextNumericId(env, products, draft.productNumber);
  const newSku = newId;
  const images =
    Array.isArray(draft.images) && draft.images.length > 0
      ? draft.images
      : ['/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg'];
  const variants = Array.isArray(draft.variants) ? draft.variants : [];
  const basePrice =
    variants.length > 0
      ? Math.min(...variants.map((v) => v.priceDzd))
      : draft.priceDzd && draft.priceDzd > 0
      ? draft.priceDzd
      : 1000;

  const categoryName = draft.categoryName || 'معروضات عامة';
  const catObj = await ensureCategory(env, categoryName);

  const linkedVariants = variants.map((v, i) => ({
    ...v,
    name: v.name || v.label,
    image: v.image || images[i] || images[0],
  }));

  const mainDesc =
    draft.description ||
    (linkedVariants.length > 0 && linkedVariants[0].description
      ? linkedVariants[0].description
      : 'منتج أصلي معتمد متوفر في فرع تكنو الأغواط.');

  const newProduct: Product = {
    id: newId,
    sku: newSku,
    name: draft.name || 'منتج جديد من تكنو الأغواط',
    shortName: draft.name || 'منتج جديد',
    brand: 'TECHNO STATIONERY',
    series: catObj.id,
    seriesLabel: catObj.name,
    categoryId: catObj.id,
    categoryName: catObj.name,
    colorFamily: 'black',
    colorName: 'قياسي',
    colorHex: '#1F2024',
    priceDzd: basePrice,
    image: images[0],
    images,
    ...(draft.dimensions ? { dimensions: draft.dimensions } : {}),
    ...(linkedVariants.length > 0 ? { variants: linkedVariants } : {}),
    alt: `${draft.name || 'منتج'} — رقم المنتج ${newSku}`,
    summary: mainDesc,
    description: mainDesc,
    availabilityText: 'متوفر في فرع الأغواط',
    featuredRank: 1,
    siblingIds: [],
    specs: [
      { label: 'رقم المنتج', value: newSku },
      { label: 'القسم', value: catObj.name },
      ...(draft.dimensions ? [{ label: 'القياسات والأبعاد', value: draft.dimensions }] : []),
      ...(linkedVariants.length > 0
        ? [
            {
              label: 'الأشكال المتوفرة',
              value: linkedVariants.map((v) => `${v.name || v.label} (${v.priceDzd.toLocaleString()} د.ج)`).join(' · '),
            },
          ]
        : []),
      ...(linkedVariants.some((v) => v.dimensions)
        ? [
            {
              label: 'القياسات المتوفرة',
              value: linkedVariants
                .map((v) => v.dimensions)
                .filter(Boolean)
                .join(' · '),
            },
          ]
        : []),
      { label: 'عدد الصور', value: `${images.length} صور` },
    ],
    highlights: [
      'منتج أصلي معتمد متوفر في فرع تكنو الأغواط',
      'توصيل سريع للأغواط و54 ولاية عبر ZR Express والدفع عند الاستلام',
    ],
  };

  const updated = [newProduct, ...products];
  await saveProducts(env, updated);
  await clearSession(env, chatId);

  const siteUrl = await getSiteUrl(env);
  const productUrl = buildCleanProductUrl(siteUrl, newProduct.id);

  const variantsSummary =
    variants.length > 0
      ? `\n🎨 <b>الأشكال والموديلات (${variants.length}):</b>\n` +
        variants
          .map(
            (v) =>
              `   • ${escapeHtml(v.label)}${v.sku ? ` [رقم #${escapeHtml(v.sku)}]` : ''}: <b>${v.priceDzd.toLocaleString()} د.ج</b>${v.dimensions ? ` (📏 ${escapeHtml(v.dimensions)})` : ''}`,
          )
          .join('\n')
      : `\n💰 <b>السعر:</b> ${newProduct.priceDzd.toLocaleString()} د.ج`;

  const keyboard: any[][] = [
    [
      {
        text: '📋 نسخ رابط صفحة المنتج بنقرة زر',
        copy_text: { text: productUrl },
      },
    ],
  ];

  if (
    productUrl.startsWith('https://') ||
    (!productUrl.includes('localhost') && !productUrl.includes('127.0.0.1'))
  ) {
    keyboard.push([{ text: '🌐 فتح صفحة المنتج بالموقع', url: productUrl }]);
  }

  keyboard.push([
    { text: '📸 إضافة صور أخرى للمنتج', callback_data: `addphotos:${newProduct.id}` },
    { text: '➕ إضافة منتج آخر', callback_data: 'menu:add_wizard' },
  ]);
  keyboard.push([
    { text: `📋 قائمة المنتجات (${updated.length})`, callback_data: 'menu:list' },
    { text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' },
  ]);

  await callTelegram(botToken, 'sendMessage', {
    chat_id: chatId,
    text:
      `🎉 <b>تم نشر المنتج بنجاح في متجر تكنو الأغواط!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>الاسم:</b> ${escapeHtml(newProduct.name)}\n` +
      `📂 <b>القسم:</b> ${escapeHtml(catObj.name)}\n` +
      `🔢 <b>رقم المنتج:</b> <code>${newProduct.id}</code>\n` +
      `📸 <b>عدد الصور:</b> ${images.length} صور` +
      `${variantsSummary}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 <b>رابط صفحة المنتج (ينتهي برقم المنتج):</b>\n` +
      `<code>${productUrl}</code>`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard },
  });

  await sendProductAddedNtfy(newProduct, productUrl);
}

// Helper: Prompt Step 1 (Pick Category) for new product wizard
async function promptWizardCategory(
  botToken: string,
  chatId: any,
  env: Env,
  editMessageId?: number,
): Promise<void> {
  const categories = await getCategories(env);
  await setSession(env, chatId, {
    step: 'prod_pick_category',
    draft: { images: [], variants: [] },
    updatedAt: Date.now(),
  });

  const text =
    `➕ <b>إضافة منتج جديد — الخطوة 1 من 6</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📂 <b>اختر القسم الذي تريد وضع المنتج فيه:</b>\n` +
    (categories.length === 0
      ? '\n<i>لا توجد أقسام بعد، يمكنك إنشاء قسم جديد الآن من الزر أدناه.</i>'
      : '\n<i>اضغط على اسم القسم أو أنشئ قسماً جديداً:</i>');

  const keyboard: any[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row: any[] = [
      { text: `📂 ${categories[i].name}`, callback_data: `wiz:cat:${categories[i].id}` },
    ];
    if (categories[i + 1]) {
      row.push({
        text: `📂 ${categories[i + 1].name}`,
        callback_data: `wiz:cat:${categories[i + 1].id}`,
      });
    }
    keyboard.push(row);
  }

  keyboard.push([
    { text: '➕ إنشاء قسم جديد الآن', callback_data: 'wiz:cat_new' },
    { text: '📦 عام (بدون قسم محدد)', callback_data: 'wiz:cat:general' },
  ]);
  keyboard.push([{ text: '❌ إلغاء والعودة للوحة التحكم', callback_data: 'wiz:cancel' }]);

  await sendOrEditMessage(botToken, chatId, editMessageId, text, keyboard);
}

// Helper: Prompt Step 6 (How many photos to add?)
async function promptWizardPhotoCount(
  botToken: string,
  chatId: any,
  env: Env,
  draft: WizardDraft,
  editMessageId?: number,
): Promise<void> {
  await setSession(env, chatId, {
    step: 'prod_photo_count',
    draft,
    updatedAt: Date.now(),
  });

  const variantsCount = draft.variants?.length || 0;
  const text =
    `📸 <b>الخطوة 6 من 6 — صور أشكال المنتج</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    (variantsCount > 0
      ? `✨ <b>لديك ${variantsCount} أشكال/قياسات مسجلة لهذا المنتج!</b>\n` +
        `اختر <b>${variantsCount} صور</b> (أو أكثر) بحيث تُربط كل صورة بشكلها بالترتيب تلقائياً، وتظهر للزبون صورة كل شكل بشكل مستقل عند النقر عليه في الموقع.\n\n`
      : '') +
    `<b>كم عدد الصور التي تريد إضافتها لهذا المنتج؟</b>\n\n` +
    `اختر العدد من الأزرار أدناه أو أرسل أي رقم من 1 إلى 10:`;

  const keyboard = [
    [
      { text: '1️⃣ صورة واحدة', callback_data: 'wiz:photos:1' },
      { text: '2️⃣ صورتان', callback_data: 'wiz:photos:2' },
      { text: '3️⃣ 3 صور', callback_data: 'wiz:photos:3' },
    ],
    [
      { text: '4️⃣ 4 صور', callback_data: 'wiz:photos:4' },
      { text: '5️⃣ 5 صور', callback_data: 'wiz:photos:5' },
      { text: '6️⃣ 6 صور', callback_data: 'wiz:photos:6' },
    ],
    [{ text: '❌ إلغاء العملية', callback_data: 'wiz:cancel' }],
  ];

  await sendOrEditMessage(botToken, chatId, editMessageId, text, keyboard);
}

// Main Telegram Update Handler
async function handleTelegramUpdate(
  update: any,
  env: Env,
  botToken: string,
  origin: string,
  ctx?: ExecutionContext,
): Promise<void> {
  // A. Callback Queries (Inline button clicks)
  if (update.callback_query) {
    const cq = update.callback_query;
    const data = cq.data as string;
    const chatId = cq.message?.chat?.id;
    const messageId = cq.message?.message_id;

    // Immediately acknowledge callback query so the loading spinner on the button vanishes instantly!
    callTelegram(botToken, 'answerCallbackQuery', {
      callback_query_id: cq.id,
      text: data.startsWith('cat:del_do:') ? 'تم حذف القسم بنجاح!' : undefined,
    }).catch(() => {});

    if (data === 'menu:home' || data === 'wiz:cancel') {
      await clearSession(env, chatId);
      await sendDashboardMenu(botToken, chatId, env, messageId);
    } else if (data === 'menu:categories') {
      await clearSession(env, chatId);
      await sendCategoriesMenu(botToken, chatId, env, messageId);
    } else if (data === 'cat:add_prompt') {
      await setSession(env, chatId, {
        step: 'cat_create_name',
        draft: {},
        updatedAt: Date.now(),
      });
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        `📂 <b>إضافة قسم جديد للمتجر</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `أرسل الآن <b>اسم القسم</b> الذي تريد إنشاءه (مثال: <code>ساعات</code> أو <code>أقلام فاخرة</code> أو <code>حقائب مهنية</code>):`,
        [[{ text: '❌ إلغاء', callback_data: 'menu:categories' }]],
      );
    } else if (data === 'cat:delete_menu') {
      const categories = await getCategories(env);
      const keyboard = categories.map((c) => [
        { text: `🗑️ حذف قسم: ${c.name}`, callback_data: `cat:del_do:${c.id}` },
      ]);
      keyboard.push([{ text: '« 🔙 العودة للأقسام', callback_data: 'menu:categories' }]);
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        '🗑️ <b>اختر القسم الذي تريد حذفه:</b>',
        keyboard,
      );
    } else if (data.startsWith('cat:del_do:')) {
      const catId = data.replace('cat:del_do:', '');
      const categories = await getCategories(env);
      const remaining = categories.filter((c) => c.id !== catId);
      await saveCategories(env, remaining);
      await callTelegram(botToken, 'answerCallbackQuery', {
        callback_query_id: cq.id,
        text: 'تم حذف القسم بنجاح!',
      });
      await sendCategoriesMenu(botToken, chatId, env, messageId);
      return;
    } else if (data === 'menu:add_wizard') {
      await promptWizardCategory(botToken, chatId, env, messageId);
    } else if (data === 'wiz:cat_new') {
      await setSession(env, chatId, {
        step: 'prod_create_category',
        draft: { images: [], variants: [] },
        updatedAt: Date.now(),
      });
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        `📂 <b>إنشاء قسم جديد لهذا المنتج</b>\n` +
          `أرسل الآن اسم القسم الجديد (مثل: <code>ساعات</code> أو <code>أدوات مكتبية</code>):`,
        [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
      );
    } else if (data.startsWith('wiz:cat:')) {
      const catId = data.replace('wiz:cat:', '');
      const categories = await getCategories(env);
      const picked = categories.find((c) => c.id === catId);
      const draft: WizardDraft = {
        categoryId: picked?.id || 'general',
        categoryName: picked?.name || 'معروضات عامة',
        images: [],
        variants: [],
      };
      await setSession(env, chatId, {
        step: 'prod_name',
        draft,
        updatedAt: Date.now(),
      });
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        `✅ القسم المختار: <b>${escapeHtml(draft.categoryName || '')}</b>\n\n` +
          `📝 <b>الخطوة 2 من 6 — اسم المنتج</b>\n` +
          `أرسل الآن <b>اسم المنتج</b> (مثال: <code>ساعة حائط كلاسيكية</code>):`,
        [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
      );
    } else if (data === 'wiz:price_single') {
      const session = await getSession(env, chatId);
      if (session) {
        await setSession(env, chatId, {
          step: 'prod_number',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `🔢 <b>الخطوة 3 — رقم المنتج</b>\n` +
            `أدخل <b>رقم المنتج</b> الذي ستنتهي به صفحته (مثال: <code>71645</code> أو <code>105</code>)\n` +
            `أو اضغط على زر التوليد التلقائي:`,
          [
            [{ text: '🎲 توليد رقم تلقائي', callback_data: 'wiz:num_auto' }],
            [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
          ],
        );
      }
    } else if (data === 'wiz:num_auto') {
      const session = await getSession(env, chatId);
      if (session) {
        const products = await getProducts(env);
        const autoNum = await getNextNumericId(env, products);
        session.draft.productNumber = autoNum;
        await setSession(env, chatId, {
          step: 'prod_single_price',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `✅ تم تعيين رقم المنتج تلقائياً: <code>${autoNum}</code> (ستنتهي الصفحة بـ <code>/p/${autoNum}</code>)\n\n` +
            `💰 <b>الخطوة 4 — سعر المنتج</b>\n` +
            `أدخل الآن <b>سعر المنتج بالدينار الجزائري</b> (أرقام فقط، مثال: <code>2500</code>):`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
      }
    } else if (data === 'wiz:price_variants') {
      const session = await getSession(env, chatId);
      if (session) {
        session.draft.variants = [];
        session.draft.images = [];
        session.draft.currentShape = {};
        await setSession(env, chatId, {
          step: 'shape_photo',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `🎨 <b>إضافة أشكال وموديلات المنتج — الشكل (1)</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📸 <b>الخطوة 1:</b> أرسل الآن <b>صورة</b> هذا الشكل أو الموديل:\n\n` +
            `<i>(سيرشدك البوت خطوة بخطوة: صورة ➔ اسمها ➔ سعرها ➔ الوصف ➔ القياسات)</i>`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
      }
    } else if (data === 'wiz:shape_p_single') {
      const session = await getSession(env, chatId);
      if (session) {
        await setSession(env, chatId, {
          step: 'shape_price',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const shapeIdx = (session.draft.variants?.length || 0) + 1;
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `💰 <b>أدخل سعر هذا الشكل بالدينار الجزائري</b> (أرقام فقط، مثال: <code>2500</code>):`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
      }
    } else if (data === 'wiz:shape_p_sizes') {
      const session = await getSession(env, chatId);
      if (session) {
        await setSession(env, chatId, {
          step: 'shape_multi_sizes',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `📏 <b>إضافة قياسات هذا الشكل وأسعارها</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `أرسل كل قياس وسعره في سطر (يمكنك إرسالها كلها في رسالة واحدة أو قياساً تلو الآخر):\n\n` +
            `<i>مثال:</i>\n` +
            `<code>صغير : 1800\nمتوسط : 2500\nكبير : 3400</code>\n` +
            `<i>أو:</i>\n` +
            `<code>A5 : 450\nA4 : 750\nA3 : 1300</code>`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
      }
    } else if (data === 'wiz:shape_skip_desc') {
      const session = await getSession(env, chatId);
      if (session && session.step === 'shape_desc') {
        if (!session.draft.currentShape) session.draft.currentShape = {};
        session.draft.currentShape.description = '';
        await setSession(env, chatId, {
          step: 'shape_dims',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const shapeIdx = (session.draft.variants?.length || 0) + 1;
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `📏 <b>الخطوة 5 للشكل (${shapeIdx}) — القياسات أو الأبعاد:</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `أرسل أبعاد هذا الشكل (مثال: <code>40x60 سم</code> أو <code>سعة 500 مل</code>)\n` +
            `أو أرسل قياسات بأسعارها (مثال: <code>صغير : 1800\nمتوسط : 2500\nكبير : 3400</code>)\n` +
            `أو اضغط «تخطي القياسات»:`,
          [
            [{ text: '⏭️ تخطي القياسات', callback_data: 'wiz:shape_skip_dims' }],
            [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
          ],
        );
      }
    } else if (data === 'wiz:shape_skip_dims') {
      const session = await getSession(env, chatId);
      if (session && session.step === 'shape_dims') {
        if (!session.draft.currentShape) session.draft.currentShape = {};
        session.draft.currentShape.dimensions = '';
        await finalizeShapeAndPromptNext(env, botToken, chatId, session, messageId);
      }
    } else if (data === 'wiz:shape_add_another') {
      const session = await getSession(env, chatId);
      if (session) {
        session.draft.currentShape = {};
        await setSession(env, chatId, {
          step: 'shape_photo',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const nextIdx = (session.draft.variants?.length || 0) + 1;
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `📸 <b>الخطوة 1 للشكل (${nextIdx}):</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `أرسل الآن <b>صورة</b> هذا الشكل الجديد:`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
      }
    } else if (data === 'wiz:shape_finish_publish') {
      const session = await getSession(env, chatId);
      if (session && session.draft.variants && session.draft.variants.length > 0) {
        await publishWizardDraft(env, botToken, chatId, session.draft);
      }
    } else if (data === 'wiz:variants_done') {
      const session = await getSession(env, chatId);
      if (session && session.draft.variants && session.draft.variants.length > 0) {
        await setSession(env, chatId, {
          step: 'prod_description',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `✅ تم حفظ <b>${session.draft.variants.length} قياسات</b> بنجاح!\n\n` +
            `✍️ <b>الخطوة 5 من 6 — وصف المنتج (اختياري)</b>\n` +
            `أرسل وصفاً مختصراً للمنتج أو اضغط «تخطي»:`,
          [
            [{ text: '⏭️ تخطي الوصف', callback_data: 'wiz:skip_desc' }],
            [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
          ],
        );
      }
    } else if (data === 'wiz:skip_dims') {
      const session = await getSession(env, chatId);
      if (session) {
        session.draft.dimensions = undefined;
        await setSession(env, chatId, {
          step: 'prod_description',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `✍️ <b>الخطوة 6 من 7 — وصف المنتج (اختياري)</b>\n` +
            `أرسل وصفاً قصيراً للمنتج أو اضغط «تخطي الوصف»:`,
          [
            [{ text: '⏭️ تخطي الوصف', callback_data: 'wiz:skip_desc' }],
            [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
          ],
        );
      }
    } else if (data === 'wiz:skip_desc') {
      const session = await getSession(env, chatId);
      if (session) {
        session.draft.description = 'منتج أصلي معتمد متوفر في فرع تكنو الأغواط.';
        await promptWizardPhotoCount(botToken, chatId, env, session.draft, messageId);
      }
    } else if (data.startsWith('wiz:photos:')) {
      const count = Math.min(10, Math.max(1, parseInt(data.replace('wiz:photos:', ''), 10) || 1));
      const session = await getSession(env, chatId);
      if (session) {
        session.draft.targetPhotoCount = count;
        session.draft.images = [];
        await setSession(env, chatId, {
          step: 'prod_photos',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const firstVar = session.draft.variants && session.draft.variants.length > 0 ? session.draft.variants[0] : null;
        const firstVarName = firstVar?.name || firstVar?.label;
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `📸 <b>ممتاز! سيتم إضافة ${count} ${count === 1 ? 'صورة' : 'صور'} لهذا المنتج</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `أرسل الآن <b>الصورة 1 من ${count}</b>` +
            (firstVarName ? ` (المخصصة لشكل: <b>${escapeHtml(firstVarName)}</b>)` : '') +
            ` (يمكنك إرسالها واحدة تلو الأخرى أو معاً):`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
      }
    } else if (data === 'wiz:publish_now') {
      const session = await getSession(env, chatId);
      if (session && session.step === 'prod_photos') {
        await publishWizardDraft(env, botToken, chatId, session.draft);
      }
    } else if (data.startsWith('addphotos:')) {
      const prodId = data.replace('addphotos:', '');
      const products = await getProducts(env);
      const target = products.find((p) => p.id === prodId);
      if (!target) {
        await callTelegram(botToken, 'answerCallbackQuery', {
          callback_query_id: cq.id,
          text: 'المنتج غير موجود!',
        });
        return;
      }
      await setSession(env, chatId, {
        step: 'existing_add_photos',
        draft: { targetProductId: target.id },
        updatedAt: Date.now(),
      });
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        `📸 <b>إضافة صور إضافية للمنتج:</b> ${escapeHtml(target.name)} (رقم: <code>${target.id}</code>)\n\n` +
          `أرسل الصور الإضافية الآن واحدة تلو الأخرى، وعند الانتهاء اضغط «✅ إنهاء وحفظ الصور»:`,
        [[{ text: '✅ إنهاء والعودة للقائمة', callback_data: 'menu:list' }]],
      );
    } else if (data === 'menu:list') {
      const products = await getProducts(env);
      const siteUrl = await getSiteUrl(env);
      await sendProductsList(botToken, chatId, products, siteUrl, messageId);
    } else if (data === 'menu:add') {
      const text =
        '⚡ <b>دليل الإضافة السريعة (بدون معالج):</b>\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        'يمكنك دائماً استخدام الزر <b>«➕ إضافة منتج جديد (تفاعلي)»</b> لاختيار القسم وعدد الصور والقياسات خطوة بخطوة.\n\n' +
        'أو أرسل صورة مباشرة مع شرح مثل:\n' +
        '<code>اسم: ساعة حائط كلاسيكية\n' +
        'رقم: 71640\n' +
        'قسم: ساعات\n' +
        'قياسات: صغير=2400, متوسط=3200, كبير=4100\n' +
        'وصف: تصميم صامت وأنيق للمكاتب</code>\n\n' +
        '🔗 كل منتج يحصل تلقائياً على رابط ينتهي برقمه:\n' +
        '<code>/p/71640</code>';
      const keyboard = [
        [{ text: '➕ بدء الإضافة التفاعلية الآن', callback_data: 'menu:add_wizard' }],
        [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
      ];
      await sendOrEditMessage(botToken, chatId, messageId, text, keyboard);
    } else if (data === 'menu:delete') {
      const products = await getProducts(env);
      await sendDeleteMenu(botToken, chatId, products, messageId);
    } else if (data === 'menu:stats') {
      const products = await getProducts(env);
      const categories = await getCategories(env);
      const siteUrl = await getSiteUrl(env);
      const adminPin = await getAdminPin(env);
      const count = products.length;
      const prices = products.map((p) => p.priceDzd);
      const minPrice = count > 0 ? Math.min(...prices) : 0;
      const maxPrice = count > 0 ? Math.max(...prices) : 0;
      const avgPrice = count > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / count) : 0;

      const text =
        `📊 <b>إحصائيات متجر تكنو الأغواط:</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 <b>إجمالي المعروضات الحالية:</b> <code>${count}</code> منتج\n` +
        `📂 <b>عدد الأقسام:</b> <code>${categories.length}</code> قسم\n` +
        `💰 <b>أقل سعر معروض:</b> ${minPrice.toLocaleString()} د.ج\n` +
        `💎 <b>أعلى سعر معروض:</b> ${maxPrice.toLocaleString()} د.ج\n` +
        `📈 <b>متوسط الأسعار:</b> ${avgPrice.toLocaleString()} د.ج\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🌐 <b>رابط المتجر الحالي:</b> <code>${siteUrl}</code>\n` +
        `🔐 <b>حماية لوحة الإدارة:</b> 🟢 مشفر ومحمي بـ PBKDF2 و Salt\n` +
        `🛡️ <b>تشفير بيانات الزبائن:</b> 🟢 مشفرة بـ AES-256-GCM\n` +
        `🤖 <b>بوت المعروضات:</b> <code>@items03bot</code>\n` +
        `🔔 <b>بوت استلام الطلبات:</b> <code>@techno03bot</code>\n` +
        `📲 <b>قناة إشعارات NTFY:</b> <code>${NTFY_TOPIC}</code>`;

      const keyboard = [
        [
          { text: `📋 قائمة المنتجات (${count})`, callback_data: 'menu:list' },
          { text: '➕ إضافة منتج جديد', callback_data: 'menu:add_wizard' },
        ],
        [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
      ];
      await sendOrEditMessage(botToken, chatId, messageId, text, keyboard);
    } else if (data === 'menu:add_pack_wizard') {
      await setSession(env, chatId, {
        step: 'pack_name' as any,
        draft: {},
        packDraft: {},
        updatedAt: Date.now(),
      });
      const text =
        `🎁 <b>معالج إضافة باقة أو عرض خاص (Pack) جديد:</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `الباقة هي مجموعة متكاملة من المنتجات موجهة لفئة معينة (مثال: <i>باك المهندس المعماري</i>، <i>باك البكالوريا</i>، <i>باك المكاتب</i>).\n\n` +
        `👉 <b>الخطوة 1 من 4 — اسم الباقة:</b>\n` +
        `أرسل الآن <b>اسم الباقة</b> (مثال: <code>باك المهندس المعماري الشامل</code>):`;
      const keyboard = [
        [{ text: '« ❌ إلغاء والعودة', callback_data: 'menu:home' }],
      ];
      await sendOrEditMessage(botToken, chatId, messageId, text, keyboard);
    } else if (data === 'menu:packs_list') {
      const packs = await getPacks(env);
      let text =
        `🎁 <b>قائمة الباقات الحصرية في المتجر (${packs.length}):</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n`;
      const keyboard: any[][] = [];
      if (packs.length === 0) {
        text += `لا توجد أي باقات خاصة مضافة حالياً.\nاضغط على <b>«🎁 إضافة باقة جديدة»</b> لبدء إنشاء باقتك الأولى!`;
      } else {
        packs.forEach((p, idx) => {
          text +=
            `${idx + 1}. <b>${escapeHtml(p.name)}</b> (#${p.sku})\n` +
            `• السعر: <b>${p.packPriceDzd.toLocaleString()} د.ج</b> (توفير: ${(p.savingsDzd || 0).toLocaleString()} د.ج)\n` +
            `• عدد المواد المرفقة: ${p.items.length} مواد\n\n`;
          keyboard.push([
            { text: `🗑️ حذف باقة: ${p.name.slice(0, 20)}`, callback_data: `pack:delete:${p.id}` },
          ]);
        });
      }
      keyboard.push([
        { text: '➕ إضافة باقة جديدة (Pack)', callback_data: 'menu:add_pack_wizard' },
      ]);
      keyboard.push([
        { text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' },
      ]);
      await sendOrEditMessage(botToken, chatId, messageId, text, keyboard);
    } else if (data.startsWith('pack:delete:')) {
      const packId = data.replace('pack:delete:', '');
      const packs = await getPacks(env);
      const filtered = packs.filter((p) => p.id !== packId);
      await savePacks(env, filtered);
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        `✅ <b>تم حذف الباقة بنجاح من المتجر!</b>`,
        [[{ text: '« 🔙 العودة لقائمة الباقات', callback_data: 'menu:packs_list' }]],
      );
    } else if (data === 'menu:alerts_info') {
      const ntfyAppUrl = `${origin}/ntfy/open`;
      const text =
        `📢 <b>قنوات الإشعارات والتنبيهات المربوطة بالمتجر:</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `1️⃣ <b>تطبيق NTFY:</b> القناة <code>${NTFY_TOPIC}</code>\n` +
        `2️⃣ <b>مجموعة التلغرام:</b> <code>@items03bot</code> و <code>@techno03bot</code>\n` +
        `3️⃣ <b>الرمز السري للإدارة (PIN):</b> 🟢 مشفر بنظام PBKDF2 و Salt (لتغييره أرسل في الخاص: <code>/pin الرمز_الجديد</code>)\n` +
        `4️⃣ <b>بيانات الزبائن:</b> 🔒 مشفرة بتقنية AES-256-GCM المقاومة للاختراق`;
      await sendOrEditMessage(botToken, chatId, messageId, text, [
        [{ text: '📲 فتح لوحة الطلبات', url: ntfyAppUrl }],
        [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
      ]);
    } else if (data === 'menu:clear_ask') {
      const products = await getProducts(env);
      const text =
        `⚠️ <b>تحذير: هل أنت متأكد من مسح جميع المنتجات (${products.length})؟</b>`;
      await sendOrEditMessage(botToken, chatId, messageId, text, [
        [
          { text: '🗑️ نعم، احذف كل المنتجات', callback_data: 'menu:clear_do' },
          { text: '❌ تراجع', callback_data: 'menu:home' },
        ],
      ]);
    } else if (data === 'menu:clear_do') {
      await saveProducts(env, []);
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        '🗑️ <b>تم مسح جميع المنتجات بنجاح!</b>',
        [
          [{ text: '➕ إضافة منتج جديد', callback_data: 'menu:add_wizard' }],
          [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
        ],
      );
    } else if (data.startsWith('del_ask:')) {
      const productId = data.replace('del_ask:', '');
      const products = await getProducts(env);
      const prod = products.find((p) => p.id === productId);
      if (!prod) {
        await callTelegram(botToken, 'answerCallbackQuery', {
          callback_query_id: cq.id,
          text: 'المنتج غير موجود أو تم حذفه مسبقاً!',
        });
        return;
      }
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        `⚠️ <b>تأكيد الحذف:</b>\nهل أنت متأكد من حذف <b>${escapeHtml(prod.name)}</b> (رقم: <code>${prod.sku}</code>)؟`,
        [
          [
            { text: '✅ نعم، احذف نهائياً', callback_data: `del_do:${productId}` },
            { text: '❌ تراجع', callback_data: 'del_cancel' },
          ],
        ],
      );
    } else if (data.startsWith('del_do:')) {
      const productId = data.replace('del_do:', '');
      const products = await getProducts(env);
      const remaining = products.filter((p) => p.id !== productId);
      await saveProducts(env, remaining);
      await callTelegram(botToken, 'answerCallbackQuery', {
        callback_query_id: cq.id,
        text: 'تم حذف المنتج بنجاح!',
      });
      await sendOrEditMessage(
        botToken,
        chatId,
        messageId,
        `🗑️ <b>تم حذف المنتج بنجاح!</b>\nعدد المنتجات المتبقية: <b>${remaining.length}</b>`,
        [
          [
            { text: `📋 باقي المنتجات (${remaining.length})`, callback_data: 'menu:list' },
            { text: '➕ إضافة منتج جديد', callback_data: 'menu:add_wizard' },
          ],
          [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
        ],
      );
      return;
    } else if (data === 'del_cancel') {
      await sendOrEditMessage(botToken, chatId, messageId, 'تم إلغاء عملية الحذف.', [
        [{ text: '📋 قائمة المنتجات', callback_data: 'menu:list' }],
        [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
      ]);
    }

    await callTelegram(botToken, 'answerCallbackQuery', { callback_query_id: cq.id });
    return;
  }

  // B. Messages (Text or Photo)
  if (!update.message) return;
  const msg = update.message;
  const chatId = msg.chat?.id;

  // Provide immediate typing/action feedback to Telegram user
  if (chatId) {
    callTelegram(botToken, 'sendChatAction', {
      chat_id: chatId,
      action: msg.photo && msg.photo.length > 0 ? 'upload_photo' : 'typing',
    }).catch(() => {});
  }

  const rawText = (msg.text || '').trim();
  const rawCaption = (msg.caption || '').trim();
  const text = rawText.replace(/@(items03bot|techno03bot|technolagh03)/gi, '').trim();
  const caption = rawCaption.replace(/@(items03bot|techno03bot|technolagh03)/gi, '').trim();

  // Global reset/cancel commands always exit wizard cleanly
  if (text.startsWith('/cancel') || text === 'إلغاء' || text === 'الغاء') {
    await clearSession(env, chatId);
    await sendDashboardMenu(botToken, chatId, env);
    return;
  }

  if (text.startsWith('/start') || text.startsWith('/help')) {
    await clearSession(env, chatId);
    await sendDashboardMenu(botToken, chatId, env);
    return;
  }

  if (text.startsWith('/clear') || text.startsWith('/reset') || text === 'تفريغ' || text === 'مسح الكل') {
    await clearSession(env, chatId);
    await saveProducts(env, []);
    await saveCategories(env, []);
    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `🗑️ <b>تم تفريغ ومسح جميع المنتجات والأقسام بالكامل!</b>\nالمتجر الآن نظيف وفارغ بنسبة 100% وجاهز لإضافة أقسامك ومنتجاتك بنفسك.`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }]] },
    });
    return;
  }

  // Quick command to create a category: /addcat <name> or /قسم <name>
  if (text.startsWith('/addcat') || text.startsWith('/قسم')) {
    const catName = text.replace(/^\/(addcat|قسم)/, '').trim();
    if (!catName) {
      await sendCategoriesMenu(botToken, chatId, env);
      return;
    }
    const created = await ensureCategory(env, catName);
    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `✅ <b>تمت إضافة القسم بنجاح:</b> 📂 <b>${escapeHtml(created.name)}</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ إضافة منتج لهذا القسم', callback_data: `wiz:cat:${created.id}` },
            { text: '📂 عرض كل الأقسام', callback_data: 'menu:categories' },
          ],
          [{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }],
        ],
      },
    });
    return;
  }

  if (text.startsWith('/categories') || text === 'الأقسام' || text === 'الاقسام') {
    await clearSession(env, chatId);
    await sendCategoriesMenu(botToken, chatId, env);
    return;
  }

  if (text.startsWith('/new') || text.startsWith('/add_wizard')) {
    await promptWizardCategory(botToken, chatId, env);
    return;
  }

  // Check active interactive wizard session first!
  const session = await getSession(env, chatId);

  if (session) {
    // 1. Handling photos during wizard
    if (msg.photo && msg.photo.length > 0) {
      const bestPhoto = selectOptimalWebPhoto(msg.photo) || msg.photo[msg.photo.length - 1];
      const imageUrl = await downloadTelegramPhoto(env, botToken, bestPhoto.file_id, origin);

      if (session.step === 'shape_photo') {
        if (!session.draft.currentShape) session.draft.currentShape = {};
        session.draft.currentShape.image = imageUrl;
        await setSession(env, chatId, {
          step: 'shape_name',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const shapeIdx = (session.draft.variants?.length || 0) + 1;
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ <b>تم استلام صورة الشكل (${shapeIdx}) بنجاح!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🏷️ <b>الخطوة 2 للشكل (${shapeIdx}):</b> أرسل الآن <b>اسم هذا الشكل أو الموديل</b> (ورقمه إن وُجد)\n` +
            `(مثال: <code>شكل قطة كرتونية #101</code> أو <code>أزرق ملكي | 102</code> أو مجرد <code>موديل جلدي 3 سحابات</code>):`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
          },
        });
        return;
      }

      if (session.step === 'prod_photos') {
        const nextImages = [...(session.draft.images || []), imageUrl];
        session.draft.images = nextImages;
        const targetCount = session.draft.targetPhotoCount || 1;

        if (nextImages.length >= targetCount) {
          await publishWizardDraft(env, botToken, chatId, session.draft);
        } else {
          await setSession(env, chatId, {
            step: 'prod_photos',
            draft: session.draft,
            updatedAt: Date.now(),
          });
          const variants = session.draft.variants || [];
          const nextVar = variants[nextImages.length];
          const nextVarName = nextVar?.name || nextVar?.label;
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text:
              `✅ <b>تم استلام الصورة ${nextImages.length} من ${targetCount}</b>\n` +
              `أرسل الآن <b>الصورة ${nextImages.length + 1} من ${targetCount}</b>` +
              (nextVarName ? ` (المخصصة لشكل: <b>${escapeHtml(nextVarName)}</b>)` : '') +
              `:\n<i>يمكنك أيضاً إرسال باقي الصور دفعة واحدة.</i>`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `✅ نشر المنتج الآن بالصور المستلمة (${nextImages.length})`,
                    callback_data: 'wiz:publish_now',
                  },
                ],
                [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
              ],
            },
          });
        }
        return;
      }

      if (session.step === 'existing_add_photos' && session.draft.targetProductId) {
        const products = await getProducts(env);
        const idx = products.findIndex((p) => p.id === session.draft.targetProductId);
        if (idx !== -1) {
          const existing = products[idx];
          const currentImgs =
            Array.isArray(existing.images) && existing.images.length > 0
              ? existing.images
              : [existing.image];
          const updatedImgs = [...currentImgs, imageUrl];
          products[idx] = {
            ...existing,
            image: updatedImgs[0],
            images: updatedImgs,
          };
          await saveProducts(env, products);
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text:
              `✅ <b>تمت إضافة الصورة للمنتج ${escapeHtml(existing.name)}!</b>\n` +
              `إجمالي صور المنتج الآن: <b>${updatedImgs.length} صور</b>.\n` +
              `أرسل صورة أخرى أو اضغط «إنهاء».`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '✅ إنهاء والعودة للقائمة', callback_data: 'menu:list' }],
              ],
            },
          });
        }
        return;
      }
    }

    // 2. Handling text inputs during wizard steps
    if (text && !text.startsWith('/')) {
      // ── Pack Creation Wizard Steps ──────────────────────
      if (session.step === 'pack_name') {
        const draft: PackDraft = session.packDraft || {};
        draft.name = text.trim();
        await setSession(env, chatId, {
          step: 'pack_desc' as any,
          draft: session.draft,
          packDraft: draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ اسم الباقة: <b>${escapeHtml(draft.name || '')}</b>\n\n` +
            `📝 <b>الخطوة 2 من 4 — وصف ومميزات الباقة:</b>\n` +
            `أرسل الآن نبذة تسويقية للباقة تشرح ما تقدمه ومن المستهدف بها (مثال: <i>باقة متكاملة للمهندسين المعماريين توفر كافة أدوات الرسم والقياس والتخطيط بأعلى دقة وأفضل سعر جملة مخفض</i>):`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '« ❌ إلغاء', callback_data: 'menu:home' }]] },
        });
        return;
      }

      if (session.step === 'pack_desc') {
        const draft: PackDraft = session.packDraft || {};
        draft.description = text.trim();
        await setSession(env, chatId, {
          step: 'pack_items' as any,
          draft: session.draft,
          packDraft: draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ تم تسجيل الوصف!\n\n` +
            `📦 <b>الخطوة 3 من 4 — محتويات ومكونات الباقة:</b>\n` +
            `أرسل قائمة المنتجات المرفقة في الباقة (اكتب كل مادة في سطر أو افصل بينها بفواصل):\n\n` +
            `<i>مثال:\nمسطرة حرف T ألمانية 80 سم\nطقم أقلام روترينج الأصلية للتحبير\nدفتر مخططات A3 ورق كانسون\nحامل مخططات أسطواني مقاوم للماء</i>`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '« ❌ إلغاء', callback_data: 'menu:home' }]] },
        });
        return;
      }

      if (session.step === 'pack_items') {
        const draft: PackDraft = session.packDraft || {};
        const lines = text
          .split(/[\n,،]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        draft.items = lines;
        await setSession(env, chatId, {
          step: 'pack_pricing' as any,
          draft: session.draft,
          packDraft: draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ تم تسجيل ${lines.length} مواد داخل الباقة!\n\n` +
            `💰 <b>الخطوة 4 والأخيرة — أسعار الباقة (د.ج):</b>\n` +
            `أرسل السعر الأصلي عند الشراء المنفصل متبوعاً بسعر الباقة المخفض:\n` +
            `<i>مثال: <code>16500 13800</code></i>\n` +
            `(سعر الشراء المنفصل 16,500 د.ج وسعر الباقة الخاصة 13,800 د.ج):`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '« ❌ إلغاء', callback_data: 'menu:home' }]] },
        });
        return;
      }

      if (session.step === 'pack_pricing') {
        const draft: PackDraft = session.packDraft || {};
        const nums = text.match(/\d+/g);
        let origPrice = 0;
        let packPrice = 0;
        if (nums && nums.length >= 2) {
          origPrice = parseInt(nums[0], 10);
          packPrice = parseInt(nums[1], 10);
        } else if (nums && nums.length === 1) {
          packPrice = parseInt(nums[0], 10);
          origPrice = packPrice;
        } else {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ يرجى إدخال أرقام صحيحة للأسعار (مثال: <code>16500 13800</code>):`,
            parse_mode: 'HTML',
          });
          return;
        }

        const savings = Math.max(0, origPrice - packPrice);
        const packId = `pack-${Date.now()}`;
        const newPack: StorePack = {
          id: packId,
          sku: `PACK-${Math.floor(100 + Math.random() * 900)}`,
          name: draft.name || 'باقة خاصة',
          badge: 'عرض خاص',
          targetAudience: 'المحترفين والطلبة',
          tagline: draft.name || 'باقة تكنو الحصرية',
          description: draft.description || '',
          items: draft.items && draft.items.length > 0 ? draft.items : ['مجموعة أدوات تكنو المتكاملة'],
          originalPriceDzd: origPrice,
          packPriceDzd: packPrice,
          savingsDzd: savings,
          imageUrl: draft.imageUrl || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
          featured: true,
        };

        const currentPacks = await getPacks(env);
        currentPacks.unshift(newPack);
        await savePacks(env, currentPacks);
        await clearSession(env, chatId);

        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `🎉 <b>تم نشر الباقة بنجاح في متجر تكنو الأغواط!</b> 🎁✨\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📦 <b>الاسم:</b> <b>${escapeHtml(newPack.name)}</b> (#${newPack.sku})\n` +
            `💰 <b>سعر الباقة الخاص:</b> <b>${newPack.packPriceDzd.toLocaleString()} د.ج</b>\n` +
            (savings > 0 ? `💎 <b>قيمة التوفير للعميل:</b> <b>${savings.toLocaleString()} د.ج</b>\n` : '') +
            `📋 <b>المواد المرفقة:</b> ${newPack.items.length} مواد\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🌐 <b>ستظهر الباقة فوراً في قسم الباقات الحصرية في الموقع.</b>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🎁 قائمة الباقات', callback_data: 'menu:packs_list' }],
              [{ text: '➕ إضافة باقة أخرى', callback_data: 'menu:add_pack_wizard' }],
              [{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'cat_create_name') {
        const created = await ensureCategory(env, text);
        await clearSession(env, chatId);
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text: `✅ <b>تم إنشاء القسم الجديد بنجاح:</b> 📂 <b>${escapeHtml(created.name)}</b>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '➕ إضافة منتج في هذا القسم', callback_data: `wiz:cat:${created.id}` },
                { text: '📂 كل الأقسام', callback_data: 'menu:categories' },
              ],
              [{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'prod_create_category') {
        const created = await ensureCategory(env, text);
        session.draft.categoryId = created.id;
        session.draft.categoryName = created.name;
        await setSession(env, chatId, {
          step: 'prod_name',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ تم إنشاء واختيار القسم: <b>${escapeHtml(created.name)}</b>\n\n` +
            `📝 <b>الخطوة 2 من 6 — اسم المنتج</b>\n` +
            `أرسل الآن <b>اسم المنتج</b>:`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]] },
        });
        return;
      }

      if (session.step === 'prod_name') {
        session.draft.name = text;
        await setSession(env, chatId, {
          step: 'prod_pricing_mode',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ اسم المنتج: <b>${escapeHtml(text)}</b>\n\n` +
            `💰 <b>نوع التسعير والأشكال</b>\n` +
            `هل لهذا المنتج <b>سعر واحد فقط</b> أم يتوفر بعدة <b>أشكال وموديلات / قياسات</b> مختلفة؟`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💰 سعر واحد فقط للمنتج', callback_data: 'wiz:price_single' }],
              [{ text: '🎨 عدة أشكال وموديلات / قياسات', callback_data: 'wiz:price_variants' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'prod_pricing_mode') {
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `يرجى اختيار نوع التسعير بالضغط على أحد الزرين:\n` +
            `• اضغط <b>«💰 سعر واحد فقط للمنتج»</b> وسنطلب منك رقم المنتج بعد ذلك.\n` +
            `• اضغط <b>«🎨 عدة أشكال وموديلات»</b> للبدء في إضافة الأشكال والموديلات.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💰 سعر واحد فقط للمنتج', callback_data: 'wiz:price_single' }],
              [{ text: '🎨 عدة أشكال وموديلات / قياسات', callback_data: 'wiz:price_variants' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'prod_number') {
        const cleanNum = text.replace(/[^0-9]/g, '');
        if (!cleanNum) {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text: '⚠️ يرجى إدخال رقم منتج صحيح بالأرقام فقط (مثلاً: <code>71645</code>) أو الضغط على «توليد رقم تلقائي».',
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '🎲 توليد رقم تلقائي', callback_data: 'wiz:num_auto' }]],
            },
          });
          return;
        }
        const products = await getProducts(env);
        const alreadyExists = products.some((p) => p.id === cleanNum || p.sku === cleanNum);
        if (alreadyExists) {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text: `⚠️ الرقم <code>${cleanNum}</code> مستخدم مسبقاً لمنتج آخر. يرجى إدخال رقم مختلف أو الضغط على «توليد رقم تلقائي».`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '🎲 توليد رقم تلقائي', callback_data: 'wiz:num_auto' }]],
            },
          });
          return;
        }
        session.draft.productNumber = cleanNum;
        await setSession(env, chatId, {
          step: 'prod_single_price',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ رقم المنتج: <code>${cleanNum}</code> (ستنتهي الصفحة بـ <code>/p/${cleanNum}</code>)\n\n` +
            `💰 <b>الخطوة 4 من 6 — سعر المنتج</b>\n` +
            `أدخل الآن <b>سعر المنتج بالدينار الجزائري</b> (أرقام فقط، مثال: <code>2500</code>):`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
          },
        });
        return;
      }

      if (session.step === 'prod_single_price') {
        const price = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (!price || price <= 0) {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text: '⚠️ يرجى إدخال سعر صحيح بالأرقام (مثال: <code>2500</code>).',
            parse_mode: 'HTML',
          });
          return;
        }
        session.draft.priceDzd = price;
        session.draft.variants = [];
        await setSession(env, chatId, {
          step: 'prod_dimensions',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ السعر: <b>${price.toLocaleString()} د.ج</b>\n\n` +
            `📏 <b>الخطوة 5 من 7 — قياسات أو أبعاد المنتج (اختياري)</b>\n` +
            `أرسل أبعاد أو قياسات هذا المنتج (مثال: <code>40x60 سم</code> أو <code>A4</code> أو <code>سعة 500 مل</code>) أو اضغط «تخطي القياسات»:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⏭️ تخطي القياسات', callback_data: 'wiz:skip_dims' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'prod_dimensions') {
        session.draft.dimensions = text.trim();
        await setSession(env, chatId, {
          step: 'prod_description',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ القياسات: <b>${escapeHtml(text.trim())}</b>\n\n` +
            `✍️ <b>الخطوة 6 من 7 — وصف المنتج (اختياري)</b>\n` +
            `أرسل وصفاً قصيراً للمنتج أو اضغط «تخطي الوصف»:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⏭️ تخطي الوصف', callback_data: 'wiz:skip_desc' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'shape_photo') {
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text: '📸 <b>يرجى إرسال صورة للشكل</b> للمتابعة (أو اضغط إلغاء أدناه):',
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
          },
        });
        return;
      }

      if (session.step === 'shape_name') {
        if (!session.draft.currentShape) session.draft.currentShape = {};
        const rawText = text.trim();
        let shapeName = rawText;
        let shapeSku: string | undefined = undefined;

        // Check if user separated name and number using | or - or # or "رقم"
        // e.g. "شكل قطة | 101" or "موديل 105" or "أزرق ملكي #55"
        if (rawText.includes('|')) {
          const parts = rawText.split('|');
          shapeName = parts[0].trim();
          shapeSku = parts[1].trim();
        } else {
          const skuMatch = rawText.match(/(?:#|رقم\s*[:#]?|كود\s*[:#]?)\s*([0-9a-zA-Z\-_]+)/i);
          if (skuMatch) {
            shapeSku = skuMatch[1];
            shapeName = rawText.replace(/(?:#|رقم\s*[:#]?|كود\s*[:#]?)\s*[0-9a-zA-Z\-_]+/i, '').trim();
            if (!shapeName) shapeName = rawText;
          }
        }

        session.draft.currentShape.name = shapeName;
        session.draft.currentShape.sku = shapeSku;
        await setSession(env, chatId, {
          step: 'shape_pricing_choice',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const shapeIdx = (session.draft.variants?.length || 0) + 1;
        const skuNotice = shapeSku ? ` (رقم/كود: <code>#${escapeHtml(shapeSku)}</code>)` : '';
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ اسم الشكل: <b>${escapeHtml(shapeName)}</b>${skuNotice}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💰 <b>الخطوة 3 للشكل (${shapeIdx}): نوع التسعير والقياسات</b>\n` +
            `هل لهذا الشكل:\n` +
            `1️⃣ <b>سعر موحد</b> (مثال: <code>2500</code> د.ج)\n` +
            `2️⃣ أم <b>عدة قياسات بأسعار مختلفة</b> (مثل: صغير: 1800، متوسط: 2500، كبير: 3400)؟\n\n` +
            `<i>اضغط على أحد الزرين، أو اكتب السعر/القياسات مباشرة في رسالتك:</i>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💰 سعر واحد موحد لهذا الشكل', callback_data: 'wiz:shape_p_single' }],
              [{ text: '📏 عدة قياسات بأسعارها (صغير، متوسط...)', callback_data: 'wiz:shape_p_sizes' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'shape_pricing_choice' || session.step === 'shape_price') {
        const parsed = parseVariantsText(text);
        if (parsed.length > 1 || (parsed.length === 1 && !/^\d+$/.test(text.trim()))) {
          if (!session.draft.currentShape) session.draft.currentShape = {};
          session.draft.currentShape.subSizes = parsed;
          session.draft.currentShape.priceDzd = Math.min(...parsed.map((v) => v.priceDzd));
          await setSession(env, chatId, {
            step: 'shape_desc',
            draft: session.draft,
            updatedAt: Date.now(),
          });
          const shapeIdx = (session.draft.variants?.length || 0) + 1;
          const listStr = parsed
            .map((v) => `  • ${escapeHtml(v.label)} — <b>${v.priceDzd.toLocaleString()} د.ج</b>`)
            .join('\n');
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text:
              `✅ <b>تم تسجيل قياسات وأسعار هذا الشكل (${parsed.length}):</b>\n${listStr}\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n` +
              `📝 <b>الخطوة 4 للشكل (${shapeIdx}):</b> أرسل <b>وصف ومميزات هذا الشكل</b> أو اضغط «تخطي الوصف»:`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '⏭️ تخطي الوصف', callback_data: 'wiz:shape_skip_desc' }],
                [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
              ],
            },
          });
          return;
        }

        const price = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (!price || price <= 0) {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text:
              '⚠️ يرجى إدخال سعر صحيح بالأرقام (مثال: <code>2500</code>)\n' +
              'أو إدخال القياسات وأسعارها:\n' +
              '<code>صغير : 1800\nمتوسط : 2500\nكبير : 3400</code>',
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '💰 سعر واحد موحد لهذا الشكل', callback_data: 'wiz:shape_p_single' }],
                [{ text: '📏 عدة قياسات بأسعارها', callback_data: 'wiz:shape_p_sizes' }],
                [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
              ],
            },
          });
          return;
        }

        if (!session.draft.currentShape) session.draft.currentShape = {};
        session.draft.currentShape.priceDzd = price;
        session.draft.currentShape.subSizes = undefined;
        await setSession(env, chatId, {
          step: 'shape_desc',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const shapeIdx = (session.draft.variants?.length || 0) + 1;
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ السعر: <b>${price.toLocaleString()} د.ج</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📝 <b>الخطوة 4 للشكل (${shapeIdx}):</b> أرسل <b>وصف ومميزات هذا الشكل</b> أو اضغط «تخطي الوصف»:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⏭️ تخطي الوصف', callback_data: 'wiz:shape_skip_desc' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'shape_multi_sizes') {
        const parsed = parseVariantsText(text);
        if (parsed.length === 0) {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text:
              '⚠️ لم أتمكن من قراءة القياسات والأسعار.\n' +
              'يرجى كتابتها بهذا الشكل:\n' +
              '<code>صغير : 1800\nمتوسط : 2500\nكبير : 3400</code>\n' +
              '<i>أو بالأبعاد:</i>\n' +
              '<code>A5 : 450\nA4 : 750</code>',
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
            },
          });
          return;
        }

        if (!session.draft.currentShape) session.draft.currentShape = {};
        const merged = [...(session.draft.currentShape.subSizes || []), ...parsed];
        session.draft.currentShape.subSizes = merged;
        session.draft.currentShape.priceDzd = Math.min(...merged.map((v) => v.priceDzd));
        await setSession(env, chatId, {
          step: 'shape_desc',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const shapeIdx = (session.draft.variants?.length || 0) + 1;
        const listStr = merged
          .map((v) => `  • ${escapeHtml(v.label)} — <b>${v.priceDzd.toLocaleString()} د.ج</b>`)
          .join('\n');
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ <b>تم تسجيل قياسات وأسعار هذا الشكل بنجاح (${merged.length}):</b>\n${listStr}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📝 <b>الخطوة 4 للشكل (${shapeIdx}):</b> أرسل <b>وصف ومميزات هذا الشكل</b> أو اضغط «تخطي الوصف»:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⏭️ تخطي الوصف', callback_data: 'wiz:shape_skip_desc' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'shape_desc') {
        if (!session.draft.currentShape) session.draft.currentShape = {};
        session.draft.currentShape.description = text.trim();
        await setSession(env, chatId, {
          step: 'shape_dims',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const shapeIdx = (session.draft.variants?.length || 0) + 1;
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ الوصف: <b>${escapeHtml(text.trim())}</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📏 <b>الخطوة 5 للشكل (${shapeIdx}):</b> أرسل <b>قياسات أو أبعاد هذا الشكل</b> (مثال: <code>40x60 سم</code> أو <code>سعة 500 مل</code>)\n` +
            `أو أرسل قياسات بأسعارها (مثال: <code>صغير : 1800\nمتوسط : 2500\nكبير : 3400</code>)\n` +
            `أو اضغط «تخطي القياسات»:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⏭️ تخطي القياسات', callback_data: 'wiz:shape_skip_dims' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'shape_dims') {
        if (!session.draft.currentShape) session.draft.currentShape = {};
        const parsed = parseVariantsText(text);
        if (parsed.length > 0) {
          session.draft.currentShape.subSizes = parsed;
          session.draft.currentShape.priceDzd = Math.min(...parsed.map((v) => v.priceDzd));
        } else {
          session.draft.currentShape.dimensions = text.trim();
        }
        await finalizeShapeAndPromptNext(env, botToken, chatId, session);
        return;
      }

      if (session.step === 'shape_ask_more') {
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text: '👇 يرجى اختيار أحد الأزرار أدناه للمتابعة:',
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '➕ إضافة شكل آخر لهذا المنتج', callback_data: 'wiz:shape_add_another' }],
              [{ text: '✅ إنهاء ونشر المنتج الآن في المتجر', callback_data: 'wiz:shape_finish_publish' }],
              [{ text: '❌ إلغاء العملية', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'prod_variants') {
        const parsed = parseVariantsText(text);
        if (parsed.length === 0) {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text:
              '⚠️ لم أتمكن من قراءة القياس والسعر.\n' +
              'أرسلها بهذا الشكل:\n<code>صغير : 1800\nمتوسط : 2500\nكبير : 3400</code>',
            parse_mode: 'HTML',
          });
          return;
        }
        const merged = [...(session.draft.variants || []), ...parsed];
        session.draft.variants = merged;
        session.draft.priceDzd = Math.min(...merged.map((v) => v.priceDzd));
        await setSession(env, chatId, {
          step: 'prod_variants',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        const listStr = merged
          .map((v) => `• ${escapeHtml(v.label)} — <b>${v.priceDzd.toLocaleString()} د.ج</b>`)
          .join('\n');
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ <b>القياسات المضافة حتى الآن (${merged.length}):</b>\n${listStr}\n\n` +
            `أرسل قياساً إضافياً أو اضغط <b>«✅ إنهاء القياسات والمتابعة»</b>:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ إنهاء القياسات والمتابعة', callback_data: 'wiz:variants_done' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
          },
        });
        return;
      }

      if (session.step === 'prod_description') {
        session.draft.description = text;
        await promptWizardPhotoCount(botToken, chatId, env, session.draft);
        return;
      }

      if (session.step === 'prod_photo_count') {
        const count = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (!count || count < 1 || count > 10) {
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text: '⚠️ يرجى اختيار عدد صور بين 1 و 10.',
            parse_mode: 'HTML',
          });
          return;
        }
        session.draft.targetPhotoCount = count;
        session.draft.images = [];
        await setSession(env, chatId, {
          step: 'prod_photos',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text: `📸 <b>ممتاز! أرسل الآن الصورة 1 من ${count}:</b>`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]] },
        });
        return;
      }
    }
  }

  // 1. Direct Photo with caption (Quick Mode when not in wizard)
  if (msg.photo && msg.photo.length > 0) {
    const bestPhoto = selectOptimalWebPhoto(msg.photo) || msg.photo[msg.photo.length - 1];
    const details = parseProductDetails(caption || 'منتج جديد من تكنو الأغواط\n1500');

    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text: '⏳ <i>جاري معالجة الصورة وحفظ المنتج في السحابة...</i>',
      parse_mode: 'HTML',
    });

    const imageUrl = await downloadTelegramPhoto(env, botToken, bestPhoto.file_id, origin);
    const products = await getProducts(env);
    const newId = await getNextNumericId(env, products, details.requestedId);
    const catObj = await ensureCategory(env, details.seriesLabel);

    const newProduct: Product = {
      id: newId,
      sku: newId,
      name: details.name,
      shortName: details.name,
      brand: 'TECHNO STATIONERY',
      series: catObj.id,
      seriesLabel: catObj.name,
      categoryId: catObj.id,
      categoryName: catObj.name,
      colorFamily: details.colorFamily,
      colorName: details.colorName,
      colorHex: details.colorHex,
      priceDzd: details.price,
      image: imageUrl,
      images: [imageUrl],
      ...(details.variants.length > 0
        ? {
            variants: details.variants.map((v) => ({
              ...v,
              name: v.name || v.label,
              image: v.image || imageUrl,
            })),
          }
        : {}),
      alt: `${details.name} - رقم المنتج ${newId}`,
      summary: details.description,
      description: details.description,
      availabilityText: 'متوفر في فرع الأغواط',
      featuredRank: 1,
      siblingIds: [],
      specs: [
        { label: 'رقم المنتج', value: newId },
        { label: 'القسم', value: catObj.name },
        ...(details.variants.length > 0
          ? [{ label: 'القياسات المتوفرة', value: details.variants.map((v) => v.label).join(' · ') }]
          : []),
      ],
      highlights: [
        'منتج أصلي معتمد من تكنو الأغواط',
        'توصيل سريع للأغواط و54 ولاية عبر ZR Express',
      ],
    };

    const updated = [newProduct, ...products];
    await saveProducts(env, updated);

    const siteUrl = await getSiteUrl(env);
    const productUrl = buildCleanProductUrl(siteUrl, newProduct.id);

    const keyboard: any[][] = [
      [{ text: '📋 نسخ رابط صفحة المنتج بنقرة زر', copy_text: { text: productUrl } }],
      [{ text: '📸 إضافة صور أخرى لهذا المنتج', callback_data: `addphotos:${newProduct.id}` }],
    ];

    if (
      productUrl.startsWith('https://') ||
      (!productUrl.includes('localhost') && !productUrl.includes('127.0.0.1'))
    ) {
      keyboard.push([{ text: '🌐 فتح صفحة المنتج بالموقع', url: productUrl }]);
    }

    keyboard.push([
      { text: `📋 عرض جميع المنتجات (${updated.length})`, callback_data: 'menu:list' },
      { text: '🗑️ حذف هذا المنتج', callback_data: `del_ask:${newProduct.id}` },
    ]);
    keyboard.push([{ text: '« 🔙 العودة للوحة التحكم', callback_data: 'menu:home' }]);

    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text:
        `🎉 <b>تمت إضافة المنتج الجديد بنجاح!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 <b>الاسم:</b> ${escapeHtml(newProduct.name)}\n` +
        `📂 <b>القسم:</b> ${escapeHtml(catObj.name)}\n` +
        `🔢 <b>رقم المنتج:</b> <code>${newProduct.id}</code>\n` +
        `💰 <b>السعر:</b> ${newProduct.priceDzd.toLocaleString()} د.ج\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🔗 <b>رابط صفحة المنتج (ينتهي برقم المنتج):</b>\n` +
        `<code>${productUrl}</code>`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });

    await sendProductAddedNtfy(newProduct, productUrl);
    return;
  }

  // Add Pack Command (/addpack or /pack)
  if (text.startsWith('/addpack') || text.startsWith('/pack')) {
    await setSession(env, chatId, {
      step: 'pack_name' as any,
      draft: {},
      packDraft: {},
      updatedAt: Date.now(),
    });
    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text:
        `🎁 <b>معالج إضافة باقة أو عرض خاص (Pack) جديد:</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👉 <b>الخطوة 1 من 4:</b> أرسل الآن <b>اسم الباقة</b> (مثال: <code>باك المهندس المعماري المتكامل</code>):`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '« ❌ إلغاء', callback_data: 'menu:home' }]] },
    });
    return;
  }

  // View site domain (read-only)
  if (text.startsWith('/url') || text.startsWith('/seturl') || text.startsWith('/domain')) {
    const siteUrl = await getSiteUrl(env);
    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `🌐 <b>رابط متجر تكنو الأغواط الرسمي:</b>\n<code>${siteUrl}</code>`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }]] },
    });
    return;
  }

  // View / update Orders Bot Token
  if (text.startsWith('/setbot') || text.startsWith('/orderbot')) {
    const parts = text.split(/\s+/);
    if (parts.length > 1 && parts[1].includes(':')) {
      const newToken = parts[1].trim();
      if (env.techno_products_kv) {
        await env.techno_products_kv.put('orders_bot_token', newToken);
      }
      await callTelegram(botToken, 'sendMessage', {
        chat_id: chatId,
        text: `🤖 <b>تم تحديث توكن بوت الطلبات بنجاح!</b>`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }]] },
      });
      return;
    }
  }

  // View / update Admin PIN with PBKDF2 hashing
  if (text.startsWith('/pin') || text.startsWith('/setpin')) {
    const parts = text.split(/\s+/);
    if (parts.length > 1 && parts[1].trim()) {
      const newPin = parts[1].trim();
      if (newPin.length >= 4 && newPin.length <= 32 && env.techno_products_kv) {
        await setAdminPin(env, newPin);
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text: `🔐 <b>تم تشفير وتحديث رمز PIN الجديد بنجاح!</b>\nتم حفظ التجزئة المشفرة بتقنية PBKDF2-SHA256 (100,000 تكرار) مع Salt فريد لمنع الاختراق والتخمين نهائياً.`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }]] },
        });
        return;
      }
    }
    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `🔐 <b>حماية وتشفير رمز PIN:</b>\nرمز الأمان الخاص بلوحة الإدارة مشفّر ومخزّن بتقنية PBKDF2-SHA256 مع Salt عشوائي فريد لمنع هجمات القوة الغاشمة والاختراق.\n\nلتغيير رمز PIN أرسل:\n<code>/pin الرمز_الجديد</code>\n(مثال: <code>/pin 849204</code>)`,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }]] },
    });
    return;
  }

  if (text.startsWith('/list') || text === 'المنتجات') {
    const products = await getProducts(env);
    const siteUrl = await getSiteUrl(env);
    await sendProductsList(botToken, chatId, products, siteUrl);
    return;
  }

  if (text.startsWith('/delete') || text.startsWith('/del')) {
    const arg = text.replace(/^\/(delete|del)/, '').trim();
    const products = await getProducts(env);
    if (arg) {
      const toDelete = products.find((p) => p.id === arg || p.sku === arg);
      if (toDelete) {
        const remaining = products.filter((p) => p.id !== toDelete.id);
        await saveProducts(env, remaining);
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text: `🗑️ <b>تم حذف المنتج:</b> "${escapeHtml(toDelete.name)}" (${toDelete.sku})`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }]] },
        });
      } else {
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text: `❌ لم يتم العثور على منتج بالرقم: <code>${escapeHtml(arg)}</code>`,
          parse_mode: 'HTML',
        });
      }
    } else {
      await sendDeleteMenu(botToken, chatId, products);
    }
    return;
  }

  if (text.startsWith('/clear') || text.startsWith('/delete_all')) {
    const products = await getProducts(env);
    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text: `⚠️ هل أنت متأكد من مسح جميع المنتجات (${products.length})؟`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🗑️ نعم، احذف الكل', callback_data: 'menu:clear_do' },
            { text: '❌ تراجع', callback_data: 'menu:home' },
          ],
        ],
      },
    });
    return;
  }

  // Quick text-only /add command
  const isProductText =
    text.startsWith('/add') ||
    text.includes('|') ||
    text.includes('اسم:') ||
    text.includes('الاسم:') ||
    text.includes('سعر:') ||
    text.includes('السعر:');

  if (isProductText) {
    const cleanText = text.replace(/^\/add\s*/, '');
    const details = parseProductDetails(cleanText);
    const products = await getProducts(env);
    const newId = await getNextNumericId(env, products, details.requestedId);
    const catObj = await ensureCategory(env, details.seriesLabel);

    const newProduct: Product = {
      id: newId,
      sku: newId,
      name: details.name,
      shortName: details.name,
      brand: 'TECHNO STATIONERY',
      series: catObj.id,
      seriesLabel: catObj.name,
      categoryId: catObj.id,
      categoryName: catObj.name,
      colorFamily: details.colorFamily,
      colorName: details.colorName,
      colorHex: details.colorHex,
      priceDzd: details.price,
      image: '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg',
      images: ['/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg'],
      ...(details.variants.length > 0
        ? {
            variants: details.variants.map((v) => ({
              ...v,
              name: v.name || v.label,
              image: v.image || '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg',
            })),
          }
        : {}),
      alt: `${details.name} - رقم المنتج ${newId}`,
      summary: details.description,
      description: details.description,
      availabilityText: 'متوفر في فرع الأغواط',
      featuredRank: 1,
      siblingIds: [],
      specs: [
        { label: 'رقم المنتج', value: newId },
        { label: 'القسم', value: catObj.name },
      ],
      highlights: ['منتج أصلي معتمد من تكنو الأغواط'],
    };

    const updated = [newProduct, ...products];
    await saveProducts(env, updated);

    const siteUrl = await getSiteUrl(env);
    const productUrl = buildCleanProductUrl(siteUrl, newProduct.id);

    await callTelegram(botToken, 'sendMessage', {
      chat_id: chatId,
      text:
        `🎉 <b>تمت إضافة المنتج بنجاح!</b>\n` +
        `📦 ${escapeHtml(newProduct.name)} · رقم: <code>${newProduct.id}</code>\n` +
        `📂 القسم: ${escapeHtml(catObj.name)}\n` +
        `🔗 <code>${productUrl}</code>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 نسخ رابط المنتج', copy_text: { text: productUrl } }],
          [{ text: '📸 إضافة صور لهذا المنتج', callback_data: `addphotos:${newProduct.id}` }],
          [{ text: '« 🔙 لوحة التحكم', callback_data: 'menu:home' }],
        ],
      },
    });
    await sendProductAddedNtfy(newProduct, productUrl);
    return;
  }

  // Fallback guidance
  await callTelegram(botToken, 'sendMessage', {
    chat_id: chatId,
    text:
      '🤖 مرحباً بك في بوت إدارة متجر تكنو الأغواط (@items03bot).\n' +
      'استخدم الأزرار أدناه لإنشاء الأقسام، إضافة المنتجات برقمها وقياساتها وعدة صور بسهولة:',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '➕ إضافة منتج جديد (تفاعلي)', callback_data: 'menu:add_wizard' },
          { text: '📂 إدارة الأقسام', callback_data: 'menu:categories' },
        ],
        [{ text: '🎛️ فتح لوحة التحكم الكاملة', callback_data: 'menu:home' }],
      ],
    },
  });
}
