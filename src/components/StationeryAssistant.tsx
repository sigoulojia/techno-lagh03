import { useState } from 'react';
import {
  GraduationCap,
  Ruler,
  Briefcase,
  Palette,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  ArrowDownLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDzd } from '../utils/storeLogic';

interface ToolItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  priceDzd: number;
}

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
  tools: ToolItem[];
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
      bgGradient: 'from-[#FFD100]/20 via-white to-white',
      badgeBg: 'bg-[#FFD100] text-[#18181B]',
    },
    tools: [
      { id: 's1', name: 'دفاتر تكنو المقسمة (Multi-Subject)', desc: 'ورق ناصع فائق النعومة ومقاوم لتسرب الحبر مع فواصل ملونة.', icon: '📓', priceDzd: 1200 },
      { id: 's2', name: 'طقم أقلام تحديد تكنو النيون (Highlighters)', desc: 'ألوان مشرقة ومريحة للعين لا تبهت مع الوقت.', icon: '🖍️', priceDzd: 650 },
      { id: 's3', name: 'أقلام حبر سائل ناعم (Gel Pens)', desc: 'سلاسة فائقة في الكتابة السريعة أثناء المحاضرات والامتحانات.', icon: '✍️', priceDzd: 450 },
      { id: 's4', name: 'حقيبة ظهر تكنو الخفيفة والمقاومة للمطر', desc: 'حماية ممتازة للدفاتر والكتب مع وسائد ظهر مريحة.', icon: '🎒', priceDzd: 2500 },
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
      bgGradient: 'from-[#E30613]/15 via-white to-white',
      badgeBg: 'bg-[#E30613] text-white',
    },
    tools: [
      { id: 'a1', name: 'أقلام تحبير هندسية متدرجة (Technical Drawing Pens)', desc: 'أقلام دقيقة برؤوس معيارية (0.1, 0.3, 0.5, 0.8 ملم) بحبر ثابت.', icon: '📐', priceDzd: 2800 },
      { id: 'a2', name: 'ورق كانسون (Canson) والميليمتري الفاخر', desc: 'أوراق رسم هندسي ومخططات بمقاسات A3 و A4 بأعلى جودة.', icon: '📄', priceDzd: 1900 },
      { id: 'a3', name: 'مسطرة T ومثلثات ومنقلات احترافية من تكنو', desc: 'حواف حادة ومدرجة بالليزر خالية من الانحراف.', icon: '📏', priceDzd: 1600 },
      { id: 'a4', name: 'حقيبة حافظة للمخططات واللوحات الهندسية (Porte-Plan)', desc: 'أنبوب أسطواني متين ومقاوم للماء لنقل الرسومات دون تجاعيد.', icon: '📦', priceDzd: 3200 },
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
    tools: [
      { id: 'm1', name: 'سجلات المحاسبة واليومية المعتمدة (Registres)', desc: 'تجليد فاخر بورق سميك وترقيم رسمي واضح.', icon: '📑', priceDzd: 2600 },
      { id: 'm2', name: 'ملفات الحفظ والأرشفة المعدنية المتينة (Classeurs)', desc: 'آليات إغلاق فولاذية تتحمل الاستعمال اليومي المكثف.', icon: '📁', priceDzd: 1800 },
      { id: 'm3', name: 'قلم التوقيع التنفيذي الفاخر من تكنو (Executive Roller)', desc: 'هيكل معدني مصقول بتدفق حبر ملكي أسود وأزرق.', icon: '🖋️', priceDzd: 3600 },
      { id: 'm4', name: 'حقيبة حاسوب ووثائق تكنو PROBAG الجلدية', desc: 'جيوب أمان مبطنة مع مقبض وحزام مريح للرحلات والاجتماعات.', icon: '💼', priceDzd: 6500 },
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
      bgGradient: 'from-amber-500/20 via-white to-white',
      badgeBg: 'bg-amber-500 text-white',
    },
    tools: [
      { id: 'ar1', name: 'مجموعات الألوان الزيتية والمائية والأكريليك', desc: 'أصباغ مركزة وتدرجات غنية سهلة المزج وسريعة الجفاف.', icon: '🎨', priceDzd: 3200 },
      { id: 'ar2', name: 'فراشي رسم احترافية بأحجام وأشكال متعددة', desc: 'شعيرات مرنة تحتفظ بشكلها ولا تتساقط أثناء العمل.', icon: '🖌️', priceDzd: 1400 },
      { id: 'ar3', name: 'أقلام ومحابر الخط العربي المتخصصة', desc: 'أقلام بقصب ومعدن بأطراف مشطوبة بدقة متناهية للكتابة الكلاسيكية.', icon: '✒️', priceDzd: 1800 },
      { id: 'ar4', name: 'كراسات رسم فني سميكة (Sketchbooks)', desc: 'ورق عاجي مخصص لمختلف تقنيات الرسم بالألوان والظلال.', icon: '📖', priceDzd: 1400 },
    ],
  },
];

