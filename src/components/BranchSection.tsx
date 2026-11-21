import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  QrCode,
  ShieldAlert,
  Play,
  RotateCcw,
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
  const [communeSearch, setCommuneSearch] = useState('');
  const [lookupInput, setLookupInput] = useState('');
  const [searchedCode, setSearchedCode] = useState<string | null>(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [liveOrder, setLiveOrder] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedRate = findWilayaRate(selectedWilayaLabel);

  // Check if store is currently open (Algeria Time: UTC+1, 08:30 - 20:00, Closed Friday)
  const isStoreOpen = (() => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const dzHours = (utcHours + 1) % 24;
    const day = now.getUTCDay(); // 5 is Friday
    return day !== 5 && dzHours >= 8.5 && dzHours < 20;
  })();

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignore
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

  const currentStage =
    liveOrder?.status === 'confirmed' ? 2 : liveOrder?.status === 'cancelled' ? 0 : 1;

  return (
    <>
      {/* Nationwide ZR Express Delivery Tariff Calculator */}
      <section
        id="delivery-rates"
        className="py-16 lg:py-24 border-t-2 border-stone-300 bg-lined-paper relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="stamp-red text-xs">الشريك اللوجستي ZR Express</span>
                <span className="stamp-yellow text-xs">الدفع عند الاستلام</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-black text-[#18181B] text-balance">
                <span className="highlight-yellow">تسعيرة التوصيل الرسمي لكافة ولايات الجزائر</span>
              </h2>
              <p className="text-sm sm:text-base font-bold leading-relaxed text-[#52525B]">
                نوصل طلباتكم من فرع تكنو الأغواط إلى كافة بلديات ولاية الأغواط (24 مكتباً
                وبلدية) وإلى 54 ولاية جزائرية مع الدفع نقداً عند الاستلام. اختر ولايتك لمعاينة
                تعريفة التوصيل للمنزل أو الاستلام من المكتب.
              </p>

              <div className="pt-2">
                <label
                  htmlFor="calculator-wilaya-select"
                  className="block text-sm font-black text-[#18181B] mb-2"
                >
                  اختر ولايتك للمعاينة:
                </label>
                <select
                  id="calculator-wilaya-select"
                  data-testid="calculator-wilaya-select"
                  value={selectedWilayaLabel}
                  onChange={(e) => setSelectedWilayaLabel(e.target.value)}
                  className="w-full px-4 py-3.5 min-h-[50px] rounded-2xl border-2 border-[#18181B] text-sm font-black bg-white shadow-[2px_2px_0px_#18181B] focus:bg-[#FFD100]/10 focus:outline-none"
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
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] space-y-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4 border-b-2 border-stone-200">
                  <div>
                    <p className="text-xs text-[#71717A] font-bold">التسعيرة المعتمدة لولاية:</p>
                    <h3
                      data-testid="calculator-selected-wilaya"
                      className="font-display text-xl sm:text-2xl font-black text-[#18181B] mt-0.5"
                    >
                      {selectedRate.code} — {selectedRate.nameAr} ({selectedRate.nameFr})
                    </h3>
                  </div>
                  <span className="stamp-yellow text-xs font-black">
                    الدفع عند الاستلام
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Home Delivery Rate */}
                  <div className="group p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#E30613] transition-all duration-200 flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-[#18181B]">
                      <div className="w-9 h-9 rounded-xl bg-[#E30613] text-white flex items-center justify-center border-2 border-[#18181B]">
                        <Truck className="w-5 h-5 shrink-0" aria-hidden="true" />
                      </div>
                      <span className="font-display text-base font-black">
                        التوصيل لباب المنزل
                      </span>
                    </div>
                    <p className="text-xs text-[#52525B] font-bold leading-relaxed">
                      خدمة À Domicile: يصلك المندوب مباشرة إلى عنوانك مع الدفع نقداً عند الاستلام.
                    </p>
                    <p
                      data-testid="calculator-home-fee"
                      className="font-display text-2xl font-black text-[#E30613] tabular-nums pt-3 border-t-2 border-stone-200 highlight-yellow"
                    >
                      {formatDzd(selectedRate.homeFeeDzd)}
                    </p>
                  </div>

                  {/* Stop Desk Rate */}
                  <div className="group p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#FFD100] transition-all duration-200 flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-[#18181B]">
                      <div className="w-9 h-9 rounded-xl bg-[#FFD100] text-[#18181B] flex items-center justify-center border-2 border-[#18181B]">
                        <Building2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                      </div>
                      <span className="font-display text-base font-black">
                        استلام من المكتب (Stop Desk)
                      </span>
                    </div>
                    <p className="text-xs text-[#52525B] font-bold leading-relaxed">
                      {selectedRate.stopDeskFeeDzd !== null
                        ? 'استلام اقتصادي وسريع من أقرب مكتب ZR Express في ولايتك.'
                        : `خدمة المكتب غير متوفرة حالياً في ولاية ${selectedRate.nameAr} — التوصيل للمنزل متوفر.`}
                    </p>
                    <p
                      data-testid="calculator-stopdesk-fee"
                      className={`font-display text-2xl font-black tabular-nums pt-3 border-t-2 border-stone-200 ${
                        selectedRate.stopDeskFeeDzd !== null
                          ? 'text-[#18181B] highlight-yellow'
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
                      <p className="text-xs font-bold text-[#18181B]">
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
                      <div className="mt-3 space-y-3">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="search"
                            placeholder="ابحث في بلديات الأغواط (مثال: آفلو، عين ماضي، قصر الحيران...)"
                            value={communeSearch}
                            onChange={(e) => setCommuneSearch(e.target.value)}
                            className="w-full pr-8 pl-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-[#E30613]"
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#52525B] max-h-60 overflow-y-auto p-1">
                          {LAGHOUAT_BUREAUS.filter((b) =>
                            communeSearch.trim() === ''
                              ? true
                              : b.nameAr.includes(communeSearch.trim()) ||
                                b.nameFr.toLowerCase().includes(communeSearch.trim().toLowerCase()),
                          ).map((bureau) => (
                            <div
                              key={bureau.nameFr}
                              className="px-3 py-2 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-1 shadow-2xs hover:border-[#FFD100] transition-colors"
                            >
                              <span className="font-semibold text-[#18181B] truncate">
                                {bureau.nameAr}
                              </span>
                              <span className="font-mono text-[11px] text-stone-500 shrink-0 font-bold">
                                380 / 500
                              </span>
                            </div>
                          ))}
                        </div>
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
        className="py-16 lg:py-24 border-t border-stone-200/80 bg-[#FAF9F6]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border-4 border-[#FFD100] bg-[#FFD100] shadow-xl p-1.5">
                <div className="aspect-[5/4] w-full rounded-2xl overflow-hidden bg-white">
                  <ProductImage
                    src={BRAND_BANNER_IMAGE}
                    alt="شعار تكنو ستيشنري الرسمي — تكنو ترافقك في رسم مسيرتك المهنية"
                    fallbackTitle="TECHNO STATIONERY"
                    fallbackCode="الأغواط"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[#71717A]">
                <span className="font-bold text-[#E30613]">{STORE_INFO.secondarySlogan}</span>
                <span className="font-bold text-[#18181B]">{STORE_INFO.heritageLine}</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E30613]/10 text-[#E30613] text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>جودة تكنو المعتمدة — أصلية 100%</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#18181B] text-balance">
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
                    <span className="col-span-2 sm:col-span-1 font-mono text-base font-black text-[#E30613] tabular-nums">
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

      {/* Branch Storefront & THE CYBER-STATIONERY ORDER TRACKING TERMINAL */}
      <section
        id="branch"
        className="py-16 lg:py-24 border-t-2 border-stone-300 bg-lined-paper relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Storefront Physical Branch Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isStoreOpen ? 'bg-emerald-500 animate-ping' : 'bg-stone-400'
                    }`}
                  />
                  <p className="text-xs font-black text-[#E30613] uppercase tracking-wider">
                    {isStoreOpen ? 'الفرع مفتوح الآن لاستقبالكم' : 'الفرع مغلق حالياً'}
                  </p>
                </div>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-[#FFD100] text-[#18181B] font-mono border border-[#18181B]">
                  الأغواط · UTC+1
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-black text-[#18181B]">
                {STORE_INFO.fullTitle}
              </h3>

              <ul className="space-y-4 text-sm text-[#52525B]">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD100] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-[#18181B] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-[#E30613]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#18181B]">الموقع والعنوان</p>
                    <p className="mt-0.5 font-bold leading-relaxed">{STORE_INFO.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        'Techno Stationery Laghouat حي المقام الأغواط',
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-black text-[#E30613] hover:underline mt-1"
                    >
                      <span>افتح الموقع في خرائط Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD100] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-[#18181B] shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-[#E30613]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#18181B]">أوقات العمل والاستقبال</p>
                    <p className="mt-0.5 font-bold">{STORE_INFO.hours}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD100] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-[#18181B] shrink-0 mt-0.5">
                    <Phone className="w-5 h-5 text-[#E30613]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#18181B]">رقم الهاتف المباشر</p>
                    <a
                      href={STORE_INFO.phoneHref}
                      dir="ltr"
                      className="font-mono font-black text-[#18181B] hover:text-[#E30613] transition-colors block mt-0.5 text-base"
                    >
                      {STORE_INFO.phoneDisplay}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* THE LEGENDARY TECHNO ORDER TRACKING TERMINAL */}
            <div
              id="track"
              className="lg:col-span-7 rounded-3xl bg-white border-4 border-[#18181B] shadow-[8px_8px_0px_#18181B] overflow-hidden"
            >
              {/* Authentic TECHNO Yellow Hardware Terminal Header */}
              <div className="bg-[#FFD100] px-6 sm:px-8 py-5 border-b-2 border-[#E5BC00] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <TechnoLogo size="md" showBranch={false} />
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-black text-[#18181B] leading-none">
                      منظومة تتبع الشحنات الرسمية
                    </h2>
                    <p className="text-xs text-[#18181B]/85 font-bold mt-1">
                      TECHNO LAGHOUAT PARCEL RADAR
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="stamp-red text-[11px] font-black">
                    رادار التتبع المباشر
                  </span>
                </div>
              </div>

              {/* Terminal Form Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                  أدخل كود تتبع طلبك السري المكون من 12 خانة لمراجعة مسار التجهيز والشحن مباشرة من خوادم تكنو.
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
                      className="w-full px-4 py-3.5 min-h-[52px] rounded-2xl border-2 border-stone-300 font-mono text-base font-black text-center tracking-wider text-[#18181B] bg-stone-50 focus:bg-white focus:outline-none focus:border-[#E30613] focus:ring-4 focus:ring-[#E30613]/15 transition-all uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="animate-sheen inline-flex items-center justify-center gap-2.5 px-8 py-3.5 min-h-[52px] rounded-2xl bg-[#E30613] text-white text-sm font-black hover:bg-[#C4000F] active:scale-95 transition-all shadow-md whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>فحص وتتبع الطلب</span>
                  </button>
                </form>

                {savedOrders.length > 0 && searchedCode === null ? (
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#71717A] font-medium">طلبك المحفوظ على هذا الجهاز:</span>
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
                  <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E30613] mx-auto" />
                    <p className="text-xs font-bold text-[#52525B]">
                      جاري الاتصال بقاعدة بيانات متجر تكنو الأغواط وفحص حالة الشحنة...
                    </p>
                  </div>
                ) : searchedCode !== null ? (
                  liveOrder ? (
                    <div
                      data-testid="order-lookup-result"
                      className="rounded-3xl border-2 border-stone-300 bg-white overflow-hidden shadow-lg space-y-0"
                    >
                      {/* Result Top Bar with Digital Seal */}
                      <div className="p-5 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] text-stone-400 block font-mono">
                              TRACKING ID:
                            </span>
                            <span className="font-mono font-black text-lg text-[#FFD100] tracking-wide">
                              #{liveOrder.orderId}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(liveOrder.orderId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-300 hover:text-white transition-colors cursor-pointer"
                            title="نسخ كود الطلب"
                          >
                            {copiedCode ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">تم النسخ</span>
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
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/50">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>تم تأكيد الطلب رسميّاً</span>
                          </span>
                        ) : liveOrder.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/50">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span>تم إلغاء الطلب</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFD100]/25 text-[#FFD100] text-xs font-bold border border-[#FFD100]/50">
                            <Clock className="w-4 h-4 text-[#FFD100] animate-spin" />
                            <span>تم استلام الطلب وهو تحت المعالجة</span>
                          </span>
                        )}
                      </div>

                      {/* 3-STEP VISUAL PIPELINE */}
                      {liveOrder.status !== 'cancelled' ? (
                        <div className="p-6 bg-gradient-to-b from-stone-50 to-white border-b border-stone-200">
                          <p className="text-xs font-bold text-[#71717A] mb-5">
                            مسار معالجة وشحن طلبيتك عبر ZR Express:
                          </p>

                          <div className="relative flex items-center justify-between">
                            {/* Background Bar */}
                            <div className="absolute top-1/2 right-6 left-6 -translate-y-1/2 h-1.5 bg-stone-200 z-0 rounded-full">
                              <div
                                className="h-full bg-[#E30613] rounded-full transition-all duration-700"
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
                              <div className="w-11 h-11 rounded-full bg-[#E30613] text-white flex items-center justify-center font-bold text-sm shadow-md">
                                <Check className="w-5 h-5 stroke-[3]" />
                              </div>
                              <span className="mt-2 text-xs font-bold text-[#18181B]">
                                1. تم استلام الطلب
                              </span>
                              <span className="text-[10px] text-stone-500 font-semibold">
                                مشفر بالنظام
                              </span>
                            </div>

                            {/* Step 2: Confirmed */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                                  currentStage >= 2
                                    ? 'bg-[#E30613] text-white'
                                    : 'bg-[#FFD100] text-[#18181B] ring-4 ring-[#FFD100]/40 animate-pulse'
                                }`}
                              >
                                {currentStage >= 2 ? (
                                  <Check className="w-5 h-5 stroke-[3]" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </div>
                              <span className="mt-2 text-xs font-bold text-[#18181B]">
                                2. مراجعة وتأكيد
                              </span>
                              <span className="text-[10px] text-stone-500 font-semibold">
                                {currentStage >= 2 ? 'مؤكد من الإدارة' : 'قيد المراجعة'}
                              </span>
                            </div>

                            {/* Step 3: Out for Delivery */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                                  currentStage >= 2
                                    ? 'bg-[#18181B] text-[#FFD100] ring-4 ring-[#18181B]/20 animate-bounce'
                                    : 'bg-stone-200 text-stone-400'
                                }`}
                              >
                                <Package className="w-5 h-5" />
                              </div>
                              <span className="mt-2 text-xs font-bold text-[#18181B]">
                                3. التجهيز والشحن
                              </span>
                              <span className="text-[10px] text-stone-500 font-semibold">
                                عبر ZR Express
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Details & Barcode Box */}
                      <div className="p-6 space-y-4">
                        {liveOrder.status === 'confirmed' ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-semibold flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-emerald-950">
                                رائع! تم تأكيد طلبك رسمياً من قِبل إدارة متجر تكنو الأغواط
                              </p>
                              <p className="mt-1 text-emerald-800 font-medium">
                                تم تجهيز الطرد وسيتم تسليمه أو إرساله مع مندوب ZR Express إلى عنوانك المختار. الدفع يتم نقداً عند الاستلام.
                              </p>
                            </div>
                          </div>
                        ) : liveOrder.status === 'cancelled' ? (
                          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs sm:text-sm font-semibold flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-red-950">تم إلغاء هذا الطلب</p>
                              <p className="mt-1 text-red-800 font-medium">
                                نعتذر، تم إلغاء الطلب بناءً على رغبة العميل أو لعدم توفر المخزون. إذا كنت ترغب في الاستفسار يمكنك الاتصال بنا.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-semibold flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-amber-950">
                                الطلب مستلم وهو تحت المعالجة حالياً
                              </p>
                              <p className="mt-1 text-amber-900 font-medium">
                                سنقوم بمراجعة الطلب والاتصال بك هاتفياً لتأكيده وتحديد موعد التسليم في أقرب وقت.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Customer & Logistics Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
                          <div>
                            <span className="text-stone-500 block">العميل:</span>
                            <span className="font-bold text-[#18181B] text-sm">
                              {liveOrder.customerName || liveOrder.customer?.fullName}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">طريقة الاستلام:</span>
                            <span className="font-bold text-[#18181B]">
                              {getDeliveryMethodTitle(liveOrder.deliveryMethod || liveOrder.customer?.deliveryMethod)}
                            </span>
                            <span className="text-stone-600 block mt-0.5">
                              {liveOrder.wilaya || liveOrder.customer?.wilaya}
                              {liveOrder.commune || liveOrder.customer?.commune
                                ? ` — ${liveOrder.commune || liveOrder.customer?.commune}`
                                : ''}
                            </span>
                          </div>
                        </div>

                        {/* Items list */}
                        {Array.isArray(liveOrder.items) && liveOrder.items.length > 0 && (
                          <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
                            <p className="text-xs font-bold text-stone-500">تفاصيل المعروضات في الطلب:</p>
                            <ul className="divide-y divide-stone-100 text-xs">
                              {liveOrder.items.map((i: any, idx: number) => (
                                <li key={idx} className="py-2 flex items-center justify-between gap-2">
                                  <span className="font-semibold text-[#18181B]">
                                    {i.name}
                                    {i.variantLabel ? ` [${i.variantLabel}]` : ''}
                                  </span>
                                  <span className="font-mono font-black text-[#E30613] shrink-0">
                                    ×{i.quantity || 1}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Total DZD */}
                        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-sm font-bold text-[#18181B]">
                          <span>المبلغ الإجمالي عند الاستلام:</span>
                          <span className="font-mono text-2xl font-black text-[#E30613] tabular-nums">
                            {formatDzd(liveOrder.totalDzd || liveOrder.totals?.totalDzd || 0)}
                          </span>
                        </div>

                        {/* Visual Barcode Terminal Stamp */}
                        <div className="pt-3 border-t border-dashed border-stone-200 flex flex-col items-center justify-center text-center gap-1 opacity-80">
                          <div className="font-mono text-[9px] tracking-[0.4em] text-stone-400 select-none">
                            |||||| |||| ||||| ||||||| |||| |||||||| ||||
                          </div>
                          <span className="font-mono text-[10px] text-stone-400 font-semibold tracking-wider">
                            OFFICIAL TECHNO PARCEL • {liveOrder.orderId}
                          </span>
                        </div>

                        {/* Customer Support CTAs */}
                        <div className="pt-2 flex flex-wrap gap-3">
                          <a
                            href={`https://wa.me/213560154663?text=${encodeURIComponent(
                              `مرحباً تكنو الأغواط، أود الاستفسار بخصوص طلبي رقم #${liveOrder.orderId}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black transition-all shadow-md active:scale-95"
                          >
                            <MessageSquare className="w-4 h-4 fill-white" />
                            <span>استفسر عبر واتساب بخصوص هذا الطلب</span>
                          </a>
                          <a
                            href={STORE_INFO.phoneHref}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-[#18181B] text-xs font-bold transition-all border border-stone-300"
                          >
                            <Phone className="w-4 h-4 text-[#E30613]" />
                            <span>اتصل بالفرع</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      role="status"
                      className="p-5 rounded-2xl bg-red-50 text-red-950 border-2 border-red-200 text-xs sm:text-sm font-semibold leading-relaxed"
                    >
                      لم يتم العثور على طلب بالرقم «<span className="font-mono font-bold">{searchedCode}</span>». يرجى التأكد من كتابة الكود بشكل صحيح (مثل TL-XXXX-XXXX-XXXX) أو الضغط على زر «معاينة حية نموذجية» للتجربة.
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
