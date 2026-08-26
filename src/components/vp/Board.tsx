import type { Lang } from '../../data/i18n'
import { VP_I18N, vpLoc } from '../../data/i18n'
import type { VpVersion } from '../../data/games'
import { VP_VERSIONS } from '../../data/games'
import { ladderAt, snakeAt, vpCenter, vpLadderSVG, vpSnakeSVG, VP_LADDERS, VP_SNAKES } from '../../data/vp'
import mascotUrl from '../../assets/kreedu-mascot.png'


export interface TokenPos {
  you: number
  kreedu: number
}

export interface TokenAnim {
  entity: 'you' | 'kreedu'
  kind: 'ladder' | 'snake' | null
}

const TOKEN_OFF = { you: -1.1, kreedu: 1.1 } as const

function Cell({ n, rt, c, lang, vpVersion }: { n: number; rt: number; c: number; lang: Lang; vpVersion: VpVersion }) {
  const l = ladderAt(n)
  const s = snakeAt(n)
  const cur = VP_I18N[lang]
  const vDef = VP_VERSIONS[vpVersion]
  const kind = l ? ' virtue' : s ? ' vice' : n === 1 ? ' janma' : n === 100 ? ' moksha' : ''
  const alt = (rt + c) % 2 === 0 ? ' alt' : ''

  let lab: [string, string] | null = null
  if (vpVersion === 'usa') {
    if (n === 1) lab = ['START', '']
    else if (n === 100) lab = ['✦ FINISH', '']
    else lab = null
  } else if (l) {
    const en = vpVersion === 'uk' ? vDef.labels[l.name].virtue : cur.virt[l.name]
    lab = vpVersion === 'uk' ? [en, l.name] : [cur.virt[l.name], l.name]
  } else if (s) {
    const en = vpVersion === 'uk' ? vDef.labels[s.name].vice : cur.vice[s.name]
    lab = vpVersion === 'uk' ? [en, s.name] : [cur.vice[s.name], s.name]
  } else if (n === 1) lab = [cur.janma.w, cur.janma.t]
  else if (n === 100) lab = [`✦ ${cur.moksha.w}`, cur.moksha.t]

  return (
    <div className={`vp-cell${alt}${kind}`}>
      <div className="vp-celltext">
        <span className="vp-num">{n}</span>
        {lab ? (
          <span className="vp-lab">
            <span>{lab[0]}</span>
            <span>{lab[1]}</span>
          </span>
        ) : (
          <span className="vp-tel">{vpLoc(lang, n)}</span>
        )}
      </div>
    </div>
  )
}

export function Board({
  pos,
  showKreedu,
  lang,
  vpVersion,
  tokenAnim,
}: {
  pos: TokenPos
  showKreedu: boolean
  lang: Lang
  vpVersion: VpVersion
  tokenAnim?: TokenAnim | null
}) {
  const cells: JSX.Element[] = []
  for (let rt = 0; rt < 10; rt++) {
    const row = 9 - rt
    for (let c = 0; c < 10; c++) {
      const n = row % 2 === 0 ? row * 10 + 1 + c : row * 10 + 10 - c
      cells.push(<Cell key={n} n={n} rt={rt} c={c} lang={lang} vpVersion={vpVersion} />)
    }
  }

  const youC = vpCenter(pos.you)
  const kreeduC = vpCenter(pos.kreedu)

  const youAnimClass =
    tokenAnim?.entity === 'you'
      ? tokenAnim.kind === 'ladder'
        ? ' anim-ladder'
        : tokenAnim.kind === 'snake'
          ? ' anim-snake'
          : ''
      : ''

  const kreeduAnimClass =
    tokenAnim?.entity === 'kreedu'
      ? tokenAnim.kind === 'ladder'
        ? ' anim-ladder'
        : tokenAnim.kind === 'snake'
          ? ' anim-snake'
          : ''
      : ''

  return (
    <div className="board-frame">
      <div className="board-frame-inner">
        <div className="board-parchment">
          <div className="parchment-wear parchment-wear-tl" />
          <div className="parchment-wear parchment-wear-tr" />
          <div className="parchment-wear parchment-wear-bl" />
          <div className="parchment-wear parchment-wear-br" />
          <div className="parchment-stain parchment-stain-1" />
          <div className="parchment-stain parchment-stain-2" />
          <div className="parchment-stain parchment-stain-3" />
          <div className="parchment-fold" />

          <div className="vp-board">
            <div className="vp-grid">{cells}</div>
            <svg className="vp-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              {VP_LADDERS.map((l) => vpLadderSVG(l))}
              {VP_SNAKES.map((s, i) => vpSnakeSVG(s, i))}
            </svg>
            <div
              className={`vp-token you${youAnimClass}`}
              style={{ left: `${youC.x + TOKEN_OFF.you}%`, top: `${youC.y}%` }}
            />
            {showKreedu && (
              <div
                className={`vp-token kreedu${kreeduAnimClass}`}
                style={{ left: `${kreeduC.x + TOKEN_OFF.kreedu}%`, top: `${kreeduC.y}%` }}
              >
                <img src={mascotUrl} alt="" />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export { TOKEN_OFF }
