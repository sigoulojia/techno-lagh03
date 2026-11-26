import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Expand,
  Loader2,
  Minus,
  Plus,
  Printer,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  X,
} from 'lucide-react';
import {
  DEFAULT_WILAYA,
  LAGHOUAT_COMMUNES,
  type Product,
  type ProductVariant,
} from '../data/products';
import {
  buildProductPageUrl,
  buildProductVariantUrl,
  buildSavedOrder,
  calculateOrderTotals,
  extractProductIdFromLocation,
  formatDzd,
  getDeliveryMethodTitle,
  getProductCategoryLabel,
  getProductImages,
  getProductModelNumber,
  getProductPriceRange,
  getProductUnitPrice,
  resolveProductVariant,
  resolveRequestedVariant,
  getVariantForImageIndex,
  getImageIndexForVariant,
  getProductDisplayName,
  getProductDisplayDescription,
  validateOrderForm,
  type OrderFormInput,
  type OrderValidationErrors,
  type SavedOrder,
} from '../utils/storeLogic';
import { sendOrderNotifications } from '../utils/notificationService';
import { downloadOrderReceipt, printOrderReceipt } from '../utils/receiptGenerator';
import { ProductImage } from './ProductImage';
import { DeliverySelector } from './DeliverySelector';
import { TechnoLogo } from './TechnoLogo';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  cartCount: number;
  requestedIdentifier?: string | null;
  onBackToHome: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, variantId?: string) => void;
  onOpenCart: () => void;
  onOrderCompleted: (order: SavedOrder) => void;
}

const INITIAL_FORM: OrderFormInput = {
  fullName: '',
  phone: '',
  deliveryMethod: 'home',
  wilaya: DEFAULT_WILAYA,
  commune: LAGHOUAT_COMMUNES[0],
  address: '',
  notes: '',
};

