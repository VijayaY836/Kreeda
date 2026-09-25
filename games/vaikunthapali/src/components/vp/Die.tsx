import { VP_PIPS } from '../../data/vp'

const FACES: Record<number, { front: number; back: number; right: number; left: number; top: number; bottom: number }> = {
  1: { front: 1, back: 6, right: 2, left: 5, top: 3, bottom: 4 },
  2: { front: 2, back: 5, right: 1, left: 6, top: 3, bottom: 4 },
  3: { front: 3, back: 4, right: 1, left: 6, top: 5, bottom: 2 },
  4: { front: 4, back: 3, right: 1, left: 6, top: 2, bottom: 5 },
  5: { front: 5, back: 2, right: 6, left: 1, top: 3, bottom: 4 },
  6: { front: 6, back: 1, right: 5, left: 2, top: 3, bottom: 4 },
}

function Face({ value }: { value: number }) {
  const on = VP_PIPS[value] ?? []
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`die-pip${on.includes(i) ? ' on' : ''}`} />
      ))}
    </>
  )
}

export function Die({ value, seq }: { value: number; seq: number }) {
  const f = FACES[value || 1]

  return (
    <div className="die-scene">
      <div key={seq} className={`die-cube${seq > 0 ? ' rolling' : ''}`}>
        <div className="die-face die-face-front"><Face value={f.front} /></div>
        <div className="die-face die-face-back"><Face value={f.back} /></div>
        <div className="die-face die-face-right"><Face value={f.right} /></div>
        <div className="die-face die-face-left"><Face value={f.left} /></div>
        <div className="die-face die-face-top"><Face value={f.top} /></div>
        <div className="die-face die-face-bottom"><Face value={f.bottom} /></div>
        {seq > 0 && <div className="die-flash" />}
      </div>
    </div>
  )
}
