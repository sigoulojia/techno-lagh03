import { useState, useEffect } from 'react';
import { Phone, Truck, Sparkles, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STORE_INFO } from '../data/products';

const ANNOUNCEMENTS = [
  {
    id: 'branch',
    icon: MapPin,
    highlight: 'فرع الأغواط الرسمي',
    text: 'حي المقام بجانب المقبرة — وسط المدينة، الأغواط · أوقات العمل: من السبت إلى الخميس',
    ctaText: 'وسط المدينة',
  },
  {
    id: 'contact',
    icon: Phone,
    highlight: 'خدمة الزبائن المباشرة',
    text: 'للطلب المباشر أو الاستفسار السريع تواصلوا معنا هاتفياً أو عبر واتساب: 0560 15 46 63',
    ctaText: '0560 15 46 63',
    href: STORE_INFO.phoneHref,
  },
  {
    id: 'shipping',
    icon: Truck,
    highlight: 'شحن ZR Express',
    text: 'توصيل رسمي سريع لكافة بلديات الأغواط (24 بلدية) وإلى 69 ولاية مع الدفع عند الاستلام',
    ctaText: '69 ولاية',
  },
  {
    id: 'heritage',
    icon: Sparkles,
    highlight: 'تكنو ستيشنري',
    text: 'الفرع الرسمي المعتمد لعلامة تكنو ستيشنري بالأغواط — 25 سنة حكاية أجيال ومازال',
    ctaText: 'أصلي 100%',
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
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
      aria-label="شريط قلم الرصاص الأخضر للإعلانات"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative select-none overflow-hidden z-30 shadow-md"
      style={{
        // Iconic Classic Hexagonal Green Pencil Lacquer Gradient (أخضر قلم الرصاص الكلاسيكي الشهير)
        background: 'linear-gradient(180deg, #1A4D32 0%, #113B25 45%, #0B2B1B 80%, #061F13 100%)',
        borderBottom: '2px solid #D4AF37',
      }}
    >
      {/* Hexagonal Pencil Longitudinal Facet Highlights (تجسيم أضلاع قلم الرصاص السداسي) */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-[#348A5B]/60 pointer-events-none" />
      <div className="absolute inset-x-0 top-[35%] h-[1px] bg-white/10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#05180E] pointer-events-none" />

      {/* Subtle wood grain and lacquer sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-2 min-h-[38px] sm:min-h-[42px] relative z-10 text-white">
        
        {/* =========================================================================
            RIGHT SIDE: Sharpened Wooden Pencil Tip (رأس قلم الرصاص المبري بخشب الأرز)
            ========================================================================= */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Visual Sharpened Pencil Tip Graphic */}
          <div className="relative flex items-center shrink-0" title="قلم تكنو الأغواط 2B">
            <svg
              className="w-10 sm:w-12 h-6 sm:h-7"
              viewBox="0 0 56 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Natural Cedar Wood Cone (خشب الأرز المبري) */}
              <path
                d="M56 2 L22 10 C18 12 16 16 22 18 L56 26 Z"
                fill="#E2C29B"
                stroke="#B88650"
                strokeWidth="0.8"
              />
              {/* Scalloped sharpener cuts (تسنيم المبراة الدائري) */}
              <path
                d="M56 2 C52 7 50 11 56 14 C50 17 52 21 56 26"
                fill="#0F3822"
                stroke="#092415"
                strokeWidth="1"
              />
              {/* Woodgrain details */}
              <line x1="28" y1="12" x2="48" y2="7" stroke="#C49A6C" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="28" y1="16" x2="48" y2="21" stroke="#C49A6C" strokeWidth="0.6" strokeDasharray="2,2" />
              {/* Graphite Lead Point (سن الجرافيت الأسود) */}
              <polygon points="22,10 8,14 22,18" fill="#182230" stroke="#0F172A" strokeWidth="0.8" />
              <polygon points="12,13 6,14 12,15" fill="#334155" />
            </svg>
          </div>

          {/* Golden Hot-Stamp Badge (الختم الذهبي المحفور على قلم الرصاص) */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/35 border border-[#D4AF37]/50 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD100] animate-pulse" />
            <span className="font-mono text-[10px] font-black text-[#FFD100] tracking-wider uppercase">
              TECHNO 03 · 2B
            </span>
          </div>
        </div>

        {/* =========================================================================
            CENTER: 3D Rolling Hexagonal Facet Animation (دوران قلم الرصاص وتقلب الجمل)
            ========================================================================= */}
        <div
          className="flex-1 flex items-center justify-center min-w-0 px-1 sm:px-4"
          style={{ perspective: '900px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ rotateX: 90, opacity: 0, y: -10 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              exit={{ rotateX: -90, opacity: 0, y: 10 }}
              transition={{
                duration: 0.55,
                ease: [0.25, 1, 0.5, 1], // Smooth mechanical roll of a pencil facet
              }}
              className="flex items-center justify-center gap-2 sm:gap-3 text-center min-w-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Golden Embossed Tag */}
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFD100] to-[#E5A800] text-[#0B2B1B] text-[10px] sm:text-[11px] font-black shadow-sm flex items-center gap-1">
                <Icon className="w-3 h-3 text-[#0B2B1B]" />
                <span>{active.highlight}</span>
              </span>

              {/* Rolling Sentence Text */}
              <p className="truncate text-xs sm:text-[13px] font-bold text-stone-100 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {active.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* =========================================================================
            LEFT SIDE: Pencil Brass Ferrule & Quick Call (الحلقة المعدنية الذهبية والاتصال)
            ========================================================================= */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Action Link if available */}
          {active.href ? (
            <a
              href={active.href}
              dir="ltr"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E30613] hover:bg-[#C4000F] text-white text-[11px] font-mono font-black border border-[#D4AF37]/60 shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-3 h-3 text-[#FFD100]" />
              <span>{active.ctaText}</span>
            </a>
          ) : (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-black/30 border border-white/10 text-[11px] font-bold text-[#FFD100]">
              {active.ctaText}
            </span>
          )}

          {/* Stepper Chevron Buttons (تدوير قلم الرصاص يدوياً) */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="الجملة السابقة"
              className="p-1 rounded hover:bg-white/15 text-[#FFD100] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="الجملة التالية"
              className="p-1 rounded hover:bg-white/15 text-[#FFD100] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gold Ribbed Ferrule & Pencil Cap End (عقب قلم الرصاص المعدني المذهب) */}
          <div
            className="hidden sm:flex items-center justify-center h-6 px-1.5 rounded-l bg-gradient-to-r from-[#D4AF37] via-[#FFE27D] to-[#D4AF37] border-l-2 border-y border-[#B38F24] text-[#4A3B0A] shadow-xs select-none"
            title="نهاية قلم الرصاص الذهبية"
          >
            <div className="flex gap-0.5">
              <span className="w-0.5 h-4 bg-[#8A6D1B]/40 rounded-full" />
              <span className="w-0.5 h-4 bg-[#8A6D1B]/40 rounded-full" />
              <span className="w-0.5 h-4 bg-[#8A6D1B]/40 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
