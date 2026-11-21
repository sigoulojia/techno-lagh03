import test from 'node:test';
import assert from 'node:assert/strict';
import type { Product, StoreCategory } from '../data/products';

const DEFAULT_CATEGORIES: StoreCategory[] = [
  { id: 'cat-watches', name: 'ساعات وديكور مكتبي' },
  { id: 'cat-office', name: 'أدوات مكتبية وأقلام' },
  { id: 'cat-bags', name: 'حقائب مهنية' },
  { id: 'cat-school', name: 'لوازم جامعية ومدرسية' },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '71640',
    sku: '71640',
    name: 'ساعة مكتبية وحائطية كلاسيكية',
    shortName: 'ساعة تكنو',
    brand: 'TECHNO',
    series: 'cat-watches',
    seriesLabel: 'ساعات وديكور مكتبي',
    categoryId: 'cat-watches',
    priceDzd: 2400,
    image: '/test.jpg',
    images: ['/test.jpg', '/test2.jpg', '/test3.jpg'],
    variants: [
      { id: 'small', label: 'صغير', priceDzd: 2400 },
      { id: 'medium', label: 'متوسط', priceDzd: 3200 },
      { id: 'large', label: 'كبير (45 سم)', priceDzd: 4100 },
    ],
    alt: 'ساعة',
    summary: 'ساعة',
    description: 'ساعة',
    availabilityText: 'متوفر',
    featuredRank: 1,
    siblingIds: [],
    specs: [],
    highlights: [],
  },
  {
    id: '71635',
    sku: '71635',
    name: 'حقيبة PROBAG-04 بني',
    shortName: 'حقيبة بني',
    brand: 'TECHNO',
    series: 'cat-bags',
    seriesLabel: 'حقائب مهنية',
    categoryId: 'cat-bags',
    priceDzd: 4800,
    image: '/test-bag.jpg',
    alt: 'حقيبة',
    summary: 'حقيبة',
    description: 'حقيبة',
    availabilityText: 'متوفر',
    featuredRank: 2,
    siblingIds: ['71635', '71634'],
    specs: [],
    highlights: [],
  },
  {
    id: '71642',
    sku: '71642',
    name: 'طقم منظم مكتب',
    shortName: 'طقم مكتب',
    brand: 'TECHNO',
    series: 'cat-office',
    seriesLabel: 'أدوات مكتبية وأقلام',
    categoryId: 'cat-office',
    priceDzd: 1900,
    image: '/test-office.jpg',
    alt: 'طقم',
    summary: 'طقم',
    description: 'طقم',
    availabilityText: 'متوفر',
    featuredRank: 3,
    siblingIds: [],
    specs: [],
    highlights: [],
  },
  {
    id: '71634',
    sku: '71634',
    name: 'حقيبة PROBAG-04 أسود',
    shortName: 'حقيبة أسود',
    brand: 'TECHNO',
    series: 'cat-bags',
    seriesLabel: 'حقائب مهنية',
    categoryId: 'cat-bags',
    priceDzd: 4800,
    image: '/test-bag2.jpg',
    alt: 'حقيبة',
    summary: 'حقيبة',
    description: 'حقيبة',
    availabilityText: 'متوفر',
    featuredRank: 4,
    siblingIds: ['71634', '71635'],
    specs: [],
    highlights: [],
  },
];
import {
  LAGHOUAT_BUREAUS,
  WILAYA_DELIVERY_RATES,
  getShippingFeeForWilaya,
  isStopDeskAvailableForWilaya,
} from '../data/deliveryRates';
import {
  buildProductPageUrl,
  buildSavedOrder,
  calculateOrderTotals,
  cleanAlgerianPhone,
  isFakeAlgerianPhone,
  extractProductIdFromLocation,
  extractStoreCategories,
  filterAndSortProducts,
  findProductByIdOrSku,
  formatDzd,
  formatOrderMessage,
  getProductImages,
  getProductPriceRange,
  getProductUnitPrice,
  upsertCartItem,
  validateOrderForm,
} from './storeLogic';

