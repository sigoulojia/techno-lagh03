import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  KeyRound,
  UserCheck,
  Check,
  QrCode,
  CreditCard,
  ChevronLeft,
} from 'lucide-react';
import {
  type LoyaltyCardData,
  type LoyaltyTierId,
  LOYALTY_TIERS,
  getOrCreateLoyaltyCard,
  saveLoyaltyCard,
  hashPin,
  verifyPin,
  getTierFromPoints,
} from '../utils/loyaltyLogic';
import { type SavedOrder } from '../utils/storeLogic';
import { VirtualLoyaltyCard } from './VirtualLoyaltyCard';

export interface LoyaltyCardSectionProps {
  savedOrders?: SavedOrder[];
  onApplyDiscount?: (code: string) => void;
}

export function LoyaltyCardSection({ savedOrders = [] }: LoyaltyCardSectionProps) {
  const [card, setCard] = useState<LoyaltyCardData>(() => getOrCreateLoyaltyCard(savedOrders));
  const [selectedTheme, setSelectedTheme] = useState<LoyaltyTierId>(card.tier);

  // Modal / Form States
  const [activeTab, setActiveTab] = useState<'perks' | 'customize' | 'retrieve'>('perks');
  const [nameInput, setNameInput] = useState(card.customerName === 'عضو نادي الوفاء' ? '' : card.customerName);
  const [phoneInput, setPhoneInput] = useState(card.customerPhone || '');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [retrievePhone, setRetrievePhone] = useState('');
  const [retrievePin, setRetrievePin] = useState('');

  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-sync when orders change
  useEffect(() => {
    const updated = getOrCreateLoyaltyCard(savedOrders);
    setCard(updated);
    setSelectedTheme(updated.tier);
  }, [savedOrders]);

  const currentTier = LOYALTY_TIERS[card.tier];
  const nextTierPoints = currentTier.nextTierPoints;
  const progressPercent = nextTierPoints
    ? Math.min(100, Math.round((card.points / nextTierPoints) * 100))
    : 100;

  // Handle Personalization & PIN Setting
  const handleSavePersonalization = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const cleanName = nameInput.trim();
    const cleanPhone = phoneInput.trim();

    if (!cleanName) {
      setFormFeedback({ type: 'error', message: 'يرجى كتابة الاسم الكريم لصاحب البطاقة' });
      return;
    }

    if (cleanPhone && !/^(05|06|07)\d{8}$/.test(cleanPhone)) {
      setFormFeedback({
        type: 'error',
        message: 'يرجى إدخال رقم هاتف جزائري صحيح يتكون من 10 أرقام (05 أو 06 أو 07)',
      });
      return;
    }

    let newPinHash = card.pinHash;
    let isProtected = card.isPinProtected;

    if (pinInput) {
      if (!/^\d{4}$/.test(pinInput)) {
        setFormFeedback({ type: 'error', message: 'رمز الأمان PIN يتكون من 4 أرقام عددية' });
        return;
      }
      if (pinInput !== pinConfirmInput) {
        setFormFeedback({ type: 'error', message: 'تأكيد الرمز السري غير متطابق' });
        return;
      }
      newPinHash = hashPin(pinInput);
      isProtected = true;
    }

    const updatedCard: LoyaltyCardData = {
      ...card,
      customerName: cleanName,
      customerPhone: cleanPhone || card.customerPhone,
      pinHash: newPinHash,
      isPinProtected: isProtected,
    };

    setCard(updatedCard);
    saveLoyaltyCard(updatedCard);
    setPinInput('');
    setPinConfirmInput('');
    setFormFeedback({
      type: 'success',
      message: isProtected
        ? 'تم تحديث بيانات العضوية وتأمينها برمز الحماية السري بنجاح.'
        : 'تم حفظ وتخصيص بيانات البطاقة بنجاح.',
    });
    setTimeout(() => setActiveTab('perks'), 2200);
  };

  // Handle Card Retrieval with Phone & PIN
  const handleRetrieveCard = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const cleanPhone = retrievePhone.trim();
    if (!cleanPhone) {
      setFormFeedback({ type: 'error', message: 'يرجى إدخال رقم الهاتف المسجل' });
      return;
    }

    // Verify against current card if phone matches
    if (card.customerPhone && card.customerPhone === cleanPhone) {
      if (card.isPinProtected) {
        if (!verifyPin(retrievePin, card.pinHash)) {
          setFormFeedback({
            type: 'error',
            message: 'رمز الأمان السري PIN غير مطابق. يرجى التأكد من الرمز والمحاولة مجدداً.',
          });
          return;
        }
      }
      setFormFeedback({ type: 'success', message: 'تم التحقق من بياناتك واسترجاع بطاقتك بنجاح.' });
      setTimeout(() => setActiveTab('perks'), 1800);
      return;
    }

    // Check saved orders for this phone number
    const matchedOrders = savedOrders.filter((o) => o.customer.phone === cleanPhone);
    if (matchedOrders.length > 0) {
      const orderPoints = Math.floor(
        matchedOrders.reduce((sum, o) => sum + (o.totals?.grandTotalDzd || 0), 0) / 100
      );
      const totalPoints = Math.max(card.points, 50 + orderPoints);
      const newCardData: LoyaltyCardData = {
        ...card,
        customerName: matchedOrders[0].customer.fullName,
        customerPhone: cleanPhone,
        points: totalPoints,
        tier: getTierFromPoints(totalPoints),
      };
      setCard(newCardData);
      saveLoyaltyCard(newCardData);
      setFormFeedback({
        type: 'success',
        message: `أهلاً بك مجدداً ${matchedOrders[0].customer.fullName}. تم استرجاع بطاقتك ورصيدك (${totalPoints} نقطة).`,
      });
      setTimeout(() => setActiveTab('perks'), 2000);
    } else {
      setFormFeedback({
        type: 'error',
        message: 'لم يتم العثور على عضوية مسجلة بهذا الرقم. يمكنك ربط بطاقتك الحالية برقم هاتفك الآن.',
      });
    }
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
          backgroundSize: '280px 280px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Refined Classic Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900/90 border border-stone-700/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase">
              MEMBRE PRIVILÈGE · نـادي الـوفـاء
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-stone-100 tracking-tight leading-snug">
            بطاقة العضوية الخاصة بك لدى تكنو الأغواط
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 font-normal leading-relaxed max-w-2xl mx-auto">
            بطاقة وفاء رقمية فريدة تمنح كل زبون امتيازات حصرية وتخفيضات فورية بالفرع الميداني، مع تراكم نقاط المشتريات تلقائياً.
          </p>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="mt-14 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Column 1: The Interactive 3D Virtual Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <VirtualLoyaltyCard
              card={card}
              activeTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
            />

            <p className="mt-3.5 text-[11px] font-mono text-stone-400 text-center tracking-wide">
              اسحب أو أمل الشاشة لتدوير البطاقة · انقر لمعاينة الباركود
            </p>
          </div>

          {/* Column 2: Classic Prestige Dashboard & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Elegant Points & Tier Summary Card */}
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

                {/* Classic Tier & Discount Badges */}
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 text-right">
                    <span className="block text-[10px] font-mono text-stone-400">التخفيض بالفرع</span>
                    <span className="font-bold text-xs text-[#D4AF37]">{currentTier.discountLabel}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 text-right">
                    <span className="block text-[10px] font-mono text-stone-400">فئة العضوية</span>
                    <span className="font-bold text-xs text-stone-200">{currentTier.badge}</span>
                  </div>
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
                  <span>عضوية النخبة الكاملة (Obsidian Titanium)</span>
                </div>
              )}
            </div>

            {/* Classic Tabbed Management Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-stone-900/60 border border-stone-800 shadow-xl backdrop-blur-xs">
              
              {/* Refined Tabs Navigation */}
              <div className="flex items-center gap-1 border-b border-stone-800 pb-3 mb-6 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => { setActiveTab('perks'); setFormFeedback(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'perks'
                      ? 'bg-stone-800 text-stone-100 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  مزايا العضوية
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('customize'); setFormFeedback(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'customize'
                      ? 'bg-stone-800 text-stone-100 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>تخصيص وحماية البطاقة</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('retrieve'); setFormFeedback(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'retrieve'
                      ? 'bg-stone-800 text-stone-100 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                  <span>استرجاع بطاقة سابقة</span>
                </button>
              </div>

              {/* Refined Feedback Alert */}
              {formFeedback && (
                <div
                  className={`mb-5 p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                    formFeedback.type === 'success'
                      ? 'bg-stone-950 border-emerald-500/30 text-emerald-300'
                      : 'bg-stone-950 border-stone-700 text-rose-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  <span>{formFeedback.message}</span>
                </div>
              )}

              {/* TAB 1: PERKS LIST */}
              {activeTab === 'perks' && (
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

                  {/* Refined In-Store Notice */}
                  <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-200">
                          الاستخدام بالفرع الميداني (الأغواط)
                        </p>
                        <p className="text-[11px] text-stone-400 font-normal">
                          أبرز الباركود الموجود خلف البطاقة عند صندوق الدفع للاستفادة من التخفيض المباشر.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('customize')}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 shrink-0 transition-colors cursor-pointer"
                    >
                      تعديل البيانات
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOMIZE & PIN PROTECTION */}
              {activeTab === 'customize' && (
                <form onSubmit={handleSavePersonalization} className="space-y-4">
                  <p className="text-xs text-stone-400 leading-relaxed">
                    قم بإدراج اسمك ورقم هاتفك، وتعيين رمز حماية سري (PIN) لحماية رصيد نقاطك من الاستخدام غير المصرح به.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1">
                        الاسم الكامل (الظاهر على البطاقة)
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="مثال: أحمد بوزيد"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-medium focus:border-stone-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="0560154663"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:border-stone-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 4-Digit Security PIN Section */}
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-xs font-bold text-stone-200">
                        رمز الأمان السري PIN (مكوّن من 4 أرقام)
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      يضمن عدم قدرة أي طرف آخر على استرجاع البطاقة أو استخدام رصيد نقاطك دون هذا الرمز.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-mono text-stone-500 mb-1">
                          رمز PIN
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          placeholder="••••"
                          className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-center font-mono text-sm tracking-widest focus:border-stone-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-stone-500 mb-1">
                          تأكيد رمز PIN
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={pinConfirmInput}
                          onChange={(e) => setPinConfirmInput(e.target.value)}
                          placeholder="••••"
                          className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-center font-mono text-sm tracking-widest focus:border-stone-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('perks')}
                      className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-stone-100 hover:bg-white text-stone-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      حفظ وتأكيد العضوية
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: RETRIEVE PREVIOUS CARD WITH PIN */}
              {activeTab === 'retrieve' && (
                <form onSubmit={handleRetrieveCard} className="space-y-4">
                  <p className="text-xs text-stone-400 leading-relaxed">
                    عند التصفح من جهاز آخر، يمكنك استرجاع بطاقتك ورصيد نقاطك بإدخال رقم الهاتف المسجل ورمز الحماية السري (PIN).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1">
                        رقم الهاتف المسجل
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={retrievePhone}
                        onChange={(e) => setRetrievePhone(e.target.value)}
                        placeholder="0560154663"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:border-stone-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-400 mb-1">
                        رمز الأمان PIN (4 أرقام)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={retrievePin}
                        onChange={(e) => setRetrievePin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-center font-mono text-xs tracking-widest focus:border-stone-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      لحماية خصوصية الزبائن، لن يتم تفعيل العضوية أو عرض الرصيد إلا بعد مطابقة الرمز السري الخاص بصاحب الرقم.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('perks')}
                      className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-stone-100 hover:bg-white text-stone-950 text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>استرجاع العضوية</span>
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
