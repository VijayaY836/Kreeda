import React, { useCallback, useRef, useState } from 'react';
import { X, Plus, Minus, RotateCcw } from 'lucide-react';
import { KolamCorner } from './FolkArtMotifs';
import { MAPW, MAPH, COUNTRIES, KASHMIR_PATCH_D, WAYPOINTS } from '../assets/worldGeo';

/* ============================================================
   A real world map (Natural Earth coastlines via world-atlas),
   projected once at build time into plain SVG paths — see
   scripts/gen-worldgeo.cjs. Pan and zoom operate on the SVG
   viewBox directly; nothing here is hand-drawn or approximated
   except the small Jammu & Kashmir / Ladakh patch documented
   below the country list.
   ============================================================ */

type LayerKey = 'origin' | 'persia' | 'europe' | 'eastward';

const LAYERS: Record<LayerKey, { title: string; color: string }> = {
  origin: { title: 'The Origin — India', color: '#D8401F' },
  persia: { title: 'Persia & the Islamic World', color: '#EFA90C' },
  europe: { title: 'Europe — the Modern Game', color: '#0E5C58' },
  eastward: { title: 'The Eastward Branch', color: '#D9587B' },
};
const LAYER_KEYS = Object.keys(LAYERS) as LayerKey[];

const HIGHLIGHT_COUNTRY: Record<string, LayerKey> = {
  India: 'origin',
  Iran: 'persia',
  Iraq: 'persia',
  Spain: 'europe',
  China: 'eastward',
  Japan: 'eastward',
};

interface Pin {
  wp: string; layer: LayerKey;
  place: string; name: string; when: string; text: string; how: string;
  origin?: boolean;
}

const PINS: Pin[] = [
  {
    wp: 'pataliputra', layer: 'origin', origin: true,
    place: 'Pataliputra, Gupta India', name: 'Chaturanga at a Gupta court', when: '~6th century CE',
    text: 'The earliest textual traces of Chaturanga — a four-division army game of infantry, cavalry, elephants and chariots — appear in Gupta-era Sanskrit sources.',
    how: 'No board from this era survives: the game is known only from literary references, not archaeology.',
  },
  {
    wp: 'hyderabad', layer: 'origin',
    place: 'Hyderabad, Telangana', name: 'Chaturangam / Chadarangam today', when: 'living tradition',
    text: "In Telugu, the old name is still used interchangeably with chess itself — a linguistic fossil of the two games' shared root.",
    how: 'Folk memory keeps a 1,500-year-old name alive in everyday speech, long after the rules themselves changed.',
  },
  {
    wp: 'ctesiphon', layer: 'persia',
    place: 'Ctesiphon, Sassanid Persia', name: 'Chaturanga becomes Shatranj', when: '~6th–7th century',
    text: 'Persian courts adopt the Indian game and rename it Shatranj — the Mantri becomes the Farzin (counsellor), the Gaja becomes the Pil (elephant).',
    how: 'The Persian epic Shahnameh preserves a legend of the game arriving as a diplomatic gift and riddle.',
  },
  {
    wp: 'baghdad', layer: 'persia',
    place: 'Baghdad, Abbasid Caliphate', name: 'Shatranj masters and opening theory', when: '9th century',
    text: 'Baghdad becomes a chess capital: players such as al-Adli and as-Suli write the first treatises on openings and endgames.',
    how: "Several of al-Adli's recorded endgame studies are still solvable, and correct, today.",
  },
  {
    wp: 'cordoba', layer: 'europe',
    place: 'Córdoba, Al-Andalus', name: 'Shatranj enters Europe', when: '~9th–10th century',
    text: 'Moorish Spain carries Shatranj across the Mediterranean, into a Christian Europe already trading — and warring — with the Islamic world.',
    how: 'Early Iberian and Italian manuscripts are among the first in Europe to describe the rules in writing.',
  },
  {
    wp: 'valencia', layer: 'europe',
    place: 'Valencia, Spain', name: 'The modern Queen is born', when: '1475',
    text: "Scachs d'amor, a Valencian poem from 1475, is the earliest surviving description of chess with the modern powerful queen and long-range bishop.",
    how: 'A specific, dated literary source for a rules change — rare in chess history.',
  },
  {
    wp: 'xian', layer: 'eastward',
    place: "Xi'an, Tang China", name: 'A separate branch: Xiangqi', when: 'diverging lineage',
    text: 'Somewhere along the trade routes the game — or its ancestor — branches: China develops Xiangqi, played on the intersections of the lines, with a river dividing the board.',
    how: 'The general and advisors are confined to a small palace "fortress" — unlike anything in the Indian original.',
  },
  {
    wp: 'kyoto', layer: 'eastward',
    place: 'Kyoto, Japan', name: '...and Shogi', when: 'diverging lineage',
    text: 'Japan develops Shogi — captured pieces change sides and can be dropped back onto the board as reinforcements for the capturer.',
    how: "Shogi is the only major chess relative where you can play your opponent's captured pieces as your own.",
  },
];