test('ZR Express delivery dataset covers Laghouat 24 communes and outside wilayas accurately without retour', () => {
  assert.equal(LAGHOUAT_BUREAUS.length, 24);
  assert.ok(WILAYA_DELIVERY_RATES.length >= 69);

  // Laghouat local (PDF 1): 500 home, 380 stop desk
  assert.equal(getShippingFeeForWilaya('home', '03 - الأغواط'), 500);
  assert.equal(getShippingFeeForWilaya('stop_desk', '03 - الأغواط'), 380);
  assert.equal(getShippingFeeForWilaya('pickup', '03 - الأغواط'), 0);

  // Outside Laghouat (PDF 2 exact values)
  assert.equal(getShippingFeeForWilaya('home', '16 - الجزائر العاصمة'), 650);
  assert.equal(getShippingFeeForWilaya('stop_desk', '16 - الجزائر العاصمة'), 530);

  assert.equal(getShippingFeeForWilaya('home', '17 - الجلفة'), 750);
  assert.equal(getShippingFeeForWilaya('stop_desk', '17 - الجلفة'), 530);

  assert.equal(getShippingFeeForWilaya('home', '40 - خنشلة'), 900);
  assert.equal(getShippingFeeForWilaya('stop_desk', '40 - خنشلة'), 460);

  assert.equal(getShippingFeeForWilaya('home', '11 - تمنراست'), 1700);
  assert.equal(getShippingFeeForWilaya('stop_desk', '11 - تمنراست'), 1180);

  assert.equal(getShippingFeeForWilaya('home', '01 - أدرار'), 1400);
  assert.equal(getShippingFeeForWilaya('stop_desk', '01 - أدرار'), 880);

  // In Guezzam & El Meghaier: Home available, Stop Desk unavailable (falls back safely to home)
  assert.equal(isStopDeskAvailableForWilaya('54 - عين قزام'), false);
  assert.equal(getShippingFeeForWilaya('home', '54 - عين قزام'), 1700);
  assert.equal(isStopDeskAvailableForWilaya('57 - المغير'), false);
  assert.equal(getShippingFeeForWilaya('home', '57 - المغير'), 950);

  // Ensure no retour property exists on any wilaya rate object
  for (const rate of WILAYA_DELIVERY_RATES) {
    assert.equal('retour' in rate, false);
    assert.equal('retourFeeDzd' in rate, false);
  }
});

test('extractStoreCategories merges Telegram categories and product categories with accurate counts', () => {
  const merged = extractStoreCategories(SAMPLE_PRODUCTS, DEFAULT_CATEGORIES);
  assert.ok(merged.length >= 4);
  const watches = merged.find((c) => c.id === 'cat-watches');
  assert.ok(watches);
  assert.equal(watches.count, 1);

  const bags = merged.find((c) => c.id === 'cat-bags');
  assert.ok(bags);
  assert.equal(bags.count, 2);
});

test('multi-image helper and per-size variant pricing resolve correctly', () => {
  const clock = SAMPLE_PRODUCTS.find((p) => p.id === '71640')!;
  assert.ok(clock);

  const images = getProductImages(clock);
  assert.equal(images.length, 3);

  const range = getProductPriceRange(clock);
  assert.equal(range.min, 2400);
  assert.equal(range.max, 4100);
  assert.equal(range.hasRange, true);

  assert.equal(getProductUnitPrice(clock, 'small'), 2400);
  assert.equal(getProductUnitPrice(clock, 'medium'), 3200);
  assert.equal(getProductUnitPrice(clock, 'large'), 4100);
});

test('filterAndSortProducts filters by dynamic category, Arabic/number search, and sorts by min price', () => {
  const watchesOnly = filterAndSortProducts(SAMPLE_PRODUCTS, {
    series: 'cat-watches',
    color: 'all',
    query: '',
    sort: 'featured',
  });
  assert.equal(watchesOnly.length, 1);
  assert.equal(watchesOnly[0].id, '71640');

  const numSearch = filterAndSortProducts(SAMPLE_PRODUCTS, {
    series: 'all',
    color: 'all',
    query: '71642',
    sort: 'featured',
  });
  assert.equal(numSearch.length, 1);
  assert.equal(numSearch[0].id, '71642');

  const ascSorted = filterAndSortProducts(SAMPLE_PRODUCTS, {
    series: 'all',
    color: 'all',
    query: '',
    sort: 'price-asc',
  });
  assert.equal(ascSorted[0].id, '71642'); // 1900 DZD

  const descSorted = filterAndSortProducts(SAMPLE_PRODUCTS, {
    series: 'all',
    color: 'all',
    query: '',
    sort: 'price-desc',
  });
  assert.equal(descSorted[0].priceDzd, 4800);
});

test('upsertCartItem handles distinct size variants of the same product separately', () => {
  let cart = upsertCartItem([], '71640', 1, 'small');
  cart = upsertCartItem(cart, '71640', 2, 'large');
  assert.equal(cart.length, 2);
  assert.deepEqual(cart[0], { productId: '71640', variantId: 'small', quantity: 1 });
  assert.deepEqual(cart[1], { productId: '71640', variantId: 'large', quantity: 2 });

  cart = upsertCartItem(cart, '71640', -1, 'small');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].variantId, 'large');
});

