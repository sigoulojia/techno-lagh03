export interface StorePack {
  id: string;
  sku: string;
  name: string;
  badge: string;
  targetAudience: string;
  tagline: string;
  description: string;
  items: string[];
  originalPriceDzd: number;
  packPriceDzd: number;
  savingsDzd: number;
  imageUrl?: string;
  featured?: boolean;
}

export const INITIAL_PACKS: StorePack[] = [
  {
    id: 'pack-architect-pro',
    sku: 'PACK-ARCH-01',
    name: 'باك المهندس المعماري والمدني المتكامل',
    badge: 'الأكثر طلباً للمهندسين',
    targetAudience: 'مهندسو العمارة والهندسة المدنية والطلبة الجامعيين',
    tagline: 'مجموعة هندسية احترافية شاملة لأعلى درجات الدقة في الرسم والتخطيط',
    description:
      'إنه حقاً باك استثنائي تم انتقاؤه وتجهيزه بعناية فائقة بواسطة خبراء تكنو الأغواط ليوفر للمهندس كافة أدوات التخطيط والتحبير والقياس الدقيق من أرقى العلامات العالمية، مع توفير مالي كبير وتغليف فاخر.',
    items: [
      'مسطرة حرف T ألمانية الصنع 80 سم من الأكريليك المقاوم للكسر',
      'طقم أقلام تحبير هندسية متدرجة (0.2 - 0.4 - 0.8 مم) دقيقة ومقاومة للماء',
      'دفتر مخططات هندسية فاخر مقاس A3 ورق كانسون عالي الكثافة (160 غ)',
      'حامل مخططات أسطواني متين مضاد للماء مع حزام كتف قابل للتعديل',
      'طقم كواس ومثلثات هندسية شطافة مع منقلة دائرية 360 درجة',
      'شريط قياس ليزري / متري معدني دقيق للاستخدام الميداني',
    ],
    originalPriceDzd: 16500,
    packPriceDzd: 13800,
    savingsDzd: 2700,
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    id: 'pack-executive-student',
    sku: 'PACK-STUD-02',
    name: 'باك المتفوق الجامعي والتنفيذي الشامل',
    badge: 'باقة التميز الأكاديمي',
    targetAudience: 'طلبة الماستر، الدكتوراه، والكوادر الإدارية والتنفيذية',
    tagline: 'كل ما يلزم لتنظيم المحاضرات والملفات بأناقة وحماية تامة',
    description:
      'باك مدروس بدقة ليوفر للمتفوقين بيئة تنظيمية متكاملة تجمع بين أناقة المظهر والعملية العالية في حفظ المستندات وتدوين الملاحظات والمحاضرات.',
    items: [
      'حقيبة تكنو التنفيذية المتينة المقاومة للماء والصدمات مع جيب مخصص للابتوب',
      'دفتر جامعي مقسم 5 فصول سلكي (300 صفحة) ورق عاجي مريح للعين',
      'طقم أقلام جافة فاخرة وسلسة الكتابة مع أقلام تمييز نيون باستيل',
      'حافظة وثائق ومستندات جلدية أنيقة متعددة الجيوب',
      'منظم مكتبي معدني متين لحفظ الأوراق والملفات الهامة',
    ],
    originalPriceDzd: 9500,
    packPriceDzd: 7800,
    savingsDzd: 1700,
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
];
