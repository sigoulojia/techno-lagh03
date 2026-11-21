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
    <section className="py-12 bg-white border-b border-stone-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative group p-6 rounded-3xl bg-gradient-to-b ${item.color} border-2 ${item.borderColor} hover:border-[#E30613] hover:shadow-xl transition-all duration-300 flex flex-col justify-between shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.iconBg} shadow-md flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-stone-200 text-[#18181B] shadow-2xs">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-[#18181B] group-hover:text-[#E30613] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-[#52525B]">
                    {item.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs text-[#71717A] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-200/60">
                  <a
                    href={item.linkHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#18181B] group-hover:text-[#E30613] transition-colors"
                  >
                    <span>{item.linkText}</span>
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
