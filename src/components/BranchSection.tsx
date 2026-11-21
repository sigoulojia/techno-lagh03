import { useState, type FormEvent } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Search,
  Sparkles,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  BRAND_BANNER_IMAGE,
  DEFAULT_WILAYA,
  STORE_INFO,
} from '../data/products';
import {
  LAGHOUAT_BUREAUS,
  WILAYA_DELIVERY_RATES,
  findWilayaRate,
  formatWilayaLabel,
} from '../data/deliveryRates';
import { formatDzd, getDeliveryMethodTitle, type SavedOrder } from '../utils/storeLogic';
import { ProductImage } from './ProductImage';
import { TechnoLogo } from './TechnoLogo';

interface BranchSectionProps {
  savedOrders: SavedOrder[];
}

const CRAFTSMANSHIP_PILLARS = [
  {
    index: '01',
    title: 'أدوات مكتبية، ساعات وتنظيم احترافي',
    body: 'مجموعة شاملة من الساعات المكتبية، السجلات، الملفات، منظمات المكاتب، والأدوات المعتمدة التي تنظم بيئة عملك وتدوم طويلاً.',
  },
  {
    index: '02',
    title: 'أقلام فاخرة ولوازم دراسة وفنون',
    body: 'تشكيلة راقية من أقلام التوقيع الفاخرة، مستلزمات الهندسة والرسم والخط العربي، وكافة اللوازم الجامعية والمدرسية.',
  },
  {
    index: '03',
    title: 'حقائب مهنية وقياسات متعددة حسب احتياجك',
    body: 'حقائب حاسوب متينة ومنتجات بقياسات متعددة بأسعار واضحة لكل قياس، مع توصيل سريع إلى الأغواط و54 ولاية عبر ZR Express.',
  },
];

const BACKEND_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
  'https://techno-laghouat-backend.hotel-saharien.workers.dev';

