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
    <footer className="relative bg-[#12131A] text-white overflow-hidden border-t-3 border-[#18181B]">
      {/* 1. Creative Precision Stationery Ruler (مقياس المسطرة الهندسية الرسمية لتكنو) */}
      <div className="w-full bg-[#FFD100] border-b-3 border-[#18181B] py-2 px-4 select-none shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[#18181B] font-mono text-[11px] font-bold">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E30613] animate-pulse" />
            <span className="font-black tracking-wider">TECHNO PRECISION DRAFTING SCALE ®</span>
          </div>

          <div className="hidden md:flex items-center gap-6 overflow-hidden text-stone-800 font-black opacity-85 text-xs">
            <span>| 0 cm</span>
            <span className="hidden lg:inline text-stone-600">···· | 5 cm</span>
            <span>···· | 10 cm</span>
            <span className="hidden lg:inline text-stone-600">···· | 15 cm</span>
            <span>···· | 20 cm</span>
            <span className="hidden lg:inline text-stone-600">···· | 25 cm</span>
            <span>···· | 30 cm</span>
            <span className="text-[#E30613] font-black">▲ معايير الدقة الهندسية 100%</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="stamp-red bg-white text-[10px] py-0.5 px-2">معتمد رسمياً</span>
            <span className="font-black text-[#18181B] font-display">فرع الأغواط 03</span>
          </div>
        </div>
      </div>

      {/* 2. Top Banner with Brand Identity and Quick Actions */}
      <div className="bg-[#18181B] border-b-2 border-stone-800 py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-4">
            <TechnoLogo size="lg" showBranch={true} />
            <div className="border-t sm:border-t-0 sm:border-r-2 border-stone-700 pt-3 sm:pt-0 sm:pr-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="stamp-yellow text-[10px] font-black">25 سنة</span>
                <p className="font-display text-sm sm:text-base font-black text-[#FFD100]">
                  {STORE_INFO.heritageLine}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 font-medium">
                {STORE_INFO.secondarySlogan} — {STORE_INFO.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/213560154663"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>محادثة واتساب فورية</span>
            </a>
            <a
              href={STORE_INFO.phoneHref}
              dir="ltr"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#FFD100]" />
              <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Cards Grid (Background with Technical Stationery Grid) */}
      <div className="bg-[#12131A] bg-dark-grid py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Column 1: About the Branch */}
            <div className="p-6 rounded-3xl bg-[#181922] border-2 border-stone-800 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E30613]" />
                  <h3 className="font-display text-sm font-black text-[#FFD100] uppercase tracking-wider">
                    عن فرع تكنو الأغواط
                  </h3>
                </div>
                <h4 className="font-display text-base font-black text-white leading-snug">
                  {STORE_INFO.fullTitle}
                </h4>
                <p className="mt-2.5 text-xs text-stone-300 leading-relaxed font-medium">
                  نرافقكم في رسم وتجهيز مسيرتكم المهنية والدراسية والهندسية بأجود الأدوات المكتبية، حقائب PROBAG، وأقلام التوقيع العالمية، مع تسليم فوري لـ 69 ولاية.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 flex items-center gap-2.5 text-xs text-stone-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-black text-white block">ضمان الأصالة 100%</span>
                  <span className="text-[11px] text-stone-400">معتمد وموثق من تكنو الجزائر</span>
                </div>
              </div>
            </div>

            {/* Column 2: Dynamic Categories from Telegram (Max 6) */}
            <div className="p-6 rounded-3xl bg-[#181922] border-2 border-stone-800 shadow-md space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD100]" />
                  <h3 className="font-display text-sm font-black text-[#FFD100] uppercase tracking-wider">
                    أقسام المتجر الرئيسية
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#FFD100] bg-stone-900 px-2 py-0.5 rounded border border-stone-700 font-bold">
                  مزامنة مباشرة
                </span>
              </div>

              <ul className="space-y-2">
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
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-stone-900/80 hover:bg-[#FFD100] border border-stone-800 hover:border-[#18181B] text-xs font-bold text-stone-300 hover:text-[#18181B] transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E30613] group-hover:bg-[#18181B] transition-colors" />
                        <span>{cat.name}</span>
                      </span>
                      <ChevronLeft className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#18181B] group-hover:-translate-x-1 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Logistics & ZR Express */}
            <div className="p-6 rounded-3xl bg-[#181922] border-2 border-stone-800 shadow-md space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E30613]" />
                <h3 className="font-display text-sm font-black text-[#FFD100] uppercase tracking-wider">
                  التوصيل وخدمات الشحن
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
                  <div className="flex items-center gap-2 text-stone-200 font-bold">
                    <Truck className="w-4 h-4 text-[#FFD100] shrink-0" />
                    <span>شحن رسمي عبر ZR Express</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    تغطية رسمية لـ 69 ولاية جزائرية مع تسليم لباب المنزل أو للمكتب.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFFDF0]/10 border border-[#FFD100]/30 space-y-1">
                  <div className="flex items-center justify-between text-[#FFD100] font-black">
                    <span>داخل ولاية الأغواط</span>
                    <span className="text-[10px] font-mono">24 بلدية</span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    500 د.ج لباب المنزل · 380 د.ج للمكتب (Stop Desk).
                  </p>
                </div>

                <a
                  href="#track"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#18181B] text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>فحص ومتابعة حالة الطلب</span>
                </a>
              </div>
            </div>

            {/* Column 4: Physical Branch Desk Card (بطاقة الفرع الميداني) */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] text-[#18181B] border-3 border-[#18181B] shadow-[6px_6px_0px_#FFD100] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b-2 border-dashed border-stone-300 pb-2.5 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#E30613]">
                    <span>✎</span>
                    <span>بطاقة الفرع الميداني</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#FFD100] text-[#18181B] px-2 py-0.5 rounded border border-[#18181B]">
                    الأغواط 03
                  </span>
                </div>

                <div className="space-y-3 text-xs font-medium">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#E30613] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[#18181B] block">العنوان الدقيق:</span>
                      <span className="text-stone-700 font-bold">{STORE_INFO.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#18181B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[#18181B] block">أوقات الاستقبال:</span>
                      <span className="text-stone-700 font-bold">{STORE_INFO.hours}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-dashed border-stone-300">
                <a
                  href={STORE_INFO.phoneHref}
                  dir="ltr"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#18181B] hover:bg-[#E30613] text-white text-xs font-black shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FFD100]" />
                  <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 4. Bottom Stationery QC, Barcode & Certification Ribbon */}
          <div className="mt-14 pt-8 border-t-2 border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-400">
            <div className="flex items-center gap-3">
              {/* Stationery Barcode Graphic */}
              <div className="p-2 rounded-xl bg-white text-[#18181B] border border-stone-700 flex flex-col items-center select-none shadow-xs">
                <span className="font-mono tracking-[0.25em] text-[13px] font-black leading-none">
                  ||| | |||| | || | ||| ||
                </span>
                <span className="font-mono text-[8px] font-bold tracking-widest mt-0.5 text-stone-600">
                  TECHNO-03-LAGH
                </span>
              </div>
              <div>
                <p className="font-bold text-stone-200">
                  تكنو ستيشنري — فرع الأغواط الرسمي
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  العلامة ألي تفكر فيكم · 25 سنة حكاية أجيال ومازال
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="stamp-yellow text-[10px] font-black">
                الدفع عند الاستلام
              </span>
              <span className="stamp-red text-[10px] font-black">
                ضمان تكنو الرسمي
              </span>
            </div>

            <p className="text-center md:text-left text-[11px] text-stone-500 font-mono">
              © {new Date().getFullYear()} {STORE_INFO.fullTitle} · جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