const WP = new Map(WAYPOINTS.map((w) => [w.key, w]));
const ROUTES: string[][] = [
  ['pataliputra', 'ctesiphon', 'baghdad', 'cordoba', 'valencia'],
  ['pataliputra', 'xian', 'kyoto'],
];

const PIN_PATH = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

// Initial framing: the Iberia-to-Japan band the story actually covers,
// with generous padding — full pan/zoom is available beyond it.
const INIT_CX = 1090, INIT_CY = 275, INIT_ZOOM = 1600 / 800;
const MINZOOM = 1, MAXZOOM = 16;

export const WorldMap: React.FC = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState({ cx: INIT_CX, cy: INIT_CY, zoom: INIT_ZOOM });
  const [openPinIdx, setOpenPinIdx] = useState<number | null>(null);
  const [openEra, setOpenEra] = useState<LayerKey>('origin');
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set(LAYER_KEYS));

  const dragRef = useRef<{ moved: boolean; startClientX: number; startClientY: number; startCx: number; startCy: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  const clamp = useCallback((cx: number, cy: number, zoom: number) => {
    const z = Math.min(MAXZOOM, Math.max(MINZOOM, zoom));
    const w = MAPW / z, h = MAPH / z;
    const cxx = w >= MAPW ? MAPW / 2 : Math.min(MAPW - w / 2, Math.max(w / 2, cx));
    const cyy = h >= MAPH ? MAPH / 2 : Math.min(MAPH - h / 2, Math.max(h / 2, cy));
    return { cx: cxx, cy: cyy, zoom: z };
  }, []);

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    setView((v) => {
      const rect = frameRef.current?.getBoundingClientRect();
      let anchorX = v.cx, anchorY = v.cy;
      if (rect && clientX !== undefined && clientY !== undefined) {
        const w = MAPW / v.zoom, h = MAPH / v.zoom;
        anchorX = v.cx - w / 2 + (clientX - rect.left) / rect.width * w;
        anchorY = v.cy - h / 2 + (clientY - rect.top) / rect.height * h;
      }
      const nz = Math.min(MAXZOOM, Math.max(MINZOOM, v.zoom * factor));
      const ratio = nz / v.zoom;
      const ncx = anchorX - (anchorX - v.cx) / ratio;
      const ncy = anchorY - (anchorY - v.cy) / ratio;
      return clamp(ncx, ncy, nz);
    });
  }, [clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      dragRef.current = { moved: false, startClientX: e.clientX, startClientY: e.clientY, startCx: view.cx, startCy: view.cy };
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: view.zoom };
      dragRef.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinchRef.current && pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const factor = dist / pinchRef.current.dist;
      const targetZoom = pinchRef.current.zoom * factor;
      setView((v) => {
        const rect = frameRef.current!.getBoundingClientRect();
        const w = MAPW / v.zoom, h = MAPH / v.zoom;
        const anchorX = v.cx - w / 2 + (mid.x - rect.left) / rect.width * w;
        const anchorY = v.cy - h / 2 + (mid.y - rect.top) / rect.height * h;
        const nz = Math.min(MAXZOOM, Math.max(MINZOOM, targetZoom));
        const ratio = nz / v.zoom;
        return clamp(anchorX - (anchorX - v.cx) / ratio, anchorY - (anchorY - v.cy) / ratio, nz);
      });
      return;
    }

    if (dragRef.current) {
      const rect = frameRef.current!.getBoundingClientRect();
      const dxScreen = e.clientX - dragRef.current.startClientX;
      const dyScreen = e.clientY - dragRef.current.startClientY;
      if (Math.abs(dxScreen) + Math.abs(dyScreen) > 4) dragRef.current.moved = true;
      const w = MAPW / view.zoom, h = MAPH / view.zoom;
      const ncx = dragRef.current.startCx - dxScreen / rect.width * w;
      const ncy = dragRef.current.startCy - dyScreen / rect.height * h;
      setView((v) => clamp(ncx, ncy, v.zoom));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomAt(e.deltaY < 0 ? 1.25 : 1 / 1.25, e.clientX, e.clientY);
  };

  const onDblClick = (e: React.MouseEvent) => {
    zoomAt(1.8, e.clientX, e.clientY);
  };

  const resetView = () => setView({ cx: INIT_CX, cy: INIT_CY, zoom: INIT_ZOOM });

  const toggleLayer = (k: LayerKey) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next.size ? next : prev;
    });
  };

  const flyTo = (i: number) => {
    const p = PINS[i];
    const w = WP.get(p.wp)!;
    setView((v) => clamp(w.x, w.y, Math.max(v.zoom, 5)));
    setOpenPinIdx(i);
    frameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const grouped = LAYER_KEYS.map((k) => ({
    key: k,
    ...LAYERS[k],
    pins: PINS.map((p, i) => ({ ...p, i })).filter((p) => p.layer === k),
  }));

  const openPin = openPinIdx !== null ? PINS[openPinIdx] : null;
  const viewW = MAPW / view.zoom, viewH = MAPH / view.zoom;
  const viewBox = `${view.cx - viewW / 2} ${view.cy - viewH / 2} ${viewW} ${viewH}`;

  return (
    <div>
      <div
        ref={frameRef}
        className="relative border-[3px] border-[#5C140F] overflow-hidden touch-none select-none"
        style={{ aspectRatio: `${MAPW} / ${MAPH}`, cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDblClick}
      >
        <svg ref={svgRef} viewBox={viewBox} className="w-full h-full block" role="img" aria-label="Map of Chaturangam's historical journey">
          <rect x={0} y={0} width={MAPW} height={MAPH} fill="#CFE1DC" />

          {COUNTRIES.map((c, i) => {
            const layer = HIGHLIGHT_COUNTRY[c.name];
            const active = layer ? activeLayers.has(layer) : true;
            return (
              <path
                key={i}
                d={c.d}
                fill={layer ? LAYERS[layer].color : '#F6ECD2'}
                fillOpacity={layer ? (active ? 0.5 : 0.15) : 1}
                stroke="#5C140F"
                strokeOpacity={layer ? 0.7 : 0.35}
                strokeWidth={layer ? 1.2 / view.zoom * 3 : 0.6 / view.zoom * 3}
              />
            );
          })}

          {/* undivided Jammu & Kashmir / Ladakh, filled to match India */}
          <path
            d={KASHMIR_PATCH_D}
            fill={LAYERS.origin.color}
            fillOpacity={activeLayers.has('origin') ? 0.5 : 0.15}
            stroke="#5C140F"
            strokeOpacity={activeLayers.has('origin') ? 0.7 : 0.35}
            strokeWidth={1.2 / view.zoom * 3}
          />

          {ROUTES.map((route, ri) => (
            <polyline
              key={ri}
              points={route.map((k) => { const w = WP.get(k)!; return `${w.x},${w.y}`; }).join(' ')}
              fill="none"
              stroke="#5C140F"
              strokeWidth={Math.max(1, 2.2 / view.zoom * 3)}
              strokeDasharray={`${7 / view.zoom * 3} ${6 / view.zoom * 3}`}
              strokeLinecap="round"
              opacity={0.8}
            />
          ))}

          {PINS.map((p, i) => {
            const w = WP.get(p.wp)!;
            const active = activeLayers.has(p.layer);
            const pinScale = (p.origin ? 1.5 : 1.1) / view.zoom * 3;
            return (
              <g
                key={i}
                transform={`translate(${w.x}, ${w.y})`}
                style={{ cursor: active ? 'pointer' : 'default', opacity: active ? 1 : 0.25, pointerEvents: active ? 'auto' : 'none' }}
                onPointerUp={(e) => { e.stopPropagation(); if (!dragRef.current?.moved) { setOpenPinIdx(i); } }}
              >
                <ellipse cx={0} cy={1.5 / view.zoom * 3} rx={5 * pinScale} ry={2 / view.zoom * 3} fill="#2B1B12" opacity={0.28} />
                {p.origin && <circle cx={0} cy={-9 * pinScale} r={12 * pinScale} fill={LAYERS[p.layer].color} opacity={0.22} />}
                <g transform={`scale(${pinScale}) translate(-12, -24)`}>
                  <path d={PIN_PATH} fill={LAYERS[p.layer].color} stroke="#5C140F" strokeWidth={1.3} fillRule="evenodd" />
                </g>
              </g>
            );
          })}
        </svg>

        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.6)} className="w-8 h-8 bg-[#F6ECD2] hover:bg-[#EFA90C] border-2 border-[#5C140F] flex items-center justify-center cursor-pointer">
            <Plus className="w-4 h-4 text-[#5C140F]" />
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.6)} className="w-8 h-8 bg-[#F6ECD2] hover:bg-[#EFA90C] border-2 border-[#5C140F] flex items-center justify-center cursor-pointer">
            <Minus className="w-4 h-4 text-[#5C140F]" />
          </button>
          <button type="button" aria-label="Reset map" onClick={resetView} className="w-8 h-8 bg-[#F6ECD2] hover:bg-[#EFA90C] border-2 border-[#5C140F] flex items-center justify-center cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5 text-[#5C140F]" />
          </button>
        </div>

        <p className="absolute bottom-1 left-2 text-[10px] text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
          Drag to pan, scroll or pinch to zoom · tap any pin for its story
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {LAYER_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => toggleLayer(k)}
            className={`flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#5C140F] text-[11px] font-bold cursor-pointer bg-[#F6ECD2] hover:bg-white transition-opacity ${activeLayers.has(k) ? '' : 'opacity-40'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LAYERS[k].color }} />
            {LAYERS[k].title}
          </button>
        ))}
      </div>

      {/* Jump to a place */}
      <select
        className="mt-3 w-full px-3 py-2 border-2 border-[#5C140F] bg-[#F6ECD2] text-sm font-bold text-[#5C140F] cursor-pointer"
        value=""
        onChange={(e) => { const idx = Number(e.target.value); if (!Number.isNaN(idx) && e.target.value !== '') flyTo(idx); }}
      >
        <option value="">Jump to a place…</option>
        {LAYER_KEYS.map((k) => (
          <optgroup key={k} label={LAYERS[k].title}>
            {PINS.map((p, i) => (p.layer === k ? <option key={i} value={i}>{p.place}</option> : null))}
          </optgroup>
        ))}
      </select>

      {/* History accordion */}
      <div className="mt-4 border-t border-[#5C140F]/30">
        {grouped.map((g) => (
          <div key={g.key} className="border-b border-dashed border-[#5C140F]/40">
            <button
              type="button"
              onClick={() => setOpenEra(g.key)}
              className="w-full flex items-center justify-between py-3 text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                <span className="font-fraunces font-bold text-[#5C140F]">{g.title}</span>
              </span>
              <span className="text-xs text-[#6B4E3D]">{g.pins.length} places</span>
            </button>
            {openEra === g.key && (
              <div className="pb-3 space-y-2">
                {g.pins.map((p) => (
                  <div key={p.i} className="border-l-4 py-2 px-3 bg-[#F6ECD2]" style={{ borderColor: g.color }}>
                    <h5 className="text-sm font-bold text-[#5C140F]">
                      {p.name}
                      <span className="font-normal text-[10px] uppercase tracking-wide text-[#B83215] ml-2">{p.place}</span>
                      <span className="font-normal text-[10px] text-[#6B4E3D] ml-2">{p.when}</span>
                    </h5>
                    <p className="text-xs text-[#2B1B12] mt-0.5">{p.text}</p>
                    <button type="button" onClick={() => flyTo(p.i)} className="text-xs font-bold text-[#D8401F] underline mt-1 cursor-pointer">
                      Show on map →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pin modal */}
      {openPin && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4" onClick={() => setOpenPinIdx(null)}>
          <div className="relative bg-[#F6ECD2] border-4 border-[#5C140F] max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
            <KolamCorner position="top-left" size={16} className="absolute top-1 left-1 opacity-60" />
            <KolamCorner position="top-right" size={16} className="absolute top-1 right-1 opacity-60" />
            <KolamCorner position="bottom-left" size={16} className="absolute bottom-1 left-1 opacity-60" />
            <KolamCorner position="bottom-right" size={16} className="absolute bottom-1 right-1 opacity-60" />
            <button
              type="button"
              onClick={() => setOpenPinIdx(null)}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-[#F6ECD2] border-2 border-[#5C140F] cursor-pointer"
            >
              <X className="w-4 h-4 text-[#5C140F]" />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#D8401F] mb-1">{openPin.place}</p>
            <h4 className="font-fraunces text-lg font-bold text-[#5C140F] mb-1">{openPin.name}</h4>
            <p className="text-xs font-bold text-[#6B4E3D] mb-3">{openPin.when}</p>
            <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">{openPin.text}</p>
            <div className="border-t border-dashed border-[#5C140F]/40 pt-2">
              <p className="text-[11px] text-[#6B4E3D] italic">{openPin.how}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
