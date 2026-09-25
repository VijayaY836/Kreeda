import React from 'react';
import { KolamCorner } from './FolkArtMotifs';

interface FolkArtFrameProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  hasCorners?: boolean;
  bg?: string;
  accentHeader?: React.ReactNode;
}

export const FolkArtFrame: React.FC<FolkArtFrameProps> = ({
  children,
  className = '',
  id,
  hasCorners = false,
  bg = 'bg-[#F6EFDE]',
  accentHeader,
}) => {
  return (
    <div id={id} className={`relative ${bg} border border-[#C7A467]/70 rounded-2xl shadow-[0_8px_24px_rgba(42,30,20,0.10)] p-5 sm:p-7 ${className}`}>
      {hasCorners && (
        <>
          <div className="absolute top-1 left-1 pointer-events-none">
            <KolamCorner position="top-left" size={24} />
          </div>
          <div className="absolute top-1 right-1 pointer-events-none">
            <KolamCorner position="top-right" size={24} />
          </div>
          <div className="absolute bottom-1 left-1 pointer-events-none">
            <KolamCorner position="bottom-left" size={24} />
          </div>
          <div className="absolute bottom-1 right-1 pointer-events-none">
            <KolamCorner position="bottom-right" size={24} />
          </div>
        </>
      )}
      {accentHeader && <div className="mb-4">{accentHeader}</div>}
      {children}
    </div>
  );
};
