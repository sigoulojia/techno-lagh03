import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  Send,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import {
  DEFAULT_NOTIFICATION_CONFIG,
  createSampleTestOrder,
  getNtfyTopicUrl,
  sendOrderNotifications,
  type OrderNotificationResponse,
} from '../utils/notificationService';

interface AdminNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNotificationModal({ isOpen, onClose }: AdminNotificationModalProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<OrderNotificationResponse | null>(null);
  const ntfyUrl = getNtfyTopicUrl();

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const mockOrder = createSampleTestOrder();
      const res = await sendOrderNotifications(mockOrder);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        telegram: { success: false, channel: 'telegram', error: err?.message || 'فشل الاختبار' },
        ntfy: { success: false, channel: 'ntfy', error: err?.message || 'فشل الاختبار' },
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="admin-modal-title" className="font-display text-base font-bold">
                إشعارات الإدارة (Telegram & ntfy)
              </h2>
              <p className="text-xs text-stone-300">
                فرع تكنو الأغواط · نظام التنبيه الفوري للطلبات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Why ntfy + Telegram explanation */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>نظام الأمان المزدوج لحماية البوت من الحظر</span>
            </div>
            <p className="leading-relaxed">
              يقوم تيليجرام مؤخراً بحظر البوتات والحسابات التي ترسل أرقام الهواتف وبيانات الزبائن بشكل متكرر.
              لذلك تم تفعيل <b>ntfy</b> لإرسال كافة بيانات الزبون (الهاتف والعنوان الدقيق) بصوت واهتزاز فوريين، بينما يستقبل التيليجرام تنبيهاً آمناً مع زر مباشر لفتح تفاصيل الزبون.
            </p>
          </div>

          {/* Cloudflare Backend & Items Management Bot Card */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-[#18181B] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                بوت إدارة المنتجات (@items03bot)
              </span>
              <span className="text-xs font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                Cloudflare Worker
              </span>
            </div>
            <p className="text-xs text-[#52525B] leading-relaxed">
              مرتبط بالـ Backend السحابي في <b>Cloudflare</b> مع قاعدة بيانات <b>KV</b>. يمكنك من خلاله إضافة منتجات جديدة بصورها وأسعارها وحذفها مباشرة:
            </p>
            <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs space-y-1.5 text-stone-700">
              <p>➕ <b>لإضافة منتج:</b> أرسل صورة الحقيبة في المجموعة واكتب في الشرح (Caption):</p>
              <pre className="bg-stone-100 p-2 rounded text-[11px] font-mono text-stone-800 overflow-x-auto">
{`اسم: حقيبة لابتوب جلدية
سعر: 9500
لون: بني
سلسلة: classic`}
              </pre>
              <p>🗑️ <b>لحذف منتج:</b> اكتب أمر <code className="bg-stone-100 px-1 py-0.5 rounded">/list</code> أو <code className="bg-stone-100 px-1 py-0.5 rounded">/delete</code> واضغط زر الحذف.</p>
              <p>🔄 <b>لاستعادة الأصلي:</b> اكتب <code className="bg-stone-100 px-1 py-0.5 rounded">/reset</code> لاسترجاع المنتجات الافتراضية.</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://t.me/items03bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                <span>فتح بوت المنتجات في تيليجرام</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://techno-laghouat-backend.hotel-saharien.workers.dev/api/products"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 transition-colors"
              >
                <span>فحص API المنتجات (Cloudflare)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Telegram Status Card */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-[#18181B] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                بوت التيليجرام (@techno03bot)
              </span>
              <span className="text-xs font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-700">
                نشط
              </span>
            </div>
            <div className="text-xs text-[#52525B] space-y-1 font-mono">
              <p>Chat ID: {DEFAULT_NOTIFICATION_CONFIG.telegramChatId} (technoowner)</p>
              <p className="text-emerald-700 font-sans">
                ✓ وضع الأمان مفعل: حجب الهاتف في تيليجرام لحماية الحساب.
              </p>
            </div>
          </div>

          {/* ntfy Channel Card */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-[#18181B] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                قناة ntfy للإشعارات الكاملة
              </span>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                موصى به للهاتف
              </span>
            </div>
            <p className="text-xs text-[#52525B] leading-relaxed">
              تصلك من خلالها تفاصيل الطلب الكاملة (رقم هاتف العميل، العنوان، المنتجات، الملاحظات) مع رنين واهتزاز.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1 items-center">
              <a
                href={`ntfy://ntfy.sh/${DEFAULT_NOTIFICATION_CONFIG.ntfyTopic}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#E30613] text-white hover:bg-[#C4000F] transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>فتح القناة في تطبيق ntfy مباشرة</span>
              </a>
              <span className="text-xs text-[#71717A] font-mono">
                Topic: {DEFAULT_NOTIFICATION_CONFIG.ntfyTopic}
              </span>
            </div>
          </div>

          {/* Setup steps for phone */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#52525B] space-y-2">
            <p className="font-semibold text-[#18181B] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              كيف تتلقى رنين الإشعارات على هاتفك؟
            </p>
            <ol className="list-decimal list-inside space-y-1 pr-1 leading-relaxed">
              <li>حمّل تطبيق <b>ntfy</b> المجاني من متجر Google Play أو App Store.</li>
              <li>اضغط على زر <b>+</b> (اشتراك) واكتب اسم القناة: <code className="bg-stone-200 px-1 py-0.5 rounded">{DEFAULT_NOTIFICATION_CONFIG.ntfyTopic}</code></li>
              <li>ستصلك الإشعارات فوراً برنين وتنبيه حتى عندما يكون الهاتف مغلقاً.</li>
            </ol>
          </div>

          {/* Test Trigger Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleRunTest}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إرسال إشعار تجريبي إلى Telegram و ntfy...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال إشعار تجريبي الآن (Test Order)</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results */}
          {testResult ? (
            <div className="p-4 rounded-xl border border-stone-200 space-y-2 bg-[#FAF9F6] text-xs">
              <p className="font-semibold text-[#18181B]">نتائج الإرسال التجريبي:</p>
              <div className="flex items-center justify-between">
                <span>Telegram (@techno03bot):</span>
                {testResult.telegram.success ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    وصل بنجاح (Msg #{testResult.telegram.messageId})
                  </span>
                ) : (
                  <span className="text-[#E30613] font-medium">
                    خطأ: {testResult.telegram.error}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>ntfy ({DEFAULT_NOTIFICATION_CONFIG.ntfyTopic}):</span>
                {testResult.ntfy.success ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    وصل بنجاح (ID: {testResult.ntfy.messageId})
                  </span>
                ) : (
                  <span className="text-[#E30613] font-medium">
                    خطأ: {testResult.ntfy.error}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
