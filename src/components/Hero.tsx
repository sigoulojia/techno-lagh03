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
  Check,
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

export function Hero({
  products,
  categoryCount = 0,
  onSelectProduct,
  onQuickOrder,
}: HeroProps) {
  const allProducts = products ?? [];
  const [spotlightId, setSpotlightId] = useState<string>(allProducts[0]?.id ?? '');
  const [quickWilayaCode, setQuickWilayaCode] = useState('03');

  const activeProduct =
    allProducts.find((product) => product.id === spotlightId) ?? allProducts[0] ?? null;

  const activeImages = activeProduct ? getProductImages(activeProduct) : [];
  const activeRange = activeProduct ? getProductPriceRange(activeProduct) : null;
  const activeFirstVariantId = activeProduct?.variants?.[0]?.id;

  const quickRate = findWilayaRate(quickWilayaCode);

  return (
    <section id="top" className="relative overflow-hidden bg-lined-paper border-b-2 border-stone-300 py-12 lg:py-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Main Editorial & Storytelling Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Stationery Notebook Stamp / Brand Header */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="stamp-yellow text-xs">
                  TECHNO STATIONERY ®
                </span>
                <span className="stamp-red text-xs">
                  فرع الأغواط الرسمي
                </span>
                <span className="text-xs font-bold font-mono text-stone-500 mr-2">
                  25 سنة حكاية أجيال ومازال
                </span>
              </div>

              {/* Headline with Authentic TECHNO Fluorescent Highlighter */}
              <h1 className="font-display text-[clamp(2.2rem,4.2vw,3.8rem)] font-black leading-[1.25] text-[#18181B] text-balance max-w-2xl">
                كل ما تحتاجه لمسيرتك{' '}
                <span className="highlight-yellow">
                  المهنية والدراسية
                </span>{' '}
                والإبداعية
              </h1>

              <p className="mt-5 text-base sm:text-lg leading-[1.8] text-[#3F3F46] max-w-xl font-medium">
                تصفح تشكيلة فرع تكنو الأغواط المعتمدة من{' '}
                <strong className="text-[#18181B] font-bold">
                  حقائب الحواسيب PROBAG، أقلام التوقيع الفاخرة، لوازم الهندسة المعمارية والفنون، والسجلات المكتبية
                </strong>{' '}
                مع شحن سريع عبر{' '}
                <span className="font-black text-[#E30613] underline underline-offset-4 decoration-[#FFD100] decoration-4">
                  ZR Express
                </span>{' '}
                لبلديات الأغواط و54 ولاية، والدفع نقداً عند استلام الطرد.
              </p>

              {/* Action Buttons styled with physical stationery contrast */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a
                  href="#collection"
                  className="animate-sheen inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[50px] rounded-xl bg-[#E30613] text-white text-base font-bold hover:bg-[#C4000F] active:scale-95 transition-all shadow-md shadow-[#E30613]/25 whitespace-nowrap shrink-0"
                >
                  <span>تصفح معروضات المتجر</span>
                  <ArrowDownLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
                </a>

                <a
                  href="#track"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[50px] rounded-xl border-2 border-[#18181B] bg-white text-[#18181B] text-base font-bold hover:bg-[#18181B] hover:text-white active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>تتبع طلبيتك (ZR Express)</span>
                </a>

                <a
                  href="#quick-order"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[50px] rounded-xl bg-[#FFD100] border-2 border-[#18181B] text-[#18181B] text-sm font-black hover:bg-[#E5BC00] active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-[#E30613]" />
                  <span>طلب سريع مباشر</span>
                </a>
              </div>

              {/* Interactive Quick Wilaya Rate Peek Bar */}
              <div className="mt-6 p-3.5 rounded-2xl bg-white border-2 border-[#E8E5DD] shadow-xs max-w-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#E30613]" />
                  <span className="font-bold text-[#18181B]">تسعيرة التوصيل الرسمي لولايتك:</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={quickWilayaCode}
                    onChange={(e) => setQuickWilayaCode(e.target.value)}
                    aria-label="اختر ولايتك لمعاينة سعر التوصيل السريع"
                    className="px-2.5 py-1.5 rounded-lg border-2 border-stone-300 bg-[#FAF8F5] font-bold text-xs focus:outline-none focus:border-[#E30613]"
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
                    <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-[#18181B]">
                      مكتب: {quickRate.stopDeskFeeDzd ? `${quickRate.stopDeskFeeDzd} د.ج` : 'غير متوفر'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#E30613]/10 border border-[#E30613]/20 text-[#E30613]">
                      منزل: {quickRate.homeFeeDzd} د.ج
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Statistics Ribbon */}
            <div className="mt-8 pt-6 border-t-2 border-stone-300 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl">
              <a
                href="#delivery-rates"
                className="p-3.5 rounded-2xl bg-white border-2 border-stone-200 shadow-2xs hover:border-[#FFD100] transition-colors block"
              >
                <p className="text-[11px] font-semibold text-stone-500">تغطية الشحن</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B] tabular-nums">
                  54 ولاية
                </p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">عبر ZR Express</p>
              </a>

              <a
                href="#delivery-rates"
                className="p-3.5 rounded-2xl bg-white border-2 border-stone-200 shadow-2xs hover:border-[#E30613] transition-colors block"
              >
                <p className="text-[11px] font-semibold text-stone-500">بلديات الأغواط</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B] tabular-nums">
                  24 بلدية
                </p>
                <p className="text-[10px] text-[#E30613] font-bold mt-0.5">380 / 500 د.ج</p>
              </a>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-stone-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-stone-500">أصالة وضمان</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                  100% أصلي
                </p>
                <p className="text-[10px] text-stone-500 font-bold mt-0.5">معتمد من تكنو</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-stone-200 shadow-2xs">
                <p className="text-[11px] font-semibold text-stone-500">طريقة الدفع</p>
                <p className="mt-0.5 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                  عند الاستلام
                </p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">بعد فحص الطرد</p>
              </div>
            </div>
          </div>

          {/* Real Product Spotlight Desk Column */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 max-w-md mx-auto lg:max-w-none w-full">
            {activeProduct ? (
              /* Authentic Stationery Product Card */
              <div className="relative group rounded-3xl bg-white p-4 border-2 border-[#18181B] shadow-xl transition-all duration-300">
                {/* Image Box */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] text-[#FFD100] text-xs font-black shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD100]" />
                      <span>معروض مميز بفرع الأغواط</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                      <Truck className="w-3 h-3" />
                      <span>جاهز للشحن الفوري</span>
                    </span>
                  </div>

                  {activeImages.length > 1 && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 text-white text-xs font-mono tabular-nums">
                      <Images className="w-3.5 h-3.5" />
                      <span>{activeImages.length} صور</span>
                    </span>
                  )}
                </div>

                {/* Details Bar */}
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#18181B] bg-[#FFD100] px-2.5 py-0.5 rounded-md border border-[#E5BC00]">
                      {getProductCategoryLabel(activeProduct)}
                    </span>
                    <span className="font-mono font-bold text-stone-600">
                      رقم #{activeProduct.sku}
                    </span>
                  </div>

                  <h2 className="font-display text-lg font-bold text-[#18181B] leading-snug line-clamp-2">
                    {activeProduct.name}
                  </h2>

                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                    {activeProduct.summary}
                  </p>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-stone-500 block">السعر الرسمي:</span>
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
                        className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl border-2 border-stone-300 text-[#18181B] text-xs font-bold hover:border-[#18181B] transition-colors cursor-pointer"
                      >
                        التفاصيل
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Product Switcher with real bag thumbnails */}
                {allProducts.length > 1 && (
                  <div className="pt-2.5 border-t border-stone-200">
                    <p className="text-[11px] font-bold text-stone-600 mb-1.5">
                      اختر الموديل أو اللون للمعاينة الفورية:
                    </p>
                    <div className="grid grid-cols-5 gap-2">
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
                                : 'border-stone-300 opacity-70 hover:opacity-100'
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
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
