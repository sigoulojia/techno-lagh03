import { FolderOpen, Feather, Briefcase, Compass, BookOpen, Clock, ArrowLeft } from 'lucide-react';

interface CategoryShowcaseProps {
  onSelectCategory: (categoryKeyword: string) => void;
}

const CATEGORIES = [
  {
    id: 'office',
    title: 'الأدوات المكتبية والسجلات',
    subtitle: 'ملفات، سجلات محاسبية وأدوات التنظيم المعتمدة',
    icon: FolderOpen,
    tag: 'مكتبي واحترافي',
    filterQuery: 'مكتبي',
    accentColor: 'from-[#FFD100]/30 via-white to-white',
    iconBg: 'bg-[#FFD100] text-[#18181B]',
  },
  {
    id: 'pens',
    title: 'أقلام التوقيع والفاخرة',
    subtitle: 'أقلام حبر، رولر، خط عربي ومستلزمات الكتابة الراقية',
    icon: Feather,
    tag: 'كتابة فاخرة',
    filterQuery: 'قلم',
    accentColor: 'from-[#E30613]/15 via-white to-white',
    iconBg: 'bg-[#E30613] text-white',
  },
  {
    id: 'bags',
    title: 'حقائب الحواسيب والمهن',
    subtitle: 'حقائب متينة للأجهزة والوثائق بمقاسات متعددة',
    icon: Briefcase,
    tag: 'حماية وأناقة',
    filterQuery: 'حقيبة',
    accentColor: 'from-stone-900/10 via-white to-white',
    iconBg: 'bg-[#18181B] text-[#FFD100]',
  },
  {
    id: 'arts',
    title: 'مستلزمات الهندسة والفنون',
    subtitle: 'أدوات رسم تقني، ألوان فنية وورق كانسون متخصص',
    icon: Compass,
    tag: 'هندسة وإبداع',
    filterQuery: 'فنون',
    accentColor: 'from-amber-500/15 via-white to-white',
    iconBg: 'bg-amber-500 text-white',
  },
  {
    id: 'school',
    title: 'اللوازم المدرسية والجامعية',
    subtitle: 'دفاتر، أدوات تحديد، أطقم هندسية ومستلزمات الدراسة',
    icon: BookOpen,
    tag: 'دراسة وتفوق',
    filterQuery: 'مدرسة',
    accentColor: 'from-blue-500/15 via-white to-white',
    iconBg: 'bg-blue-600 text-white',
  },
  {
    id: 'clocks',
    title: 'الساعات المكتبية والآلات الحاسبة',
    subtitle: 'ساعات حائطية، ساعات مكتبية وحاسبات علمية',
    icon: Clock,
    tag: 'تنظيم الوقت',
    filterQuery: 'ساعة',
    accentColor: 'from-emerald-500/15 via-white to-white',
    iconBg: 'bg-emerald-600 text-white',
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
    <section className="py-16 bg-[#FAF9F6] bg-stationery-grid border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD100]/30 border border-[#FFD100] text-xs font-bold text-[#18181B] mb-2.5">
            <span>تشكيلة تكنو الرسمية المعتمدة</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#18181B]">
            استكشف أقسام متجر تكنو الأغواط
          </h2>
          <p className="mt-2 text-sm text-[#52525B]">
            تصفح التشكيلات الشاملة المتوفرة في فرعنا مع إمكانية الطلب المباشر والتوصيل لكافة الولايات.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat.filterQuery)}
                className={`group relative text-right p-6 rounded-3xl bg-gradient-to-b ${cat.accentColor} border-2 border-stone-200/80 hover:border-[#E30613] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${cat.iconBg} flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-stone-200/80 text-[#18181B] shadow-2xs">
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#18181B] group-hover:text-[#E30613] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-[#18181B] group-hover:text-[#E30613] transition-colors">
                  <span>تصفح هذا القسم</span>
                  <div className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center transition-transform group-hover:-translate-x-1 shadow-2xs">
                    <ArrowLeft className="w-3.5 h-3.5" />
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
