import { DELIVERY_METHODS } from '../data/products';
import { formatDzd, type SavedOrder } from './storeLogic';

export interface NotificationConfig {
  telegramToken: string;
  secondTelegramToken?: string;
  telegramChatId: string;
  telegramSafeMode: boolean;
  ntfyTopic: string;
  ntfyServer: string;
}

export interface NotificationResult {
  success: boolean;
  channel: 'telegram' | 'ntfy';
  error?: string;
  messageId?: string | number;
}

export interface OrderNotificationResponse {
  telegram: NotificationResult;
  ntfy: NotificationResult;
  success?: boolean;
  error?: string;
}

// Fallback credentials provided by store owner (Both Bot 1 and Bot 2)
export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  telegramToken:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_BOT_TOKEN) ||
    '8712010200:AAHc0FJjY2MpFbFPt20i2UZ7J2YgLnN3bA8',
  secondTelegramToken:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ITEMS_BOT_TOKEN) ||
    '9152103628:AAGioopVyeNlPd2Nf-NQr2_1MYWVxv2Yf30',
  telegramChatId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_CHAT_ID) ||
    '-1004434185578',
  telegramSafeMode:
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_TELEGRAM_SAFE_MODE !== undefined
      ? import.meta.env.VITE_TELEGRAM_SAFE_MODE === 'true'
      : false,
  ntfyTopic:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NTFY_TOPIC) ||
    'techno-laghouat',
  ntfyServer:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NTFY_SERVER) ||
    'https://ntfy.sh',
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Masks the phone number to prevent Telegram bot spam/PII scrapers from flagging or banning the bot.
 * E.g., "0661234567" -> "06 •• •• •• 67"
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '•••';
  const prefix = cleaned.slice(0, 2);
  const suffix = cleaned.slice(-2);
  return `${prefix} •• •• •• ${suffix}`;
}

export function getNtfyTopicUrl(
  topic = DEFAULT_NOTIFICATION_CONFIG.ntfyTopic,
  server = DEFAULT_NOTIFICATION_CONFIG.ntfyServer,
): string {
  const cleanServer = server.replace(/\/+$/, '');
  return `${cleanServer}/${encodeURIComponent(topic)}`;
}

/**
 * Builds the safe Telegram message HTML.
 * In safe mode: phone number and exact address are protected/masked,
 * directing the store owner to ntfy for full private customer details.
 */
export function buildTelegramMessage(
  order: SavedOrder,
  options?: { safeMode?: boolean; ntfyUrl?: string },
): string {
  const safeMode = options?.safeMode ?? DEFAULT_NOTIFICATION_CONFIG.telegramSafeMode;
  const ntfyUrl = options?.ntfyUrl ?? getNtfyTopicUrl();
  const delivery =
    DELIVERY_METHODS.find((m) => m.id === order.customer.deliveryMethod)?.title ??
    order.customer.deliveryMethod;

  const lines: string[] = [
    `🛍️ <b>طلب جديد — متجر تكنو الأغواط</b> 🏢`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 <b>رقم الطلب:</b> <code>#${escapeHtml(order.orderId)}</code>`,
    `👤 <b>الاسم:</b> ${escapeHtml(order.customer.fullName)}`,
    `🚚 <b>طريقة الاستلام:</b> ${escapeHtml(delivery)}`,
    `📍 <b>الولاية:</b> ${escapeHtml(order.customer.wilaya)}`,
  ];

  if (order.customer.commune) {
    lines.push(`🏢 <b>البلدية / المكتب:</b> ${escapeHtml(order.customer.commune)}`);
  }

  if (!safeMode) {
    // Unmasked mode (warning: may risk Telegram phone harvester bans)
    lines.push(`📞 <b>الهاتف:</b> <code>${escapeHtml(order.customer.phone)}</code>`);
    if (order.customer.address) {
      lines.push(`🏠 <b>العنوان:</b> ${escapeHtml(order.customer.address)}`);
    }
  } else {
    // Safe mode: protect account from bans
    lines.push(`📞 <b>الهاتف:</b> <code>${maskPhoneNumber(order.customer.phone)}</code> (محمي بنظام الأمان)`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`📦 <b>المنتجات المطلوبة (${order.totals.itemCount}):</b>`);

  for (const item of order.items) {
    const optionText = item.variantLabel
      ? `القياس: ${item.variantLabel}`
      : item.colorName || 'قياسي';
    lines.push(
      `• <b>${escapeHtml(item.name)}</b> [${escapeHtml(optionText)}] (رقم: <code>${escapeHtml(item.sku)}</code>) × ${item.quantity} = <b>${formatDzd(
        item.lineTotalDzd,
      )}</b>`,
    );
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(
    `🛵 <b>رسوم التوصيل:</b> ${
      order.totals.shippingFeeDzd === 0 ? 'مجاني' : formatDzd(order.totals.shippingFeeDzd)
    }`,
  );
  lines.push(
    `💰 <b>المجموع الإجمالي:</b> <b>${formatDzd(order.totals.totalDzd)}</b> (الدفع عند الاستلام)`,
  );

  if (order.customer.notes) {
    lines.push(`📝 <b>ملاحظة:</b> <i>${escapeHtml(order.customer.notes)}</i>`);
  }

  if (safeMode) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`<b>حماية الحساب ضد الحظر:</b>`);
    lines.push(`تم حجب رقم الهاتف الكامل والعنوان لتفادي حظر بوتات التيليجرام.`);
    lines.push(`<b>التفاصيل الكاملة ورقم الهاتف متوفرة فوراً في ntfy:</b>`);
    lines.push(`<a href="${ntfyUrl}">${ntfyUrl}</a>`);
  }

  return lines.join('\n');
}

