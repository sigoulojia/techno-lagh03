import { useState, useEffect } from 'react';
import { Phone, Truck, Sparkles, MapPin, ChevronLeft, ChevronRight, Briefcase, Clock } from 'lucide-react';
import { STORE_INFO } from '../data/products';

const FACES = [
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
    id: 'hours',
    icon: Clock,
    badge: 'أوقات العمل',
    text: 'نستقبلكم من السبت إلى الخميس: 08:30 صباحاً – 20:00 مساءً (الجمعة عطلة)',
    cta: 'مفتوح للخدمة',
  },
];

// Hexagonal Prism geometry:
// 6 faces, face height = 40px
// apothem R = 40 / (2 * tan(30deg)) = 34.64px
const FACE_HEIGHT = 40;
const RADIUS = 34.64;

export function AnnouncementBar() {
  const [step, setStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <div
      aria-label="قلم الرصاص الأخضر الكلاسيكي ثلاثي الأبعاد"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full relative overflow-hidden select-none z-30 shadow-md bg-[#05160E]"
      style={{
        height: `${FACE_HEIGHT}px`,
        perspective: '1200px',
      }}
    >
      {/* =========================================================================
          1. 3D HEXAGONAL ROLLING PENCIL SHAFT (جسم قلم الرصاص الأخضر السداسي ثلاثي الأبعاد)
          Spans 100% full width across the entire screen from edge to edge
          ========================================================================= */}
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${step * 60}deg)`,
          transition: 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {FACES.map((face, i) => {
          const Icon = face.icon;
          const faceAngle = -i * 60;

          return (
            <div
              key={face.id}
              className="absolute inset-0 w-full flex items-center justify-between px-3 sm:px-6"
              style={{
                height: `${FACE_HEIGHT}px`,
                transformStyle: 'preserve-3d',
                transform: `rotateX(${faceAngle}deg) translateZ(${RADIUS}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                // Photorealistic Stationery Green Pencil Lacquer
                background: 'linear-gradient(180deg, #1C5133 0%, #123C25 45%, #0B2A19 85%, #06190F 100%)',
                borderTop: '1px solid rgba(74, 184, 122, 0.35)',
                borderBottom: '1px solid #031008',
              }}
            >
              {/* Right Side: Gold Stamped Pencil Grade Label */}
              <div className="flex items-center gap-2 shrink-0 z-10 pr-8 sm:pr-12">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-[#D4AF37]/50 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD100] animate-pulse" />
                  <span className="font-mono text-[10px] font-black text-[#FFD100] tracking-wider uppercase">
                    TECHNO · 2B
                  </span>
                </div>
              </div>

              {/* Center: The Announcement Stamped on the Pencil Face */}
              <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0 px-2 text-center z-10">
                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD100] to-[#E5A800] text-[#0B2B1B] text-[10px] sm:text-[11px] font-black shadow-xs flex items-center gap-1">
                  <Icon className="w-3 h-3 text-[#0B2B1B]" />
                  <span>{face.badge}</span>
                </span>
                <p className="truncate text-xs sm:text-[13px] font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {face.text}
                </p>
              </div>

              {/* Left Side: Direct Action & Manual Controls */}
              <div className="flex items-center gap-2 shrink-0 z-10 pl-8 sm:pl-12">
                {face.href ? (
                  <a
                    href={face.href}
                    dir="ltr"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E30613] hover:bg-[#C4000F] text-white text-[11px] font-mono font-black border border-[#D4AF37]/60 shadow-xs transition-colors cursor-pointer"
                  >
                    <Phone className="w-3 h-3 text-[#FFD100]" />
                    <span>{face.cta}</span>
                  </a>
                ) : (
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-black/35 border border-white/10 text-[11px] font-bold text-[#FFD100]">
                    {face.cta}
                  </span>
                )}

                {/* Stepper Buttons to rotate the pencil */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="الضلع السابق"
                    className="p-1 rounded hover:bg-white/15 text-[#FFD100] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="الضلع التالي"
                    className="p-1 rounded hover:bg-white/15 text-[#FFD100] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          2. RIGHT END: REALISTIC SHARPENED WOODEN PENCIL CONE & GRAPHITE POINT
          Extending to the extreme right edge of the screen
          ========================================================================= */}
      <div className="absolute top-0 right-0 h-full flex items-center pointer-events-none z-20">
        <svg
          className="h-full w-10 sm:w-14"
          viewBox="0 0 56 40"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Cedar Wood Natural Grain Gradient */}
            <linearGradient id="cedar-wood-grain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0D3B0" />
              <stop offset="30%" stopColor="#DFB689" />
              <stop offset="65%" stopColor="#CA9B68" />
              <stop offset="100%" stopColor="#9C7245" />
            </linearGradient>
            {/* Graphite Lead Metallic Sheen */}
            <linearGradient id="graphite-lead" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="45%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0B111A" />
            </linearGradient>
          </defs>

          {/* Sharpened Cedar Wood Cone */}
          <path
            d="M56 0 L16 16 C12 19 12 21 16 24 L56 40 Z"
            fill="url(#cedar-wood-grain)"
            stroke="#9C7245"
            strokeWidth="0.8"
          />

          {/* Scalloped sharpener blade cuts */}
          <path
            d="M56 0 C50 8 47 13 56 20 C47 27 50 32 56 40"
            fill="#123C25"
            stroke="#06190F"
            strokeWidth="1"
          />

          {/* Wood grain lines */}
          <line x1="28" y1="16" x2="52" y2="8" stroke="#B38656" strokeWidth="0.6" strokeDasharray="3,2" />
          <line x1="28" y1="24" x2="52" y2="32" stroke="#B38656" strokeWidth="0.6" strokeDasharray="3,2" />

          {/* Graphite Lead Point */}
          <polygon points="16,16 0,20 16,24" fill="url(#graphite-lead)" stroke="#0F172A" strokeWidth="0.6" />
          {/* Graphite shine */}
          <polygon points="10,18 2,20 10,21" fill="#64748B" opacity="0.6" />
        </svg>
      </div>

      {/* =========================================================================
          3. LEFT END: REALISTIC GOLDEN BRASS FERRULE & GREEN DIPPED CROWN
          Extending to the extreme left edge of the screen
          ========================================================================= */}
      <div className="absolute top-0 left-0 h-full flex items-center pointer-events-none z-20">
        <div
          className="h-full w-8 sm:w-10 flex items-center justify-between px-1 border-r border-[#8A6D1B]"
          style={{
            background: 'linear-gradient(90deg, #99751A 0%, #D4AF37 30%, #FFE58F 60%, #B38F24 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.4)',
          }}
        >
          {/* Ribbed ferrule grooves */}
          <div className="w-[1.5px] h-3/4 bg-[#5A450F]/50 rounded-full" />
          <div className="w-[1.5px] h-3/4 bg-[#5A450F]/50 rounded-full" />
          <div className="w-[1.5px] h-3/4 bg-[#5A450F]/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}
