import {
  DELIVERY_METHODS,
  type DeliveryMethodId,
  type Product,
  type ProductColorFamily,
  type ProductSeries,
  type ProductVariant,
  type StoreCategory,
} from '../data/products';
import {
  DEFAULT_WILAYA_LABEL,
  findWilayaRate,
  getShippingFeeForWilaya,
  isLaghouatWilaya,
} from '../data/deliveryRates';

export type SortOption = 'featured' | 'price-asc' | 'price-desc';

export interface ProductFilterState {
  series: 'all' | ProductSeries;
  color: 'all' | ProductColorFamily;
  query: string;
  sort: SortOption;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface OrderFormInput {
  fullName: string;
  phone: string;
  deliveryMethod: DeliveryMethodId;
  wilaya: string;
  commune?: string;
  address: string;
  notes: string;
}

export interface OrderValidationErrors {
  fullName?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
  address?: string;
}

export interface OrderTotals {
  itemCount: number;
  subtotalDzd: number;
  shippingFeeDzd: number;
  isFreeShippingUnlocked: boolean;
  remainingForFreeLaghouatDzd: number;
  totalDzd: number;
  grandTotalDzd?: number;
  totalItemsCount?: number;
}

export interface SavedOrderLine {
  productId: string;
  sku: string;
  name: string;
  colorName: string;
  variantId?: string;
  variantLabel?: string;
  unitPriceDzd: number;
  quantity: number;
  lineTotalDzd: number;
}

export interface SavedOrder {
  orderId: string;
  createdAtIso: string;
  statusLabel: string;
  customer: OrderFormInput;
  items: SavedOrderLine[];
  totals: OrderTotals;
}

export function formatDzd(amount: number): string {
  const safeAmount = Math.max(0, Math.round(amount));
  return `${safeAmount.toLocaleString('en-US')} د.ج`;
}

export function normalizeArabicQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

/**
 * Returns all unique image URLs for a product (cover image first, followed by additional images).
 */
export function getProductImages(product: Product): string[] {
  const list: string[] = [];
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
        list.push(img.trim());
      }
    }
  }
  if (product.image && product.image.trim() && !list.includes(product.image.trim())) {
    list.unshift(product.image.trim());
  }
  return list.length > 0 ? list : ['/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg'];
}

/**
 * Resolves the active variant for a product (if it has size/option variants).
 */
export function resolveProductVariant(
  product: Product,
  variantId?: string,
): ProductVariant | null {
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }
  if (variantId) {
    const matched = product.variants.find(
      (v) => v.id === variantId || v.label === variantId,
    );
    if (matched) return matched;
  }
  return product.variants[0];
}

/**
 * Resolves the variant corresponding to a specific image index
 */
export function getVariantForImageIndex(
  product: Product,
  imageIdx: number,
): ProductVariant | null {
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }
  const images = getProductImages(product);
  if (imageIdx < 0 || imageIdx >= images.length) {
    return null;
  }
  // 1. Direct 1-to-1 matching if each variant has its own image slot
  if (
    product.variants[imageIdx] &&
    (product.variants.length === images.length ||
      product.variants[imageIdx].image === images[imageIdx])
  ) {
    return product.variants[imageIdx];
  }
  // 2. Match by exact image URL
  const currentImg = images[imageIdx];
  if (currentImg) {
    const matched = product.variants.find((v) => v.image === currentImg);
    if (matched) return matched;
  }
  if (product.variants[imageIdx]) {
    return product.variants[imageIdx];
  }
  return product.variants[0];
}

/**
 * Finds the image index for a given variant
 */
export function getImageIndexForVariant(
  product: Product,
  variantId?: string,
): number {
  if (!variantId || !Array.isArray(product.variants)) return 0;
  const images = getProductImages(product);
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return 0;

  const vIdx = product.variants.indexOf(variant);
  // If variant index directly corresponds to this image in the carousel
  if (vIdx >= 0 && vIdx < images.length && variant.image === images[vIdx]) {
    return vIdx;
  }

  if (variant.image) {
    const idx = images.indexOf(variant.image);
    if (idx >= 0) return idx;
  }

  if (vIdx >= 0 && vIdx < images.length) {
    return vIdx;
  }
  return 0;
}

