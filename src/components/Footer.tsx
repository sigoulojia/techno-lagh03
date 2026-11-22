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

      {/* 2. Notebook Stationery Paper with Top Spiral Rings (ورقة كراس بسلك نابض حلزوني) */}
      <div className="relative z-10 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Spiral Wire Binding (النابض الحلزوني للكراريس) */}
          <div className="relative z-20 w-full overflow-hidden -mb-4 px-3 sm:px-6">
            <svg
              className="w-full h-9 sm:h-10 select-none overflow-visible"
              viewBox="0 0 1024 36"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Metallic Steel Wire Gradient for the Spring Coil */}
                <linearGradient id="notebook-spiral-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="25%" stopColor="#CBD5E1" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="75%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>

                <pattern id="spiral-ring-pattern" width="32" height="36" patternUnits="userSpaceOnUse">
                  {/* Punch Hole in Notebook Paper */}
                  <ellipse cx="16" cy="24" rx="4" ry="6" fill="#060D17" stroke="#94A3B8" strokeWidth="0.5" />
                  {/* Inner Hole Shadow */}
                  <ellipse cx="16" cy="23" rx="3.2" ry="4.8" fill="#000000" opacity="0.8" />
                  {/* Wire Coil Shadow */}
                  <path
                    d="M13,24 C11,4 21,4 19,24"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="3.5"
                    fill="none"
                    transform="translate(1, 2)"
                  />
                  {/* 3D Metallic Wire Loop (حلقة السلك المعدني) */}
                  <path
                    d="M13,24 C11,6 21,6 19,24"
                    stroke="url(#notebook-spiral-metal)"
                    strokeWidth="3.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Highlight Glint on Wire */}
                  <path
                    d="M14,15 C13,8 19,8 18,15"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.9"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="36" fill="url(#spiral-ring-pattern)" />
            </svg>
          </div>

          {/* Notebook Paper Body (ورقة الكراس العاجية المسطرة) */}
          <div
            className="relative pt-8 sm:pt-10 pb-8 sm:pb-10 px-6 sm:px-10 rounded-b-3xl rounded-t-xl bg-[#FCFAF6] text-[#18181B] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-2 border-stone-300/80 overflow-hidden"
            style={{
              // Faint Notebook Ruling Lines (تسطير أسطر الكراس الأزرق الخفيف جداً)
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(148, 163, 184, 0.15) 31px, rgba(148, 163, 184, 0.15) 32px)',
            }}
          >
            {/* Top Perforated Tear-Line (خط فواصل الورق المثقوب) */}
            <div className="absolute top-0 inset-x-0 h-2 border-b-2 border-dashed border-stone-300/80 pointer-events-none" />

            {/* Right-Hand Notebook Margin Line (هامش الكراس الأحمر الأيمن للغة العربية) */}
            <div className="absolute inset-y-0 right-4 sm:right-6 w-[2px] bg-[#E30613]/25 pointer-events-none" />

            {/* Notebook Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pr-2 sm:pr-4">
              
              {/* Column 1: Store Heritage & Trust (عن فرع تكنو الأغواط) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-stone-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E30613]" />
                  <h3 className="font-display text-base font-black text-[#18181B] tracking-wide">
                    فرع تكنو الأغواط
                  </h3>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-semibold">
                  <span className="inline-block bg-[#FFD100]/40 px-1 rounded font-black text-[#18181B] ml-1">تكنو ستيشنري — فرع الأغواط</span>
                  نرافقكم في تجهيز مسيرتكم المهنية والدراسية والهندسية بأجود الأدوات المكتبية، حقائب PROBAG، وأقلام التوقيع العالمية.
                </p>
                <div className="space-y-2 pt-1 text-xs text-stone-800 font-bold">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>موزع رسمي معتمد من تكنو الجزائر</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-50 border border-amber-200/80">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ضمان أصالة المنتجات وجودة الصنع 100%</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Main Store Categories (أقسام المتجر المحدثة) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00A896]" />
                    <h3 className="font-display text-base font-black text-[#18181B] tracking-wide">
                      أقسام المتجر
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-black text-[#18181B] bg-[#FFD100] px-2 py-0.5 rounded shadow-2xs border border-[#18181B]/15">
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
                        className="group flex items-center justify-between text-stone-700 hover:text-[#E30613] transition-colors py-1 cursor-pointer font-bold border-b border-stone-100 hover:border-stone-300"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] group-hover:bg-[#E30613] transition-colors" />
                          <span className="group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity text-[#E30613]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Logistics & ZR Express Shipping (التوصيل والخدمات) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-stone-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD100]" />
                  <h3 className="font-display text-base font-black text-[#18181B] tracking-wide">
                    التوصيل والخدمات
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-100/80 border border-stone-200 space-y-1">
                    <div className="flex items-center gap-2 text-stone-900 font-black">
                      <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>شحن رسمي عبر ZR Express لـ 69 ولاية</span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-medium">
                      تسليم آمن لباب المنزل أو للمكتب مع الدفع عند الاستلام.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-1">
                    <div className="font-black text-[#18181B] flex items-center justify-between">
                      <span>داخل ولاية الأغواط (24 بلدية):</span>
                    </div>
                    <p className="text-[11px] text-amber-900 font-bold">
                      500 د.ج لباب المنزل · 380 د.ج للمكتب (Stop Desk)
                    </p>
                  </div>

                  <div className="pt-1">
                    <a
                      href="#track"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#FFD100] hover:bg-[#E5BC00] text-[#18181B] text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#E30613] animate-pulse" />
                      <span>فحص ومتابعة حالة الطلب</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Column 4: Physical Branch Desk & Hours (الفرع الميداني) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E30613]" />
                    <h3 className="font-display text-base font-black text-[#18181B] tracking-wide">
                      الفرع الميداني
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-black bg-[#E30613] text-white px-2 py-0.5 rounded shadow-2xs">
                    الأغواط 03
                  </span>
                </div>

                <div className="space-y-3 text-xs text-stone-700 font-medium">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#E30613] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-500 block text-[11px] font-bold">العنوان المباشر:</span>
                      <span className="text-[#18181B] font-black">{STORE_INFO.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-500 block text-[11px] font-bold">أوقات العمل:</span>
                      <span className="text-[#18181B] font-black">{STORE_INFO.hours}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <a
                      href={STORE_INFO.phoneHref}
                      dir="ltr"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-mono font-black shadow-md transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FFD100]" />
                      <span>{STORE_INFO.phoneDisplay}</span>
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
