export type SiteLanguage = 'en' | 'te' | 'ta' | 'kn';

const supported: SiteLanguage[] = ['en', 'te', 'ta', 'kn'];
const requested = new URLSearchParams(window.location.search).get('lang') as SiteLanguage | null;
let saved: SiteLanguage | null = null;

try {
  saved = localStorage.getItem('aata-kalam-language') as SiteLanguage | null;
} catch {
  /* storage unavailable */
}

export const siteLanguage: SiteLanguage =
  requested && supported.includes(requested)
    ? requested
    : saved && supported.includes(saved)
      ? saved
      : 'en';

document.documentElement.lang = siteLanguage;

try {
  localStorage.setItem('aata-kalam-language', siteLanguage);
} catch {
  /* storage unavailable */
}

const shellCopy = {
  en: { allGames: 'All games', gameHome: 'Game home' },
  te: { allGames: 'అన్ని ఆటలు', gameHome: 'ఆట హోమ్' },
  ta: { allGames: 'அனைத்து விளையாட்டுகள்', gameHome: 'விளையாட்டு முகப்பு' },
  kn: { allGames: 'ಎಲ್ಲಾ ಆಟಗಳು', gameHome: 'ಆಟದ ಮುಖಪುಟ' },
} as const;

export function shellText(key: 'allGames' | 'gameHome'): string {
  return shellCopy[siteLanguage][key];
}

