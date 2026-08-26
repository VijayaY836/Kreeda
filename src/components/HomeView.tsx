import { GAMES, ICONS } from '../data/games'
import mascotUrl from '../assets/kreedu-mascot.png'
import { useLang } from '../data/LangContext'
import { SHELL_I18N } from '../data/i18n'

export function HomeView({ onOpen }: { onOpen: (id: string) => void }) {
  const lang = useLang()
  const S = SHELL_I18N[lang]

  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <div className="mascot">
            <img src={mascotUrl} alt="Kreedu, the KREEDA mascot" />
          </div>
          <div className="hero-text">
            <h1 className="display">
              {S.heroTitle1}
              <br />
              {S.heroTitle2}
            </h1>
            <p>{S.heroP}</p>
            <div className="speech">{S.heroSpeech}</div>
          </div>
        </div>
      </div>

      <div className="section-label">
        <h2>{S.chooseGame}</h2>
        <div className="thread" />
      </div>

      <div className="grid">
        {GAMES.map((g) => (
          <div key={g.id} className={`card tile-${g.tile}`} onClick={() => onOpen(g.id)}>
            <div className="icon-wrap">{ICONS[g.icon]}</div>
            <h3>{g.name}</h3>
            <p className="native">{g.native}</p>
            <span className="badge">{g.hasSoloMode ? S.soloOrVs : S.vsKreedu}</span>
            <div className="explore">{S.explore}</div>
          </div>
        ))}
      </div>
    </>
  )
}
