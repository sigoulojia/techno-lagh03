import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  RotateCcw,
  Download,
  Lock,
  Wifi,
  Check,
  FileText,
  QrCode,
} from 'lucide-react';
import {
  type LoyaltyCardData,
  type LoyaltyTierId,
  type LoyaltyCardDesign,
  LOYALTY_TIERS,
  generateBarcodeBars,
  exportCardToPng,
  downloadCardCredentialsDocument,
} from '../utils/loyaltyLogic';

export interface VirtualLoyaltyCardProps {
  card: LoyaltyCardData;
  onFlip?: (isFlipped: boolean) => void;
  design?: LoyaltyCardDesign;
  onDesignChange?: (design: LoyaltyCardDesign) => void;
}

export function VirtualLoyaltyCard({
  card,
  onFlip,
  design,
  onDesignChange,
}: VirtualLoyaltyCardProps) {
  const [activeDesign, setActiveDesign] = useState<LoyaltyCardDesign>(
    design || card.cardDesign || 'default'
  );
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [passDownloaded, setPassDownloaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSwitchDesign = (newDesign: LoyaltyCardDesign) => {
    setActiveDesign(newDesign);
    if (onDesignChange) onDesignChange(newDesign);
  };

  // Current tier from card data
  const currentTierId: LoyaltyTierId = card.tier || 'classic';
  const tierInfo = LOYALTY_TIERS[currentTierId];

  // Whether card is locked or pending PIN creation ("غير كاملة")
  const isPartiallyMasked = card.status === 'approved_pending_pin' || card.status === 'pending';

  // 3D Motion Physics: Track Mouse/Touch for Realistic Card Tilting
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 24 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 24 });

  // Front face tilt (+/- 14deg X, +/- 16deg Y)
  const rotateXFront = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateYFront = useTransform(mouseXSpring, [-0.5, 0.5], ['-16deg', '16deg']);

  // Back face tilt: maintains natural directional tilt when viewed from the back (180deg flip)
  const rotateXBack = useTransform(mouseYSpring, [-0.5, 0.5], ['-14deg', '14deg']);
  const rotateYBack = useTransform(mouseXSpring, [-0.5, 0.5], ['196deg', '164deg']);

  // Dynamic Holographic Foil Glare coordinates for front and back
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['15%', '85%']);
  const glareXBack = useTransform(mouseXSpring, [-0.5, 0.5], ['85%', '15%']);
  const glareYBack = useTransform(mouseYSpring, [-0.5, 0.5], ['15%', '85%']);

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

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const touchX = (touch.clientX - rect.left) / rect.width - 0.5;
        const touchY = (touch.clientY - rect.top) / rect.height - 0.5;
        x.set(Math.max(-0.5, Math.min(0.5, touchX)));
        y.set(Math.max(-0.5, Math.min(0.5, touchY)));
      }
    },
    [x, y]
  );

  const handleTouchEnd = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const toggleFlip = () => {
    const nextState = !isFlipped;
    setIsFlipped(nextState);
    if (onFlip) onFlip(nextState);
  };

  // Download card as high-resolution PNG using Native Canvas 2D (100% reliable)
  const handleDownloadCard = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const face = isFlipped ? 'back' : 'front';
      const success = await exportCardToPng(card, face, currentTierId, activeDesign);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download official credentials pass document
  const handleDownloadPass = () => {
    downloadCardCredentialsDocument(card);
    setPassDownloaded(true);
    setTimeout(() => setPassDownloaded(false), 3000);
  };

  const barcodeBars = generateBarcodeBars(card.cardNumber);

  // Masked card number for "غير كاملة" state
  const displayedCardNumber = isPartiallyMasked
    ? `03-••••-••••-${card.cardNumber.slice(-4)}`
    : card.cardNumber;

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Design Switcher: الافتراضية (VIP) vs القياسية (Standard) */}
      <div className="mb-3.5 inline-flex items-center gap-1.5 p-1 rounded-xl bg-stone-900/90 border border-stone-800 shadow-sm text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSwitchDesign('default');
          }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeDesign === 'default'
              ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-xs'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          الافتراضية (VIP)
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSwitchDesign('standard');
          }}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeDesign === 'standard'
              ? 'bg-[#E30613] text-white font-bold shadow-xs'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          القياسية (Standard)
        </button>
      </div>

      {/* 3D Card Perspective Wrapper - Strict ISO/IEC 7810 ID-1 standard dimensions: 85.60 mm x 53.98 mm */}
      <div
        className="w-full max-w-[390px] sm:max-w-[440px] relative cursor-pointer"
        style={{
          aspectRatio: '85.60 / 53.98',
          perspective: '1200px',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={toggleFlip}
        title="انقر لقلب البطاقة ومعاينة الوجه الآخر"
      >
        <motion.div
          ref={cardRef}
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: '85.60 / 53.98',
            rotateX: isFlipped ? rotateXBack : rotateXFront,
            rotateY: isFlipped ? rotateYBack : rotateYFront,
            transformStyle: 'preserve-3d',
          }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full relative rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl transition-shadow"
        >
          {/* =========================================================================
              FRONT FACE OF VIRTUAL CARD
              ========================================================================= */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              backgroundImage:
                activeDesign === 'standard'
                  ? "url('/assets/techno-standard-front.jpg')"
                  : "url('/assets/techno-vip-front.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow:
                activeDesign === 'standard'
                  ? '0 20px 40px -15px rgba(227, 6, 19, 0.35)'
                  : tierInfo.theme.cardShadow,
            }}
          >
            {/* Dynamic Iridescent Light Sheen / Holographic Glare on Hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-25 mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${
                  activeDesign === 'standard' ? '#FFD100' : tierInfo.theme.foilHighlight
                } 0%, transparent 65%)`,
                left: glareX,
                top: glareY,
                transform: 'translate(-50%, -50%)',
                width: '180%',
                height: '180%',
              }}
            />

            {activeDesign === 'standard' ? (
              /* Standard Front Card Layout (Red background with Techno mascot) */
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 pb-3">
                {/* Chip & Contactless on upper left */}
                <div className="absolute top-[28%] left-[6%] flex items-center gap-2">
                  <div
                    className="w-7 h-5 sm:w-8 sm:h-6 rounded relative overflow-hidden border border-[#B38F24] shadow-sm flex items-center justify-center shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, #FFE58F 0%, #D4AF37 35%, #B38F24 70%, #8C680E 100%)',
                    }}
                  >
                    <div className="w-full h-[1px] bg-[#5C4307]/70 absolute top-1.5" />
                    <div className="w-full h-[1px] bg-[#5C4307]/70 absolute bottom-1.5" />
                    <div className="w-2 h-1 rounded border border-[#5C4307]/80 bg-[#FFE58F]/60" />
                  </div>
                  <Wifi className="w-3.5 h-3.5 text-white/80 rotate-90" />
                </div>

                {/* Card Number on lower half */}
                <p
                  dir="ltr"
                  className="font-mono text-xs sm:text-sm md:text-base font-black tracking-[0.14em] text-white text-center drop-shadow-md mb-2"
                  style={{
                    textShadow:
                      '0 2px 4px rgba(0,0,0,0.9), 0 -1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  {displayedCardNumber}
                </p>

                {/* Cardholder name & validity */}
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xs border border-white/10">
                  <span className="font-display text-[9.5px] sm:text-[11px] font-black text-white truncate drop-shadow-sm">
                    {card.customerName || 'عضو نادي الوفاء'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      dir="ltr"
                      className="font-mono text-[8.5px] sm:text-[9.5px] font-bold text-white drop-shadow-sm"
                    >
                      VAL {card.validThru}
                    </span>
                    {card.isPinProtected && (
                      <div className="p-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/60 text-emerald-300">
                        <Lock className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Default VIP Front Card Layout (Blue Zellige) */
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
                      background:
                        'linear-gradient(135deg, #FFE58F 0%, #D4AF37 35%, #B38F24 70%, #8C680E 100%)',
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

                {/* Row 2: Embossed VIP Card Number (Masked if partially incomplete) */}
                <p
                  dir="ltr"
                  className="font-mono text-xs sm:text-sm md:text-base font-black tracking-[0.14em] sm:tracking-[0.18em] text-white"
                  style={{
                    textShadow:
                      '0 1px 1px rgba(255,255,255,0.45), 0 -1px 2px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.85)',
                  }}
                >
                  {displayedCardNumber}
                </p>

                {/* Row 3: Cardholder Name & Validity */}
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
                      <span
                        dir="ltr"
                        className="font-mono text-[8.5px] sm:text-[9.5px] font-bold text-white drop-shadow-sm mt-0.5 block"
                      >
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
            )}

            {/* Incomplete / Pending PIN Frosted Overlay if partially approved */}
            {isPartiallyMasked && (
              <div className="absolute inset-0 z-20 bg-stone-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mb-2 shadow-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white tracking-wide">
                  البطاقة غير مكتملة
                </p>
                <p className="text-[10px] text-stone-300 mt-1 max-w-[260px] leading-relaxed">
                  {card.status === 'approved_pending_pin'
                    ? 'يرجى إدخال رقمك السري (6 أرقام) لإظهار البطاقة والباركود بالكامل'
                    : 'طلبك قيد المعالجة في قائمة الانتظار للتحقق من مشترياتك'}
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              BACK FACE OF VIRTUAL CARD
              ========================================================================= */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundImage:
                activeDesign === 'standard'
                  ? "url('/assets/techno-standard-back.jpg')"
                  : "url('/assets/techno-vip-back.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow:
                activeDesign === 'standard'
                  ? '0 20px 40px -15px rgba(227, 6, 19, 0.35)'
                  : tierInfo.theme.cardShadow,
            }}
          >
            {/* Dynamic Iridescent Light Sheen / Holographic Glare on Hover for Back Face */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-25 mix-blend-color-dodge z-1"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${
                  activeDesign === 'standard' ? '#FFD100' : tierInfo.theme.foilHighlight
                } 0%, transparent 65%)`,
                left: glareXBack,
                top: glareYBack,
                transform: 'translate(-50%, -50%)',
                width: '180%',
                height: '180%',
              }}
            />
            {activeDesign === 'standard' ? (
              /* Standard Back Face (Barcode on top, info text below) */
              <div className="relative w-full h-full flex flex-col justify-between p-3">
                {/* Personal Scannable Card Number Bar placed cleanly right under barcode */}
                <div className="w-full text-center pt-2">
                  <span
                    dir="ltr"
                    className="inline-block px-3 py-0.5 rounded bg-white/90 text-[#E30613] font-mono text-xs sm:text-sm font-black tracking-widest shadow-xs select-all"
                  >
                    * {displayedCardNumber} *
                  </span>
                </div>

                {/* Bottom notification */}
                <div className="w-full text-center pb-1">
                  <span className="text-[7px] sm:text-[8px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                    فرع الأغواط 03 · هاتف خدمة الزبائن: 0550101012
                  </span>
                </div>
              </div>
            ) : (
              /* VIP Default Back Face */
              <>
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

                {/* Dynamic Customer Barcode Container */}
                <div
                  className="absolute rounded-xl sm:rounded-2xl bg-white shadow-md flex flex-col items-center justify-between px-2.5 py-1.5 sm:py-2"
                  style={{
                    left: '26%',
                    right: '26%',
                    top: '52%',
                    bottom: '12%',
                  }}
                >
                  {isPartiallyMasked ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-1">
                      <Lock className="w-4 h-4 text-stone-400 mb-0.5" />
                      <span className="text-[7.5px] font-mono font-bold text-stone-500">
                        الباركود محمي برمز PIN
                      </span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* Bottom In-Store Scanner Instruction */}
                <div className="relative z-10 pb-1.5 text-center">
                  <span className="text-[6.5px] sm:text-[7.5px] font-mono text-stone-300/80 tracking-tight">
                    أبرز الباركود عند الدفع في فرع الأغواط للاستفادة الفورية من الرصيد والخصومات
                  </span>
                </div>
              </>
            )}

            {/* Back Incomplete Mask if partially approved */}
            {isPartiallyMasked && (
              <div className="absolute inset-0 z-20 bg-stone-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                <Lock className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-xs font-bold text-white">الباركود محمي</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Card Action Controls & Downloads */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-medium border border-stone-800 hover:border-stone-700 shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
          <span>{isFlipped ? 'معاينة الواجهة الأمامية' : 'معاينة الباركود والخلف'}</span>
        </button>

        {/* 100% Reliable Native Canvas High-Res PNG Exporter */}
        <button
          type="button"
          onClick={handleDownloadCard}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-[#D4AF37] text-xs font-medium border border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          title="حفظ صورة البطاقة عالية الدقة مباشرة في هاتفك أو حاسوبك"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>تم حفظ الصورة بنجاح</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {isDownloading
                  ? 'جارٍ الحفظ...'
                  : isFlipped
                  ? 'حفظ الباركود (PNG)'
                  : 'حفظ في الهاتف (PNG)'}
              </span>
            </>
          )}
        </button>

        {/* Download Official Credentials Document */}
        {card.status === 'active' && (
          <button
            type="button"
            onClick={handleDownloadPass}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-medium border border-stone-800 hover:border-stone-700 shadow-2xs transition-all cursor-pointer active:scale-95"
            title="تحميل وثيقة العضوية الرسمية متضمنة بيانات البطاقة والرمز السري"
          >
            {passDownloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم تنزيل الوثيقة</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>حفظ بيانات البطاقة والرمز السري</span>
              </>
            )}
          </button>
        )}
      </div>


    </div>
  );
}