export function BranchSection({ savedOrders }: BranchSectionProps) {
  const [selectedWilayaLabel, setSelectedWilayaLabel] = useState<string>(DEFAULT_WILAYA);
  const [showAllLaghouatBureaus, setShowAllLaghouatBureaus] = useState(false);
  const [lookupInput, setLookupInput] = useState('');
  const [searchedCode, setSearchedCode] = useState<string | null>(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [liveOrder, setLiveOrder] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedRate = findWilayaRate(selectedWilayaLabel);

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignore clipboard fallback
    }
  };

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = lookupInput.trim();
    if (!query) return;
    setSearchedCode(query);
    setIsSearchingOnline(true);
    setLiveOrder(null);

    try {
      const res = await fetch(
        `${BACKEND_URL.replace(/\/+$/, '')}/api/track?orderId=${encodeURIComponent(query)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.found && data?.order) {
          setLiveOrder(data.order);
          setIsSearchingOnline(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Online tracking lookup failed:', err);
    }

    const normalized = query.toUpperCase();
    const local = savedOrders.find((o) => {
      const oClean = o.orderId.toUpperCase();
      return (
        oClean === normalized ||
        oClean.replace(/[^A-Z0-9]/g, '') === normalized.replace(/[^A-Z0-9]/g, '')
      );
    });
    if (local) {
      setLiveOrder({
        orderId: local.orderId,
        status: (local as any).status || 'pending',
        statusLabel:
          (local as any).status === 'confirmed'
            ? 'تم تأكيد الطلب'
            : (local as any).status === 'cancelled'
            ? 'تم إلغاء الطلب'
            : 'تم استلام الطلب وهو تحت المعالجة',
        customerName: local.customer.fullName,
        deliveryMethod: local.customer.deliveryMethod,
        wilaya: local.customer.wilaya,
        commune: local.customer.commune,
        items: local.items,
        totalDzd: local.totals.totalDzd,
      });
    } else {
      setLiveOrder(null);
    }
    setIsSearchingOnline(false);
  };

  // Determine current tracking stage: 1=Received, 2=Confirmed, 3=Shipped/Ready
  const currentStage =
    liveOrder?.status === 'confirmed' ? 2 : liveOrder?.status === 'cancelled' ? 0 : 1;

  return (
    <>
      {/* Interactive Nationwide ZR Express Delivery Tariff Calculator */}
      <section
        id="delivery-rates"
        className="py-16 lg:py-20 border-t border-stone-200/80 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD100]/20 text-[#18181B] text-xs font-bold border border-[#FFD100]/50">
                <Truck className="w-3.5 h-3.5 text-[#E30613]" />
                <span>التوصيل الرسمي عبر {STORE_INFO.deliveryPartner}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#18181B] text-balance">
                تعرف على سعر التوصيل إلى ولايتك فوراً
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-[#52525B]">
                نوصل طلباتكم من فرع تكنو الأغواط إلى كافة بلديات ولاية الأغواط (24 مكتباً
                وبلدية) وإلى 54 ولاية جزائرية مع الدفع نقداً عند الاستلام. اختر ولايتك لمعاينة
                تعريفة التوصيل للمنزل أو الاستلام من المكتب.
              </p>

              <div className="pt-2">
                <label
                  htmlFor="calculator-wilaya-select"
                  className="block text-sm font-semibold text-[#18181B] mb-2"
                >
                  اختر الولاية:
                </label>
                <select
                  id="calculator-wilaya-select"
                  data-testid="calculator-wilaya-select"
                  value={selectedWilayaLabel}
                  onChange={(e) => setSelectedWilayaLabel(e.target.value)}
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-stone-300 text-sm font-semibold bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E30613]/20 focus:border-[#E30613]"
                >
                  {WILAYA_DELIVERY_RATES.map((rate) => {
                    const label = formatWilayaLabel(rate);
                    return (
                      <option key={rate.code} value={label}>
                        {label} ({rate.nameFr})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 sm:p-7 rounded-2xl bg-[#FAF9F6] border border-stone-200 shadow-xs space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-stone-200">
                  <div>
                    <p className="text-xs text-[#71717A]">التسعيرة الرسمية لولاية</p>
                    <h3
                      data-testid="calculator-selected-wilaya"
                      className="font-display text-xl sm:text-2xl font-bold text-[#18181B] mt-0.5"
                    >
                      {selectedRate.code} — {selectedRate.nameAr} ({selectedRate.nameFr})
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD100] text-[#18181B] text-xs font-bold shadow-xs">
                    الدفع عند الاستلام
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Home Delivery Rate */}
                  <div className="group p-5 rounded-xl bg-white border border-stone-200 hover:border-[#E30613]/40 transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 text-[#18181B]">
                      <div className="w-8 h-8 rounded-lg bg-[#E30613]/10 flex items-center justify-center text-[#E30613]">
                        <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </div>
                      <span className="font-display text-base font-bold">
                        التوصيل لباب المنزل
                      </span>
                    </div>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                      خدمة À Domicile: يصلك المندوب مباشرة إلى عنوانك مع الدفع نقداً عند الاستلام.
                    </p>
                    <p
                      data-testid="calculator-home-fee"
                      className="font-display text-2xl font-bold text-[#E30613] tabular-nums pt-2 border-t border-stone-100"
                    >
                      {formatDzd(selectedRate.homeFeeDzd)}
                    </p>
                  </div>

                  {/* Stop Desk Rate */}
                  <div className="group p-5 rounded-xl bg-white border border-stone-200 hover:border-[#18181B]/40 transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 text-[#18181B]">
                      <div className="w-8 h-8 rounded-lg bg-[#FFD100]/25 flex items-center justify-center text-[#18181B]">
                        <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </div>
                      <span className="font-display text-base font-bold">
                        استلام من المكتب (Stop Desk)
                      </span>
                    </div>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                      {selectedRate.stopDeskFeeDzd !== null
                        ? 'استلام اقتصادي وسريع من أقرب مكتب ZR Express في ولايتك.'
                        : `خدمة المكتب غير متوفرة حالياً في ولاية ${selectedRate.nameAr} — التوصيل لباب المنزل متوفر.`}
                    </p>
                    <p
                      data-testid="calculator-stopdesk-fee"
                      className={`font-display text-2xl font-bold tabular-nums pt-2 border-t border-stone-100 ${
                        selectedRate.stopDeskFeeDzd !== null
                          ? 'text-[#18181B]'
                          : 'text-sm text-[#71717A]'
                      }`}
                    >
                      {selectedRate.stopDeskFeeDzd !== null
                        ? formatDzd(selectedRate.stopDeskFeeDzd)
                        : 'متوفر للمنزل فقط'}
                    </p>
                  </div>
                </div>

                {/* Laghouat 24 Bureaus Coverage Drawer when 03 Laghouat is selected */}
                {selectedRate.code === '03' ? (
                  <div className="pt-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-[#18181B]">
                        تغطية 24 بلدية ومكتب داخل ولاية الأغواط (500 د.ج للمنزل · 380 د.ج للمكتب):
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAllLaghouatBureaus((prev) => !prev)}
                        className="text-xs font-bold text-[#E30613] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {showAllLaghouatBureaus ? 'إخفاء القائمة' : 'عرض جميع البلديات (24)'}
                      </button>
                    </div>

                    {showAllLaghouatBureaus ? (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#52525B]">
                        {LAGHOUAT_BUREAUS.map((bureau) => (
                          <div
                            key={bureau.nameFr}
                            className="px-3 py-2 rounded-lg bg-white border border-stone-200 flex items-center justify-between gap-1 shadow-2xs"
                          >
                            <span className="font-medium text-[#18181B] truncate">
                              {bureau.nameAr}
                            </span>
                            <span className="font-mono text-[11px] text-[#71717A] shrink-0">
                              380/500
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship & Brand Identity Section */}
      <section
        id="craftsmanship"
        className="py-16 lg:py-20 border-t border-stone-200/80 bg-[#FAF9F6]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border-2 border-[#FFD100] bg-[#FFD100] shadow-md p-1">
                <div className="aspect-[5/4] w-full rounded-xl overflow-hidden bg-white">
                  <ProductImage
                    src={BRAND_BANNER_IMAGE}
                    alt="شعار تكنو ستيشنري الرسمي — تكنو ترافقك في رسم مسيرتك المهنية"
                    fallbackTitle="TECHNO STATIONERY"
                    fallbackCode="الأغواط"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between text-xs text-[#71717A]">
                <span className="font-bold text-[#E30613]">{STORE_INFO.secondarySlogan}</span>
                <span className="font-medium text-[#18181B]">{STORE_INFO.heritageLine}</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E30613]/10 text-[#E30613] text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>جودة تكنو المعتمدة — أصلية 100%</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#18181B] text-balance">
                لماذا يختار المهنيون والأساتذة والطلبة فرع تكنو الأغواط؟
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#52525B]">
                بخبرة تتجاوز 25 سنة كعلامة رائدة في الأدوات المكتبية والمهنية بالجزائر، يوفر فرعنا في
                الأغواط كل ما تحتاجه لمسيرتك اليومية بأعلى معايير الجودة والأصالة.
              </p>

              <div className="mt-8 divide-y divide-stone-200 border-t border-stone-200">
                {CRAFTSMANSHIP_PILLARS.map((pillar) => (
                  <div
                    key={pillar.index}
                    className="py-5 grid grid-cols-12 gap-4 items-baseline"
                  >
                    <span className="col-span-2 sm:col-span-1 font-mono text-sm font-bold text-[#E30613] tabular-nums">
                      {pillar.index}.
                    </span>
                    <div className="col-span-10 sm:col-span-11">
                      <h3 className="font-display text-base font-bold text-[#18181B]">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#52525B]">
                        {pillar.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branch Info & LEGENDARY TECHNO ORDER TRACKER */}
      <section
        id="branch"
        className="py-16 lg:py-24 border-t border-stone-200/80 bg-stone-50/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Storefront Card */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-xs font-bold text-[#E30613] uppercase tracking-wide">
                  فرع الأغواط الرسمي مفتوح
                </p>
              </div>

              <h3 className="font-display text-xl font-bold text-[#18181B]">
                {STORE_INFO.fullTitle}
              </h3>

              <ul className="mt-5 space-y-4 text-sm text-[#52525B]">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFD100]/25 flex items-center justify-center text-[#18181B] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">الموقع والعنوان</p>
                    <p className="mt-0.5 leading-relaxed">{STORE_INFO.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFD100]/25 flex items-center justify-center text-[#18181B] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">أوقات العمل والاستقبال</p>
                    <p className="mt-0.5">{STORE_INFO.hours}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFD100]/25 flex items-center justify-center text-[#18181B] shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">رقم الهاتف المباشر</p>
                    <a
                      href={STORE_INFO.phoneHref}
                      dir="ltr"
                      className="font-mono font-bold text-[#18181B] hover:text-[#E30613] transition-colors block mt-0.5"
                    >
                      {STORE_INFO.phoneDisplay}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* LEGENDARY ORDER TRACKING LOOKUP (Matching TECHNO Brand & Logo Aesthetics) */}
            <div
              id="track"
              className="lg:col-span-7 rounded-3xl bg-white border-2 border-[#FFD100] shadow-lg overflow-hidden"
            >
              {/* Distinctive TECHNO Yellow Header Badge */}
              <div className="bg-[#FFD100] px-6 sm:px-8 py-5 border-b border-[#E5BC00] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TechnoLogo size="sm" showBranch={false} />
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#18181B] leading-none">
                      تتبع حالة طلبك
                    </h2>
                    <p className="text-xs text-[#18181B]/80 font-medium mt-1">
                      منظومة المتابعة اللحظية المباشرة لفرع الأغواط
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] text-[#FFD100] text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FFD100] animate-pulse" />
                  <span>تحديث فوري</span>
                </span>
              </div>

              {/* Lookup Form Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-sm text-[#52525B] leading-relaxed">
                  أدخل كود تتبع طلبك السري المكون من 12 خانة لمراجعة تفاصيل فاتورتك وحالة التجهيز والشحن مباشرة من خوادم تكنو.
                </p>

                <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="order-lookup-input" className="sr-only">
                    كود الطلب
                  </label>
                  <div className="relative flex-1">
                    <input
                      id="order-lookup-input"
                      type="text"
                      dir="ltr"
                      placeholder="TL-XXXX-XXXX-XXXX"
                      value={lookupInput}
                      onChange={(e) => setLookupInput(e.target.value)}
                      className="w-full px-4 py-3 min-h-[50px] rounded-xl border-2 border-stone-200 font-mono text-base font-bold text-center tracking-wider text-[#18181B] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10 transition-all uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3 min-h-[50px] rounded-xl bg-[#E30613] text-white text-sm font-bold hover:bg-[#C4000F] active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>تحقق من الطلب</span>
                  </button>
                </form>

                {savedOrders.length > 0 && searchedCode === null ? (
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#71717A]">طلبك الأخير المحفوظ على هذا الجهاز:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const latest = savedOrders[0].orderId;
                        setLookupInput(latest);
                        setSearchedCode(latest);
                      }}
                      className="font-mono font-bold text-[#E30613] hover:underline cursor-pointer"
                    >
                      {savedOrders[0].orderId}
                    </button>
                  </div>
                ) : null}

                {/* Loading state */}
                {isSearchingOnline ? (
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                    <Loader2 className="w-7 h-7 animate-spin text-[#E30613] mx-auto" />
                    <p className="text-xs font-semibold text-[#52525B]">
                      جاري فحص حالة الطلب وتأكيده مع خادم المتجر...
                    </p>
                  </div>
                ) : searchedCode !== null ? (
                  liveOrder ? (
                    <div
                      data-testid="order-lookup-result"
                      className="rounded-2xl border-2 border-stone-200 bg-white overflow-hidden shadow-xs space-y-0"
                    >
                      {/* Result Header Bar */}
                      <div className="p-5 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-base sm:text-lg text-[#18181B] tracking-wide">
                            #{liveOrder.orderId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(liveOrder.orderId)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-stone-200 text-xs font-medium text-[#52525B] hover:text-[#18181B] hover:border-stone-400 transition-colors cursor-pointer"
                            title="نسخ كود الطلب"
                          >
                            {copiedCode ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Status Badge */}
                        {liveOrder.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>تم تأكيد الطلب من صاحب المتجر</span>
                          </span>
                        ) : liveOrder.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-800 text-xs font-bold border border-red-300 shadow-2xs">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>تم إلغاء الطلب</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFD100]/30 text-amber-950 text-xs font-bold border border-[#FFD100] shadow-2xs">
                            <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                            <span>تم استلام الطلب وهو تحت المعالجة</span>
                          </span>
                        )}
                      </div>

                      {/* LEGENDARY 3-STEP INTERACTIVE PROGRESS PIPELINE */}
                      {liveOrder.status !== 'cancelled' ? (
                        <div className="p-5 sm:p-6 bg-gradient-to-b from-stone-50/50 to-white border-b border-stone-200">
                          <p className="text-xs font-bold text-[#71717A] mb-4">
                            مراحل معالجة وشحن طلبك:
                          </p>

                          <div className="relative flex items-center justify-between">
                            {/* Background Connecting Bar */}
                            <div className="absolute top-1/2 right-6 left-6 -translate-y-1/2 h-1 bg-stone-200 z-0">
                              <div
                                className="h-full bg-[#E30613] transition-all duration-500"
                                style={{
                                  width:
                                    currentStage === 2
                                      ? '100%'
                                      : currentStage === 1
                                      ? '50%'
                                      : '0%',
                                }}
                              />
                            </div>

                            {/* Step 1: Received */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div className="w-10 h-10 rounded-full bg-[#E30613] text-white flex items-center justify-center font-bold text-sm shadow-md">
                                <Check className="w-5 h-5 stroke-[2.5]" />
                              </div>
                              <span className="mt-2 text-xs font-bold text-[#18181B]">
                                1. تم استلام الطلب
                              </span>
                              <span className="text-[10px] text-[#71717A]">مشفر بالنظام</span>
                            </div>

                            {/* Step 2: Confirmed & Processing */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                                  currentStage >= 2
                                    ? 'bg-[#E30613] text-white'
                                    : 'bg-[#FFD100] text-[#18181B] ring-4 ring-[#FFD100]/30 animate-pulse'
                                }`}
                              >
                                {currentStage >= 2 ? (
                                  <Check className="w-5 h-5 stroke-[2.5]" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </div>
                              <span className="mt-2 text-xs font-bold text-[#18181B]">
                                2. مراجعة وتأكيد
                              </span>
                              <span className="text-[10px] text-[#71717A]">
                                {currentStage >= 2 ? 'مؤكد من الإدارة' : 'قيد المراجعة'}
                              </span>
                            </div>

                            {/* Step 3: Out for Delivery */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                                  currentStage >= 2
                                    ? 'bg-[#18181B] text-[#FFD100] ring-4 ring-[#18181B]/15'
                                    : 'bg-stone-200 text-[#71717A]'
                                }`}
                              >
                                <Package className="w-5 h-5" />
                              </div>
                              <span className="mt-2 text-xs font-bold text-[#18181B]">
                                3. التجهيز والشحن
                              </span>
                              <span className="text-[10px] text-[#71717A]">عبر ZR Express</span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Live Status Explanatory Notice */}
                      <div className="p-5 sm:p-6 space-y-4">
                        {liveOrder.status === 'confirmed' ? (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-emerald-950">
                                رائع! تم تأكيد طلبك رسمياً من قِبل إدارة متجر تكنو الأغواط
                              </p>
                              <p className="mt-1 text-emerald-800">
                                تم تجهيز الطرد وسيتم تسليمه أو إرساله مع مندوب ZR Express إلى عنوانك المختار. الدفع يتم نقداً عند الاستلام.
                              </p>
                            </div>
                          </div>
                        ) : liveOrder.status === 'cancelled' ? (
                          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-red-950">تم إلغاء هذا الطلب</p>
                              <p className="mt-1 text-red-800">
                                نعتذر، تم إلغاء الطلب بناءً على رغبة العميل أو لعدم توفر المخزون. إذا كنت ترغب في الاستفسار أو إعادة الطلب يمكنك الاتصال بالمتجر.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-amber-950">
                                الطلب مستلم وهو تحت المعالجة حالياً
                              </p>
                              <p className="mt-1 text-amber-900">
                                سنقوم بمراجعة الطلب والاتصال بك هاتفياً لتأكيده وتحديد موعد التسليم في أقرب وقت.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Customer & Delivery Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                          <div>
                            <span className="text-[#71717A] block">العميل:</span>
                            <span className="font-bold text-[#18181B] text-sm">
                              {liveOrder.customerName || liveOrder.customer?.fullName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#71717A] block">طريقة الاستلام:</span>
                            <span className="font-bold text-[#18181B]">
                              {getDeliveryMethodTitle(liveOrder.deliveryMethod || liveOrder.customer?.deliveryMethod)}
                            </span>
                            <span className="text-[#52525B] block mt-0.5">
                              {liveOrder.wilaya || liveOrder.customer?.wilaya}
                              {liveOrder.commune || liveOrder.customer?.commune
                                ? ` — ${liveOrder.commune || liveOrder.customer?.commune}`
                                : ''}
                            </span>
                          </div>
                        </div>

                        {/* Items list */}
                        {Array.isArray(liveOrder.items) && liveOrder.items.length > 0 ? (
                          <div className="border border-stone-200 rounded-xl p-3.5 space-y-2">
                            <p className="text-xs font-bold text-[#71717A]">تفاصيل المعروضات في الطلب:</p>
                            <ul className="divide-y divide-stone-100 text-xs">
                              {liveOrder.items.map((i: any, idx: number) => (
                                <li key={idx} className="py-2 flex items-center justify-between gap-2">
                                  <span className="font-medium text-[#18181B]">
                                    {i.name}
                                    {i.variantLabel ? ` [${i.variantLabel}]` : ''}
                                  </span>
                                  <span className="font-mono font-bold text-[#E30613] shrink-0">
                                    ×{i.quantity || 1}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {/* Total DZD */}
                        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-sm font-bold text-[#18181B]">
                          <span>المبلغ الإجمالي عند الاستلام:</span>
                          <span className="font-mono text-xl font-black text-[#E30613] tabular-nums">
                            {formatDzd(liveOrder.totalDzd || liveOrder.totals?.totalDzd || 0)}
                          </span>
                        </div>

                        {/* Instant Customer Support CTAs */}
                        <div className="pt-2 flex flex-wrap gap-2.5">
                          <a
                            href={`https://wa.me/213560154663?text=${encodeURIComponent(
                              `مرحباً تكنو الأغواط، أود الاستفسار بخصوص طلبي رقم #${liveOrder.orderId}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>استفسر عبر واتساب</span>
                          </a>
                          <a
                            href={STORE_INFO.phoneHref}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#18181B] text-xs font-bold transition-all border border-stone-300"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#E30613]" />
                            <span>اتصل بالفرع</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      role="status"
                      className="p-4 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs sm:text-sm font-medium leading-relaxed"
                    >
                      لم يتم العثور على طلب بالرقم «<span className="font-mono font-bold">{searchedCode}</span>». يرجى التأكد من كتابة الكود بشكل صحيح (مثل TL-XXXX-XXXX-XXXX) أو الاتصال بنا.
                    </div>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
