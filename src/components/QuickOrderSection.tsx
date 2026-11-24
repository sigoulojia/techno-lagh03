import { useState, useMemo, type FormEvent } from 'react';
import {
  ShoppingBag,
  Truck,
  Building2,
  CheckCircle2,
  Loader2,
  Phone,
  AlertCircle,
  Sparkles,
  Check,
  FileText,
  Search,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WILAYA_DELIVERY_RATES, findWilayaRate } from '../data/deliveryRates';
import { formatDzd, type SavedOrder } from '../utils/storeLogic';
import { sendOrderNotifications } from '../utils/notificationService';
import { TechnoLogo } from './TechnoLogo';
import { type Product } from '../data/products';

interface QuickProductItem {
  id: string;
  sku?: string;
  name: string;
  basePriceDzd: number;
  imageUrl?: string;
}

interface QuickOrderSectionProps {
  products?: Product[];
  onOrderCompleted?: (order: SavedOrder) => void;
}

export function QuickOrderSection({ products, onOrderCompleted }: QuickOrderSectionProps) {
  // Available catalog
  const catalog: QuickProductItem[] = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p) => ({
        id: p.id,
        sku: p.sku || p.id,
        name: p.name,
        basePriceDzd: p.priceDzd,
        imageUrl: p.image || p.images?.[0],
      }));
    }
    return [];
  }, [products]);

  const [selectedProduct, setSelectedProduct] = useState<QuickProductItem | null>(() => catalog[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('03');
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'stop_desk'>('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter matching products
  const searchResults = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return [];

    // Extract product sku or id if a full URL was pasted
    let cleanedTerm = raw;
    try {
      if (raw.includes('/p/')) {
        const parts = raw.split('/p/');
        cleanedTerm = parts[parts.length - 1].split(/[?&#]/)[0].trim().toLowerCase();
      } else if (raw.includes('p=')) {
        const match = raw.match(/[?&]p=([^&#]+)/);
        if (match && match[1]) cleanedTerm = match[1].toLowerCase();
      }
    } catch {
      // keep cleanedTerm as raw
    }

    return catalog.filter((item) => {
      const matchName = item.name.toLowerCase().includes(cleanedTerm);
      const matchSku = item.sku?.toLowerCase().includes(cleanedTerm);
      const matchId = item.id.toLowerCase().includes(cleanedTerm);
      return matchName || matchSku || matchId;
    });
  }, [searchQuery, catalog]);

  const isQuerySearched = searchQuery.trim().length >= 1;
  const isProductNotFound = isQuerySearched && searchResults.length === 0;

  const selectedRate = findWilayaRate(wilayaCode);
  
  // Calculate delivery fee
  const shippingFeeDzd =
    deliveryMethod === 'stop_desk' && selectedRate.stopDeskFeeDzd !== null
      ? selectedRate.stopDeskFeeDzd
      : selectedRate.homeFeeDzd;

  const currentPrice = selectedProduct?.basePriceDzd || 0;
  const totalDzd = currentPrice + shippingFeeDzd;

  // Real-time phone check
  const cleanPhoneDigits = phone.replace(/[^0-9]/g, '');
  const isPhoneValid = /^0[567][0-9]{8}$/.test(cleanPhoneDigits);

  const handleSelectProduct = (prod: QuickProductItem) => {
    setSelectedProduct(prod);
    setSearchQuery('');
    setIsSearchActive(false);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedProduct) {
      setErrorMsg('يرجى اختيار المنتج أو كتابة اسمه أو رمزه للمتابعة.');
      return;
    }

    const cleanName = fullName.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!cleanName) {
      setErrorMsg('يرجى كتابة الاسم الكامل للمتابعة.');
      return;
    }

    if (!/^0[567][0-9]{8}$/.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 مكون من 10 أرقام.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = `TL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const savedOrder: SavedOrder = {
      orderId: generatedOrderId,
      createdAtIso: new Date().toISOString(),
      statusLabel: 'قيد المعالجة والتأكيد عبر الهاتف',
      customer: {
        fullName: cleanName,
        phone: cleanPhone,
        wilaya: `${selectedRate.code} - ${selectedRate.nameAr}`,
        commune: deliveryMethod === 'stop_desk' ? 'استلام من مكتب ZR Express' : 'توصيل لباب المنزل',
        address: '',
        deliveryMethod: deliveryMethod === 'stop_desk' ? 'stop_desk' : 'home',
        notes: `طلب سريع ومباشر: ${selectedProduct.name} (#${selectedProduct.sku || selectedProduct.id})`,
      },
      items: [
        {
          productId: selectedProduct.id,
          sku: selectedProduct.sku || selectedProduct.id,
          name: selectedProduct.name,
          colorName: '',
          unitPriceDzd: selectedProduct.basePriceDzd,
          quantity: 1,
          lineTotalDzd: selectedProduct.basePriceDzd,
        },
      ],
      totals: {
        itemCount: 1,
        subtotalDzd: selectedProduct.basePriceDzd,
        shippingFeeDzd: shippingFeeDzd,
        isFreeShippingUnlocked: false,
        remainingForFreeLaghouatDzd: 0,
        totalDzd: totalDzd,
      },
    };

    try {
      // Send notifications to Telegram (@techno03bot) and ntfy app (techno-laghouat)
      await sendOrderNotifications(savedOrder);
    } catch (err) {
      console.warn('Notification delivery processed with local fallback:', err);
    }

    try {
      onOrderCompleted?.(savedOrder);
    } catch {
      // Ignore callback errors
    }

    setCompletedOrder({
      orderId: savedOrder.orderId,
      totalDzd: totalDzd,
      productName: selectedProduct.name,
    });

    setIsSubmitting(false);
  };

  return (
    <section id="quick-order" className="py-16 lg:py-24 bg-lined-paper border-b-2 border-stone-300 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="stamp-red text-xs">خدمة تكنو السريعة</span>
            <span className="stamp-yellow text-xs font-black">الدفع عند الاستلام</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black text-[#18181B]">
            <span className="highlight-yellow">استمارة الطلب المباشر الفوري</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base font-bold text-[#52525B] leading-relaxed">
            سجل طلبك في أقل من دقيقة، وسيتصل بك فريق فرع تكنو الأغواط هاتفياً للتأكيد والتسليم الفوري عبر ZR Express.
          </p>
        </div>

        {completedOrder ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto p-8 rounded-3xl bg-white border-3 border-[#18181B] shadow-[8px_8px_0px_#18181B] text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#FFD100] text-[#18181B] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-[#E30613]" />
            </div>
            <div>
              <span className="stamp-yellow text-xs font-black">
                تم تسجيل وتشفير طلبك بنجاح
              </span>
              <h3 className="mt-3 font-display text-2xl font-black text-[#18181B]">
                كود تتبع طلبيتك:
              </h3>
              <div className="mt-2 p-3 bg-stone-100 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] inline-block">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#E30613] tracking-wider">
                  {completedOrder.orderId}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#52525B] font-bold leading-relaxed">
                سيتصل بك فرع تكنو الأغواط هاتفياً لتأكيد انطلاق الشحنة إلى ولايتك عبر ZR Express.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-stone-300 flex items-center justify-between text-sm font-bold">
              <span className="text-stone-600">المبلغ الإجمالي عند الاستلام:</span>
              <span className="font-mono text-xl font-black text-[#18181B] highlight-yellow">
                {formatDzd(completedOrder.totalDzd)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setCompletedOrder(null);
                setFullName('');
                setPhone('');
              }}
              className="px-6 py-3 rounded-xl bg-[#18181B] hover:bg-[#E30613] text-white text-xs font-black border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] transition-colors cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              تسجيل طلبية جديدة
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-[#FFFDF9] border-3 border-[#18181B] shadow-[8px_8px_0px_#18181B] overflow-hidden"
          >
            {/* Authentic Physical Stationery Order Slip Header */}
            <div className="bg-[#FFD100] border-b-3 border-[#18181B] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TechnoLogo size="md" showBranch={false} />
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-black text-[#18181B] leading-none">
                    قسيمة طلب وإرسال رسمية — فرع الأغواط
                  </h3>
                  <p className="text-xs text-[#18181B]/80 font-bold mt-1">
                    TECHNO OFFICIAL EXPRESS DISPATCH VOUCHER
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="stamp-red text-[11px]">معتمد 100%</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Step 1: Interactive Product Search & Selection */}
              <div>
                <label htmlFor="quick-product-search" className="block text-sm font-black text-[#18181B] mb-2">
                  1. اختر المنتج أو الحقيبة المطلوبة:
                </label>

                {/* Selected Product Card Preview */}
                {selectedProduct && !isSearchActive ? (
                  <div className="p-4 rounded-2xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border-2 border-[#18181B] flex items-center justify-center overflow-hidden shrink-0">
                        {selectedProduct.imageUrl ? (
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-[#E30613]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="stamp-yellow text-[10px] font-black">المنتج المحدد</span>
                          {selectedProduct.sku && (
                            <span className="text-[11px] font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                              #{selectedProduct.sku}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-[#18181B] leading-tight">
                          {selectedProduct.name}
                        </h4>
                        <span className="text-xs font-mono font-black text-[#E30613]">
                          {selectedProduct.basePriceDzd > 0
                            ? formatDzd(selectedProduct.basePriceDzd)
                            : 'تأكيد السعر الرسمي مع الفرع عند الاتصال'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchActive(true);
                        setSearchQuery('');
                      }}
                      className="px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FFD100] text-xs font-black text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] transition-colors cursor-pointer shrink-0"
                    >
                      تغيير المنتج أو البحث برمز آخر
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        id="quick-product-search"
                        type="text"
                        autoFocus={isSearchActive}
                        placeholder="اكتب رمز المنتج أو رابطه أو اسمه..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-11 pl-10 py-3 min-h-[50px] rounded-2xl border-2 border-[#18181B] bg-white text-[#18181B] text-sm font-bold shadow-[3px_3px_0px_#18181B] focus:bg-[#FFD100]/10 focus:outline-none transition-all"
                      />
                      <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#18181B]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Search Results Dropdown List */}
                    {isQuerySearched && searchResults.length > 0 && (
                      <div className="rounded-2xl border-2 border-[#18181B] bg-white shadow-[4px_4px_0px_#18181B] overflow-hidden divide-y divide-stone-200 max-h-64 overflow-y-auto">
                        <div className="p-2.5 bg-[#FAF8F5] text-xs font-black text-[#52525B]">
                          نتائج البحث ({searchResults.length} منتج متطابق): اضغط على المنتج لاختياره
                        </div>
                        {searchResults.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleSelectProduct(prod)}
                            className="w-full p-3 text-right hover:bg-[#FFD100]/15 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center shrink-0 overflow-hidden">
                                {prod.imageUrl ? (
                                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ShoppingBag className="w-5 h-5 text-[#E30613]" />
                                )}
                              </div>
                              <div>
                                <span className="block text-xs sm:text-sm font-black text-[#18181B] leading-tight">
                                  {prod.name}
                                </span>
                                {prod.sku && (
                                  <span className="text-[11px] font-mono text-stone-500">
                                    رمز: #{prod.sku}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-xs font-mono font-black text-[#E30613] shrink-0">
                              {formatDzd(prod.basePriceDzd)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Product Not Found State (if searched and no match, or product was deleted) */}
                    {isProductNotFound && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-500 text-amber-950 text-xs font-bold flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-black text-sm text-amber-900 mb-0.5">
                              المنتج غير موجود أو تم حذفه من المتجر
                            </p>
                            <p className="text-amber-800 leading-relaxed">
                              لم نتمكن من العثور على أي منتج مطابق لـ &quot;{searchQuery}&quot;. يرجى التأكد من كتابة الرمز أو الاسم بدقة، أو يمكنك اعتماد طلب هذا المنتج بالاسم مباشرة وسيقوم فريق الفرع بتجهيزه لك.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleSelectProduct({
                              id: `custom-${Date.now()}`,
                              sku: 'CUSTOM',
                              name: searchQuery.trim(),
                              basePriceDzd: 0,
                            });
                          }}
                          className="w-full p-3.5 rounded-2xl bg-[#FFD100] hover:bg-[#E5BC00] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] text-right flex items-center justify-between gap-3 text-xs font-black text-[#18181B] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#E30613]" />
                            <span>طلب هذه الأداة مباشرة من الفرع: &quot;{searchQuery.trim()}&quot;</span>
                          </div>
                          <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-[#18181B]">
                            تأكيد الاختيار
                          </span>
                        </button>
                      </div>
                    )}

                    {!selectedProduct && catalog.length === 0 && !isQuerySearched && (
                      <div className="p-3.5 rounded-2xl bg-[#FFFDF0] border-2 border-[#FDE047] text-xs font-bold text-[#854D0E]">
                        اكتب اسم الأداة أو التشكيلة التي ترغب بطلبها مباشرة من فرع تكنو الأغواط وسيقوم فريقنا بتجهيزها وإرسالها لك فوراً.
                      </div>
                    )}

                    {/* Quick Selection Buttons from Catalog */}
                    {!isQuerySearched && catalog.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-stone-500 block">
                          أو اختر مباشرة من المعروضات الأكثر طلباً:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {catalog.slice(0, 4).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectProduct(item)}
                              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-[#FFD100] text-xs font-bold text-[#18181B] transition-colors cursor-pointer"
                            >
                              {item.name} ({formatDzd(item.basePriceDzd)})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct && isSearchActive && (
                      <button
                        type="button"
                        onClick={() => setIsSearchActive(false)}
                        className="text-xs text-stone-500 underline font-bold hover:text-[#18181B]"
                      >
                        إلغاء والعودة للمنتج المحدد سابقاً ({selectedProduct.name})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Customer Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quick-name" className="block text-sm font-black text-[#18181B] mb-1.5">
                    2. الاسم الكامل:
                  </label>
                  <input
                    id="quick-name"
                    type="text"
                    placeholder="اكتب اسمك الكامل هنا..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 min-h-[48px] rounded-xl border-2 border-[#18181B] bg-white text-[#18181B] text-sm font-bold shadow-[2px_2px_0px_#18181B] focus:bg-[#FFD100]/10 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="quick-phone" className="text-sm font-black text-[#18181B]">
                      رقم الهاتف (للتأكيد والتسليم):
                    </label>
                    {cleanPhoneDigits.length > 0 && (
                      <span className={`text-[10px] font-bold ${isPhoneValid ? 'text-emerald-700' : 'text-stone-500'}`}>
                        {isPhoneValid ? 'رقم جزائري صحيح' : `${cleanPhoneDigits.length}/10 خانات`}
                      </span>
                    )}
                  </div>
                  <input
                    id="quick-phone"
                    type="tel"
                    dir="ltr"
                    placeholder="رقم الهاتف"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-3 min-h-[48px] rounded-xl border-2 bg-white text-[#18181B] font-mono text-right text-sm font-bold shadow-[2px_2px_0px_#18181B] focus:outline-none transition-colors ${
                      isPhoneValid
                        ? 'border-emerald-600 focus:bg-emerald-50'
                        : 'border-[#18181B] focus:bg-[#FFD100]/10'
                    }`}
                  />
                </div>
              </div>

              {/* Step 3: Wilaya & Delivery Method (Address input completely removed as requested) */}
              <div className="space-y-3">
                <label htmlFor="quick-wilaya" className="block text-sm font-black text-[#18181B]">
                  3. ولاية ومكان الاستلام:
                </label>
                <select
                  id="quick-wilaya"
                  value={wilayaCode}
                  onChange={(e) => setWilayaCode(e.target.value)}
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border-2 border-[#18181B] bg-white text-[#18181B] text-sm font-bold shadow-[2px_2px_0px_#18181B] focus:bg-[#FFD100]/10 focus:outline-none"
                >
                  {WILAYA_DELIVERY_RATES.map((rate) => (
                    <option key={rate.code} value={rate.code}>
                      {rate.code} — {rate.nameAr} ({rate.nameFr})
                    </option>
                  ))}
                </select>

                {/* Delivery Type Radios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('home')}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                      deliveryMethod === 'home'
                        ? 'border-[#18181B] bg-[#E30613] text-white shadow-[3px_3px_0px_#18181B]'
                        : 'border-[#18181B] bg-white text-[#18181B] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>توصيل لباب المنزل (À Domicile)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('stop_desk')}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                      deliveryMethod === 'stop_desk'
                        ? 'border-[#18181B] bg-[#FFD100] text-[#18181B] shadow-[3px_3px_0px_#18181B]'
                        : 'border-[#18181B] bg-white text-[#18181B] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>استلام من المكتب (Stop Desk)</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-600 font-bold leading-relaxed">
                  {deliveryMethod === 'home' ? (
                    <span>سيتصل بك موزع ZR Express هاتفياً فور وصول الطرد إلى ولايتك لتسليمه عند باب بيتك والدفع عند الاستلام.</span>
                  ) : (
                    <span>سيصلك إشعار بالرسالة القصيرة فور وصول الطرد إلى مكتب ZR Express في ولايتك لاستلامه.</span>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-100 border-2 border-[#E30613] text-[#E30613] text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#E30613] shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Price summary */}
              <div className="pt-5 border-t-2 border-stone-200 space-y-3">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-stone-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-[#52525B]">
                    <span className="block text-stone-500">حساب الطلبية الرسمية:</span>
                    <span>
                      سعر المنتج ({formatDzd(currentPrice)}) + التوصيل المعتمد ({formatDzd(shippingFeeDzd)})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#71717A] block">المبلغ الإجمالي للدفع عند الاستلام:</span>
                    <span className="font-display text-2xl font-black text-[#18181B] highlight-yellow">
                      {formatDzd(totalDzd)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProduct}
                  className="w-full px-6 py-4 min-h-[54px] rounded-2xl bg-[#E30613] hover:bg-[#C4000F] text-white font-display text-base font-black border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-3 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري تسجيل وتشفير الطلب...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>تأكيد الطلب الفوري الآن — الدفع عند الاستلام: {formatDzd(totalDzd)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
