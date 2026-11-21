import { useState, useEffect } from 'react';
import { MessageSquare, ArrowUp, Search, Phone } from 'lucide-react';
import { STORE_INFO } from '../data/products';

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-3 pointer-events-none">
      {/* Scroll to Top button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="الرجوع إلى أعلى الصفحة"
          className="pointer-events-auto w-11 h-11 rounded-full bg-white/95 text-[#18181B] border border-stone-300 shadow-lg flex items-center justify-center hover:bg-[#18181B] hover:text-white hover:border-[#18181B] transition-all duration-200 cursor-pointer active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating WhatsApp Action Pill */}
      <a
        href="https://wa.me/213560154663?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%AA%D9%83%D9%86%D9%88%20%D8%A7%D9%84%D8%A3%D8%BA%D9%88%D8%A7%D8%B7%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D9%88%D8%A7%D9%84%D8%B7%D9%84%D8%A8%D8%A7%D8%AA"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل مع فرع تكنو الأغواط مباشرة عبر واتساب"
        className="pointer-events-auto group inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs shadow-xl hover:bg-[#20ba59] hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageSquare className="w-4 h-4 fill-white" />
        <span className="hidden sm:inline">راسلنا واتساب مباشرة</span>
        <span className="sm:hidden">واتساب</span>
      </a>
    </div>
  );
}
