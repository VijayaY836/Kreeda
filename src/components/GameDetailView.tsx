import { useState } from 'react'
import type { GameDef, Pin, VpVersion } from '../data/games'
import { VP_VERSIONS } from '../data/games'
import type { PlayMode } from '../App'
import { useLang } from '../data/LangContext'
import { SHELL_I18N } from '../data/i18n'
import { MapView } from './MapView'

export function GameDetailView({
  game,
  onBack,
  onStartPlay,
}: {
  game: GameDef
  onBack: () => void
  onStartPlay: (mode: PlayMode, vpVersion?: VpVersion) => void
}) {
  const [mode, setMode] = useState<PlayMode>('mascot')
  const [vpVersion, setVpVersion] = useState<VpVersion>(game.vpVersion ?? 'india')
  const [openPin, setOpenPin] = useState<Pin | null>(null)
  const lang = useLang()
  const S = SHELL_I18N[lang]

  return (
    <>
      <button className="backbtn" onClick={onBack}>
        {S.backToAll}
      </button>

      <div className="game-head">
        <div>
          <h1 className="display">{game.vpVersion ? VP_VERSIONS[vpVersion].name : game.name}</h1>
          <div className="native-line">{game.vpVersion ? VP_VERSIONS[vpVersion].native : game.native}</div>
        </div>
        <div>
          {game.hasSoloMode && !game.vpVersion ? (
            <div className="mode-toggle">
              <button className={mode === 'solo' ? 'active' : ''} onClick={() => setMode('solo')}>
                {S.solo}
              </button>
              <button className={mode === 'mascot' ? 'active' : ''} onClick={() => setMode('mascot')}>
                {S.vsKreedu}
              </button>
            </div>
          ) : (
            <div className="mode-fixed">{S.vsKreedu}</div>
          )}
        </div>
      </div>

      {game.vpVersion && (
        <div className="vp-version-select">
          {(['india', 'uk', 'usa'] as VpVersion[]).map((v) => (
            <button
              key={v}
              className={`vp-version-pill${v === vpVersion ? ' active' : ''}`}
              onClick={() => setVpVersion(v)}
            >
              {VP_VERSIONS[v].name}
            </button>
          ))}
        </div>
      )}

      <div className="panel">
        <h2>{S.wherePlayed}</h2>
        <p className="sub">{game.mapSub}</p>
        <MapView pins={game.pins} path={game.path} lang={lang} onPinClick={setOpenPin} />
      </div>

      <div className="panel instructions">
        <h2>{S.howToPlay}</h2>
        <ul>
          {(game.vpVersion ? VP_VERSIONS[vpVersion].instructions : game.instructions).map((t, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </ul>
      </div>

      <button className="play-btn" onClick={() => onStartPlay(mode, game.vpVersion ? vpVersion : undefined)}>
        {S.playBtn}
      </button>

      {openPin && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setOpenPin(null)}>
          <div className="modal">
            <button className="close" onClick={() => setOpenPin(null)}>
              ✕
            </button>
            <div className="place">{openPin.place}</div>
            <h3>{openPin.name}</h3>
            <p>{openPin.fact}</p>
            <div className="how">{openPin.how}</div>
          </div>
        </div>
      )}
    </>
  )
}
