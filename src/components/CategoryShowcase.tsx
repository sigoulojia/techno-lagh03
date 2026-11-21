import { FolderOpen, Feather, Briefcase, Compass, BookOpen, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface CategoryShowcaseProps {
  onSelectCategory: (categoryKeyword: string) => void;
}

const CATEGORIES = [
  {
    id: 'office',
    title: 'الأدوات المكتبية والسجلات',
    subtitle: 'ملفات، سجلات محاسبية معتمدة، وأدوات تنظيم المكاتب الفاخرة',
    icon: FolderOpen,
    tag: 'مكتبي ومؤسسي',
    filterQuery: 'مكتبي',
    accentColor: 'from-[#FFD100]/25 via-white to-white',
    iconBg: 'bg-[#FFD100] text-[#18181B]',
    countBadge: 'أكثر من 80 أداة',
  },
  {
    id: 'pens',
    title: 'أقلام التوقيع والفاخرة',
    subtitle: 'أقلام حبر سائل، رولر تنفيذي، خط عربي ومستلزمات الكتابة الراقية',
    icon: Feather,
    tag: 'كتابة فاخرة',
    filterQuery: 'قلم',
    accentColor: 'from-[#E30613]/15 via-white to-white',
    iconBg: 'bg-[#E30613] text-white',
    countBadge: 'أقلام أصلية 100%',
  },
  {
    id: 'bags',
    title: 'حقائب الحواسيب والمهن (PROBAG)',
    subtitle: 'حقائب أعمال متينة للأجهزة والوثائق بمقاسات متعددة مبطنة',
    icon: Briefcase,
    tag: 'حماية وأناقة',
    filterQuery: 'حقيبة',
    accentColor: 'from-stone-900/10 via-white to-white',
    iconBg: 'bg-[#18181B] text-[#FFD100]',
    countBadge: 'مقاومة للصدمات',
  },
  {
    id: 'arts',
    title: 'مستلزمات الهندسة والفنون',
    subtitle: 'أدوات رسم تقني دقيقة، ألوان فنية وورق كانسون متخصص',
    icon: Compass,
    tag: 'هندسة وإبداع',
    filterQuery: 'فنون',
    accentColor: 'from-amber-500/15 via-white to-white',
    iconBg: 'bg-amber-500 text-white',
    countBadge: 'معايير معمارية',
  },
  {
    id: 'school',
    title: 'اللوازم المدرسية والجامعية',
    subtitle: 'دفاتر تكنو فائقة النعومة، أطقم هندسية ومستلزمات المراجعة',
    icon: BookOpen,
    tag: 'دراسة وتفوق',
    filterQuery: 'مدرسة',
    accentColor: 'from-blue-500/15 via-white to-white',
    iconBg: 'bg-blue-600 text-white',
    countBadge: 'أدوات تدوم طويلاً',
  },
  {
    id: 'clocks',
    title: 'الساعات المكتبية والآلات الحاسبة',
    subtitle: 'ساعات حائطية صامتة، ساعات مكتبية وحاسبات كاسيو العلمية',
    icon: Clock,
    tag: 'تنظيم الوقت',
    filterQuery: 'ساعة',
    accentColor: 'from-emerald-500/15 via-white to-white',
    iconBg: 'bg-emerald-600 text-white',
    countBadge: 'دقة واحترافية',
  },
];

export function CategoryShowcase({ onSelectCategory }: CategoryShowcaseProps) {
  const handleClick = (query: string) => {
    onSelectCategory(query);
    const elem = document.getElementById('collection');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-[#FAF9F6] bg-stationery-grid border-b border-stone-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD100]/25 border border-[#FFD100] text-xs font-bold text-[#18181B] mb-2.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E30613]" />
            <span>تشكيلة تكنو الرسمية المعتمدة</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#18181B]">
            استكشف أقسام متجر تكنو الأغواط
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#52525B]">
            تصفح التشكيلات الشاملة المتوفرة في فرعنا مع إمكانية الطلب المباشر والتوصيل لكافة الولايات.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat.filterQuery)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className={`group relative text-right p-6 sm:p-7 rounded-3xl bg-gradient-to-b ${cat.accentColor} border-2 border-stone-200/90 hover:border-[#E30613] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`w-13 h-13 rounded-2xl ${cat.iconBg} flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-[#18181B] shadow-2xs">
                        {cat.tag}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500 font-semibold">
                        {cat.countBadge}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#18181B] group-hover:text-[#E30613] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-[#18181B] group-hover:text-[#E30613] transition-colors">
                  <span>تصفح هذا القسم واطلب مباشرة</span>
                  <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center transition-transform group-hover:-translate-x-1.5 shadow-2xs group-hover:border-[#E30613] group-hover:bg-[#E30613] group-hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
