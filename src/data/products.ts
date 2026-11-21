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
export type DeliveryMethodId = 'pickup' | 'home' | 'stop_desk' | 'laghouat' | string;

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
  address: 'وسط مدينة الأغواط، بالقرب من ساحة الشهداء، ولاية الأغواط 03000',
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
    id: 'home',
    title: 'توصيل لباب المنزل',
    subtitle: 'À Domicile عبر ZR Express داخل ولاية الأغواط وإلى 54 ولاية جزائرية',
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
  { id: 'bags', name: 'حقائب الأعمال والحواسيب' },
  { id: 'pens', name: 'أقلام التوقيع والفاخرة' },
  { id: 'office', name: 'الأدوات المكتبية والسجلات' },
  { id: 'arts', name: 'مستلزمات الهندسة والفنون' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'probag-04-brown',
    sku: '71635',
    name: 'حقيبة تكنو PROBAG-04 التنفيذية — بني كونياك',
    shortName: 'PROBAG-04 بني كونياك',
    brand: 'TECHNO STATIONERY',
    series: 'probag',
    seriesLabel: 'سلسلة PROBAG-04',
    categoryId: 'bags',
    categoryName: 'حقائب الأعمال والحواسيب',
    colorFamily: 'brown',
    colorName: 'بني كونياك',
    colorHex: '#6F3119',
    priceDzd: 4800,
    image: '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg',
    images: [
      '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg',
      '/assets/aistudio/photo_5767250388670156959_y_82840306.jpg',
    ],
    alt: 'حقيبة تكنو PROBAG-04 باللون البني الكونياك رقم المرجع 71635 من فرع الأغواط',
    summary: 'جلد صناعي فاخر بخياطة مزدوجة وأقسام متعددة للملفات وحاسوب 15.6 بوصة مع قفل معدني برونزي',
    description:
      'صُممت حقيبة PROBAG-04 بلونها البني الكونياك الدافئ لترافق الأساتذة، المحامين، والمهندسين والإطارات في اجتماعاتهم اليومية. تجمع بين ملمس الجلد الصناعي المتين (Simili Cuir) وخياطة طولية متقنة مع قفل معدني برونزي عتيق يضمن أمان وثائقك وحاسوبك المحمول.',
    availabilityText: 'متوفر في فرع الأغواط · تسليم فوري',
    featuredRank: 1,
    siblingIds: ['probag-04-brown', 'probag-04-black'],
    specs: [
      { label: 'رقم المرجع', value: 'Item No. 71635' },
      { label: 'الخامة', value: 'جلد صناعي فاخر متين (Simili Cuir)' },
      { label: 'السعة الداخلية', value: 'تتسع لحاسوب 15.6 بوصة، شاحن، وملفات A4' },
      { label: 'الإغلاق والحمل', value: 'قفل معدني برونزي + مقبض مبطن وحلقات لحزام الكتف' },
    ],
    highlights: [
      'خياطة مزدوجة بارزة تمنح الحقيبة متانة وثباتاً في الشكل',
      'أقسام داخلية منظمة للأوراق الرسمية، الأقلام، والهاتف',
      'حلقات جانبية معدنية لتركيب حزام الكتف المرفق بسهولة',
    ],
  },
  {
    id: 'probag-04-black',
    sku: '71634',
    name: 'حقيبة تكنو PROBAG-04 التنفيذية — أسود كلاسيكي',
    shortName: 'PROBAG-04 أسود كلاسيكي',
    brand: 'TECHNO STATIONERY',
    series: 'probag',
    seriesLabel: 'سلسلة PROBAG-04',
    categoryId: 'bags',
    categoryName: 'حقائب الأعمال والحواسيب',
    colorFamily: 'black',
    colorName: 'أسود كلاسيكي',
    colorHex: '#1F2024',
    priceDzd: 4800,
    image: '/assets/aistudio/photo_5767250388670156959_y_82840306.jpg',
    images: [
      '/assets/aistudio/photo_5767250388670156959_y_82840306.jpg',
      '/assets/aistudio/photo_5767250388670156962_y__1__73abac5d.jpg',
    ],
    alt: 'حقيبة تكنو PROBAG-04 باللون الأسود الكلاسيكي رقم المرجع 71634 من فرع الأغواط',
    summary: 'إصدار أسود رسمي بقفل فضي لامع وتنظيم داخلي متكامل للأجهزة والملفات',
    description:
      'النسخة السوداء الرسمية من سلسلة PROBAG-04 الجديدة. حضور أنيق يناسب البذلات الرسمية وبيئة العمل الإدارية والجامعية، مع هيكل متماسك يحمي الحاسوب المحمول والملفات الهامة من الصدمات اليومية.',
    availabilityText: 'متوفر في فرع الأغواط · تسليم فوري',
    featuredRank: 2,
    siblingIds: ['probag-04-black', 'probag-04-brown'],
    specs: [
      { label: 'رقم المرجع', value: 'Item No. 71634' },
      { label: 'الخامة', value: 'جلد صناعي فاخر (Simili Cuir)' },
      { label: 'السعة الداخلية', value: 'أقسام متعددة + جيب مبطن للحاسوب المحمول' },
      { label: 'الإغلاق والحمل', value: 'قفل معدني فضي مصقول + مقبض علوي مريح' },
    ],
    highlights: [
      'مقاومة للخدش وسهلة التنظيف للاستخدام اليومي المكثف',
      'قفل معدني فضي سلس الفتح والإغلاق بيد واحدة',
      'توزيع داخلي عملي يمنع تكدس الملفات والوثائق',
    ],
  },
  {
    id: 'techno-classic-caramel',
    sku: 'TS-CL01',
    name: 'حقيبة تكنو التراثية الكلاسيكية — بني كراميل',
    shortName: 'تكنو التراثية كراميل',
    brand: 'TECHNO STATIONERY',
    series: 'classic',
    seriesLabel: 'تكنو الكلاسيكية',
    categoryId: 'bags',
    categoryName: 'حقائب الأعمال والحواسيب',
    colorFamily: 'brown',
    colorName: 'بني كراميل',
    colorHex: '#9C4820',
    priceDzd: 5400,
    image: '/assets/aistudio/photo_5767250388670156961_y__1__74795145.jpg',
    images: [
      '/assets/aistudio/photo_5767250388670156961_y__1__74795145.jpg',
      '/assets/aistudio/photo_5767250388670156960_y__1__ef8db1ba.jpg',
    ],
    alt: 'حقيبة تكنو الكلاسيكية التراثية باللون البني الكراميل بشعار تكنو المحفور',
    summary: 'شعار تكنو المحفور مع غطاء منحني وجيب أمامي هندسي وقفل نحاسي فاخر',
    description:
      'قطعة مميزة من تشكيلة تكنو الكلاسيكية بغطاء أمامي منحني وخياطة فاتحة تبرز فخامة اللون الكراميل الدافئ. مزودة بجيب أمامي بتصميم هندسي ومسامير نحاسية تعزز المتانة والجمال.',
    availabilityText: 'كمية محدودة في فرع الأغواط',
    featuredRank: 3,
    siblingIds: ['techno-classic-caramel', 'techno-classic-black'],
    specs: [
      { label: 'رقم المرجع', value: 'TS-CL01' },
      { label: 'الخامة', value: 'جلد صناعي محبّب عالي الكثافة' },
      { label: 'التفاصيل', value: 'شعار TECHNO محفور حرارياً + جيب أمامي سريع الوصول' },
      { label: 'الإغلاق والحمل', value: 'قفل دائري نحاسي عتيق + مقبض معزز بحلقات معدنية' },
    ],
    highlights: [
      'تصميم غطاء منحني فريد يعطي طابعاً تنفيذياً راقياً',
      'جيب أمامي مفتوح هندسي بمسامير تثبيت معدنية مزدوجة',
      'ملمس ناعم مع تدرج لوني طبيعي يزداد أناقة مع الاستعمال',
    ],
  },
  {
    id: 'techno-classic-black',
    sku: 'TS-CL02',
    name: 'حقيبة تكنو التراثية الكلاسيكية — أسود فاحم',
    shortName: 'تكنو التراثية أسود فاحم',
    brand: 'TECHNO STATIONERY',
    series: 'classic',
    seriesLabel: 'تكنو الكلاسيكية',
    categoryId: 'bags',
    categoryName: 'حقائب الأعمال والحواسيب',
    colorFamily: 'black',
    colorName: 'أسود فاحم',
    colorHex: '#141416',
    priceDzd: 5400,
    image: '/assets/aistudio/photo_5767250388670156960_y__1__ef8db1ba.jpg',
    images: [
      '/assets/aistudio/photo_5767250388670156960_y__1__ef8db1ba.jpg',
      '/assets/aistudio/photo_5767250388670156961_y__1__74795145.jpg',
    ],
    alt: 'حقيبة تكنو الكلاسيكية التراثية باللون الأسود الفاحم بقفل معدني',
    summary: 'أيقونة تكنو السوداء بغطاء منحني وجيب أمامي وتفاصيل معدنية رسمية',
    description:
      'نفس الخطوط المعمارية الراقية للنسخة التراثية، لكن بطابع أسود فاحم هادئ يبرز القفل المعدني المصقول وشعار TECHNO المحفور في المنتصف. خيار مثالي للمدراء والمحامين والاجتماعات الرسمية.',
    availabilityText: 'متوفر في فرع الأغواط',
    featuredRank: 4,
    siblingIds: ['techno-classic-black', 'techno-classic-caramel'],
    specs: [
      { label: 'رقم المرجع', value: 'TS-CL02' },
      { label: 'الخامة', value: 'جلد صناعي محبّب بلمعة خفيفة راقية' },
      { label: 'التفاصيل', value: 'شعار TECHNO محفور + جيب أمامي هندسي بمسامير معدنية' },
      { label: 'الإغلاق والحمل', value: 'قفل معدني دائري آمن + مقبض علوي متين' },
    ],
    highlights: [
      'توازن مثالي بين السعة الكبيرة والمظهر النحيف الأنيق',
      'خياطة متناسقة بالكامل باللون الأسود لمظهر موحّد فاخر',
      'حواف معززة تحافظ على استقامة الحقيبة عند وضعها على المكتب',
    ],
  },
  {
    id: 'versal-executive-black',
    sku: 'VR-201',
    name: 'حقيبة Versal الرسمية — أسود مطفي',
    shortName: 'Versal أسود مطفي',
    brand: 'VERSAL',
    series: 'versal',
    seriesLabel: 'سلسلة Versal',
    categoryId: 'bags',
    categoryName: 'حقائب الأعمال والحواسيب',
    colorFamily: 'black',
    colorName: 'أسود مطفي',
    colorHex: '#1B1C20',
    priceDzd: 4500,
    image: '/assets/aistudio/photo_5767250388670156963_y__1__4ea728c9.jpg',
    images: ['/assets/aistudio/photo_5767250388670156963_y__1__4ea728c9.jpg'],
    alt: 'حقيبة Versal الرسمية باللون الأسود المطفي وقفل مستطيل فضي من فرع الأغواط',
    summary: 'تصميم عصري بسيط بقفل ضغط مستطيل وملمس مطفي هادئ للأجهزة والملفات',
    description:
      'تقدم حقيبة Versal أسلوباً عصرياً خالياً من التكلف مع سطح أسود مطفي ناعم وقفل ضغط مستطيل بلون معدني مصقول. خفيفة الوزن وعملية جداً لطلبة الجامعة، الأساتذة، والتنقل اليومي.',
    availabilityText: 'متوفر في فرع الأغواط',
    featuredRank: 5,
    siblingIds: ['versal-executive-black'],
    specs: [
      { label: 'رقم المرجع', value: 'VR-201' },
      { label: 'الخامة', value: 'جلد صناعي ناعم بملمس مطفي (Matte Finish)' },
      { label: 'التنظيم الداخلي', value: 'سعة مريحة للدفاتر، الحاسوب، والمستندات اليومية' },
      { label: 'الإغلاق والحمل', value: 'قفل ضغط مستطيل فضي + مقبض مبطن وحلقات كتف' },
    ],
    highlights: [
      'مظهر عصري مينيمال يناسب العمل المكتبي والدراسة الجامعية',
      'قفل ضغط مستطيل عملي وسريع الاستخدام',
      'وزن خفيف مع مقبض مريح للاستخدام طوال اليوم',
    ],
  },
];

export const SAMPLE_PRODUCTS: Product[] = PRODUCTS;
