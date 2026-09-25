import React from 'react';

interface MotifProps {
  className?: string;
  size?: number;
  color?: string;
}

export const LotusIcon: React.FC<MotifProps> = ({ className = '', size = 28, color = '#D8401F' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Center petal */}
    <path
      d="M24 6 C20 18, 20 28, 24 38 C28 28, 28 18, 24 6 Z"
      fill={color}
      stroke="#5C140F"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Left inner petal */}
    <path
      d="M24 16 C16 20, 12 28, 16 36 C20 37, 23 37, 24 36 C21 28, 22 21, 24 16 Z"
      fill={color}
      stroke="#5C140F"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Right inner petal */}
    <path
      d="M24 16 C32 20, 36 28, 32 36 C28 37, 25 37, 24 36 C27 28, 26 21, 24 16 Z"
      fill={color}
      stroke="#5C140F"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Left outer petal */}
    <path
      d="M17 26 C9 30, 8 36, 11 41 C15 42, 19 40, 21 37 C18 33, 17 29, 17 26 Z"
      fill="#F6ECD2"
      stroke="#5C140F"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Right outer petal */}
    <path
      d="M31 26 C39 30, 40 36, 37 41 C33 42, 29 40, 27 37 C30 33, 31 29, 31 26 Z"
      fill="#F6ECD2"
      stroke="#5C140F"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Base stem / pod */}
    <path
      d="M19 39 C22 43, 26 43, 29 39 C26 41, 22 41, 19 39 Z"
      fill="#5C140F"
      stroke="#5C140F"
      strokeWidth="1.5"
    />
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform={transform}>
        <path d="M2 2 L2 18 L6 18 L6 6 L18 6 L18 2 Z" fill="#5C140F" />
        <circle cx="12" cy="12" r="3" fill="#D8401F" stroke="#5C140F" strokeWidth="1.5" />
        <circle cx="6" cy="24" r="2" fill="#5C140F" />
        <circle cx="24" cy="6" r="2" fill="#5C140F" />
      </g>
    </svg>
  );
};

export const FolkDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-2 py-2 ${className}`}>
    <div className="h-[2px] w-12 bg-[#5C140F]" />
    <div className="w-2.5 h-2.5 rotate-45 bg-[#D8401F] border-2 border-[#5C140F]" />
    <div className="w-3.5 h-3.5 rotate-45 bg-[#EFA90C] border-2 border-[#5C140F]" />
    <div className="w-2.5 h-2.5 rotate-45 bg-[#D8401F] border-2 border-[#5C140F]" />
    <div className="h-[2px] w-12 bg-[#5C140F]" />
  </div>
);

export const CowrieShellIcon: React.FC<MotifProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <ellipse cx="16" cy="16" rx="10" ry="14" fill="#F6ECD2" stroke="#5C140F" strokeWidth="2.5" />
    <path d="M16 6 C14 12, 14 20, 16 26" stroke="#5C140F" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 11 L16 12 M12 15 L16 16 M12 19 L16 20 M20 11 L16 12 M20 15 L16 16 M20 19 L16 20" stroke="#5C140F" strokeWidth="1.5" />
  </svg>
);

export const WoodenPebbleIcon: React.FC<MotifProps> = ({ size = 24, className = '', color = '#D8401F' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="12" fill={color} stroke="#5C140F" strokeWidth="2.5" />
    <circle cx="16" cy="16" r="7" fill="#F6ECD2" stroke="#5C140F" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="2.5" fill="#5C140F" />
  </svg>
);