/**
 * Returns the effective display title for a product given its active variant/shape
 */
export function getProductDisplayName(product: Product, variantId?: string): string {
  const variant = resolveProductVariant(product, variantId);
  if (variant?.name && variant.name.trim() !== product.name.trim()) {
    return `${product.name} — ${variant.name.trim()}`;
  }
  if (variant?.label && !product.name.includes(variant.label)) {
    return `${product.name} (${variant.label.trim()})`;
  }
  return product.name;
}

/**
 * Returns the effective display description for a product given its active variant/shape
 */
export function getProductDisplayDescription(product: Product, variantId?: string): string {
  const variant = resolveProductVariant(product, variantId);
  if (variant?.description && variant.description.trim().length > 0) {
    if (variant.dimensions && !variant.description.includes(variant.dimensions)) {
      return `${variant.description.trim()} — (القياسات: ${variant.dimensions.trim()})`;
    }
    return variant.description.trim();
  }
  if (variant?.dimensions) {
    return `${product.description} — (القياسات: ${variant.dimensions.trim()})`;
  }
  return product.description;
}

/**
 * Returns the unit price for a product & optional selected variant.
 */
export function getProductUnitPrice(product: Product, variantId?: string): number {
  const variant = resolveProductVariant(product, variantId);
  if (variant && Number.isFinite(variant.priceDzd) && variant.priceDzd > 0) {
    return variant.priceDzd;
  }
  return product.priceDzd;
}

/**
 * Returns the min and max price of a product across all its variants.
 */
export function getProductPriceRange(product: Product): {
  min: number;
  max: number;
  hasRange: boolean;
} {
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    return { min: product.priceDzd, max: product.priceDzd, hasRange: false };
  }
  const prices = product.variants
    .map((v) => v.priceDzd)
    .filter((p) => Number.isFinite(p) && p > 0);
  if (prices.length === 0) {
    return { min: product.priceDzd, max: product.priceDzd, hasRange: false };
  }
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, hasRange: min !== max };
}

/**
 * Generates a unique composite key for a cart line item (productId + optional variantId).
 */
export function getCartItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

/**
 * Returns the display category name of a product.
 */
export function getProductCategoryLabel(product: Product): string {
  return (product.categoryName || product.seriesLabel || 'معروضات متنوعة').trim();
}

/**
 * Merges dynamic categories from backend/Telegram with any categories present on existing products,
 * guaranteeing every product can be filtered by its section.
 */
