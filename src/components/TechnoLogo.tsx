import React from 'react';

interface TechnoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBranch?: boolean;
}

/**
 * Official TECHNO STATIONERY Logo Component
 * Faithfully matches the official brand identity:
 * - Techno Yellow (#FFD100)
 * - Techno Racing Red (#E30613)
 * - Crisp Carbon Ink (#18181B)
 */
export function TechnoLogo({
  className = '',
  size = 'md',
  showBranch = true,
}: TechnoLogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Authentic TECHNO Logo Badge */}
      <div
        className={`relative inline-flex items-center bg-[#FFD100] border border-[#E5BC00] rounded-xl px-2.5 py-1 shadow-xs select-none transition-transform duration-200 hover:scale-[1.02] ${sizeClasses[size]}`}
      >
        <img
          src="/assets/techno-logo.jpg"
          alt="TECHNO STATIONERY"
          className="h-full w-auto object-contain rounded-lg"
          onError={(e) => {
            // In case of asset fallback, render SVG inline
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Fallback Vector Representation if image isn't loaded */}
        <div className="flex items-center gap-2 h-full">
          {/* Red square with white stylized T */}
          <div className="h-[80%] aspect-square bg-[#E30613] rounded-md flex items-center justify-center font-black text-white italic text-lg shadow-xs">
            <span className="transform -skew-x-12 translate-x-px">T</span>
          </div>

          {/* TECHNO STATIONERY Text Block */}
          <div className="flex flex-col justify-center leading-none">
            <span className="font-display font-black italic tracking-wider text-[#E30613] text-sm sm:text-base leading-none">
              TECHNO
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] text-[#18181B] uppercase leading-tight mt-0.5">
              STATIONERY
            </span>
          </div>
        </div>
      </div>

      {/* Branch pill badge */}
      {showBranch && (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-[#18181B] text-[#FFD100] font-display text-xs font-bold tracking-tight shadow-xs">
          فرع الأغواط
        </span>
      )}
    </div>
  );
}
