import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react';
import type { Product } from '../data/products';
import {
  formatDzd,
  getProductCategoryLabel,
  getProductImages,
  getProductUnitPrice,
  resolveProductVariant,
} from '../utils/storeLogic';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product, variantId?: string) => void;
  onOpenDetails: (product: Product) => void;
}

export function ProductCard({
  product,
  quantityInCart,
  onAddToCart,
  onOpenDetails,
}: ProductCardProps) {
  const images = getProductImages(product);
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [imageIdx, setImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    variants[0]?.id,
  );

  useEffect(() => {
    setImageIdx(0);
    setSelectedVariantId(product.variants?.[0]?.id);
  }, [product.id, product.variants]);

  const activeVariant = resolveProductVariant(product, selectedVariantId);
  const activePrice = getProductUnitPrice(product, activeVariant?.id);
  const categoryLabel = getProductCategoryLabel(product);
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="group flex flex-col bg-white border border-stone-200/90 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#FFD100]"
    >
      {/* Square Image Container with Interactive Multi-Photo Switcher */}
      <div className="relative aspect-square w-full bg-[#F5F4EF] overflow-hidden">
        <button
          type="button"
          onClick={() => onOpenDetails(product)}
          aria-label={`عرض صفحة وتفاصيل ${product.name}`}
          className="w-full h-full block text-right cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#E30613]"
        >
          <ProductImage
            src={images[imageIdx] ?? images[0]}
            alt={product.alt}
            fallbackTitle={product.name}
            fallbackCode={product.sku}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </button>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label={`الصورة السابقة لـ ${product.shortName}`}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/90 text-[#18181B] border border-stone-200/80 shadow-xs inline-flex items-center justify-center hover:bg-[#18181B] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label={`الصورة التالية لـ ${product.shortName}`}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/90 text-[#18181B] border border-stone-200/80 shadow-xs inline-flex items-center justify-center hover:bg-[#18181B] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div
              aria-hidden="true"
              className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono tabular-nums"
            >
              {imageIdx + 1}/{images.length}
            </div>
          </>
        ) : null}
      </div>

      {/* Card Body with Uniform Vertical Rhythm */}
      <div className="flex flex-col flex-1 p-5">
        {/* Clean Unboxed Metadata Line */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#71717A]">
          <span className="font-semibold text-[#52525B] truncate">{categoryLabel}</span>
          <span className="font-mono shrink-0 text-[#71717A]">رقم #{product.sku}</span>
        </div>

        <h3 className="mt-2 min-h-[3.25rem] font-display text-lg font-bold text-[#18181B] leading-snug">
          <button
            type="button"
            onClick={() => onOpenDetails(product)}
            className="text-right hover:text-[#E30613] transition-colors cursor-pointer"
          >
            {product.name}
          </button>
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-[#52525B] line-clamp-2 flex-1">
          {product.summary}
        </p>

        {/* Interactive Size / Variant Selector right on the Card */}
        {variants.length > 0 ? (
          <div className="mt-3.5 pt-3 border-t border-stone-100">
            <p className="text-[11px] font-semibold text-[#71717A] mb-1.5">
              اختر القياس (يتغير السعر فوراً):
            </p>
            <div
              role="group"
              aria-label={`قياسات ${product.shortName}`}
              className="flex flex-wrap gap-1.5"
            >
              {variants.map((variant) => {
                const isSelected = activeVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    data-testid={`card-variant-${product.id}-${variant.id}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-3 py-1.5 min-h-[34px] rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E30613] bg-[#E30613] text-white shadow-2xs'
                        : 'border-stone-200 bg-[#FAF9F6] text-[#18181B] hover:border-[#FFD100]'
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Price & Availability Row */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-baseline justify-between gap-3">
          <span
            data-testid={`card-price-${product.id}`}
            className="font-display text-xl font-black text-[#18181B] tabular-nums"
          >
            {formatDzd(activePrice)}
          </span>
          <span className="text-xs font-semibold text-[#52525B]">
            {product.availabilityText}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-12 gap-2.5">
          <button
            type="button"
            data-testid={`card-add-${product.id}`}
            onClick={() => onAddToCart(product, activeVariant?.id)}
            aria-label={`إضافة ${product.shortName}${activeVariant ? ` (${activeVariant.label})` : ''} إلى السلة`}
            className={`col-span-8 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[46px] rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E30613] ${
              quantityInCart > 0
                ? 'bg-[#18181B] text-white hover:bg-[#E30613] shadow-xs'
                : 'bg-[#E30613] text-white hover:bg-[#C4000F] shadow-md'
            }`}
          >
            {quantityInCart > 0 ? (
              <>
                <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>في السلة ({quantityInCart}) · أضف</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>إضافة للسلة</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid={`card-details-${product.id}`}
            onClick={() => onOpenDetails(product)}
            aria-label={`عرض تفاصيل ${product.shortName}`}
            className="col-span-4 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[46px] rounded-xl border-2 border-stone-300 bg-white text-[#18181B] text-sm font-bold hover:border-[#18181B] transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]"
          >
            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>التفاصيل</span>
          </button>
        </div>
      </div>
    </article>
  );
}
