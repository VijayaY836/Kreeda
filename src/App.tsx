import { useCallback, useEffect, useRef, useState } from 'react'
import { GAMES } from './data/games'
import { HomeView } from './components/HomeView'
import { GameDetailView } from './components/GameDetailView'
import { PlayView } from './components/PlayView'
import { LanguageModal } from './components/LanguageModal'
import { Header } from './components/Header'
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

const GAME_ROUTES: Record<string, string> = {
  'puli-meka': './games/puli-meka-aata/site/',
  'ashta-chamma': './games/ashta-chamma/site/',
  'vaamana-guntalu': './games/vaamana-guntalu/site/',
  chaturangam: './games/chaturangam/site/',
  'daadi-aata': './games/daadi-aata/site/',
}

export default function App() {
  const [view, setView] = useState<View>({ k: 'home' })
  const [toast, setToast] = useState<ToastState | null>(null)
  const [lang, setLang] = useState<Lang>(loadLang)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
  const currentGame = (view.k === 'detail' || view.k === 'play')
    ? GAMES.find((g) => g.id === view.id)
    : undefined

  let body: JSX.Element
  if (view.k === 'home') {
    body = <HomeView onOpen={(id) => {
      if (id === 'vaikunthapali') {
        setView({ k: 'lang-select', id })
      } else if (GAME_ROUTES[id]) {
        window.location.assign(GAME_ROUTES[id])
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
      <div className="min-h-screen">
        <Header
          currentView={view.k}
          onNavigateHome={() => setView({ k: 'home' })}
          gameTitle={currentGame?.name}
          gameNative={currentGame?.native}
        />

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* In-play language switcher */}
          {isInPlay && (
            <div className="flex justify-center gap-1 mb-4 bg-[#F6ECD2] border-[2px] border-[#5C140F] p-1 inline-flex mx-auto">
              {LANGS.map((c) => (
                <button
                  key={c}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-[1.5px] border-[#5C140F] transition-colors cursor-pointer ${
                    c === lang
                      ? 'bg-[#D8401F] text-white'
                      : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-[#F6ECD2]'
                  }`}
                  onClick={() => handleLangChange(c)}
                >
                  {VP_I18N[c].label}
                </button>
              ))}
            </div>
          )}

          {body}
        </div>

        {toast && (
          <div key={toast.id} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#5C140F] text-[#F6ECD2] px-5 py-2.5 border-[2px] border-[#3D1A0A] font-bold text-sm shadow-lg animate-[slideUp_.3s_ease]">
            {toast.msg}
          </div>
        )}
      </div>
    </LangContext.Provider>
  )
}
