import { useCallback, useEffect, useRef, useState } from 'react'
import { GAMES } from './data/games'
import { HomeView } from './components/HomeView'
import { GameDetailView } from './components/GameDetailView'
import { PlayView } from './components/PlayView'
import { LanguageModal } from './components/LanguageModal'
import { LangContext } from './data/LangContext'
import { loadLang, saveLang, LANGS, VP_I18N } from './data/i18n'
import type { Lang } from './data/i18n'
import type { VpVersion } from './data/games'

export type PlayMode = 'solo' | 'mascot'
type View =
  | { k: 'home' }
  | { k: 'detail'; id: string }
  | { k: 'lang-select'; id: string }
  | { k: 'play'; id: string; mode: PlayMode; vpVersion?: VpVersion }

interface ToastState {
  id: number
  msg: string
}

export default function App() {
  const [view, setView] = useState<View>({ k: 'home' })
  const [toast, setToast] = useState<ToastState | null>(null)
  const [lang, setLang] = useState<Lang>(loadLang)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleLangChange = useCallback((l: Lang) => {
    setLang(l)
    saveLang(l)
  }, [])

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), msg })
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const isInPlay = view.k === 'play' && view.id === 'vaikunthapali'

  let body: JSX.Element
  if (view.k === 'home') {
    body = <HomeView onOpen={(id) => {
      if (id === 'vaikunthapali') {
        setView({ k: 'lang-select', id })
      } else {
        setView({ k: 'detail', id })
      }
    }} />
  } else if (view.k === 'detail') {
    body = (
      <GameDetailView
        key={view.id}
        game={GAMES.find((g) => g.id === view.id) ?? GAMES[0]}
        onBack={() => setView({ k: 'home' })}
        onStartPlay={(mode, vpVersion) => setView({ k: 'play', id: view.id, mode, vpVersion })}
      />
    )
  } else if (view.k === 'lang-select') {
    body = (
      <LanguageModal
        onSelect={(l) => {
          handleLangChange(l)
          setView({ k: 'detail', id: view.id })
        }}
        onBack={() => setView({ k: 'home' })}
      />
    )
  } else {
    body = (
      <PlayView
        key={`${view.id}-${view.mode}`}
        gameId={view.id}
        mode={view.mode}
        showToast={showToast}
        onBack={() => setView({ k: 'detail', id: view.id })}
      />
    )
  }

  return (
    <LangContext.Provider value={lang}>
      <div className="app">
        <div className="topbar">
          <div className="wordmark">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#EFA90C" stroke="#5C140F" strokeWidth="3" />
              <circle cx="20" cy="20" r="6.5" fill="#D8401F" stroke="#5C140F" strokeWidth="2.4" />
              <circle cx="20" cy="6" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2" />
              <circle cx="20" cy="34" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2" />
              <circle cx="6" cy="20" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2" />
              <circle cx="34" cy="20" r="3.4" fill="#0E5C58" stroke="#5C140F" strokeWidth="2" />
            </svg>
            KREEDA <span className="dev">क्रीड़ा</span>
          </div>
          {isInPlay && (
            <div className="topbar-lang">
              {LANGS.map((c) => (
                <button
                  key={c}
                  className={`topbar-lang-btn${c === lang ? ' active' : ''}`}
                  onClick={() => handleLangChange(c)}
                >
                  {VP_I18N[c].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {body}

        {toast && (
          <div key={toast.id} className="toast show">
            {toast.msg}
          </div>
        )}
      </div>
    </LangContext.Provider>
  )
}
