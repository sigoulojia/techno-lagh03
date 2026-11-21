import { useState } from 'react';

interface TechnoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBranch?: boolean;
}

/**
 * Official TECHNO STATIONERY Logo Component
 * Faithfully matches the official brand identity from the image attachment:
 * - Techno Yellow (#FFD100)
 * - Techno Racing Red (#E30613)
 * - Carbon Ink (#18181B)
 */
export function TechnoLogo({
  className = '',
  size = 'md',
  showBranch = true,
}: TechnoLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official TECHNO Logo Badge */}
      <div
        className={`relative inline-flex items-center bg-[#FFD100] border-2 border-[#18181B] rounded-xl px-2 py-0.5 shadow-[2px_2px_0px_#18181B] select-none transition-transform duration-200 hover:scale-[1.02] ${sizeClasses[size]}`}
      >
        {!imgError ? (
          <img
            src="/assets/techno-logo.jpg"
            alt="TECHNO STATIONERY"
            className="h-full w-auto object-contain rounded-md"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-Fidelity Vector Replica if image fails to load */
          <div className="flex items-center gap-1.5 h-full px-1">
            <div className="h-[80%] aspect-square bg-[#E30613] rounded flex items-center justify-center font-black text-white italic text-base shadow-xs">
              <span className="transform -skew-x-12">T</span>
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-display font-black italic tracking-wider text-[#E30613] text-sm leading-none">
                TECHNO
              </span>
              <span className="text-[7px] font-black tracking-[0.22em] text-[#18181B] uppercase leading-tight mt-0.5">
                STATIONERY
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Branch pill badge */}
      {showBranch && (
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-[#18181B] text-[#FFD100] font-display text-xs font-black tracking-tight shadow-[2px_2px_0px_#18181B]">
          فرع الأغواط
        </span>
      )}
    </div>
  );
}