test('calculateOrderTotals computes variant subtotals and wilaya-specific Home & Stop Desk fees', () => {
  const cart = [
    { productId: '71640', variantId: 'small', quantity: 1 }, // 2400
    { productId: '71640', variantId: 'large', quantity: 1 }, // 4100
  ];

  const pickup = calculateOrderTotals(cart, SAMPLE_PRODUCTS, 'pickup', '03 - الأغواط');
  assert.equal(pickup.subtotalDzd, 6500);
  assert.equal(pickup.shippingFeeDzd, 0);
  assert.equal(pickup.totalDzd, 6500);

  const algerHome = calculateOrderTotals(cart, SAMPLE_PRODUCTS, 'home', '16 - الجزائر العاصمة');
  assert.equal(algerHome.shippingFeeDzd, 650);
  assert.equal(algerHome.totalDzd, 7150);

  const algerStopDesk = calculateOrderTotals(
    cart,
    SAMPLE_PRODUCTS,
    'stop_desk',
    '16 - الجزائر العاصمة',
  );
  assert.equal(algerStopDesk.shippingFeeDzd, 530);
  assert.equal(algerStopDesk.totalDzd, 7030);
});

test('validateOrderForm enforces Algerian phone rules and address only for home delivery', () => {
  assert.equal(cleanAlgerianPhone('+213 661-23 45 67'), '0661234567');
  assert.equal(isFakeAlgerianPhone('0555555555'), true);
  assert.equal(isFakeAlgerianPhone('0612345678'), true);
  assert.equal(isFakeAlgerianPhone('0770112233'), false);

  const homeMissingAddress = validateOrderForm({
    fullName: 'عميل المتجر',
    phone: '0661 23 45 67',
    deliveryMethod: 'home',
    wilaya: '16 - الجزائر العاصمة',
    address: '',
    notes: '',
  });
  assert.ok(homeMissingAddress.address);

  // Stop desk does NOT require street address
  const stopDeskValid = validateOrderForm({
    fullName: 'عميل المتجر',
    phone: '0661 23 45 67',
    deliveryMethod: 'stop_desk',
    wilaya: '16 - الجزائر العاصمة',
    address: '',
    notes: '',
  });
  assert.deepEqual(stopDeskValid, {});
});

test('buildSavedOrder and formatOrderMessage include variant size and outside-wilaya delivery', () => {
  const order = buildSavedOrder(
    [{ productId: '71640', variantId: 'large', quantity: 1 }],
    SAMPLE_PRODUCTS,
    {
      fullName: 'عميل المتجر',
      phone: '0770 11 22 33',
      deliveryMethod: 'stop_desk',
      wilaya: '31 - وهران',
      commune: '',
      address: '',
      notes: 'الاتصال قبل الوصول',
    },
    42,
  );

  assert.equal(order.orderId, 'TL-1042-4921-8375');
  assert.equal(order.items[0].variantLabel, 'كبير (45 سم)');
  assert.equal(order.items[0].unitPriceDzd, 4100);
  assert.equal(order.totals.shippingFeeDzd, 530);
  assert.equal(order.totals.totalDzd, 4630);
  assert.equal(formatDzd(order.totals.totalDzd), '4,630 د.ج');

  const message = formatOrderMessage(order);
  assert.match(message, /TL-1042-4921-8375/);
  assert.match(message, /كبير \(45 سم\)/);
  assert.match(message, /31 - وهران/);
  assert.match(message, /4,630 د\.ج/);
});

test('extractProductIdFromLocation and buildProductPageUrl end cleanly with product number', () => {
  const url = buildProductPageUrl('71640', 'https://techno-laghouat.pages.dev');
  assert.equal(url, 'https://techno-laghouat.pages.dev/p/71640');
  assert.ok(url.endsWith('71640'));

  assert.equal(
    extractProductIdFromLocation({ pathname: '/p/71640', search: '', hash: '' }),
    '71640',
  );
  assert.equal(
    extractProductIdFromLocation({ pathname: '/71640', search: '', hash: '' }),
    '71640',
  );
  assert.equal(
    extractProductIdFromLocation({ pathname: '/', search: '?p=71635', hash: '' }),
    '71635',
  );
  assert.equal(
    extractProductIdFromLocation({ pathname: '/', search: '', hash: '#/p/71642' }),
    '71642',
  );
  assert.equal(
    extractProductIdFromLocation({ pathname: '/', search: '', hash: '' }),
    null,
  );

  const found = findProductByIdOrSku(SAMPLE_PRODUCTS, '71640');
  assert.ok(found);
  assert.equal(found.sku, '71640');
});
