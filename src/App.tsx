import { useEffect, useMemo, useState } from 'react';
import {
  Phone,
  RotateCcw,
  Search,
  ShoppingBag,
  FolderOpen,
  Feather,
  Briefcase,
  Compass,
  BookOpen,
  Clock,
  ArrowLeft,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import {
  STORE_INFO,
  type Product,
  type StoreCategory,
} from './data/products';
import {
  buildProductPageUrl,
  calculateOrderTotals,
  extractProductIdFromLocation,
  extractStoreCategories,
  filterAndSortProducts,
  findProductByIdOrSku,
  getCartItemKey,
  resolveProductVariant,
  upsertCartItem,
  type CartItem,
  type ProductFilterState,
  type SavedOrder,
  type SortOption,
} from './utils/storeLogic';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AnnouncementBar } from './components/AnnouncementBar';
import { TrustBadges } from './components/TrustBadges';
import { StationeryAssistant } from './components/StationeryAssistant';
import { CategoryShowcase } from './components/CategoryShowcase';
import { QuickOrderSection } from './components/QuickOrderSection';
import { FloatingActions } from './components/FloatingActions';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ProductNotFoundPage } from './components/ProductNotFoundPage';
import { CartDrawer, type DrawerStep } from './components/CartDrawer';
import { BranchSection } from './components/BranchSection';
import { Footer } from './components/Footer';

const CART_STORAGE_KEY = 'techno_laghouat_cart_v1';
const ORDERS_STORAGE_KEY = 'techno_laghouat_orders_v1';
const PRODUCTS_CACHE_KEY = 'techno_laghouat_products_cache_v1';
const CATEGORIES_CACHE_KEY = 'techno_laghouat_categories_cache_v1';
const BACKEND_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
  'https://techno-laghouat-backend.hotel-saharien.workers.dev';

