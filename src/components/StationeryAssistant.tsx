import { useState } from 'react';
import { GraduationCap, Ruler, Briefcase, Palette, CheckCircle2, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { formatDzd } from '../utils/storeLogic';

interface PersonaKit {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  highlightText: string;
  colorScheme: {
    tabActive: string;
    border: string;
    bgGradient: string;
    badgeBg: string;
  };
  tools: { name: string; desc: string; icon: string }[];
  approxTotalDzd: number;
}

const PERSONA_KITS: PersonaKit[] = [
  {
    id: 'student',
    title: 'الطلبة والمقبلون على البكالوريا والجامعة',
    subtitle: 'باقة التفوق والتنظيم اليومي الشامل',
    badge: 'الأكثر طلباً للطلبة',
    icon: GraduationCap,
    highlightText: 'أدوات تدوم طويلاً وتمنحك أقصى راحة أثناء المراجعة وساعات الدراسة المكثفة.',
    colorScheme: {
      tabActive: 'bg-[#FFD100] text-[#18181B] border-[#E5BC00]',
      border: 'border-[#FFD100]',
      bgGradient: 'from-[#FFD100]/15 via-white to-white',
      badgeBg: 'bg-[#FFD100] text-[#18181B]',
    },
    approxTotalDzd: 4800,
    tools: [
      { name: 'دفاتر تكنو المقسمة (Multi-Subject)', desc: 'ورق ناصع فائق النعومة ومقاوم لتسرب الحبر مع فواصل ملونة.', icon: '📓' },
      { name: 'طقم أقلام تحديد تكنو النيون (Highlighters)', desc: 'ألوان مشرقة ومريحة للعين لا تبهت مع الوقت.', icon: '🖍️' },
      { name: 'أقلام حبر سائل ناعم (Gel Pens)', desc: 'سلاسة فائقة في الكتابة السريعة أثناء المحاضرات والامتحانات.', icon: '✍️' },
      { name: 'حقيبة ظهر تكنو الخفيفة والمقاومة للمطر', desc: 'حماية ممتازة للدفاتر والكتب مع وسائد ظهر مريحة.', icon: '🎒' },
    ],
  },
  {
    id: 'architect',
    title: 'المهندسون المعماريون والتقنيون',
    subtitle: 'باقة الدقة والاحتراف المعماري',
    badge: 'دقة هندسية معتمدة',
    icon: Ruler,
    highlightText: 'أدوات معيارية مصممة لتحقيق أعلى درجات الدقة في المخططات والرسومات التنفيذية.',
    colorScheme: {
      tabActive: 'bg-[#E30613] text-white border-[#C4000F]',
      border: 'border-[#E30613]',
      bgGradient: 'from-[#E30613]/10 via-white to-white',
      badgeBg: 'bg-[#E30613] text-white',
    },
    approxTotalDzd: 9500,
    tools: [
      { name: 'أقلام تحبير هندسية متدرجة (Technical Drawing Pens)', desc: 'أقلام دقيقة برؤوس معيارية (0.1, 0.3, 0.5, 0.8 ملم) بحبر ثابت.', icon: '📐' },
      { name: 'ورق كانسون (Canson) والميليمتري الفاخر', desc: 'أوراق رسم هندسي ومخططات بمقاسات A3 و A4 بأعلى جودة.', icon: '📄' },
      { name: 'مسطرة T ومثلثات ومنقلات احترافية من تكنو', desc: 'حواف حادة ومدرجة بالليزر خالية من الانحراف.', icon: '📏' },
      { name: 'حقيبة حافظة للمخططات واللوحات الهندسية (Porte-Plan)', desc: 'أنبوب أسطواني متين ومقاوم للماء لنقل الرسومات دون تجاعيد.', icon: '📦' },
    ],
  },
  {
    id: 'manager',
    title: 'المسيرون والإداريون والمحاسبون',
    subtitle: 'باقة الهيبة والأرشفة المؤسسية',
    badge: 'أدوات المكاتب الفاخرة',
    icon: Briefcase,
    highlightText: 'تنظيم محكم لبيئة عملك مع أجهزة وسجلات تدوم لسنوات وتمنح مكتبك طابعاً راقياً.',
    colorScheme: {
      tabActive: 'bg-[#18181B] text-[#FFD100] border-black',
      border: 'border-[#18181B]',
      bgGradient: 'from-stone-900/10 via-white to-white',
      badgeBg: 'bg-[#18181B] text-[#FFD100]',
    },
    approxTotalDzd: 14500,
    tools: [
      { name: 'سجلات المحاسبة واليومية المعتمدة (Registres)', desc: 'تجليد فاخر بورق سميك وترقيم رسمي واضح.', icon: '📑' },
      { name: 'ملفات الحفظ والأرشفة المعدنية المتينة (Classeurs)', desc: 'آليات إغلاق فولاذية تتحمل الاستعمال اليومي المكثف.', icon: '📁' },
      { name: 'قلم التوقيع التنفيذي الفاخر من تكنو (Executive Roller)', desc: 'هيكل معدني مصقول بتدفق حبر ملكي أسود وأزرق.', icon: '🖋️' },
      { name: 'حقيبة حاسوب ووثائق تكنو PROBAG الجلدية', desc: 'جيوب أمان مبطنة مع مقبض وحزام مريح للرحلات والاجتماعات.', icon: '💼' },
    ],
  },
  {
    id: 'artist',
    title: 'الفنانون والخطاطون وهواة الرسم',
    subtitle: 'باقة الإبداع والألوان الحية',
    badge: 'ألوان ومستلزمات فنية',
    icon: Palette,
    highlightText: 'ألوان نقية وألياف طبيعية تمنح لوحاتك وخطوطك بريقاً فريداً ولمسة احترافية.',
    colorScheme: {
      tabActive: 'bg-amber-500 text-white border-amber-600',
      border: 'border-amber-400',
      bgGradient: 'from-amber-500/15 via-white to-white',
      badgeBg: 'bg-amber-500 text-white',
    },
    approxTotalDzd: 7800,
    tools: [
      { name: 'مجموعات الألوان الزيتية والمائية والأكريليك', desc: 'أصباغ مركزة وتدرجات غنية سهلة المزج وسريعة الجفاف.', icon: '🎨' },
      { name: 'فراشي رسم احترافية بأحجام وأشكال متعددة', desc: 'شعيرات مرنة تحتفظ بشكلها ولا تتساقط أثناء العمل.', icon: '🖌️' },
      { name: 'أقلام ومحابر الخط العربي المتخصصة', desc: 'أقلام بقصب ومعدن بأطراف مشطوبة بدقة متناهية للكتابة الكلاسيكية.', icon: '✒️' },
      { name: 'كراسات رسم فني سميكة (Sketchbooks)', desc: 'ورق عاجي مخصص لمختلف تقنيات الرسم بالألوان والظلال.', icon: '📖' },
    ],
  },
];

export function StationeryAssistant() {
  const [activePersonaId, setActivePersonaId] = useState('student');
  const activeKit = PERSONA_KITS.find((k) => k.id === activePersonaId) || PERSONA_KITS[0];
  const Icon = activeKit.icon;

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-stone-200/90 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FFD100]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E30613]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD100]/25 border border-[#FFD100] text-xs font-bold text-[#18181B] mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E30613]" />
            <span>دليل تكنو الذكي لاختيار الأدوات</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black text-[#18181B] text-balance">
            ما هو مجالك؟ اختر باقتك المتكاملة بنقرة واحدة
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#52525B] leading-relaxed">
            صممنا تشكيلات متخصصة ومدروسة بعناية لتلبي احتياجات كل مهنة وتخصص بأعلى معايير الجودة المعتمدة من تكنو الأغواط.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10">
          {PERSONA_KITS.map((kit) => {
            const TabIcon = kit.icon;
            const isSelected = kit.id === activePersonaId;
            return (
              <button
                key={kit.id}
                type="button"
                onClick={() => setActivePersonaId(kit.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer border-2 shadow-xs ${
                  isSelected
                    ? `${kit.colorScheme.tabActive} shadow-md scale-105`
                    : 'bg-[#FAF9F6] text-[#52525B] border-stone-200 hover:border-stone-400 hover:bg-white'
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{kit.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Kit Interactive Showcase Card */}
        <div className={`p-6 sm:p-10 rounded-3xl bg-gradient-to-br ${activeKit.colorScheme.bgGradient} border-2 ${activeKit.colorScheme.border} shadow-xl transition-all duration-300`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Kit Story & Direct Order */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-xs border border-white/60 bg-white text-[#18181B]">
                <Icon className="w-4 h-4 text-[#E30613]" />
                <span>{activeKit.badge}</span>
              </div>

              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#18181B]">
                  {activeKit.subtitle}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-[#52525B] leading-relaxed">
                  {activeKit.highlightText}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#71717A]">
                  <span>التكلفة التقديرية للباقة الكاملة:</span>
                  <span className="font-mono text-xl font-black text-[#E30613]">
                    ~ {formatDzd(activeKit.approxTotalDzd)}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  شاملة كافة الأدوات الموصى بها مع إمكانية التعديل وحساب التوصيل حسب ولايتك.
                </p>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://wa.me/213560154663?text=${encodeURIComponent(
                    `مرحباً تكنو الأغواط، أود طلب باقة «${activeKit.subtitle}» الموصى بها في الموقع، أرجو تزويدي بالخيارات المتوفرة.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>اطلب هذه الباقة عبر واتساب</span>
                </a>
                <a
                  href="#collection"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border-2 border-stone-300 bg-white hover:border-[#18181B] text-[#18181B] font-bold text-sm transition-colors"
                >
                  <span>تصفح الأقسام</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column: 4 Tools Showcase Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeKit.tools.map((tool, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/95 border border-stone-200 shadow-sm hover:shadow-md hover:border-[#E30613]/50 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {tool.icon}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-[#18181B] leading-snug">
                      {tool.name}
                    </h4>
                    <p className="mt-1.5 text-xs text-[#52525B] leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-[#71717A]">
                    <span>تكنو الأصلي 100%</span>
                    <span className="text-emerald-700">متوفر بالفرع</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