export function StationeryAssistant() {
  const [activePersonaId, setActivePersonaId] = useState('student');
  const [selectedTools, setSelectedTools] = useState<Record<string, boolean>>({
    s1: true, s2: true, s3: true, s4: true,
    a1: true, a2: true, a3: true, a4: true,
    m1: true, m2: true, m3: true, m4: true,
    ar1: true, ar2: true, ar3: true, ar4: true,
  });

  const activeKit = PERSONA_KITS.find((k) => k.id === activePersonaId) || PERSONA_KITS[0];
  const Icon = activeKit.icon;

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) => ({
      ...prev,
      [toolId]: !prev[toolId],
    }));
  };

  // Calculate live dynamic total based on checked items
  const activeTotalDzd = activeKit.tools.reduce((sum, tool) => {
    return sum + (selectedTools[tool.id] ? tool.priceDzd : 0);
  }, 0);

  const activeSelectedCount = activeKit.tools.filter((t) => selectedTools[t.id]).length;

  return (
    <section id="assistant" className="py-16 lg:py-24 bg-lined-paper border-b-2 border-stone-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="stamp-yellow text-xs">TECHNO KIT BUILDER</span>
            <span className="stamp-red text-xs">تخصيص فوري</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black text-[#18181B] text-balance">
            ما هو مجالك؟ <span className="highlight-yellow">اختر باقتك التفاعلية بنقرة واحدة</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 font-medium leading-relaxed">
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
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer border-2 shadow-[2px_2px_0px_#18181B] ${
                  isSelected
                    ? 'bg-[#FFD100] text-[#18181B] border-[#18181B] -translate-y-0.5 shadow-[4px_4px_0px_#18181B]'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-[#18181B]'
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{kit.title.split(' ')[0]} {kit.title.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Active Kit Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeKit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-6 sm:p-10 rounded-3xl bg-white border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] relative overflow-hidden"
          >
            {/* Top Kit Badge & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-stone-200/80 flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-[#E30613]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-black px-3 py-0.5 rounded-full ${activeKit.colorScheme.badgeBg}`}>
                      {activeKit.badge}
                    </span>
                    <span className="text-xs text-stone-500 font-semibold">
                      محدد: {activeSelectedCount} من أصل {activeKit.tools.length} أدوات
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-xl sm:text-2xl font-black text-[#18181B]">
                    {activeKit.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#52525B]">
                    {activeKit.highlightText}
                  </p>
                </div>
              </div>

              {/* Dynamic Price Display */}
              <div className="p-4 rounded-2xl bg-white border-2 border-stone-200 text-left shrink-0 shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 block">إجمالي الباقة المحددة:</span>
                <span className="font-display text-2xl font-black text-[#E30613] tabular-nums">
                  {formatDzd(activeTotalDzd)}
                </span>
              </div>
            </div>

            {/* Interactive Tools Grid with Checkboxes */}
            <div className="mt-8">
              <p className="text-xs font-bold text-[#71717A] mb-4">
                حدد الأدوات التي ترغب بها (يتغير السعر الإجمالي فوراً عند الإلغاء أو التحديد):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeKit.tools.map((tool) => {
                  const isChecked = Boolean(selectedTools[tool.id]);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                        isChecked
                          ? 'bg-white border-[#18181B] shadow-sm'
                          : 'bg-stone-50/70 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="text-2xl pt-0.5 shrink-0">{tool.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display text-sm font-bold text-[#18181B] truncate">
                            {tool.name}
                          </h4>
                          <span className="font-mono text-xs font-black text-[#E30613] shrink-0">
                            {formatDzd(tool.priceDzd)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[#E30613] border-[#E30613] text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Order Actions */}
            <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>متوفرة للتسليم الفوري بمتجر الأغواط أو الشحن السريع لـ 54 ولاية</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="#quick-order"
                  className="animate-sheen inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white font-display text-sm font-black shadow-md transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>اطلب هذه الباقة بمبلغ {formatDzd(activeTotalDzd)}</span>
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
