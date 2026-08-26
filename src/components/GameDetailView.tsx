import { useState } from 'react'
import type { GameDef, Pin } from '../data/games'
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
  onStartPlay: (mode: PlayMode) => void
}) {
  const [mode, setMode] = useState<PlayMode>('mascot')
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
          <h1 className="display">{game.name}</h1>
          <div className="native-line">{game.native}</div>
        </div>
        <div>
          {game.hasSoloMode ? (
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

      <div className="panel">
        <h2>{S.wherePlayed}</h2>
        <p className="sub">{game.mapSub}</p>
        <MapView pins={game.pins} path={game.path} lang={lang} onPinClick={setOpenPin} />
      </div>

      <div className="panel instructions">
        <h2>{S.howToPlay}</h2>
        <ul>
          {game.instructions.map((t, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </ul>
      </div>

      <button className="play-btn" onClick={() => onStartPlay(mode)}>
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
