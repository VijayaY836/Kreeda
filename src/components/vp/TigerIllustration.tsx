export function TigerIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="tiger-illustration" aria-hidden="true">
      {/* Body */}
      <ellipse cx="55" cy="48" rx="28" ry="16" fill="#D4881C" stroke="#5C140F" strokeWidth="1.2" />
      <ellipse cx="55" cy="48" rx="26" ry="14" fill="#E8A020" />

      {/* Stripes on body */}
      <path d="M40 38 Q42 48 40 58" stroke="#5C140F" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M48 36 Q50 48 48 60" stroke="#5C140F" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M56 35 Q58 48 56 60" stroke="#5C140F" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M64 36 Q66 48 64 59" stroke="#5C140F" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M72 38 Q74 48 72 57" stroke="#5C140F" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Head */}
      <circle cx="88" cy="40" r="12" fill="#E8A020" stroke="#5C140F" strokeWidth="1.2" />

      {/* Ears */}
      <ellipse cx="82" cy="30" rx="4" ry="5" fill="#E8A020" stroke="#5C140F" strokeWidth="1" />
      <ellipse cx="82" cy="30" rx="2.5" ry="3" fill="#D4881C" />
      <ellipse cx="94" cy="30" rx="4" ry="5" fill="#E8A020" stroke="#5C140F" strokeWidth="1" />
      <ellipse cx="94" cy="30" rx="2.5" ry="3" fill="#D4881C" />

      {/* Face details */}
      <circle cx="85" cy="38" r="1.8" fill="#5C140F" />
      <circle cx="91" cy="38" r="1.8" fill="#5C140F" />
      <circle cx="85.5" cy="37.5" r="0.6" fill="#EFDFB8" />
      <circle cx="91.5" cy="37.5" r="0.6" fill="#EFDFB8" />

      {/* Nose */}
      <path d="M86.5 42 L88 44 L89.5 42 Z" fill="#B3261E" stroke="#5C140F" strokeWidth="0.6" />

      {/* Mouth */}
      <path d="M88 44 Q86 46 85 45" stroke="#5C140F" strokeWidth="0.6" fill="none" />
      <path d="M88 44 Q90 46 91 45" stroke="#5C140F" strokeWidth="0.6" fill="none" />

      {/* Whiskers */}
      <line x1="80" y1="43" x2="74" y2="41" stroke="#5C140F" strokeWidth="0.4" />
      <line x1="80" y1="44" x2="74" y2="44" stroke="#5C140F" strokeWidth="0.4" />
      <line x1="80" y1="45" x2="74" y2="47" stroke="#5C140F" strokeWidth="0.4" />
      <line x1="96" y1="43" x2="102" y2="41" stroke="#5C140F" strokeWidth="0.4" />
      <line x1="96" y1="44" x2="102" y2="44" stroke="#5C140F" strokeWidth="0.4" />
      <line x1="96" y1="45" x2="102" y2="47" stroke="#5C140F" strokeWidth="0.4" />

      {/* Forelegs */}
      <rect x="72" y="58" width="5" height="14" rx="2" fill="#E8A020" stroke="#5C140F" strokeWidth="0.8" />
      <rect x="80" y="58" width="5" height="14" rx="2" fill="#E8A020" stroke="#5C140F" strokeWidth="0.8" />
      <ellipse cx="74.5" cy="72" rx="3.5" ry="2" fill="#E8A020" stroke="#5C140F" strokeWidth="0.8" />
      <ellipse cx="82.5" cy="72" rx="3.5" ry="2" fill="#E8A020" stroke="#5C140F" strokeWidth="0.8" />

      {/* Hind legs */}
      <rect x="34" y="56" width="5" height="16" rx="2" fill="#D4881C" stroke="#5C140F" strokeWidth="0.8" />
      <rect x="42" y="56" width="5" height="16" rx="2" fill="#D4881C" stroke="#5C140F" strokeWidth="0.8" />
      <ellipse cx="36.5" cy="72" rx="3.5" ry="2" fill="#D4881C" stroke="#5C140F" strokeWidth="0.8" />
      <ellipse cx="44.5" cy="72" rx="3.5" ry="2" fill="#D4881C" stroke="#5C140F" strokeWidth="0.8" />

      {/* Tail */}
      <path d="M27 44 Q18 38 14 44 Q10 52 16 56" stroke="#5C140F" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M27 44 Q19 39 15 44 Q11 51 16 55" stroke="#D4881C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="55" r="2.5" fill="#5C140F" />

      {/* Belly highlight */}
      <ellipse cx="55" cy="54" rx="20" ry="5" fill="#F0C860" opacity="0.4" />

      {/* Decorative ground grass strokes */}
      <path d="M10 74 Q15 68 20 74" stroke="#5F8F3B" strokeWidth="0.8" fill="none" />
      <path d="M90 74 Q95 67 100 74" stroke="#5F8F3B" strokeWidth="0.8" fill="none" />
      <path d="M50 74 Q55 69 60 74" stroke="#5F8F3B" strokeWidth="0.6" fill="none" />
    </svg>
  )
}
