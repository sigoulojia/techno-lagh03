import { useState } from 'react';
import { Package, Check, Sparkles, ArrowRight, ShoppingBag, ShieldCheck, Flame, ChevronRight } from 'lucide-react';
import { type StorePack, INITIAL_PACKS } from '../data/packs';
import { formatDzd } from '../utils/storeLogic';

interface PacksSectionProps {
  packs?: StorePack[];
  onOrderPack: (pack: StorePack) => void;
  onAddToCart?: (pack: StorePack) => void;
}

export function PacksSection({ packs = INITIAL_PACKS, onOrderPack, onAddToCart }: PacksSectionProps) {
  const [activePackId, setActivePackId] = useState<string>(packs[0]?.id || '');
  const activePack = packs.find((p) => p.id === activePackId) || packs[0];

  if (!packs || packs.length === 0) return null;

  return (
    <section id="packs" className="py-16 lg:py-24 bg-lined-paper border-b-2 border-stone-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="stamp-red text-xs">عروض حصرية لفرع الأغواط</span>
              <span className="stamp-yellow text-xs font-black">توفير شامل بضمان تكنو</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-black text-[#18181B] leading-tight">
              <span className="highlight-yellow">باقات وعروض تكنو الخاصة (Packs)</span>
            </h2>
            <p className="mt-2.5 text-sm sm:text-base font-bold text-[#52525B] max-w-2xl leading-relaxed">
              مجموعات أدوات منتقاة بعناية للطلبة، المهندسين المعماريين، وأصحاب المكاتب — تمنحك حقيبة متكاملة تجمع كل ما تحتاجه بأفضل سعر جملة مخفض.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white border-2 border-[#18181B] text-xs font-black text-[#18181B] shadow-[2px_2px_0px_#18181B]">
              متوفر حالياً: {packs.length} باقات مجهزة
            </span>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {packs.map((pack) => {
            const savings = pack.savingsDzd || (pack.originalPriceDzd - pack.packPriceDzd);
            return (
              <div
                key={pack.id}
                className="rounded-3xl bg-white border-3 border-[#18181B] shadow-[6px_6px_0px_#18181B] overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#18181B]"
              >
                {/* Pack Header Strip */}
                <div className="bg-[#FAF8F5] border-b-2 border-[#18181B] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="stamp-red text-[11px] font-black">{pack.badge || 'باقة خاصة'}</span>
                    <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                      {pack.sku}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-black text-[#18181B]">
                    {pack.name}
                  </h3>

                  <p className="text-xs sm:text-sm font-bold text-[#E30613] mt-1">
                    موجهة إلى: {pack.targetAudience}
                  </p>
                </div>

                {/* Pack Content & Included Items */}
                <div className="p-5 sm:p-6 space-y-5 flex-1">
                  {/* Marketing Highlight Note */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF0] border-2 border-[#FFD100] shadow-[2px_2px_0px_#18181B]">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#18181B] mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#E30613]" />
                      <span>لماذا هذه الباقة مميزة؟</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#3F3F46] font-medium leading-relaxed">
                      {pack.description}
                    </p>
                  </div>

                  {/* Included Items List */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#18181B] mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#E30613]" />
                      <span>محتويات ومكونات الباقة المرفقة ({pack.items.length} مواد أصلية):</span>
                    </h4>

                    <ul className="space-y-2">
                      {pack.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#27272A] bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#18181B] text-[#FFD100] flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pricing & CTA Footer */}
                <div className="bg-[#FAF8F5] border-t-2 border-[#18181B] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <span className="text-[11px] font-bold text-stone-500 block">
                        السعر عند الشراء المنفصل:{' '}
                        <del className="text-stone-400 font-mono font-bold">
                          {formatDzd(pack.originalPriceDzd)}
                        </del>
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-[#18181B]">سعر الباقة المتكاملة:</span>
                        <span className="font-mono text-2xl font-black text-[#E30613]">
                          {formatDzd(pack.packPriceDzd)}
                        </span>
                      </div>
                    </div>

                    {savings > 0 && (
                      <div className="bg-[#FFD100] text-[#18181B] border-2 border-[#18181B] px-3 py-1.5 rounded-xl text-xs font-black shadow-[2px_2px_0px_#18181B]">
                        وفرت: {formatDzd(savings)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOrderPack(pack)}
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs sm:text-sm font-black border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>طلب الباقة فوراً (الدفع عند الاستلام)</span>
                    </button>

                    {onAddToCart && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(pack)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-stone-50 text-[#18181B] text-xs sm:text-sm font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span>إضافة للسلة</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
