import { useState, useEffect } from 'react';
import { ShoppingBag, Phone, MapPin, Search, Menu, X, Truck, MessageSquare, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STORE_INFO } from '../data/products';
import { TechnoLogo } from './TechnoLogo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function Header({ cartCount, onOpenCart }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check store opening status (UTC+1, 08:30 - 20:00, Closed Friday)
  const isStoreOpen = (() => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const dzHours = (utcHours + 1) % 24;
    const day = now.getUTCDay(); // 5 is Friday
    return day !== 5 && dzHours >= 8.5 && dzHours < 20;
  })();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { label: 'الأقسام والمعروضات', href: '#collection' },
    { label: 'تعريفة ZR Express', href: '#delivery-rates' },
    { label: 'دليل الأدوات الذكي', href: '#assistant' },
    { label: 'حكاية 25 سنة', href: '#craftsmanship' },
    { label: 'موقع الفرع', href: '#branch' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-stone-200 shadow-md py-2.5'
            : 'bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200/80 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Zone 1: Authentic Official TECHNO STATIONERY Brand Badge */}
          <div className="flex items-center gap-3">
            <a
              href="#top"
              className="group flex items-center gap-3 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E30613]"
              aria-label={STORE_INFO.fullTitle}
            >
              <TechnoLogo size="md" showBranch={true} />
            </a>

            {/* Subtle Live Store Status Pill (Desktop) */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-800">
              <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span>{isStoreOpen ? 'مفتوح الآن' : 'مغلق حالياً'}</span>
            </div>
          </div>

          {/* Zone 2: Interactive Desktop Navigation */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-bold text-[#52525B]"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-2 hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0 group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#E30613] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
              </a>
            ))}

            {/* Interactive Pulse Tracking Button */}
            <a
              href="#track"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD100]/25 text-[#18181B] border-2 border-[#FFD100] hover:bg-[#FFD100] hover:shadow-xs active:scale-95 transition-all whitespace-nowrap shrink-0 font-bold text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#E30613] animate-ping" />
              <span>تتبع مسار طلبك</span>
            </a>
          </nav>

          {/* Zone 3: Interactive Action Suite */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Call Button (Desktop) */}
            <a
              href={STORE_INFO.phoneHref}
              dir="ltr"
              aria-label="اتصل بفرع تكنو الأغواط"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:border-[#E30613] hover:text-[#E30613] text-xs font-mono font-bold text-[#18181B] transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-[#E30613]" />
              <span>{STORE_INFO.phoneDisplay}</span>
            </a>

            {/* Quick Order Shortcut (Tablet & Up) */}
            <a
              href="#quick-order"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-[#FFD100]/30 border border-stone-200 text-xs font-bold text-[#18181B] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E30613]" />
              <span>طلب مباشر</span>
            </a>

            {/* Interactive Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`فتح سلة الطلب (${cartCount} منتج)`}
              data-testid="header-cart-button"
              className="relative group inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2.5 min-h-[44px] rounded-xl bg-[#18181B] text-white text-sm font-bold hover:bg-[#E30613] active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E30613]"
            >
              <ShoppingBag className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              <span className="hidden sm:inline">سلة الطلب</span>
              <span
                data-testid="header-cart-count"
                className={`font-mono text-xs tabular-nums px-2 py-0.5 rounded-full font-bold transition-all ${
                  cartCount > 0
                    ? 'bg-[#FFD100] text-[#18181B] scale-110 shadow-sm'
                    : 'bg-white/15 text-white'
                }`}
              >
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة الرئيسية'}
              className="lg:hidden p-2.5 rounded-xl border border-stone-300 bg-white text-[#18181B] hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#E30613]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              {/* Drawer Top */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <TechnoLogo size="sm" showBranch={true} />
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label="إغلاق القائمة"
                  className="p-2 rounded-lg bg-stone-100 text-[#18181B] hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Store Status Banner */}
              <div className="px-5 py-3 bg-[#FAF9F6] border-b border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                  <span className="font-bold text-[#18181B]">
                    {isStoreOpen ? 'الفرع مفتوح الآن لاستقبالكم' : 'الفرع مغلق حالياً'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">08:30 – 20:00</span>
              </div>

              {/* Links list */}
              <div className="p-5 space-y-2 flex-1">
                <a
                  href="#track"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFD100]/25 border-2 border-[#FFD100] text-[#18181B] font-bold text-sm mb-4"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E30613] animate-ping" />
                    <span>تتبع مسار طلبك (ZR Express)</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[#E30613]" />
                </a>

                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-stone-700 hover:text-[#E30613] hover:bg-stone-50 font-bold text-sm transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowLeft className="w-4 h-4 text-stone-400" />
                  </a>
                ))}

                <a
                  href="#quick-order"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-900 text-[#FFD100] font-bold text-sm mt-3"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E30613]" />
                    <span>طلب سريع ومباشر</span>
                  </div>
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>

              {/* Drawer Footer with Direct Actions */}
              <div className="p-5 border-t border-stone-200 bg-[#FAF9F6] space-y-2.5">
                <a
                  href={STORE_INFO.phoneHref}
                  dir="ltr"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#E30613] text-white font-mono font-bold text-sm shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>{STORE_INFO.phoneDisplay}</span>
                </a>

                <a
                  href="https://wa.me/213560154663?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%AA%D9%83%D9%86%D9%88%20%D8%A7%D9%84%D8%A3%D8%BA%D9%88%D8%A7%D8%B7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>راسلنا عبر واتساب</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
