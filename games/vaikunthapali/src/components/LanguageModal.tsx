import { useEffect } from 'react'
import type { Lang } from '../data/i18n'

const LANG_META: { lang: Lang; flag: string; native: string; english: string }[] = [
  { lang: 'en', flag: '🇬🇧', native: 'English', english: 'English' },
  { lang: 'hi', flag: '🇮🇳', native: 'हिंदी', english: 'Hindi' },
  { lang: 'te', flag: '🇮🇳', native: 'తెలుగు', english: 'Telugu' },
  { lang: 'ta', flag: '🇮🇳', native: 'தமிழ்', english: 'Tamil' },
  { lang: 'ml', flag: '🇮🇳', native: 'മലയാളം', english: 'Malayalam' },
]

const MODAL_STRINGS: Record<Lang, { title: string; sub: string; skip: string }> = {
  en: { title: 'Choose Your Language', sub: 'Select a language to play in', skip: 'Continue in English →' },
  hi: { title: 'अपनी भाषा चुनें', sub: 'खेलने के लिए भाषा चुनें', skip: 'हिंदी में जारी रखें →' },
  te: { title: 'మీ భాష ఎంచుకోండి', sub: 'ఆడటానికి భాష ఎంచుకోండి', skip: 'తెలుగులో కొనసాగించు →' },
  ta: { title: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', sub: 'விளையாட மொழியைத் தேர்ந்தெடுக்கவும்', skip: 'தமிழில் தொடர →' },
  ml: { title: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കൂ', sub: 'കളിക്കാൻ ഭാഷ തിരഞ്ഞെടുക്കൂ', skip: 'മലയാളത്തിൽ തുടരൂ →' },
}

export function LanguageModal({
  onSelect,
  onBack,
}: {
  onSelect: (lang: Lang) => void
  onBack: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBack])

  return (
    <div className="lang-modal-overlay" onClick={onBack} role="dialog" aria-modal="true" aria-labelledby="lang-modal-title">
      <div className="lang-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lang-modal-glow" />
        <div className="lang-modal-header">
          <div className="lang-modal-icon">🎲</div>
          <h2 id="lang-modal-title">{MODAL_STRINGS.en.title}</h2>
          <p>{MODAL_STRINGS.en.sub}</p>
        </div>
        <div className="lang-modal-grid">
          {LANG_META.map((l) => (
            <button
              key={l.lang}
              className="lang-card"
              onClick={() => onSelect(l.lang)}
            >
              <span className="lang-card-flag">{l.flag}</span>
              <span className="lang-card-native">{l.native}</span>
              <span className="lang-card-english">{l.english}</span>
            </button>
          ))}
        </div>
        <button className="lang-modal-skip" onClick={() => onSelect('en')}>
          {MODAL_STRINGS.en.skip}
        </button>
      </div>
    </div>
  )
}
