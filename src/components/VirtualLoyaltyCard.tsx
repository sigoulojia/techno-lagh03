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
  Share2,
} from 'lucide-react';
import {
  type LoyaltyCardData,
  type LoyaltyTierId,
  LOYALTY_TIERS,
  generateBarcodeBars,
} from '../utils/loyaltyLogic';
import { TechnoLogo } from './TechnoLogo';

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

  // Download card as high-resolution PNG using html2canvas
  const handleDownloadCard = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
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
    <div className="flex flex-col items-center select-none">
      {/* 3D Card Perspective Wrapper */}
      <div
        className="w-full max-w-[380px] sm:max-w-[420px] h-[225px] sm:h-[250px] relative cursor-pointer"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={toggleFlip}
        title="انقر لقلب البطاقة ومعاينة الوجه الآخر"
      >
        <motion.div
          ref={cardRef}
          style={{
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
            transformStyle: 'preserve-3d',
          }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full relative rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl transition-shadow"
        >
          {/* =========================================================================
              FRONT FACE OF VIRTUAL CARD
              الوجه الأمامي: شريحة ذهبية، لوغو تكنو، ختم هولوغرافي، رقم واسم العضو
              ========================================================================= */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              background: tierInfo.theme.bgGradient,
              boxShadow: tierInfo.theme.cardShadow,
              border: `1.5px solid ${tierInfo.theme.borderAccent}`,
            }}
          >
            {/* Algerian Zellige Background Watermark */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
              style={{
                backgroundImage: "url('/assets/algerian-zellige-jersey.webp')",
                backgroundSize: '240px 240px',
                backgroundRepeat: 'repeat',
              }}
            />

            {/* Dynamic Iridescent Light Sheen / Holographic Glare */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${tierInfo.theme.foilHighlight} 0%, transparent 65%)`,
                left: glareX,
                top: glareY,
                transform: 'translate(-50%, -50%)',
                width: '180%',
                height: '180%',
              }}
            />

            {/* Card Top Header: Techno Logo & Tier Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TechnoLogo size="sm" showBranch={false} />
                <div className="border-r border-white/30 pr-2 mr-1">
                  <span className="block text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-[#FFD100]">
                    فرع الأغواط 03
                  </span>
                  <span className="block text-[9px] text-stone-300 font-mono">
                    CARTE DE FIDÉLITÉ VIP
                  </span>
                </div>
              </div>

              {/* Tier Badge */}
              <div
                className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black border flex items-center gap-1 shadow-sm"
                style={{
                  backgroundColor: tierInfo.theme.badgeBg,
                  color: tierInfo.theme.badgeText,
                  borderColor: tierInfo.theme.borderAccent,
                }}
              >
                <Sparkles className="w-3 h-3 text-[#FFD100]" />
                <span>{tierInfo.badge}</span>
              </div>
            </div>

            {/* Middle Row: EMV Chip, NFC Contactless, Hologram Seal */}
            <div className="relative z-10 flex items-center justify-between mt-1">
              <div className="flex items-center gap-3">
                {/* Realistic Golden Brass EMV Smart Chip */}
                <div
                  className="w-11 h-8 sm:w-12 sm:h-9 rounded-md relative overflow-hidden border border-[#B38F24] shadow-md flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFE58F 0%, #D4AF37 35%, #B38F24 70%, #8C680E 100%)',
                  }}
                  title="شريحة ذكية مشفرة EMV"
                >
                  {/* Microchip etched contact grid */}
                  <div className="w-full h-[1px] bg-[#5C4307]/70 absolute top-2.5" />
                  <div className="w-full h-[1px] bg-[#5C4307]/70 absolute bottom-2.5" />
                  <div className="w-[1px] h-full bg-[#5C4307]/70 absolute left-3.5" />
                  <div className="w-[1px] h-full bg-[#5C4307]/70 absolute right-3.5" />
                  <div className="w-3 h-2 rounded border border-[#5C4307]/80 bg-[#FFE58F]/60" />
                </div>

                {/* Contactless Wave Icon */}
                <div className="opacity-80 flex items-center text-white/90" title="Contactless NFC">
                  <Wifi className="w-5 h-5 rotate-90" />
                </div>
              </div>

              {/* Holographic Authentic Techno Product Seal */}
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/50 flex flex-col items-center justify-center text-center p-0.5 shadow-inner"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(212,175,55,0.4) 50%, rgba(0,255,255,0.2) 100%)',
                }}
                title="ختم الأصالة المعتمد — تكنو الجزائر 100%"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFD100]" />
                <span className="text-[6.5px] font-black uppercase tracking-tighter text-white">
                  ORIGINAL
                </span>
              </div>
            </div>

            {/* Embossed Card Number */}
            <div className="relative z-10 pt-1">
              <p
                dir="ltr"
                className="font-mono text-base sm:text-lg font-black tracking-[0.2em] sm:tracking-[0.25em] text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)]"
                style={{
                  textShadow: '0 1px 1px rgba(255,255,255,0.4), 0 -1px 1px rgba(0,0,0,0.8)',
                }}
              >
                {card.cardNumber}
              </p>
            </div>

            {/* Card Bottom: Holder Name, Expiry, Security Lock */}
            <div className="relative z-10 flex items-end justify-between pt-1">
              <div>
                <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-stone-300 font-mono">
                  صاحب البطاقة / CARD HOLDER
                </span>
                <p className="font-display text-xs sm:text-sm font-black text-white tracking-wide truncate max-w-[180px] sm:max-w-[220px]">
                  {card.customerName || 'عضو نادي الوفاء'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-stone-300 font-mono">
                    صالحة حتى
                  </span>
                  <span dir="ltr" className="font-mono text-[11px] sm:text-xs font-bold text-white">
                    {card.validThru}
                  </span>
                </div>

                {card.isPinProtected && (
                  <div
                    className="p-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300"
                    title="محمية برمز أمان PIN سري"
                  >
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              BACK FACE OF VIRTUAL CARD
              الوجه الخلفي: شريط مغناطيسي، توقيع الزبون، باركود وكود QR للسكانير بالمحل
              ========================================================================= */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl flex flex-col justify-between overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: tierInfo.theme.bgGradient,
              boxShadow: tierInfo.theme.cardShadow,
              border: `1.5px solid ${tierInfo.theme.borderAccent}`,
            }}
          >
            {/* Top Magnetic Stripe */}
            <div className="w-full h-9 sm:h-11 bg-[#090D14] mt-4 sm:mt-5 relative shadow-inner">
              <div className="w-full h-[1px] bg-white/10 absolute top-1" />
              <div className="w-full h-[1px] bg-black absolute bottom-1" />
            </div>

            {/* Signature Panel & Security Code (CVV) */}
            <div className="px-5 sm:px-6 flex items-center justify-between gap-3">
              <div className="flex-1 h-7 sm:h-8 rounded bg-[#F8FAFC] border border-stone-300 flex items-center justify-between px-3 relative overflow-hidden">
                {/* Security micro-pattern lines on signature strip */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 4px)',
                  }}
                />
                <span className="font-mono text-[10px] text-stone-400 italic">
                  توقيع معتمد
                </span>
                <span className="font-serif italic font-bold text-xs sm:text-sm text-[#0F172A] z-10">
                  {card.customerName || 'Techno VIP'}
                </span>
              </div>

              {/* CVV Box */}
              <div className="text-center shrink-0">
                <span className="block text-[8px] font-mono text-stone-300">
                  CVV / PIN
                </span>
                <div className="px-2 py-0.5 rounded bg-black/60 border border-white/20 font-mono text-[11px] font-black text-[#FFD100]">
                  {card.isPinProtected ? 'SECURED' : '030'}
                </div>
              </div>
            </div>

            {/* Industrial Barcode & In-Store Instructions */}
            <div className="px-5 sm:px-6 pb-4 sm:pb-5">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white text-[#0F172A] flex items-center justify-between gap-3 shadow-md">
                {/* Real Barcode SVG */}
                <div className="flex-1">
                  <div className="flex items-center justify-between h-7 sm:h-8 px-1">
                    {barcodeBars.map((width, idx) => (
                      <div
                        key={idx}
                        className="h-full bg-[#0F172A]"
                        style={{ width: `${width * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <p
                    dir="ltr"
                    className="text-center font-mono text-[9px] sm:text-[10px] font-black tracking-widest text-[#0F172A] mt-0.5"
                  >
                    * {card.cardNumber} *
                  </p>
                </div>

                {/* QR Code Indicator */}
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#0F172A] text-white flex flex-col items-center justify-center shrink-0 p-1"
                  title="سكانير المحل الميداني بالأغواط"
                >
                  <QrCode className="w-5 h-5 text-[#FFD100]" />
                  <span className="text-[6.5px] font-black uppercase text-center mt-0.5 leading-none">
                    SCAN
                  </span>
                </div>
              </div>

              {/* Branch In-Store Notice */}
              <p className="text-[9px] text-center text-stone-300 mt-2 font-medium">
                أبرز هذا الباركود عند الدفع في فرع الأغواط (حي المقام) للحصول على خصم وفاء فوري
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card Action Controls */}
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

      {/* Interactive Theme Switcher */}
      <div className="mt-3.5 flex items-center gap-1 p-1 rounded-xl bg-stone-950/80 border border-stone-800/90">
        <span className="text-[10px] font-mono text-stone-400 px-2">
          طراز البطاقة:
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
