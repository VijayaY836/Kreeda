import { useEffect } from 'react'
import { GAMES } from '../data/games'
import mascotUrl from '../assets/kreedu-mascot.png'
import { Vaikunthapali } from './vp/Vaikunthapali'
import type { PlayMode } from '../App'
import { useLang } from '../data/LangContext'
import { SHELL_I18N, fmt } from '../data/i18n'

export function PlayView({
  gameId,
  mode,
  showToast,
  onBack,
}: {
  gameId: string
  mode: PlayMode
  showToast: (msg: string) => void
  onBack: () => void
}) {
  const game = GAMES.find((g) => g.id === gameId) ?? GAMES[0]
  const isVP = game.id === 'vaikunthapali'
  const lang = useLang()
  const S = SHELL_I18N[lang]
  const modeLabel = game.hasSoloMode ? (mode === 'solo' ? S.solo : S.vsKreedu) : S.vsKreedu

  useEffect(() => {
    if (!isVP) showToast(fmt(S.loaded, { g: game.name, m: modeLabel }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <button className="backbtn" onClick={onBack}>
        {S.backToGameInfo}
      </button>

      {isVP ? (
        <Vaikunthapali mode={mode} onExit={onBack} />
      ) : (
        <div className="play-shell panel">
          <div className="mascot">
            <img src={mascotUrl} alt="Kreedu, the KREEDA mascot" />
          </div>
          <h2>
            {game.name} — {modeLabel}
          </h2>
          <p>{S.playSubtitle}</p>
        </div>
      )}
    </>
  )
}
