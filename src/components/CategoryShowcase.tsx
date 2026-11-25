import { ArrowLeft } from 'lucide-react';
import type { StoreCategory } from '../data/products';
import { getCategoryVisuals } from '../utils/categoryVisuals';

export interface CategoryShowcaseProps {
  categories?: Array<StoreCategory & { count?: number }>;
  onSelectCategory: (categoryKeyword: string) => void;
  onOpenCategoryPage?: (categoryId: string) => void;
}

export function CategoryShowcase({
  categories = [],
  onSelectCategory,
  onOpenCategoryPage,
}: CategoryShowcaseProps) {
  // If no dynamic categories exist yet, do not render an empty cosmetic section
  if (!categories || categories.length === 0) {
    return null;
  }

  const handleClick = (catId: string, catName: string) => {
    if (onOpenCategoryPage) {
      onOpenCategoryPage(catId);
    } else {
      onSelectCategory(catName);
      const elem = document.getElementById('collection');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="departments"
      aria-label="أقسام وتشكيلات تكنو الأغواط"
      className="py-14 lg:py-20 bg-lined-paper border-b-2 border-stone-300 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="stamp-yellow text-xs">TECHNO DEPARTMENTS</span>
            <span className="stamp-red text-xs">الأغواط 03</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black text-[#18181B]">
            <span className="highlight-yellow">أقسام وتشكيلات تكنو الأغواط</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 font-medium">
            تصفح أقسام متجرنا المتوفرة في فرع الأغواط، واضغط على أي قسم للدخول إلى صفحته المخصصة والطلب المباشر.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const visual = getCategoryVisuals(cat.name, idx);
            const Icon = visual.icon;
            const count = typeof cat.count === 'number' ? cat.count : 0;
            const countLabel =
              count > 0
                ? `${count} ${count >= 3 && count <= 10 ? 'منتجات متوفرة' : 'منتج متوفر'}`
                : 'طلب وتوصيل مباشر';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat.id, cat.name)}
                aria-label={`تصفح قسم ${cat.name} في متجر تكنو`}
                className="group relative text-right p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#E30613] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl ${visual.iconBg} border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-[#FFD100] border-2 border-[#18181B] text-[#18181B]">
                        {visual.tag}
                      </span>
                      <span className="text-[10px] font-mono text-stone-600 font-bold">
                        {countLabel}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl font-black text-[#18181B] group-hover:text-[#E30613] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-medium line-clamp-2">
                    {visual.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-stone-100 flex items-center justify-between text-xs font-black text-[#18181B] group-hover:text-[#E30613] transition-colors">
                  <span>تصفح قسم {cat.name} واطلب مباشرة</span>
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
