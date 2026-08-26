import React, { useEffect, useRef, useState } from 'react';
import { WORLD_LAND_SVG } from '../assets/worldMapLand';
import { KolamCorner } from './FolkArtMotifs';
import { X, Plus, Minus, RotateCcw } from 'lucide-react';

/* ============================================================
   Interactive world map — ported from trial.html's mancala map.
   Same equirectangular projection (Natural Earth 1:110m outlines,
   2000x1000 user-unit grid), same pan/zoom/pinch/wheel interaction,
   same legend/jump/history-accordion pattern. Only the data (LAYERS,
   PINS, ROUTES, HL) is swapped for Chaturangam's real journey.
   ============================================================ */

const MAPW = 2000, MAPH = 1000;
const proj = (lon: number, lat: number): [number, number] => [(lon + 180) / 360 * MAPW, (90 - lat) / 180 * MAPH];

interface Pin {
  lat: number; lon: number; layer: string; place: string; name: string; when: string;
  text: string; how: string; origin?: boolean;
}
interface LayerDef { label: string; color: string; }

const LAYERS: Record<string, LayerDef> = {
  origin: { label: 'The Origin — India', color: '#D8401F' },
  persia: { label: 'Persia & the Islamic World', color: '#EFA90C' },
  europe: { label: 'Europe — the Modern Game', color: '#0E5C58' },
  eastward: { label: 'The Eastward Branch', color: '#3E6E9E' },
};

const PINS: Pin[] = [
  {
    lat: 25.61, lon: 85.14, layer: 'origin', place: 'Pataliputra, Gupta India', name: 'Chaturanga at a Gupta court',
    when: '~6th century CE', origin: true,
    text: "The earliest textual traces of Chaturanga — a four-division army game of infantry, cavalry, elephants and chariots — appear in Gupta-era Sanskrit sources.",
    how: 'No board from this era survives; the game is known only from literary references, not archaeology.',
  },
  {
    lat: 17.39, lon: 78.49, layer: 'origin', place: 'Hyderabad, Telangana', name: 'Chaturangam / Chadarangam today',
    when: 'living tradition',
    text: 'In Telugu, the old name is still used interchangeably with chess itself — a linguistic fossil of the two games\' shared root.',
    how: 'Not a historical relic — an everyday word, still in use.',
  },
  {
    lat: 33.09, lon: 44.58, layer: 'persia', place: 'Ctesiphon, Sassanid Persia', name: 'Chaturanga becomes Shatranj',
    when: '~6th–7th century CE',
    text: "Sassanid Persia adopted the game as Shatranj. A Middle Persian text, the Chatrang-namak, describes it arriving as a diplomatic puzzle sent by an Indian king.",
    how: 'The Chatrang-namak is semi-legendary, but it is the earliest surviving account of the transmission.',
  },
  {
    lat: 33.31, lon: 44.36, layer: 'persia', place: 'Baghdad, Abbasid Caliphate', name: 'Shatranj masters and opening theory',
    when: '9th century',
    text: 'Baghdad\'s Abbasid court produced the first named chess masters and recorded openings — and gave us "checkmate," from shah mat, "the king is helpless."',
    how: 'Arabic manuscripts on Shatranj openings and endgames survive from this period — real documentary evidence.',
  },
  {
    lat: 37.88, lon: -4.78, layer: 'europe', place: 'Córdoba, Al-Andalus', name: 'Shatranj enters Europe',
    when: '~9th–10th century',
    text: 'Islamic Spain carried Shatranj into Europe, where it spread north through trade, pilgrimage and conquest.',
    how: 'Andalusian courts are the first well-documented European contact point.',
  },
  {
    lat: 39.47, lon: -0.38, layer: 'europe', place: 'Valencia, Spain', name: 'The modern Queen is born',
    when: '1475',
    text: 'Scachs d\'amor, a Valencian poem from 1475, is the earliest surviving description of chess with the modern powerful queen and long-range bishop.',
    how: 'A specific, dated literary source — rare in chess history.',
  },
  {
    lat: 34.27, lon: 108.95, layer: 'eastward', place: "Xi'an, China", name: 'A separate branch: Xiangqi',
    when: 'disputed dating',
    text: 'A parallel eastward transmission — or an independent development, historians disagree — produced Xiangqi, with its river, palace and cannon.',
    how: 'The exact relationship between Chaturanga and Xiangqi is unresolved.',
  },
  {
    lat: 35.01, lon: 135.77, layer: 'eastward', place: 'Kyoto, Japan', name: '...and Shogi',
    when: 'from the 8th century',
    text: 'Chess-family ideas reached Japan and became Shogi, uniquely allowing a captured piece to be dropped back onto the board as your own.',
    how: 'Shogi\'s drop rule has no equivalent anywhere else in the chess family.',
  },
];

