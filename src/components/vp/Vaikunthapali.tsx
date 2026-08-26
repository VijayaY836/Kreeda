import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lang } from '../../data/i18n'
import { VP_I18N, fmt } from '../../data/i18n'
import { ladderAt, snakeAt, VP_LADDERS, VP_SNAKES } from '../../data/vp'
import { Board } from './Board'
import { Die } from './Die'
import { SnakeSwarm } from './SnakeSwarm'
import { useLang } from '../../data/LangContext'

const BEST_KEY = 'kreeda-vp-best'

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

function fmtTime(s: number): string {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}

function loadBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY)
    if (raw == null) return null
    return JSON.parse(raw) as number
  } catch {
    return null
  }
}

function saveBest(t: number) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(t))
  } catch { /* ignore */ }
}

type Entity = 'you' | 'kreedu'
type Phase = 'idle' | 'rolling' | 'stepping' | 'resolving' | 'snake-anim' | 'over'

export function Vaikunthapali({
  mode,
  onExit,
}: {
  mode: 'solo' | 'mascot'
  onExit: () => void
}) {
  const lang = useLang()
  const [youPos, setYouPos] = useState(1)
  const [kreeduPos, setKreeduPos] = useState(1)
  const [dieVal, setDieVal] = useState(0)
  const [dieSeq, setDieSeq] = useState(0)
  const [turn, setTurn] = useState<Entity>('you')
  const [phase, setPhase] = useState<Phase>('idle')
  const [event, setEvent] = useState('')
  const [bubble, setBubble] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [winInfo, setWinInfo] = useState<{
    winner: Entity
    stats: string
    note: string
    place: string
    title: string
  } | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [showSnakeSwarm, setShowSnakeSwarm] = useState(false)
  const [tokenAnim, setTokenAnim] = useState<{
    entity: Entity
    kind: 'ladder' | 'snake' | null
  } | null>(null)

  const genRef = useRef(0)
  const sixRef = useRef(0)
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const snakeTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const phaseRef = useRef<Phase>('idle')
  const turnRef = useRef<Entity>('you')
  const posRef = useRef({ you: 1, kreedu: 1 })
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const elapsedRef = useRef(0)
  const rollsRef = useRef(0)
  const langRef = useRef(lang)
  const handleRollRef = useRef<() => void>(() => {})

  const L = VP_I18N[lang]
  const vsKreedu = mode === 'mascot'

  // Sync refs outside of render phase via effect
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { turnRef.current = turn }, [turn])
  useEffect(() => { langRef.current = lang }, [lang])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    setElapsed(0)
    elapsedRef.current = 0
    timerRef.current = setInterval(() => {
      elapsedRef.current++
      setElapsed(elapsedRef.current)
    }, 1000)
  }, [stopTimer])

  const clearBubble = useCallback(() => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    setBubble(null)
  }, [])

  const showBubbleText = useCallback(
    (text: string) => {
      setBubble(text)
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
      bubbleTimerRef.current = setTimeout(clearBubble, 2600)
    },
    [clearBubble]
  )

  const clearSnakeTimer = useCallback(() => {
    if (snakeTimerRef.current) {
      clearTimeout(snakeTimerRef.current)
      snakeTimerRef.current = undefined
    }
  }, [])

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      clearBubble()
      clearSnakeTimer()
    }
  }, [stopTimer, clearBubble, clearSnakeTimer])

  // Init game
  useEffect(() => {
    genRef.current++
    sixRef.current = 0
    posRef.current = { you: 1, kreedu: 1 }
    rollsRef.current = 0
    setYouPos(1)
    setKreeduPos(1)
    setTurn('you')
    setPhase('idle')
    setDieVal(0)
    setEvent(vsKreedu ? L.msg.startVs : L.msg.startSolo)
    clearBubble()
    setWinInfo(null)
    setShowSnakeSwarm(false)
    if (!vsKreedu) startTimer()
    else stopTimer()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync language changes from parent context
  useEffect(() => {
    if (phaseRef.current === 'idle' || phaseRef.current === 'over') {
      setEvent(vsKreedu ? L.msg.startVs : L.msg.startSolo)
    }
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcut — reads from refs, stable handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'idle') return
      if (turnRef.current !== 'you') return
      if (e.code === 'Space' || e.code === 'Enter' || e.key === 'r') {
        e.preventDefault()
        handleRollRef.current()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const label = useCallback((e: Entity) => (e === 'you' ? L.you : 'Kreedu'), [L])

  const showSnakeAnimation = useCallback(
    (cb: () => void) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cb()
        return
      }
      setShowSnakeSwarm(true)
      clearSnakeTimer()
      snakeTimerRef.current = setTimeout(() => {
        setShowSnakeSwarm(false)
        cb()
      }, 2600)
    },
    [clearSnakeTimer]
  )

  const endOfTurn = useCallback(
    (e: Entity, v: number, gen: number) => {
      if (gen !== genRef.current) return
      const m = VP_I18N[langRef.current]
      let again = false

      if (v === 6) {
        sixRef.current++
        if (sixRef.current >= 3) {
          sixRef.current = 0
          setEvent(fmt(m.msg.sixes, { e: label(e) }))
        } else {
          again = true
          setEvent(fmt(m.msg.six, { e: label(e) }))
        }
      } else {
        sixRef.current = 0
      }

      if (again) {
        setPhase('idle')
        if (e === 'kreedu' && vsKreedu) {
          scheduleKreedu(gen, 700)
        }
        return
      }

      if (vsKreedu) {
        const next = e === 'you' ? 'kreedu' : 'you'
        setTurn(next)
        setPhase('idle')
        if (next === 'kreedu') scheduleKreedu(gen, 850)
      } else {
        setPhase('idle')
      }
    },
    [label, vsKreedu]
  )

  const resolveSquare = useCallback(
    (e: Entity, v: number, gen: number) => {
      if (gen !== genRef.current) return
      const p = posRef.current[e]
      const VP = VP_I18N[langRef.current]
      const m = VP.msg

      if (p === 100) {
        setPhase('over')
        stopTimer()
        const nm = label(e)
        setEvent(fmt(m.win, { e: nm }))
        setTimeout(() => {
          if (gen !== genRef.current) return
          const youWon = e === 'you'
          const W = VP.win
          let stats = ''
          let note = ''
          if (mode === 'solo') {
            stats = fmt(W.statsSolo, { time: fmtTime(elapsedRef.current), r: String(rollsRef.current) })
            const best = loadBest()
            if (best == null || elapsedRef.current < best) {
              saveBest(elapsedRef.current)
              note = W.newBest
            } else {
              note = fmt(W.best, { time: fmtTime(best) })
            }
          } else {
            stats = youWon
              ? fmt(W.statsVsYou, { r: String(rollsRef.current), p: String(posRef.current.kreedu) })
              : fmt(W.statsVsK, { r: String(rollsRef.current), p: String(posRef.current.you) })
            note = youWon ? W.noteY : W.noteK
          }
          setWinInfo({
            winner: e,
            stats,
            note,
            place: youWon ? W.placeYou : W.placeK,
            title: mode === 'mascot' && !youWon ? W.titleK : W.titleYou,
          })
        }, 700)
        return
      }

      const lad = ladderAt(p)
      const snk = snakeAt(p)

      if (lad) {
        const nm = `${lad.name} (${VP.virt[lad.name]})`
        setEvent(fmt(m.ladder, { e: label(e), name: nm, a: String(p), b: String(lad.to) }))
        posRef.current[e] = lad.to
        setTokenAnim({ entity: e, kind: 'ladder' })
        if (e === 'you') setYouPos(lad.to)
        else setKreeduPos(lad.to)
        setTimeout(() => {
          setTokenAnim(null)
          if (gen === genRef.current) endOfTurn(e, v, gen)
        }, 650)
        return
      }

      if (snk) {
        const nm = `${snk.name} (${VP.vice[snk.name]})`
        setEvent(fmt(m.snake, { e: label(e), name: nm, a: String(p), b: String(snk.to) }))
        posRef.current[e] = snk.to
        setTokenAnim({ entity: e, kind: 'snake' })
        if (e === 'you') setYouPos(snk.to)
        else setKreeduPos(snk.to)
        showSnakeAnimation(() => {
          setTokenAnim(null)
          if (gen === genRef.current) endOfTurn(e, v, gen)
        })
        return
      }

      setEvent(fmt(m.move, { e: label(e), v: String(v), p: String(p) }))
      endOfTurn(e, v, gen)
    },
    [label, mode, showSnakeAnimation, stopTimer, endOfTurn]
  )

  const moveEntity = useCallback(
    (e: Entity, v: number, gen: number) => {
      if (gen !== genRef.current) return
      const start = posRef.current[e]
      const target = start + v
      const m = VP_I18N[langRef.current]

      if (target > 100) {
        setEvent(fmt(m.msg.over, { e: label(e), v: String(v), goal: m.moksha.w, n: String(100 - start), p: String(start) }))
        endOfTurn(e, v, gen)
        return
      }

      let cur = start
      const step = () => {
        if (gen !== genRef.current) return
        cur++
        posRef.current[e] = cur
        if (e === 'you') setYouPos(cur)
        else setKreeduPos(cur)
        if (cur < target) {
          setTimeout(step, 280)
        } else {
          setTimeout(() => resolveSquare(e, v, gen), 350)
        }
      }
      step()
    },
    [label, resolveSquare, endOfTurn]
  )

  const rollFor = useCallback(
    (e: Entity, gen: number) => {
      const v = 1 + Math.floor(Math.random() * 6)
      setDieSeq((s) => s + 1)
      setTimeout(() => {
        if (gen === genRef.current) {
          setDieVal(v)
          setTimeout(() => {
            if (gen === genRef.current) moveEntity(e, v, gen)
          }, 400)
        }
      }, 550)
    },
    [moveEntity]
  )

  const scheduleKreedu = useCallback(
    (gen: number, delay: number) => {
      setTimeout(() => {
        if (gen !== genRef.current) return
        if (Math.random() < 0.5) {
          showBubbleText(pick(VP_I18N[langRef.current].bubble.pre))
        }
        setPhase('rolling')
        rollFor('kreedu', gen)
      }, delay)
    },
    [rollFor, showBubbleText]
  )

  const handleRoll = useCallback(() => {
    if (turnRef.current !== 'you' || phaseRef.current !== 'idle') return
    const gen = genRef.current
    rollsRef.current++
    setPhase('rolling')
    rollFor('you', gen)
  }, [rollFor])

  handleRollRef.current = handleRoll

  const restart = useCallback(() => {
    genRef.current++
    sixRef.current = 0
    posRef.current = { you: 1, kreedu: 1 }
    rollsRef.current = 0
    setYouPos(1)
    setKreeduPos(1)
    setTurn('you')
    setPhase('idle')
    setDieVal(0)
    setEvent(vsKreedu ? L.msg.startVs : L.msg.startSolo)
    clearBubble()
    clearSnakeTimer()
    setWinInfo(null)
    setShowSnakeSwarm(false)
    setTokenAnim(null)
    if (!vsKreedu) startTimer()
    else stopTimer()
  }, [vsKreedu, L, clearBubble, clearSnakeTimer, startTimer, stopTimer])

  const onExitRef = useRef(onExit)
  onExitRef.current = onExit
  const handleExit = useCallback(() => {
    genRef.current++
    stopTimer()
    clearBubble()
    clearSnakeTimer()
    onExitRef.current()
  }, [stopTimer, clearBubble, clearSnakeTimer])

  return (
    <div className="vp-wrap">
      <div className="vp-hud">
        <span className={`vp-chip${turn === 'you' && phase !== 'over' ? ' active' : ''}`}>
          {L.you} · {youPos}
        </span>
        {vsKreedu && (
          <span className={`vp-chip${turn === 'kreedu' && phase !== 'over' ? ' active' : ''}`}>
            Kreedu · {kreeduPos}
          </span>
        )}
        {!vsKreedu && (
          <span className="vp-chip">⏱ {fmtTime(elapsed)}</span>
        )}
        <span className="spacer" />
        <button className="vp-guide-btn" onClick={() => setShowGuide(true)} title="Board guide">
          ?
        </button>
      </div>

      <Board
        pos={{ you: youPos, kreedu: kreeduPos }}
        showKreedu={vsKreedu}
        lang={lang}
        tokenAnim={tokenAnim}
      />

      <div className="vp-controls">
        <Die value={dieVal} seq={dieSeq} />
        <button
          className="vp-rollbtn"
          disabled={turn !== 'you' || phase !== 'idle'}
          onClick={handleRoll}
        >
          {L.roll}
        </button>
      </div>

      <div className="vp-event">{event}</div>

      {bubble && <div className="kreedu-bubble show">{bubble}</div>}

      {showSnakeSwarm && (
        <SnakeSwarm onDone={() => setShowSnakeSwarm(false)} />
      )}

      {winInfo && (
        <div className="vp-overlay">
          <div className="modal">
            <div className="place">{winInfo.place}</div>
            <h3>{winInfo.title}</h3>
            <p>{winInfo.stats}</p>
            <p className="how">{winInfo.note}</p>
            <div className="vp-btnrow">
              <button className="vp-mini" onClick={restart}>
                {L.win.again}
              </button>
              <button className="vp-mini ghost" onClick={handleExit}>
                {L.win.back}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGuide && !winInfo && (
        <div className="vp-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false) }}>
          <div className="modal modal-wide">
            <GuideContent lang={lang} />
            <div className="vp-btnrow">
              <button className="vp-mini ghost" onClick={() => setShowGuide(false)}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GuideContent({ lang }: { lang: Lang }) {
  const L = VP_I18N[lang]
  const g = L.guide

  const row = (x: { from: number; to: number; name: string }) => {
    const sc = L.virt[x.name as keyof typeof L.virt] || L.vice[x.name as keyof typeof L.vice]
    return (
      <tr key={x.from}>
        <td>{x.from} → {x.to}</td>
        <td><strong>{x.name}</strong> <span className="vp-te">{sc}</span></td>
        <td>{L.mean[x.name as keyof typeof L.mean]}</td>
      </tr>
    )
  }

  return (
    <>
      <div className="place">{g.kicker}</div>
      <h3>{g.title}</h3>

      <h4>{g.aboutT}</h4>
      <p dangerouslySetInnerHTML={{ __html: g.about }} />

      <h4>{g.ladT}</h4>
      <table className="vp-table">
        <thead>
          <tr>
            <th>{g.th0}</th>
            <th>{g.th1}</th>
            <th>{g.th2}</th>
          </tr>
        </thead>
        <tbody>{VP_LADDERS.map(row)}</tbody>
      </table>

      <h4>{g.vicT}</h4>
      <table className="vp-table">
        <thead>
          <tr>
            <th>{g.th0}</th>
            <th>{g.th1}</th>
            <th>{g.th2}</th>
          </tr>
        </thead>
        <tbody>{VP_SNAKES.map(row)}</tbody>
      </table>

      <h4>{g.rulesT}</h4>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.8 }}>
        {g.rules.map((r, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
        ))}
      </ul>
    </>
  )
}