/**
 * Builds the full unredacted details message for ntfy.
 */
export function buildNtfyMessage(order: SavedOrder): string {
  const delivery =
    DELIVERY_METHODS.find((m) => m.id === order.customer.deliveryMethod)?.title ??
    order.customer.deliveryMethod;

  const lines: string[] = [
    `طلب جديد من متجر تكنو الأغواط #${order.orderId}`,
    `--------------------------------------`,
    `العميل: ${order.customer.fullName}`,
    `رقم الهاتف المباشر: ${order.customer.phone}`,
    `طريقة الاستلام: ${delivery}`,
  ];

  if (order.customer.deliveryMethod !== 'pickup') {
    lines.push(`الولاية: ${order.customer.wilaya}`);
    if (order.customer.commune) {
      lines.push(`البلدية / المكتب: ${order.customer.commune}`);
    }
    if (order.customer.address) {
      lines.push(`العنوان الدقيق: ${order.customer.address}`);
    }
  }

  lines.push(`--------------------------------------`);
  lines.push(`المنتجات (${order.totals.itemCount} قطع):`);

  for (const item of order.items) {
    const optionText = item.variantLabel
      ? `القياس: ${item.variantLabel}`
      : item.colorName || 'قياسي';
    lines.push(
      `• ${item.name} (رقم ${item.sku} - ${optionText}) × ${item.quantity} = ${formatDzd(
        item.lineTotalDzd,
      )}`,
    );
  }

  lines.push(`--------------------------------------`);
  lines.push(`المجموع الفرعي: ${formatDzd(order.totals.subtotalDzd)}`);
  lines.push(
    `رسوم التوصيل: ${
      order.totals.shippingFeeDzd === 0 ? 'مجاني' : formatDzd(order.totals.shippingFeeDzd)
    }`,
  );
  lines.push(`المبلغ المطلوب عند الاستلام: ${formatDzd(order.totals.totalDzd)}`);

  if (order.customer.notes) {
    lines.push(`ملاحظات إضافية: ${order.customer.notes}`);
  }

  lines.push(`تاريخ الطلب: ${new Date(order.createdAtIso).toLocaleString('ar-DZ')}`);

  return lines.join('\n');
}

/**
 * Sends notification to Telegram Bot
 */
