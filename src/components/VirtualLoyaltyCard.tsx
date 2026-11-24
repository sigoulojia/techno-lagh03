import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  RotateCcw,
  Download,
  ShieldCheck,
  Sparkles,
  QrCode,
  Lock,
  Wifi,
  Check,
} from 'lucide-react';
import {
  type LoyaltyCardData,
  type LoyaltyTierId,
  LOYALTY_TIERS,
  generateBarcodeBars,
} from '../utils/loyaltyLogic';

export interface VirtualLoyaltyCardProps {
  card: LoyaltyCardData;
  activeTheme?: LoyaltyTierId;
  onThemeChange?: (theme: LoyaltyTierId) => void;
  onFlip?: (isFlipped: boolean) => void;
}

export function VirtualLoyaltyCard({
  card,
  activeTheme,
  onThemeChange,
  onFlip,
}: VirtualLoyaltyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Current theme fallback to card's tier
  const currentTierId: LoyaltyTierId = activeTheme || card.themePreference || card.tier || 'classic';
  const tierInfo = LOYALTY_TIERS[currentTierId];

  // 3D Motion Physics: Track Mouse/Touch for Realistic Card Tilting
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 24 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 24 });

  // Range of tilt: +/- 14 degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-16deg', '16deg']);

  // Dynamic Holographic Foil Glare coordinates
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['15%', '85%']);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(mouseX);
      y.set(mouseY);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const toggleFlip = () => {
    const nextState = !isFlipped;
    setIsFlipped(nextState);
    if (onFlip) onFlip(nextState);
  };

  // Download card as high-resolution PNG using html2canvas with exact ISO 85.60 x 53.98mm proportions
  const handleDownloadCard = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      // Temporarily reset tilt for flat, straight export
      x.set(0);
      y.set(0);
      await new Promise((resolve) => setTimeout(resolve, 80));

      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Techno-VIP-Card-${card.cardNumber}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const barcodeBars = generateBarcodeBars(card.cardNumber);

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* 3D Card Perspective Wrapper - Strict ISO/IEC 7810 ID-1 standard dimensions: 85.60 mm x 53.98 mm */}
      <div
        className="w-full max-w-[390px] sm:max-w-[440px] relative cursor-pointer"
        style={{
          aspectRatio: '85.60 / 53.98',
          perspective: '1200px',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={toggleFlip}
        title="انقر لقلب البطاقة ومعاينة الوجه الآخر"
      >
        <motion.div
          ref={cardRef}
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: '85.60 / 53.98',
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
            transformStyle: 'preserve-3d',
          }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full relative rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl transition-shadow"
        >
          {/* =========================================================================
              FRONT FACE OF VIRTUAL CARD
              الصورة الرسمية: تكنو + الزليج الجزائري + أبعاد ID-1 المعتمدة (85.60mm x 53.98mm)
              ========================================================================= */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              backgroundImage: "url('/assets/techno-vip-front.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: tierInfo.theme.cardShadow,
            }}
          >
            {/* Dynamic Iridescent Light Sheen / Holographic Glare on Hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${tierInfo.theme.foilHighlight} 0%, transparent 65%)`,
                left: glareX,
                top: glareY,
                transform: 'translate(-50%, -50%)',
                width: '180%',
                height: '180%',
              }}
            />

            {/* Top-Right: VIP Tier Badge over the Algerian Zellige pattern */}
            <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10">
              <div
                className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8.5px] sm:text-[9.5px] font-black tracking-wider border backdrop-blur-md flex items-center gap-1.5 shadow-md uppercase"
                style={{
                  backgroundColor: 'rgba(8, 20, 48, 0.9)',
                  color: tierInfo.theme.badgeText,
                  borderColor: tierInfo.theme.borderAccent,
                }}
              >
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFD100]" />
                <span>{tierInfo.badge}</span>
                <span className="text-[7px] sm:text-[8px] text-stone-300 font-mono">03</span>
              </div>
            </div>

            {/* Hologram Authenticity Seal near chevron dividing line */}
            <div className="absolute top-[32%] right-[32%] sm:right-[34%] z-10">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/40 flex flex-col items-center justify-center text-center p-0.5 shadow-inner backdrop-blur-xs"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(212,175,55,0.35) 50%, rgba(0,255,255,0.15) 100%)',
                }}
                title="ختم الأصالة المعتمد — تكنو 03 الأغواط"
              >
                <ShieldCheck className="w-3 h-3 text-[#FFD100]" />
                <span className="text-[4.5px] sm:text-[5px] font-black uppercase tracking-tighter text-white">
                  ORIGINAL
                </span>
              </div>
            </div>

            {/* Middle Navy Blue Section (Between Top Logo and Bottom CARTE FIDÉLITÉ):
                Contains: EMV Chip + NFC Contactless, Embossed Card Number, Cardholder Name & Expiry */}
            <div
              className="absolute left-[5.5%] z-10 flex flex-col justify-between"
              style={{
                top: '28%',
                bottom: '36%',
                width: '58%',
              }}
            >
              {/* Row 1: EMV Brass Chip + Contactless Wifi */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div
                  className="w-8 h-5.5 sm:w-10 sm:h-7 rounded relative overflow-hidden border border-[#B38F24] shadow-sm flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #FFE58F 0%, #D4AF37 35%, #B38F24 70%, #8C680E 100%)',
                  }}
                  title="شريحة أمان EMV الذكية"
                >
                  <div className="w-full h-[1px] bg-[#5C4307]/70 absolute top-1.5 sm:top-2" />
                  <div className="w-full h-[1px] bg-[#5C4307]/70 absolute bottom-1.5 sm:bottom-2" />
                  <div className="w-[1px] h-full bg-[#5C4307]/70 absolute left-2 sm:left-2.5" />
                  <div className="w-[1px] h-full bg-[#5C4307]/70 absolute right-2 sm:right-2.5" />
                  <div className="w-2 h-1 sm:w-2.5 sm:h-1.5 rounded border border-[#5C4307]/80 bg-[#FFE58F]/60" />
                </div>

                <div className="text-white/80" title="Contactless NFC">
                  <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-90" />
                </div>
              </div>

              {/* Row 2: Embossed VIP Card Number */}
              <p
                dir="ltr"
                className="font-mono text-xs sm:text-sm md:text-base font-black tracking-[0.14em] sm:tracking-[0.18em] text-white"
                style={{
                  textShadow: '0 1px 1px rgba(255,255,255,0.45), 0 -1px 2px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.85)',
                }}
              >
                {card.cardNumber}
              </p>

              {/* Row 3: Cardholder Name & Validity (Comfortably sitting above CARTE FIDÉLITÉ) */}
              <div className="flex items-end justify-between pr-2">
                <div className="max-w-[70%]">
                  <span className="block text-[6.5px] sm:text-[7.5px] uppercase tracking-wider text-stone-300/90 font-mono leading-none">
                    صاحب البطاقة / CARDHOLDER
                  </span>
                  <p className="font-display text-[9.5px] sm:text-[11px] font-black text-white tracking-wide truncate drop-shadow-sm mt-0.5">
                    {card.customerName || 'عضو نادي الوفاء'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="text-left">
                    <span className="block text-[6.5px] sm:text-[7.5px] uppercase tracking-wider text-stone-300/90 font-mono leading-none">
                      VAL
                    </span>
                    <span dir="ltr" className="font-mono text-[8.5px] sm:text-[9.5px] font-bold text-white drop-shadow-sm mt-0.5 block">
                      {card.validThru}
                    </span>
                  </div>

                  {card.isPinProtected && (
                    <div
                      className="p-0.5 sm:p-1 rounded-full bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 shadow-xs"
                      title="محمية برمز أمان PIN سري"
                    >
                      <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              BACK FACE OF VIRTUAL CARD
              الوجه الخلفي الرسمي: زليج علوي، شعار تكنو، باركود ديناميكي مشفر داخل الحاوية البيضاء
              ========================================================================= */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundImage: "url('/assets/techno-vip-back.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: tierInfo.theme.cardShadow,
            }}
          >
            {/* Top Details (Right under Zellige border band) */}
            <div className="relative z-10 px-4 pt-3 flex items-center justify-between text-[7px] sm:text-[8px] font-mono text-stone-300/80">
              <span className="tracking-wider">TECHNO LAGHOUAT 03 · MAQAM</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#FFD100] font-bold">
                  {card.isPinProtected ? 'PIN SECURED' : 'CVV 030'}
                </span>
                <QrCode className="w-2.5 h-2.5 text-stone-300" />
              </div>
            </div>

            {/* Dynamic Customer Barcode Container
                Overlaid exactly inside the bottom white rounded box of techno-vip-back.webp */}
            <div
              className="absolute rounded-xl sm:rounded-2xl bg-white shadow-md flex flex-col items-center justify-between px-2.5 py-1.5 sm:py-2"
              style={{
                left: '26%',
                right: '26%',
                top: '52%',
                bottom: '12%',
              }}
            >
              {/* High-Resolution Dynamic Barcode SVG/Bars */}
              <div className="w-full flex-1 flex items-center justify-between px-1 overflow-hidden">
                {barcodeBars.map((width, idx) => (
                  <div
                    key={idx}
                    className="h-full bg-[#0F172A]"
                    style={{ width: `${Math.max(1, width * 1.35)}px` }}
                  />
                ))}
              </div>

              {/* Scannable Card Number Label */}
              <p
                dir="ltr"
                className="text-center font-mono text-[8px] sm:text-[9.5px] font-black tracking-wider text-[#0F172A] mt-0.5 select-all"
              >
                * {card.cardNumber} *
              </p>
            </div>

            {/* Bottom In-Store Scanner Instruction */}
            <div className="relative z-10 pb-1.5 text-center">
              <span className="text-[6.5px] sm:text-[7.5px] font-mono text-stone-300/80 tracking-tight">
                أبرز الباركود عند الدفع في فرع الأغواط للاستفادة الفورية من الرصيد والخصومات
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card Action Controls & Dimensions Pill */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-medium border border-stone-800 hover:border-stone-700 shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
          <span>{isFlipped ? 'معاينة الواجهة الأمامية' : 'معاينة الباركود والخلف'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCard}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-[#D4AF37] text-xs font-medium border border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>تم حفظ صورة البطاقة</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isDownloading ? 'جارٍ التصدير...' : 'حفظ في الهاتف (PNG)'}</span>
            </>
          )}
        </button>
      </div>

      {/* Exact Physical Dimensions Pill */}
      <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/80 border border-stone-800 text-[10px] font-mono text-stone-400">
        <span className="text-[#D4AF37] font-bold">85.60 mm × 53.98 mm</span>
        <span className="text-stone-600">·</span>
        <span>المعيار العالمي ID-1</span>
      </div>

      {/* Interactive Tier Switcher */}
      <div className="mt-3 flex items-center gap-1 p-1 rounded-xl bg-stone-950/80 border border-stone-800/90">
        <span className="text-[10px] font-mono text-stone-400 px-2">
          طراز العضوية:
        </span>
        {(Object.keys(LOYALTY_TIERS) as LoyaltyTierId[]).map((tId) => {
          const t = LOYALTY_TIERS[tId];
          const isSelected = currentTierId === tId;
          return (
            <button
              key={tId}
              type="button"
              onClick={() => onThemeChange && onThemeChange(tId)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                isSelected
                  ? 'bg-stone-800 text-[#D4AF37] font-bold border border-stone-700 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {t.badge.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

