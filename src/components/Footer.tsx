import { MapPin, Phone, Clock, ShieldCheck, Truck, MessageSquare, Heart } from 'lucide-react';
import { STORE_INFO } from '../data/products';
import { TechnoLogo } from './TechnoLogo';

export function Footer() {
  return (
    <footer className="border-t-2 border-stone-200 bg-[#18181B] text-white">
      {/* Top Banner with Brand Identity */}
      <div className="border-b border-stone-800 py-10 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <TechnoLogo size="md" showBranch={true} />
            <div className="hidden sm:block border-r border-stone-700 pr-4">
              <p className="font-display text-sm font-bold text-[#FFD100]">
                {STORE_INFO.heritageLine}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {STORE_INFO.secondarySlogan}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/213560154663"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white" />
              <span>محادثة واتساب فورية</span>
            </a>
            <a
              href={STORE_INFO.phoneHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700"
            >
              <Phone className="w-3.5 h-3.5 text-[#FFD100]" />
              <span dir="ltr" className="font-mono">{STORE_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: About the Branch */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              {STORE_INFO.fullTitle}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {STORE_INFO.tagline}. نوفر لكافة زبائننا بالأغواط وجميع ولايات الوطن تشكيلات أصلية متكاملة بمعايير جودة عالية مع التوصيل السريع والدفع عند الاستلام.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-stone-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>جميع المنتجات معتمدة وأصلية 100%</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#FFD100] uppercase tracking-wider">
              أقسام المتجر الرئيسية
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  الأدوات المكتبية وتنظيم المكاتب
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  أقلام التوقيع الفاخرة والخط
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  حقائب الحواسيب والوثائق المهنية
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  مستلزمات الهندسة والرسم الفني
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  اللوازم المدرسية والجامعية
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Logistics & Services */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#FFD100] uppercase tracking-wider">
              التوصيل والخدمات
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="#delivery-rates" className="hover:text-white transition-colors">
                  تسعيرة ZR Express لـ 69 ولاية
                </a>
              </li>
              <li>
                <a href="#delivery-rates" className="hover:text-white transition-colors">
                  تغطية 24 بلدية داخل الأغواط
                </a>
              </li>
              <li>
                <a href="#track" className="hover:text-white transition-colors font-bold text-stone-200">
                  تتبع حالة ومسار طلبك
                </a>
              </li>
              <li>
                <span className="text-stone-500">
                  الدفع نقداً بعد المعاينة عند الاستلام
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#FFD100] uppercase tracking-wider">
              معلومات الفرع
            </h3>
            <ul className="space-y-3 text-xs text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E30613] shrink-0 mt-0.5" />
                <span>{STORE_INFO.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#FFD100] shrink-0 mt-0.5" />
                <span>{STORE_INFO.hours}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a href={STORE_INFO.phoneHref} dir="ltr" className="font-mono font-bold hover:text-white">
                  {STORE_INFO.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Security Line */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} {STORE_INFO.fullTitle} · جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>مشفر ومحمي عبر Cloudflare</span>
            </span>
            <span>·</span>
            <span className="text-stone-400">ZR Express Official Partner</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
