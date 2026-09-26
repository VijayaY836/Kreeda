import React from 'react';

interface MotifProps {
  className?: string;
  size?: number;
  color?: string;
}

export const LotusIcon: React.FC<MotifProps> = ({ className = '', size = 28, color = '#C0524A' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M24 6 C20 18, 20 28, 24 38 C28 28, 28 18, 24 6 Z" fill={color} stroke="#1F3B2E" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M24 16 C16 20, 12 28, 16 36 C20 37, 23 37, 24 36 C21 28, 22 21, 24 16 Z" fill={color} stroke="#1F3B2E" strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 16 C32 20, 36 28, 32 36 C28 37, 25 37, 24 36 C27 28, 26 21, 24 16 Z" fill={color} stroke="#1F3B2E" strokeWidth="2" strokeLinejoin="round" />
    <path d="M17 26 C9 30, 8 36, 11 41 C15 42, 19 40, 21 37 C18 33, 17 29, 17 26 Z" fill="#F6EFDE" stroke="#1F3B2E" strokeWidth="2" strokeLinejoin="round" />
    <path d="M31 26 C39 30, 40 36, 37 41 C33 42, 29 40, 27 37 C30 33, 31 29, 31 26 Z" fill="#F6EFDE" stroke="#1F3B2E" strokeWidth="2" strokeLinejoin="round" />
    <path d="M19 39 C22 43, 26 43, 29 39 C26 41, 22 41, 19 39 Z" fill="#1F3B2E" stroke="#1F3B2E" strokeWidth="1.5" />
  </svg>
);

export const KolamCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
}> = ({ position, className = '', size = 32 }) => {
  let transform = '';
  if (position === 'top-right') transform = 'rotate(90 16 16)';
  if (position === 'bottom-right') transform = 'rotate(180 16 16)';
  if (position === 'bottom-left') transform = 'rotate(270 16 16)';

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform={transform}>
        <path d="M2 2 L2 18 L6 18 L6 6 L18 6 L18 2 Z" fill="#1F3B2E" />
        <circle cx="12" cy="12" r="3" fill="#C0524A" stroke="#1F3B2E" strokeWidth="1.5" />
        <circle cx="6" cy="24" r="2" fill="#1F3B2E" />
        <circle cx="24" cy="6" r="2" fill="#1F3B2E" />
      </g>
    </svg>
  );
};

export const FolkDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-2 py-2 ${className}`}>
    <div className="h-0.5 w-12 bg-[#1F3B2E]" />
    <div className="w-2.5 h-2.5 rotate-45 bg-[#1F3B2E] border border-[#C7A467]/70 rounded-xl" />
    <div className="w-3.5 h-3.5 rotate-45 bg-[#C4881F] border border-[#C7A467]/70 rounded-xl" />
    <div className="w-2.5 h-2.5 rotate-45 bg-[#1F3B2E] border border-[#C7A467]/70 rounded-xl" />
    <div className="h-0.5 w-12 bg-[#1F3B2E]" />
  </div>
);

/* Sun-medallion motif for Yoga — echoes Surya Namaskar (sun salutation). */
export const SunMedallionIcon: React.FC<MotifProps> = ({ size = 24, className = '', color = '#1F3B2E' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="12" fill="#F6EFDE" stroke="#1F3B2E" strokeWidth="2.5" />
    <circle cx="16" cy="16" r="5.5" fill={color} stroke="#1F3B2E" strokeWidth="1.8" />
    <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.5 6.5l2.8 2.8M22.7 22.7l2.8 2.8M25.5 6.5l-2.8 2.8M9.3 22.7l-2.8 2.8" stroke="#1F3B2E" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* Mace/mudgar silhouette for Vyayam — the akhada strength-training tradition. */
export const MaceIcon: React.FC<MotifProps> = ({ size = 24, className = '', color = '#1F3B2E' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="12" fill="#F6EFDE" stroke="#1F3B2E" strokeWidth="2.5" />
    <path d="M16 8v13" stroke="#1F3B2E" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="16" cy="9" r="3.6" fill={color} stroke="#1F3B2E" strokeWidth="1.8" />
    <path d="M12 22h8" stroke="#1F3B2E" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/* Om-derived spiral for Dhyana — a settled, inward-turning mind. */
export const OmSpiralIcon: React.FC<MotifProps> = ({ size = 24, className = '', color = '#1F3A5C' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="12" fill="#F6EFDE" stroke="#1F3B2E" strokeWidth="2.5" />
    <circle cx="16" cy="16" r="7" fill="none" stroke={color} strokeWidth="2.2" />
    <circle cx="16" cy="16" r="2.6" fill={color} stroke="#1F3B2E" strokeWidth="1.4" />
    <path d="M16 9v-2M16 25v-2M9 16H7M25 16h-2" stroke="#1F3B2E" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
