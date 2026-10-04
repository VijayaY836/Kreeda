const VIRTUE_NAMES = ['Vinaya', 'Dāna', 'Seva', 'Śraddha', 'Jñāna', 'Dhyāna', 'Dayā'] as const
const VICE_NAMES = ['Krodha', 'Matsarya', 'Lobha', 'Moha', 'Mada', 'Ahaṅkāra', 'Kāma'] as const

export type VirtueName = (typeof VIRTUE_NAMES)[number]
export type ViceName = (typeof VICE_NAMES)[number]
export type SquareName = VirtueName | ViceName

export interface Ladder {
  from: number
  to: number
  name: VirtueName
}
export interface Snake {
  from: number
  to: number
  name: ViceName
}

export const VP_LADDERS: Ladder[] = [
  { from: 3, to: 22, name: 'Vinaya' },
  { from: 8, to: 26, name: 'Dāna' },
  { from: 28, to: 55, name: 'Seva' },
  { from: 36, to: 58, name: 'Śraddha' },
  { from: 51, to: 72, name: 'Jñāna' },
  { from: 66, to: 87, name: 'Dhyāna' },
  { from: 80, to: 99, name: 'Dayā' },
]

export const VP_SNAKES: Snake[] = [
  { from: 18, to: 6, name: 'Krodha' },
  { from: 39, to: 21, name: 'Matsarya' },
  { from: 49, to: 33, name: 'Lobha' },
  { from: 64, to: 40, name: 'Moha' },
  { from: 78, to: 59, name: 'Mada' },
  { from: 90, to: 76, name: 'Ahaṅkāra' },
  { from: 97, to: 82, name: 'Kāma' },
]

const LMAP: Record<number, Ladder> = {}
VP_LADDERS.forEach((l) => (LMAP[l.from] = l))
const SMAP: Record<number, Snake> = {}
VP_SNAKES.forEach((s) => (SMAP[s.from] = s))

export function ladderAt(n: number): Ladder | undefined {
  return LMAP[n]
}
export function snakeAt(n: number): Snake | undefined {
  return SMAP[n]
}

export interface CellPos {
  x: number
  y: number
}

export function vpCenter(n: number): CellPos {
  const i = n - 1
  const row = Math.floor(i / 10)
  const k = i % 10
  const col = row % 2 === 0 ? k : 9 - k
  return { x: (col + 0.5) * 10, y: (9 - row) * 10 + 5 }
}

const SNAKE_COLORS = ['#0E5C58', '#3E6E9E', '#5F8F3B', '#D9587B', '#3E6E9E', '#0E5C58', '#5F8F3B']

export function vpSnakeSVG(s: Snake, idx: number): JSX.Element {
  const H = vpCenter(s.from)
  const T = vpCenter(s.to)
  const dx = T.x - H.x
  const dy = T.y - H.y
  const len = Math.hypot(dx, dy)
  const nx = -dy / len
  const ny = dx / len
  const bend = (idx % 2 ? 1 : -1) * (5.5 + len * 0.09)
  const c1 = { x: H.x + dx * 0.3 + nx * bend, y: H.y + dy * 0.3 + ny * bend }
  const c2 = { x: H.x + dx * 0.72 - nx * bend * 0.7, y: H.y + dy * 0.72 - ny * bend * 0.7 }
  const col = SNAKE_COLORS[idx % 7]
  const d = `M ${H.x} ${H.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${T.x} ${T.y}`
  const ang = (Math.atan2(c1.y - H.y, c1.x - H.x) * 180) / Math.PI
  return (
    <g key={`snake-${s.from}`}>
      <path d={d} fill="none" stroke="#5C140F" strokeWidth="1.15" strokeLinecap="round" />
      <path d={d} fill="none" stroke={col} strokeWidth="0.78" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#F7EAD2" strokeWidth="0.28" strokeDasharray="0.55 0.85" strokeLinecap="round" />
      <circle cx={T.x} cy={T.y} r="0.5" fill={col} stroke="#5C140F" strokeWidth="0.16" />
      <g transform={`translate(${H.x},${H.y}) rotate(${ang})`}>
        <ellipse cx="1.05" rx="1.55" ry="1.05" fill={col} stroke="#5C140F" strokeWidth="0.26" />
        <path d="M2.55 0 h1.4 M3.95 0 l0.75 -0.45 M3.95 0 l0.75 0.45" stroke="#B3261E" strokeWidth="0.22" fill="none" strokeLinecap="round" />
        <circle cx="0.85" cy="-0.42" r="0.34" fill="#EFDFB8" stroke="#5C140F" strokeWidth="0.12" />
        <circle cx="0.85" cy="0.42" r="0.34" fill="#EFDFB8" stroke="#5C140F" strokeWidth="0.12" />
        <circle cx="0.95" cy="-0.42" r="0.14" fill="#2B1B12" />
        <circle cx="0.95" cy="0.42" r="0.14" fill="#2B1B12" />
      </g>
    </g>
  )
}

