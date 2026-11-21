import { useState } from 'react';
import { ArrowDownLeft, Images, ShoppingBag, Sparkles, Truck, ShieldCheck, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { BRAND_BANNER_IMAGE, STORE_INFO, type Product } from '../data/products';
import {
  formatDzd,
  getProductCategoryLabel,
  getProductImages,
  getProductPriceRange,
} from '../utils/storeLogic';
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
  const activeProduct =
    allProducts.find((product) => product.id === spotlightId) ?? allProducts[0] ?? null;

  const activeImages = activeProduct ? getProductImages(activeProduct) : [];
  const activeRange = activeProduct ? getProductPriceRange(activeProduct) : null;
  const activeFirstVariantId = activeProduct?.variants?.[0]?.id;

  return (
    <section id="top" className="relative overflow-hidden bg-ambient-techno bg-stationery-pattern border-b border-stone-200/90 py-12 lg:py-20">
      {/* Ambient background decoration shapes */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#FFD100]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#E30613]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Main Editorial & Storytelling Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Official TECHNO Brand Heritage Pill */}
              <div className="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-white/90 border-2 border-[#FFD100] shadow-sm backdrop-blur-md text-xs font-bold text-[#18181B] mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E30613] animate-pulse" />
                <span className="text-[#18181B] font-display">{STORE_INFO.fullTitle}</span>
                <span aria-hidden="true" className="text-stone-300">|</span>
                <span className="text-[#E30613] font-black">{STORE_INFO.heritageLine}</span>
                <span aria-hidden="true" className="text-stone-300">|</span>
                <span className="text-stone-600 font-medium">العلامة ألي تفكر فيكم</span>
              </div>

              <h1 className="font-display text-[clamp(2.3rem,4.2vw,3.75rem)] font-black leading-[1.18] text-[#18181B] text-balance max-w-2xl">
                كل ما تحتاجه لمسيرتك{' '}
                <span className="relative inline-block text-[#E30613]">
                  المهنية والدراسية
                  <span className="absolute -bottom-1.5 right-0 left-0 h-2 bg-[#FFD100] -z-10 rounded-full opacity-80" />
                </span>{' '}
                والإبداعية
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-[1.8] text-[#52525B] max-w-xl">
                {STORE_INFO.tagline}. تصفح تشكيلة فرع تكنو الأغواط الشاملة من{' '}
                <strong className="text-[#18181B] font-bold">
                  الأدوات المكتبية، حقائب الأعمال والحواسيب، أقلام التوقيع الفاخرة، لوازم الفنون والهندسة
                </strong>{' '}
                مع توصيل فائق السرعة عبر{' '}
                <span className="text-[#E30613] font-black underline underline-offset-4 decoration-[#FFD100] decoration-2">
                  ZR Express
                </span>{' '}
                إلى الأغواط و54 ولاية جزائرية والدفع نقداً عند الاستلام.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
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
              </div>
            </div>

            {/* Live Interactive Statistics Ribbon */}
            <div className="mt-12 pt-8 border-t-2 border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl">
              <div className="p-3 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
                <p className="text-[11px] font-semibold text-[#71717A]">تغطية التوصيل</p>
                <p className="mt-1 font-display text-xl sm:text-2xl font-black text-[#18181B] tabular-nums">
                  54 ولاية
                </p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">عبر ZR Express</p>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
                <p className="text-[11px] font-semibold text-[#71717A]">ولاية الأغواط</p>
                <p className="mt-1 font-display text-xl sm:text-2xl font-black text-[#18181B] tabular-nums">
                  24 بلدية
                </p>
                <p className="text-[10px] text-[#E30613] font-bold mt-0.5">380 / 500 د.ج</p>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
                <p className="text-[11px] font-semibold text-[#71717A]">أصالة وضمان</p>
                <p className="mt-1 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                  100% أصلي
                </p>
                <p className="text-[10px] text-[#71717A] font-bold mt-0.5">معتمد من تكنو</p>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-stone-200/60 shadow-2xs">
                <p className="text-[11px] font-semibold text-[#71717A]">طريقة الدفع</p>
                <p className="mt-1 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                  عند الاستلام
                </p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">بعد فحص الطرد</p>
              </div>
            </div>
          </div>

          {/* Interactive Flagship Product Showcase Card */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 max-w-md mx-auto lg:max-w-none w-full">
            {activeProduct ? (
              <div className="relative group rounded-3xl bg-white p-3.5 sm:p-4 border-2 border-stone-200 shadow-xl hover:border-[#FFD100] transition-all duration-300">
                {/* Visual Image Box with Badge */}
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

                  {/* Badges on the image */}
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

                {/* Details Bar */}
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
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E30613] text-white text-xs font-bold hover:bg-[#C4000F] shadow-sm transition-colors cursor-pointer"
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

                {/* Thumbnail switcher */}
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
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
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
              <div className="rounded-3xl bg-white p-6 sm:p-7 border-2 border-[#FFD100] shadow-xl text-right space-y-4">
                <div className="rounded-2xl overflow-hidden bg-[#FFD100] p-1 shadow-md">
                  <ProductImage
                    src={BRAND_BANNER_IMAGE}
                    alt={STORE_INFO.fullTitle}
                    fallbackTitle={STORE_INFO.branchName}
                    className="w-full aspect-[16/10] object-cover rounded-xl"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E30613]">{STORE_INFO.heritageLine}</span>
                  <h2 className="mt-1 font-display text-xl font-bold text-[#18181B]">
                    {STORE_INFO.fullTitle}
                  </h2>
                  <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
                    {STORE_INFO.tagline}. زوروا فرعنا بوسط مدينة الأغواط للاطلاع على كافة المستلزمات المكتبية والمدرسية وأدوات الفنون والساعات والهندسة.
                  </p>
                </div>
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
