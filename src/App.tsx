import { useEffect, useMemo, useState } from 'react';
import {
  Phone,
  RotateCcw,
  Search,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Truck,
  CheckCircle2,
  ChevronDown,
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
import { CategoryShowcase } from './components/CategoryShowcase';
import { QuickOrderSection } from './components/QuickOrderSection';
import { PacksSection } from './components/PacksSection';
import { type StorePack } from './data/packs';
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
const PACKS_CACHE_KEY = 'techno_laghouat_packs_cache_v1';
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
  const [products, setProducts] = useState<Product[]>(() => {
    return readStorage<Product[]>(PRODUCTS_CACHE_KEY, []);
  });
  const [backendCategories, setBackendCategories] = useState<StoreCategory[]>(() =>
    readStorage<StoreCategory[]>(CATEGORIES_CACHE_KEY, []),
  );
  const [packs, setPacks] = useState<StorePack[]>(() => {
    return readStorage<StorePack[]>(PACKS_CACHE_KEY, []);
  });
  const [visibleProductsCount, setVisibleProductsCount] = useState<number>(8);
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

        // Sync Custom Packs from Backend
        try {
          const packsRes = await fetch(`${BACKEND_URL}/api/packs`);
          if (packsRes.ok) {
            const packsData = await packsRes.json();
            if (packsData?.success && Array.isArray(packsData.packs)) {
              if (isMounted) {
                setPacks(packsData.packs);
                try {
                  window.localStorage.setItem(PACKS_CACHE_KEY, JSON.stringify(packsData.packs));
                } catch {
                  // Ignore quota
                }
              }
            }
          }
        } catch {
          // Keep cached or default packs
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

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleProductsCount),
    [filteredProducts, visibleProductsCount],
  );

  useEffect(() => {
    setVisibleProductsCount(8);
  }, [filters.series, filters.color, filters.query, filters.sort]);

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

  const handleOrderPack = (pack: StorePack) => {
    const packProduct: Product = {
      id: pack.id,
      sku: pack.sku,
      name: pack.name,
      shortName: pack.name,
      brand: 'Techno Special Pack',
      series: 'classic',
      seriesLabel: 'باقات خاصة',
      priceDzd: pack.packPriceDzd,
      image: pack.imageUrl || '',
      images: pack.imageUrl ? [pack.imageUrl] : [],
      alt: pack.name,
      summary: pack.tagline,
      description: `${pack.description}\nالمحتويات المرفقة:\n${pack.items.join(' - ')}`,
      availabilityText: 'متوفر للطلب الفوري',
      featuredRank: 1,
      siblingIds: [],
      specs: [
        { label: 'نوع العرض', value: 'باقة متكاملة' },
        { label: 'الفئة', value: pack.targetAudience },
      ],
      highlights: pack.items,
    };
    handleAddToCart(packProduct, 1);
    setSelectedProduct(null);
    setDrawerStep('checkout');
    setIsDrawerOpen(true);
  };

  const handleAddPackToCart = (pack: StorePack) => {
    const packProduct: Product = {
      id: pack.id,
      sku: pack.sku,
      name: pack.name,
      shortName: pack.name,
      brand: 'Techno Special Pack',
      series: 'classic',
      seriesLabel: 'باقات خاصة',
      priceDzd: pack.packPriceDzd,
      image: pack.imageUrl || '',
      images: pack.imageUrl ? [pack.imageUrl] : [],
      alt: pack.name,
      summary: pack.tagline,
      description: `${pack.description}\nالمحتويات المرفقة:\n${pack.items.join(' - ')}`,
      availabilityText: 'متوفر للطلب الفوري',
      featuredRank: 1,
      siblingIds: [],
      specs: [
        { label: 'نوع العرض', value: 'باقة متكاملة' },
        { label: 'الفئة', value: pack.targetAudience },
      ],
      highlights: pack.items,
    };
    handleAddToCart(packProduct, 1);
    setToastMessage(`تمت إضافة «${pack.name}» إلى سلة الطلب`);
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
    <div className="min-h-screen flex flex-col bg-lined-paper text-[#18181B]">
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

            <CategoryShowcase
              onSelectCategory={(query) => {
                setFilters((prev) => ({ ...prev, query, series: 'all' }));
              }}
            />

            {/* Dynamic Categories & Catalog Section */}
            <section id="collection" className="py-14 lg:py-20 bg-lined-paper border-b-2 border-stone-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="stamp-red text-[11px]">فرع الأغواط</span>
                      <span className="stamp-yellow text-[11px]">متوفرة في المتجر</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-black text-[#18181B]">
                      <span className="highlight-yellow">تشكيلة معروضات وأدوات تكنو الأغواط</span>
                    </h2>
                  </div>

                  <p
                    data-testid="catalog-results-count"
                    className="text-xs font-bold font-mono text-[#18181B] bg-white px-3 py-1.5 rounded-lg border-2 border-stone-300 tabular-nums"
                  >
                    عرض {displayedProducts.length} من أصل {filteredProducts.length}{' '}
                    {filteredProducts.length >= 3 && filteredProducts.length <= 10 ? 'منتجات' : 'منتج'}
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
                  <>
                    <div
                      data-testid="product-grid"
                      className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7"
                    >
                    {displayedProducts.map((product) => {
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
                      <aside className="relative flex flex-col justify-between bg-[#FDFBF7] text-[#1E293B] rounded-3xl p-6 sm:p-7 border-2 border-dashed border-[#475569] shadow-[5px_5px_0px_#64748B] hover:shadow-[7px_7px_0px_#334155] transition-all">
                        {/* Pencil Sketch Header Tag */}
                        <div>
                          <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-dashed border-[#94A3B8]/60">
                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#475569]">
                              <span className="text-sm">✎</span>
                              <span>مذكرة الفرع التخطيطية</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#64748B] bg-[#E2E8F0]/80 px-2 py-0.5 rounded border border-[#94A3B8]/60">
                              رسم بقلم الرصاص
                            </span>
                          </div>

                          <p className="mt-3 text-xs font-mono font-bold text-[#64748B]">
                            {STORE_INFO.fullTitle}
                          </p>
                          <h3 className="mt-1 font-display text-xl sm:text-2xl font-black leading-snug text-[#0F172A]">
                            طلبات الجملة والمؤسسات أو الاستشارة المباشرة
                          </h3>
                          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#334155] font-medium">
                            هل ترغب في تجهيز مكتبك أو مؤسستك أو الاستفسار عن قياسات وتوفر أي أداة
                            قبل الطلب؟ فريق فرع تكنو الأغواط في خدمتك مباشرة.
                          </p>

                          <dl className="mt-5 pt-4 border-t-2 border-dashed border-[#94A3B8]/60 space-y-2.5 text-xs sm:text-sm">
                            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/80 border border-[#CBD5E1] shadow-[1px_1px_0px_#94A3B8]">
                              <dt className="text-[#64748B] font-bold flex items-center gap-1.5">
                                <span>✎</span>
                                <span>نطاق التوصيل:</span>
                              </dt>
                              <dd className="font-black text-[#0F172A]">
                                69 ولاية (ZR Express)
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FFFDF0] border border-[#FDE047] shadow-[1px_1px_0px_#CA8A04]">
                              <dt className="text-[#854D0E] font-bold flex items-center gap-1.5">
                                <span>✎</span>
                                <span>داخل ولاية الأغواط:</span>
                              </dt>
                              <dd className="font-black text-[#854D0E] tabular-nums">
                                500 د.ج منزل · 380 د.ج مكتب
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="mt-6 pt-5 border-t-2 border-dashed border-[#94A3B8]/60 space-y-2.5">
                          <a
                            href={STORE_INFO.phoneHref}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-[#E30613] text-white text-xs sm:text-sm font-black hover:bg-[#C4000F] border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                          >
                            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>اتصل بالفرع:</span>
                            <span dir="ltr" className="font-mono font-black">
                              {STORE_INFO.phoneDisplay}
                            </span>
                          </a>
                          <a
                            href="#delivery-rates"
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-[#FAF8F5] border-2 border-dashed border-[#475569] text-[#1E293B] text-xs font-black shadow-[2px_2px_0px_#64748B] hover:shadow-[3px_3px_0px_#475569] transition-all cursor-pointer"
                          >
                            <span>✎ احسب سعر التوصيل لولايتك</span>
                          </a>
                        </div>
                      </aside>
                    ) : null}
                  </div>

                  {filteredProducts.length > visibleProductsCount ? (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleProductsCount((prev) => prev + 8)}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#18181B] hover:bg-[#E30613] text-white font-black text-sm border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <span>عرض المزيد من المعروضات ({filteredProducts.length - visibleProductsCount} منتج إضافي)</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                  <div className="mt-8 space-y-6">
                    {products.length === 0 ? (
                      <div className="py-16 sm:py-20 px-6 rounded-3xl bg-white border-2 border-stone-300 shadow-sm text-center max-w-xl mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border-2 border-stone-300 flex items-center justify-center mx-auto text-stone-400">
                          <ShoppingBag className="w-8 h-8 text-[#E30613]" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-300 text-[11px] font-bold text-stone-600 mb-2">
                            <span>فرع تكنو الأغواط</span>
                          </div>
                          <h3 className="font-display text-xl sm:text-2xl font-black text-[#18181B]">
                            لا يوجد منتج معروض حالياً
                          </h3>
                          <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
                            يقوم فريق الفرع حالياً بتجهيز وإضافة المعروضات الجديدة. يمكنك طلب أي أداة أو مستلزمات مكتبية ودراسية مباشرة عبر استمارة الطلب المباشر الفوري أو بالاتصال بنا.
                          </p>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                          <a
                            href="#quick-order"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black shadow-sm transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>طلب سريع ومباشر</span>
                          </a>
                          <a
                            href={STORE_INFO.phoneHref}
                            dir="ltr"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-stone-300 bg-white hover:border-[#18181B] text-[#18181B] text-xs font-mono font-bold transition-all"
                          >
                            <Phone className="w-4 h-4 text-[#E30613]" />
                            <span>{STORE_INFO.phoneDisplay}</span>
                          </a>
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

            {/* Dedicated Exclusive Packs Section */}
            <PacksSection
              packs={packs}
              onOrderPack={handleOrderPack}
              onAddToCart={handleAddPackToCart}
            />

            <QuickOrderSection
              products={products}
              onOrderCompleted={handleOrderCompleted}
            />

            <BranchSection savedOrders={savedOrders} />
          </main>
        </>
      )}

      <Footer
        categories={storeCategories}
        onSelectCategory={(catId) => {
          setFilters((prev) => ({ ...prev, series: catId }));
          const elem = document.getElementById('collection');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

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
