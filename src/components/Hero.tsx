import { useState } from 'react';
import {
  ArrowDownLeft,
  Images,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Building2,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_BANNER_IMAGE, STORE_INFO, type Product } from '../data/products';
import {
  formatDzd,
  getProductCategoryLabel,
  getProductImages,
  getProductPriceRange,
} from '../utils/storeLogic';
import { WILAYA_DELIVERY_RATES, findWilayaRate } from '../data/deliveryRates';
import { ProductImage } from './ProductImage';

interface HeroProps {
  products?: Product[];
  categoryCount?: number;
  onSelectProduct: (product: Product) => void;
  onQuickOrder: (product: Product, variantId?: string) => void;
}

// Interactive flagship showroom items when products array is hydrating or empty
const SHOWCASE_PILLARS = [
  {
    id: 'pens',
    title: 'أقلام التوقيع الفاخرة والخط العربي',
    category: 'كتابة راقية وتوقيعات',
    priceText: 'من 1,200 د.ج',
    tag: 'أقلام رسمية معتمدة',
    summary: 'أقلام رولر، حبر سائل فاخر، وأطقم خط عربي تمنحك سلاسة فائقة وهيبة في كل توقيع.',
    badge: 'الأكثر طلباً للأساتذة والمدراء',
    specs: ['حبر ملكي أزرق وأسود', 'هيكل معدني مصقول', 'علبة تقديم فاخرة'],
    filterQuery: 'قلم',
  },
  {
    id: 'bags',
    title: 'حقائب تكنو PROBAG للكمبيوتر والوثائق',
    category: 'حقائب أعمال متينة',
    priceText: 'من 4,500 د.ج',
    tag: 'حماية وأناقة متكاملة',
    summary: 'أقمشة وبطانات مقاومة للماء والاهتزازات مع جيوب سرية مبطنة للحواسيب حتى 17 بوصة.',
    badge: 'ضمان متانة تكنو 25 سنة',
    specs: ['مقاومة للماء والصدمات', 'مقابض جلدية مريحة', 'متوفرة بعدة قياسات'],
    filterQuery: 'حقيبة',
  },
  {
    id: 'architect',
    title: 'مستلزمات الهندسة المعمارية والرسم الفني',
    category: 'دقة هندسية معيارية',
    priceText: 'من 850 د.ج',
    tag: 'معايير دولية دقيقة',
    summary: 'أقلام تحبير فنية، ورق كانسون فاخر، مساطر ليزر، وحافظات مخططات معمارية متخصصة.',
    badge: 'معتمدة لطلبة ومهندسي الأغواط',
    specs: ['رؤوس معيارية 0.1 - 0.8 مم', 'ورق Canson أصلي', 'أدوات قياس ليزرية'],
    filterQuery: 'فنون',
  },
  {
    id: 'office',
    title: 'الساعات المكتبية والسجلات والتنظيم المؤسسي',
    category: 'أرشفة وهيبة مكتبية',
    priceText: 'من 1,800 د.ج',
    tag: 'تنظيم بيئة العمل',
    summary: 'ساعات حائطية ومكتبية صامتة، سجلات محاسبية مرقمة رسمياً، ومصنفات حفظ حديدية متينة.',
    badge: 'تجهيز مؤسسات وإدارات',
    specs: ['محركات كوارتز صامتة', 'سجلات رسمية مجلدة', 'ملفات فولاذية متينة'],
    filterQuery: 'مكتبي',
  },
];

