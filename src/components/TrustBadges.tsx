import { ShieldCheck, Truck, Banknote, Headphones } from 'lucide-react';

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'أصالة تكنو المضمونة 100%',
    subtitle: 'منتجات أصلية مباشرة من المصدر',
    description:
      'كافة الأدوات والمستلزمات معتمدة مباشرة من علامة TECHNO STATIONERY الرسمية مع ضمان خلوها التام من التقليد.',
    tag: 'جودة معتمدة',
    color: 'from-[#FFD100]/20 to-transparent',
    iconColor: 'text-[#18181B]',
    borderColor: 'border-[#FFD100]/40',
  },
  {
    icon: Truck,
    title: 'شحن سريع عبر ZR Express',
    subtitle: 'تغطية 54 ولاية و24 بلدية بالأغواط',
    description:
      'خدمة توصيل لباب المنزل (À Domicile) أو استلام اقتصادي من المكتب (Stop Desk) مع تغليف واقٍ متين لكل طرد.',
    tag: 'توصيل 24–72 ساعة',
    color: 'from-[#E30613]/10 to-transparent',
    iconColor: 'text-[#E30613]',
    borderColor: 'border-[#E30613]/25',
  },
  {
    icon: Banknote,
    title: 'الدفع عند المعاينة والاستلام',
    subtitle: 'أمان وثقة تامة بدون دفع مسبق',
    description:
      'لا تحتاج لبطاقة بنكية، اطلب بسهولة عبر الموقع وادفع نقداً لمندوب ZR Express عند استلام الطرد والتأكد من طلبيتك.',
    tag: 'دفع نقدي 100%',
    color: 'from-emerald-500/10 to-transparent',
    iconColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
  },
  {
    icon: Headphones,
    title: 'فريق دعم فرع الأغواط',
    subtitle: 'استشارات واختيار المقاسات هاتفياً',
    description:
      'فريقنا متواجد يومياً في متجر الأغواط لمساعدتكم في اختيار قياسات الحقائب واللوازم والمتابعة المباشرة لطلباتكم.',
    tag: 'دعم محلي فوري',
    color: 'from-amber-500/10 to-transparent',
    iconColor: 'text-amber-800',
    borderColor: 'border-amber-300',
  },
];

export function TrustBadges() {
  return (
    <section className="py-10 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative group p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${item.color} border ${item.borderColor} hover:border-[#E30613] hover:shadow-lg transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-stone-200/80 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-stone-200/80 text-[#18181B] shadow-2xs">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-[#18181B] group-hover:text-[#E30613] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#52525B]">
                    {item.subtitle}
                  </p>
                  <p className="mt-2 text-xs text-[#71717A] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
