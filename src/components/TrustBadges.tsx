import { ShieldCheck, Truck, Banknote, Headphones, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'أصالة تكنو المضمونة 100%',
    subtitle: 'منتجات أصلية مباشرة من المصدر',
    description:
      'كافة الأدوات والمستلزمات معتمدة مباشرة من علامة TECHNO STATIONERY الرسمية مع ضمان خلوها التام من أي تقليد.',
    tag: 'جودة معتمدة',
    color: 'from-[#FFD100]/25 via-white to-white',
    iconColor: 'text-[#18181B]',
    iconBg: 'bg-[#FFD100]',
    borderColor: 'border-[#FFD100]/50',
    linkHref: '#craftsmanship',
    linkText: 'عن أصالة تكنو',
  },
  {
    icon: Truck,
    title: 'شحن سريع عبر ZR Express',
    subtitle: 'تغطية 54 ولاية و24 بلدية بالأغواط',
    description:
      'خدمة توصيل لباب المنزل (À Domicile) أو استلام اقتصادي من المكتب (Stop Desk) مع تغليف واقٍ متين لكل طرد.',
    tag: 'توصيل 24–72 ساعة',
    color: 'from-[#E30613]/15 via-white to-white',
    iconColor: 'text-white',
    iconBg: 'bg-[#E30613]',
    borderColor: 'border-[#E30613]/30',
    linkHref: '#delivery-rates',
    linkText: 'حساب سعر التوصيل',
  },
  {
    icon: Banknote,
    title: 'الدفع عند المعاينة والاستلام',
    subtitle: 'أمان وثقة تامة بدون دفع مسبق',
    description:
      'لا تحتاج لبطاقة بنكية، اطلب بسهولة عبر الموقع وادفع نقداً لمندوب ZR Express عند استلام الطرد والتأكد من طلبيتك.',
    tag: 'دفع نقدي 100%',
    color: 'from-emerald-500/15 via-white to-white',
    iconColor: 'text-white',
    iconBg: 'bg-emerald-600',
    borderColor: 'border-emerald-300',
    linkHref: '#quick-order',
    linkText: 'اطلب الآن وادفع لاحقاً',
  },
  {
    icon: Headphones,
    title: 'فريق دعم فرع الأغواط',
    subtitle: 'استشارات واختيار المقاسات هاتفياً',
    description:
      'فريقنا متواجد يومياً في متجر الأغواط لمساعدتكم في اختيار قياسات الحقائب واللوازم والمتابعة المباشرة لطلباتكم.',
    tag: 'دعم محلي فوري',
    color: 'from-amber-500/15 via-white to-white',
    iconColor: 'text-white',
    iconBg: 'bg-amber-600',
    borderColor: 'border-amber-300',
    linkHref: '#branch',
    linkText: 'تواصل مع الفرع',
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-lined-paper border-b-2 border-stone-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative group p-6 rounded-2xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#E30613] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${item.iconBg} border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-[#FFD100] border-2 border-[#18181B] text-[#18181B]">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-black text-[#18181B] group-hover:text-[#E30613] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-stone-600">
                    {item.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs text-stone-500 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t-2 border-stone-100">
                  <a
                    href={item.linkHref}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#18181B] group-hover:text-[#E30613] transition-colors"
                  >
                    <span>{item.linkText}</span>
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
