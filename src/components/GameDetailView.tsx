import { useState } from 'react'
import type { GameDef, Pin } from '../data/games'
import type { PlayMode } from '../App'
import { useLang } from '../data/LangContext'
import { SHELL_I18N } from '../data/i18n'

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
        <div className="map-frame">
          <svg className="paths" viewBox="0 0 100 100" preserveAspectRatio="none">
            {game.path && game.pins.length > 1 && (
              <path
                d={game.pins.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                fill="none"
                stroke="#FCF5E8"
                strokeWidth="0.6"
                strokeDasharray="1.2 2"
                strokeLinecap="round"
                opacity="0.85"
              />
            )}
          </svg>
          <div>
            {game.pins.map((p, i) => (
              <div
                key={`${p.place}-${i}`}
                className="pin"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={() => setOpenPin(p)}
              >
                <svg viewBox="0 0 24 32">
                  <path
                    d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 8 10.5 18 10.5 18s10.5-10 10.5-18c0-5.8-4.7-10.5-10.5-10.5z"
                    fill={i === 0 ? '#EFA90C' : '#D8401F'}
                    stroke="#5C140F"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="4" fill="#EFDFB8" stroke="#5C140F" strokeWidth="1.6" />
                </svg>
              </div>
            ))}
          </div>
          <div className="map-caption">
            {game.path ? S.stitchedLine : S.scatteredPins}
          </div>
        </div>
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
