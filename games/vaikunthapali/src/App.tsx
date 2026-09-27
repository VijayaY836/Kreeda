import { useCallback, useEffect, useRef, useState } from 'react'
import { GAMES } from './data/games'
import { HomeView } from './components/HomeView'
import { GameDetailView } from './components/GameDetailView'
import { PlayView } from './components/PlayView'
import { Vaikunthapali } from './components/vp/Vaikunthapali'
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

const HUB_PARAMS = new URLSearchParams(window.location.search)
const INITIAL_VIEW: View = HUB_PARAMS.get('start') === 'play'
  ? { k: 'play', id: 'vaikunthapali', mode: HUB_PARAMS.get('mode') === 'solo' ? 'solo' : 'mascot' }
  : { k: 'home' }

// ?embed=play renders just the board for the KREEDA hub's game card
// (kreeda.html frames this page). The board fills the card and scrolls inside
// the frame, so its own pop-ups (win screen, board guide) stay centred in view;
// Back to Games on the win screen asks the card to close.
const EMBED_PLAY = HUB_PARAMS.get('embed') === 'play'
const postToHub = (msg: object) => window.parent.postMessage({ source: 'kreeda-embed', ...msg }, '*')

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex justify-center mb-4">
    <div className="inline-flex flex-wrap justify-center gap-1 bg-[#F6ECD2] border-[2px] border-[#5C140F] p-1">
      {LANGS.map((c) => (
        <button
          key={c}
          className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-[1.5px] border-[#5C140F] transition-colors cursor-pointer ${
            c === lang
              ? 'bg-[#D8401F] text-white'
              : 'bg-[#E4D19E] text-[#2B1B12] hover:bg-[#F6ECD2]'
          }`}
          onClick={() => onChange(c)}
        >
          {VP_I18N[c].label}
        </button>
      ))}
    </div>
    </div>
  )
}

function EmbeddedPlay() {
  const [lang, setLang] = useState<Lang>(loadLang)
  useEffect(() => {
    document.documentElement.classList.add('vp-embedded')
    document.body.style.background = 'transparent'
    document.body.style.minHeight = '0'
    postToHub({ view: 'game', title: 'Vaikunthapali' })
  }, [])
  return (
    <LangContext.Provider value={lang}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        <Vaikunthapali
          mode={HUB_PARAMS.get('mode') === 'solo' ? 'solo' : 'mascot'}
          vpVersion="india"
          onExit={() => postToHub({ close: true })}
          header={<LangSwitcher lang={lang} onChange={(l) => { setLang(l); saveLang(l) }} />}
        />
      </div>
    </LangContext.Provider>
  )
}

interface ToastState {
  id: number
  msg: string
}

export default function App() {
  if (EMBED_PLAY) return <EmbeddedPlay />
  return <HubApp />
}

function HubApp() {
  const [view, setView] = useState<View>(INITIAL_VIEW)
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
  const currentGame = (view.k === 'detail' || view.k === 'play')
    ? GAMES.find((g) => g.id === view.id)
    : undefined

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
      <div className="min-h-screen">
        <Header
          currentView={view.k}
          onNavigateHome={() => setView({ k: 'home' })}
          gameTitle={currentGame?.name}
          gameNative={currentGame?.native}
        />

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* In-play language switcher */}
          {isInPlay && <LangSwitcher lang={lang} onChange={handleLangChange} />}

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
