import { useEffect, useRef } from 'react'

interface Pt {
  x: number
  y: number
}

interface Crawler {
  pts: Pt[]
  gap: number
  r: number
  speed: number
  heading: number
  color: string
  band: string
  target: Pt
  retargetAt: number
  phase: number
  wiggleFreq: number
}

const TAU = Math.PI * 2
const MAROON = '#5C140F'
const INK = '#2B1B12'
const CREAM = '#F7EAD2'
const TONGUE = '#B3261E'
const BODY_COLORS = ['#0E5C58', '#D8401F', '#5F8F3B', '#D9587B', '#3E6E9E', '#EFA90C', '#0E5C58', '#5F8F3B']
const BAND_COLORS = ['#0A403C', '#9E2E13', '#43662A', '#A83A58', '#2A4E73', '#B37C08', '#0A403C', '#43662A']

function rand(a: number, b: number): number {
  return a + Math.random() * (b - a)
}

/**
 * Full-screen canvas overlay: a swarm of segmented snakes that crawl across
 * the screen (inverse-kinematics chain — each segment trails the one before
 * it), shown whenever a player lands on a snake's head and slides down.
 */
export function SnakeSwarm({ onDone, duration = 2600 }: { onDone: () => void; duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const finish = () => {
      if (!doneRef.current) {
        doneRef.current = true
        onDoneRef.current()
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      cvs.width = W * dpr
      cvs.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const pickTarget = (): Pt => ({ x: rand(60, W - 60), y: rand(60, H - 60) })

    const crawlers: Crawler[] = []
    for (let i = 0; i < 8; i++) {
      const r = rand(11, 20)
      const segCount = Math.round(rand(22, 30))
      const start: Pt = { x: rand(W * 0.15, W * 0.85), y: rand(H * 0.2, H * 0.8) }
      const heading = rand(0, TAU)
      const pts: Pt[] = Array.from({ length: segCount }, (_, k) => ({
        x: start.x - Math.cos(heading) * k * r * 0.62,
        y: start.y - Math.sin(heading) * k * r * 0.62,
      }))
      crawlers.push({
        pts,
        gap: r * 0.62,
        r,
        speed: rand(120, 260),
        heading,
        color: BODY_COLORS[i % BODY_COLORS.length],
        band: BAND_COLORS[i % BAND_COLORS.length],
        target: pickTarget(),
        retargetAt: 0,
        phase: rand(0, TAU),
        wiggleFreq: rand(4, 8),
      })
    }

    let raf = 0
    let last = performance.now()
    const t0 = last

    const radiusAt = (s: Crawler, i: number): number => {
      const taper = i / (s.pts.length - 1)
      return Math.max(2, s.r * (1 - 0.75 * taper))
    }

    const update = (s: Crawler, now: number, dtMs: number) => {
      if (now > s.retargetAt || Math.hypot(s.target.x - s.pts[0].x, s.target.y - s.pts[0].y) < s.r * 3) {
        s.target = pickTarget()
        s.retargetAt = now + rand(500, 1500)
        s.speed = rand(120, 260)
      }
      // slither: weave a sinusoidal offset onto the pursuit direction
      const base = Math.atan2(s.target.y - s.pts[0].y, s.target.x - s.pts[0].x)
      s.heading = base + Math.sin((now / 1000) * s.wiggleFreq + s.phase) * 0.55
      const step = (s.speed * dtMs) / 1000
      s.pts[0].x += Math.cos(s.heading) * step
      s.pts[0].y += Math.sin(s.heading) * step
      // inverse-kinematics trail: every segment follows the one ahead
      for (let i = 1; i < s.pts.length; i++) {
        const p = s.pts[i]
        const q = s.pts[i - 1]
        const dx = q.x - p.x
        const dy = q.y - p.y
        const d = Math.hypot(dx, dy) || 1
        p.x = q.x - (dx / d) * s.gap
        p.y = q.y - (dy / d) * s.gap
      }
    }

    const drawHead = (s: Crawler) => {
      const h = s.pts[0]
      ctx.save()
      ctx.translate(h.x, h.y)
      ctx.rotate(s.heading)
      const R = s.r
      // forked tongue
      ctx.strokeStyle = TONGUE
      ctx.lineWidth = Math.max(1.5, R * 0.22)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(R * 1.25, 0)
      ctx.lineTo(R * 2.2, 0)
      ctx.moveTo(R * 2.2, 0)
      ctx.lineTo(R * 2.75, -R * 0.42)
      ctx.moveTo(R * 2.2, 0)
      ctx.lineTo(R * 2.75, R * 0.42)
      ctx.stroke()
      // head — a proper folk-style hooded head instead of a plain dot
      ctx.beginPath()
      ctx.ellipse(R * 0.12, 0, R * 1.38, R * 0.95, 0, 0, TAU)
      ctx.fillStyle = s.color
      ctx.fill()
      ctx.lineWidth = Math.max(2, R * 0.28)
      ctx.strokeStyle = MAROON
      ctx.stroke()
      // eyes
      for (const sy of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(R * 0.32, sy * R * 0.5, R * 0.34, 0, TAU)
        ctx.fillStyle = CREAM
        ctx.fill()
        ctx.lineWidth = Math.max(1, R * 0.12)
        ctx.strokeStyle = MAROON
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(R * 0.42, sy * R * 0.5, R * 0.15, 0, TAU)
        ctx.fillStyle = INK
        ctx.fill()
      }
      ctx.restore()
    }

    const drawTail = (s: Crawler) => {
      const n = s.pts.length
      const tip = s.pts[n - 1]
      const prev = s.pts[n - 2]
      const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x)
      ctx.save()
      ctx.translate(tip.x, tip.y)
      ctx.rotate(ang)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(-s.gap * 1.8, -s.gap * 0.55)
      ctx.lineTo(-s.gap * 1.4, 0)
      ctx.lineTo(-s.gap * 1.8, s.gap * 0.55)
      ctx.closePath()
      ctx.fillStyle = CREAM
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = MAROON
      ctx.stroke()
      ctx.restore()
    }

    const draw = (s: Crawler) => {
      const n = s.pts.length
      // silhouette pass (maroon outline), then body pass with colour bands
      for (let i = n - 1; i >= 0; i--) {
        ctx.beginPath()
        ctx.arc(s.pts[i].x, s.pts[i].y, radiusAt(s, i) + 2, 0, TAU)
        ctx.fillStyle = MAROON
        ctx.fill()
      }
      for (let i = n - 1; i >= 0; i--) {
        ctx.beginPath()
        ctx.arc(s.pts[i].x, s.pts[i].y, radiusAt(s, i), 0, TAU)
        ctx.fillStyle = i >= 6 && i % 5 < 2 ? s.band : s.color
        ctx.fill()
      }
      // cream belly dashes, echoing the board illustration
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(s.pts[0].x, s.pts[0].y)
      for (let i = 2; i < n; i += 2) ctx.lineTo(s.pts[i].x, s.pts[i].y)
      ctx.strokeStyle = CREAM
      ctx.lineWidth = Math.max(1.2, s.r * 0.16)
      ctx.lineCap = 'round'
      ctx.setLineDash([s.r * 0.45, s.r * 0.85])
      ctx.globalAlpha *= 0.8
      ctx.stroke()
      ctx.restore()
      drawTail(s)
      drawHead(s)
    }

    const frame = (now: number) => {
      const elapsed = now - t0
      const remain = duration - elapsed
      if (remain <= 0 || doneRef.current) {
        finish()
        return
      }
      const dtMs = Math.min(50, now - last)
      last = now

      ctx.clearRect(0, 0, W, H)
      ctx.globalAlpha = elapsed < 250 ? elapsed / 250 : remain < 380 ? remain / 380 : 1

      for (const s of crawlers) {
        update(s, now, dtMs)
        draw(s)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [duration])

  return (
    <div className="swarm enter" ref={(el) => el && requestAnimationFrame(() => el.classList.remove('enter'))}>
      <canvas ref={canvasRef} />
    </div>
  )
}
