import { GAMES, ICONS } from '../data/games'
import mascotUrl from '../assets/kreedu-mascot.png'
import { useLang } from '../data/LangContext'
import { SHELL_I18N } from '../data/i18n'
import { LotusIcon } from './FolkArtMotifs'
import { FolkArtFrame } from './FolkArtFrame'
import { FolkDivider } from './FolkArtMotifs'
import { Play, Map, BookOpen } from 'lucide-react'

export function HomeView({ onOpen }: { onOpen: (id: string) => void }) {
  const lang = useLang()
  const S = SHELL_I18N[lang]

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-6 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 bg-[#F6ECD2] border-[2px] border-[#5C140F] px-4 py-1.5 mb-3 text-xs uppercase font-bold tracking-widest text-[#5C140F]">
            <LotusIcon size={18} color="#D8401F" />
            Traditional Indian Board Games
          </div>

          <h1 className="font-fraunces text-4xl sm:text-6xl font-extrabold text-[#5C140F] tracking-tight leading-none mb-1">
            KREEDA
          </h1>
          <div className="font-telugu text-2xl sm:text-3xl font-bold text-[#D9587B] mb-3">
            क्रीड़ा
          </div>

          <p className="font-fraunces italic text-lg sm:text-xl text-[#6B4E3D] mb-4">
            "Ancient games of strategy, patience, and play."
          </p>

          <FolkDivider className="mb-4" />

          <p className="text-base sm:text-lg text-[#2B1B12] font-medium leading-relaxed mb-6">
            <strong className="text-[#D8401F] font-bold">Six games. A thousand years.</strong> Every game here was born in India — some stayed close to home, some crossed oceans and came back with new names.
          </p>

          {/* Quick Stats */}
          <div className="w-full bg-[#F6ECD2] border-[3px] border-[#5C140F] p-5 mb-6 relative">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-fraunces text-2xl font-extrabold text-[#D8401F]">6</div>
                <div className="text-xs font-bold text-[#5C140F] uppercase">Games</div>
              </div>
              <div>
                <div className="font-fraunces text-2xl font-extrabold text-[#0E5C58]">1000+</div>
                <div className="text-xs font-bold text-[#5C140F] uppercase">Years Old</div>
              </div>
              <div>
                <div className="font-fraunces text-2xl font-extrabold text-[#EFA90C]">5</div>
                <div className="text-xs font-bold text-[#5C140F] uppercase">Languages</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-wrap gap-2.5">
            <a
              href="#games"
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D8401F] hover:bg-[#B83215] text-white border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Choose a Game</span>
            </a>
            <a
              href="#about"
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F6ECD2] hover:bg-white text-[#5C140F] border-[2px] border-[#5C140F] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How to Play</span>
            </a>
          </div>
        </div>

        {/* Right Hero Art */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-[460px] relative">
            {/* Mascot */}
            <div className="bg-[#F6ECD2] border-[3px] border-[#5C140F] p-4 flex items-center justify-center">
              <img
                src={mascotUrl}
                alt="Kreedu mascot"
                className="w-48 h-48 object-contain"
              />
            </div>
            {/* Speech */}
            <div className="mt-3 bg-[#F6ECD2] border-[3px] border-[#5C140F] p-3 text-center">
              <p className="font-fraunces italic text-sm text-[#5C140F]">
                {S.heroSpeech}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Pillars */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FolkArtFrame>
          <div className="flex items-center gap-2 mb-2 text-[#D8401F]">
            <LotusIcon size={22} color="#D8401F" />
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F]">
              Born in India
            </h3>
          </div>
          <p className="text-xs text-[#2B1B12] leading-relaxed">
            Every game on this board originated in the Indian subcontinent — played on temple floors, verandas, and woven cloth for centuries.
          </p>
        </FolkArtFrame>

        <FolkArtFrame>
          <div className="flex items-center gap-2 mb-2 text-[#0E5C58]">
            <Map className="w-5 h-5 text-[#0E5C58]" />
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F]">
              Mapped Globally
            </h3>
          </div>
          <p className="text-xs text-[#2B1B12] leading-relaxed">
            Trace each game's journey across continents — from Indian origins to colonial adaptations and back again.
          </p>
        </FolkArtFrame>

        <FolkArtFrame>
          <div className="flex items-center gap-2 mb-2 text-[#EFA90C]">
            <div className="w-5 h-5 rotate-45 bg-[#EFA90C] border-2 border-[#5C140F]" />
            <h3 className="font-fraunces text-xl font-bold text-[#5C140F]">
              Play & Learn
            </h3>
          </div>
          <p className="text-xs text-[#2B1B12] leading-relaxed">
            Play against Kreedu AI or solo, in 5 languages. Every board teaches the history and culture behind the game.
          </p>
        </FolkArtFrame>
      </div>

      {/* Section Label */}
      <div id="games" className="mt-12 mb-6 flex items-center gap-3">
        <h2 className="font-fraunces text-2xl font-extrabold text-[#5C140F]">{S.chooseGame}</h2>
        <div className="flex-1 h-[2px] bg-[#5C140F]" />
        <div className="w-3 h-3 rotate-45 bg-[#D8401F] border-2 border-[#5C140F]" />
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAMES.map((g) => (
          <FolkArtFrame
            key={g.id}
            hasCorners={false}
            className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            onClick={() => onOpen(g.id)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#D8401F] text-[#F6ECD2] flex items-center justify-center border-[2px] border-[#5C140F] flex-shrink-0">
                <div className="w-5 h-5">{ICONS[g.icon]}</div>
              </div>
              <div className="min-w-0">
                <h3 className="font-fraunces text-lg font-bold text-[#5C140F] m-0 leading-tight truncate">
                  {g.name}
                </h3>
                <p className="text-xs text-[#6B4E3D] font-medium m-0 truncate">
                  {g.native}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5C140F] bg-[#E4D19E] border border-[#5C140F] px-2 py-0.5 uppercase tracking-wider">
                {g.hasSoloMode ? S.soloOrVs : S.vsKreedu}
              </span>
              <span className="text-xs font-bold text-[#D8401F]">
                {S.explore}
              </span>
            </div>
          </FolkArtFrame>
        ))}
      </div>
    </div>
  )
}
