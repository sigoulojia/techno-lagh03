import { useState, useEffect } from 'react';
import { Phone, Truck, Sparkles, MapPin, ChevronLeft, ChevronRight, Briefcase, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STORE_INFO } from '../data/products';

const ANNOUNCEMENTS = [
  {
    id: 'branch',
    icon: MapPin,
    badge: 'فرع الأغواط الرسمي',
    text: 'حي المقام بجانب المقبرة — وسط المدينة، الأغواط',
    cta: 'وسط المدينة',
  },
  {
    id: 'contact',
    icon: Phone,
    badge: 'خدمة الزبائن',
    text: 'للطلب المباشر أو الاستفسار السريع تواصلوا معنا هاتفياً أو عبر واتساب: 0560 15 46 63',
    cta: '0560 15 46 63',
    href: STORE_INFO.phoneHref,
  },
  {
    id: 'shipping',
    icon: Truck,
    badge: 'شحن ZR Express',
    text: 'توصيل رسمي سريع لكافة بلديات الأغواط (24 بلدية) وإلى 69 ولاية جزائرية مع الدفع عند الاستلام',
    cta: '69 ولاية',
  },
  {
    id: 'heritage',
    icon: Sparkles,
    badge: 'تكنو ستيشنري',
    text: 'الفرع الرسمي المعتمد لعلامة تكنو ستيشنري بالأغواط — 25 سنة حكاية أجيال ومازال',
    cta: 'أصلي 100%',
  },
  {
    id: 'wholesale',
    icon: Briefcase,
    badge: 'تجهيز المكاتب',
    text: 'طلبات الجملة والمؤسسات والشركات مع استشارة وتوفير كامل القياسات والأدوات',
    cta: 'تجهيز شركات',
  },
  {
    id: 'vip-card',
    icon: Sparkles,
    badge: 'بطاقة الوفاء VIP',
    text: 'احصل على بطاقتك الافتراضية الخاصة مع نقاط مشتريات وتخفيض فوري بالفرع الميداني',
    cta: 'بطاقتي VIP',
    href: '#vip-card',
  },
  {
    id: 'hours',
    icon: Clock,
    badge: 'أوقات العمل',
    text: 'نستقبلكم من السبت إلى الخميس: 08:30 صباحاً – 20:00 مساءً (الجمعة عطلة)',
    cta: 'مفتوح للخدمة',
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const active = ANNOUNCEMENTS[currentIndex];
  const Icon = active.icon;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  return (
    <aside
      aria-label="قلم الرصاص الكلاسيكي الأخضر ثلاثي الأبعاد"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full relative select-none z-30 overflow-hidden bg-white border-b border-stone-200 shadow-xs"
    >
      {/* 
        Explicit dir="ltr" container:
        Ensures the physical layout of the pencil is ALWAYS correct regardless of document RTL:
        [LEFT: Red Eraser -> Brass Ferrule] -> [MIDDLE: Green Hexagonal Shaft] -> [RIGHT: Cedar Cone -> Graphite Tip]
      */}
      <div
        dir="ltr"
        className="w-full h-[42px] sm:h-[44px] flex items-center bg-white relative px-1 sm:px-2"
      >
        {/* =========================================================================
            1. LEFT END: CLASSIC RED RUBBER ERASER & GOLDEN BRASS FERRULE
            الممحاة الحمراء الكلاسيكية في أقصى اليسار مع نهايتها الدائرية نحو الخارج
            ========================================================================= */}
        <div className="flex items-center shrink-0 pl-1 sm:pl-2">
          {/* Classic Red / Coral Rubber Eraser (الممحاة الحمراء بنهايتها الدائرية لليسار) */}
          <div
            className="h-[28px] sm:h-[30px] w-7 sm:w-10 rounded-l-lg flex items-center justify-center border-l-2 border-y border-[#991B1B] relative overflow-hidden shadow-sm"
            style={{
              background: 'linear-gradient(180deg, #F87171 0%, #E11D48 35%, #BE123C 75%, #881337 100%)',
              boxShadow: 'inset 0 1.5px 2px rgba(255,255,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.3)',
            }}
            title="ممحاة قلم الرصاص الحمراء الكلاسيكية"
          >
            {/* Rubber cylindrical light reflection */}
            <div className="w-full h-[2px] bg-white/40 absolute top-1 inset-x-0 rounded-full" />
          </div>

          {/* Golden Brass Ferrule Band (الحلقة النحاسية المذهبة المضلعة) */}
          <div
            className="h-[36px] sm:h-[38px] w-6 sm:w-7 flex items-center justify-evenly px-0.5 border-y border-[#B38F24] -ml-[1px] relative shadow-xs"
            style={{
              background: 'linear-gradient(180deg, #FFE58F 0%, #D4AF37 30%, #B38F24 70%, #7D5D0D 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.3)',
            }}
            title="الحلقة المعدنية الذهبية المثبتة للممحاة"
          >
            <div className="w-[1.5px] h-3/4 bg-[#5A430A]/60 rounded-full" />
            <div className="w-[1.5px] h-3/4 bg-[#5A430A]/60 rounded-full" />
            <div className="w-[1.5px] h-3/4 bg-[#5A430A]/60 rounded-full" />
          </div>
        </div>

        {/* =========================================================================
            2. CENTER: 3D HEXAGONAL GREEN PENCIL SHAFT
            جسم قلم الرصاص الأخضر السداسي بأضلاعه الثلاثية الأبعاد والكتابة الذهبية
            ========================================================================= */}
        <div className="flex-1 h-[36px] sm:h-[38px] flex flex-col justify-between relative overflow-hidden border-y border-[#0B331A] shadow-xs">
          
          {/* Top Hexagonal Highlight Facet (الضلع العلوي المجسم المنعكس للضوء) */}
          <div
            className="w-full h-[7px] sm:h-[8px] border-b border-[#2C8552]/40"
            style={{
              background: 'linear-gradient(180deg, #2D8A53 0%, #1F693E 100%)',
            }}
          />

          {/* Center Main Facet (الضلع الأوسط الرئيسي الحامل للكتابة) */}
          <div
            className="w-full flex-1 flex items-center justify-between px-2 sm:px-4 relative"
            style={{
              background: 'linear-gradient(180deg, #185230 0%, #113F24 100%)',
            }}
          >
            {/* Grade Stamp on Left (الختم الذهبي المحفور على قلم الرصاص) */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#092615]/80 border border-[#D4AF37]/50 shadow-inner shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD100] animate-pulse" />
              <span className="font-mono text-[10px] font-black text-[#FFD100] tracking-wider uppercase">
                TECHNO · 2B
              </span>
            </div>

            {/* 3D Rolling Text Container in Arabic RTL */}
            <div
              dir="rtl"
              className="flex-1 flex items-center justify-center min-w-0 px-2 sm:px-4"
              style={{ perspective: '800px' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ rotateX: 90, opacity: 0, y: -8 }}
                  animate={{ rotateX: 0, opacity: 1, y: 0 }}
                  exit={{ rotateX: -90, opacity: 0, y: 8 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1], // Smooth mechanical roll
                  }}
                  className="flex items-center justify-center gap-2 sm:gap-3 text-center min-w-0"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Golden Embossed Badge */}
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD100] to-[#E5A800] text-[#0B2B1B] text-[10px] sm:text-[11px] font-black shadow-xs flex items-center gap-1">
                    <Icon className="w-3 h-3 text-[#0B2B1B]" />
                    <span>{active.badge}</span>
                  </span>

                  {/* Hot-Stamped Sentence */}
                  <p className="truncate text-xs sm:text-[13px] font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {active.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls & Quick Call Button on Right */}
            <div className="flex items-center gap-2 shrink-0">
              {active.href ? (
                <a
                  href={active.href}
                  dir="ltr"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E30613] hover:bg-[#C4000F] text-white text-[11px] font-mono font-black border border-[#D4AF37]/60 shadow-xs transition-colors cursor-pointer"
                >
                  <Phone className="w-3 h-3 text-[#FFD100]" />
                  <span>{active.cta}</span>
                </a>
              ) : (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#092615]/80 border border-white/10 text-[11px] font-bold text-[#FFD100]">
                  {active.cta}
                </span>
              )}

              {/* Stepper Chevrons */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="الضلع السابق"
                  className="p-1 rounded hover:bg-white/15 text-[#FFD100] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="الضلع التالي"
                  className="p-1 rounded hover:bg-white/15 text-[#FFD100] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lower Shadow Facet (الضلع السفلي في الظل الواقعي) */}
          <div
            className="w-full h-[6px] sm:h-[7px] border-t border-[#0D2F1B]"
            style={{
              background: 'linear-gradient(180deg, #0E351E 0%, #092615 100%)',
            }}
          />
        </div>

        {/* =========================================================================
            3. RIGHT END: SHARPENED CEDAR WOOD CONE & GRAPHITE LEAD POINT
            رأس قلم الرصاص المبري بخشب الأرز وسن الجرافيت الحاد المتجه لليمين نحو الخارج
            ========================================================================= */}
        <div className="flex items-center shrink-0 pr-1 sm:pr-2 -ml-[1px]">
          {/* Realistic Sharpened Tip Graphic (pointing OUTWARDS to the right) */}
          <div className="relative flex items-center shrink-0" title="رأس قلم الرصاص المبري وسن الجرافيت">
            <svg
              className="h-[36px] sm:h-[38px] w-12 sm:w-16 select-none"
              viewBox="0 0 60 40"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Natural Cedar Wood Grain Gradient */}
                <linearGradient id="correct-cedar-cone" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C99B68" />
                  <stop offset="30%" stopColor="#E5BE90" />
                  <stop offset="65%" stopColor="#DFB689" />
                  <stop offset="100%" stopColor="#A87A4A" />
                </linearGradient>

                {/* Graphite Lead Metallic Sheen */}
                <linearGradient id="correct-graphite-point" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="50%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0B111A" />
                </linearGradient>
              </defs>

              {/* Sharpened Cedar Wood Cone: Base at x=0, tapering outward to x=38 */}
              <path
                d="M0,0 C6,7 8,14 0,20 C8,26 6,33 0,40 L38,26 C38,26 39,20 38,14 Z"
                fill="url(#correct-cedar-cone)"
                stroke="#9C7245"
                strokeWidth="0.8"
              />

              {/* Scalloped sharpener blade cuts where green lacquer meets wood */}
              <path
                d="M0,0 C6,7 8,14 0,20 C8,26 6,33 0,40"
                stroke="#0B331A"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Natural wood grain striations */}
              <line x1="4" y1="10" x2="32" y2="17" stroke="#A87A4A" strokeWidth="0.6" strokeDasharray="3,2" />
              <line x1="4" y1="30" x2="32" y2="23" stroke="#A87A4A" strokeWidth="0.6" strokeDasharray="3,2" />

              {/* Graphite Lead Point: Base at x=38, sharp tip pointing right to x=58, y=20 */}
              <polygon
                points="38,14 58,20 38,26"
                fill="url(#correct-graphite-point)"
                stroke="#0F172A"
                strokeWidth="0.8"
              />
              {/* Graphite specular glint reflection */}
              <line x1="38" y1="16" x2="55" y2="20" stroke="#64748B" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>
    </aside>
  );
}