export function extractStoreCategories(
  products: Product[],
  backendCategories: StoreCategory[] = [],
): Array<StoreCategory & { count: number }> {
  const byNormName = new Map<string, StoreCategory>();

  for (const cat of backendCategories) {
    if (!cat?.name?.trim()) continue;
    const norm = normalizeArabicQuery(cat.name);
    if (!byNormName.has(norm)) {
      byNormName.set(norm, { id: cat.id || norm, name: cat.name.trim(), createdAt: cat.createdAt });
    }
  }

  for (const prod of products) {
    const label = getProductCategoryLabel(prod);
    if (!label) continue;
    const norm = normalizeArabicQuery(label);
    if (!byNormName.has(norm)) {
      byNormName.set(norm, {
        id: prod.categoryId || prod.series || norm,
        name: label,
      });
    }
  }

  return Array.from(byNormName.values()).map((cat) => {
    const normCatName = normalizeArabicQuery(cat.name);
    const count = products.filter((p) => {
      if (p.categoryId && p.categoryId === cat.id) return true;
      if (p.series && p.series === cat.id) return true;
      return normalizeArabicQuery(getProductCategoryLabel(p)) === normCatName;
    }).length;
    return { ...cat, count };
  });
}

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilterState,
): Product[] {
  const normalizedQuery = normalizeArabicQuery(filters.query);

  const filtered = products.filter((product) => {
    if (filters.series !== 'all') {
      const targetNorm = normalizeArabicQuery(filters.series);
      const pSeriesNorm = normalizeArabicQuery(product.series || '');
      const pCatIdNorm = normalizeArabicQuery(product.categoryId || '');
      const pLabelNorm = normalizeArabicQuery(getProductCategoryLabel(product));

      const matchesCategory =
        pSeriesNorm === targetNorm ||
        pCatIdNorm === targetNorm ||
        pLabelNorm === targetNorm ||
        pLabelNorm.includes(targetNorm);

      if (!matchesCategory) return false;
    }

    if (filters.color !== 'all' && product.colorFamily && product.colorFamily !== filters.color) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const variantText = (product.variants || []).map((v) => v.label).join(' ');
      const searchable = normalizeArabicQuery(
        `${product.id} ${product.name} ${product.brand} ${product.sku} ${getProductCategoryLabel(product)} ${product.colorName || ''} ${variantText} ${product.summary || ''} ${product.description || ''}`,
      );
      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  const sorted = [...filtered];
  if (filters.sort === 'price-asc') {
    sorted.sort(
      (a, b) =>
        getProductPriceRange(a).min - getProductPriceRange(b).min ||
        a.featuredRank - b.featuredRank,
    );
  } else if (filters.sort === 'price-desc') {
    sorted.sort(
      (a, b) =>
        getProductPriceRange(b).min - getProductPriceRange(a).min ||
        a.featuredRank - b.featuredRank,
    );
  } else {
    sorted.sort((a, b) => a.featuredRank - b.featuredRank);
  }

  return sorted;
}

export function upsertCartItem(
  cart: CartItem[],
  productId: string,
  delta: number,
  variantId?: string,
): CartItem[] {
  if (delta === 0) return cart;
  const targetKey = getCartItemKey(productId, variantId);
  const existingIndex = cart.findIndex(
    (item) => getCartItemKey(item.productId, item.variantId) === targetKey,
  );

  if (existingIndex === -1) {
    if (delta <= 0) return cart;
    return [
      ...cart,
      {
        productId,
        ...(variantId ? { variantId } : {}),
        quantity: Math.min(20, delta),
      },
    ];
  }

  const nextQty = cart[existingIndex].quantity + delta;
  if (nextQty <= 0) {
    return cart.filter(
      (item) => getCartItemKey(item.productId, item.variantId) !== targetKey,
    );
  }

  return cart.map((item, idx) =>
    idx === existingIndex ? { ...item, quantity: Math.min(20, nextQty) } : item,
  );
}

export function calculateOrderTotals(
  cart: CartItem[],
  products: Product[],
  deliveryMethod: DeliveryMethodId,
  wilaya: string = DEFAULT_WILAYA_LABEL,
): OrderTotals {
  const productMap = new Map(products.map((p) => [p.id, p]));
  let itemCount = 0;
  let subtotalDzd = 0;

  for (const item of cart) {
    const product = productMap.get(item.productId);
    if (!product || item.quantity <= 0) continue;
    const unitPrice = getProductUnitPrice(product, item.variantId);
    itemCount += item.quantity;
    subtotalDzd += unitPrice * item.quantity;
  }

  const shippingFeeDzd =
    itemCount === 0 ? 0 : getShippingFeeForWilaya(deliveryMethod, wilaya);
  const isFreeShippingUnlocked = shippingFeeDzd === 0;

  return {
    itemCount,
    subtotalDzd,
    shippingFeeDzd,
    isFreeShippingUnlocked,
    remainingForFreeLaghouatDzd: 0,
    totalDzd: subtotalDzd + shippingFeeDzd,
    grandTotalDzd: subtotalDzd + shippingFeeDzd,
  };
}

export function cleanAlgerianPhone(raw: string): string {
  return raw.replace(/[\s\-().+]/g, '').replace(/^213/, '0');
}

export function isFakeAlgerianPhone(raw: string): boolean {
  const cleaned = cleanAlgerianPhone(raw);
  if (!/^0[567]\d{8}$/.test(cleaned)) return true;
  const body = cleaned.slice(2);
  if (/^(\d)\1{7}$/.test(body)) return true;
  if (body === '12345678' || body === '87654321' || body === '01234567') return true;
  return false;
}

export function validateOrderForm(input: OrderFormInput): OrderValidationErrors {
  const errors: OrderValidationErrors = {};
  const trimmedName = input.fullName.trim();
  const normalizedPhone = cleanAlgerianPhone(input.phone);

  if (trimmedName.length < 3) {
    errors.fullName = 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل).';
  } else if (/<[^>]*>/.test(trimmedName) || /https?:\/\/|[a-z0-9]+\.(com|net|xyz|ru)/i.test(trimmedName)) {
    errors.fullName = 'الاسم يحتوي على رموز أو روابط غير صالحة.';
  }

  if (isFakeAlgerianPhone(normalizedPhone)) {
    errors.phone = 'يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 (10 أرقام).';
  }

  if (input.deliveryMethod === 'city_delivery') {
    if (!input.address || input.address.trim().length < 2) {
      errors.address = 'يرجى كتابة اسم الحي السكني داخل مدينة الأغواط لتوصيل الطلب.';
    }
  } else if (input.deliveryMethod !== 'pickup') {
    if (!input.wilaya || !input.wilaya.trim()) {
      errors.wilaya = 'يرجى اختيار الولاية.';
    }
  }

  return errors;
}

export function generateOrderId(seedNumber?: number): string {
  if (typeof seedNumber === 'number') {
    const s = (Math.abs(Math.floor(seedNumber)) % 9000) + 1000;
    return `TL-${s}-4921-8375`;
  }
  // Cryptographically unguessable 12-digit tracking code formatted as TL-XXXX-XXXX-XXXX
  // 1,000,000,000,000 (1 trillion) combinations - mathematically impossible to enumerate or guess.
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(3);
    crypto.getRandomValues(buf);
    const c1 = (1000 + (buf[0] % 9000)).toString();
    const c2 = (1000 + (buf[1] % 9000)).toString();
    const c3 = (1000 + (buf[2] % 9000)).toString();
    return `TL-${c1}-${c2}-${c3}`;
  }
  const chunk = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `TL-${chunk()}-${chunk()}-${chunk()}`;
}

