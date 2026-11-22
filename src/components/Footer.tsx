import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Truck,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
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
    <footer className="relative text-white overflow-hidden border-t-2 border-[#FFD100]/60 bg-[#060D17]">
      {/* =========================================================================
          ALGERIAN ZELLIGE BACKGROUND TEXTURE
          Authentic ceramic mosaic tiles backdrop with atmospheric glaze
          ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45 select-none"
        style={{
          backgroundImage: "url('/assets/algerian-zellige-jersey.webp')",
          backgroundRepeat: 'repeat',
          backgroundSize: '340px 340px',
          backgroundPosition: 'center top',
        }}
      />

      {/* Atmospheric glaze gradients to ensure pristine text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060D17]/85 via-[#060D17]/65 to-[#060D17]/90 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00A896]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FFD100]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Brand Identity & Instant Contact Header */}
      <div className="relative z-10 border-b border-white/10 bg-[#060D17]/60 backdrop-blur-md py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-4">
            <TechnoLogo size="lg" showBranch={true} />
            <div className="border-t sm:border-t-0 sm:border-r border-white/15 pt-3 sm:pt-0 sm:pr-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="stamp-red text-[10px] font-black bg-white">25 سنة</span>
                <p className="font-display text-base font-black text-[#FFD100]">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>محادثة واتساب فورية</span>
            </a>
            <a
              href={STORE_INFO.phoneHref}
              dir="ltr"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#FFD100]" />
              <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Unified Modern Architectural Layout (بدون جداول أو صناديق بدائية) */}
      <div className="relative z-10 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#081322]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              
              {/* Column 1: Store Heritage & Trust */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#FFD100]" />
                  <h3 className="font-display text-sm font-black text-[#FFD100] tracking-wide">
                    فرع تكنو الأغواط
                  </h3>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  {STORE_INFO.fullTitle}. نرافقكم في تجهيز مسيرتكم المهنية والدراسية والهندسية بأجود الأدوات المكتبية، حقائب PROBAG، وأقلام التوقيع العالمية.
                </p>
                <div className="space-y-2 pt-1 text-xs text-stone-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00A896] shrink-0" />
                    <span>موزع رسمي معتمد من تكنو الجزائر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FFD100] shrink-0" />
                    <span>ضمان أصالة المنتجات وجودة الصنع 100%</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Main Store Categories (Dynamic from Telegram) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00A896]" />
                    <h3 className="font-display text-sm font-black text-white tracking-wide">
                      أقسام المتجر
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFD100] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    مباشر
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs">
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
                        className="group flex items-center justify-between text-stone-300 hover:text-[#FFD100] transition-colors py-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-stone-500 group-hover:bg-[#FFD100] transition-colors" />
                          <span className="font-medium group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#FFD100]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Logistics & ZR Express Shipping */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#FFD100]" />
                  <h3 className="font-display text-sm font-black text-white tracking-wide">
                    التوصيل والخدمات
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-stone-200 font-bold">
                      <Truck className="w-4 h-4 text-[#00A896] shrink-0" />
                      <span>شحن رسمي عبر ZR Express لـ 69 ولاية</span>
                    </div>
                    <p className="text-[11px] text-stone-400 pr-6">
                      تسليم آمن لباب المنزل أو للمكتب مع الدفع عند الاستلام.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-200">
                      <span>داخل ولاية الأغواط (24 بلدية):</span>
                    </div>
                    <p className="text-[11px] text-[#FFD100] font-semibold">
                      500 د.ج لباب المنزل · 380 د.ج للمكتب (Stop Desk)
                    </p>
                  </div>

                  <div className="pt-2">
                    <a
                      href="#track"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FFD100] to-[#F59E0B] hover:brightness-105 text-[#18181B] text-xs font-black shadow-md transition-all cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#E30613] animate-pulse" />
                      <span>فحص ومتابعة حالة الطلب</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Column 4: Physical Branch Desk & Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E30613]" />
                    <h3 className="font-display text-sm font-black text-white tracking-wide">
                      الفرع الميداني
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#E30613] text-white px-2 py-0.5 rounded">
                    الأغواط 03
                  </span>
                </div>

                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#E30613] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block text-[11px]">العنوان المباشر:</span>
                      <span className="text-white font-bold">{STORE_INFO.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#00A896] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block text-[11px]">أوقات العمل:</span>
                      <span className="text-white font-bold">{STORE_INFO.hours}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={STORE_INFO.phoneHref}
                      dir="ltr"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FFD100]" />
                      <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Bottom Strip: Clean, Modern Certification */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-md bg-white text-[#18181B] font-mono tracking-widest text-[11px] font-black select-none">
                ||| | |||| | || | ||| ||
              </div>
              <p className="font-bold text-white">
                {STORE_INFO.fullTitle} — 25 سنة حكاية أجيال ومازال
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="stamp-yellow text-[10px] font-black">
                الدفع عند الاستلام
              </span>
              <span className="stamp-red text-[10px] font-black bg-white">
                ضمان تكنو الرسمي
              </span>
            </div>

            <p className="text-center md:text-left text-[11px] text-stone-500 font-mono">
              © {new Date().getFullYear()} جميع الحقوق محفوظة لفرع تكنو الأغواط
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