export function ProductDetailPage({
  product,
  allProducts,
  cartCount,
  requestedIdentifier,
  onBackToHome,
  onSelectProduct,
  onAddToCart,
  onOpenCart,
  onOrderCompleted,
}: ProductDetailPageProps) {
  const images = getProductImages(product);
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    variants[0]?.id,
  );
  const carouselRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState<OrderFormInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<OrderValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<SavedOrder | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [formOpenTime] = useState(() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Synchronize initial variant and carousel slide based on URL identifier
  useEffect(() => {
    const locId = requestedIdentifier || (typeof window !== 'undefined' ? extractProductIdFromLocation(window.location) : null);
    const initialVariant = resolveRequestedVariant(product, locId);
    const initialVariantId = initialVariant?.id || product.variants?.[0]?.id;
    setSelectedVariantId(initialVariantId);

    const initialIdx = initialVariantId
      ? getImageIndexForVariant(product, initialVariantId)
      : 0;
    const resolvedIdx = initialIdx >= 0 ? initialIdx : 0;
    setActiveImageIdx(resolvedIdx);

    setIsLightboxOpen(false);
    setQuantity(1);
    setConfirmedOrder(null);
    setErrors({});
    setCopiedLink(false);

    if (carouselRef.current && resolvedIdx > 0 && carouselRef.current.children[resolvedIdx]) {
      window.setTimeout(() => {
        if (carouselRef.current && carouselRef.current.children[resolvedIdx]) {
          isProgrammaticScroll.current = true;
          (carouselRef.current.children[resolvedIdx] as HTMLElement).scrollIntoView({
            behavior: 'auto',
            block: 'nearest',
            inline: 'center',
          });
          window.setTimeout(() => {
            isProgrammaticScroll.current = false;
          }, 300);
        }
      }, 50);
    }
  }, [product.id, requestedIdentifier]);

  // Synchronize browser URL bar dynamically when switching models/images
  const updateUrlForVariant = (variant: ProductVariant | null, vIdx?: number) => {
    if (!product || typeof window === 'undefined') return;
    const newUrl = buildProductVariantUrl(product, variant, vIdx);
    if (window.location.pathname !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        scrollToSlide((activeImageIdx - 1 + images.length) % images.length, true);
      }
      if (e.key === 'ArrowLeft') {
        scrollToSlide((activeImageIdx + 1) % images.length, true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLightboxOpen, images.length, activeImageIdx]);

  const scrollToSlide = (idx: number, shouldSyncVariant: boolean = false) => {
    setActiveImageIdx(idx);
    let targetVariant = activeVariant;
    if (shouldSyncVariant) {
      const matchedVariant = getVariantForImageIndex(product, idx);
      if (matchedVariant) {
        setSelectedVariantId(matchedVariant.id);
        targetVariant = matchedVariant;
      }
    }
    const targetIdx = targetVariant && product.variants ? product.variants.indexOf(targetVariant) : idx;
    updateUrlForVariant(targetVariant, targetIdx);

    const el = carouselRef.current;
    if (el && el.children[idx]) {
      isProgrammaticScroll.current = true;
      (el.children[idx] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      window.setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  };

  const handleSelectImage = (idx: number) => {
    scrollToSlide(idx, true);
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const matchedVariant = product.variants?.find((v) => v.id === variantId) || null;
    const vIdx = matchedVariant && product.variants ? product.variants.indexOf(matchedVariant) : 0;
    updateUrlForVariant(matchedVariant, vIdx);
    const matchedIdx = getImageIndexForVariant(product, variantId);
    scrollToSlide(matchedIdx, false);
  };

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return;
    const el = e.currentTarget;
    const width = el.clientWidth;
    if (width <= 0) return;
    const scrollPos = Math.abs(el.scrollLeft);
    const newIdx = Math.round(scrollPos / width);
    if (newIdx >= 0 && newIdx < images.length && newIdx !== activeImageIdx) {
      setActiveImageIdx(newIdx);
      if (product.variants && product.variants.length > 1) {
        const matchedVariant = getVariantForImageIndex(product, newIdx);
        if (matchedVariant) {
          setSelectedVariantId(matchedVariant.id);
          const vIdx = product.variants.indexOf(matchedVariant);
          updateUrlForVariant(matchedVariant, vIdx);
        }
      }
    }
  };

  const activeVariant = resolveProductVariant(product, selectedVariantId);
  const activeModelNumber = getProductModelNumber(
    product,
    activeVariant,
    selectedVariantId && product.variants ? product.variants.findIndex((v) => v.id === selectedVariantId) : 0,
  );
  const unitPrice = getProductUnitPrice(product, activeVariant?.id);
  const displayName = getProductDisplayName(product, activeVariant?.id);
  const displayDescription = getProductDisplayDescription(product, activeVariant?.id);
  const categoryLabel = getProductCategoryLabel(product);

  const directCart = [
    {
      productId: product.id,
      ...(activeVariant ? { variantId: activeVariant.id } : {}),
      quantity,
    },
  ];
  const totals = calculateOrderTotals(
    directCart,
    allProducts,
    form.deliveryMethod,
    form.wilaya,
  );

  const handleDownloadPdf = async (order: SavedOrder) => {
    setIsGeneratingPdf(true);
    try {
      await downloadOrderReceipt(order);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyProductLink = async () => {
    const cleanUrl = activeVariant
      ? buildProductVariantUrl(product, activeVariant)
      : buildProductPageUrl(product.sku || product.id);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(cleanUrl);
      }
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const siblings = (product.siblingIds || [])
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p && p.id !== product.id));

  const otherProducts = allProducts
    .filter((p) => p.id !== product.id && !product.siblingIds?.includes(p.id))
    .slice(0, 3);

  const handleClearErrors = (fields: Array<keyof OrderValidationErrors>) => {
    setErrors((prev) => {
      const next = { ...prev };
      for (const f of fields) delete next[f];
      return next;
    });
    setSubmitError(null);
  };

  const handleDirectOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateOrderForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const order = buildSavedOrder(directCart, allProducts, form);
    (order as any).b_company_field = honeypot;
    (order as any).formDurationMs = Math.round(
      typeof performance !== 'undefined' ? performance.now() - formOpenTime : 3000,
    );

    try {
      const res = await sendOrderNotifications(order);
      if (res.success === false && res.error) {
        setSubmitError(res.error);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Notification dispatch error:', err);
    }

    setConfirmedOrder(order);
    onOrderCompleted(order);
    setIsSubmitting(false);

    downloadOrderReceipt(order);
  };

  return (
    <div className="min-h-screen bg-lined-paper text-[#18181B] pb-24">
      {/* Top Action Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-md border-b-4 border-[#FFD100] shadow-xs py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFD100] text-xs sm:text-sm font-black text-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-[#E30613]" aria-hidden="true" />
              <span>العودة للمتجر</span>
            </button>
            <div className="hidden sm:block">
              <TechnoLogo size="sm" showBranch={true} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handleCopyProductLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-xl border-2 border-[#18181B] bg-white hover:bg-stone-50 text-xs font-black text-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#E30613]" aria-hidden="true" />
              <span className="hidden sm:inline">{copiedLink ? 'تم نسخ الرابط' : `رابط #${product.sku}`}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              data-testid="pdp-cart-button"
              className="relative group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[42px] rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs sm:text-sm font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">سلة الطلب</span>
              <span className="bg-[#FFD100] text-[#18181B] border border-[#18181B] px-2 py-0.5 rounded-md text-xs font-mono font-black tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="مسار الصفحة"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-[#71717A] flex items-center gap-2 flex-wrap"
      >
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-[#18181B] hover:underline cursor-pointer"
        >
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <span>{categoryLabel}</span>
        <span aria-hidden="true">/</span>
        <span className="font-mono text-[#52525B]">#{activeModelNumber}</span>
        <span aria-hidden="true">/</span>
        <span className="text-[#18181B] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Right Column (RTL): Interactive Multi-Image Gallery & Specs */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xs">
                {/* Horizontal Swipe & Scroll Gallery Container */}
                <div
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  data-testid="pdp-horizontal-gallery"
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full scroll-smooth"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {images.map((imgUrl, idx) => {
                    const slideVariant = getVariantForImageIndex(product, idx);
                    const slideTitle = slideVariant?.name || slideVariant?.label || product.shortName || product.name;
                    const slidePrice = slideVariant?.priceDzd || product.priceDzd;
                    const slideSku = slideVariant?.sku || product.sku;

                    return (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="snap-center shrink-0 w-full h-full relative flex items-center justify-center bg-white"
                      >
                        <ProductImage
                          src={imgUrl}
                          alt={`${product.alt} — ${slideTitle} (صورة ${idx + 1})`}
                          fallbackTitle={slideTitle}
                          fallbackCode={slideSku}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />

                        {/* Synchronized Shape & Price Overlay Pill directly on this slide */}
                        <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between gap-2 pointer-events-none">
                          <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-2 max-w-[70%] truncate">
                            <span className="w-2 h-2 rounded-full bg-[#FFD100] shrink-0" />
                            <span className="truncate">{slideTitle}</span>
                            {slideSku ? (
                              <span className="text-[10px] font-mono text-stone-300 shrink-0">#{slideSku}</span>
                            ) : null}
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-[#E30613] text-white text-xs font-black shadow-md tabular-nums shrink-0">
                            {formatDzd(slidePrice)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Zoom Trigger */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="تكبير صورة المنتج"
                  className="absolute top-3.5 left-3.5 z-10 w-10 h-10 rounded-xl bg-white/92 border border-stone-200 text-[#18181B] inline-flex items-center justify-center hover:bg-[#18181B] hover:text-white transition-colors shadow-xs cursor-pointer"
                >
                  <Expand className="w-4 h-4" aria-hidden="true" />
                </button>

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      data-testid="pdp-gallery-prev"
                      onClick={() =>
                        scrollToSlide((activeImageIdx - 1 + images.length) % images.length, true)
                      }
                      aria-label="الصورة السابقة"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/92 border border-stone-200 text-[#18181B] inline-flex items-center justify-center hover:bg-[#18181B] hover:text-white transition-colors shadow-xs cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-testid="pdp-gallery-next"
                      onClick={() => scrollToSlide((activeImageIdx + 1) % images.length, true)}
                      aria-label="الصورة التالية"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-white/92 border border-stone-200 text-[#18181B] inline-flex items-center justify-center hover:bg-[#18181B] hover:text-white transition-colors shadow-xs cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <div
                      data-testid="pdp-gallery-counter"
                      className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 rounded-md bg-black/75 text-white text-xs font-mono tabular-nums"
                    >
                      {activeImageIdx + 1} / {images.length}
                    </div>
                  </>
                ) : null}
              </div>

              {/* Thumbnail Strip when multiple photos exist */}
              {images.length > 1 ? (
                <div
                  role="group"
                  aria-label="معرض صور المنتج"
                  className="grid grid-cols-5 sm:grid-cols-6 gap-2.5"
                >
                  {images.map((imgUrl, idx) => {
                    const isSelected = idx === activeImageIdx;
                    return (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        data-testid={`pdp-thumb-${idx}`}
                        aria-label={`عرض الصورة رقم ${idx + 1}`}
                        aria-pressed={isSelected}
                        onClick={() => handleSelectImage(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border bg-white transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E30613] ring-2 ring-[#E30613]/25'
                            : 'border-stone-200 opacity-75 hover:opacity-100 hover:border-stone-400'
                        }`}
                      >
                        <ProductImage
                          src={imgUrl}
                          alt={`${product.name} — مصغرة ${idx + 1}`}
                          fallbackTitle={product.shortName}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {/* Active Model / Shape Cordonnées Card (Synchronized with Horizontal Scroll) */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E30613]" />
                    <span>بيانات الموديل المعروض حالياً:</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-[#E30613] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    #{activeModelNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-0.5">اسم الموديل:</span>
                    <span className="font-bold text-[#18181B] truncate block">
                      {activeVariant ? (activeVariant.name || activeVariant.label) : product.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-0.5">السعر:</span>
                    <span className="font-mono font-bold text-[#E30613] text-sm">
                      {formatDzd(unitPrice)}
                    </span>
                  </div>
                  {(activeVariant?.dimensions || product.dimensions) && (
                    <div className="col-span-2">
                      <span className="text-stone-400 block text-[11px] mb-0.5">القياسات والأبعاد:</span>
                      <span className="font-bold text-stone-700 bg-stone-50 border border-stone-200/60 px-2 py-1 rounded-md inline-block">
                        {activeVariant?.dimensions || product.dimensions}
                      </span>
                    </div>
                  )}
                  {(activeVariant?.description) && (
                    <div className="col-span-2">
                      <span className="text-stone-400 block text-[11px] mb-0.5">مميزات هذا الموديل:</span>
                      <span className="text-stone-600 leading-relaxed block">
                        {activeVariant.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Available Sibling Color Variations */}
            {siblings.length > 0 ? (
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2.5">
                <p className="text-xs font-semibold text-[#18181B]">
                  خيارات وألوان أخرى متوفرة من نفس الموديل:
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[#E30613] bg-[#E30613]/5 text-xs font-bold text-[#E30613]">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: product.colorHex || '#18181B' }}
                    />
                    <span>{product.colorName || 'المعروض حالياً'} (الحالي)</span>
                  </div>
                  {siblings.map((sibling) => (
                    <button
                      key={sibling.id}
                      type="button"
                      onClick={() => onSelectProduct(sibling)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-300 hover:border-[#18181B] bg-white text-xs font-medium text-[#18181B] transition-colors cursor-pointer"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-300"
                        style={{ backgroundColor: sibling.colorHex || '#18181B' }}
                      />
                      <span>{sibling.colorName || sibling.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-[#52525B]">
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <Store className="w-5 h-5 mx-auto text-[#E30613] mb-1.5" aria-hidden="true" />
                <p className="font-semibold text-[#18181B]">فرع الأغواط الرسمي</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">وسط المدينة</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <Truck className="w-5 h-5 mx-auto text-[#E30613] mb-1.5" aria-hidden="true" />
                <p className="font-semibold text-[#18181B]">توصيل 69 ولاية</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">ZR Express · منزل ومكتب</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <ShieldCheck className="w-5 h-5 mx-auto text-[#E30613] mb-1.5" aria-hidden="true" />
                <p className="font-semibold text-[#18181B]">الدفع عند الاستلام</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">ضمان الجودة والأصالة</p>
              </div>
            </div>

            {/* Detailed Description & Technical Specs */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
              <h2 className="font-display text-base font-bold text-[#18181B]">
                تفاصيل ومميزات المنتج
              </h2>
              <p className="text-sm leading-relaxed text-[#52525B]">
                {displayDescription}
              </p>

              {product.highlights && product.highlights.length > 0 ? (
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <p className="text-xs font-semibold text-[#18181B]">أبرز النقاط:</p>
                  <ul className="space-y-1.5 text-xs text-[#52525B]">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check
                          className="w-3.5 h-3.5 text-[#E30613] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {product.specs && product.specs.length > 0 ? (
                <div className="pt-3 border-t border-stone-100">
                  <p className="text-xs font-semibold text-[#18181B] mb-2.5">المواصفات:</p>
                  <dl className="divide-y divide-stone-100 text-xs">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="py-1.5 flex justify-between gap-4">
                        <dt className="text-[#71717A]">{spec.label}</dt>
                        <dd className="font-semibold text-[#18181B] text-left">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>
          </div>

          {/* Left Column (RTL): Buy Box, Variant Selector & Fast Order Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* Main Product Info Card */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-5">
              <div>
                {/* Clean Unboxed Metadata Line (Zero-Pill Rule) */}
                <p className="text-xs text-[#71717A] flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                  <span className="font-semibold text-[#E30613]">{categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#52525B]">رقم المنتج: {activeModelNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#18181B]">{product.availabilityText}</span>
                </p>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#18181B] leading-tight">
                  {displayName}
                </h1>
                <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
                  {displayDescription}
                </p>
              </div>

              {/* Interactive Size / Shape / Variant Selector */}
              {variants.length > 0 ? (
                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#18181B]">
                      اختر الشكل أو النموذج المطلوب:
                    </span>
                    {activeVariant ? (
                      <span className="text-xs font-medium text-[#E30613]">
                        المحدد: {activeVariant.name || activeVariant.label}
                      </span>
                    ) : null}
                  </div>
                  <div
                    role="group"
                    aria-label="اختيار شكل أو قياس المنتج"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                  >
                    {variants.map((variant, idx) => {
                      const isSelected = activeVariant?.id === variant.id;
                      const variantImg = variant.image || images[idx] || product.image;
                      const variantTitle = variant.name || variant.label;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          data-testid={`pdp-variant-${variant.id}`}
                          aria-pressed={isSelected}
                          onClick={() => handleSelectVariant(variant.id)}
                          className={`flex items-start gap-3 p-3 rounded-2xl border-2 text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#E30613] bg-[#E30613]/[0.05] ring-2 ring-[#E30613]/20 shadow-xs'
                              : 'border-stone-200 bg-white hover:border-[#18181B]'
                          }`}
                        >
                          {/* Miniature Shape Image */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shrink-0">
                            <ProductImage
                              src={variantImg}
                              alt={variantTitle}
                              fallbackTitle={variantTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-xs sm:text-sm font-black text-[#18181B] truncate">
                                {variantTitle}
                              </span>
                              <span className="font-mono text-xs sm:text-sm font-black text-[#E30613] shrink-0">
                                {formatDzd(variant.priceDzd)}
                              </span>
                            </div>
                            {variant.description && (
                              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                {variant.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold text-stone-600 bg-stone-100 border border-stone-200/80 px-1.5 py-0.5 rounded-md">
                                #{getProductModelNumber(product, variant, idx)}
                              </span>
                              {variant.dimensions && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-stone-700 bg-stone-100 border border-stone-200/80 px-2 py-0.5 rounded-md">
                                  <span>📏</span>
                                  <span>{variant.dimensions}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Price Row */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#71717A]">
                    {activeVariant ? `السعر للشكل (${activeVariant.name || activeVariant.label}):` : 'السعر الرسمي:'}
                  </span>
                  <p
                    data-testid="pdp-unit-price"
                    className="font-display text-2xl sm:text-3xl font-bold text-[#E30613] tabular-nums"
                  >
                    {formatDzd(unitPrice)}
                  </p>
                </div>
                <p className="text-xs font-semibold text-[#18181B]">
                  الدفع نقداً عند الاستلام · بدون تسبيق
                </p>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-sm font-semibold text-[#18181B]">الكمية المطلوبة:</span>
                <div className="inline-flex items-center border border-stone-300 rounded-lg">
                  <button
                    type="button"
                    aria-label="إنقاص الكمية"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 inline-flex items-center justify-center text-[#18181B] hover:bg-stone-100 disabled:opacity-40 rounded-r-lg cursor-pointer"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span
                    data-testid="pdp-quantity-value"
                    className="w-10 text-center font-mono font-bold text-sm tabular-nums"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="زيادة الكمية"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-10 h-10 inline-flex items-center justify-center text-[#18181B] hover:bg-stone-100 rounded-l-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Order Form matching homepage style */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-[#18181B] shadow-[8px_8px_0px_#18181B] space-y-6 relative overflow-hidden">
              <div className="pb-4 border-b-2 border-stone-200 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="stamp-red text-xs font-black">خدمة تكنو السريعة</span>
                  <span className="stamp-yellow text-xs font-black">الدفع عند الاستلام</span>
                </div>
                <h2 className="font-display text-2xl font-black text-[#18181B]">
                  <span className="highlight-yellow">طلب سريع ومباشر</span>
                </h2>
                <p className="text-xs sm:text-sm font-bold text-[#52525B] leading-relaxed">
                  سجل طلبك في أقل من دقيقة، وسيتصل بك فرع تكنو الأغواط هاتفياً للتأكيد والتسليم الفوري عبر ZR Express.
                </p>
              </div>

              {confirmedOrder ? (
                <div
                  data-testid="pdp-order-confirmed"
                  className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] text-center space-y-5"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9 text-emerald-700" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="stamp-yellow text-xs font-black">
                      تم تسجيل وتشفير طلبك بنجاح
                    </span>
                    <h3 className="mt-3 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                      كود تتبع طلبيتك:
                    </h3>
                    <div className="mt-2 p-3 bg-stone-100 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] inline-block">
                      <p
                        data-testid="pdp-confirmed-order-id"
                        className="font-mono text-xl sm:text-2xl font-black text-[#E30613] tracking-wider m-0"
                      >
                        {confirmedOrder.orderId}
                      </p>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm text-[#52525B] font-bold leading-relaxed">
                      {getDeliveryMethodTitle(confirmedOrder.customer.deliveryMethod)} ·{' '}
                      {confirmedOrder.customer.wilaya}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">
                      سيتصل بك فرع تكنو الأغواط هاتفياً لتأكيد انطلاق الشحنة إلى ولايتك عبر ZR Express.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border-2 border-stone-300 flex items-center justify-between text-sm font-bold">
                    <span className="text-stone-600">المبلغ الإجمالي عند الاستلام:</span>
                    <span className="font-mono text-xl font-black text-[#18181B] highlight-yellow">
                      {formatDzd(confirmedOrder.totals.totalDzd)}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={() => handleDownloadPdf(confirmedOrder)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-sm font-black border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          <span>جاري إنشاء وتحميل وصل PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" aria-hidden="true" />
                          <span>تنزيل وصل الطلب (PDF)</span>
                        </>
                      )}
                    </button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => printOrderReceipt(confirmedOrder)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl border-2 border-[#18181B] bg-white hover:bg-stone-50 text-xs font-black text-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#18181B]" aria-hidden="true" />
                        <span>طباعة الوصل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmedOrder(null)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl border-2 border-[#18181B] bg-white hover:bg-[#FFD100] text-xs font-black text-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <span>تقديم طلب آخر</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDirectOrder} noValidate className="space-y-4">
                  {/* Anti-Bot Honeypot Trap */}
                  <div
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      zIndex: -1,
                      pointerEvents: 'none',
                      height: 0,
                      overflow: 'hidden',
                    }}
                    aria-hidden="true"
                  >
                    <input
                      type="text"
                      name="b_company_field"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pdp-name"
                      className="block text-sm font-black text-[#18181B] mb-1.5"
                    >
                      الاسم الكامل <span className="text-[#E30613]">*</span>
                    </label>
                    <input
                      id="pdp-name"
                      data-testid="pdp-name-input"
                      type="text"
                      placeholder="اكتب اسمك الكامل هنا..."
                      value={form.fullName}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, fullName: e.target.value }));
                        handleClearErrors(['fullName']);
                      }}
                      className="w-full px-4 py-3 min-h-[46px] rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-sm font-bold bg-white focus:outline-none focus:shadow-[4px_4px_0px_#E30613] transition-all"
                    />
                    {errors.fullName ? (
                      <p role="alert" className="mt-1.5 text-xs text-[#E30613] font-black">
                        {errors.fullName}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="pdp-phone"
                      className="block text-sm font-black text-[#18181B] mb-1.5"
                    >
                      رقم الهاتف (للتأكيد والتسليم) <span className="text-[#E30613]">*</span>
                    </label>
                    <input
                      id="pdp-phone"
                      data-testid="pdp-phone-input"
                      type="tel"
                      dir="ltr"
                      placeholder="0560 15 46 63"
                      value={form.phone}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, phone: e.target.value }));
                        handleClearErrors(['phone']);
                      }}
                      className="w-full px-4 py-3 min-h-[46px] rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-sm font-mono font-bold text-right bg-white focus:outline-none focus:shadow-[4px_4px_0px_#E30613] transition-all"
                    />
                    {errors.phone ? (
                      <p role="alert" className="mt-1.5 text-xs text-[#E30613] font-black">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>

                  {/* Reusable 69-Wilaya + 24-Commune ZR Express Delivery Selector */}
                  <DeliverySelector
                    idPrefix="pdp"
                    form={form}
                    errors={errors}
                    onChangeForm={setForm}
                    onClearErrors={handleClearErrors}
                    hideOptionPrices={true}
                  />

                  {/* Summary Box matching homepage */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border-2 border-stone-300 text-xs sm:text-sm space-y-2.5 font-bold">
                    <div className="flex justify-between text-[#52525B]">
                      <span>
                        {product.shortName}
                        {activeVariant ? ` (${activeVariant.label})` : ''} × {quantity}
                      </span>
                      <span className="font-mono font-black text-[#18181B] tabular-nums">
                        {formatDzd(totals.subtotalDzd)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#52525B]">
                      <span>
                        التوصيل — {getDeliveryMethodTitle(form.deliveryMethod)}:
                      </span>
                      <span
                        data-testid="pdp-shipping-fee"
                        className="font-mono font-black text-[#E30613] tabular-nums"
                      >
                        {totals.shippingFeeDzd === 0
                          ? 'مجاني (0 د.ج)'
                          : formatDzd(totals.shippingFeeDzd)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base font-black text-[#18181B] pt-2.5 border-t-2 border-stone-300">
                      <span>المبلغ الإجمالي عند الاستلام:</span>
                      <span
                        data-testid="pdp-total-amount"
                        className="font-mono text-xl sm:text-2xl font-black text-[#18181B] highlight-yellow tabular-nums"
                      >
                        {formatDzd(totals.totalDzd)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-1">
                    {submitError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-700 text-xs font-black flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      data-testid="pdp-submit-order"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[52px] rounded-2xl bg-[#E30613] hover:bg-[#C4000F] text-white text-sm sm:text-base font-black border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                          <span>جاري تأكيد وتسجيل طلبك...</span>
                        </>
                      ) : (
                        <span>تأكيد الطلب الآن · {formatDzd(totals.totalDzd)}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      data-testid="pdp-add-to-cart"
                      onClick={() => onAddToCart(product, quantity, activeVariant?.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] rounded-xl border-2 border-[#18181B] bg-white text-[#18181B] text-xs sm:text-sm font-black shadow-[2px_2px_0px_#18181B] hover:bg-[#FFD100] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>إضافة إلى سلة التسوق للمتابعة</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Other Suggestions from Techno Laghouat */}
        {otherProducts.length > 0 ? (
          <section className="mt-16 pt-12 border-t border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-[#18181B]">
                معروضات وأدوات أخرى في فرع تكنو الأغواط
              </h2>
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs font-semibold text-[#E30613] hover:underline cursor-pointer"
              >
                تصفح جميع المعروضات ←
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProducts.map((p) => {
                const range = getProductPriceRange(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectProduct(p)}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md hover:border-stone-300 transition-all cursor-pointer p-4 flex gap-4 items-center text-right"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F5F4EF] shrink-0">
                      <ProductImage
                        src={getProductImages(p)[0]}
                        alt={p.name}
                        fallbackTitle={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#71717A] truncate">
                        {getProductCategoryLabel(p)} · #{p.sku}
                      </p>
                      <p className="font-display text-sm font-bold text-[#18181B] truncate mt-0.5">
                        {p.name}
                      </p>
                      <p className="text-sm font-bold text-[#E30613] mt-1 tabular-nums">
                        {range.hasRange ? `من ${formatDzd(range.min)}` : formatDzd(p.priceDzd)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      {/* Fullscreen Lightbox Modal for Product Photos */}
      {isLightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`معرض صور ${product.name}`}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl flex flex-col items-center gap-4"
          >
            <div className="w-full flex items-center justify-between text-white text-sm">
              <span className="font-mono tabular-nums">
                {activeImageIdx + 1} / {images.length} · #{product.sku}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="إغلاق عرض الصورة"
                className="w-10 h-10 rounded-lg bg-white/15 hover:bg-white/25 inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative w-full max-h-[75vh] aspect-square bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center">
              <ProductImage
                src={images[activeImageIdx] ?? images[0]}
                alt={product.alt}
                fallbackTitle={product.name}
                className="w-full h-full object-contain"
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)
                    }
                    aria-label="الصورة السابقة"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/90 text-[#18181B] inline-flex items-center justify-center hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}
                    aria-label="الصورة التالية"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/90 text-[#18181B] inline-flex items-center justify-center hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