const ROUTES: { pts: [number, number][]; bend: number; faint?: boolean }[] = [
  { pts: [[85.14, 25.61], [44.58, 33.09], [44.36, 33.31], [-4.78, 37.88], [-0.38, 39.47]], bend: 0.1 },
  { pts: [[85.14, 25.61], [108.95, 34.27], [135.77, 35.01]], bend: 0.12, faint: true },
];

const HL = new Set(['India', 'Iran', 'Iraq', 'Spain', 'China', 'Japan']);

export const WorldMap: React.FC = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const landWrapRef = useRef<SVGGElement>(null);
  const gGratRef = useRef<SVGGElement>(null);
  const gRoutesRef = useRef<SVGGElement>(null);
  const gPinsRef = useRef<SVGGElement>(null);

  const viewRef = useRef({ x: 0, y: 0, w: MAPW, h: MAPH });
  const baseRef = useRef({ w: MAPW, h: MAPH });
  const zoomRef = useRef(1);
  const MAXZOOM = 22;
  const pinNodesRef = useRef<{ el: SVGGElement; x: number; y: number; layer: string }[]>([]);
  const activeLayersRef = useRef<Set<string>>(new Set(Object.keys(LAYERS)));

  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(Object.keys(LAYERS)));
  const [openPinIdx, setOpenPinIdx] = useState<number | null>(null);
  const [openEra, setOpenEra] = useState<string>('origin');

  useEffect(() => {
    activeLayersRef.current = activeLayers;
    pinNodesRef.current.forEach((pn) => {
      const active = activeLayers.has(pn.layer);
      pn.el.style.opacity = active ? '1' : '0.18';
      pn.el.style.pointerEvents = active ? '' : 'none';
    });
  }, [activeLayers]);

  useEffect(() => {
    const svg = svgRef.current!, frame = frameRef.current!;

    function fitBase(): boolean {
      const r = frame.getBoundingClientRect();
      const w = r.width || 640, h = r.height || 320;
      if (w <= 4 || h <= 4) return false;
      const a = w / h;
      const bw = Math.min(MAPW, MAPH * a);
      baseRef.current = { w: bw, h: bw / a };
      return true;
    }
    function clampView() {
      const view = viewRef.current, base = baseRef.current, zoom = zoomRef.current;
      view.w = base.w / zoom; view.h = base.h / zoom;
      const maxX = MAPW - view.w, maxY = MAPH - view.h;
      view.x = maxX <= 0 ? maxX / 2 : Math.max(0, Math.min(maxX, view.x));
      view.y = maxY <= 0 ? maxY / 2 : Math.max(0, Math.min(maxY, view.y));
    }
    function applyViewInner() {
      const view = viewRef.current;
      svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
      const px = frame.clientWidth || 1;
      const s = view.w / px;
      const showLabels = zoomRef.current >= 2.6;
      pinNodesRef.current.forEach(pn => {
        pn.el.setAttribute('transform', `translate(${pn.x} ${pn.y}) scale(${s})`);
        const t = pn.el.querySelector('text') as SVGTextElement | null;
        if (t) t.style.display = showLabels ? '' : 'none';
        const active = activeLayersRef.current.has(pn.layer);
        pn.el.style.opacity = active ? '1' : '0.18';
        pn.el.style.pointerEvents = active ? '' : 'none';
      });
    }
    function centerOn(lon: number, lat: number, z?: number) {
      if (z) zoomRef.current = Math.max(1, Math.min(MAXZOOM, z));
      const view = viewRef.current, base = baseRef.current, zoom = zoomRef.current;
      view.w = base.w / zoom; view.h = base.h / zoom;
      const [x, y] = proj(lon, lat);
      view.x = x - view.w / 2; view.y = y - view.h / 2;
      clampView(); applyViewInner();
    }
    function resetView() { setOpenPinIdx(null); fitBase(); centerOn(50, 25, 1.7); }
    function zoomStep(f: number) {
      const view = viewRef.current, base = baseRef.current;
      const cx = view.x + view.w / 2, cy = view.y + view.h / 2;
      zoomRef.current = Math.max(1, Math.min(MAXZOOM, zoomRef.current * f));
      view.w = base.w / zoomRef.current; view.h = base.h / zoomRef.current;
      view.x = cx - view.w / 2; view.y = cy - view.h / 2;
      clampView(); applyViewInner();
    }
    function toUser(clientX: number, clientY: number): [number, number] {
      const r = frame.getBoundingClientRect();
      const view = viewRef.current;
      const px = Math.max(0, Math.min(r.width, clientX - r.left));
      const py = Math.max(0, Math.min(r.height, clientY - r.top));
      return [view.x + (px / r.width) * view.w, view.y + (py / r.height) * view.h];
    }

    // ---- mark highlighted countries ----
    landWrapRef.current!.querySelectorAll('path').forEach((p) => {
      const hl = HL.has(p.getAttribute('data-n') || '');
      p.setAttribute('fill', hl ? '#F0DCA6' : '#E4D19E');
      p.setAttribute('stroke', hl ? '#5C140F' : '#8A6A46');
      p.setAttribute('stroke-width', hl ? '1.1' : '0.8');
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      p.setAttribute('paint-order', 'stroke');
    });

    // ---- graticule ----
    let gd = '';
    for (let lon = -160; lon <= 160; lon += 20) {
      const a = proj(lon, 80), b = proj(lon, -60);
      gd += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
    }
    const grat = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    grat.setAttribute('d', gd);
    grat.setAttribute('stroke', 'rgba(239,223,184,.32)');
    grat.setAttribute('stroke-width', '1');
    grat.setAttribute('fill', 'none');
    grat.setAttribute('vector-effect', 'non-scaling-stroke');
    gGratRef.current!.appendChild(grat);

    // ---- routes ----
    function arcSeg(a: [number, number], b: [number, number], bend: number) {
      const [x1, y1] = proj(a[0], a[1]);
      const [x2, y2] = proj(b[0], b[1]);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${(mx - dy * bend).toFixed(1)} ${(my + dx * bend).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }
    ROUTES.forEach(r => {
      let d = '';
      for (let i = 0; i < r.pts.length - 1; i++) d += arcSeg(r.pts[i], r.pts[i + 1], r.bend);
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', r.faint ? '#F3C77A' : '#EFA90C');
      p.setAttribute('stroke-width', '2.4');
      p.setAttribute('stroke-dasharray', '7 9');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('opacity', r.faint ? '0.55' : '0.9');
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      gRoutesRef.current!.appendChild(p);
    });

    // ---- pins ----
    const pinShape = 'M0 -8 C-6 -3 -6 3 0 9.5 C6 3 6 -3 0 -8Z';
    const pinShapeOrigin = 'M0 -10 C-7.5 -4 -7.5 3.5 0 12 C7.5 3.5 7.5 -4 0 -10Z';
    pinNodesRef.current = [];
    PINS.forEach((pn, i) => {
      const [x, y] = proj(pn.lon, pn.lat);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      const col = LAYERS[pn.layer].color;

      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hit.setAttribute('r', pn.origin ? '20' : '16');
      hit.setAttribute('fill', 'transparent');
      g.appendChild(hit);

      if (pn.origin) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        ring.setAttribute('d', pinShapeOrigin);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', '#5C140F');
        ring.setAttribute('stroke-width', '2');
        g.appendChild(ring);
      }
      const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      body.setAttribute('d', pn.origin ? pinShapeOrigin : pinShape);
      body.setAttribute('fill', col);
      body.setAttribute('stroke', '#5C140F');
      body.setAttribute('stroke-width', '2.2');
      g.appendChild(body);

      const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      core.setAttribute('r', pn.origin ? '3.6' : '2.8');
      core.setAttribute('fill', '#F6ECD2');
      g.appendChild(core);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '14'); label.setAttribute('y', '4.5');
      label.setAttribute('font-family', 'Manrope, sans-serif');
      label.setAttribute('font-size', '11');
      label.setAttribute('font-weight', '800');
      label.setAttribute('fill', '#2B1B12');
      label.setAttribute('paint-order', 'stroke');
      label.setAttribute('stroke', '#F6ECD2');
      label.setAttribute('stroke-width', '3.5');
      label.style.pointerEvents = 'none';
      label.textContent = pn.name;
      g.appendChild(label);

      g.addEventListener('click', (ev) => { ev.stopPropagation(); setOpenPinIdx(i); });
      gPinsRef.current!.appendChild(g);
      pinNodesRef.current.push({ el: g, x, y, layer: pn.layer });
    });

    fitBase();
    resetView();

    // ---- pointer interaction: drag, pinch, wheel, dblclick ----
    const ptrs = new Map<number, { x: number; y: number }>();
    let dragStart: { cx: number; cy: number; vx: number; vy: number; moved: boolean; target: EventTarget | null } | null = null;
    let pinchStart: { d: number; zoom: number } | null = null;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const [ux, uy] = toUser(e.clientX, e.clientY);
      const f = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      const nz = Math.max(1, Math.min(MAXZOOM, zoomRef.current * f));
      const ratio = nz / zoomRef.current; zoomRef.current = nz;
      const view = viewRef.current;
      view.x = ux - (ux - view.x) / ratio;
      view.y = uy - (uy - view.y) / ratio;
      clampView(); applyViewInner();
    };
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest?.('.zbtn')) return;
      frame.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) {
        dragStart = { cx: e.clientX, cy: e.clientY, vx: viewRef.current.x, vy: viewRef.current.y, moved: false, target: e.target };
        frame.style.cursor = 'grabbing';
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: zoomRef.current };
        dragStart = null;
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinchStart && ptrs.size >= 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const [ux, uy] = toUser(mid.x, mid.y);
        const nz = Math.max(1, Math.min(MAXZOOM, pinchStart.zoom * (d / pinchStart.d)));
        const ratio = nz / zoomRef.current; zoomRef.current = nz;
        const view = viewRef.current, base = baseRef.current;
        view.w = base.w / zoomRef.current; view.h = base.h / zoomRef.current;
        view.x = ux - (ux - view.x) / ratio;
        view.y = uy - (uy - view.y) / ratio;
        clampView(); applyViewInner();
        return;
      }
      if (dragStart) {
        const r = frame.getBoundingClientRect();
        const view = viewRef.current;
        const dx = (e.clientX - dragStart.cx) / r.width * view.w;
        const dy = (e.clientY - dragStart.cy) / r.height * view.h;
        if (Math.abs(e.clientX - dragStart.cx) + Math.abs(e.clientY - dragStart.cy) > 4) dragStart.moved = true;
        view.x = dragStart.vx - dx; view.y = dragStart.vy - dy;
        clampView(); applyViewInner();
      }
    };
    const endPtr = (e: PointerEvent) => {
      const tap = dragStart && !dragStart.moved && ptrs.size === 1;
      const tapTarget = dragStart?.target;
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinchStart = null;
      if (ptrs.size === 0) { dragStart = null; frame.style.cursor = 'grab'; }
      if (tap && tapTarget && (tapTarget as HTMLElement).closest) {
        const pinEl = (tapTarget as HTMLElement).closest('g');
        const found = pinNodesRef.current.findIndex(pn => pn.el === pinEl);
        if (found >= 0) setOpenPinIdx(found);
      }
    };
    const onDblClick = (e: MouseEvent) => {
      const [ux, uy] = toUser(e.clientX, e.clientY);
      const nz = Math.min(MAXZOOM, zoomRef.current * 2);
      const ratio = nz / zoomRef.current; zoomRef.current = nz;
      const view = viewRef.current, base = baseRef.current;
      view.w = base.w / zoomRef.current; view.h = base.h / zoomRef.current;
      view.x = ux - (ux - view.x) / ratio; view.y = uy - (uy - view.y) / ratio;
      clampView(); applyViewInner();
    };

    frame.addEventListener('wheel', onWheel, { passive: false });
    frame.addEventListener('pointerdown', onPointerDown);
    frame.addEventListener('pointermove', onPointerMove);
    frame.addEventListener('pointerup', endPtr);
    frame.addEventListener('pointercancel', endPtr);
    frame.addEventListener('dblclick', onDblClick);

    const refit = () => { fitBase(); clampView(); applyViewInner(); };
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(refit); ro.observe(frame); }
    window.addEventListener('resize', refit);

    // expose imperative helpers for the zoom buttons / jump / history list
    (frame as any)._zoomStep = zoomStep;
    (frame as any)._resetView = resetView;
    (frame as any)._centerOn = centerOn;

    return () => {
      frame.removeEventListener('wheel', onWheel);
      frame.removeEventListener('pointerdown', onPointerDown);
      frame.removeEventListener('pointermove', onPointerMove);
      frame.removeEventListener('pointerup', endPtr);
      frame.removeEventListener('pointercancel', endPtr);
      frame.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('resize', refit);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flyTo = (i: number) => {
    const p = PINS[i];
    (frameRef.current as any)?._centerOn(p.lon, p.lat, 5);
    frameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setOpenPinIdx(i);
  };

  const toggleLayer = (key: string) => {
    setActiveLayers(prev => {
      if (prev.has(key) && prev.size === Object.keys(LAYERS).length) return new Set([key]);
      if (prev.has(key)) {
        const next = new Set(prev); next.delete(key);
        return next.size ? next : new Set(Object.keys(LAYERS));
      }
      return new Set([...prev, key]);
    });
  };

  const openPin = openPinIdx !== null ? PINS[openPinIdx] : null;

  return (
    <div>
      <div className="relative">
        <div
          ref={frameRef}
          className="relative w-full border-4 border-[#5C140F] bg-[#0E5C58] overflow-hidden touch-none"
          style={{ aspectRatio: '2 / 1', cursor: 'grab' }}
        >
          <svg ref={svgRef} className="block w-full h-full">
            <g ref={landWrapRef} dangerouslySetInnerHTML={{ __html: WORLD_LAND_SVG }} />
            <g ref={gGratRef} />
            <g ref={gRoutesRef} />
            <g ref={gPinsRef} />
          </svg>

          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            <button
              type="button"
              className="zbtn w-8 h-8 bg-[#F6ECD2] hover:bg-[#EFA90C] border-2 border-[#5C140F] flex items-center justify-center cursor-pointer"
              onClick={() => (frameRef.current as any)?._zoomStep(1.6)}
              aria-label="Zoom in"
            >
              <Plus className="w-4 h-4 text-[#5C140F]" />
            </button>
            <button
              type="button"
              className="zbtn w-8 h-8 bg-[#F6ECD2] hover:bg-[#EFA90C] border-2 border-[#5C140F] flex items-center justify-center cursor-pointer"
              onClick={() => (frameRef.current as any)?._zoomStep(1 / 1.6)}
              aria-label="Zoom out"
            >
              <Minus className="w-4 h-4 text-[#5C140F]" />
            </button>
            <button
              type="button"
              className="zbtn w-8 h-8 bg-[#F6ECD2] hover:bg-[#EFA90C] border-2 border-[#5C140F] flex items-center justify-center cursor-pointer"
              onClick={() => (frameRef.current as any)?._resetView()}
              aria-label="Reset map"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5C140F]" />
            </button>
          </div>

          <div className="absolute bottom-2 left-3 right-16 text-[11px] font-bold text-[#F6ECD2] pointer-events-none">
            Drag to pan, scroll or pinch to zoom · dashed lines are likely routes, not documented voyages
          </div>
        </div>
      </div>

      {/* Jump-to + legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        <select
          className="flex-1 min-w-[200px] px-3 py-2 border-2 border-[#5C140F] bg-[#F6ECD2] text-[#5C140F] font-bold text-xs cursor-pointer"
          defaultValue=""
          onChange={(e) => { if (e.target.value !== '') flyTo(+e.target.value); e.target.value = ''; }}
        >
          <option value="">Jump to a place…</option>
          {Object.entries(LAYERS).map(([key, L]) => (
            <optgroup key={key} label={L.label}>
              {PINS.map((p, i) => p.layer === key && (
                <option key={i} value={i}>{p.place}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {Object.entries(LAYERS).map(([key, L]) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleLayer(key)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#5C140F] text-[11px] font-bold cursor-pointer transition-opacity ${activeLayers.has(key) ? 'bg-[#F6ECD2] text-[#5C140F]' : 'bg-[#F6ECD2] text-[#5C140F] opacity-40'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full border border-[#5C140F]" style={{ backgroundColor: L.color }} />
            {L.label}
          </button>
        ))}
      </div>

      {/* History accordion */}
      <div className="mt-5 border-t-2 border-[#5C140F]/30">
        {Object.entries(LAYERS).map(([key, L]) => {
          const items = PINS.map((p, i) => ({ p, i })).filter(o => o.p.layer === key);
          const isOpen = openEra === key;
          return (
            <div key={key} className="border-b-2 border-dashed border-[#5C140F]/40">
              <button
                type="button"
                onClick={() => setOpenEra(isOpen ? '' : key)}
                className="w-full flex items-center gap-2.5 py-3 text-left cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full border-2 border-[#5C140F] shrink-0" style={{ backgroundColor: L.color }} />
                <span className="font-fraunces font-bold text-[#5C140F] text-sm sm:text-base">{L.label}</span>
                <span className="ml-auto text-[11px] font-bold text-[#6B4E3D]">{items.length} places</span>
              </button>
              {isOpen && (
                <div className="pb-4 space-y-2.5">
                  {items.map(({ p, i }) => (
                    <div key={i} className="pl-3.5 border-l-[3px] p-2.5 bg-[#E4D19E]/50" style={{ borderColor: L.color }}>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <b className="font-fraunces text-[#5C140F] text-sm">{p.name}</b>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#D8401F]">{p.place}</span>
                        <span className="text-[11px] font-bold text-[#6B4E3D]">{p.when}</span>
                      </div>
                      <p className="text-xs text-[#2B1B12] leading-relaxed mt-1">{p.text}</p>
                      <button
                        type="button"
                        onClick={() => flyTo(i)}
                        className="mt-1.5 text-[11px] font-bold text-[#5C140F] underline cursor-pointer"
                      >
                        Show on map →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pin modal */}
      {openPin && (
        <div className="fixed inset-0 z-50 bg-[#5C140F]/60 flex items-center justify-center p-4" onClick={() => setOpenPinIdx(null)}>
          <div
            className="w-full max-w-md bg-[#F6ECD2] border-4 border-[#5C140F] p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <KolamCorner position="top-left" size={22} className="absolute top-1 left-1 opacity-60" />
            <KolamCorner position="top-right" size={22} className="absolute top-1 right-1 opacity-60" />
            <KolamCorner position="bottom-left" size={22} className="absolute bottom-1 left-1 opacity-60" />
            <KolamCorner position="bottom-right" size={22} className="absolute bottom-1 right-1 opacity-60" />
            <button
              onClick={() => setOpenPinIdx(null)}
              className="absolute top-3 right-3 p-1.5 bg-[#E4D19E] border-2 border-[#5C140F] text-[#5C140F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#D8401F] pr-6">{openPin.place}</p>
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F] mt-1 mb-0.5">{openPin.name}</h3>
            <p className="text-xs font-bold text-[#6B4E3D] mb-3">{openPin.when}</p>
            <p className="text-sm text-[#2B1B12] leading-relaxed mb-3">{openPin.text}</p>
            <p className="text-xs text-[#6B4E3D] leading-relaxed pt-2 border-t-2 border-dashed border-[#5C140F]/40">{openPin.how}</p>
          </div>
        </div>
      )}
    </div>
  );
};
