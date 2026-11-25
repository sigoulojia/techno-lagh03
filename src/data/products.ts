import {
  DEFAULT_WILAYA_LABEL,
  LAGHOUAT_BUREAUS,
  WILAYA_DELIVERY_RATES,
  formatWilayaLabel,
} from './deliveryRates';

export type ProductSeries = string;
export type ProductColorFamily =
  | 'black'
  | 'brown'
  | 'blue'
  | 'red'
  | 'green'
  | 'other'
  | string;
export type DeliveryMethodId =
  | 'pickup'
  | 'city_delivery'
  | 'home'
  | 'stop_desk'
  | 'laghouat'
  | string;

export interface StoreCategory {
  id: string;
  name: string;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  priceDzd: number;
  sku?: string;
  image?: string;
  name?: string;
  description?: string;
  dimensions?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortName: string;
  brand: string;
  series: ProductSeries;
  seriesLabel: string;
  categoryId?: string;
  categoryName?: string;
  colorFamily?: ProductColorFamily;
  colorName?: string;
  colorHex?: string;
  priceDzd: number;
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  alt: string;
  summary: string;
  description: string;
  availabilityText: string;
  featuredRank: number;
  siblingIds: string[];
  specs: ProductSpec[];
  highlights: string[];
}

export interface DeliveryMethod {
  id: DeliveryMethodId;
  title: string;
  subtitle: string;
  eta: string;
  baseFeeDzd: number;
  requiresAddress: boolean;
  requiresWilaya: boolean;
}

export const BRAND_BANNER_IMAGE =
  '/assets/aistudio/481776990_977823267638774_622562096348398298_n_c78d70e9.jpg';

export const FREE_LAGHOUAT_DELIVERY_THRESHOLD_DZD = 0; // Official ZR Express tariffs apply cleanly

export const STORE_INFO = {
  branchName: 'تكنو الأغواط',
  fullTitle: 'تكنو ستيشنري — فرع الأغواط',
  tagline: 'تكنو ترافقك في رسم مسيرتك المهنية والدراسية والإبداعية',
  heritageLine: '25 سنة — حكاية أجيال ومازال',
  secondarySlogan: 'العلامة ألي تفكر فيكم',
  address: 'حي المقام بجانب المقبرة — وسط المدينة، الأغواط',
  phoneDisplay: '\u200E0560 15 46 63',
  phoneHref: 'tel:+213560154663',
  hours: 'السبت إلى الخميس · 08:30 صباحاً – 20:00 مساءً',
  deliveryPartner: 'ZR Express البريد السريع',
};

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'pickup',
    title: 'استلام مباشر من متجر تكنو الأغواط',
    subtitle: 'جهّز طلبك واستلمه مباشرة من المتجر بوسط المدينة بدون رسوم توصيل',
    eta: 'جاهز خلال ساعتين',
    baseFeeDzd: 0,
    requiresAddress: false,
    requiresWilaya: false,
  },
  {
    id: 'city_delivery',
    title: 'توصيل للمنزل داخل مدينة الأغواط',
    subtitle: 'توصيل مباشر لباب منزلك في كافة أحياء وتجمعات مدينة الأغواط (100 دج فقط)',
    eta: 'في نفس اليوم',
    baseFeeDzd: 100,
    requiresAddress: true,
    requiresWilaya: false,
  },
  {
    id: 'home',
    title: 'توصيل لباب المنزل (ZR Express)',
    subtitle: 'À Domicile عبر ZR Express لبلديات الأغواط والـ 69 ولاية جزائرية',
    eta: '24 – 72 ساعة',
    baseFeeDzd: 500,
    requiresAddress: true,
    requiresWilaya: true,
  },
  {
    id: 'stop_desk',
    title: 'استلام من مكتب التوصيل (Stop Desk)',
    subtitle: 'استلام اقتصادي وسريع من أقرب مكتب ZR Express في ولايتك',
    eta: '24 – 48 ساعة',
    baseFeeDzd: 380,
    requiresAddress: false,
    requiresWilaya: true,
  },
];

export const LAGHOUAT_COMMUNES: string[] = LAGHOUAT_BUREAUS.map(
  (b) => `${b.nameAr} (${b.nameFr})`,
);

export const ALGERIAN_WILAYAS: string[] = WILAYA_DELIVERY_RATES.map(formatWilayaLabel);

export const DEFAULT_WILAYA = DEFAULT_WILAYA_LABEL;

export const DEFAULT_CATEGORIES: StoreCategory[] = [
  { id: 'office', name: 'الأدوات المكتبية وتنظيم المكاتب' },
  { id: 'pens', name: 'أقلام التوقيع الفاخرة والخط' },
  { id: 'bags', name: 'حقائب الحواسيب والوثائق المهنية' },
  { id: 'arts', name: 'مستلزمات الهندسة والرسم الفني' },
  { id: 'school', name: 'اللوازم المدرسية والجامعية' },
];

export const PRODUCTS: Product[] = [];

export const SAMPLE_PRODUCTS: Product[] = PRODUCTS;