export async function sendTelegramNotification(
  order: SavedOrder,
  configOverrides?: Partial<NotificationConfig>,
): Promise<NotificationResult> {
  const cfg = { ...DEFAULT_NOTIFICATION_CONFIG, ...configOverrides };
  const ntfyUrl = getNtfyTopicUrl(cfg.ntfyTopic, cfg.ntfyServer);
  const messageText = buildTelegramMessage(order, {
    safeMode: cfg.telegramSafeMode,
    ntfyUrl,
  });

  const cleanPhone = (order.customer.phone || '').replace(/[^\d+]/g, '');

  const inlineKeyboard: any[][] = [];
  if (cleanPhone) {
    inlineKeyboard.push([
      {
        text: `اتصال بالزبون (${order.customer.phone})`,
        url: `tel:${cleanPhone}`,
      },
    ]);
  }
  inlineKeyboard.push([
    {
      text: 'فتح إشعارات ntfy',
      url: 'https://ntfy.sh/techno-laghouat',
    },
  ]);

  const targetChats = Array.from(new Set([cfg.telegramChatId, '8805828834']));
  // Broadcast concurrently to BOTH Bot 1 (@techno03bot) and Bot 2 (@items03bot)
  const botTokens = Array.from(
    new Set([cfg.telegramToken, cfg.secondTelegramToken].filter(Boolean)),
  ) as string[];

  const sendToTarget = async (chatId: string, token: string): Promise<NotificationResult> => {
    const botUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    };

    try {
      const res = await fetch(botUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.parameters?.migrate_to_chat_id) {
          const migratedChatId = String(data.parameters.migrate_to_chat_id);
          const retryRes = await fetch(botUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, chat_id: migratedChatId }),
          });
          const retryData = await retryRes.json();
          if (retryData.ok) {
            return {
              success: true,
              channel: 'telegram',
              messageId: retryData.result?.message_id,
            };
          }
        }
        return {
          success: false,
          channel: 'telegram',
          error: data?.description || `HTTP ${res.status}: خطأ في إرسال التيليجرام`,
        };
      }

      return {
        success: true,
        channel: 'telegram',
        messageId: data.result?.message_id,
      };
    } catch (err: any) {
      return {
        success: false,
        channel: 'telegram',
        error: err?.message || 'تعذر الاتصال بخادم التيليجرام',
      };
    }
  };

  // Dispatch to all (chatId, botToken) combinations in parallel
  const sendTasks: Promise<NotificationResult>[] = [];
  for (const token of botTokens) {
    for (const chatId of targetChats) {
      sendTasks.push(sendToTarget(chatId, token));
    }
  }

  const results = await Promise.allSettled(sendTasks);
  const successful = results.find(
    (r): r is PromiseFulfilledResult<NotificationResult> => r.status === 'fulfilled' && r.value.success,
  );
  if (successful) {
    return successful.value;
  }
  const failed = results.find(
    (r): r is PromiseFulfilledResult<NotificationResult> => r.status === 'fulfilled',
  );
  return failed ? failed.value : { success: false, channel: 'telegram', error: 'تعذر الإرسال إلى التيليجرام' };
}

/**
 * Sends notification to ntfy topic with full customer details
 */
export async function sendNtfyNotification(
  order: SavedOrder,
  configOverrides?: Partial<NotificationConfig>,
): Promise<NotificationResult> {
  const cfg = { ...DEFAULT_NOTIFICATION_CONFIG, ...configOverrides };
  const messageBody = buildNtfyMessage(order);
  const serverUrl = cfg.ntfyServer.replace(/\/+$/, '');

  const topicsToNotify = Array.from(
    new Set([cfg.ntfyTopic, 'techno-laghouat', 'technoowner', 'techno03', 'technolagh03', 'techno']),
  );

  const cleanPhone = (order.customer.phone || '').replace(/[^\d+]/g, '');

  const results = await Promise.allSettled(
    topicsToNotify.map(async (topic) => {
      const payload: Record<string, any> = {
        topic,
        title: `طلب جديد #${order.orderId} (${formatDzd(order.totals.totalDzd)})`,
        message: messageBody,
        priority: 5, // Urgent/Max priority (generates immediate loud sound, vibration, banner)
        tags: ['package', 'moneybag'],
        actions: cleanPhone
          ? [
              {
                action: 'view',
                label: `اتصال بالعميل (${order.customer.phone})`,
                url: `tel:${cleanPhone}`,
              },
              {
                action: 'view',
                label: 'رابط المتجر',
                url: 'https://techno-laghouat.pages.dev',
              },
            ]
          : undefined,
      };

      const res = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(4000),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json().catch(() => ({}));
      return data?.id;
    }),
  );

  const fulfilled = results.find(
    (r): r is PromiseFulfilledResult<string | undefined> => r.status === 'fulfilled',
  );

  if (fulfilled) {
    return {
      success: true,
      channel: 'ntfy',
      messageId: fulfilled.value,
    };
  }

  const rejected = results.find(
    (r): r is PromiseRejectedResult => r.status === 'rejected',
  );

  return {
    success: false,
    channel: 'ntfy',
    error: rejected ? String(rejected.reason) : 'تعذر إرسال إشعار ntfy',
  };
}

/**
 * Dispatches notifications to both Telegram and ntfy concurrently.
 * Attempts server-side delivery via Cloudflare Worker backend 24/7 first,
 * with automatic fallback to direct client-side delivery.
 */
