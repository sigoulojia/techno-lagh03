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
    <footer className="relative text-white overflow-hidden border-t-4 border-[#FFD100] bg-[#0A1628]">
      {/* =========================================================================
          AUTHENTIC ALGERIAN ZELLIGE (الزليج الجزائري التقليدي الأصيل) BACKGROUND
          Intricate 8-pointed Moorish geometric stars and ceramic mosaic tessellation
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none opacity-40 select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="algerian-zellige-mosaic"
              width="96"
              height="96"
              patternUnits="userSpaceOnUse"
            >
              {/* Ceramic Base Tile */}
              <rect width="96" height="96" fill="#091424" />

              {/* Geometric Grid Lines (تسطير الزليج) */}
              <path
                d="M0 48 H96 M48 0 V96 M0 0 L96 96 M96 0 L0 96"
                stroke="#1E293B"
                strokeWidth="0.8"
                opacity="0.6"
              />

              {/* Connecting Diamond Tiles (معينات الزليج) */}
              <polygon points="48,16 64,32 48,48 32,32" fill="#E30613" opacity="0.85" stroke="#FFD100" strokeWidth="1" />
              <polygon points="48,48 64,64 48,80 32,64" fill="#E30613" opacity="0.85" stroke="#FFD100" strokeWidth="1" />
              <polygon points="16,48 32,32 48,48 32,64" fill="#FFD100" opacity="0.9" stroke="#E30613" strokeWidth="1" />
              <polygon points="48,48 64,32 80,48 64,64" fill="#FFD100" opacity="0.9" stroke="#E30613" strokeWidth="1" />

              {/* Center 8-Point Algerian Star (النجمة الثمانية المركزية) */}
              <g transform="translate(48,48)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#FFD100"
                  stroke="#18181B"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#E30613"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <circle cx="0" cy="0" r="5" fill="#0A1628" stroke="#FFD100" strokeWidth="1.5" />
              </g>

              {/* Corner 8-Point Stars (الأركان الأربعة) */}
              {/* Top-Left (0,0) */}
              <g transform="translate(0,0)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#FFD100"
                  stroke="#18181B"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#E30613"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <circle cx="0" cy="0" r="5" fill="#0A1628" stroke="#FFD100" strokeWidth="1.5" />
              </g>

              {/* Top-Right (96,0) */}
              <g transform="translate(96,0)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#FFD100"
                  stroke="#18181B"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#E30613"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <circle cx="0" cy="0" r="5" fill="#0A1628" stroke="#FFD100" strokeWidth="1.5" />
              </g>

              {/* Bottom-Left (0,96) */}
              <g transform="translate(0,96)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#FFD100"
                  stroke="#18181B"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#E30613"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <circle cx="0" cy="0" r="5" fill="#0A1628" stroke="#FFD100" strokeWidth="1.5" />
              </g>

              {/* Bottom-Right (96,96) */}
              <g transform="translate(96,96)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#FFD100"
                  stroke="#18181B"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#E30613"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <circle cx="0" cy="0" r="5" fill="#0A1628" stroke="#FFD100" strokeWidth="1.5" />
              </g>

              {/* Delicate Ceramic Edge Trim */}
              <rect x="0" y="0" width="96" height="96" fill="none" stroke="#FFD100" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#algerian-zellige-mosaic)" />
        </svg>
      </div>

      {/* Decorative Ceramic Radial Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD100]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E30613]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Algerian Zellige Ceramic Frieze (إفريز الزليج الجزائري التقليدي) */}
      <div className="relative z-10 w-full bg-[#0C1B33]/90 backdrop-blur-sm border-b-2 border-[#FFD100]/40 py-2.5 px-4 select-none shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[#FFD100] text-xs font-bold">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E30613] border border-[#FFD100] animate-pulse" />
            <span className="font-display font-black tracking-wide text-white">
              زليج جزائري أصيل · فرع الأغواط الرسمي
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-stone-300 text-xs font-medium">
            <span className="text-[#FFD100]">✦</span>
            <span>25 سنة من الأصالة والخدمة</span>
            <span className="text-[#FFD100]">✦</span>
            <span>شحن لـ 69 ولاية عبر ZR Express</span>
            <span className="text-[#FFD100]">✦</span>
            <span>الدفع نقداً عند استلام الطرد</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="stamp-yellow text-[10px] font-black py-0.5 px-2.5">
              الأغواط 03
            </span>
          </div>
        </div>
      </div>

      {/* 2. Brand Identity & Instant Contact Header */}
      <div className="relative z-10 border-b border-[#FFD100]/25 bg-[#081220]/75 backdrop-blur-md py-7 sm:py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-4">
            <TechnoLogo size="lg" showBranch={true} />
            <div className="border-t sm:border-t-0 sm:border-r-2 border-[#FFD100]/40 pt-3 sm:pt-0 sm:pr-4">
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
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black border-2 border-[#18181B] shadow-[3px_3px_0px_#FFD100] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>محادثة واتساب فورية</span>
            </a>
            <a
              href={STORE_INFO.phoneHref}
              dir="ltr"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E30613] hover:bg-[#C4000F] text-white text-xs font-black border-2 border-[#18181B] shadow-[3px_3px_0px_#FFD100] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#FFD100]" />
              <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Content Cards over Algerian Zellige (ألواح زليج رخامية فاخرة) */}
      <div className="relative z-10 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Column 1: About the Branch (لوح فرع تكنو الأغواط) */}
            <div className="p-6 rounded-3xl bg-[#0B1526]/85 backdrop-blur-md border-2 border-[#FFD100]/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#FFD100] text-sm">✦</span>
                  <h3 className="font-display text-sm font-black text-[#FFD100] uppercase tracking-wider">
                    عن فرع تكنو الأغواط
                  </h3>
                </div>
                <h4 className="font-display text-base font-black text-white leading-snug">
                  {STORE_INFO.fullTitle}
                </h4>
                <p className="mt-2.5 text-xs text-stone-200 leading-relaxed font-medium">
                  تكنو ترافقكم في رسم وتجهيز مسيرتكم المهنية والدراسية والهندسية بأجود الأدوات المكتبية، حقائب PROBAG، وأقلام التوقيع العالمية، مع تسليم فوري لـ 69 ولاية.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-[#FFD100]/30 flex items-center gap-2.5 text-xs text-stone-200">
                <ShieldCheck className="w-5 h-5 text-[#FFD100] shrink-0" />
                <div>
                  <span className="font-black text-white block">ضمان الأصالة 100%</span>
                  <span className="text-[11px] text-stone-300">معتمد وموثق من تكنو الجزائر</span>
                </div>
              </div>
            </div>

            {/* Column 2: Main Store Categories (Synced from Telegram, max 6) */}
            <div className="p-6 rounded-3xl bg-[#0B1526]/85 backdrop-blur-md border-2 border-[#FFD100]/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#FFD100]/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#FFD100] text-sm">✦</span>
                  <h3 className="font-display text-sm font-black text-[#FFD100] uppercase tracking-wider">
                    أقسام المتجر
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#FFD100] bg-black/50 px-2 py-0.5 rounded border border-[#FFD100]/40 font-bold">
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
                      className="group flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-[#FFD100] border border-white/10 hover:border-[#FFD100] text-stone-200 hover:text-[#18181B] font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E30613] group-hover:bg-[#18181B] transition-colors" />
                        <span>{cat.name}</span>
                      </span>
                      <ChevronLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#18181B] group-hover:-translate-x-1 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Logistics & ZR Express (لوح خدمات الشحن) */}
            <div className="p-6 rounded-3xl bg-[#0B1526]/85 backdrop-blur-md border-2 border-[#FFD100]/40 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#FFD100]/30 pb-3">
                <span className="text-[#FFD100] text-sm">✦</span>
                <h3 className="font-display text-sm font-black text-[#FFD100] uppercase tracking-wider">
                  التوصيل والخدمات
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-black/35 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-[#FFD100] font-bold">
                    <Truck className="w-4 h-4 shrink-0 text-[#FFD100]" />
                    <span className="text-white">شحن رسمي عبر ZR Express</span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    تغطية رسمية لـ 69 ولاية جزائرية مع تسليم لباب المنزل أو للمكتب.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#E30613]/20 border border-[#E30613]/40 space-y-1">
                  <div className="flex items-center justify-between text-[#FFD100] font-black">
                    <span className="text-white">داخل ولاية الأغواط</span>
                    <span className="text-[10px] font-mono text-[#FFD100] bg-black/40 px-2 py-0.5 rounded">24 بلدية</span>
                  </div>
                  <p className="text-[11px] text-stone-200">
                    500 د.ج لباب المنزل · 380 د.ج للمكتب (Stop Desk).
                  </p>
                </div>

                <a
                  href="#track"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FFD100] hover:bg-[#E5BC00] text-[#18181B] text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#E30613] animate-pulse" />
                  <span>فحص ومتابعة حالة الطلب</span>
                </a>
              </div>
            </div>

            {/* Column 4: Physical Branch Desk Card (لوح الفرع الميداني) */}
            <div className="p-6 rounded-3xl bg-[#0B1526]/85 backdrop-blur-md border-2 border-[#FFD100]/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#FFD100]/30 pb-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#FFD100]">
                    <span>✦</span>
                    <span>الفرع الميداني</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#E30613] text-white px-2 py-0.5 rounded border border-[#FFD100]/50">
                    الأغواط 03
                  </span>
                </div>

                <div className="space-y-3 text-xs text-stone-200 font-medium">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#E30613] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[#FFD100] block">العنوان الدقيق:</span>
                      <span className="text-white font-bold">{STORE_INFO.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#FFD100] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[#FFD100] block">أوقات الاستقبال:</span>
                      <span className="text-white font-bold">{STORE_INFO.hours}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#FFD100]/30">
                <a
                  href={STORE_INFO.phoneHref}
                  dir="ltr"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#18181B] text-xs font-black shadow-md border-2 border-[#18181B] transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E30613]" />
                  <span className="font-mono">{STORE_INFO.phoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 4. Bottom Algerian Zellige Barcode & Certification Strip */}
          <div className="mt-12 pt-8 border-t border-[#FFD100]/30 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-300">
            <div className="flex items-center gap-3">
              {/* Ceramic Dispatch Barcode */}
              <div className="px-2.5 py-1 rounded-lg bg-white text-[#18181B] border border-[#FFD100] font-mono tracking-widest text-[11px] font-black select-none shadow-sm">
                ||| | |||| | || | ||| ||
              </div>
              <div>
                <p className="font-bold text-white">
                  {STORE_INFO.fullTitle}
                </p>
                <p className="text-[11px] text-[#FFD100] mt-0.5 font-medium">
                  طابع الزليج الجزائري الأصيل · 25 سنة حكاية أجيال ومازال
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="stamp-yellow text-[10px] font-black">
                الدفع عند الاستلام
              </span>
              <span className="stamp-red text-[10px] font-black bg-white">
                ضمان تكنو الرسمي
              </span>
            </div>

            <p className="text-center md:text-left text-[11px] text-stone-400 font-mono">
              © {new Date().getFullYear()} جميع الحقوق محفوظة لفرع تكنو الأغواط
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
