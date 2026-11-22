import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Truck,
  MessageSquare,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { STORE_INFO, DEFAULT_CATEGORIES } from '../data/products';
import { TechnoLogo } from './TechnoLogo';

export interface FooterProps {
  categories?: Array<{ id: string; name: string }>;
  onSelectCategory?: (category: string) => void;
}

export function Footer({ categories = [], onSelectCategory }: FooterProps) {
  // Use synced store categories (from Telegram / backend) if available, or default categories, max 6 items
  const displayedCategories = (categories.length > 0 ? categories : DEFAULT_CATEGORIES).slice(0, 6);

  return (
    <footer className="relative bg-[#FAF8F5] text-[#18181B] border-t-3 border-[#18181B]">
      {/* 1. Subtle Stationery Brand Accent Stripe (ألوان تكنو الأصلية: أصفر وأحمر) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#E30613] via-[#FFD100] to-[#E30613]" />

      {/* 2. Brand Identity & Fast Contact Header */}
      <div className="bg-white border-b-2 border-stone-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-3.5">
            <TechnoLogo size="md" showBranch={true} />
            <div className="border-t sm:border-t-0 sm:border-r-2 border-stone-300 pt-2 sm:pt-0 sm:pr-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                <span className="stamp-yellow text-[10px] font-black">25 سنة</span>
                <p className="font-display text-sm font-black text-[#18181B]">
                  {STORE_INFO.heritageLine}
                </p>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {STORE_INFO.secondarySlogan} — {STORE_INFO.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/213560154663"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>محادثة واتساب فورية</span>
            </a>
            <a
              href={STORE_INFO.phoneHref}
              dir="ltr"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#FFD100]" />
              <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Editorial Columns (تصميم متناسق وأنيق خالي من الجداول الصندوقية) */}
      <div className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Column 1: About the Branch */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E30613]" />
                <h3 className="font-display text-sm font-black text-[#18181B] uppercase tracking-wider">
                  عن فرع تكنو الأغواط
                </h3>
              </div>
              <h4 className="font-display text-base font-black text-[#18181B] leading-snug">
                {STORE_INFO.fullTitle}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                تكنو ترافقك في رسم وتجهيز مسيرتك المهنية والدراسية والهندسية بأجود الأدوات المكتبية، حقائب PROBAG، وأقلام التوقيع العالمية، مع تسليم فوري لـ 69 ولاية.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#18181B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>معتمد 100% · جميع المعروضات أصلية ومضمونة</span>
              </div>
            </div>

            {/* Column 2: Main Store Categories (Synced from Telegram, max 6) */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b-2 border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD100] border border-[#18181B]" />
                  <h3 className="font-display text-sm font-black text-[#18181B] uppercase tracking-wider">
                    أقسام المتجر
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-bold">
                  محدث ومباشر
                </span>
              </div>

              <ul className="space-y-2 text-xs">
                {displayedCategories.map((cat) => (
                  <li key={cat.id || cat.name}>
                    <a
                      href="#collection"
                      onClick={(e) => {
                        if (onSelectCategory) {
                          e.preventDefault();
                          onSelectCategory(cat.id || cat.name);
                          const elem = document.getElementById('collection');
                          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="group flex items-center justify-between py-1.5 px-2 rounded-lg text-stone-700 hover:text-[#E30613] hover:bg-stone-100 font-bold transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E30613] group-hover:scale-125 transition-transform" />
                        <span>{cat.name}</span>
                      </span>
                      <ChevronLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E30613] group-hover:-translate-x-1 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Logistics & ZR Express */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 border-b-2 border-stone-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E30613]" />
                <h3 className="font-display text-sm font-black text-[#18181B] uppercase tracking-wider">
                  التوصيل والخدمات
                </h3>
              </div>

              <ul className="space-y-3 text-xs text-stone-700 font-medium">
                <li className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-[#E30613] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#18181B] block">شحن رسمي عبر ZR Express:</span>
                    <span className="text-stone-600">تغطية شاملة لكافة ولايات الجزائر الـ 69.</span>
                  </div>
                </li>

                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#FFD100] text-[#18181B] font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    03
                  </span>
                  <div>
                    <span className="font-bold text-[#18181B] block">داخل ولاية الأغواط:</span>
                    <span className="text-stone-600">500 د.ج لباب المنزل · 380 د.ج للمكتب (24 بلدية).</span>
                  </div>
                </li>

                <li className="pt-1">
                  <a
                    href="#track"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#18181B] text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>فحص ومتابعة حالة الطلب</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Branch Contact & Location */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b-2 border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
                  <h3 className="font-display text-sm font-black text-[#18181B] uppercase tracking-wider">
                    فرع الأغواط الميداني
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#FFD100] text-[#18181B] px-2 py-0.5 rounded border border-[#18181B]">
                  الأغواط 03
                </span>
              </div>

              <div className="space-y-3 text-xs text-stone-700 font-medium">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#E30613] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-[#18181B] block">العنوان الدقيق:</span>
                    <span className="text-stone-600">{STORE_INFO.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#18181B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-[#18181B] block">أوقات الاستقبال:</span>
                    <span className="text-stone-600">{STORE_INFO.hours}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={STORE_INFO.phoneHref}
                    dir="ltr"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#18181B] text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#E30613]" />
                    <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Stationery Barcode & Copyright Bar */}
      <div className="bg-white border-t-2 border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex items-center gap-3">
            {/* Stationery Barcode Graphic */}
            <div className="px-2 py-1 rounded-md bg-[#FAF8F5] border border-stone-300 font-mono tracking-widest text-[10px] text-stone-700 font-black select-none">
              ||| | |||| | || | ||| ||
            </div>
            <p className="font-bold text-[#18181B]">
              {STORE_INFO.fullTitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
            <span className="stamp-yellow text-[10px] font-black">
              الدفع عند الاستلام
            </span>
            <span className="stamp-red text-[10px] font-black">
              معتمد 100%
            </span>
          </div>

          <p className="text-center sm:text-left text-[11px] text-stone-500 font-mono">
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
