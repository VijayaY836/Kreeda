import React from 'react';
import { KolamCorner } from './FolkArtMotifs';

interface FolkArtFrameProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  hasCorners?: boolean;
  bg?: string; // background color class
  accentHeader?: React.ReactNode;
}

export const FolkArtFrame: React.FC<FolkArtFrameProps> = ({
  children,
  className = '',
  id,
  hasCorners = true,
  bg = 'bg-[#F6ECD2]',
  accentHeader,
}) => {
  return (
    <div
      id={id}
      className={`relative ${bg} border-[3px] border-[#5C140F] p-5 sm:p-7 ${className}`}
    >
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
