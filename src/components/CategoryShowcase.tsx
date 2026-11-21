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
    countBadge: 'طلب مباشر',
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
    countBadge: 'أصلي 100%',
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
    countBadge: 'متوفر بالفرع',
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
    countBadge: 'معتمد رسمياً',
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
    countBadge: 'توصيل 54 ولاية',
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
    countBadge: 'ضمان تكنو',
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
    <section className="py-16 lg:py-24 bg-lined-paper border-b-2 border-stone-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="stamp-yellow text-xs">TECHNO DEPARTMENTS</span>
            <span className="stamp-red text-xs">الأغواط 03</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black text-[#18181B]">
            <span className="highlight-yellow">أقسام وتشكيلات تكنو الأغواط</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 font-medium">
            تصفح التشكيلات الشاملة المتوفرة في فرعنا مع إمكانية الطلب المباشر والتوصيل لكافة الولايات.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat.filterQuery)}
                className="group relative text-right p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#E30613] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-xl ${cat.iconBg} border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-[#FFD100] border-2 border-[#18181B] text-[#18181B]">
                        {cat.tag}
                      </span>
                      <span className="text-[10px] font-mono text-stone-600 font-bold">
                        {cat.countBadge}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-black text-[#18181B] group-hover:text-[#E30613] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-stone-100 flex items-center justify-between text-xs font-black text-[#18181B] group-hover:text-[#E30613] transition-colors">
                  <span>تصفح هذا القسم واطلب مباشرة</span>
                  <div className="w-8 h-8 rounded-lg bg-stone-100 border-2 border-[#18181B] flex items-center justify-center transition-transform group-hover:-translate-x-1 shadow-2xs group-hover:border-[#E30613] group-hover:bg-[#E30613] group-hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
