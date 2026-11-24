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
        { name: 'AES-GCM', iv },
        key,
        cipherBytes,
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

// Helper: Parse size/variant lines such as:
// "صغير : 1800\nمتوسط : 2500\nكبير : 3400" OR "صغير=1800, متوسط=2500, كبير=3400"
function parseVariantsText(raw: string): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const chunks = raw
    .split(/[\n,،]+/)
    .map((c) => c.trim())
    .filter(Boolean);

  chunks.forEach((chunk, index) => {
    const match = chunk.match(/^(.+?)\s*[:=\-–—]\s*([0-9][0-9\s,.]*)$/);
    if (match) {
      const label = match[1].trim();
      const price = parseInt(match[2].replace(/[^0-9]/g, ''), 10);
      if (label && price > 0) {
        variants.push({
          id: `v-${index + 1}-${Date.now().toString(36).slice(-3)}`,
          label,
          priceDzd: price,
        });
      }
      return;
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
  variants?: ProductVariant[];
  description?: string;
  targetPhotoCount?: number;
  images?: string[];
  targetProductId?: string; // Used when appending photos to an existing product
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
    | 'prod_variants'
    | 'prod_description'
    | 'prod_photo_count'
    | 'prod_photos'
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
      line.includes('المقاسات:')
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
          await env.techno_products_kv.put(
            'debug:last_update',
            JSON.stringify({ receivedAt: new Date().toISOString(), bot: botParam, update }),
          );
        }
        await handleTelegramUpdate(update, env, activeBotToken, url.origin);
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

    // 9. GET /ntfy/open & POST /ntfy/open (Protected Orders Dashboard & Order Details)
    if (
      url.pathname === '/ntfy/open' ||
      url.pathname === '/ntfy' ||
      url.pathname === '/orders' ||
      url.pathname === '/admin/orders'
    ) {
      // Logout support: clear cookie and redirect
      if (url.searchParams.get('logout') === '1') {
        await destroyAdminSession(env, request.headers.get('Cookie') || '');
        return new Response('Redirecting to login...', {
          status: 302,
          headers: {
            Location: url.pathname,
            'Set-Cookie': `admin_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure; HttpOnly`,
            ...CORS_HEADERS,
          },
        });
      }

      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';

      // 1. Brute-Force Rate Limiting & Lockout Check
      const bruteCheck = await checkPinBruteForce(env, clientIp);
      if (bruteCheck.locked) {
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
              return new Response('Redirecting to dashboard...', {
                status: 302,
                headers: {
                  Location: url.pathname + (orderIdParam ? `?order=${encodeURIComponent(orderIdParam)}` : ''),
                  'Set-Cookie': `admin_session=${sessionToken}; Path=/; Max-Age=604800; SameSite=Lax; Secure; HttpOnly`,
                  ...CORS_HEADERS,
                },
              });
            } else {
              isPinWrong = true;
              await recordFailedPinAttempt(env, clientIp);
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

      const basePath = url.pathname;

      // Handle order actions (Confirm, Cancel, Reset Status, Delete, Delete All)
      const action = url.searchParams.get('action') || '';
      const targetOrderId = url.searchParams.get('orderId') || '';

      if (isAuthorized && action && env.techno_products_kv) {
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
            headers: { Location: basePath, ...responseHeaders },
          });
        }

        if (action === 'approve_loyalty') {
          const targetPhone = url.searchParams.get('phone') || '';
          if (targetPhone) {
            const rawReqs = await env.techno_products_kv.get('loyalty_requests');
            const reqs = rawReqs ? JSON.parse(rawReqs) : [];
            const idx = reqs.findIndex((r: any) => r.customerPhone === targetPhone);
            if (idx >= 0) {
              reqs[idx].status = 'approved_pending_pin';
              reqs[idx].approvedAt = new Date().toISOString();
              await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            }
            return new Response(null, {
              status: 302,
              headers: { Location: basePath, ...responseHeaders },
            });
          }
        }

        if (action === 'delete' && targetOrderId) {
          await env.techno_products_kv.delete(`order:${targetOrderId}`);
          ordersList = ordersList.filter((o: any) => o.orderId !== targetOrderId);
          await env.techno_products_kv.put('orders', await encryptCustomerData(env, ordersList));
          return new Response(null, {
            status: 302,
            headers: { Location: basePath, ...responseHeaders },
          });
        }

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
            headers: { Location: basePath, ...responseHeaders },
          });
        }

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
            headers: { Location: basePath, ...responseHeaders },
          });
        }

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
            headers: { Location: basePath, ...responseHeaders },
          });
        }
      }

      if (!isAuthorized) {
        // Unauthorized: Security Lock Gate (Protected with PBKDF2 Hashing)
        const gateHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>بوابة إدارة الطلبات — متجر تكنو الأغواط</title>
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
    .btn:hover { background: #B81D46; }
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
    input[type="password"]:focus { border-color: #B81D46; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px; margin-bottom: 12px;">🔐</div>
    <h2 style="font-size: 19px; color: #1E293B; margin-bottom: 8px; font-weight: bold;">
      بوابة إدارة الطلبات
    </h2>
    <p style="font-size: 13.5px; color: #64748B; line-height: 1.6; margin-bottom: 20px;">
      مخصصة لإدارة متجر تكنو الأغواط فقط لمتابعة وتأكيد طلبات الزبائن. أدخل رمز الأمان (PIN) للمتابعة:
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
      🛡️ البوابة محمية بنظام تشفير PBKDF2 و حظر المحاولات المتكررة
    </div>
  </div>
</body>
</html>`;
        return new Response(gateHtml, { headers: responseHeaders });
      }

      // Helper function to render a human-friendly order card
      const renderOrderCard = (order: any, isSingle = false) => {
        const rawPhone = order.customer?.phone || '';
        const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
        const dm = order.customer?.deliveryMethod || 'home';
        const deliveryMethod =
          dm === 'pickup' || dm === 'store_pickup'
            ? 'استلام من المحل (وسط المدينة)'
            : dm === 'stop_desk'
            ? 'مكتب التوصيل Stop Desk (ZR Express)'
            : 'توصيل للمنزل À Domicile (ZR Express)';
        const wilaya = order.customer?.wilaya || 'الأغواط';
        const commune = order.customer?.commune || '';
        const status = order.status || 'pending';

        const statusBadge =
          status === 'confirmed'
            ? `<span class="badge badge-confirmed">✅ تم استلام وتأكيد الطلب</span>`
            : status === 'cancelled'
            ? `<span class="badge badge-cancelled">❌ تم إلغاء الطلب</span>`
            : `<span class="badge badge-pending">⏳ تم استلام الطلب وهو تحت المعالجة</span>`;

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
                <span class="info-label">👤 الزبون:</span>
                <span class="info-val"><b>${escapeHtml(order.customer?.fullName || '')}</b></span>
              </div>
              <div class="info-line">
                <span class="info-label">🚚 الاستلام:</span>
                <span class="info-val">${escapeHtml(deliveryMethod)} — <b>${escapeHtml(wilaya)}</b>${commune ? ` (${escapeHtml(commune)})` : ''}</span>
              </div>
              ${
                order.customer?.address
                  ? `<div class="info-line">
                      <span class="info-label">🏠 العنوان:</span>
                      <span class="info-val">${escapeHtml(order.customer.address)}</span>
                    </div>`
                  : ''
              }
              ${
                order.customer?.notes
                  ? `<div class="info-line">
                      <span class="info-label">📝 ملاحظات:</span>
                      <span class="info-val"><i>${escapeHtml(order.customer.notes)}</i></span>
                    </div>`
                  : ''
              }
            </div>

            ${
              cleanPhone
                ? `<a href="tel:${cleanPhone}" class="btn-call">
                    📞 اتصال مباشر بالزبون (${escapeHtml(rawPhone)})
                  </a>`
                : ''
            }

            <div class="items-list">
              <div class="items-title">📦 المنتجات (${order.items?.length || 1}):</div>
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
              <span class="total-highlight">المبلغ المطلوب: ${Number(order.totals?.totalDzd || 0).toLocaleString()} د.ج</span>
            </div>

            <div class="card-actions">
              ${
                status !== 'confirmed'
                  ? `<a href="${basePath}?action=confirm&orderId=${encodeURIComponent(order.orderId)}" class="btn-action btn-confirm">
                      ✅ تأكيد الطلب
                    </a>`
                  : `<a href="${basePath}?action=reset_status&orderId=${encodeURIComponent(order.orderId)}" class="btn-action btn-neutral">
                      🔄 إعادة لقيد المعالجة
                    </a>`
              }
              ${
                status !== 'cancelled'
                  ? `<a href="${basePath}?action=cancel&orderId=${encodeURIComponent(order.orderId)}" class="btn-action btn-cancel">
                      ❌ إلغاء الطلب
                    </a>`
                  : ''
              }
              <a href="${basePath}?action=delete&orderId=${encodeURIComponent(order.orderId)}" onclick="return confirm('هل تريد حذف هذا الطلب نهائياً؟')" class="btn-action btn-delete">
                🗑️ حذف
              </a>
              ${!isSingle ? `<a href="${basePath}?order=${encodeURIComponent(order.orderId)}" class="btn-action btn-link">صفحة مستقلة »</a>` : ''}
            </div>
          </div>
        </div>`;
      };

      // Authorized View
      let mainContent = '';

      if (orderIdParam) {
        // Single Order View
        const order = singleOrder || ordersList.find((o: any) => o.orderId === orderIdParam);
        if (!order) {
          mainContent = `
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
              <h3 style="color: #1E293B; font-size: 16px; margin-bottom: 8px;">الطلب غير موجود</h3>
              <p style="color: #64748B; font-size: 13px; margin-bottom: 16px;">
                لم يتم العثور على طلب برقم: <code>#${escapeHtml(orderIdParam)}</code>
              </p>
              <a href="${basePath}" class="btn-action btn-neutral" style="display: inline-block;">
                📋 العودة لجميع الطلبات (${ordersList.length})
              </a>
            </div>`;
        } else {
          mainContent = `
            <div>
              <div style="margin-bottom: 14px;">
                <a href="${basePath}" style="font-size: 13px; color: #475569; text-decoration: none; font-weight: 600;">
                  « العودة لقائمة جميع الطلبات (${ordersList.length})
                </a>
              </div>
              ${renderOrderCard(order, true)}
            </div>`;
        }
      } else {
        // All Orders View
        if (ordersList.length === 0) {
          mainContent = `
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 48px 20px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 12px;">📭</div>
              <h3 style="color: #1E293B; font-size: 17px; font-weight: bold; margin-bottom: 6px;">لا توجد أي طلبات حالياً</h3>
              <p style="color: #64748B; font-size: 13.5px; max-width: 380px; margin: 0 auto; line-height: 1.6;">
                عندما يؤكد أي زبون طلبه من المتجر، سيظهر هنا فوراً مع إمكانية تأكيد الطلب، الاتصال به مباشرة، وتتبع حالته.
              </p>
            </div>`;
        } else {
          mainContent = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${ordersList.map((order: any) => renderOrderCard(order, false)).join('')}
            </div>`;
        }
      }

      // Render Loyalty Card Requests Block (if any exist)
      let loyaltyHtml = '';
      if (env.techno_products_kv) {
        try {
          const rawReqs = await env.techno_products_kv.get('loyalty_requests');
          const reqs = rawReqs ? JSON.parse(rawReqs) : [];
          if (Array.isArray(reqs) && reqs.length > 0) {
            loyaltyHtml = `
            <div style="background:#FFFFFF; border-radius:18px; border:1px solid #E2E8F0; padding:18px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h2 style="font-size:15px; font-weight:700; color:#0F172A;">طلبات بطاقات الوفاء VIP (${reqs.length})</h2>
                <span style="font-size:11.5px; color:#64748B;">اعتماد وتفعيل بطاقات الزبائن</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${reqs.map((r: any) => `
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:12px 14px; background:#F8FAFC; border-radius:12px; border:1px solid #E2E8F0; font-size:13px;">
                    <div>
                      <span style="font-weight:700; color:#0F172A;">${escapeHtml(r.customerName)}</span> · 
                      <span style="font-family:monospace; color:#334155;">${escapeHtml(r.customerPhone)}</span>
                      <div style="display:flex; align-items:center; gap:8px; margin-top:4px; font-size:11px;">
                        ${r.hasPurchased
                          ? `<span style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; padding:2px 8px; border-radius:6px; font-weight:700;">اشترى سابقاً (${r.ordersCount || 1} طلبات)</span>`
                          : `<span style="background:#F1F5F9; color:#64748B; border:1px solid #CBD5E1; padding:2px 8px; border-radius:6px;">زبون جديد</span>`
                        }
                        <span style="color:#64748B;">الحالة: ${r.status === 'approved_pending_pin' || r.status === 'active' ? '<b style="color:#047857;">معتمدة (بانتظار PIN)</b>' : '<b style="color:#B45309;">قيد الانتظار</b>'}</span>
                      </div>
                    </div>
                    <div>
                      ${r.status === 'pending'
                        ? `<a href="${basePath}?action=approve_loyalty&phone=${encodeURIComponent(r.customerPhone)}" class="btn-action btn-confirm" style="font-size:12px; padding:6px 14px;">تفعيل البطاقة</a>`
                        : `<span style="color:#047857; font-weight:700; font-size:12px;">تم التفعيل</span>`
                      }
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            `;
          }
        } catch {}
      }

      const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلبات متجر تكنو الأغواط</title>
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
      max-width: 620px;
      margin: 0 auto;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      padding: 16px 20px;
      border-radius: 18px;
      border: 1px solid #E2E8F0;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .top-title {
      font-size: 17px;
      font-weight: 700;
      color: #0F172A;
    }
    .top-subtitle {
      font-size: 12px;
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
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      transition: background 0.2s;
    }
    .btn-delete-all:hover { background: #FECACA; }
    .btn-logout {
      background: #F1F5F9;
      color: #475569 !important;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
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
      color: #B81D46;
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
        <h1 class="top-title">📋 إدارة طلبات متجر تكنو الأغواط</h1>
        <div class="top-subtitle">الطلبات المسجلة: <b>${ordersList.length}</b> طلب</div>
      </div>
      <div class="top-actions">
        ${
          ordersList.length > 0
            ? `<a href="${basePath}?action=delete_all" onclick="return confirm('⚠️ هل أنت متأكد من حذف جميع الطلبات (${ordersList.length})؟ لا يمكن استرجاعها بعد الحذف.')" class="btn-delete-all">
                🗑️ حذف كل الطلبات
              </a>`
            : ''
        }
        <a href="${basePath}?logout=1" class="btn-logout">🚪 خروج</a>
      </div>
    </div>

    ${loyaltyHtml}
    ${mainContent}
  </div>
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
        const customerName = (body.customerName || '').trim();
        const customerPhone = (body.customerPhone || '').trim();
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
            customerName,
            customerPhone,
            hasPurchased,
            ordersCount,
            totalSpent,
            cardNumber,
            status: 'pending',
            requestedAt: new Date().toISOString(),
          };
          if (existingIdx >= 0) {
            reqs[existingIdx] = newReq;
          } else {
            reqs.unshift(newReq);
          }
          await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));

          // Telegram Alert
          const purchaseText = hasPurchased
            ? `اشترى سابقاً (${ordersCount} طلبات - بمجموع ${totalSpent.toLocaleString('ar-DZ')} دج)`
            : 'زبون جديد (لم يسجل طلبيات سابقة في المتجر)';
          const msg = `طلب جديد لإصدار بطاقة وفاء VIP — فرع الأغواط 03\n\n• الاسم: ${customerName}\n• الهاتف: ${customerPhone}\n• سجل الشراء: ${purchaseText}\n• رقم البطاقة: ${cardNumber}\n• الحالة: قيد الانتظار\n\nلوحة التحكم للاعتماد: https://techno-laghouat-backend.hotel-saharien.workers.dev/admin/orders`;

          const botTokens = Array.from(new Set([env.ORDERS_BOT_TOKEN || DEFAULT_ORDERS_BOT_TOKEN, env.BOT_TOKEN || DEFAULT_BOT_TOKEN].filter(Boolean)));
          for (const token of botTokens) {
            try {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: env.ADMIN_CHAT_ID || DEFAULT_ADMIN_CHAT_ID,
                  text: msg,
                }),
              });
            } catch {}
          }
        }

        return jsonResponse({ success: true, status: 'pending', hasPurchased, ordersCount, totalSpent });
      } catch (err: any) {
        return jsonResponse({ error: err?.message || 'Failed to process loyalty request' }, 500);
      }
    }

    // 9a-loyalty. GET /api/loyalty/status
    if (url.pathname === '/api/loyalty/status' && request.method === 'GET') {
      const phone = (url.searchParams.get('phone') || '').trim();
      if (!phone || !env.techno_products_kv) {
        return jsonResponse({ exists: false });
      }
      const rawReqs = await env.techno_products_kv.get('loyalty_requests');
      const reqs = rawReqs ? JSON.parse(rawReqs) : [];
      const item = reqs.find((r: any) => r.customerPhone === phone);
      if (!item) return jsonResponse({ exists: false });
      return jsonResponse({ exists: true, request: item });
    }

    // 9a-loyalty. POST /api/loyalty/approve
    if (url.pathname === '/api/loyalty/approve' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const phone = (body.phone || '').trim();
        if (phone && env.techno_products_kv) {
          const rawReqs = await env.techno_products_kv.get('loyalty_requests');
          const reqs = rawReqs ? JSON.parse(rawReqs) : [];
          const idx = reqs.findIndex((r: any) => r.customerPhone === phone);
          if (idx >= 0) {
            reqs[idx].status = 'approved_pending_pin';
            reqs[idx].approvedAt = new Date().toISOString();
            await env.techno_products_kv.put('loyalty_requests', JSON.stringify(reqs));
            return jsonResponse({ success: true, status: 'approved_pending_pin' });
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
    ...(variants.length > 0 ? { variants } : {}),
    alt: `${draft.name || 'منتج'} — رقم المنتج ${newSku}`,
    summary: draft.description || 'منتج أصلي معتمد متوفر في فرع تكنو الأغواط.',
    description: draft.description || 'منتج أصلي معتمد متوفر في فرع تكنو الأغواط.',
    availabilityText: 'متوفر في فرع الأغواط',
    featuredRank: 1,
    siblingIds: [],
    specs: [
      { label: 'رقم المنتج', value: newSku },
      { label: 'القسم', value: catObj.name },
      ...(variants.length > 0
        ? [
            {
              label: 'القياسات المتوفرة',
              value: variants.map((v) => `${v.label} (${v.priceDzd.toLocaleString()} د.ج)`).join(' · '),
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
      ? `\n📏 <b>القياسات والأسعار:</b>\n` +
        variants.map((v) => `   • ${escapeHtml(v.label)}: <b>${v.priceDzd.toLocaleString()} د.ج</b>`).join('\n')
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

  const text =
    `📸 <b>الخطوة 6 من 6 — عدد صور المنتج</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
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
): Promise<void> {
  // A. Callback Queries (Inline button clicks)
  if (update.callback_query) {
    const cq = update.callback_query;
    const data = cq.data as string;
    const chatId = cq.message?.chat?.id;
    const messageId = cq.message?.message_id;

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
    } else if (data === 'wiz:num_auto') {
      const session = await getSession(env, chatId);
      if (session) {
        const products = await getProducts(env);
        const autoNum = await getNextNumericId(env, products);
        session.draft.productNumber = autoNum;
        await setSession(env, chatId, {
          step: 'prod_pricing_mode',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `✅ تم تعيين رقم المنتج تلقائياً: <code>${autoNum}</code>\n\n` +
            `💰 <b>الخطوة 4 من 6 — نوع التسعير والقياسات</b>\n` +
            `هل لهذا المنتج سعر واحد أم عدة قياسات بأسعار مختلفة (مثل: صغير، متوسط، كبير)؟`,
          [
            [{ text: '💰 سعر واحد فقط', callback_data: 'wiz:price_single' }],
            [{ text: '📏 عدة قياسات بأسعار مختلفة', callback_data: 'wiz:price_variants' }],
            [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
          ],
        );
      }
    } else if (data === 'wiz:price_single') {
      const session = await getSession(env, chatId);
      if (session) {
        await setSession(env, chatId, {
          step: 'prod_single_price',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `💰 <b>أدخل سعر المنتج بالدينار الجزائري</b> (أرقام فقط، مثال: <code>2500</code>):`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
      }
    } else if (data === 'wiz:price_variants') {
      const session = await getSession(env, chatId);
      if (session) {
        await setSession(env, chatId, {
          step: 'prod_variants',
          draft: { ...session.draft, variants: session.draft.variants || [] },
          updatedAt: Date.now(),
        });
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `📏 <b>إضافة القياسات وأسعارها</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `أرسل كل قياس وسعره في سطر (يمكنك إرسالها كلها في رسالة واحدة أو قياساً تلو الآخر):\n\n` +
            `<i>مثال:</i>\n` +
            `<code>صغير : 1800\nمتوسط : 2500\nكبير : 3400</code>`,
          [[{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }]],
        );
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
        await sendOrEditMessage(
          botToken,
          chatId,
          messageId,
          `📸 <b>ممتاز! سيتم إضافة ${count} ${count === 1 ? 'صورة' : 'صور'} لهذا المنتج</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `أرسل الآن <b>الصورة 1 من ${count}</b> (يمكنك إرسالها واحدة تلو الأخرى أو معاً):`,
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
      const bestPhoto = msg.photo[msg.photo.length - 1];
      const imageUrl = await downloadTelegramPhoto(env, botToken, bestPhoto.file_id, origin);

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
          await callTelegram(botToken, 'sendMessage', {
            chat_id: chatId,
            text:
              `✅ <b>تم استلام الصورة ${nextImages.length} من ${targetCount}</b>\n` +
              `أرسل الآن <b>الصورة ${nextImages.length + 1} من ${targetCount}</b>:`,
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
            `✅ اسم الباقة: <b>${escapeHtml(draft.name)}</b>\n\n` +
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
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
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
          step: 'prod_number',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ اسم المنتج: <b>${escapeHtml(text)}</b>\n\n` +
            `🔢 <b>الخطوة 3 من 6 — رقم المنتج</b>\n` +
            `أدخل <b>رقم المنتج</b> الذي ستنتهي به صفحته (مثال: <code>71645</code> أو <code>105</code>)\n` +
            `أو اضغط على زر التوليد التلقائي:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔢 توليد رقم تلقائي', callback_data: 'wiz:num_auto' }],
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
              inline_keyboard: [[{ text: '🔢 توليد رقم تلقائي', callback_data: 'wiz:num_auto' }]],
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
              inline_keyboard: [[{ text: '🔢 توليد رقم تلقائي', callback_data: 'wiz:num_auto' }]],
            },
          });
          return;
        }
        session.draft.productNumber = cleanNum;
        await setSession(env, chatId, {
          step: 'prod_pricing_mode',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ رقم المنتج: <code>${cleanNum}</code> (ستنتهي الصفحة بـ <code>/p/${cleanNum}</code>)\n\n` +
            `💰 <b>الخطوة 4 من 6 — نوع التسعير والقياسات</b>\n` +
            `هل لهذا المنتج سعر واحد أم عدة قياسات بأسعار مختلفة (مثل: صغير، متوسط، كبير)؟`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💰 سعر واحد فقط', callback_data: 'wiz:price_single' }],
              [{ text: '📏 عدة قياسات بأسعار مختلفة', callback_data: 'wiz:price_variants' }],
              [{ text: '❌ إلغاء', callback_data: 'wiz:cancel' }],
            ],
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
          step: 'prod_description',
          draft: session.draft,
          updatedAt: Date.now(),
        });
        await callTelegram(botToken, 'sendMessage', {
          chat_id: chatId,
          text:
            `✅ السعر: <b>${price.toLocaleString()} د.ج</b>\n\n` +
            `✍️ <b>الخطوة 5 من 6 — وصف المنتج (اختياري)</b>\n` +
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
    const bestPhoto = msg.photo[msg.photo.length - 1];
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
      ...(details.variants.length > 0 ? { variants: details.variants } : {}),
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
      ...(details.variants.length > 0 ? { variants: details.variants } : {}),
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
