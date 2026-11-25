import { useState } from 'react';
import { Briefcase } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  fallbackTitle?: string;
  fallbackCode?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

/**
 * Optimizes image delivery: converts to high-compression WebP
 * reducing payload by up to 90-95% while keeping visual clarity crisp.
 */
export function getOptimizedImageUrl(src: string, width = 600, quality = 80): string {
  if (!src) return src;
  // If it's a data URL, SVG, or already through an optimizer, keep as-is
  if (src.startsWith('data:') || src.endsWith('.svg') || src.includes('wsrv.nl')) {
    return src;
  }

  // Handle local relative paths
  let fullTarget = src;
  if (src.startsWith('/')) {
    fullTarget = `techno-laghouat.pages.dev${src}`;
  } else if (src.startsWith('http://') || src.startsWith('https://')) {
    fullTarget = src.replace(/^https?:\/\//, '');
  }

  return `https://wsrv.nl/?url=${encodeURIComponent(fullTarget)}&w=${width}&output=webp&q=${quality}&we=1`;
}

export function ProductImage({
  src,
  alt,
  fallbackTitle,
  fallbackCode,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
}: ProductImageProps) {
  const [triedOptimized, setTriedOptimized] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Try high-efficiency WebP URL first, with auto-fallback to raw src if proxy fails
  const currentSrc = triedOptimized ? getOptimizedImageUrl(src, 600, 80) : src;

  const handleError = () => {
    if (triedOptimized) {
      // Failed on optimized proxy: fallback cleanly to raw uncompressed source
      setTriedOptimized(false);
    } else {
      // Both failed: show fallback UI
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2F0EB] text-[#52525B] p-6 text-center">
        <Briefcase className="w-8 h-8 text-[#E30613] mb-3" strokeWidth={1.6} aria-hidden="true" />
        <p className="font-display text-sm font-semibold text-[#18181B]">{fallbackTitle}</p>
        {fallbackCode ? (
          <p className="mt-1 font-mono text-xs text-[#71717A]">{fallbackCode}</p>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
}