export function Hero({
  products,
  categoryCount = 0,
  onSelectProduct,
  onQuickOrder,
}: HeroProps) {
  const allProducts = products ?? [];
  const [spotlightId, setSpotlightId] = useState<string>(allProducts[0]?.id ?? '');
  const [activeShowcaseIdx, setActiveShowcaseIdx] = useState(0);
  const [quickWilayaCode, setQuickWilayaCode] = useState('03');

  const activeProduct =
    allProducts.find((product) => product.id === spotlightId) ?? allProducts[0] ?? null;

  const activeImages = activeProduct ? getProductImages(activeProduct) : [];
  const activeRange = activeProduct ? getProductPriceRange(activeProduct) : null;
  const activeFirstVariantId = activeProduct?.variants?.[0]?.id;

  const quickRate = findWilayaRate(quickWilayaCode);
  const currentShowcase = SHOWCASE_PILLARS[activeShowcaseIdx];

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="top" className="relative overflow-hidden bg-ambient-techno bg-stationery-pattern border-b border-stone-200/90 py-12 lg:py-20">
      {/* Dynamic Ambient Glowing Shapes */}
      <div className="absolute top-1/4 right-0 w-[28rem] h-[28rem] bg-[#FFD100]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[24rem] h-[24rem] bg-[#E30613]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Main Editorial & Storytelling Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Official TECHNO Brand Heritage Pill */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-white/95 border-2 border-[#FFD100] shadow-sm backdrop-blur-md text-xs font-bold text-[#18181B] mb-5 select-none"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#E30613] animate-pulse" />
                <span className="text-[#18181B] font-display">{STORE_INFO.fullTitle}</span>
                <span aria-hidden="true" className="text-stone-300">|</span>
                <span className="text-[#E30613] font-black">{STORE_INFO.heritageLine}</span>
                <span aria-hidden="true" className="text-stone-300">|</span>
                <span className="text-stone-600 font-medium">العلامة ألي تفكر فيكم</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-[clamp(2.3rem,4.4vw,3.9rem)] font-black leading-[1.18] text-[#18181B] text-balance max-w-2xl"
              >
                كل ما تحتاجه لمسيرتك{' '}
                <span className="relative inline-block text-[#E30613]">
                  المهنية والدراسية
                  <span className="absolute -bottom-1.5 right-0 left-0 h-2.5 bg-[#FFD100] -z-10 rounded-full opacity-85" />
                </span>{' '}
                والإبداعية
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-base sm:text-lg leading-[1.8] text-[#52525B] max-w-xl"
              >
                {STORE_INFO.tagline}. تصفح تشكيلة فرع تكنو الأغواط الشاملة من{' '}
                <strong className="text-[#18181B] font-bold">
                  الأدوات المكتبية، حقائب الأعمال والحواسيب، أقلام التوقيع الفاخرة، لوازم الفنون والهندسة
                </strong>{' '}
                مع توصيل فائق السرعة عبر{' '}
                <span className="text-[#E30613] font-black underline underline-offset-4 decoration-[#FFD100] decoration-2">
                  ZR Express
                </span>{' '}
                إلى الأغواط و54 ولاية جزائرية والدفع نقداً عند الاستلام.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <a
                  href="#collection"
                  className="animate-sheen inline-flex items-center justify-center gap-2.5 px-7 py-4 min-h-[52px] rounded-2xl bg-[#E30613] text-white text-base font-bold hover:bg-[#C4000F] active:scale-95 transition-all shadow-lg shadow-[#E30613]/25 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E30613]"
                >
                  <span>تصفح الأقسام والمعروضات</span>
                  <ArrowDownLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
                </a>

                <a
                  href="#track"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[52px] rounded-2xl border-2 border-stone-300 bg-white/95 text-[#18181B] text-base font-bold hover:border-[#18181B] active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>تتبع حالة طلبك</span>
                </a>

                <a
                  href="#quick-order"
                  className="inline-flex items-center justify-center gap-2 px-5 py-4 min-h-[52px] rounded-2xl bg-[#FFD100] text-[#18181B] text-sm font-black hover:bg-[#E5BC00] active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-[#E30613]" />
                  <span>طلب مباشر</span>
                </a>
              </motion.div>

              {/* Interactive Quick Wilaya Delivery Peek Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-6 p-3.5 rounded-2xl bg-white/80 border border-stone-200/90 shadow-2xs max-w-xl flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#E30613]" />
                  <span className="font-bold text-[#18181B]">تسعيرة التوصيل المباشر:</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={quickWilayaCode}
                    onChange={(e) => setQuickWilayaCode(e.target.value)}
                    aria-label="اختر ولايتك لمعاينة سعر التوصيل السريع"
                    className="px-2.5 py-1 rounded-lg border border-stone-300 bg-white font-bold text-xs focus:outline-none focus:border-[#E30613]"
                  >
                    <option value="03">03 - الأغواط (محلي)</option>
                    <option value="17">17 - الجلفة</option>
                    <option value="16">16 - الجزائر العاصمة</option>
                    <option value="31">31 - وهران</option>
                    <option value="25">25 - قسنطينة</option>
                    <option value="47">47 - غرداية</option>
                    <option value="30">30 - ورقلة</option>
                    <option value="19">19 - سطيف</option>
                  </select>

                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-[#18181B]">
                      مكتب: {quickRate.stopDeskFeeDzd ? `${quickRate.stopDeskFeeDzd} د.ج` : 'غير متوفر'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#E30613]/10 text-[#E30613]">
                      منزل: {quickRate.homeFeeDzd} د.ج
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Live Interactive Statistics Ribbon */}
            <div className="mt-8 pt-6 border-t-2 border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl">
              <a
                href="#delivery-rates"
                className="p-3 rounded-xl bg-white/80 border border-stone-200/70 shadow-2xs hover:border-[#FFD100] transition-colors block"
              >
                <p className="text-[11px] font-semibold text-[#71717A]">تغطية التوصيل</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B] tabular-nums">
                  54 ولاية
                </p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">عبر ZR Express</p>
              </a>

              <a
                href="#delivery-rates"
                className="p-3 rounded-xl bg-white/80 border border-stone-200/70 shadow-2xs hover:border-[#E30613] transition-colors block"
              >
                <p className="text-[11px] font-semibold text-[#71717A]">ولاية الأغواط</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B] tabular-nums">
                  24 بلدية
                </p>
                <p className="text-[10px] text-[#E30613] font-bold mt-0.5">380 / 500 د.ج</p>
              </a>

              <div className="p-3 rounded-xl bg-white/80 border border-stone-200/70 shadow-2xs">
                <p className="text-[11px] font-semibold text-[#71717A]">أصالة وضمان</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                  100% أصلي
                </p>
                <p className="text-[10px] text-[#71717A] font-bold mt-0.5">معتمد من تكنو</p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-stone-200/70 shadow-2xs">
                <p className="text-[11px] font-semibold text-[#71717A]">طريقة الدفع</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                  عند الاستلام
                </p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">بعد فحص الطرد</p>
              </div>
            </div>
          </div>

          {/* Interactive Flagship Showcase Card Column */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 max-w-md mx-auto lg:max-w-none w-full">
            {activeProduct ? (
              /* Live Uploaded Product Spotlight Card */
              <div className="relative group rounded-3xl bg-white p-3.5 sm:p-4 border-2 border-stone-200 shadow-xl hover:border-[#FFD100] transition-all duration-300">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(activeProduct)}
                    aria-label={`معاينة وتفاصيل ${activeProduct.name}`}
                    className="w-full h-full block cursor-pointer"
                  >
                    <ProductImage
                      src={activeImages[0]}
                      alt={activeProduct.alt}
                      fallbackTitle={activeProduct.name}
                      fallbackCode={activeProduct.sku}
                      loading="eager"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>

                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B]/85 text-[#FFD100] text-xs font-bold backdrop-blur-md shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD100]" />
                      <span>معروض مميز</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                      <Truck className="w-3 h-3" />
                      <span>جاهز للشحن</span>
                    </span>
                  </div>

                  {activeImages.length > 1 && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-mono tabular-nums backdrop-blur-md">
                      <Images className="w-3.5 h-3.5" />
                      <span>{activeImages.length} صور</span>
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#71717A]">
                    <span className="font-bold text-[#18181B] bg-stone-100 px-2.5 py-1 rounded-md">
                      {getProductCategoryLabel(activeProduct)}
                    </span>
                    <span className="font-mono font-bold text-stone-500">
                      رقم #{activeProduct.sku}
                    </span>
                  </div>

                  <h2 className="font-display text-lg font-bold text-[#18181B] leading-snug line-clamp-2">
                    {activeProduct.name}
                  </h2>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-[#71717A] block">السعر الرسمي:</span>
                      <span className="font-display text-2xl font-black text-[#E30613] tabular-nums">
                        {activeRange?.hasRange
                          ? `من ${formatDzd(activeRange.min)}`
                          : formatDzd(activeProduct.priceDzd)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onQuickOrder(activeProduct, activeFirstVariantId)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E30613] text-white text-xs font-bold hover:bg-[#C4000F] shadow-sm transition-colors cursor-pointer active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>اطلب الآن</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(activeProduct)}
                        className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl border border-stone-300 text-[#18181B] text-xs font-bold hover:border-[#18181B] transition-colors cursor-pointer"
                      >
                        التفاصيل
                      </button>
                    </div>
                  </div>
                </div>

                {allProducts.length > 1 && (
                  <div className="pt-2 border-t border-stone-100 grid grid-cols-5 gap-2">
                    {allProducts.slice(0, 5).map((prod) => {
                      const isSelected = prod.id === activeProduct.id;
                      const thumb = getProductImages(prod)[0];
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => setSpotlightId(prod.id)}
                          aria-label={`معاينة ${prod.shortName}`}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#E30613] ring-2 ring-[#FFD100]'
                              : 'border-stone-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <ProductImage
                            src={thumb}
                            alt={prod.shortName}
                            fallbackTitle={prod.shortName}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* HYPER-INTERACTIVE 4-COLLECTION SHOWROOM TERMINAL */
              <div className="rounded-3xl bg-white border-2 border-[#FFD100] shadow-xl p-5 sm:p-6 space-y-5 glow-card relative overflow-hidden">
                {/* Official TECHNO Seal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E30613] animate-pulse" />
                    <span className="font-display text-sm font-black text-[#18181B]">
                      معرض تشكيلات تكنو الأغواط النموذجية
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFD100] text-[#18181B] text-[11px] font-black">
                    معاينة تفاعلية
                  </span>
                </div>

                {/* 4 Interactive Selector Tabs */}
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-stone-100">
                  {SHOWCASE_PILLARS.map((pillar, idx) => {
                    const isSelected = idx === activeShowcaseIdx;
                    return (
                      <button
                        key={pillar.id}
                        type="button"
                        onClick={() => setActiveShowcaseIdx(idx)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                          isSelected
                            ? 'bg-[#18181B] text-[#FFD100] shadow-sm scale-102'
                            : 'text-[#52525B] hover:text-[#18181B]'
                        }`}
                      >
                        {pillar.id === 'pens'
                          ? 'الأقلام'
                          : pillar.id === 'bags'
                          ? 'الحقائب'
                          : pillar.id === 'architect'
                          ? 'الهندسة'
                          : 'المكاتب'}
                      </button>
                    );
                  })}
                </div>

                {/* Active Showcase Item Details */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentShowcase.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-[#E30613]">{currentShowcase.category}</span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {currentShowcase.priceText}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-lg font-black text-[#18181B] leading-snug">
                        {currentShowcase.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#52525B] leading-relaxed">
                        {currentShowcase.summary}
                      </p>
                    </div>

                    {/* Interactive Specs Checklist */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-1.5">
                      <p className="text-[11px] font-bold text-stone-700">مواصفات ومعايير الجودة:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentShowcase.specs.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-bold text-[#18181B]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{spec}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Showcase Action Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <a
                        href="#quick-order"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black shadow-md transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>طلب فوري من هذا القسم</span>
                      </a>

                      <a
                        href="#collection"
                        className="inline-flex items-center justify-center px-4 py-3 rounded-xl border-2 border-stone-300 hover:border-[#18181B] text-[#18181B] text-xs font-bold transition-all"
                      >
                        <span>تصفح الكل</span>
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Branch Direct Contact Footer Strip */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#71717A]">
                  <span className="font-medium">{STORE_INFO.hours}</span>
                  <a
                    href={STORE_INFO.phoneHref}
                    dir="ltr"
                    className="font-mono font-bold text-[#E30613] hover:underline"
                  >
                    {STORE_INFO.phoneDisplay}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
