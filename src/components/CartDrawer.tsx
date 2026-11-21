import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Minus,
  Plus,
  Printer,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  DEFAULT_WILAYA,
  LAGHOUAT_COMMUNES,
  type Product,
} from '../data/products';
import {
  buildSavedOrder,
  calculateOrderTotals,
  formatDzd,
  formatOrderMessage,
  getCartItemKey,
  getDeliveryMethodTitle,
  getProductImages,
  getProductUnitPrice,
  resolveProductVariant,
  validateOrderForm,
  type CartItem,
  type OrderFormInput,
  type OrderValidationErrors,
  type SavedOrder,
} from '../utils/storeLogic';
import { sendOrderNotifications } from '../utils/notificationService';
import { downloadOrderReceipt, printOrderReceipt } from '../utils/receiptGenerator';
import { ProductImage } from './ProductImage';
import { DeliverySelector } from './DeliverySelector';

export type DrawerStep = 'cart' | 'checkout' | 'confirmed';

interface CartDrawerProps {
  isOpen: boolean;
  step: DrawerStep;
  cart: CartItem[];
  products?: Product[];
  onClose: () => void;
  onChangeStep: (step: DrawerStep) => void;
  onUpdateQuantity: (productId: string, delta: number, variantId?: string) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
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

export function CartDrawer({
  isOpen,
  step,
  cart,
  products,
  onClose,
  onChangeStep,
  onUpdateQuantity,
  onRemoveItem,
  onOrderCompleted,
}: CartDrawerProps) {
  const [form, setForm] = useState<OrderFormInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<OrderValidationErrors>({});
  const [confirmedOrder, setConfirmedOrder] = useState<SavedOrder | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [formOpenTime] = useState(() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleDownloadPdf = async (order: SavedOrder) => {
    setIsGeneratingPdf(true);
    try {
      await downloadOrderReceipt(order);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const catalog = products ?? [];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totals = calculateOrderTotals(cart, catalog, form.deliveryMethod, form.wilaya);

  const handleClearErrors = (fields: Array<keyof OrderValidationErrors>) => {
    setErrors((prev) => {
      const next = { ...prev };
      for (const f of fields) delete next[f];
      return next;
    });
    setSubmitError(null);
  };

  const handleSubmitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    const validationErrors = validateOrderForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const order = buildSavedOrder(cart, catalog, form);
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
    } catch (error) {
      console.error('Failed to dispatch notifications:', error);
    }

    setConfirmedOrder(order);
    setCopiedReceipt(false);
    onOrderCompleted(order);
    onChangeStep('confirmed');
    setForm(INITIAL_FORM);
    setErrors({});
    setIsSubmitting(false);

    downloadOrderReceipt(order);
  };

  const handleCopySummary = async () => {
    if (!confirmedOrder) return;
    const summaryText = formatOrderMessage(confirmedOrder);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
      }
      setCopiedReceipt(true);
    } catch {
      setCopiedReceipt(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        data-testid="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg h-full bg-[#FAF8F5] flex flex-col shadow-2xl border-r-4 border-[#18181B]"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#FFD100] border-b-2 border-[#18181B] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'checkout' ? (
              <button
                type="button"
                onClick={() => onChangeStep('cart')}
                aria-label="العودة إلى سلة الطلب"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#18181B] text-[#18181B] hover:bg-[#E30613] hover:text-white cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : null}
            <h2
              id="cart-drawer-title"
              className="font-display text-base sm:text-lg font-black text-[#18181B]"
            >
              {step === 'cart' && `سلة الطلب الرسمية (${totals.itemCount})`}
              {step === 'checkout' && 'استمارة معلومات الطلب والتوصيل'}
              {step === 'confirmed' && 'تم تأكيد طلبك بنجاح'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق سلة الطلب"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#18181B] text-[#18181B] hover:bg-[#E30613] hover:text-white cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* STEP 1: CART ITEMS */}
          {step === 'cart' ? (
            cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#F2F0EB] flex items-center justify-center text-[#52525B]">
                  <ShoppingBag className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="mt-4 font-display text-base font-semibold text-[#18181B]">
                  سلة الطلب فارغة حالياً
                </p>
                <p className="mt-1.5 text-sm text-[#52525B]">
                  تصفح تشكيلة الأدوات والمعروضات المتوفرة في فرع تكنو الأغواط وأضف ما يناسبك.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#18181B] text-white text-sm font-semibold hover:bg-[#E30613] transition-colors cursor-pointer"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-[#52525B] bg-[#FAF9F6] border border-stone-200 rounded-xl px-4 py-3">
                  التوصيل متوفر عبر{' '}
                  <span className="font-semibold text-[#18181B]">ZR Express</span> لـ 69 ولاية
                  (للمنزل أو المكتب) أو استلام مجاني من فرع الأغواط. اختر ولايتك في الخطوة
                  القادمة لحساب السعر الدقيق.
                </p>

                <ul className="divide-y divide-stone-200">
                  {cart.map((item) => {
                    const product = catalog.find((p) => p.id === item.productId);
                    if (!product) return null;
                    const variant = resolveProductVariant(product, item.variantId);
                    const unitPrice = getProductUnitPrice(product, item.variantId);
                    const itemKey = getCartItemKey(item.productId, item.variantId);
                    const cover = getProductImages(product)[0];

                    return (
                      <li key={itemKey} className="py-4 flex gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F5F4EF] border border-stone-200 shrink-0">
                          <ProductImage
                            src={cover}
                            alt={product.shortName}
                            fallbackTitle={product.shortName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-display text-sm font-semibold text-[#18181B] truncate">
                                {product.name}
                              </p>
                              <p className="mt-0.5 text-xs text-[#71717A] flex flex-wrap items-center gap-x-1.5">
                                {variant ? (
                                  <>
                                    <span className="font-semibold text-[#E30613]">
                                      القياس: {variant.label}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                  </>
                                ) : null}
                                <span className="font-mono">رقم #{product.sku}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(product.id, item.variantId)}
                              aria-label={`حذف ${product.shortName} من السلة`}
                              className="p-1.5 text-[#71717A] hover:text-[#E30613] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center border border-stone-300 rounded-lg">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, -1, item.variantId)}
                                aria-label={`إنقاص كمية ${product.shortName}`}
                                className="w-9 h-9 inline-flex items-center justify-center text-[#18181B] hover:bg-stone-100 rounded-r-lg cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <span className="w-9 text-center font-mono text-sm font-semibold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, 1, item.variantId)}
                                aria-label={`زيادة كمية ${product.shortName}`}
                                className="w-9 h-9 inline-flex items-center justify-center text-[#18181B] hover:bg-stone-100 rounded-l-lg cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </div>

                            <p className="font-display text-sm font-bold text-[#18181B] tabular-nums">
                              {formatDzd(unitPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          ) : null}

          {/* STEP 2: CHECKOUT FORM */}
          {step === 'checkout' ? (
            <form
              id="checkout-order-form"
              onSubmit={handleSubmitOrder}
              noValidate
              className="space-y-5"
            >
              {/* Anti-Bot Honeypot Trap - invisible to legitimate human users */}
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
                  htmlFor="order-full-name"
                  className="block text-sm font-medium text-[#18181B] mb-1.5"
                >
                  الاسم الكامل <span className="text-[#E30613]">*</span>
                </label>
                <input
                  id="order-full-name"
                  data-testid="checkout-name-input"
                  type="text"
                  autoComplete="name"
                  placeholder="اكتب اسمك الكامل هنا..."
                  value={form.fullName}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, fullName: e.target.value }));
                    handleClearErrors(['fullName']);
                  }}
                  aria-invalid={Boolean(errors.fullName)}
                  className={`w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E30613]/20 ${
                    errors.fullName
                      ? 'border-[#E30613]'
                      : 'border-stone-300 focus:border-[#E30613]'
                  }`}
                />
                {errors.fullName ? (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-[#E30613]">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="order-phone"
                  className="block text-sm font-medium text-[#18181B] mb-1.5"
                >
                  رقم الهاتف (للتأكيد والتوصيل) <span className="text-[#E30613]">*</span>
                </label>
                <input
                  id="order-phone"
                  data-testid="checkout-phone-input"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  placeholder="0560 15 46 63"
                  value={form.phone}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, phone: e.target.value }));
                    handleClearErrors(['phone']);
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  className={`w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border text-sm text-right font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#E30613]/20 ${
                    errors.phone
                      ? 'border-[#E30613]'
                      : 'border-stone-300 focus:border-[#E30613]'
                  }`}
                />
                {errors.phone ? (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-[#E30613]">
                    {errors.phone}
                  </p>
                ) : null}
              </div>

              {/* Reusable 54-Wilaya + 24-Commune ZR Express Delivery Selector */}
              <DeliverySelector
                idPrefix="checkout"
                form={form}
                errors={errors}
                onChangeForm={setForm}
                onClearErrors={handleClearErrors}
              />

              <div>
                <label
                  htmlFor="order-notes"
                  className="block text-sm font-medium text-[#18181B] mb-1.5"
                >
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  id="order-notes"
                  rows={2}
                  placeholder="أي ملاحظات أو تعليمات إضافية بخصوص الطلب..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#E30613]"
                />
              </div>
            </form>
          ) : null}

          {/* STEP 3: ORDER CONFIRMED RECEIPT */}
          {step === 'confirmed' && confirmedOrder ? (
            <div data-testid="order-confirmation-view" className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-stone-200 text-center">
                <CheckCircle2
                  className="w-10 h-10 text-emerald-600 mx-auto"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <p className="mt-3 text-xs text-[#71717A]">رقم طلبك المرجعي</p>
                <p
                  data-testid="confirmed-order-id"
                  className="mt-1 font-mono text-2xl font-bold text-[#E30613] tracking-wide"
                >
                  {confirmedOrder.orderId}
                </p>
                <p className="mt-2 text-sm font-medium text-[#18181B]">
                  {confirmedOrder.statusLabel}
                </p>
                <p className="mt-1 text-xs text-[#52525B]">
                  سيتواصل معك فريق فرع تكنو الأغواط هاتفياً لتأكيد التسليم.
                </p>
              </div>

              <div className="border border-stone-200 rounded-xl divide-y divide-stone-200 text-sm">
                <div className="p-4 space-y-1.5">
                  <p className="font-semibold text-[#18181B]">بيانات العميل والتوصيل</p>
                  <p className="text-[#52525B]">
                    {confirmedOrder.customer.fullName} ·{' '}
                    <span className="font-mono" dir="ltr">
                      {confirmedOrder.customer.phone}
                    </span>
                  </p>
                  <p className="text-xs font-medium text-[#18181B]">
                    {getDeliveryMethodTitle(confirmedOrder.customer.deliveryMethod)}
                  </p>
                  {confirmedOrder.customer.deliveryMethod !== 'pickup' ? (
                    <p className="text-xs text-[#52525B]">
                      {confirmedOrder.customer.wilaya}
                      {confirmedOrder.customer.commune
                        ? ` — ${confirmedOrder.customer.commune}`
                        : ''}
                      {confirmedOrder.customer.address
                        ? ` · ${confirmedOrder.customer.address}`
                        : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-[#52525B]">
                      استلام مباشر من متجر تكنو الأغواط
                    </p>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <p className="font-semibold text-[#18181B]">المنتجات المطلوبة</p>
                  {confirmedOrder.items.map((item) => (
                    <div
                      key={getCartItemKey(item.productId, item.variantId)}
                      className="flex items-start justify-between gap-3 text-xs sm:text-sm"
                    >
                      <span className="text-[#52525B]">
                        {item.name}
                        {item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}
                      </span>
                      <span className="font-semibold text-[#18181B] tabular-nums shrink-0">
                        {formatDzd(item.lineTotalDzd)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 space-y-1.5 bg-[#FAF9F6]">
                  <div className="flex justify-between text-xs text-[#52525B]">
                    <span>رسوم التوصيل</span>
                    <span className="tabular-nums">
                      {confirmedOrder.totals.shippingFeeDzd === 0
                        ? 'مجاني'
                        : formatDzd(confirmedOrder.totals.shippingFeeDzd)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#18181B]">
                    <span>المبلغ عند الاستلام</span>
                    <span className="tabular-nums text-[#E30613]">
                      {formatDzd(confirmedOrder.totals.totalDzd)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={() => handleDownloadPdf(confirmedOrder)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] rounded-xl bg-[#E30613] text-white text-sm font-semibold hover:bg-[#C4000F] shadow-xs transition-all cursor-pointer disabled:opacity-75"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                      <span>جاري إنشاء وتحميل وصل PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>تنزيل وصل الطلب (PDF)</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => printOrderReceipt(confirmedOrder)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[42px] rounded-lg border border-stone-300 bg-white text-[#18181B] text-xs font-semibold hover:border-[#18181B] hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0 text-[#52525B]" aria-hidden="true" />
                    <span>طباعة الوصل مباشرة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[42px] rounded-lg border border-stone-300 bg-white text-[#18181B] text-xs font-semibold hover:border-[#18181B] hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 shrink-0 text-[#52525B]" aria-hidden="true" />
                    <span>{copiedReceipt ? 'تم النسخ بنجاح' : 'نسخ ملخص الطلب'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-3 min-h-[44px] rounded-lg bg-[#18181B] text-white text-sm font-semibold hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  متابعة التصفح
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sticky Footer for Cart & Checkout */}
        {step !== 'confirmed' && cart.length > 0 ? (
          <div className="px-6 py-4 border-t border-stone-200 bg-[#FAF9F6] space-y-3 shrink-0">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#52525B]">
                <span>المجموع الفرعي</span>
                <span
                  data-testid="cart-subtotal"
                  className="font-medium text-[#18181B] tabular-nums"
                >
                  {formatDzd(totals.subtotalDzd)}
                </span>
              </div>
              {step === 'checkout' ? (
                <div className="flex justify-between text-[#52525B]">
                  <span>رسوم التوصيل ({getDeliveryMethodTitle(form.deliveryMethod)})</span>
                  <span
                    data-testid="checkout-shipping"
                    className="font-medium text-[#18181B] tabular-nums"
                  >
                    {totals.shippingFeeDzd === 0
                      ? 'مجاني'
                      : formatDzd(totals.shippingFeeDzd)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between pt-2 border-t border-stone-200 font-display text-base font-bold text-[#18181B]">
                <span>
                  {step === 'checkout' ? 'المجموع النهائي (عند الاستلام)' : 'الإجمالي التقديري'}
                </span>
                <span data-testid="cart-total" className="text-[#E30613] tabular-nums">
                  {formatDzd(step === 'checkout' ? totals.totalDzd : totals.subtotalDzd)}
                </span>
              </div>
            </div>

            {step === 'checkout' && submitError && (
              <div className="p-3 mb-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{submitError}</span>
              </div>
            )}

            {step === 'cart' ? (
              <button
                type="button"
                data-testid="cart-proceed-checkout"
                onClick={() => onChangeStep('checkout')}
                className="w-full px-5 py-3.5 min-h-[48px] rounded-lg bg-[#E30613] text-white text-sm font-semibold hover:bg-[#C4000F] transition-colors cursor-pointer"
              >
                إتمام الطلب واختيار الولاية
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-order-form"
                data-testid="checkout-submit-button"
                disabled={isSubmitting}
                className="w-full px-5 py-3.5 min-h-[48px] rounded-lg bg-[#E30613] text-white text-sm font-semibold hover:bg-[#C4000F] disabled:opacity-70 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>جاري إرسال الطلب وإشعار الإدارة...</span>
                  </>
                ) : (
                  <span>تأكيد الطلب الآن · {formatDzd(totals.totalDzd)}</span>
                )}
              </button>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