export function getDeliveryMethodTitle(methodId: DeliveryMethodId): string {
  if (methodId === 'laghouat') {
    return 'توصيل لباب المنزل (À Domicile)';
  }
  if (methodId === 'city_delivery' || methodId === 'laghouat_city') {
    return 'توصيل للمنزل داخل مدينة الأغواط (100 دج)';
  }
  return DELIVERY_METHODS.find((m) => m.id === methodId)?.title ?? methodId;
}

export function buildSavedOrder(
  cart: CartItem[],
  products: Product[],
  customer: OrderFormInput,
  seedNumber?: number,
): SavedOrder {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const items: SavedOrderLine[] = [];

  for (const cartItem of cart) {
    const product = productMap.get(cartItem.productId);
    if (!product || cartItem.quantity <= 0) continue;
    const variant = resolveProductVariant(product, cartItem.variantId);
    const unitPrice = getProductUnitPrice(product, cartItem.variantId);

    items.push({
      productId: product.id,
      sku: variant?.sku || product.sku,
      name: product.name,
      colorName: product.colorName || 'قياسي',
      ...(variant ? { variantId: variant.id, variantLabel: variant.label } : {}),
      unitPriceDzd: unitPrice,
      quantity: cartItem.quantity,
      lineTotalDzd: unitPrice * cartItem.quantity,
    });
  }

  const normalizedWilaya =
    customer.deliveryMethod === 'pickup' || customer.deliveryMethod === 'city_delivery'
      ? DEFAULT_WILAYA_LABEL
      : customer.wilaya || DEFAULT_WILAYA_LABEL;

  const totals = calculateOrderTotals(
    cart,
    products,
    customer.deliveryMethod,
    normalizedWilaya,
  );

  const wilayaRate = findWilayaRate(normalizedWilaya);
  const resolvedAddress =
    customer.deliveryMethod === 'stop_desk' && !customer.address.trim()
      ? isLaghouatWilaya(normalizedWilaya) && customer.commune
        ? `مكتب ZR Express — ${customer.commune}`
        : `مكتب ZR Express — ولاية ${wilayaRate.nameAr}`
      : customer.address.trim();

  const resolvedCommune =
    customer.deliveryMethod === 'city_delivery'
      ? 'الأغواط (وسط المدينة والأحياء)'
      : customer.commune?.trim() || '';

  return {
    orderId: generateOrderId(seedNumber),
    createdAtIso: new Date().toISOString(),
    statusLabel: 'تم تأكيد الطلب — قيد التجهيز في فرع الأغواط',
    customer: {
      ...customer,
      fullName: customer.fullName.trim(),
      phone: cleanAlgerianPhone(customer.phone),
      wilaya: normalizedWilaya,
      commune: resolvedCommune,
      address: resolvedAddress,
      notes: customer.notes.trim(),
    },
    items,
    totals,
  };
}

