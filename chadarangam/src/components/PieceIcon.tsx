import React from 'react';
import { PieceLetter, Variant } from '../types';
import { ART_VIEWBOX, getArt } from '../utils/pieceArt';

interface PieceIconProps {
  variant: Variant;
  letter: PieceLetter;
  ivory: boolean; // true = Ivory/White, false = Ebony/Black
  className?: string;
  small?: boolean; // Chaturangam pawns render slightly smaller, like the legacy .piece-pawn class
}

/** Ivory pieces: cream fill, maroon stroke. Ebony pieces: maroon fill, marigold stroke —
 *  the same flat two-tone logic Daadi Aata uses for its P1/P2 pieces. */
export const PieceIcon: React.FC<PieceIconProps> = ({ variant, letter, ivory, className = '', small = false }) => {
  const fill = ivory ? '#F6ECD2' : '#5C140F';
  const stroke = ivory ? '#5C140F' : '#EFA90C';
  const inner = getArt(variant, letter);

  return (
    <svg
      viewBox={ART_VIEWBOX[variant]}
      className={`${className} ${small ? 'scale-[0.82]' : ''}`}
      style={{ ['--pc-fill' as string]: fill, ['--pc-stroke' as string]: stroke }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
};
