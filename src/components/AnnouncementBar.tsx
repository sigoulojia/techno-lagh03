import { useState, useEffect } from 'react';
import { Truck, Sparkles, Phone, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { STORE_INFO } from '../data/products';

const ANNOUNCEMENTS = [
  {
    icon: Truck,
    text: 'توصيل رسمي سريع عبر ZR Express إلى كافة بلديات الأغواط (24 بلدية) وإلى 54 ولاية جزائرية مع الدفع عند الاستلام',
    highlight: '54 ولاية',
  },
  {
    icon: Sparkles,
    text: 'الفرع الرسمي المعتمد لعلامة تكنو ستيشنري بالأغواط — 25 سنة حكاية أجيال ومازال',
    highlight: 'أصلي 100%',
  },
  {
    icon: Phone,
    text: 'للطلب المباشر أو الاستفسار السريع تواصلوا معنا هاتفياً أو عبر واتساب: 0560 15 46 63',
    highlight: 'خدمة الزبائن',
  },
  {
    icon: Clock,
    text: 'مرحباً بكم في فرعنا: حي المقام بجانب المقبرة — وسط المدينة، الأغواط · أوقات العمل: من السبت إلى الخميس (08:30 – 20:00)',
    highlight: 'مفتوح يومياً',
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const active = ANNOUNCEMENTS[currentIndex];
  const Icon = active.icon;

  return (
    <aside aria-label="شريط الإعلانات والمعلومات" className="bg-[#18181B] text-white border-b border-stone-800 text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Branch Quick Status (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-stone-300 font-medium shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-[#FFD100] font-bold">فرع الأغواط الرسمي</span>
          <span className="text-stone-500">·</span>
          <span className="text-[11px] text-stone-300">وسط المدينة</span>
        </div>

        {/* Center Animated Announcement */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0 text-center">
          <Icon className="w-3.5 h-3.5 text-[#FFD100] shrink-0" aria-hidden="true" />
          <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-[#FFD100] shrink-0">
            {active.highlight}
          </span>
          <p className="truncate font-medium text-stone-200 text-xs sm:text-[13px]">
            {active.text}
          </p>
        </div>

        {/* Right Quick Phone / Call (Desktop) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a
            href={STORE_INFO.phoneHref}
            dir="ltr"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFD100] hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-[#E30613]" />
            <span>{STORE_INFO.phoneDisplay}</span>
          </a>

          {/* Mini navigation dots */}
          <div className="flex items-center gap-1">
            {ANNOUNCEMENTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`إعلان رقم ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-[#FFD100] w-3' : 'bg-stone-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
