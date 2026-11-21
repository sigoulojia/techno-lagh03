import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
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
    <motion.article
      data-testid={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col bg-white border-2 border-[#18181B] rounded-2xl overflow-hidden transition-all duration-200 shadow-[4px_4px_0px_#18181B] hover:shadow-[7px_7px_0px_#E30613]"
    >
      {/* Square Image Container with Interactive Multi-Photo Switcher */}
      <div className="relative aspect-square w-full bg-[#F5F4EF] overflow-hidden border-b-2 border-[#18181B]">
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </button>

        {/* Authentic Stationery Stamps on Product Image */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <span className="stamp-yellow text-[10px] font-black shadow-xs">
            رقم #{product.sku}
          </span>
        </div>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label={`الصورة السابقة لـ ${product.shortName}`}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/95 text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] inline-flex items-center justify-center hover:bg-[#FFD100] transition-colors cursor-pointer z-10 active:translate-x-0.5 active:translate-y-0.5"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label={`الصورة التالية لـ ${product.shortName}`}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/95 text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] inline-flex items-center justify-center hover:bg-[#FFD100] transition-colors cursor-pointer z-10 active:translate-x-0.5 active:translate-y-0.5"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div
              aria-hidden="true"
              className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#18181B]/80 text-[#FFD100] text-[11px] font-mono font-bold tabular-nums z-10"
            >
              {imageIdx + 1}/{images.length}
            </div>
          </>
        ) : null}
      </div>

      {/* Card Body with Uniform Vertical Rhythm */}
      <div className="flex flex-col flex-1 p-5 bg-[#FAF8F5]">
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#E30613] bg-[#E30613]/10 px-2 py-0.5 rounded border border-[#E30613]/20">
            {categoryLabel}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {product.availabilityText}
          </span>
        </div>

        <h3 className="mt-2.5 min-h-[3.25rem] font-display text-base sm:text-lg font-black text-[#18181B] leading-snug">
          <button
            type="button"
            onClick={() => onOpenDetails(product)}
            className="text-right hover:text-[#E30613] transition-colors cursor-pointer"
          >
            {product.name}
          </button>
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#52525B] line-clamp-2 flex-1">
          {product.summary}
        </p>

        {/* Highlights Tags */}
        {product.highlights && product.highlights.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {product.highlights.slice(0, 2).map((h, i) => (
              <span
                key={i}
                className="text-[10px] font-bold text-stone-700 bg-white border border-stone-300 px-1.5 py-0.5 rounded"
              >
                ✓ {h}
              </span>
            ))}
          </div>
        ) : null}

        {/* Interactive Size / Variant Selector right on the Card */}
        {variants.length > 0 ? (
          <div className="mt-3 pt-3 border-t-2 border-stone-200">
            <p className="text-[11px] font-bold text-[#18181B] mb-1.5">
              اختر الموديل أو القياس:
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
                    className={`px-2.5 py-1 min-h-[32px] rounded-lg border-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#18181B] bg-[#FFD100] text-[#18181B] shadow-[2px_2px_0px_#18181B]'
                        : 'border-stone-300 bg-white text-[#18181B] hover:border-[#18181B]'
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
        <div className="mt-4 pt-3 border-t-2 border-stone-200 flex items-baseline justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#71717A] block">السعر الصافي:</span>
            <span
              data-testid={`card-price-${product.id}`}
              className="font-display text-xl font-black text-[#18181B] tabular-nums highlight-yellow"
            >
              {formatDzd(activePrice)}
            </span>
          </div>
          <span className="stamp-red text-[10px]">ضمان تكنو</span>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-12 gap-2">
          <button
            type="button"
            data-testid={`card-add-${product.id}`}
            onClick={() => onAddToCart(product, activeVariant?.id)}
            aria-label={`إضافة ${product.shortName}${activeVariant ? ` (${activeVariant.label})` : ''} إلى السلة`}
            className={`col-span-8 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] transition-all duration-150 whitespace-nowrap cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E30613] ${
              quantityInCart > 0
                ? 'bg-[#FFD100] text-[#18181B] hover:bg-[#E5BC00]'
                : 'bg-[#E30613] text-white hover:bg-[#C4000F]'
            }`}
          >
            {quantityInCart > 0 ? (
              <>
                <Check className="w-4 h-4 shrink-0 text-[#18181B]" aria-hidden="true" />
                <span>في السلة ({quantityInCart})</span>
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
            className="col-span-4 inline-flex items-center justify-center gap-1 px-2.5 py-2.5 min-h-[44px] rounded-xl border-2 border-[#18181B] bg-white text-[#18181B] text-xs sm:text-sm font-bold shadow-[2px_2px_0px_#18181B] hover:bg-[#FFD100] transition-colors duration-150 whitespace-nowrap cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>معاينة</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
