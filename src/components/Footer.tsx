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
    <footer className="relative text-white overflow-hidden border-t-4 border-[#FFD100] bg-[#07111E]">
      {/* =========================================================================
          ALGERIAN NATIONAL FOOTBALL TEAM ZELLIGE (زليج قميص المنتخب الوطني الجزائري)
          Inspired by the iconic Adidas 2022 jersey & Palais El Mechouar (Tlemcen)
          Hi-Res Aqua (#00C2CB), Bold Gold (#FFD100), Team Navy (#0B1728), White & Green
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none opacity-80 select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="algeria-jersey-zellige"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              {/* Deep Team Navy Base of the Jersey */}
              <rect width="120" height="120" fill="#0B1728" />

              {/* Interlocking Geometric Chevron Grid (تسطير سلاسل قميص المنتخب) */}
              <path
                d="M0,30 L30,0 L60,30 L90,0 L120,30 L90,60 L120,90 L90,120 L60,90 L30,120 L0,90 L30,60 Z"
                fill="#071220"
                stroke="#00C2CB"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Radiating Darts / Arrows (سفائن وسواسن زليج قميص المنتخب) */}
              {/* Cardinal Darts in Hi-Res Aqua */}
              <polygon points="60,32 54,16 60,6 66,16" fill="#00C2CB" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="60,88 54,104 60,114 66,104" fill="#00C2CB" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="32,60 16,54 6,60 16,66" fill="#00C2CB" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="88,60 104,54 114,60 104,66" fill="#00C2CB" stroke="#FFFFFF" strokeWidth="0.8" />

              {/* Diagonal Darts in Bold Gold */}
              <polygon points="40.2,40.2 28,32 20,20 32,28" fill="#FFD100" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="79.8,40.2 88,28 100,20 92,32" fill="#FFD100" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="40.2,79.8 32,92 20,100 28,88" fill="#FFD100" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="79.8,79.8 92,88 100,100 88,92" fill="#FFD100" stroke="#FFFFFF" strokeWidth="0.8" />

              {/* Interlocking Diamond Lozenges (معينات الزليج الخزفي) */}
              <polygon points="60,6 74,16 60,26 46,16" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="60,114 74,104 60,94 46,104" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="6,60 16,46 26,60 16,74" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="0.8" />
              <polygon points="114,60 104,46 94,60 104,74" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="0.8" />

              {/* Algerian Flag Emerald Green Lozenges */}
              <polygon points="30,30 40,30 35,40" fill="#059669" stroke="#FFFFFF" strokeWidth="0.6" />
              <polygon points="90,30 80,30 85,40" fill="#059669" stroke="#FFFFFF" strokeWidth="0.6" />
              <polygon points="30,90 40,90 35,80" fill="#059669" stroke="#FFFFFF" strokeWidth="0.6" />
              <polygon points="90,90 80,90 85,80" fill="#059669" stroke="#FFFFFF" strokeWidth="0.6" />

              {/* Techno Red & Flag Accent Diamonds */}
              <polygon points="60,39 66,47 60,53 54,47" fill="#E30613" stroke="#FFD100" strokeWidth="0.8" />
              <polygon points="60,81 66,73 60,67 54,73" fill="#E30613" stroke="#FFD100" strokeWidth="0.8" />
              <polygon points="39,60 47,54 53,60 47,66" fill="#E30613" stroke="#FFD100" strokeWidth="0.8" />
              <polygon points="81,60 73,54 67,60 73,66" fill="#E30613" stroke="#FFD100" strokeWidth="0.8" />

              {/* Center 8-Point Rosette (النجمة الثمانية المركزية لقميص المنتخب) */}
              <g transform="translate(60,60)">
                {/* Layer 1: Outer Star in Bold Gold */}
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#FFD100"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                {/* Layer 2: Middle Star in Hi-Res Aqua */}
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#00C2CB"
                  stroke="#0B1728"
                  strokeWidth="1"
                />
                {/* Layer 3: Inner Star in Crisp White */}
                <polygon
                  points="0,-10 3,-7 7,-7 7,-3 10,0 7,3 7,7 3,7 0,10 -3,7 -7,7 -7,3 -10,0 -7,-3 -7,-7 -3,-7"
                  fill="#FFFFFF"
                  stroke="#E30613"
                  strokeWidth="0.8"
                />
                {/* Central Jewel in Techno Red */}
                <circle cx="0" cy="0" r="3.5" fill="#E30613" stroke="#FFD100" strokeWidth="1" />
              </g>

              {/* Corner 8-Point Stars (Seamless interlocking across all 4 corners) */}
              {/* Corner 1: (0,0) */}
              <g transform="translate(0,0)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#00C2CB"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#FFD100"
                  stroke="#0B1728"
                  strokeWidth="1"
                />
                <polygon
                  points="0,-10 3,-7 7,-7 7,-3 10,0 7,3 7,7 3,7 0,10 -3,7 -7,7 -7,3 -10,0 -7,-3 -7,-7 -3,-7"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="0.8"
                />
                <circle cx="0" cy="0" r="3.5" fill="#059669" stroke="#FFD100" strokeWidth="1" />
              </g>

              {/* Corner 2: (120,0) */}
              <g transform="translate(120,0)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#00C2CB"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#FFD100"
                  stroke="#0B1728"
                  strokeWidth="1"
                />
                <polygon
                  points="0,-10 3,-7 7,-7 7,-3 10,0 7,3 7,7 3,7 0,10 -3,7 -7,7 -7,3 -10,0 -7,-3 -7,-7 -3,-7"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="0.8"
                />
                <circle cx="0" cy="0" r="3.5" fill="#059669" stroke="#FFD100" strokeWidth="1" />
              </g>

              {/* Corner 3: (0,120) */}
              <g transform="translate(0,120)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#00C2CB"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#FFD100"
                  stroke="#0B1728"
                  strokeWidth="1"
                />
                <polygon
                  points="0,-10 3,-7 7,-7 7,-3 10,0 7,3 7,7 3,7 0,10 -3,7 -7,7 -7,3 -10,0 -7,-3 -7,-7 -3,-7"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="0.8"
                />
                <circle cx="0" cy="0" r="3.5" fill="#059669" stroke="#FFD100" strokeWidth="1" />
              </g>

              {/* Corner 4: (120,120) */}
              <g transform="translate(120,120)">
                <polygon
                  points="0,-24 7,-17 17,-17 17,-7 24,0 17,7 17,17 7,17 0,24 -7,17 -17,17 -17,7 -24,0 -17,-7 -17,-17 -7,-17"
                  fill="#00C2CB"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,-16 5,-11 11,-11 11,-5 16,0 11,5 11,11 5,11 0,16 -5,11 -11,11 -11,5 -16,0 -11,-5 -11,-11 -5,-11"
                  fill="#FFD100"
                  stroke="#0B1728"
                  strokeWidth="1"
                />
                <polygon
                  points="0,-10 3,-7 7,-7 7,-3 10,0 7,3 7,7 3,7 0,10 -3,7 -7,7 -7,3 -10,0 -7,-3 -7,-7 -3,-7"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="0.8"
                />
                <circle cx="0" cy="0" r="3.5" fill="#059669" stroke="#FFD100" strokeWidth="1" />
              </g>

              {/* Subtle White Mortar Joint Lines */}
              <rect x="0" y="0" width="120" height="120" fill="none" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#algeria-jersey-zellige)" />
        </svg>
      </div>

      {/* Decorative Cyan and Gold Radial Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00C2CB]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FFD100]/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Algerian Zellige Frieze (إفريز زليج قميص المنتخب الوطني الجزائري) */}
      <div className="relative z-10 w-full bg-[#081526]/95 backdrop-blur-md border-b-2 border-[#00C2CB]/60 py-2.5 px-4 select-none shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[#FFD100] text-xs font-bold">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C2CB] border border-white animate-pulse" />
            <span className="font-display font-black tracking-wide text-white">
              زليج قميص المنتخب الوطني الجزائري (قصر المشور) · فرع الأغواط
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-stone-200 text-xs font-medium">
            <span className="text-[#00C2CB]">✦</span>
            <span>أصالة وتراث جزائري 100%</span>
            <span className="text-[#FFD100]">✦</span>
            <span>25 سنة من الخدمة والوفاء</span>
            <span className="text-[#00C2CB]">✦</span>
            <span>توصيل رسمي لـ 69 ولاية عبر ZR Express</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="stamp-yellow text-[10px] font-black py-0.5 px-2.5 border border-[#00C2CB]">
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

      {/* 3. Main Content Cards over Algerian Jersey Zellige (ألواح زليج قميص المنتخب) */}
      <div className="relative z-10 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Column 1: About the Branch (لوح فرع تكنو الأغواط) */}
            <div className="p-6 rounded-3xl bg-[#081526]/85 backdrop-blur-md border-2 border-[#00C2CB]/40 hover:border-[#FFD100] transition-colors shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#00C2CB] text-sm">✦</span>
                  <h3 className="font-display text-sm font-black text-[#00C2CB] uppercase tracking-wider">
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

              <div className="p-3.5 rounded-2xl bg-black/40 border border-[#00C2CB]/30 flex items-center gap-2.5 text-xs text-stone-200">
                <ShieldCheck className="w-5 h-5 text-[#FFD100] shrink-0" />
                <div>
                  <span className="font-black text-white block">ضمان الأصالة 100%</span>
                  <span className="text-[11px] text-stone-300">معتمد وموثق من تكنو الجزائر</span>
                </div>
              </div>
            </div>

            {/* Column 2: Main Store Categories (Synced from Telegram, max 6) */}
            <div className="p-6 rounded-3xl bg-[#081526]/85 backdrop-blur-md border-2 border-[#00C2CB]/40 hover:border-[#FFD100] transition-colors shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#00C2CB]/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#00C2CB] text-sm">✦</span>
                  <h3 className="font-display text-sm font-black text-[#00C2CB] uppercase tracking-wider">
                    أقسام المتجر
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#00C2CB] bg-black/50 px-2 py-0.5 rounded border border-[#00C2CB]/40 font-bold">
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
                      className="group flex items-center justify-between p-2 rounded-xl bg-black/35 hover:bg-[#FFD100] border border-white/10 hover:border-[#FFD100] text-stone-200 hover:text-[#18181B] font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C2CB] group-hover:bg-[#18181B] transition-colors" />
                        <span>{cat.name}</span>
                      </span>
                      <ChevronLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#18181B] group-hover:-translate-x-1 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Logistics & ZR Express (لوح خدمات الشحن) */}
            <div className="p-6 rounded-3xl bg-[#081526]/85 backdrop-blur-md border-2 border-[#00C2CB]/40 hover:border-[#FFD100] transition-colors shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#00C2CB]/30 pb-3">
                <span className="text-[#00C2CB] text-sm">✦</span>
                <h3 className="font-display text-sm font-black text-[#00C2CB] uppercase tracking-wider">
                  التوصيل والخدمات
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-black/35 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-[#00C2CB] font-bold">
                    <Truck className="w-4 h-4 shrink-0 text-[#00C2CB]" />
                    <span className="text-white">شحن رسمي عبر ZR Express</span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    تغطية رسمية لـ 69 ولاية جزائرية مع تسليم لباب المنزل أو للمكتب.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#E30613]/25 border border-[#E30613]/50 space-y-1">
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FFD100] hover:bg-[#E5BC00] text-[#18181B] text-xs font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#00C2CB] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#E30613] animate-pulse" />
                  <span>فحص ومتابعة حالة الطلب</span>
                </a>
              </div>
            </div>

            {/* Column 4: Physical Branch Desk Card (لوح الفرع الميداني) */}
            <div className="p-6 rounded-3xl bg-[#081526]/85 backdrop-blur-md border-2 border-[#00C2CB]/40 hover:border-[#FFD100] transition-colors shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#00C2CB]/30 pb-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#00C2CB]">
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
                    <Clock className="w-4 h-4 text-[#00C2CB] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[#00C2CB] block">أوقات الاستقبال:</span>
                      <span className="text-white font-bold">{STORE_INFO.hours}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#00C2CB]/30">
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

          {/* 4. Bottom Algerian Jersey Zellige Barcode & Certification Strip */}
          <div className="mt-12 pt-8 border-t border-[#00C2CB]/30 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-300">
            <div className="flex items-center gap-3">
              {/* Ceramic Dispatch Barcode */}
              <div className="px-2.5 py-1 rounded-lg bg-white text-[#18181B] border border-[#00C2CB] font-mono tracking-widest text-[11px] font-black select-none shadow-sm">
                ||| | |||| | || | ||| ||
              </div>
              <div>
                <p className="font-bold text-white">
                  {STORE_INFO.fullTitle}
                </p>
                <p className="text-[11px] text-[#00C2CB] mt-0.5 font-medium">
                  طابع زليج قميص المنتخب الوطني الجزائري (قصر المشور) · 25 سنة حكاية أجيال ومازال
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