const CHUTE_COLORS = ['#D8401F', '#EFA90C', '#D8401F', '#EFA90C', '#D8401F', '#EFA90C', '#D8401F']

export function vpChuteSVG(s: Snake, idx: number): JSX.Element {
  const H = vpCenter(s.from)
  const T = vpCenter(s.to)
  const dx = T.x - H.x
  const dy = T.y - H.y
  const len = Math.hypot(dx, dy)
  const nx = -dy / len
  const ny = dx / len
  const bend = (idx % 2 ? 1 : -1) * (4 + len * 0.06)
  const c1 = { x: H.x + dx * 0.3 + nx * bend, y: H.y + dy * 0.3 + ny * bend }
  const c2 = { x: H.x + dx * 0.72 - nx * bend * 0.7, y: H.y + dy * 0.72 - ny * bend * 0.7 }
  const col = CHUTE_COLORS[idx % 7]
  const d = `M ${H.x} ${H.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${T.x} ${T.y}`
  const ang = (Math.atan2(T.y - H.y, T.x - H.x) * 180) / Math.PI
  return (
    <g key={`chute-${s.from}`}>
      <path d={d} fill="none" stroke="#5C140F" strokeWidth="1.3" strokeLinecap="round" />
      <path d={d} fill="none" stroke={col} strokeWidth="0.85" strokeLinecap="round" strokeDasharray="2.5 1.2" />
      <g transform={`translate(${H.x},${H.y}) rotate(${ang})`}>
        <rect x="-1.2" y="-0.7" width="2.4" height="1.4" rx="0.3" fill={col} stroke="#5C140F" strokeWidth="0.2" />
        <text x="0" y="0.35" textAnchor="middle" fontSize="1.1" fill="#EFDFB8" fontWeight="bold">▼</text>
      </g>
      <g transform={`translate(${T.x},${T.y}) rotate(${ang})`}>
        <rect x="-1.2" y="-0.7" width="2.4" height="1.4" rx="0.3" fill={col} stroke="#5C140F" strokeWidth="0.2" />
        <text x="0" y="0.35" textAnchor="middle" fontSize="1.1" fill="#EFDFB8" fontWeight="bold">▼</text>
      </g>
    </g>
  )
}

export function vpLadderSVG(l: Ladder): JSX.Element {
  const A = vpCenter(l.from)
  const B = vpCenter(l.to)
  const dx = B.x - A.x
  const dy = B.y - A.y
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const s = { x: A.x - ux * 1.6, y: A.y - uy * 1.6 }
  const e = { x: B.x + ux * 1.6, y: B.y + uy * 1.6 }
  const rail = (o1: number) => `M ${s.x + px * o1} ${s.y + py * o1} L ${e.x + px * o1} ${e.y + py * o1}`
  let rungs = ''
  const n = Math.max(3, Math.floor(len / 4.5))
  for (let j = 0; j < n; j++) {
    const t = (j + 0.5) / n
    const mx = s.x + (e.x - s.x) * t
    const my = s.y + (e.y - s.y) * t
    rungs += `M ${mx - px * 0.62} ${my - py * 0.62} L ${mx + px * 0.62} ${my + py * 0.62} `
  }
  return (
    <g key={`ladder-${l.from}`} stroke="#6B4E3D" strokeLinecap="round">
      <path d={rail(0.55)} strokeWidth="0.5" />
      <path d={rail(-0.55)} strokeWidth="0.5" />
      <path d={rungs} strokeWidth="0.36" />
    </g>
  )
}

export const VP_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}