const DEFAULT_FILTERS: ProductFilterState = {
  series: 'all',
  color: 'all',
  query: '',
  sort: 'featured',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isDemoModeRequested(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === '1';
}

export default function App() {
  const [isDemoMode] = useState<boolean>(() => isDemoModeRequested());
  const [cart, setCart] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(CART_STORAGE_KEY, []),
  );
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>(() =>
    readStorage<SavedOrder[]>(ORDERS_STORAGE_KEY, []),
  );
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState<DrawerStep>('cart');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() =>
    readStorage<Product[]>(PRODUCTS_CACHE_KEY, []),
  );
  const [backendCategories, setBackendCategories] = useState<StoreCategory[]>(() =>
    readStorage<StoreCategory[]>(CATEGORIES_CACHE_KEY, []),
  );
  const [requestedId, setRequestedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return extractProductIdFromLocation(window.location);
  });
  const [isSynced, setIsSynced] = useState<boolean>(() => isDemoModeRequested());
  const [activeProduct, setActiveProduct] = useState<Product | null>(() => {
    if (typeof window === 'undefined') return null;
    const initialId = extractProductIdFromLocation(window.location);
    if (!initialId) return null;
    const initialCatalog = readStorage<Product[]>(PRODUCTS_CACHE_KEY, []);
    return findProductByIdOrSku(initialCatalog, initialId);
  });

  useEffect(() => {
    if (isDemoMode) return;
    let isMounted = true;

    async function syncProductsFromBackend() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.success && Array.isArray(data.products)) {
          if (isMounted) {
            setProducts(data.products);
            try {
              window.localStorage.setItem(
                PRODUCTS_CACHE_KEY,
                JSON.stringify(data.products),
              );
            } catch {
              // Ignore storage quota issues
            }
          }
        }
        if (data?.success && Array.isArray(data.categories)) {
          if (isMounted) {
            setBackendCategories(data.categories);
            try {
              window.localStorage.setItem(
                CATEGORIES_CACHE_KEY,
                JSON.stringify(data.categories),
              );
            } catch {
              // Ignore storage quota issues
            }
          }
        }
      } catch {
        // Offline / unreachable backend: keep current storage
      } finally {
        if (isMounted) {
          setIsSynced(true);
        }
      }
    }

    syncProductsFromBackend();
    return () => {
      isMounted = false;
    };
  }, [isDemoMode]);

  // Synchronize active product when products state updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentId = extractProductIdFromLocation(window.location);
    setRequestedId(currentId);
    if (currentId) {
      const match = findProductByIdOrSku(products, currentId);
      setActiveProduct(match);
    } else {
      setActiveProduct(null);
    }
  }, [products]);

  // Synchronize browser history navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const currentId = extractProductIdFromLocation(window.location);
      setRequestedId(currentId);
      if (currentId) {
        const match = findProductByIdOrSku(products, currentId);
        setActiveProduct(match);
      } else {
        setActiveProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [products]);

  const isProductNotFound = Boolean(
    isSynced &&
      requestedId &&
      !activeProduct &&
      !findProductByIdOrSku(products, requestedId),
  );

  // Dynamically update document title for SEO & social sharing
  useEffect(() => {
    if (activeProduct) {
      document.title = `${activeProduct.name} (#${activeProduct.sku}) — ${STORE_INFO.branchName}`;
    } else if (isProductNotFound) {
      document.title = `المنتج غير متوفر حالياً — ${STORE_INFO.branchName}`;
    } else {
      document.title = `${STORE_INFO.branchName} — متجر الأدوات المكتبية والمهنية`;
    }
  }, [activeProduct, isProductNotFound]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(savedOrders));
    } catch {
      // Ignore storage quota issues
    }
  }, [savedOrders]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const storeCategories = useMemo(
    () => extractStoreCategories(products, backendCategories),
    [products, backendCategories],
  );

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters],
  );

  const cartSummary = useMemo(
    () => calculateOrderTotals(cart, products, 'pickup'),
    [cart, products],
  );

  const hasActiveFilters =
    filters.series !== 'all' ||
    filters.query.trim().length > 0 ||
    filters.sort !== 'featured';

  const handleOpenProductPage = (product: Product) => {
    const productNumber = (product.sku || product.id).trim();
    setActiveProduct(product);
    setRequestedId(productNumber);
    setSelectedProduct(null);
    window.history.pushState(null, '', buildProductPageUrl(productNumber));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveProduct(null);
    setRequestedId(null);
    setSelectedProduct(null);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (
    product: Product,
    quantity = 1,
    variantId?: string,
  ) => {
    const resolvedVariant = resolveProductVariant(product, variantId);
    setCart((prev) =>
      upsertCartItem(prev, product.id, quantity, resolvedVariant?.id),
    );
    setToastMessage(
      `تمت إضافة «${product.shortName}${resolvedVariant ? ` — ${resolvedVariant.label}` : ''}» إلى سلة الطلب`,
    );
  };

  const handleQuickOrder = (
    product: Product,
    quantity = 1,
    variantId?: string,
  ) => {
    const resolvedVariant = resolveProductVariant(product, variantId);
    setCart((prev) =>
      upsertCartItem(prev, product.id, quantity, resolvedVariant?.id),
    );
    setSelectedProduct(null);
    setDrawerStep('checkout');
    setIsDrawerOpen(true);
  };

  const handleUpdateQuantity = (
    productId: string,
    delta: number,
    variantId?: string,
  ) => {
    setCart((prev) => upsertCartItem(prev, productId, delta, variantId));
  };

  const handleRemoveItem = (productId: string, variantId?: string) => {
    const targetKey = getCartItemKey(productId, variantId);
    setCart((prev) =>
      prev.filter(
        (item) => getCartItemKey(item.productId, item.variantId) !== targetKey,
      ),
    );
  };

  const handleOrderCompleted = (order: SavedOrder) => {
    setSavedOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B]">
      {activeProduct ? (
        <ProductDetailPage
          product={activeProduct}
          allProducts={products}
          cartCount={cartSummary.itemCount}
          onBackToHome={handleBackToHome}
          onSelectProduct={handleOpenProductPage}
          onAddToCart={handleAddToCart}
          onOpenCart={() => {
            setDrawerStep('cart');
            setIsDrawerOpen(true);
          }}
          onOrderCompleted={handleOrderCompleted}
        />
      ) : isProductNotFound && requestedId ? (
        <ProductNotFoundPage
          requestedId={requestedId}
          allProducts={products}
          cartCount={cartSummary.itemCount}
          onBackToHome={handleBackToHome}
          onSelectProduct={handleOpenProductPage}
          onAddToCart={(p, variantId) => handleAddToCart(p, 1, variantId)}
          onOpenCart={() => {
            setDrawerStep('cart');
            setIsDrawerOpen(true);
          }}
        />
      ) : (
        <>
          <AnnouncementBar />
          <Header
            cartCount={cartSummary.itemCount}
            onOpenCart={() => {
              setDrawerStep('cart');
              setIsDrawerOpen(true);
            }}
          />

          <main className="flex-1">
            <Hero
              products={products}
              categoryCount={storeCategories.length}
              onSelectProduct={(product) => handleOpenProductPage(product)}
              onQuickOrder={(product, variantId) =>
                handleQuickOrder(product, 1, variantId)
              }
            />

            <TrustBadges />

            <StationeryAssistant />

            <CategoryShowcase
              onSelectCategory={(query) => {
                setFilters((prev) => ({ ...prev, query, series: 'all' }));
              }}
            />

            {/* Dynamic Categories & Catalog Section */}
            <section id="collection" className="py-14 lg:py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#E30613]">
                      متوفرة حالياً في متجر الأغواط · توصيل لـ 54 ولاية
                    </p>
                    <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-[#18181B]">
                      تشكيلة معروضات وأدوات تكنو الأغواط
                    </h2>
                  </div>

                  <p
                    data-testid="catalog-results-count"
                    className="text-sm text-[#52525B] tabular-nums"
                  >
                    عرض {filteredProducts.length} من أصل {products.length}{' '}
                    {products.length >= 3 && products.length <= 10 ? 'منتجات' : 'منتج'}
                  </p>
                </div>

                {/* Interactive Dynamic Category Filter Bar (Synced from Telegram) */}
                {storeCategories.length > 0 ? (
                  <div
                    role="group"
                    aria-label="تصفية المنتجات حسب القسم"
                    data-testid="category-filter-bar"
                    className="mt-6 flex items-center md:flex-wrap gap-2 overflow-x-auto pb-1"
                  >
                    <button
                      type="button"
                      data-testid="category-filter-all"
                      aria-pressed={filters.series === 'all'}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, series: 'all' }))
                      }
                      className={`px-4 py-2.5 min-h-[42px] rounded-xl border text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        filters.series === 'all'
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-white text-[#18181B] border-stone-200 hover:border-[#18181B]'
                      }`}
                    >
                      الكل ({products.length})
                    </button>

                    {storeCategories.map((cat) => {
                      const isActive =
                        filters.series === cat.id || filters.series === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          data-testid={`category-filter-${cat.id}`}
                          aria-pressed={isActive}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, series: cat.id }))
                          }
                          className={`px-4 py-2.5 min-h-[42px] rounded-xl border text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#E30613] text-white border-[#E30613]'
                              : 'bg-white text-[#18181B] border-stone-200 hover:border-[#E30613]'
                          }`}
                        >
                          {cat.name}{' '}
                          <span className="font-mono text-xs opacity-80">
                            ({cat.count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {/* Search & Sort Controls */}
                <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search
                      className="w-4 h-4 text-[#71717A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <label htmlFor="catalog-search" className="sr-only">
                      البحث في معروضات تكنو الأغواط
                    </label>
                    <input
                      id="catalog-search"
                      type="search"
                      placeholder="ابحث بالاسم، القسم، القياس، أو رقم المنتج..."
                      value={filters.query}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, query: e.target.value }))
                      }
                      className="w-full pr-10 pl-3.5 py-2.5 min-h-[44px] rounded-xl border border-stone-300 text-sm bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#E30613] transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="catalog-sort"
                        className="text-xs font-medium text-[#52525B] whitespace-nowrap"
                      >
                        الترتيب:
                      </label>
                      <select
                        id="catalog-sort"
                        value={filters.sort}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            sort: e.target.value as SortOption,
                          }))
                        }
                        className="px-3 py-2 min-h-[44px] rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#E30613]"
                      >
                        <option value="featured">الأحدث والمميز</option>
                        <option value="price-asc">السعر: من الأقل للأعلى</option>
                        <option value="price-desc">السعر: من الأعلى للأقل</option>
                      </select>
                    </div>

                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium text-[#E30613] hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>إعادة ضبط</span>
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Product Grid or Empty State */}
                {filteredProducts.length > 0 ? (
                  <div
                    data-testid="product-grid"
                    className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7"
                  >
                    {filteredProducts.map((product) => {
                      const quantityInCart = cart
                        .filter((item) => item.productId === product.id)
                        .reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          quantityInCart={quantityInCart}
                          onAddToCart={(p, variantId) =>
                            handleAddToCart(p, 1, variantId)
                          }
                          onOpenDetails={(p) => handleOpenProductPage(p)}
                        />
                      );
                    })}

                    {!hasActiveFilters && filteredProducts.length % 3 === 2 ? (
                      <aside className="flex flex-col justify-between bg-[#18181B] text-white rounded-2xl p-6 sm:p-7 border border-stone-800">
                        <div>
                          <p className="text-xs font-medium text-[#F5C400]">
                            {STORE_INFO.fullTitle}
                          </p>
                          <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-balance">
                            طلبات الجملة والمؤسسات أو الاستشارة المباشرة
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-stone-300">
                            هل ترغب في تجهيز مكتبك أو مؤسستك أو الاستفسار عن قياسات وتوفر أي أداة
                            قبل الطلب؟ فريق فرع تكنو الأغواط في خدمتك مباشرة.
                          </p>

                          <dl className="mt-6 pt-5 border-t border-white/10 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-stone-400">نطاق التوصيل</dt>
                              <dd className="font-semibold text-white">
                                54 ولاية (ZR Express)
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-stone-400">داخل ولاية الأغواط</dt>
                              <dd className="font-semibold text-white tabular-nums">
                                500 د.ج منزل · 380 د.ج مكتب
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-stone-400">الاستلام من المتجر</dt>
                              <dd className="font-semibold text-white">مجاني خلال ساعتين</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
                          <a
                            href={STORE_INFO.phoneHref}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-lg bg-[#E30613] text-white text-sm font-semibold hover:bg-[#C4000F] transition-colors"
                          >
                            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>اتصل بالفرع:</span>
                            <span dir="ltr" className="font-mono">
                              {STORE_INFO.phoneDisplay}
                            </span>
                          </a>
                          <a
                            href="#delivery-rates"
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 min-h-[42px] rounded-lg border border-white/20 text-stone-200 text-sm font-medium hover:bg-white/10 transition-colors"
                          >
                            احسب سعر التوصيل لولايتك
                          </a>
                        </div>
                      </aside>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    {products.length === 0 ? (
                      /* HYPER-INTERACTIVE VIRTUAL SHOWROOM OF OFFICIAL TECHNO DEPARTMENTS */
                      <div className="space-y-8">
                        {/* Status banner */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFD100]/25 via-white to-[#E30613]/10 border-2 border-[#FFD100] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181B] text-[#FFD100] text-xs font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-[#E30613]" />
                              <span>معرض أقسام تكنو الأغواط الرسمي</span>
                            </div>
                            <h3 className="font-display text-xl sm:text-2xl font-black text-[#18181B]">
                              تشكيلات متوفرة بالفرع وجاهزة للشحن الفوري
                            </h3>
                            <p className="text-xs sm:text-sm text-[#52525B] max-w-2xl leading-relaxed">
                              يسعدنا استقبالكم في فرعنا بوسط مدينة الأغواط، كما يمكنكم طلب أي من التشكيلات أدناه مباشرة عبر نموذج الطلب السريع أو الاتصال بفريقنا لتجهيز طلبيتك وإرسالها عبر ZR Express.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <a
                              href="#quick-order"
                              className="animate-sheen inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black shadow-md transition-all active:scale-95"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>طلب سريع ومباشر</span>
                            </a>
                            <a
                              href={STORE_INFO.phoneHref}
                              dir="ltr"
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-stone-300 bg-white hover:border-[#18181B] text-[#18181B] text-xs font-mono font-bold transition-all"
                            >
                              <Phone className="w-4 h-4 text-[#E30613]" />
                              <span>{STORE_INFO.phoneDisplay}</span>
                            </a>
                          </div>
                        </div>

                        {/* Interactive 6-Department Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                            {
                              id: 'office',
                              icon: FolderOpen,
                              title: 'الأدوات المكتبية وسجلات المحاسبة',
                              subtitle: 'سجلات محاسبية رسمية، ملفات أرشفة فولاذية، ومنظمات مكاتب فاخرة',
                              startingPrice: 'من 1,800 د.ج',
                              badge: 'تجهيز شركات وإدارات',
                              iconBg: 'bg-[#FFD100] text-[#18181B]',
                              borderColor: 'border-[#FFD100]/60',
                              bgGradient: 'from-[#FFD100]/15 via-white to-white',
                              features: ['سجلات مرقمة رسمياً', 'ملفات حفظ متينة', 'تنظيم بيئة العمل'],
                            },
                            {
                              id: 'pens',
                              icon: Feather,
                              title: 'أقلام التوقيع الفاخرة والخط العربي',
                              subtitle: 'أقلام حبر سائل، رولر تنفيذي، وأطقم خط عربي تمنحك هيبة وسلاسة في كل توقيع',
                              startingPrice: 'من 1,200 د.ج',
                              badge: 'كتابة فاخرة وهدايا',
                              iconBg: 'bg-[#E30613] text-white',
                              borderColor: 'border-[#E30613]/30',
                              bgGradient: 'from-[#E30613]/10 via-white to-white',
                              features: ['حبر ملكي أزرق وأسود', 'هيكل معدني مصقول', 'علبة تقديم فاخرة'],
                            },
                            {
                              id: 'bags',
                              icon: Briefcase,
                              title: 'حقائب تكنو PROBAG للحواسيب والوثائق',
                              subtitle: 'حقائب أعمال متينة مقاومة للصدمات والماء بمقاسات متعددة مبطنة للحواسيب',
                              startingPrice: 'من 4,500 د.ج',
                              badge: 'حماية وأناقة متكاملة',
                              iconBg: 'bg-[#18181B] text-[#FFD100]',
                              borderColor: 'border-stone-400',
                              bgGradient: 'from-stone-900/10 via-white to-white',
                              features: ['مقاومة للماء والصدمات', 'حماية الحواسيب حتى 17"', 'أحزمة مريحة'],
                            },
                            {
                              id: 'arts',
                              icon: Compass,
                              title: 'مستلزمات الهندسة المعمارية والفنون',
                              subtitle: 'أقلام تحبير فنية دقيقة، ورق كانسون فاخر، ومساطر ليزر للمخططات',
                              startingPrice: 'من 850 د.ج',
                              badge: 'معايير معمارية دقيقة',
                              iconBg: 'bg-amber-500 text-white',
                              borderColor: 'border-amber-300',
                              bgGradient: 'from-amber-500/15 via-white to-white',
                              features: ['رؤوس معيارية 0.1 - 0.8 مم', 'ورق Canson أصلي', 'أدوات قياس ليزرية'],
                            },
                            {
                              id: 'school',
                              icon: BookOpen,
                              title: 'اللوازم المدرسية والجامعية',
                              subtitle: 'دفاتر تكنو المقسمة ناصعة البياض، أطقم هندسية، وأقلام تظليل نيون مريحة',
                              startingPrice: 'من 650 د.ج',
                              badge: 'دراسة وتفوق يومي',
                              iconBg: 'bg-blue-600 text-white',
                              borderColor: 'border-blue-300',
                              bgGradient: 'from-blue-500/15 via-white to-white',
                              features: ['ورق فائق النعومة', 'أقلام نيون ساطعة', 'أدوات تدوم طويلاً'],
                            },
                            {
                              id: 'clocks',
                              icon: Clock,
                              title: 'الساعات المكتبية والآلات الحاسبة',
                              subtitle: 'ساعات حائطية ومكتبية صامتة كوارتز وحاسبات كاسيو العلمية المعتمدة',
                              startingPrice: 'من 2,200 د.ج',
                              badge: 'تنظيم واحترافية',
                              iconBg: 'bg-emerald-600 text-white',
                              borderColor: 'border-emerald-300',
                              bgGradient: 'from-emerald-500/15 via-white to-white',
                              features: ['محركات كوارتز صامتة', 'حاسبات علمية معتمدة', 'تصاميم مكتبية أنيقة'],
                            },
                          ].map((dept) => {
                            const DeptIcon = dept.icon;
                            return (
                              <div
                                key={dept.id}
                                className={`p-6 rounded-3xl bg-gradient-to-b ${dept.bgGradient} border-2 ${dept.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-4">
                                    <div className={`w-12 h-12 rounded-2xl ${dept.iconBg} flex items-center justify-center shadow-md`}>
                                      <DeptIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-[#18181B] shadow-2xs">
                                        {dept.badge}
                                      </span>
                                      <span className="text-xs font-mono font-black text-[#E30613]">
                                        {dept.startingPrice}
                                      </span>
                                    </div>
                                  </div>

                                  <h4 className="font-display text-base font-bold text-[#18181B] leading-snug">
                                    {dept.title}
                                  </h4>
                                  <p className="mt-2 text-xs text-[#52525B] leading-relaxed">
                                    {dept.subtitle}
                                  </p>

                                  <div className="mt-4 pt-3 border-t border-stone-200/60 space-y-1.5">
                                    {dept.features.map((feat, fIdx) => (
                                      <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-[#18181B] font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span>{feat}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center gap-2">
                                  <a
                                    href="#quick-order"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#18181B] hover:bg-[#E30613] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>طلب مباشر</span>
                                  </a>
                                  <a
                                    href={STORE_INFO.phoneHref}
                                    dir="ltr"
                                    className="p-2.5 rounded-xl border border-stone-300 bg-white hover:border-[#E30613] text-[#18181B] hover:text-[#E30613] transition-colors"
                                    title="اتصل للاستفسار فوراً"
                                  >
                                    <Phone className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 px-6 rounded-2xl bg-white border border-stone-200 text-center">
                        <p className="font-display text-base font-semibold text-[#18181B]">
                          لا توجد معروضات مطابقة للقسم أو كلمة البحث
                        </p>
                        <p className="mt-1.5 text-sm text-[#52525B]">
                          جرب اختيار قسم آخر أو البحث باسم الأداة أو رقم المنتج.
                        </p>
                        <button
                          type="button"
                          onClick={() => setFilters(DEFAULT_FILTERS)}
                          className="mt-5 px-4 py-2.5 min-h-[42px] rounded-lg bg-[#18181B] text-white text-sm font-medium hover:bg-[#E30613] transition-colors cursor-pointer"
                        >
                          عرض جميع المنتجات
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <QuickOrderSection />

            <BranchSection savedOrders={savedOrders} />
          </main>
        </>
      )}

      <Footer />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        products={products}
        onClose={() => setSelectedProduct(null)}
        onSwitchProduct={(product) => setSelectedProduct(product)}
        onAddToCart={handleAddToCart}
        onOrderNow={handleQuickOrder}
      />

      {/* Slide-over Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        step={drawerStep}
        cart={cart}
        products={products}
        onClose={() => setIsDrawerOpen(false)}
        onChangeStep={setDrawerStep}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Subtle Bottom Feedback Toast on Add to Cart */}
      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-40 max-w-sm bg-[#18181B] text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-4 text-sm"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setDrawerStep('cart');
              setIsDrawerOpen(true);
            }}
            className="text-xs font-semibold text-[#F5C400] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            عرض السلة
          </button>
        </div>
      ) : null}
      {/* Floating Action Button */}
      <FloatingActions />
    </div>
  );
}
