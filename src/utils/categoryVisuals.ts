import {
  FolderOpen,
  Feather,
  Briefcase,
  Compass,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  Package,
} from 'lucide-react';

export interface CategoryVisual {
  icon: any;
  tag: string;
  iconBg: string;
  desc: string;
  badgeBg: string;
  accentBorder: string;
}

export function getCategoryVisuals(name: string, index: number = 0): CategoryVisual {
  const norm = (name || '').toLowerCase();

  if (
    norm.includes('مكتب') ||
    norm.includes('سجل') ||
    norm.includes('ورق') ||
    norm.includes('ملف') ||
    norm.includes('تنظيم') ||
    norm.includes('office')
  ) {
    return {
      icon: FolderOpen,
      tag: 'مكتبي ومؤسسي',
      iconBg: 'bg-[#FFD100] text-[#18181B]',
      badgeBg: 'bg-[#FFD100] text-[#18181B]',
      accentBorder: 'border-[#FFD100]',
      desc: 'ملفات، سجلات محاسبية معتمدة، وأدوات تنظيم المكاتب الفاخرة المعتمدة لدى المؤسسات.',
    };
  }

  if (
    norm.includes('قلم') ||
    norm.includes('أقلام') ||
    norm.includes('حبر') ||
    norm.includes('خط') ||
    norm.includes('كتاب') ||
    norm.includes('pens')
  ) {
    return {
      icon: Feather,
      tag: 'كتابة فاخرة',
      iconBg: 'bg-[#E30613] text-white',
      badgeBg: 'bg-[#E30613] text-white',
      accentBorder: 'border-[#E30613]',
      desc: 'أقلام حبر سائل، رولر تنفيذي، أقلام الخط العربي ومستلزمات الكتابة الراقية.',
    };
  }

  if (
    norm.includes('حقيب') ||
    norm.includes('حقائب') ||
    norm.includes('محفظ') ||
    norm.includes('حاسوب') ||
    norm.includes('probag') ||
    norm.includes('bags')
  ) {
    return {
      icon: Briefcase,
      tag: 'حماية وأناقة',
      iconBg: 'bg-[#18181B] text-[#FFD100]',
      badgeBg: 'bg-[#18181B] text-[#FFD100]',
      accentBorder: 'border-[#18181B]',
      desc: 'حقائب أعمال متينة للأجهزة المحمولة والوثائق بمقاسات متعددة مبطنة ومقاومة للصدمات.',
    };
  }

  if (
    norm.includes('فنون') ||
    norm.includes('هندس') ||
    norm.includes('رسم') ||
    norm.includes('ألوان') ||
    norm.includes('arts')
  ) {
    return {
      icon: Compass,
      tag: 'هندسة وإبداع',
      iconBg: 'bg-amber-500 text-white',
      badgeBg: 'bg-amber-500 text-white',
      accentBorder: 'border-amber-500',
      desc: 'أدوات رسم تقني دقيقة، مساطر معمارية، ألوان فنية وأوراق رسم متخصصة للمبدعين.',
    };
  }

  if (
    norm.includes('مدرس') ||
    norm.includes('دفتر') ||
    norm.includes('دفاتر') ||
    norm.includes('جامع') ||
    norm.includes('كراس') ||
    norm.includes('school')
  ) {
    return {
      icon: BookOpen,
      tag: 'دراسة وتفوق',
      iconBg: 'bg-blue-600 text-white',
      badgeBg: 'bg-blue-600 text-white',
      accentBorder: 'border-blue-600',
      desc: 'دفاتر تكنو فائقة النعومة، أطقم هندسية ومستلزمات الدراسة والمراجعة والامتحانات.',
    };
  }

  if (
    norm.includes('ساع') ||
    norm.includes('حاسب') ||
    norm.includes('وقت') ||
    norm.includes('كاسيو') ||
    norm.includes('clocks')
  ) {
    return {
      icon: Clock,
      tag: 'تنظيم الوقت',
      iconBg: 'bg-emerald-600 text-white',
      badgeBg: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-600',
      desc: 'ساعات حائطية ومكتبية صامتة، آلات حاسبة علمية ومكتبية معتمدة للامتحانات والشركات.',
    };
  }

  // Alternating palette for arbitrary custom categories
  const palettes: CategoryVisual[] = [
    {
      icon: Layers,
      tag: 'قسم معتمد',
      iconBg: 'bg-[#E30613] text-white',
      badgeBg: 'bg-[#E30613] text-white',
      accentBorder: 'border-[#E30613]',
      desc: 'تشكيلة معتمدة متوفرة حصرياً في فرع تكنو الأغواط 03 مع التوصيل السريع لـ 58 ولاية.',
    },
    {
      icon: Sparkles,
      tag: 'تشكيلة راقية',
      iconBg: 'bg-[#FFD100] text-[#18181B]',
      badgeBg: 'bg-[#FFD100] text-[#18181B]',
      accentBorder: 'border-[#FFD100]',
      desc: 'منتجات ومستلزمات أصلية مختارة بعناية لأفضل تجربة مع الدفع عند الاستلام.',
    },
    {
      icon: Package,
      tag: 'فرع الأغواط',
      iconBg: 'bg-[#18181B] text-[#FFD100]',
      badgeBg: 'bg-[#18181B] text-[#FFD100]',
      accentBorder: 'border-[#18181B]',
      desc: 'متوفرة للطلب الفوري المباشر مع ضمان تكنو المعتمد وخدمة عملاء مستمرة.',
    },
  ];

  return palettes[index % palettes.length];
}
