import { ShoppingBag, Phone, MapPin, Search } from 'lucide-react';
import { STORE_INFO } from '../data/products';
import { TechnoLogo } from './TechnoLogo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function Header({ cartCount, onOpenCart }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-stone-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Authentic Official TECHNO STATIONERY Brand Badge */}
        <a
          href="#top"
          className="group flex items-center gap-3 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E30613]"
          aria-label={STORE_INFO.fullTitle}
        >
          <TechnoLogo size="md" showBranch={true} />
        </a>

        {/* Zone 2: Interactive Desktop Navigation */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-bold text-[#52525B]"
        >
          <a
            href="#collection"
            className="relative py-2 hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0 group"
          >
            <span>الأقسام والمعروضات</span>
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#E30613] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
          </a>
          <a
            href="#delivery-rates"
            className="relative py-2 hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0 group"
          >
            <span>تعريفة ZR Express</span>
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#E30613] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
          </a>
          <a
            href="#craftsmanship"
            className="relative py-2 hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0 group"
          >
            <span>حكاية 25 سنة</span>
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#E30613] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
          </a>
          <a
            href="#branch"
            className="relative py-2 hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0 group"
          >
            <span>موقع الفرع</span>
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#E30613] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
          </a>
          <a
            href="#track"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD100]/25 text-[#18181B] border-2 border-[#FFD100] hover:bg-[#FFD100] hover:shadow-xs transition-all whitespace-nowrap shrink-0 font-bold text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#E30613] animate-ping" />
            <span>تتبع مسار طلبك</span>
          </a>
        </nav>

        {/* Zone 3: Interactive Action Suite */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Quick Call Button (Desktop) */}
          <a
            href={STORE_INFO.phoneHref}
            dir="ltr"
            aria-label="اتصل بفرع تكنو الأغواط"
            className="hidden xl:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:border-[#E30613] hover:text-[#E30613] text-xs font-mono font-bold text-[#18181B] transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#E30613]" />
            <span>{STORE_INFO.phoneDisplay}</span>
          </a>

          {/* Interactive Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`فتح سلة الطلب (${cartCount} منتج)`}
            data-testid="header-cart-button"
            className="relative group inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 min-h-[46px] rounded-xl bg-[#18181B] text-white text-sm font-bold hover:bg-[#E30613] active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E30613]"
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
        </div>
      </div>
    </header>
  );
}
