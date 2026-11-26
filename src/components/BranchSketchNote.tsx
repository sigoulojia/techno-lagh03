import React from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import { STORE_INFO } from '../data/products';

interface BranchSketchNoteProps {
  className?: string;
  mode?: 'grid-card' | 'standalone';
}

/**
 * BranchSketchNote — مذكرة الفرع التخطيطية
 * 
 * تحفة فنية تحاكي كراسة رسم وتخطيط هندسي حقيقية بقلم الرصاص (Graphite Sketchbook)
 * مع بقع ألوان مائية حيوية (Watercolor / Gouache Splatters)،
 * وقلم رصاص كلاسيكي ثلاثي الأبعاد مجسم ومبري بخشب الأرز وسن الجرافيت.
 */
export const BranchSketchNote: React.FC<BranchSketchNoteProps> = ({
  className = '',
  mode = 'grid-card',
}) => {
  return (
    <aside
      aria-label="مذكرة الفرع التخطيطية — رسم بقلم الرصاص"
      className={`relative select-none rounded-3xl overflow-hidden transition-all duration-300 ${
        mode === 'grid-card'
          ? 'flex flex-col justify-between p-6 sm:p-7 min-h-[480px]'
          : 'p-7 sm:p-9 max-w-4xl mx-auto my-8'
      } ${className}`}
      style={{
        backgroundColor: '#FBF9F4',
        backgroundImage: `
          radial-gradient(#D5CEBE 0.75px, transparent 0.75px),
          linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '16px 16px, 24px 24px, 24px 24px',
        border: '2.5px solid #334155',
        boxShadow: `
          inset 0 0 40px rgba(212, 196, 168, 0.35),
          inset 0 0 10px rgba(0, 0, 0, 0.03),
          5px 5px 0px #334155,
          7px 7px 0px rgba(51, 65, 85, 0.25)
        `,
      }}
    >
      {/* =========================================================================
          1. SPIRAL NOTEBOOK HOLES (ثقوب سلك كراسة الرسم الهندسية في الطرف الأيمن/الأيسر)
          ========================================================================= */}
      <div
        className="absolute top-0 bottom-0 right-2 w-4 flex flex-col justify-evenly pointer-events-none opacity-40 z-10"
        aria-hidden="true"
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#1E293B] shadow-inner border border-[#94A3B8]/50"
          />
        ))}
      </div>

      {/* =========================================================================
          2. WATERCOLOR / GOUACHE SPLATTERS (بقع وتلطخات الألوان المائية الفنية الحقيقية)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Red Watercolor Splatter (بقعة حبر / لون مائي أحمر تكنو فاقع) */}
        <svg
          className="absolute -top-6 -left-6 w-36 h-36 opacity-35 mix-blend-multiply drop-shadow-[0_2px_4px_rgba(227,6,19,0.2)]"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M95 35C125 20 155 45 160 70C165 95 185 110 170 135C155 160 120 175 90 165C60 155 40 180 25 150C10 120 20 90 35 65C50 40 65 50 95 35Z"
            fill="url(#red-splatter-gradient)"
          />
          {/* Satellite Droplets (قطرات رذاذ متناثرة) */}
          <circle cx="180" cy="55" r="4" fill="#E30613" />
          <circle cx="165" cy="30" r="2.5" fill="#E30613" />
          <circle cx="140" cy="18" r="3" fill="#E30613" />
          <circle cx="30" cy="170" r="3.5" fill="#E30613" />
          <circle cx="15" cy="140" r="2" fill="#E30613" />
          <circle cx="45" cy="190" r="2.5" fill="#E30613" />
          <defs>
            <radialGradient id="red-splatter-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C4000F" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#E30613" stopOpacity="0.65" />
              <stop offset="85%" stopColor="#FF4D4D" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF8080" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Golden Yellow Gouache Splatter (بقعة لون أصفر غواش مشرق) */}
        <svg
          className="absolute top-1/2 -right-8 w-32 h-32 opacity-40 mix-blend-multiply drop-shadow-[0_2px_4px_rgba(255,209,0,0.2)]"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 40C130 35 150 55 160 85C170 115 150 145 130 160C110 175 80 165 60 145C40 125 35 95 50 70C65 45 70 45 100 40Z"
            fill="url(#yellow-splatter-gradient)"
          />
          <circle cx="175" cy="160" r="4.5" fill="#E5BC00" />
          <circle cx="190" cy="140" r="2.5" fill="#FFD100" />
          <circle cx="155" cy="185" r="3" fill="#FFD100" />
          <circle cx="45" cy="50" r="3" fill="#FFD100" />
          <defs>
            <radialGradient id="yellow-splatter-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#FFD100" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#FEF08A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Cobalt Blue Ink Bleed (بقعة حبر أزرق هندسي رقيق في الأسفل) */}
        <svg
          className="absolute -bottom-8 left-10 w-28 h-28 opacity-30 mix-blend-multiply"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M85 45C115 35 145 50 155 75C165 100 150 130 135 150C120 170 85 165 65 150C45 135 35 105 45 80C55 55 55 55 85 45Z"
            fill="#2563EB"
          />
          <circle cx="165" cy="85" r="3" fill="#2563EB" />
          <circle cx="140" cy="45" r="2.5" fill="#2563EB" />
          <circle cx="35" cy="120" r="3" fill="#2563EB" />
        </svg>

        {/* Turquoise / Emerald Green Accent Drip (لطخة خضراء خفيفة) */}
        <div
          className="absolute top-20 right-16 w-12 h-12 rounded-full opacity-20 blur-[1px] mix-blend-multiply"
          style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }}
        />
      </div>

      {/* =========================================================================
          3. REALISTIC 3D GRAPHITE PENCIL (قلم الرصاص الواقعي ثلاثي الأبعاد المبري)
          موضوع بدقة واحترافية فوق كراسة الرسم مع ظله الساقط على الورقة
          ========================================================================= */}
      <div
        className="relative z-20 mb-4 pb-3 border-b-2 border-dashed border-[#475569]/70"
        title="قلم رصاص 2B كلاسيكي مبري بخشب الأرز وسن الجرافيت"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Sketch Tag & Header Label */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E293B] text-[#FAF8F5] text-[11px] font-mono font-black border border-[#0F172A] shadow-[1.5px_1.5px_0px_#475569]">
              <span className="text-sm">✎</span>
              <span>مذكرة الفرع التخطيطية</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono font-black text-[#475569] bg-white/90 px-2 py-0.5 rounded border border-[#94A3B8] shadow-xs">
              رسم بقلم الرصاص
            </span>
          </div>

          {/* Technical drafting sheet badge */}
          <span className="text-[10px] font-mono font-bold text-[#64748B] tracking-wider uppercase bg-[#F1EDE4] px-2 py-0.5 rounded border border-[#CBD5E1]">
            REF: 03-LAGH-DRAW
          </span>
        </div>

        {/* Physical 3D Pencil Graphic (مرسوم بمهارة يدوية مع محاكاته لواقع طاولة التخطيط) */}
        <div className="mt-3.5 relative flex items-center justify-center py-1 overflow-hidden" dir="ltr">
          <div
            className="w-full max-w-[360px] h-7 flex items-center relative filter drop-shadow-[0_4px_4px_rgba(30,41,59,0.35)] select-none"
            title="TECHNO STATIONERY · 2B GRAPHITE PENCIL"
          >
            {/* 1. Pink Rubber Eraser (ممحاة القلم الزهرية الكلاسيكية) */}
            <div
              className="h-5 w-7 rounded-l-md shrink-0 relative overflow-hidden border-y border-l border-[#881337]"
              style={{
                background: 'linear-gradient(180deg, #FDA4AF 0%, #F43F5E 40%, #E11D48 70%, #9F1239 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.3)',
              }}
            >
              <div className="w-full h-[1.5px] bg-white/50 absolute top-0.5 inset-x-0" />
            </div>

            {/* 2. Golden Brass Ferrule (حلقة التثبيت النحاسية المذهبة) */}
            <div
              className="h-6 w-5 shrink-0 flex items-center justify-evenly px-0.5 border-y border-[#854D0E] -ml-[1px]"
              style={{
                background: 'linear-gradient(180deg, #FEF08A 0%, #EAB308 30%, #CA8A04 70%, #854D0E 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -1px 1px rgba(0,0,0,0.4)',
              }}
            >
              <div className="w-[1px] h-4 bg-[#713F12]/60" />
              <div className="w-[1px] h-4 bg-[#713F12]/60" />
            </div>

            {/* 3. Hexagonal Green Pencil Shaft (جسم قلم الرصاص الأخضر السداسي بأوجهه الثلاثة) */}
            <div className="flex-1 h-6 flex flex-col justify-between relative overflow-hidden border-y border-[#064E3B] -ml-[1px]">
              {/* Top highlighted facet */}
              <div
                className="w-full h-1"
                style={{ background: 'linear-gradient(180deg, #34D399 0%, #10B981 100%)' }}
              />
              {/* Main facet with gold hot-stamped lettering */}
              <div
                className="w-full flex-1 flex items-center justify-between px-2 text-[9px] font-mono font-black text-[#FEF08A] tracking-widest uppercase overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                <span className="truncate">TECHNO · LAGHOUAT</span>
                <span className="font-extrabold text-[8px] bg-[#064E3B]/80 px-1 rounded text-[#FDE047] shrink-0 border border-[#CA8A04]/40">
                  2B
                </span>
              </div>
              {/* Bottom shadow facet */}
              <div
                className="w-full h-1"
                style={{ background: 'linear-gradient(180deg, #065F46 0%, #064E3B 100%)' }}
              />
            </div>

            {/* 4. Sharpened Cedar Wood Cone & Graphite Lead (رأس القلم المبري بخشب الأرز وسن الجرافيت) */}
            <div className="shrink-0 h-6 -ml-[0.5px] flex items-center">
              <svg
                className="h-6 w-9 select-none"
                viewBox="0 0 36 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Cedar wood cone */}
                <polygon
                  points="0,0 24,9 24,15 0,24"
                  fill="url(#cedar-wood-grain)"
                  stroke="#9A6A38"
                  strokeWidth="0.5"
                />
                {/* Carved facets lines in cedar wood */}
                <line x1="0" y1="8" x2="24" y2="10.5" stroke="#B48248" strokeWidth="0.5" />
                <line x1="0" y1="16" x2="24" y2="13.5" stroke="#7A4F23" strokeWidth="0.5" />
                {/* Sharp Graphite tip */}
                <polygon
                  points="24,9 35,11.5 35,12.5 24,15"
                  fill="url(#sharp-graphite)"
                />
                <defs>
                  <linearGradient id="cedar-wood-grain" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C99B68" />
                    <stop offset="35%" stopColor="#E5BE90" />
                    <stop offset="70%" stopColor="#D4A373" />
                    <stop offset="100%" stopColor="#B5824C" />
                  </linearGradient>
                  <linearGradient id="sharp-graphite" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Hand-drawn pencil sketch curly stroke coming out of pencil tip */}
        <div className="flex justify-end pr-3 -mt-1 pointer-events-none" aria-hidden="true">
          <svg className="w-28 h-3 text-[#334155]/60" viewBox="0 0 100 12" fill="none">
            <path
              d="M0 6 Q25 12 50 4 T100 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          4. CONTENT SECTION (نصوص المذكرة التخطيطية ومعلومات الفرع)
          ========================================================================= */}
      <div className="relative z-10">
        <p className="text-xs font-mono font-bold text-[#475569] flex items-center gap-1.5">
          <span className="text-xs text-[#E30613]">✦</span>
          <span>{STORE_INFO.fullTitle}</span>
        </p>

        <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-black leading-snug text-[#0F172A]">
          طلبات الجملة والمؤسسات أو الاستشارة المباشرة
        </h3>

        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#334155] font-medium">
          هل ترغب في تجهيز مكتبك أو مؤسستك أو الاستفسار عن قياسات وتوفر أي أداة
          قبل الطلب؟ فريق فرع تكنو الأغواط في خدمتك مباشرة.
        </p>

        {/* Hand-drawn Delivery Info Boxes */}
        <dl className="mt-5 pt-4 border-t-2 border-dashed border-[#475569]/60 space-y-2.5 text-xs sm:text-sm">
          {/* 69 Wilayas Info Box */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/95 border-2 border-dashed border-[#64748B] shadow-[2px_2px_0px_#64748B] transition-transform hover:-translate-y-0.5">
            <dt className="text-[#334155] font-black flex items-center gap-1.5">
              <span className="text-[#E30613] text-sm">✎</span>
              <span>نطاق التوصيل:</span>
            </dt>
            <dd className="font-black text-[#0F172A] flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-[#E2E8F0] font-mono text-xs text-[#1E293B]">
                ZR Express
              </span>
              <span>69 ولاية</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* =========================================================================
          5. CALL TO ACTION ACTIONS (أزرار الاتصال وحساب سعر التوصيل)
          ========================================================================= */}
      <div className="relative z-10 mt-6 pt-5 border-t-2 border-dashed border-[#475569]/60 space-y-2.5">
        {/* Direct Call Button */}
        <a
          href={STORE_INFO.phoneHref}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] rounded-xl bg-[#E30613] text-white text-xs sm:text-sm font-black hover:bg-[#C4000F] border-2 border-[#1E293B] shadow-[3.5px_3.5px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>اتصل بالفرع:</span>
          <span dir="ltr" className="font-mono font-black text-sm tracking-wide">
            {STORE_INFO.phoneDisplay}
          </span>
        </a>

        {/* Calculate Delivery Rates Link */}
        <a
          href="#delivery-rates"
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-[#FAF8F5] border-2 border-dashed border-[#334155] text-[#1E293B] text-xs font-black shadow-[2px_2px_0px_#475569] hover:shadow-[3px_3px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <span>✎ احسب سعر التوصيل لولايتك</span>
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
};

export default BranchSketchNote;