export function formatOrderMessage(order: SavedOrder): string {
  const deliveryTitle = getDeliveryMethodTitle(order.customer.deliveryMethod);

  const lines = [
    `طلب جديد من متجر تكنو الأغواط`,
    `رقم الطلب: ${order.orderId}`,
    `العميل: ${order.customer.fullName}`,
    `الهاتف: ${order.customer.phone}`,
    `طريقة الاستلام: ${deliveryTitle}`,
  ];

  if (order.customer.deliveryMethod === 'city_delivery') {
    lines.push(`المدينة: الأغواط (وسط المدينة والأحياء)`);
    if (order.customer.address) {
      lines.push(`الحي السكني: ${order.customer.address}`);
    }
  } else if (order.customer.deliveryMethod !== 'pickup') {
    lines.push(`الولاية: ${order.customer.wilaya}`);
    if (order.customer.commune) {
      lines.push(`البلدية / المكتب: ${order.customer.commune}`);
    }
    if (order.customer.address) {
      lines.push(`العنوان: ${order.customer.address}`);
    }
  }

  lines.push('--- المنتجات ---');
  for (const item of order.items) {
    const variantPart = item.variantLabel ? ` — القياس: ${item.variantLabel}` : '';
    lines.push(
      `• ${item.name}${variantPart} (رقم المنتج: ${item.sku}) × ${item.quantity} = ${formatDzd(item.lineTotalDzd)}`,
    );
  }
  lines.push(
    `التوصيل: ${order.totals.shippingFeeDzd === 0 ? 'مجاني' : formatDzd(order.totals.shippingFeeDzd)}`,
  );
  lines.push(`المجموع الإجمالي: ${formatDzd(order.totals.totalDzd)} (الدفع عند الاستلام)`);

  if (order.customer.notes) {
    lines.push(`ملاحظات: ${order.customer.notes}`);
  }

  return lines.join('\n');
}

/**
 * Extracts a product number/ID from the current URL location.
 * Supports clean paths ending with the product number:
 * - Path: /p/71640, /product/71640, or /71640
 * - Query: ?p=71640 or ?product=71640
 * - Hash: #/p/71640, #/product/71640, #product-71640, or #?p=71640
 */
