import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  KeyRound,
  UserCheck,
  Check,
  QrCode,
  Clock,
  RefreshCw,
  FileText,
  AlertCircle,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import {
  type LoyaltyCardData,
  LOYALTY_TIERS,
  LOYALTY_STORAGE_KEY,
  WELCOME_BONUS_POINTS,
  getOrCreateLoyaltyCard,
  generateCardNumber,
  formatCardDate,
  calculatePointsFromOrders,
  getTierFromPoints,
  requestCardActivation,
  saveLoyaltyCard,
  activateCardWithSixDigitPin,
  retrieveCardByPhone,
  unlockCardWithPin,
  downloadCardCredentialsDocument,
} from '../utils/loyaltyLogic';
import { sendLoyaltyCardRequestNotification } from '../utils/notificationService';
import { type SavedOrder } from '../utils/storeLogic';
import { VirtualLoyaltyCard } from './VirtualLoyaltyCard';

export interface LoyaltyCardSectionProps {
  savedOrders?: SavedOrder[];
  onApplyDiscount?: (code: string) => void;
}

export function LoyaltyCardSection({ savedOrders = [] }: LoyaltyCardSectionProps) {
  const [card, setCard] = useState<LoyaltyCardData>(() => getOrCreateLoyaltyCard(savedOrders));

  // View Mode: 'main' (Card & details) or 'retrieve' (Phone & PIN unlock)
  const [viewMode, setViewMode] = useState<'main' | 'retrieve'>('main');

  // Registration / Request inputs
  const [requestName, setRequestName] = useState('');
  const [requestPhone, setRequestPhone] = useState('');

  // 6-Digit PIN setting inputs (for approved_pending_pin)
  const [sixDigitPin, setSixDigitPin] = useState('');
  const [sixDigitPinConfirm, setSixDigitPinConfirm] = useState('');

  // Retrieval inputs (for returning customers)
  const [retrievalPhone, setRetrievalPhone] = useState('');
  const [retrievalPin, setRetrievalPin] = useState('');
  const [retrievalPromptPin, setRetrievalPromptPin] = useState(false);
  const [retrievedCardTemp, setRetrievedCardTemp] = useState<LoyaltyCardData | null>(null);

  // Active sub-tab when card is active
  const [activeTab, setActiveTab] = useState<'perks' | 'credentials'>('perks');

  // Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Auto-poll status from server while waiting in pending screen (every 4 seconds)
  useEffect(() => {
    if (card.status !== 'pending' || !card.customerPhone) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(
          `https://techno-laghouat-backend.hotel-saharien.workers.dev/api/loyalty/status?phone=${encodeURIComponent(card.customerPhone)}&_t=${Date.now()}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data: any = await res.json();
        if (data?.exists && data.status === 'approved_pending_pin') {
          const approvedCard: LoyaltyCardData = {
            ...card,
            customerPhone: card.customerPhone,
            customerName: data.request?.customerName || card.customerName,
            status: 'approved_pending_pin',
            approvedAt: data.request?.approvedAt || new Date().toISOString(),
          };
          saveLoyaltyCard(approvedCard);
          setCard(approvedCard);
          setFeedback({
            type: 'success',
            message: 'تمت موافقة الإدارة على تفعيل بطاقتك بنجاح! يرجى الآن تعيين رمزك السري (6 أرقام) لإظهارها كاملة.',
          });
        }
      } catch {}
    }, 4000);

    return () => clearInterval(intervalId);
  }, [card.status, card.customerPhone, card.customerName]);

  // Sync points when saved orders change for currently active card
  useEffect(() => {
    if (card.status === 'active' && card.customerPhone) {
      const cleanPhone = card.customerPhone.trim();
      const matchingOrders = savedOrders.filter(
        (o) => o.customer?.phone?.trim() === cleanPhone
      );
      if (matchingOrders.length > 0) {
        const calculatedPoints = WELCOME_BONUS_POINTS + calculatePointsFromOrders(matchingOrders);
        if (calculatedPoints !== card.points) {
          setCard((prev) => {
            if (prev.status !== 'active') return prev;
            return {
              ...prev,
              points: calculatedPoints,
              tier: getTierFromPoints(calculatedPoints),
              ordersCount: matchingOrders.length,
              totalSpent: matchingOrders.reduce(
                (sum, o) => sum + (o.totals?.grandTotalDzd || 0),
                0
              ),
              hasPurchased: true,
            };
          });
        }
      }
    }
  }, [savedOrders, card.customerPhone, card.status, card.points]);

  const currentTier = LOYALTY_TIERS[card.tier];
  const nextTierPoints = currentTier.nextTierPoints;
  const progressPercent = nextTierPoints
    ? Math.min(100, Math.round((card.points / nextTierPoints) * 100))
    : 100;

  // The card ONLY appears once approved (partially masked pending 6-digit PIN) or when fully active
  const showCard =
    (card.status === 'approved_pending_pin' || card.status === 'active') &&
    viewMode !== 'retrieve';

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Submit Card Activation Request (الاسم الكامل + رقم الهاتف)
  // ─────────────────────────────────────────────────────────────────────────
  const handleRequestActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanName = requestName.trim();
    const cleanPhone = requestPhone.trim();

    if (!cleanName) {
      setFeedback({ type: 'error', message: 'يرجى كتابة الاسم الكامل لصاحب البطاقة' });
      return;
    }

    if (!/^(05|06|07)\d{8}$/.test(cleanPhone)) {
      setFeedback({
        type: 'error',
        message: 'يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 (10 أرقام)',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Step A: Process activation request and check purchase history in orders
      const result = requestCardActivation(cleanName, cleanPhone, savedOrders);
      setCard(result.card);

      // Step B: Send notification to store owner's Telegram bots and ntfy
      await sendLoyaltyCardRequestNotification({
        customerName: cleanName,
        customerPhone: cleanPhone,
        hasPurchased: result.hasPurchased,
        ordersCount: result.ordersCount,
        totalSpent: result.totalSpent,
        cardNumber: result.card.cardNumber,
      });

      // Step C: Also post to cloudflare backend endpoint if reachable
      try {
        await fetch('https://techno-laghouat-backend.hotel-saharien.workers.dev/api/loyalty/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: cleanName,
            customerPhone: cleanPhone,
            hasPurchased: result.hasPurchased,
            ordersCount: result.ordersCount,
            totalSpent: result.totalSpent,
            cardNumber: result.card.cardNumber,
          }),
        });
      } catch {
        // silent failover to local + direct telegram
      }

      setFeedback({
        type: 'success',
        message:
          'تم استلام طلبك بنجاح! لقد دخلت في قائمة الانتظار والمعالجة. نتحقق حالياً من سجل مشترياتك في فرع الأغواط لتفعيل بطاقتك.',
      });
      setRequestName('');
      setRequestPhone('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'حدث خطأ أثناء إرسال الطلب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Set 6-Digit PIN to complete activation (إدخال رمز سري 6 أرقام لإظهار البطاقة كاملة)
  // ─────────────────────────────────────────────────────────────────────────
  const handleSetSixDigitPin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const pin = sixDigitPin.trim();
    const pinConfirm = sixDigitPinConfirm.trim();

    if (!/^\d{6}$/.test(pin)) {
      setFeedback({
        type: 'error',
        message: 'الرمز السري يجب أن يتكون من 6 أرقام عددية بالضبط (مثال: 582103)',
      });
      return;
    }

    if (pin !== pinConfirm) {
      setFeedback({
        type: 'error',
        message: 'تأكيد الرمز السري غير متطابق، يرجى كتابة نفس الـ 6 أرقام',
      });
      return;
    }

    const activation = activateCardWithSixDigitPin(card, pin);
    if (!activation.success || !activation.card) {
      setFeedback({ type: 'error', message: activation.error || 'فشل تفعيل الرمز السري' });
      return;
    }

    setCard(activation.card);
    setSixDigitPin('');
    setSixDigitPinConfirm('');

    // Sync PIN activation to backend so status becomes 'active' in KV
    try {
      fetch('https://techno-laghouat-backend.hotel-saharien.workers.dev/api/loyalty/pin-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: card.customerPhone }),
      }).catch(() => {});
    } catch {}

    setFeedback({
      type: 'success',
      message: 'تم تفعيل بطاقتك بنجاح! تم كشف البطاقة والباركود بالكامل، يمكنك الآن استخدامها وحفظ بياناتها.',
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Real-time Status Refresh from Server (تحديث حالة الطلب لحظياً من الخادم)
  // ─────────────────────────────────────────────────────────────────────────
  const handleRefreshStatus = async () => {
    const cleanPhone = card.customerPhone?.trim() || requestPhone?.trim();
    if (!cleanPhone) {
      setFeedback({
        type: 'error',
        message: 'لا يوجد رقم هاتف مرتبط بهذا الطلب.',
      });
      return;
    }

    setIsRefreshingStatus(true);
    try {
      const res = await fetch(
        `https://techno-laghouat-backend.hotel-saharien.workers.dev/api/loyalty/status?phone=${encodeURIComponent(cleanPhone)}&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!res.ok) {
        setFeedback({
          type: 'info',
          message: 'يجري الاتصال بالخادم... يرجى إعادة المحاولة بعد لحظات.',
        });
        return;
      }

      const data: any = await res.json();
      if (!data?.exists) {
        setFeedback({
          type: 'error',
          message: 'لم يتم العثور على طلب معتمد بهذا الرقم. يمكنك تقديم طلب تفعيل جديد.',
        });
        return;
      }

      if (data.status === 'approved_pending_pin') {
        const approvedCard: LoyaltyCardData = {
          ...card,
          customerPhone: cleanPhone,
          customerName: data.request?.customerName || card.customerName,
          status: 'approved_pending_pin',
          approvedAt: data.request?.approvedAt || new Date().toISOString(),
        };
        saveLoyaltyCard(approvedCard);
        setCard(approvedCard);
        setFeedback({
          type: 'success',
          message: 'تمت موافقة الإدارة على تفعيل بطاقتك بنجاح! يرجى الآن تعيين رمزك السري (6 أرقام) لإظهارها كاملة.',
        });
        return;
      }

      if (data.status === 'active') {
        const activeCard: LoyaltyCardData = {
          ...card,
          customerPhone: cleanPhone,
          customerName: data.request?.customerName || card.customerName,
          status: 'active',
        };
        saveLoyaltyCard(activeCard);
        setCard(activeCard);
        setFeedback({
          type: 'success',
          message: 'بطاقتك مفعلة ونشطة بالفعل!',
        });
        return;
      }

      if (data.status === 'disabled') {
        setCard((prev) => ({ ...prev, status: 'disabled' }));
        setFeedback({
          type: 'error',
          message: 'تم تعطيل / تعليق هذه البطاقة من طرف إدارة متجر تكنو الأغواط. يرجى مراجعة الفرع أو الإدارة للاستفسار.',
        });
        return;
      }

      // Still pending
      setFeedback({
        type: 'info',
        message: 'طلبك قيد المعالجة في قائمة الانتظار، يجري التدقيق لاعتماد تفعيل بطاقتك من طرف الإدارة.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'تعذر الاتصال بالخادم للتحقق من حالة الطلب. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.',
      });
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Quick Retrieval Flow (استرجاع البطاقة برقم الهاتف ثم الرمز السري 6 أرقام)
  // ─────────────────────────────────────────────────────────────────────────
  const handleCheckPhoneForRetrieval = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanPhone = retrievalPhone.trim();
    if (!/^(05|06|07)\d{8}$/.test(cleanPhone)) {
      setFeedback({
        type: 'error',
        message: 'يرجى إدخال رقم هاتف جزائري صحيح يتكون من 10 أرقام (05 أو 06 أو 07)',
      });
      return;
    }

    // 1. Check local registry
    const res = retrieveCardByPhone(cleanPhone);

    // 2. Also check real-time status from server
    let serverStatus: string | null = null;
    let serverRequestData: any = null;
    try {
      const serverRes = await fetch(
        `https://techno-laghouat-backend.hotel-saharien.workers.dev/api/loyalty/status?phone=${encodeURIComponent(cleanPhone)}&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (serverRes.ok) {
        const sData: any = await serverRes.json();
        if (sData?.exists && sData.status) {
          serverStatus = sData.status;
          serverRequestData = sData.request;
        }
      }
    } catch {}

    const effectiveStatus = serverStatus || res.card?.status;

    // Handle disabled/suspended card by admin
    if (effectiveStatus === 'disabled' || res.card?.status === 'disabled') {
      if (res.card) {
        res.card.status = 'disabled';
      }
      setFeedback({
        type: 'error',
        message: 'تم تعطيل / تعليق هذه البطاقة من طرف إدارة متجر تكنو الأغواط. يرجى مراجعة الفرع أو الإدارة للاستفسار.',
      });
      return;
    }

    // Resolve target card data (from local registry or fallback to server request)
    let targetCard = res.card;
    if (!targetCard && serverRequestData) {
      targetCard = {
        cardNumber: serverRequestData.cardNumber || generateCardNumber(cleanPhone),
        customerName: serverRequestData.customerName || 'عضو نادي الوفاء',
        customerPhone: cleanPhone,
        status: effectiveStatus || 'pending',
        points: WELCOME_BONUS_POINTS,
        tier: 'classic',
        memberSince: formatCardDate(0),
        validThru: formatCardDate(3),
        isPinProtected: false,
        hasPurchased: serverRequestData.hasPurchased,
        ordersCount: serverRequestData.ordersCount,
        totalSpent: serverRequestData.totalSpent,
      };
      saveLoyaltyCard(targetCard);
    }

    if (!targetCard) {
      setFeedback({
        type: 'error',
        message: 'لم يتم العثور على بطاقة مسجلة بهذا الرقم. يمكنك طلب تفعيل بطاقة جديدة الآن.',
      });
      return;
    }

    if (effectiveStatus === 'pending') {
      setCard({ ...targetCard, status: 'pending' });
      setViewMode('main');
      setFeedback({
        type: 'info',
        message: 'طلبك قيد المعالجة في قائمة الانتظار، يجري التدقيق لاعتماد تفعيل بطاقتك من طرف الإدارة.',
      });
      return;
    }

    if (effectiveStatus === 'approved_pending_pin') {
      const approvedCard: LoyaltyCardData = { ...targetCard, status: 'approved_pending_pin' };
      saveLoyaltyCard(approvedCard);
      setCard(approvedCard);
      setViewMode('main');
      setFeedback({
        type: 'success',
        message: 'تمت موافقة الإدارة على تفعيل بطاقتك بنجاح! يرجى الآن تعيين رمزك السري (6 أرقام) لإظهارها كاملة.',
      });
      return;
    }

    // Card is active and secured by PIN: prompt for 6-digit PIN
    setRetrievedCardTemp(targetCard);
    setRetrievalPromptPin(true);
    setFeedback({
      type: 'info',
      message: `أهلاً بك مجدداً ${targetCard.customerName}! يرجى إدخال رقمك السري (6 أرقام) لعرض بطاقتك:`,
    });
  };

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanPhone = retrievalPhone.trim();
    const cleanPin = retrievalPin.trim();

    if (!cleanPin) {
      setFeedback({ type: 'error', message: 'يرجى إدخال الرمز السري المكون من 6 أرقام' });
      return;
    }

    const unlock = unlockCardWithPin(cleanPhone, cleanPin);
    if (!unlock.success || !unlock.card) {
      setFeedback({
        type: 'error',
        message: unlock.error || 'الرمز السري غير صحيح، يرجى إعادة المحاولة',
      });
      return;
    }

    const activeUnlockedCard: LoyaltyCardData = {
      ...unlock.card,
      status: 'active',
    };
    setCard(activeUnlockedCard);
    setViewMode('main');
    setRetrievalPromptPin(false);
    setRetrievalPhone('');
    setRetrievalPin('');
    setFeedback({
      type: 'success',
      message: `مرحباً بك مجدداً ${activeUnlockedCard.customerName}! تم إلغاء القفل وإظهار بطاقتك كاملة بنجاح.`,
    });
  };

  // Lock current card (Log out of active view to test retrieval)
  const handleLockCard = () => {
    setFeedback(null);
    setViewMode('retrieve');
    setRetrievalPromptPin(false);
    setRetrievalPhone(card.customerPhone || '');
  };

  // Reset to new registration form (for testing or requesting for another member)
  const handleResetToRegistration = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOYALTY_STORAGE_KEY);
    }
    setCard({
      cardNumber: generateCardNumber(),
      customerName: 'عضو نادي الوفاء',
      customerPhone: '',
      status: 'unregistered',
      points: WELCOME_BONUS_POINTS,
      tier: 'classic',
      memberSince: formatCardDate(0),
      validThru: formatCardDate(3),
      isPinProtected: false,
    });
    setViewMode('main');
    setRetrievalPromptPin(false);
    setFeedback(null);
  };

  return (
    <section
      id="vip-card"
      className="relative py-20 lg:py-28 bg-[#0B0F17] text-white border-y border-stone-800/90 overflow-hidden"
    >
      {/* Subtle Algerian Zellige Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] select-none mix-blend-screen"
        style={{
          backgroundImage: "url('/assets/algerian-zellige-jersey.webp')",
          backgroundSize: '240px 240px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300 text-xs font-mono tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>نادي الوفاء الرسمي · فرع الأغواط 03</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-stone-100 tracking-tight leading-snug">
            {showCard ? 'بطاقة الوفاء VIP الخاصة بك' : 'طلب إصدار وتفعيل بطاقة الوفاء VIP'}
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 font-normal leading-relaxed max-w-2xl mx-auto">
            {showCard
              ? 'بطاقتك الرقمية المعتمدة بفرع الأغواط، تمنحك خصومات فورية عند الصندوق مع حماية كاملة برمز سري من 6 أرقام.'
              : 'سجل اسمك ورقم هاتفك للتحقق من مشترياتك في فرع الأغواط وتفعيل بطاقتك'}
          </p>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`max-w-2xl mx-auto mt-6 p-4 rounded-xl border text-xs font-medium flex items-start gap-3 shadow-md ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/70 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="leading-relaxed">{feedback.message}</div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            LAYOUT VARIATION A: WHEN CARD IS NOT YET SHOWN (UNREGISTERED / PENDING / RETRIEVE)
            البطاقة لا تظهر هنا إطلاقاً — يظهر فقط نموذج الطلب أو المعالجة الأنيق
            ═════════════════════════════════════════════════════════════════════ */}
        {!showCard ? (
          <div className="max-w-2xl mx-auto mt-10 space-y-6">
            
            {/* 1. RETRIEVE MODE: Returning customer looking up existing card */}
            {viewMode === 'retrieve' ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xl backdrop-blur-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="font-bold text-sm text-stone-100">
                      استرجاع وإظهار بطاقتك السابقة
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setViewMode('main'); setRetrievalPromptPin(false); setFeedback(null); }}
                    className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>العودة لطلب تفعيل بطاقة جديدة</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!retrievalPromptPin ? (
                  /* Step 1: Enter Phone */
                  <form onSubmit={handleCheckPhoneForRetrieval} className="space-y-4">
                    <p className="text-xs text-stone-300 leading-relaxed">
                      إذا كان لديك بطاقة مفعلة مسبقاً، أدخل رقم هاتفك المسجل وسيطلب منك إدخال رمزك السري لإظهارها كاملة:
                    </p>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1.5">
                        رقم الهاتف المسجل (10 أرقام)
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={retrievalPhone}
                        onChange={(e) => setRetrievalPhone(e.target.value)}
                        placeholder="0560154663"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:border-stone-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-stone-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      متابعة والتحقق من البطاقة
                    </button>
                  </form>
                ) : (
                  /* Step 2: Enter 6-Digit PIN */
                  <form onSubmit={handleUnlockWithPin} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300">
                      <p className="font-bold text-stone-200">
                        مرحباً بك، {retrievedCardTemp?.customerName}!
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        البطاقة مسجلة برقم الهاتف ({retrievalPhone}). يرجى إدخال رقمك السري (6 أرقام) لإظهارها كاملة:
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1.5">
                        الرمز السري الخاص بالبطاقة (6 أرقام)
                      </label>
                      <input
                        type="password"
                        dir="ltr"
                        maxLength={6}
                        required
                        value={retrievalPin}
                        onChange={(e) => setRetrievalPin(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm font-mono tracking-widest text-center focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-stone-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                      >
                        إلغاء القفل وإظهار البطاقة كاملة
                      </button>

                      <button
                        type="button"
                        onClick={() => { setRetrievalPromptPin(false); setRetrievalPin(''); }}
                        className="px-3.5 py-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white text-xs font-medium cursor-pointer"
                      >
                        تغيير الرقم
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : card.status === 'unregistered' ? (
              /* 2. UNREGISTERED STATE: Form to request card activation */
              <div className="p-6 sm:p-8 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xl backdrop-blur-xs space-y-6">
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-stone-100">
                      طلب إصدار وتفعيل بطاقة الوفاء VIP
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      سجل اسمك ورقم هاتفك للتحقق من مشترياتك في فرع الأغواط وتفعيل بطاقتك
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-stone-800/80 border border-stone-700/80 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <form onSubmit={handleRequestActivation} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1.5">
                        الاسم الكامل لصاحب البطاقة
                      </label>
                      <input
                        type="text"
                        required
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        placeholder="مثال: محمد زكي"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-medium focus:border-stone-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1.5">
                        رقم الهاتف (الجزائر)
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={requestPhone}
                        onChange={(e) => setRequestPhone(e.target.value)}
                        placeholder="0560154663"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:border-stone-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-[11px] text-stone-400 leading-relaxed">
                    بمجرد إدخال رقم هاتفك، سيتم مقارنته تلقائياً مع سجل المشتريات بالمتجر وإرسال طلبك للإدارة للموافقة، ثم سيطلب منك تعيين رمز سري من 6 أرقام لإظهار بطاقتك وحمايتها.
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-stone-950 font-bold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'جارٍ الإرسال والتحقق...' : 'إرسال طلب التفعيل'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setViewMode('retrieve'); setFeedback(null); }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      لديك بطاقة سابقة؟ استرجاع برقم الهاتف
                    </button>
                  </div>
                </form>

                {/* 3 Prestige Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-800/80">
                  <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/70 text-right">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] mb-1.5" />
                    <h4 className="text-[11px] font-bold text-stone-200">حماية برمز PIN</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">رمز سري من 6 أرقام يمنع أي شخص من فتح بطاقتك</p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/70 text-right">
                    <Sparkles className="w-4 h-4 text-[#D4AF37] mb-1.5" />
                    <h4 className="text-[11px] font-bold text-stone-200">تخفيض فوري بالفرع</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">خصم مباشر عند الدفع في كاسة فرع تكنو الأغواط</p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/70 text-right">
                    <QrCode className="w-4 h-4 text-[#D4AF37] mb-1.5" />
                    <h4 className="text-[11px] font-bold text-stone-200">معيار ID-1 العالمي</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">أبعاد 85.60 × 53.98 مم مع باركود رسمي مشفر</p>
                  </div>
                </div>
              </div>
            ) : (
              /* 3. PENDING STATE: Processing queue */
              <div className="p-6 sm:p-8 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xl backdrop-blur-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-100">
                        طلبك قيد المعالجة في قائمة الانتظار
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        الاسم: {card.customerName} · الهاتف: {card.customerPhone}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    بانتظار الموافقة
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">حالة سجل الشراء بالمتجر:</span>
                    <span className={`font-bold ${card.hasPurchased ? 'text-emerald-400' : 'text-stone-300'}`}>
                      {card.hasPurchased
                        ? `اشترى سابقاً (${card.ordersCount} طلبات · ${card.totalSpent?.toLocaleString('ar-DZ')} دج)`
                        : 'زبون جديد (قيد التدقيق لدى الإدارة)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">الفرع المعتمد:</span>
                    <span className="font-mono text-stone-200">فرع الأغواط 03 (حي المقام)</span>
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  لقد استلمنا طلبك، ويجري التحقق من سجل مشترياتك في فرع تكنو الأغواط لاعتماد بطاقتك. فور موافقة الإدارة ستظهر لك شاشة تعيين رمزك السري المكون من 6 أرقام.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={handleRefreshStatus}
                    disabled={isRefreshingStatus}
                    className="px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-800 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-stone-400 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingStatus ? 'جارٍ التحقق من الخادم...' : 'تحديث الحالة'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToRegistration}
                    className="px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium border border-stone-800 cursor-pointer"
                  >
                    طلب جديد / تعديل البيانات
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════════════════
              LAYOUT VARIATION B: WHEN CARD IS APPROVED OR ACTIVE
              تظهر البطاقة هنا في العمود الأيسر (5 أعمدة) واللوحة في العمود الأيمن (7 أعمدة)
              ═════════════════════════════════════════════════════════════════════ */
          <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Column 1: The Interactive 3D Virtual Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <VirtualLoyaltyCard card={card} />

              <p className="mt-3.5 text-[11px] font-mono text-stone-400 text-center tracking-wide">
                حرّك الفأرة أو أمل الهاتف لمعاينة البطاقة بالأبعاد الثلاثية · انقر لقلبها
              </p>
            </div>

            {/* Column 2: Classic Prestige Dashboard & Management (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* STATE 1: APPROVED PENDING PIN (البطاقة غير كاملة بانتظار 6 أرقام) */}
              {card.status === 'approved_pending_pin' && (
                <div className="p-6 sm:p-7 rounded-2xl bg-stone-900/70 border border-stone-800 shadow-xl backdrop-blur-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                    <div>
                      <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>تمت الموافقة على تفعيل بطاقتك!</span>
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        البطاقة تظهر غير مكتملة حالياً. أدخل رقماً سرياً مكوناً من 6 أرقام لإظهارها كاملة
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>

                  <form onSubmit={handleSetSixDigitPin} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-mono text-stone-400 mb-1.5">
                          الرمز السري الخاص بك (6 أرقام)
                        </label>
                        <input
                          type="password"
                          dir="ltr"
                          required
                          maxLength={6}
                          value={sixDigitPin}
                          onChange={(e) => setSixDigitPin(e.target.value)}
                          placeholder="••••••"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm font-mono tracking-widest text-center focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-stone-400 mb-1.5">
                          تأكيد الرمز السري (6 أرقام)
                        </label>
                        <input
                          type="password"
                          dir="ltr"
                          required
                          maxLength={6}
                          value={sixDigitPinConfirm}
                          onChange={(e) => setSixDigitPinConfirm(e.target.value)}
                          placeholder="••••••"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm font-mono tracking-widest text-center focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-400">
                      ملاحظة: هذا الرمز السري مخصص لحمايتك، وسيمكنك من استرجاع وإظهار بطاقتك كاملة في أي وقت فقط بإدخال رقم هاتفك.
                    </p>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-stone-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      تأكيد الرمز السري وإظهار البطاقة كاملة
                    </button>
                  </form>
                </div>
              )}

              {/* STATE 2: ACTIVE (البطاقة كاملة ومفعلة) */}
              {card.status === 'active' && (
                <>
                  {/* Points & Discount Summary Card */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-stone-900/60 border border-stone-800 shadow-xl backdrop-blur-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-stone-800">
                      <div>
                        <span className="text-[11px] font-mono tracking-wider text-stone-400 block">
                          رصيد نقاط الوفاء المتاح
                        </span>
                        <div className="flex items-baseline gap-2.5 mt-1">
                          <span className="font-mono text-3xl sm:text-4xl font-bold text-stone-100 tabular-nums">
                            {card.points}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">نقطة معتمدة</span>
                        </div>
                      </div>

                      {/* In-Store Discount Badge */}
                      <div className="px-4 py-2 rounded-xl bg-stone-950/80 border border-stone-800 text-right">
                        <span className="block text-[10px] font-mono text-stone-400">التخفيض المعتمد بالفرع</span>
                        <span className="font-bold text-xs text-[#D4AF37]">{currentTier.discountLabel}</span>
                      </div>
                    </div>

                    {/* Progress to Next Tier */}
                    {nextTierPoints ? (
                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                          <span>
                            متبقي <strong className="text-stone-200 font-bold">{nextTierPoints - card.points} نقطة</strong> للترقية للمستوى التالي
                          </span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-950 overflow-hidden border border-stone-800/80">
                          <div
                            className="h-full rounded-full bg-[#D4AF37] transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 flex items-center gap-2 text-xs text-[#D4AF37] font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>عضوية النخبة الكاملة</span>
                      </div>
                    )}
                  </div>

                  {/* Active Card Management & Perks Card */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-stone-900/60 border border-stone-800 shadow-xl backdrop-blur-xs">
                    
                    {/* Navigation Tabs */}
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('perks')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'perks'
                              ? 'bg-stone-800 text-stone-100 shadow-xs'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          مزايا العضوية
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('credentials')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'credentials'
                              ? 'bg-stone-800 text-stone-100 shadow-xs'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          وثيقة وبيانات البطاقة
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleLockCard}
                          className="text-[11px] text-stone-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="قفل البطاقة لاختبار الاسترجاع بالرمز السري"
                        >
                          <Lock className="w-3 h-3" />
                          <span>قفل البطاقة</span>
                        </button>
                        <span className="text-stone-700">·</span>
                        <button
                          type="button"
                          onClick={handleResetToRegistration}
                          className="text-[11px] text-stone-400 hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1"
                          title="طلب إصدار بطاقة جديدة أو تسجيل حساب آخر"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>طلب بطاقة جديدة</span>
                        </button>
                      </div>
                    </div>

                    {activeTab === 'perks' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentTier.perks.map((perk, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start gap-2.5"
                            >
                              <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                              <span className="text-xs text-stone-300 font-normal leading-relaxed">
                                {perk}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between gap-4 mt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                              <QrCode className="w-4 h-4 text-[#D4AF37]" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-stone-200">
                                الاستخدام في كاسة فرع الأغواط
                              </p>
                              <p className="text-[11px] text-stone-400 font-normal">
                                أبرز الباركود الموجود خلف البطاقة عند الدفع للحصول على الخصم وتراكم النقاط.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* TAB 2: Credentials and Download Pass */
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                            <span className="text-stone-400">صاحب البطاقة:</span>
                            <span className="font-bold text-stone-100">{card.customerName}</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                            <span className="text-stone-400">رقم الهاتف:</span>
                            <span className="font-mono text-stone-200">{card.customerPhone}</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                            <span className="text-stone-400">رقم البطاقة:</span>
                            <span className="font-mono text-stone-200">{card.cardNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-400">الرمز السري (PIN):</span>
                            <span className="font-mono text-[#D4AF37] font-bold">
                              {card.plainPinBackup || '•••••• (مشفر بأمان)'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => downloadCardCredentialsDocument(card)}
                          className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                        >
                          <FileText className="w-4 h-4" />
                          <span>تنزيل وثيقة بيانات العضوية والرمز السري</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
