import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  Gift,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  QrCode,
  Tag,
  Phone,
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
        message: 'يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام',
      });
      return;
    }

    let newPinHash = card.pinHash;
    let isProtected = card.isPinProtected;

    if (pinInput) {
      if (!/^\d{4}$/.test(pinInput)) {
        setFormFeedback({ type: 'error', message: 'رمز الأمان PIN يجب أن يتكون من 4 أرقام بالضبط (مثال: 4821)' });
        return;
      }
      if (pinInput !== pinConfirmInput) {
        setFormFeedback({ type: 'error', message: 'تأكيد الرمز السري غير متطابق مع الرمز المدخل' });
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
        ? 'تم تخصيص البطاقة وحمايتها بنجاح برمز الأمان السري PIN الخاص بك!'
        : 'تم حفظ وتخصيص بيانات البطاقة بنجاح!',
    });
    setTimeout(() => setActiveTab('perks'), 2500);
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
            message: 'رمز الأمان السري PIN غير صحيح! لا يمكن فتح أو استخدام البطاقة بدون الرمز الخاص بصاحبها.',
          });
          return;
        }
      }
      setFormFeedback({ type: 'success', message: 'تم التحقق من هويتك واسترجاع بطاقتك ونقاطك بنجاح!' });
      setTimeout(() => setActiveTab('perks'), 2000);
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
        message: `مرحباً بك مجدداً ${matchedOrders[0].customer.fullName}! تم استرجاع بطاقتك ورصيدك (${totalPoints} نقطة).`,
      });
      setTimeout(() => setActiveTab('perks'), 2500);
    } else {
      setFormFeedback({
        type: 'error',
        message: 'لم يتم العثور على بطاقة سابقة مرتبطة بهذا الرقم. يمكنك تخصيص بطاقتك الحالية برقم هاتفك الآن.',
      });
    }
  };

  return (
    <section
      id="vip-card"
      className="relative py-16 lg:py-24 bg-[#080E1A] text-white border-y-2 border-[#D4AF37]/40 overflow-hidden"
    >
      {/* Algerian Zellige Ceramic Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 select-none mix-blend-screen"
        style={{
          backgroundImage: "url('/assets/algerian-zellige-jersey.webp')",
          backgroundSize: '320px 320px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
      />

      {/* Atmospheric Ambient Light Glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#FFD100]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FFD100]/20 via-[#D4AF37]/30 to-[#FFD100]/20 border border-[#FFD100]/50 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#FFD100]" />
            <span className="text-xs sm:text-sm font-black text-[#FFD100] tracking-wide">
              نادي تكنو الأغواط الحصري · TECHNO VIP PASS
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            بطاقتك الرقمية الخاصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD100] via-[#FDE047] to-[#D4AF37]">— رصيدك وامتيازاتك في جيبك</span>
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed max-w-2xl mx-auto">
            لكل زبون بطاقة وفاء افتراضية فريدة من نوعها برقم عضويتها وباركودها الخاص، تمنحك خصومات مباشرة بالفرع الميداني في الأغواط وتراكم نقاط المشتريات تلقائياً.
          </p>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Column 1: The Interactive 3D Virtual Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <VirtualLoyaltyCard
              card={card}
              activeTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
            />

            <p className="mt-4 text-[11px] text-stone-400 font-medium text-center flex items-center gap-1.5">
              <span>💡</span>
              <span>حرك الماوس أو المس الشاشة لإمالة البطاقة، وانقر عليها لقلبها نحو الباركود.</span>
            </p>
          </div>

          {/* Column 2: Dashboard, Points Progress & Security Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Points & Tier Progress Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#FFD100] uppercase tracking-wider block">
                    رصيدك الحالي من نقاط الوفاء
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-white tabular-nums">
                      {card.points}
                    </span>
                    <span className="text-sm font-bold text-stone-300">نقطة وفاء</span>
                  </div>
                </div>

                {/* Tier Badge & In-Store Discount Rate */}
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-right">
                    <span className="block text-[10px] text-stone-300 font-mono">الخصم المباشر بالفرع</span>
                    <span className="font-black text-sm text-[#FFD100]">{currentTier.discountLabel}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-right">
                    <span className="block text-[10px] text-stone-300 font-mono">مستوى البطاقة</span>
                    <span className="font-black text-sm text-white">{currentTier.badge}</span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {nextTierPoints ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-semibold">
                    <span className="text-stone-300">
                      متبقي <strong className="text-[#FFD100]">{nextTierPoints - card.points} نقطة</strong> للترقية للمستوى التالي
                    </span>
                    <span className="text-stone-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD100] transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#FFD100]">
                  <Sparkles className="w-4 h-4" />
                  <span>تهانينا! أنت في أعلى مستوى لعضوية النخبة (Obsidian Titanium)</span>
                </div>
              )}
            </div>

            {/* Interactive Control Tabs: (المزايا | تخصيص البطاقة | استرجاع البطاقة) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => { setActiveTab('perks'); setFormFeedback(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'perks'
                      ? 'bg-[#E30613] text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  امتيازات بطاقتك
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('customize'); setFormFeedback(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'customize'
                      ? 'bg-[#E30613] text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>تخصيص وحماية البطاقة (PIN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('retrieve'); setFormFeedback(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'retrieve'
                      ? 'bg-[#E30613] text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>استرجاع بطاقة سابقة</span>
                </button>
              </div>

              {/* Feedback Alert */}
              {formFeedback && (
                <div
                  className={`mb-4 p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
                    formFeedback.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {formFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{formFeedback.message}</span>
                </div>
              )}

              {/* TAB 1: PERKS LIST */}
              {activeTab === 'perks' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentTier.perks.map((perk, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#FFD100] shrink-0 mt-0.5" />
                        <span className="text-xs text-stone-200 font-semibold leading-relaxed">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Physical In-Store Guidance */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5 text-[#FFD100]" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">
                          كيف تستفيد منها بفرع تكنو الأغواط؟
                        </p>
                        <p className="text-[11px] text-stone-300 font-medium">
                          أظهر البطاقة من هاتفك أو صورتها المحفوظة للبائع لمسح الباركود عند الدفع.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('customize')}
                      className="px-3 py-1.5 rounded-xl bg-white text-[#0F172A] text-xs font-black shrink-0 hover:bg-[#FFD100] transition-colors cursor-pointer"
                    >
                      تعديل بياناتي
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOMIZE & PIN PROTECTION */}
              {activeTab === 'customize' && (
                <form onSubmit={handleSavePersonalization} className="space-y-4">
                  <p className="text-xs text-stone-300 font-medium leading-relaxed">
                    احفر اسمك ورقم هاتفك على البطاقة، وقم بتعيين رمز أمان PIN سري لحماية رصيد نقاطك من استخدام أي شخص آخر.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        اسم صاحب البطاقة (الظاهر على الواجهة)
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="مثال: أحمد بوزيد"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs font-bold focus:border-[#FFD100] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        رقم الهاتف (لربط النقاط والطلبات)
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="0560154663"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs font-mono font-bold focus:border-[#FFD100] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 4-Digit Security PIN Section */}
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#FFD100]" />
                      <span className="text-xs font-black text-white">
                        حماية البطاقة برمز أمان PIN سري (اختياري لكن يُنصح به بشدة)
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      يمنع أي شخص غريب من استرجاع بطاقتك أو استعمال نقاطك دون إدخال هذا الرمز المكون من 4 أرقام.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">
                          رمز الأمان PIN (4 أرقام)
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          placeholder="••••"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-center font-mono text-sm tracking-widest focus:border-[#FFD100] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">
                          تأكيد رمز PIN
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={pinConfirmInput}
                          onChange={(e) => setPinConfirmInput(e.target.value)}
                          placeholder="••••"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-center font-mono text-sm tracking-widest focus:border-[#FFD100] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('perks')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 text-stone-300 text-xs font-bold hover:bg-white/15 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black shadow-md transition-all cursor-pointer"
                    >
                      حفظ وتحديث البطاقة
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: RETRIEVE PREVIOUS CARD WITH PIN */}
              {activeTab === 'retrieve' && (
                <form onSubmit={handleRetrieveCard} className="space-y-4">
                  <p className="text-xs text-stone-300 font-medium leading-relaxed">
                    إذا قمت بتغيير هاتفك أو دخلت من جهاز كمبيوتر آخر، يمكنك استرجاع بطاقتك ونقاطك بإدخال رقم هاتفك ورمز الأمان PIN الخاص بك.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        رقم الهاتف المسجل سابقاً
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={retrievePhone}
                        onChange={(e) => setRetrievePhone(e.target.value)}
                        placeholder="0560154663"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs font-mono font-bold focus:border-[#FFD100] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        رمز الأمان PIN (4 أرقام)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={retrievePin}
                        onChange={(e) => setRetrievePin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-center font-mono text-xs tracking-widest focus:border-[#FFD100] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      لحماية خصوصية الزبائن ونقاطهم، لا يمكن فتح البطاقة إلا بمعرفة الرمز السري المسجل لصاحب الرقم.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('perks')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 text-stone-300 text-xs font-bold hover:bg-white/15 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>استرجاع بطاقتي ونقاطي</span>
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
