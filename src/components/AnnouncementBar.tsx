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
          1. 3D HEXAGONAL ROLLING PENCIL SHAFT (جسم قلم الرصاص الأخضر ثلاثي الأبعاد)
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
              {/* Right Side: Gold Stamped Pencil Grade Label (clear of the tip) */}
              <div className="flex items-center gap-2 shrink-0 z-10 pr-12 sm:pr-16">
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

              {/* Left Side: Direct Action & Manual Controls (clear of the eraser) */}
              <div className="flex items-center gap-2 shrink-0 z-10 pl-16 sm:pl-22">
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
          2. RIGHT END: REALISTIC SHARPENED WOODEN PENCIL TIP (رأس القلم المبري الصحيح)
          Points outwards towards the right edge of the screen
          ========================================================================= */}
      <div className="absolute top-0 right-0 h-full flex items-center pointer-events-none z-20">
        <svg
          className="h-full w-12 sm:w-16"
          viewBox="0 0 60 40"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Natural Cedar Wood Grain Gradient */}
            <linearGradient id="cedar-wood-correct" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C99B68" />
              <stop offset="25%" stopColor="#E5BE90" />
              <stop offset="60%" stopColor="#DFB689" />
              <stop offset="100%" stopColor="#A87A4A" />
            </linearGradient>

            {/* Graphite Metallic Sheen Gradient */}
            <linearGradient id="graphite-correct" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0B111A" />
            </linearGradient>
          </defs>

          {/* Sharpened Cedar Wood Cone: Base at x=0, tapering outward to x=38 */}
          <path
            d="M0,0 C6,7 8,14 0,20 C8,26 6,33 0,40 L38,26 C38,26 39,20 38,14 Z"
            fill="url(#cedar-wood-correct)"
            stroke="#9C7245"
            strokeWidth="0.8"
          />

          {/* Green lacquer scalloped border at x=0 */}
          <path
            d="M0,0 C6,7 8,14 0,20 C8,26 6,33 0,40"
            stroke="#06190F"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Subtle natural woodgrain lines */}
          <line x1="4" y1="10" x2="32" y2="17" stroke="#A87A4A" strokeWidth="0.6" strokeDasharray="3,2" />
          <line x1="4" y1="30" x2="32" y2="23" stroke="#A87A4A" strokeWidth="0.6" strokeDasharray="3,2" />

          {/* Graphite Lead Point: Base at x=38, sharp tip pointing right to x=58, y=20 */}
          <polygon
            points="38,14 58,20 38,26"
            fill="url(#graphite-correct)"
            stroke="#0F172A"
            strokeWidth="0.8"
          />
          {/* Graphite top highlight shine */}
          <line x1="38" y1="16" x2="55" y2="20" stroke="#64748B" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      </div>

      {/* =========================================================================
          3. LEFT END: CLASSIC RED RUBBER ERASER & GOLDEN BRASS FERRULE (الممحاة الحمراء)
          Extending to the extreme left edge of the screen
          ========================================================================= */}
      <div className="absolute top-0 left-0 h-full flex items-center pointer-events-none z-20">
        
        {/* Red / Coral Pink Rubber Pencil Eraser (الممحاة الحمراء الكلاسيكية الشهيرة) */}
        <div
          className="h-[34px] w-7 sm:w-9 rounded-l-md flex items-center justify-center border-l-2 border-y border-[#991B1B] shadow-sm ml-0.5"
          style={{
            // Authentic Classic Red Pencil Eraser Rubber Texture & 3D Shading
            background: 'linear-gradient(180deg, #F87171 0%, #E11D48 30%, #BE123C 75%, #881337 100%)',
            boxShadow: 'inset 0 1.5px 2px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.5)',
          }}
          title="ممحاة قلم الرصاص الحمراء الكلاسيكية"
        >
          {/* Subtle rubber eraser matte highlight */}
          <div className="w-full h-1 bg-white/20 -mt-4 rounded-full" />
        </div>

        {/* Golden Brass Ferrule Band (الحلقة النحاسية الذهبية المضلعة المثبتة للممحاة) */}
        <div
          className="h-full w-6 sm:w-7 flex items-center justify-between px-1 border-r border-[#7D5D0D] -ml-[1px]"
          style={{
            background: 'linear-gradient(90deg, #99751A 0%, #D4AF37 35%, #FFE58F 65%, #B38F24 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.4)',
          }}
          title="الحلقة المعدنية الذهبية"
        >
          {/* Ribbed crimp grooves in the brass ferrule */}
          <div className="w-[1px] h-3/4 bg-[#5A450F]/60 rounded-full" />
          <div className="w-[1.5px] h-3/4 bg-[#5A450F]/70 rounded-full" />
          <div className="w-[1px] h-3/4 bg-[#5A450F]/60 rounded-full" />
        </div>

      </div>
    </div>
  );
}
