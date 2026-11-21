import { useState } from 'react';
import { Briefcase } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackCode?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function ProductImage({
  src,
  alt,
  fallbackTitle,
  fallbackCode,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

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
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
