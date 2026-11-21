import { ArrowRight, PackageX, Phone, ShoppingBag } from 'lucide-react';
import { STORE_INFO, type Product } from '../data/products';
import { ProductCard } from './ProductCard';

interface ProductNotFoundPageProps {
  requestedId: string;
  allProducts: Product[];
  cartCount: number;
  onBackToHome: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, variantId?: string) => void;
  onOpenCart: () => void;
}

export function ProductNotFoundPage({
  requestedId,
  allProducts,
  cartCount,
  onBackToHome,
  onSelectProduct,
  onAddToCart,
  onOpenCart,
}: ProductNotFoundPageProps) {
  const suggestions = allProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-lined-paper text-[#18181B] pb-24">
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b-4 border-[#FFD100] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#18181B] hover:text-[#E30613] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            <span>العودة للمتجر الرئيسي</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href={STORE_INFO.phoneHref}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-[#18181B] hover:border-[#E30613] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#E30613]" aria-hidden="true" />
              <span dir="ltr" className="font-mono">
                {STORE_INFO.phoneDisplay}
              </span>
            </a>

            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#18181B] text-white text-xs sm:text-sm font-medium hover:bg-[#E30613] transition-colors cursor-pointer"
              aria-label="فتح سلة الطلب"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span className="font-mono text-xs tabular-nums">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-stone-200 text-[#E30613] flex items-center justify-center mx-auto mb-5">
            <PackageX className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />
          </div>

          <p className="text-xs font-semibold text-[#E30613] mb-2">
            المعروض غير متوفر حالياً · رقم المنتج #{requestedId}
          </p>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#18181B] mb-3">
            عذراً، هذا المنتج غير متوفر أو تم حذفه
          </h1>

          <p className="text-sm sm:text-base text-[#52525B] leading-relaxed max-w-xl mx-auto mb-8">
            يبدو أن هذا المعروض المنشور عبر الرابط قد نفدت كميته بالكامل من فرع تكنو الأغواط، أو تم
            إيقاف عرضه وتحديث تشكيلة المتجر. يمكنك التواصل معنا للاستفسار عنه، أو تصفح باقي
            المعروضات المتوفرة الآن في الفرع.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#E30613] text-white text-sm font-semibold hover:bg-[#C4000F] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>تصفح معروضات المتجر المتوفرة</span>
            </button>

            <a
              href={STORE_INFO.phoneHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl border border-stone-300 bg-white text-[#18181B] text-sm font-semibold hover:bg-stone-50 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#E30613] shrink-0" aria-hidden="true" />
              <span>اتصال مباشر للاستفسار:</span>
              <span dir="ltr" className="font-mono">
                {STORE_INFO.phoneDisplay}
              </span>
            </a>
          </div>
        </div>

        {suggestions.length > 0 ? (
          <section className="mt-14 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#18181B]">
                  معروضات أخرى متوفرة حالياً في الفرع
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  متوفرة للاستلام الفوري من متجر تكنو الأغواط أو التوصيل لـ 69 ولاية
                </p>
              </div>

              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs font-semibold text-[#E30613] hover:underline cursor-pointer"
              >
                عرض كل المنتجات ({allProducts.length}) »
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {suggestions.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  quantityInCart={0}
                  onAddToCart={(prod, variantId) =>
                    onAddToCart ? onAddToCart(prod, variantId) : onSelectProduct(prod)
                  }
                  onOpenDetails={onSelectProduct}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