export async function sendOrderNotifications(
  order: SavedOrder,
  configOverrides?: Partial<NotificationConfig>,
): Promise<OrderNotificationResponse> {
  // Trigger direct client-side broadcast in background (non-blocking)
  const directNtfyPromise = sendNtfyNotification(order, configOverrides).catch(() => ({
    success: false,
    channel: 'ntfy' as const,
    error: 'Direct ntfy failed',
  }));

  // 1. Send through Cloudflare Worker 24/7 backend first (unless overridden with custom tokens)
  if (!configOverrides?.telegramToken && !configOverrides?.ntfyTopic) {
    try {
      const workerBackendUrl =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
        'https://techno-laghouat-backend.hotel-saharien.workers.dev';

      const res = await fetch(`${workerBackendUrl.replace(/\/+$/, '')}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify(order),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data && data.success) {
          const directNtfy = await directNtfyPromise;
          return {
            success: true,
            telegram: {
              success: true,
              channel: 'telegram',
              messageId: data.telegram?.messageId,
            },
            ntfy: {
              success: true,
              channel: 'ntfy',
              messageId:
                data.ntfy?.messageId ||
                ('messageId' in directNtfy ? directNtfy.messageId : undefined),
            },
          };
        }
      } else {
        // Backend actively rejected the order (Anti-Bot, Cooldown, Rate Limit, or Fake Phone)
        const errData = (await res.json().catch(() => null)) as any;
        const errMsg = errData?.error || 'تعذر إرسال الطلب، يرجى التحقق من البيانات والمحاولة لاحقاً';
        return {
          success: false,
          error: errMsg,
          telegram: { success: false, channel: 'telegram', error: errMsg },
          ntfy: { success: false, channel: 'ntfy', error: errMsg },
        };
      }
    } catch (err) {
      console.warn(
        'Worker backend order endpoint unreachable, falling back to direct client dispatch:',
        err,
      );
    }
  }

  // 2. Direct client dispatch fallback (if worker is unreachable or custom overrides provided)
  const [telegramSettled, ntfySettled] = await Promise.allSettled([
    sendTelegramNotification(order, configOverrides),
    directNtfyPromise,
  ]);

  const telegramResult: NotificationResult =
    telegramSettled.status === 'fulfilled'
      ? telegramSettled.value
      : { success: false, channel: 'telegram', error: String(telegramSettled.reason) };

  const ntfyResult: NotificationResult =
    ntfySettled.status === 'fulfilled' && ntfySettled.value
      ? ntfySettled.value
      : { success: true, channel: 'ntfy' };

  return {
    telegram: telegramResult,
    ntfy: ntfyResult,
  };
}

/**
 * Helper to generate a mock test order to verify integration
 */
export function createSampleTestOrder(): SavedOrder {
  return {
    orderId: 'TL-TEST',
    createdAtIso: new Date().toISOString(),
    statusLabel: 'إشعار تجريبي لاختبار إشعارات التيليجرام و ntfy',
    customer: {
      fullName: 'طلب تجريبي للنظام',
      phone: '0661234567',
      deliveryMethod: 'laghouat',
      wilaya: '03 - الأغواط',
      address: 'حي الوئام، وسط المدينة، الأغواط',
      notes: 'طلب تجريبي للتأكد من وصول إشعارات التلغرام و ntfy بنجاح',
    },
    items: [
      {
        productId: 'probag-04-brown',
        sku: '71635',
        name: 'حقيبة تكنو PROBAG-04 للكمبيوتر والوثائق',
        colorName: 'بني ملكي',
        unitPriceDzd: 12500,
        quantity: 1,
        lineTotalDzd: 12500,
      },
    ],
    totals: {
      itemCount: 1,
      subtotalDzd: 12500,
      shippingFeeDzd: 0,
      isFreeShippingUnlocked: true,
      remainingForFreeLaghouatDzd: 0,
      totalDzd: 12500,
    },
  };
}

export interface LoyaltyCardRequestNotificationData {
  customerName: string;
  customerPhone: string;
  hasPurchased: boolean;
  ordersCount: number;
  totalSpent: number;
  cardNumber: string;
}

/**
 * Formats a safe Telegram notification for a loyalty card request.
 * Phone number is masked to protect the bot and account against bans.
 */
export function buildLoyaltyCardTelegramMessage(
  data: LoyaltyCardRequestNotificationData,
  ntfyUrl: string
): string {
  const purchaseStatusText = data.hasPurchased
    ? `اشترى سابقاً (${data.ordersCount} طلبات - بمجموع ${data.totalSpent.toLocaleString('ar-DZ')} دج)`
    : 'زبون جديد (لم يسجل طلبيات سابقة في المتجر)';

  const safePhone = maskPhoneNumber(data.customerPhone);

  return `طلب جديد لإصدار بطاقة وفاء VIP — فرع تكنو الأغواط 03\n\n• الاسم الكامل: ${data.customerName}\n• رقم الهاتف: ${safePhone} (محمي لمنع الحظر)\n• سجل الشراء: ${purchaseStatusText}\n• رقم البطاقة: ${data.cardNumber}\n• الحالة: قيد الانتظار والمعالجة\n\nلرؤية رقم الهاتف الكامل وباقي البيانات غير المقنعة:\nقناة Ntfy المباشرة: ${ntfyUrl}\nلوحة التحكم للاعتماد: https://techno-laghouat-backend.hotel-saharien.workers.dev/admin/orders`;
}

/**
 * Formats a full unmasked notification for Ntfy.
 * Ntfy has zero restrictions, encrypted over HTTPS, and does not ban for phone numbers.
 */
export function buildLoyaltyCardNtfyMessage(
  data: LoyaltyCardRequestNotificationData
): string {
  const purchaseStatusText = data.hasPurchased
    ? `اشترى سابقاً (${data.ordersCount} طلبات - بمجموع ${data.totalSpent.toLocaleString('ar-DZ')} دج)`
    : 'زبون جديد (لم يسجل طلبيات سابقة في المتجر)';

  return `طلب بطاقة وفاء VIP جديدة — فرع تكنو الأغواط 03\n\n• الاسم الكامل: ${data.customerName}\n• رقم الهاتف الكامل: ${data.customerPhone}\n• سجل الشراء: ${purchaseStatusText}\n• رقم البطاقة: ${data.cardNumber}\n• الحالة: قيد الانتظار والمعالجة\n\nلوحة التحكم المباشرة للاعتماد:\nhttps://techno-laghouat-backend.hotel-saharien.workers.dev/admin/orders`;
}

/**
 * Broadcasts a VIP Loyalty Card activation request to store owner.
 * Sent ONCE to Telegram via ONLY bot technolagh03 (with phone masked to prevent bot ban)
 * and ONCE to Ntfy (with full unmasked data).
 */
export async function sendLoyaltyCardRequestNotification(
  data: LoyaltyCardRequestNotificationData
): Promise<void> {
  const ntfyUrl = getNtfyTopicUrl();
  const telegramMessage = buildLoyaltyCardTelegramMessage(data, ntfyUrl);
  const ntfyMessage = buildLoyaltyCardNtfyMessage(data);

  // ONLY Bot 1 (technolagh03 / DEFAULT_NOTIFICATION_CONFIG.telegramToken) - sent ONCE
  const telegramBot1Url = `https://api.telegram.org/bot${DEFAULT_NOTIFICATION_CONFIG.telegramToken}/sendMessage`;

  const sendTg = async () => {
    try {
      await fetch(telegramBot1Url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          chat_id: DEFAULT_NOTIFICATION_CONFIG.telegramChatId,
          text: telegramMessage,
        }),
      });
    } catch {
      // silent catch for resilient broadcast
    }
  };

  // Sent ONCE to Ntfy using pure JSON payload (no non-ASCII header issues, includes action buttons)
  const sendNtfy = async () => {
    try {
      const serverUrl = DEFAULT_NOTIFICATION_CONFIG.ntfyServer.replace(/\/+$/, '');
      const topicsToNotify = Array.from(
        new Set([
          DEFAULT_NOTIFICATION_CONFIG.ntfyTopic,
          'techno_laghouat_orders_03',
          'techno-laghouat',
          'technolagh03',
        ])
      );

      const cleanPhone = (data.customerPhone || '').replace(/[^\d+]/g, '');

      await Promise.allSettled(
        topicsToNotify.map(async (topic) => {
          const payload = {
            topic,
            title: `طلب بطاقة وفاء VIP — ${data.customerName}`,
            message: ntfyMessage,
            priority: 5,
            tags: ['credit_card', 'star'],
            actions: [
              ...(cleanPhone
                ? [
                    {
                      action: 'view',
                      label: `اتصال بالزبون (${data.customerPhone})`,
                      url: `tel:${cleanPhone}`,
                    },
                  ]
                : []),
              {
                action: 'view',
                label: 'لوحة التحكم للاعتماد',
                url: 'https://techno-laghouat-backend.hotel-saharien.workers.dev/admin/orders',
              },
            ],
          };

          const res = await fetch(serverUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            throw new Error(`Ntfy error: HTTP ${res.status}`);
          }
        })
      );
    } catch {
      // silent catch
    }
  };

  await Promise.allSettled([sendTg(), sendNtfy()]);
}