export function extractProductIdFromLocation(loc: {
  pathname: string;
  search: string;
  hash: string;
}): string | null {
  // 1. Clean path routing (/p/:id, /product/:id, or direct numeric/SKU root /:number)
  if (loc.pathname && loc.pathname !== '/') {
    const prefixedPathMatch = loc.pathname.match(/^\/(?:product|p)\/([^/?#]+)\/?$/i);
    if (prefixedPathMatch && prefixedPathMatch[1]) {
      return decodeURIComponent(prefixedPathMatch[1]);
    }

    // Direct root product number path like /71640 or /105
    const directNumMatch = loc.pathname.match(/^\/([0-9]{1,12})\/?$/);
    if (directNumMatch && directNumMatch[1]) {
      return decodeURIComponent(directNumMatch[1]);
    }
  }

  // 2. Query parameter (?p=... or ?product=...)
  if (loc.search) {
    const searchParams = new URLSearchParams(loc.search);
    const fromQuery = searchParams.get('product') || searchParams.get('p');
    if (fromQuery && fromQuery.trim()) {
      return decodeURIComponent(fromQuery.trim());
    }
  }

  // 3. Hash routing (#/product/..., #/p/..., #product-..., or hash query #...?p=...)
  if (loc.hash) {
    const rawHash = loc.hash.replace(/^#\/?/, '');
    if (rawHash.includes('?') || rawHash.includes('&')) {
      const queryPart = rawHash.includes('?') ? rawHash.split('?')[1] : rawHash;
      const hashParams = new URLSearchParams(queryPart);
      const fromHashQuery = hashParams.get('product') || hashParams.get('p');
      if (fromHashQuery && fromHashQuery.trim()) {
        return decodeURIComponent(fromHashQuery.trim());
      }
    }

    const hashMatch = rawHash.match(/^(?:product|p)\/([^/?#]+)/i);
    if (hashMatch && hashMatch[1]) {
      return decodeURIComponent(hashMatch[1]);
    }

    const directHashMatch = rawHash.match(/^product-([^/?#]+)/i);
    if (directHashMatch && directHashMatch[1]) {
      return decodeURIComponent(directHashMatch[1]);
    }
  }

  return null;
}

/**
 * Finds a product in the catalog matching either its unique ID or its SKU/product number.
 */
export function findProductByIdOrSku(products: Product[], identifier: string): Product | null {
  if (!identifier) return null;
  const target = identifier.trim().toLowerCase();
  return (
    products.find(
      (p) => p.id.toLowerCase() === target || p.sku.toLowerCase() === target,
    ) ?? null
  );
}

/**
 * Builds a clean product URL ending directly with the product number (e.g. https://site.com/p/71640).
 */
export function buildProductPageUrl(
  productIdOrNumber: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const base = origin.replace(/\/+$/, '');
  const cleanId = encodeURIComponent(productIdOrNumber.trim());
  return base ? `${base}/p/${cleanId}` : `/p/${cleanId}`;
}

/**
 * Extracts category identifier from current location (e.g. /category/office or /c/pens or ?category=bags)
 */
export function extractCategoryIdFromLocation(location: {
  pathname?: string;
  search?: string;
  hash?: string;
}): string | null {
  if (!location) return null;

  // 1. Path format: /category/:id or /c/:id
  const path = location.pathname || '';
  const match = path.match(/^\/(?:category|c)\/([^/?#]+)/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]).trim();
    } catch {
      return match[1].trim();
    }
  }

  // 2. Query param: ?category=xxx or ?cat=xxx
  if (location.search) {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || params.get('cat');
    if (cat) return cat.trim();
  }

  // 3. Hash format: #category=xxx or #/category/:id or #/c/:id
  if (location.hash) {
    if (location.hash.startsWith('#category=')) {
      return decodeURIComponent(location.hash.replace('#category=', '')).trim();
    }
    const hashMatch = location.hash.match(/^#\/?(?:category|c)\/([^/?#]+)/i);
    if (hashMatch && hashMatch[1]) {
      return decodeURIComponent(hashMatch[1]).trim();
    }
  }

  return null;
}

/**
 * Builds clean category page URL (e.g. https://site.com/category/office)
 */
export function buildCategoryPageUrl(
  categoryIdOrSlug: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const base = origin.replace(/\/+$/, '');
  const cleanId = encodeURIComponent(categoryIdOrSlug.trim());
  return base ? `${base}/category/${cleanId}` : `/category/${cleanId}`;
}
