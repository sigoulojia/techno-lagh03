import { useEffect, useState } from 'react';
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import type { Product } from '../data/products';
import {
  formatDzd,
  getProductCategoryLabel,
  getProductImages,
  getProductUnitPrice,
  resolveProductVariant,
} from '../utils/storeLogic';
import { ProductImage } from './ProductImage';

interface ProductModalProps {
  product: Product | null;
  products?: Product[];
  onClose: () => void;
  onSwitchProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, variantId?: string) => void;
  onOrderNow: (product: Product, quantity: number, variantId?: string) => void;
}

export function ProductModal({
  product,
  products,
  onClose,
  onSwitchProduct,
  onAddToCart,
  onOrderNow,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product?.variants?.[0]?.id,
  );

  useEffect(() => {
    setQuantity(1);
    setActiveImageIdx(0);
    setSelectedVariantId(product?.variants?.[0]?.id);
  }, [product?.id, product?.variants]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const catalog = products ?? [];
  const images = getProductImages(product);
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const activeVariant = resolveProductVariant(product, selectedVariantId);
  const unitPrice = getProductUnitPrice(product, activeVariant?.id);
  const siblingProducts = (product.siblingIds || [])
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        data-testid="product-detail-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-stone-200 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
          <p className="text-xs text-[#71717A] truncate">
            <span className="font-semibold text-[#18181B]">
              {getProductCategoryLabel(product)}
            </span>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <span className="font-mono">رقم #{product.sku}</span>
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق تفاصيل المنتج"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#52525B] hover:text-[#18181B] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Contiguous Two-Column Purchase Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Square Product Image & Thumbnails */}
          <div className="md:col-span-6 space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F4EF] border border-stone-200/80">
              <ProductImage
                src={images[activeImageIdx] ?? images[0]}
                alt={product.alt}
                fallbackTitle={product.name}
                fallbackCode={product.sku}
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 ? (
              <div className="grid grid-cols-5 gap-2">
                {images.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`صورة ${idx + 1}`}
                    aria-pressed={idx === activeImageIdx}
                    className={`aspect-square rounded-lg overflow-hidden border cursor-pointer ${
                      idx === activeImageIdx
                        ? 'border-[#E30613] ring-2 ring-[#E30613]/20'
                        : 'border-stone-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <ProductImage
                      src={imgUrl}
                      alt={product.shortName}
                      fallbackTitle={product.shortName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Sibling Color Selector */}
            {siblingProducts.length > 1 ? (
              <div className="pt-2">
                <p className="text-xs font-medium text-[#52525B] mb-2">
                  الألوان المتوفرة لهذا الموديل:
                </p>
                <div className="flex flex-wrap gap-2">
                  {siblingProducts.map((sibling) => {
                    const isCurrent = sibling.id === product.id;
                    return (
                      <button
                        key={sibling.id}
                        type="button"
                        onClick={() => onSwitchProduct(sibling)}
                        aria-pressed={isCurrent}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                          isCurrent
                            ? 'border-[#E30613] bg-[#E30613]/5 text-[#18181B]'
                            : 'border-stone-200 bg-white text-[#52525B] hover:border-stone-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: sibling.colorHex || '#18181B' }}
                          aria-hidden="true"
                        />
                        <span>{sibling.colorName || sibling.shortName}</span>
                        <span className="font-mono text-xs text-[#71717A]">
                          ({sibling.sku})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Contiguous Purchase Module */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <h2
                id="product-modal-title"
                className="font-display text-2xl font-bold text-[#18181B] leading-snug"
              >
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline justify-between gap-4 pb-4 border-b border-stone-200">
                <p className="font-display text-2xl font-bold text-[#E30613] tabular-nums">
                  {formatDzd(unitPrice)}
                </p>
                <p className="text-sm font-medium text-[#18181B]">
                  {product.availabilityText}
                </p>
              </div>

              {/* Variants */}
              {variants.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-[#18181B]">اختر القياس:</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                      const isSelected = activeVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariantId(variant.id)}
                          aria-pressed={isSelected}
                          className={`px-3 py-2 min-h-[40px] rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-[#E30613] bg-[#E30613] text-white'
                              : 'border-stone-200 bg-white text-[#18181B] hover:border-stone-400'
                          }`}
                        >
                          {variant.label} · {formatDzd(variant.priceDzd)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <p className="mt-4 text-sm sm:text-[15px] leading-[1.75] text-[#52525B]">
                {product.description}
              </p>

              {product.highlights && product.highlights.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm text-[#18181B]">
                  {product.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check
                        className="w-4 h-4 text-[#E30613] mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {product.specs && product.specs.length > 0 ? (
                <dl className="mt-5 pt-4 border-t border-stone-200 space-y-2.5 text-sm">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-start justify-between gap-4"
                    >
                      <dt className="text-[#71717A] shrink-0">{spec.label}</dt>
                      <dd className="text-[#18181B] font-medium text-left">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {/* Quantity + Primary Purchase Buttons */}
            <div className="mt-6 pt-5 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[#18181B]">الكمية المطلوبة</span>
                <div className="inline-flex items-center border border-stone-300 rounded-lg bg-[#FAF9F6]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="إنقاص الكمية"
                    className="w-10 h-10 inline-flex items-center justify-center text-[#18181B] hover:bg-stone-200/70 rounded-r-lg cursor-pointer"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span
                    data-testid="modal-quantity-value"
                    className="w-12 text-center font-mono text-sm font-semibold tabular-nums"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    aria-label="زيادة الكمية"
                    className="w-10 h-10 inline-flex items-center justify-center text-[#18181B] hover:bg-stone-200/70 rounded-l-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity, activeVariant?.id);
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-lg border border-[#18181B] bg-white text-[#18181B] text-sm font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>إضافة إلى السلة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOrderNow(product, quantity, activeVariant?.id);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-lg bg-[#E30613] text-white text-sm font-semibold hover:bg-[#C4000F] transition-colors cursor-pointer"
                >
                  <span>اطلب الآن · {formatDzd(unitPrice * quantity)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
