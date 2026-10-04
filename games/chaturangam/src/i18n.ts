import { useSyncExternalStore } from 'react';
import type { PieceLetter, Variant } from './types';

/* The whole KREEDA app shares one language setting: localStorage "kreeda-lang"
   (see js/i18n.js in the hub). Inside the hub's cards the page also gets
   ?lang=xx, which wins. Components call useLang() to re-render on a change and
   t('key', { var }) for text; missing words fall back to English. */

export type Lang = 'en' | 'hi' | 'te' | 'ta' | 'ml';
const CODES: Lang[] = ['en', 'hi', 'te', 'ta', 'ml'];
const KEY = 'kreeda-lang';
const isLang = (v: unknown): v is Lang => CODES.includes(v as Lang);

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch { /* storage unavailable */ }
  return 'en';
}

let current: Lang = initialLang();
document.documentElement.lang = current;
const listeners = new Set<() => void>();
window.addEventListener('storage', (e) => {
  if (e.key === KEY && isLang(e.newValue) && e.newValue !== current) {
    current = e.newValue;
    document.documentElement.lang = current;
    listeners.forEach((fn) => fn());
  }
});

export function useLang(): Lang {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => current,
  );
}

export function t(key: string, vars?: Record<string, string | number>): string {
  let s = DICT[current][key] ?? DICT.en[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return s;
}

// Names that appear inside sentences
export const sideName = (variant: Variant, side: 'w' | 'b') => t(`side.${variant}.${side}`);
export const variantTitle = (variant: Variant) => t(`variant.${variant}`);
export const pieceName = (variant: Variant, letter: PieceLetter) => t(`piece.${variant}.${letter}`);
export const pieceMeaning = (variant: Variant, letter: PieceLetter) => t(`meaning.${variant}.${letter}`);
export const levelName = (level: number) => t(`level.${level}`);
// PIECE_INFO's "Worth 1" / "Worth about 3" / "Priceless" / "The game"
export function worthLabel(english: string): string {
  const about = /^Worth about (.+)$/.exec(english);
  if (about) return t('worth.about', { n: about[1] });
  const exact = /^Worth (.+)$/.exec(english);
  if (exact) return t('worth.exact', { n: exact[1] });
  if (english === 'Priceless') return t('worth.priceless');
  if (english === 'The game') return t('worth.game');
  return english;
}

type Dict = Record<string, string>;
const DICT: Record<Lang, Dict> = {
  en: {
    'variant.chaturanga': 'Chaturangam', 'variant.chess': 'Chess',
    'side.chaturanga.w': 'Ivory', 'side.chaturanga.b': 'Ebony', 'side.chess.w': 'White', 'side.chess.b': 'Black',
    'piece.chaturanga.P': 'Padati', 'piece.chaturanga.N': 'Ashva', 'piece.chaturanga.E': 'Gaja', 'piece.chaturanga.R': 'Ratha', 'piece.chaturanga.M': 'Mantri', 'piece.chaturanga.K': 'Raja',
    'piece.chess.P': 'Pawn', 'piece.chess.N': 'Knight', 'piece.chess.B': 'Bishop', 'piece.chess.R': 'Rook', 'piece.chess.Q': 'Queen', 'piece.chess.K': 'King',
    'meaning.chaturanga.P': 'Foot soldier', 'meaning.chaturanga.N': 'Horse', 'meaning.chaturanga.E': 'War elephant', 'meaning.chaturanga.R': 'Chariot', 'meaning.chaturanga.M': 'Counsellor', 'meaning.chaturanga.K': 'King',
    'level.1': 'Sishya', 'level.2': 'Yodha', 'level.3': 'Senapati',
    'level.hint.1': 'the pupil', 'level.hint.2': 'the warrior', 'level.hint.3': 'the general',
    'worth.exact': 'Worth {n}', 'worth.about': 'Worth about {n}', 'worth.priceless': 'Priceless', 'worth.game': 'The game',
    'kreedu': 'Kreedu', 'home': 'Home', 'close': 'Close',

    // setup
    'setup.title': 'Set Up Your Match', 'setup.sub': 'Everything on one screen — pick, tweak, begin.',
    'setup.game': 'Game', 'setup.era.chaturanga': 'Gupta-era, ~6th c.', 'setup.era.chess': 'Modern game',
    'setup.opponent': 'Opponent', 'setup.ai': 'Kreedu AI', 'setup.pvp': '2 Players',
    'setup.strength': "Kreedu's Strength", 'setup.playAs': 'Play As', 'setup.board': 'Board Style',
    'setup.ashtapada': 'Ashtapada (traditional)', 'setup.checkered': 'Checkered', 'setup.tag.ashtapada': 'Ashtapada', 'setup.tag.checkered': 'Checkered',
    'setup.begin': 'Begin {title} Match', 'setup.preview': '{title} Preview',
    'setup.cap.chaturanga': 'Armies mirror — the Raja faces the Raja down the d-file.',
    'setup.cap.chess': 'Armies rotate — each Queen starts on her own colour.',
    'setup.backHome': 'Back to Home', 'match.title': '{title} Match',

    // match
    'g.reset.pvc': 'You command {side}. {first} always moves first.',
    'g.reset.pvp': '{first} moves first. Tap a piece to see where it can go.',
    'g.reading': 'Kreedu is reading the board…', 'g.undone': 'Move taken back.',
    'g.moved.you': 'You moved {piece} {from} → {to}', 'g.moved.you.take': 'You moved {piece} {from} → {to}, taking {captured}',
    'g.moved.kreedu': 'Kreedu moved {piece} {from} → {to}', 'g.moved.kreedu.take': 'Kreedu moved {piece} {from} → {to}, taking your {captured}',
    'g.moved.side': '{side} moved {piece} {from} → {to}', 'g.moved.side.take': '{side} moved {piece} {from} → {to}, taking {captured}',
    'g.check': '{side} is in check — that must be answered this turn.', 'g.toMove': '{side} to move',
    'g.turn.over': 'Game over', 'g.turn.you': 'Your move', 'g.turn.thinking': 'Kreedu is thinking…', 'g.moveN': 'Move {n}',
    'g.k.over': 'GAME OVER', 'g.k.you': 'YOU WIN', 'g.k.kreedu': 'KREEDU WINS', 'g.k.side': '{side} WINS', 'g.k.draw': 'DRAWN',
    'g.end.mate': 'Checkmate', 'g.end.mate.t': '{opp} is attacked with nowhere to go. {mover} wins.',
    'g.end.staleDraw': 'Stalemate — a draw', 'g.end.staleDraw.t': '{opp} has no legal move but is not in check. Modern chess scores that as a draw.',
    'g.end.staleWin': 'Stalemate — a win', 'g.end.staleWin.t': '{opp} has no legal move but is not in check. Under Shatranj rules that is a victory for {mover}, not a draw.',
    'g.end.material': 'Draw — not enough material', 'g.end.material.t': 'Neither side has the material left to force checkmate.',
    'g.end.fifty': 'Draw — fifty-move rule', 'g.end.fifty.t': 'Fifty moves each without a capture or a pawn move.',
    'g.end.threefold': 'Draw — threefold repetition', 'g.end.threefold.t': 'The same position has appeared three times.',
    'g.end.bothBare': 'Drawn — both Rajas bared', 'g.end.bothBare.t': '{opp} is down to a lone Raja but can strip {mover} bare in reply. The old rule calls that a draw.',
    'g.end.bare': 'Raja bared', 'g.end.bare.t': '{opp} has nothing left but the Raja. {mover} wins.',
    'g.end.resign': 'Resignation', 'g.end.resign.t': '{loser} resigns. {winner} wins.',
    'g.changeSetup': 'Change Setup', 'g.restart': 'Restart', 'g.undo': 'Undo', 'g.flip': 'Flip', 'g.hints': 'Hints', 'g.resign': 'Resign',
    'g.sound': 'Sound', 'g.help': 'Quick reference', 'g.settings': 'Settings',
    'g.captured': '{side} has captured', 'g.nothing': 'Nothing yet',
    'g.pvpTitle': '2-Player Local Match', 'g.pass': 'Pass the device between turns.', 'g.aiOpponent': 'AI Opponent: Kreedu', 'g.search': 'Iterative-Deepening Search',
    'g.diff.EASY': 'Casual pace, one move deep.', 'g.diff.MEDIUM': 'Balanced search with move ordering.', 'g.diff.HARD': 'Deep search — plays for keeps.',
    'g.diffLong.EASY': 'Casual pace, one move deep, with a human-like wobble.', 'g.diffLong.MEDIUM': 'Balanced minimax with transposition table and move ordering.', 'g.diffLong.HARD': 'Deep search with null-move pruning and quiescence — plays for keeps.',
    'g.log': 'Move Log ({n})', 'g.logEmpty': 'Moves will appear here as you play...',
    'g.promote': 'Promote your pawn to:', 'g.again': 'Play Again',
    'g.settingsTitle': 'Game Settings', 'g.moveHints': 'Move Hints', 'g.on': 'On', 'g.off': 'Off', 'g.sfx': 'Sound Effects', 'g.enabled': 'Enabled', 'g.muted': 'Muted',
    'g.settingsNote': 'To change variant, opponent, difficulty or side, use "Change Setup" from the toolbar above.',
    'g.quickRef': 'Quick Reference — {title}', 'g.backToGame': 'Back to Game',
    'chat.chaturanga.0': 'The chariots are the only pieces that reach across this board — mind them.',
    'chat.chaturanga.1': 'Elephants touch only eight squares in the whole game. Odd creatures.',
    'chat.chaturanga.2': 'No queen here. Everything has to be built one square at a time.',
    'chat.chaturanga.3': 'Your Raja can walk into the fight — nothing here punishes it from afar.',
    'chat.chess.0': 'Knights before bishops, usually. Usually.',
    'chat.chess.1': 'A rook on an open file does more work than two minor pieces shuffling.',
    'chat.chess.2': 'If you are ahead on material, trade pieces and keep pawns.',
    'chat.chess.3': 'Every check I give you is a move I am not developing with.',

    // tutorial
    'tut.title': 'Tutorial', 'tut.sub': "Every piece's movement, and the rules that separate the two eras — try both before your first match.",
    'tut.pieces': 'The Pieces', 'tut.rules': 'The Rules', 'tut.normal': 'Normal move', 'tut.capture': 'Capture', 'tut.first': 'First move only',
    'tut.hop': 'Leaps over (no capture)', 'tut.moves': 'Moves:', 'tut.tag': 'Written as {tag} in the move log.', 'tut.play': 'Play {title}',
  },

  hi: {
    'variant.chaturanga': 'चतुरंगम', 'variant.chess': 'शतरंज',
    'side.chaturanga.w': 'हाथीदाँत', 'side.chaturanga.b': 'आबनूस', 'side.chess.w': 'सफ़ेद', 'side.chess.b': 'काला',
    'piece.chaturanga.P': 'पदाति', 'piece.chaturanga.N': 'अश्व', 'piece.chaturanga.E': 'गज', 'piece.chaturanga.R': 'रथ', 'piece.chaturanga.M': 'मंत्री', 'piece.chaturanga.K': 'राजा',
    'piece.chess.P': 'प्यादा', 'piece.chess.N': 'घोड़ा', 'piece.chess.B': 'ऊँट', 'piece.chess.R': 'हाथी', 'piece.chess.Q': 'वज़ीर', 'piece.chess.K': 'राजा',
    'meaning.chaturanga.P': 'पैदल सैनिक', 'meaning.chaturanga.N': 'घोड़ा', 'meaning.chaturanga.E': 'युद्ध-हाथी', 'meaning.chaturanga.R': 'रथ', 'meaning.chaturanga.M': 'मंत्री', 'meaning.chaturanga.K': 'राजा',
    'level.1': 'शिष्य', 'level.2': 'योद्धा', 'level.3': 'सेनापति',
    'level.hint.1': 'नौसिखिया', 'level.hint.2': 'योद्धा', 'level.hint.3': 'सेनापति',
    'worth.exact': 'मूल्य {n}', 'worth.about': 'मूल्य लगभग {n}', 'worth.priceless': 'अनमोल', 'worth.game': 'यही पूरा खेल है',
    'kreedu': 'क्रीडु', 'home': 'होम', 'close': 'बंद करें',
    'setup.title': 'अपना मैच तैयार करें', 'setup.sub': 'सब कुछ एक ही स्क्रीन पर — चुनें, बदलें, शुरू करें।',
    'setup.game': 'खेल', 'setup.era.chaturanga': 'गुप्त काल, ~छठी सदी', 'setup.era.chess': 'आधुनिक खेल',
    'setup.opponent': 'प्रतिद्वंद्वी', 'setup.ai': 'क्रीडु (AI)', 'setup.pvp': 'दो खिलाड़ी',
    'setup.strength': 'क्रीडु की ताकत', 'setup.playAs': 'आपका पक्ष', 'setup.board': 'बिसात का रूप',
    'setup.ashtapada': 'अष्टपद (पारंपरिक)', 'setup.checkered': 'चौखानेदार', 'setup.tag.ashtapada': 'अष्टपद', 'setup.tag.checkered': 'चौखानेदार',
    'setup.begin': 'मैच शुरू करें — {title}', 'setup.preview': 'झलक — {title}',
    'setup.cap.chaturanga': 'दोनों सेनाएँ दर्पण जैसी — d-खाने में राजा के सामने राजा।',
    'setup.cap.chess': 'सेनाएँ घूमी हुई — हर वज़ीर अपने ही रंग के खाने से शुरू करता है।',
    'setup.backHome': 'होम पर लौटें', 'match.title': '{title} मैच',
    'g.reset.pvc': 'आप {side} की ओर से खेल रहे हैं। पहली चाल हमेशा: {first}।',
    'g.reset.pvp': 'पहली चाल: {first}। किसी मोहरे को छूकर देखें कि वह कहाँ जा सकता है।',
    'g.reading': 'क्रीडु बिसात देख रहा है…', 'g.undone': 'चाल वापस ली गई।',
    'g.moved.you': 'आपकी चाल: {piece} {from} → {to}', 'g.moved.you.take': 'आपकी चाल: {piece} {from} → {to} · लिया: {captured}',
    'g.moved.kreedu': 'क्रीडु की चाल: {piece} {from} → {to}', 'g.moved.kreedu.take': 'क्रीडु की चाल: {piece} {from} → {to} · आपका {captured} गया',
    'g.moved.side': '{side} की चाल: {piece} {from} → {to}', 'g.moved.side.take': '{side} की चाल: {piece} {from} → {to} · लिया: {captured}',
    'g.check': 'शह! {side} को इसी चाल में बचाव करना होगा।', 'g.toMove': 'अब चाल: {side}',
    'g.turn.over': 'खेल खत्म', 'g.turn.you': 'आपकी चाल', 'g.turn.thinking': 'क्रीडु सोच रहा है…', 'g.moveN': 'चाल {n}',
    'g.k.over': 'खेल खत्म', 'g.k.you': 'आप जीते!', 'g.k.kreedu': 'क्रीडु जीता', 'g.k.side': 'जीत: {side}', 'g.k.draw': 'बराबरी',
    'g.end.mate': 'शह और मात', 'g.end.mate.t': '{opp} घिर गया, बचने का कोई रास्ता नहीं। जीत: {mover}।',
    'g.end.staleDraw': 'गतिरोध — बराबरी', 'g.end.staleDraw.t': '{opp} के पास कोई वैध चाल नहीं, पर शह भी नहीं। आधुनिक शतरंज में यह बराबरी है।',
    'g.end.staleWin': 'गतिरोध — जीत', 'g.end.staleWin.t': '{opp} के पास कोई वैध चाल नहीं, पर शह भी नहीं। पुराने शतरंज के नियमों में यह बराबरी नहीं, जीत है: {mover}।',
    'g.end.material': 'बराबरी — मोहरे कम', 'g.end.material.t': 'किसी भी पक्ष के पास मात देने लायक मोहरे नहीं बचे।',
    'g.end.fifty': 'बराबरी — पचास चाल नियम', 'g.end.fifty.t': 'दोनों ओर से पचास चालें, बिना कोई मोहरा मारे या प्यादा चलाए।',
    'g.end.threefold': 'बराबरी — तीन बार दोहराव', 'g.end.threefold.t': 'एक ही स्थिति तीन बार आ चुकी है।',
    'g.end.bothBare': 'बराबरी — दोनों राजा अकेले', 'g.end.bothBare.t': '{opp} के पास केवल राजा बचा है, पर वह जवाब में {mover} को भी अकेला कर सकता है। पुराने नियम में यह बराबरी है।',
    'g.end.bare': 'राजा अकेला', 'g.end.bare.t': '{opp} के पास राजा के सिवा कुछ नहीं बचा। जीत: {mover}।',
    'g.end.resign': 'हार स्वीकार', 'g.end.resign.t': '{loser} ने हार मान ली। जीत: {winner}।',
    'g.changeSetup': 'सेटअप बदलें', 'g.restart': 'फिर से शुरू', 'g.undo': 'वापस', 'g.flip': 'पलटें', 'g.hints': 'संकेत', 'g.resign': 'हार मानें',
    'g.sound': 'आवाज़', 'g.help': 'त्वरित संदर्भ', 'g.settings': 'सेटिंग्स',
    'g.captured': '{side}: लिए गए मोहरे', 'g.nothing': 'अभी कुछ नहीं',
    'g.pvpTitle': 'दो खिलाड़ियों का मैच', 'g.pass': 'बारी-बारी से डिवाइस एक-दूसरे को दें।', 'g.aiOpponent': 'प्रतिद्वंद्वी: क्रीडु', 'g.search': 'गहराई से खोज',
    'g.diff.EASY': 'आराम से, बस एक चाल आगे तक सोचता है।', 'g.diff.MEDIUM': 'संतुलित — सोच-समझकर चालें चुनता है।', 'g.diff.HARD': 'गहराई से सोचता है — कोई ढील नहीं।',
    'g.diffLong.EASY': 'आराम से, बस एक चाल आगे तक सोचता है।', 'g.diffLong.MEDIUM': 'संतुलित — सोच-समझकर चालें चुनता है।', 'g.diffLong.HARD': 'गहराई से सोचता है — कोई ढील नहीं।',
    'g.log': 'चालों का ब्योरा ({n})', 'g.logEmpty': 'खेलते समय चालें यहाँ दिखेंगी…',
    'g.promote': 'अपने प्यादे को बनाएँ:', 'g.again': 'फिर खेलें',
    'g.settingsTitle': 'खेल सेटिंग्स', 'g.moveHints': 'चाल संकेत', 'g.on': 'चालू', 'g.off': 'बंद', 'g.sfx': 'ध्वनि प्रभाव', 'g.enabled': 'चालू', 'g.muted': 'बंद',
    'g.settingsNote': 'खेल, प्रतिद्वंद्वी, कठिनाई या पक्ष बदलने के लिए ऊपर "सेटअप बदलें" दबाएँ।',
    'g.quickRef': 'त्वरित संदर्भ — {title}', 'g.backToGame': 'खेल पर लौटें',
    'chat.chaturanga.0': 'इस बिसात पर दूर तक सिर्फ़ रथ पहुँचते हैं — उन पर नज़र रखना।',
    'chat.chaturanga.1': 'पूरे खेल में गज सिर्फ़ आठ खानों तक पहुँचता है। अजीब जीव है।',
    'chat.chaturanga.2': 'यहाँ वज़ीर नहीं है। सब कुछ एक-एक खाना करके बनाना पड़ता है।',
    'chat.chaturanga.3': 'तुम्हारा राजा लड़ाई में उतर सकता है — यहाँ दूर से कोई उसे नहीं मार सकता।',
    'chat.chess.0': 'आमतौर पर ऊँट से पहले घोड़ा। आमतौर पर।',
    'chat.chess.1': 'खुली पंक्ति पर हाथी, दो छोटे मोहरों से ज़्यादा काम करता है।',
    'chat.chess.2': 'अगर मोहरों में आगे हो, तो अदला-बदली करो और प्यादे बचाओ।',
    'chat.chess.3': 'मेरी हर शह एक ऐसी चाल है जिससे मैं अपने मोहरे नहीं निकाल रहा।',
    'tut.title': 'सीखें', 'tut.sub': 'हर मोहरे की चाल, और दोनों युगों के अलग नियम — पहले मैच से पहले दोनों आज़माएँ।',
    'tut.pieces': 'मोहरे', 'tut.rules': 'नियम', 'tut.normal': 'सामान्य चाल', 'tut.capture': 'मारना', 'tut.first': 'केवल पहली चाल में',
    'tut.hop': 'ऊपर से कूदता है (मारता नहीं)', 'tut.moves': 'चाल:', 'tut.tag': 'चालों के ब्योरे में इसे {tag} लिखा जाता है।', 'tut.play': 'खेलें — {title}',
  },

  te: {
    'variant.chaturanga': 'చతురంగం', 'variant.chess': 'చదరంగం',
    'side.chaturanga.w': 'దంతం', 'side.chaturanga.b': 'నల్లచేవ', 'side.chess.w': 'తెలుపు', 'side.chess.b': 'నలుపు',
    'piece.chaturanga.P': 'పదాతి', 'piece.chaturanga.N': 'అశ్వం', 'piece.chaturanga.E': 'గజం', 'piece.chaturanga.R': 'రథం', 'piece.chaturanga.M': 'మంత్రి', 'piece.chaturanga.K': 'రాజు',
    'piece.chess.P': 'బంటు', 'piece.chess.N': 'గుర్రం', 'piece.chess.B': 'శకటు', 'piece.chess.R': 'ఏనుగు', 'piece.chess.Q': 'మంత్రి', 'piece.chess.K': 'రాజు',
    'meaning.chaturanga.P': 'కాల్బల సైనికుడు', 'meaning.chaturanga.N': 'గుర్రం', 'meaning.chaturanga.E': 'యుద్ధ ఏనుగు', 'meaning.chaturanga.R': 'రథం', 'meaning.chaturanga.M': 'మంత్రి', 'meaning.chaturanga.K': 'రాజు',
    'level.1': 'శిష్య', 'level.2': 'యోధ', 'level.3': 'సేనాపతి',
    'level.hint.1': 'అభ్యాసి', 'level.hint.2': 'యోధుడు', 'level.hint.3': 'సేనాపతి',
    'worth.exact': 'విలువ {n}', 'worth.about': 'విలువ సుమారు {n}', 'worth.priceless': 'అమూల్యం', 'worth.game': 'ఆటంతా ఇదే',
    'kreedu': 'క్రీడు', 'home': 'హోమ్', 'close': 'మూసివేయి',
    'setup.title': 'మీ ఆటను సిద్ధం చేసుకోండి', 'setup.sub': 'అన్నీ ఒకే తెరపై — ఎంచుకోండి, మార్చండి, మొదలుపెట్టండి.',
    'setup.game': 'ఆట', 'setup.era.chaturanga': 'గుప్తుల కాలం, ~6వ శతాబ్దం', 'setup.era.chess': 'ఆధునిక ఆట',
    'setup.opponent': 'ప్రత్యర్థి', 'setup.ai': 'క్రీడు (AI)', 'setup.pvp': 'ఇద్దరు ఆటగాళ్లు',
    'setup.strength': 'క్రీడు బలం', 'setup.playAs': 'మీ పక్షం', 'setup.board': 'బోర్డు రూపం',
    'setup.ashtapada': 'అష్టపద (సాంప్రదాయ)', 'setup.checkered': 'గళ్ళ బోర్డు', 'setup.tag.ashtapada': 'అష్టపద', 'setup.tag.checkered': 'గళ్ళ బోర్డు',
    'setup.begin': 'ఆట మొదలుపెట్టండి — {title}', 'setup.preview': 'ముందుచూపు — {title}',
    'setup.cap.chaturanga': 'సైన్యాలు అద్దంలా — d-వరుసలో రాజుకు ఎదురుగా రాజు.',
    'setup.cap.chess': 'సైన్యాలు తిరిగినట్టు — ప్రతి మంత్రి తన రంగు గడిలోనే మొదలవుతుంది.',
    'setup.backHome': 'హోమ్‌కు తిరిగి', 'match.title': '{title} ఆట',
    'g.reset.pvc': 'మీరు {side} పక్షం. మొదటి ఎత్తు ఎప్పుడూ: {first}.',
    'g.reset.pvp': 'మొదటి ఎత్తు: {first}. ఏదైనా పావును నొక్కి అది ఎక్కడికి వెళ్లగలదో చూడండి.',
    'g.reading': 'క్రీడు బోర్డును పరిశీలిస్తున్నాడు…', 'g.undone': 'ఎత్తు వెనక్కి తీసుకున్నారు.',
    'g.moved.you': 'మీ ఎత్తు: {piece} {from} → {to}', 'g.moved.you.take': 'మీ ఎత్తు: {piece} {from} → {to} · పట్టుకున్నది: {captured}',
    'g.moved.kreedu': 'క్రీడు ఎత్తు: {piece} {from} → {to}', 'g.moved.kreedu.take': 'క్రీడు ఎత్తు: {piece} {from} → {to} · మీ {captured} పోయింది',
    'g.moved.side': '{side} ఎత్తు: {piece} {from} → {to}', 'g.moved.side.take': '{side} ఎత్తు: {piece} {from} → {to} · పట్టుకున్నది: {captured}',
    'g.check': 'చెక్! {side} ఈ వంతులోనే తప్పించుకోవాలి.', 'g.toMove': 'ఇప్పుడు వంతు: {side}',
    'g.turn.over': 'ఆట ముగిసింది', 'g.turn.you': 'మీ వంతు', 'g.turn.thinking': 'క్రీడు ఆలోచిస్తున్నాడు…', 'g.moveN': 'ఎత్తు {n}',
    'g.k.over': 'ఆట ముగిసింది', 'g.k.you': 'మీరు గెలిచారు!', 'g.k.kreedu': 'క్రీడు గెలిచాడు', 'g.k.side': 'గెలుపు: {side}', 'g.k.draw': 'డ్రా',
    'g.end.mate': 'చెక్‌మేట్', 'g.end.mate.t': '{opp} — తప్పించుకునే దారి లేదు. గెలుపు: {mover}.',
    'g.end.staleDraw': 'స్టేల్‌మేట్ — డ్రా', 'g.end.staleDraw.t': '{opp} — చెల్లే ఎత్తు లేదు, కానీ చెక్ కూడా లేదు. ఆధునిక చదరంగంలో ఇది డ్రా.',
    'g.end.staleWin': 'స్టేల్‌మేట్ — గెలుపు', 'g.end.staleWin.t': '{opp} — చెల్లే ఎత్తు లేదు, చెక్ కూడా లేదు. పాత షత్రంజ్ నియమాల ప్రకారం ఇది డ్రా కాదు, గెలుపు: {mover}.',
    'g.end.material': 'డ్రా — పావులు చాలవు', 'g.end.material.t': 'ఏ పక్షానికీ చెక్‌మేట్ చేయడానికి సరిపడా పావులు లేవు.',
    'g.end.fifty': 'డ్రా — యాభై ఎత్తుల నియమం', 'g.end.fifty.t': 'ఇరువైపులా యాభై ఎత్తులు — ఏ పావూ పట్టలేదు, బంటూ కదలలేదు.',
    'g.end.threefold': 'డ్రా — మూడుసార్లు పునరావృతం', 'g.end.threefold.t': 'ఒకే స్థితి మూడుసార్లు వచ్చింది.',
    'g.end.bothBare': 'డ్రా — ఇద్దరు రాజులూ ఒంటరి', 'g.end.bothBare.t': '{opp} — రాజు మాత్రమే మిగిలాడు, కానీ బదులుగా {mover} పావులన్నీ తీసేయగలదు. పాత నియమం ప్రకారం ఇది డ్రా.',
    'g.end.bare': 'రాజు ఒంటరి', 'g.end.bare.t': '{opp} — రాజు తప్ప ఏమీ మిగలలేదు. గెలుపు: {mover}.',
    'g.end.resign': 'ఓటమి అంగీకారం', 'g.end.resign.t': '{loser} ఓటమి అంగీకరించింది. గెలుపు: {winner}.',
    'g.changeSetup': 'అమరిక మార్చు', 'g.restart': 'మళ్ళీ మొదలు', 'g.undo': 'వెనక్కి', 'g.flip': 'తిప్పు', 'g.hints': 'సూచనలు', 'g.resign': 'ఓటమి ఒప్పుకో',
    'g.sound': 'శబ్దం', 'g.help': 'త్వరిత సూచిక', 'g.settings': 'అమరికలు',
    'g.captured': '{side}: పట్టిన పావులు', 'g.nothing': 'ఇంకా ఏమీ లేదు',
    'g.pvpTitle': 'ఇద్దరు ఆటగాళ్ల ఆట', 'g.pass': 'వంతుల మధ్య పరికరాన్ని మార్చుకోండి.', 'g.aiOpponent': 'ప్రత్యర్థి: క్రీడు', 'g.search': 'లోతైన శోధన',
    'g.diff.EASY': 'నెమ్మదిగా, ఒక్క ఎత్తు ముందు వరకే ఆలోచిస్తాడు.', 'g.diff.MEDIUM': 'సమతుల్యంగా — ఆలోచించి ఎత్తులు ఎంచుకుంటాడు.', 'g.diff.HARD': 'లోతుగా ఆలోచిస్తాడు — ఏమాత్రం వదలడు.',
    'g.diffLong.EASY': 'నెమ్మదిగా, ఒక్క ఎత్తు ముందు వరకే ఆలోచిస్తాడు.', 'g.diffLong.MEDIUM': 'సమతుల్యంగా — ఆలోచించి ఎత్తులు ఎంచుకుంటాడు.', 'g.diffLong.HARD': 'లోతుగా ఆలోచిస్తాడు — ఏమాత్రం వదలడు.',
    'g.log': 'ఎత్తుల జాబితా ({n})', 'g.logEmpty': 'ఆడుతుండగా ఎత్తులు ఇక్కడ కనిపిస్తాయి…',
    'g.promote': 'మీ బంటును ఇలా మార్చండి:', 'g.again': 'మళ్ళీ ఆడండి',
    'g.settingsTitle': 'ఆట అమరికలు', 'g.moveHints': 'ఎత్తు సూచనలు', 'g.on': 'ఆన్', 'g.off': 'ఆఫ్', 'g.sfx': 'శబ్దాలు', 'g.enabled': 'ఆన్', 'g.muted': 'మ్యూట్',
    'g.settingsNote': 'ఆట, ప్రత్యర్థి, కష్టత లేదా పక్షం మార్చడానికి పైన "అమరిక మార్చు" నొక్కండి.',
    'g.quickRef': 'త్వరిత సూచిక — {title}', 'g.backToGame': 'ఆటకు తిరిగి',
    'chat.chaturanga.0': 'ఈ బోర్డు మీద దూరం వెళ్లగలిగేవి రథాలు మాత్రమే — వాటిని గమనించండి.',
    'chat.chaturanga.1': 'ఆట మొత్తంలో గజం ఎనిమిది గడులకే చేరగలదు. వింత జీవి.',
    'chat.chaturanga.2': 'ఇక్కడ రాణి లేదు. అన్నీ ఒక్కో గడి చొప్పున కట్టుకోవాలి.',
    'chat.chaturanga.3': 'మీ రాజు యుద్ధంలోకి దిగవచ్చు — ఇక్కడ దూరం నుంచి ఎవరూ దెబ్బ కొట్టలేరు.',
    'chat.chess.0': 'సాధారణంగా శకటు కంటే ముందు గుర్రం. సాధారణంగా.',
    'chat.chess.1': 'ఖాళీ వరుసలో ఉన్న ఏనుగు, రెండు చిన్న పావుల కంటే ఎక్కువ పని చేస్తుంది.',
    'chat.chess.2': 'పావుల్లో ముందుంటే, మార్పిడి చేసి బంటులను కాపాడుకోండి.',
    'chat.chess.3': 'నేను ఇచ్చే ప్రతి చెక్, నా పావులను అభివృద్ధి చేయని ఒక ఎత్తు.',
    'tut.title': 'నేర్చుకోండి', 'tut.sub': 'ప్రతి పావు కదలిక, రెండు యుగాలను వేరు చేసే నియమాలు — మొదటి ఆటకు ముందు రెండూ ప్రయత్నించండి.',
    'tut.pieces': 'పావులు', 'tut.rules': 'నియమాలు', 'tut.normal': 'సాధారణ ఎత్తు', 'tut.capture': 'పట్టడం', 'tut.first': 'మొదటి ఎత్తులో మాత్రమే',
    'tut.hop': 'పైనుంచి దూకుతుంది (పట్టదు)', 'tut.moves': 'కదలిక:', 'tut.tag': 'ఎత్తుల జాబితాలో {tag} అని రాస్తారు.', 'tut.play': 'ఆడండి — {title}',
  },

  ta: {
    'variant.chaturanga': 'சதுரங்கம்', 'variant.chess': 'செஸ்',
    'side.chaturanga.w': 'தந்தம்', 'side.chaturanga.b': 'கருங்காலி', 'side.chess.w': 'வெள்ளை', 'side.chess.b': 'கருப்பு',
    'piece.chaturanga.P': 'பதாதி', 'piece.chaturanga.N': 'அஸ்வம்', 'piece.chaturanga.E': 'கஜம்', 'piece.chaturanga.R': 'ரதம்', 'piece.chaturanga.M': 'மந்திரி', 'piece.chaturanga.K': 'ராஜா',
    'piece.chess.P': 'சிப்பாய்', 'piece.chess.N': 'குதிரை', 'piece.chess.B': 'மந்திரி', 'piece.chess.R': 'யானை', 'piece.chess.Q': 'ராணி', 'piece.chess.K': 'ராஜா',
    'meaning.chaturanga.P': 'காலாட்படை வீரன்', 'meaning.chaturanga.N': 'குதிரை', 'meaning.chaturanga.E': 'போர் யானை', 'meaning.chaturanga.R': 'தேர்', 'meaning.chaturanga.M': 'அமைச்சர்', 'meaning.chaturanga.K': 'அரசன்',
    'level.1': 'சிஷ்யன்', 'level.2': 'யோதா', 'level.3': 'சேனாபதி',
    'level.hint.1': 'கற்றுக்குட்டி', 'level.hint.2': 'போர்வீரன்', 'level.hint.3': 'படைத்தலைவர்',
    'worth.exact': 'மதிப்பு {n}', 'worth.about': 'மதிப்பு சுமார் {n}', 'worth.priceless': 'விலைமதிப்பற்றது', 'worth.game': 'இதுவே ஆட்டம்',
    'kreedu': 'க்ரீடு', 'home': 'முகப்பு', 'close': 'மூடு',
    'setup.title': 'உங்கள் ஆட்டத்தை அமையுங்கள்', 'setup.sub': 'எல்லாம் ஒரே திரையில் — தேர்ந்தெடு, மாற்று, தொடங்கு.',
    'setup.game': 'ஆட்டம்', 'setup.era.chaturanga': 'குப்தர் காலம், ~6ஆம் நூற்றாண்டு', 'setup.era.chess': 'நவீன ஆட்டம்',
    'setup.opponent': 'எதிராளி', 'setup.ai': 'க்ரீடு (AI)', 'setup.pvp': 'இருவர்',
    'setup.strength': 'க்ரீடுவின் திறன்', 'setup.playAs': 'உங்கள் பக்கம்', 'setup.board': 'பலகை வடிவம்',
    'setup.ashtapada': 'அஷ்டபதம் (பாரம்பரியம்)', 'setup.checkered': 'கட்டம் போட்டது', 'setup.tag.ashtapada': 'அஷ்டபதம்', 'setup.tag.checkered': 'கட்டம் போட்டது',
    'setup.begin': 'ஆட்டத்தைத் தொடங்கு — {title}', 'setup.preview': 'முன்னோட்டம் — {title}',
    'setup.cap.chaturanga': 'படைகள் கண்ணாடிப் பிம்பம் போல — d-வரிசையில் ராஜாவுக்கு எதிரே ராஜா.',
    'setup.cap.chess': 'படைகள் சுழன்றபடி — ஒவ்வொரு ராணியும் தன் நிறக் கட்டத்திலேயே தொடங்கும்.',
    'setup.backHome': 'முகப்புக்குத் திரும்பு', 'match.title': '{title} ஆட்டம்',
    'g.reset.pvc': 'நீங்கள் {side} பக்கம். முதல் நகர்வு எப்போதும்: {first}.',
    'g.reset.pvp': 'முதல் நகர்வு: {first}. ஒரு காயைத் தொட்டு அது எங்கே செல்லலாம் என்று பாருங்கள்.',
    'g.reading': 'க்ரீடு பலகையைக் கவனிக்கிறார்…', 'g.undone': 'நகர்வு திரும்பப் பெறப்பட்டது.',
    'g.moved.you': 'உங்கள் நகர்வு: {piece} {from} → {to}', 'g.moved.you.take': 'உங்கள் நகர்வு: {piece} {from} → {to} · வெட்டியது: {captured}',
    'g.moved.kreedu': 'க்ரீடுவின் நகர்வு: {piece} {from} → {to}', 'g.moved.kreedu.take': 'க்ரீடுவின் நகர்வு: {piece} {from} → {to} · உங்கள் {captured} வெட்டப்பட்டது',
    'g.moved.side': '{side} நகர்வு: {piece} {from} → {to}', 'g.moved.side.take': '{side} நகர்வு: {piece} {from} → {to} · வெட்டியது: {captured}',
    'g.check': 'செக்! {side} இந்த முறையிலேயே தப்பிக்க வேண்டும்.', 'g.toMove': 'இப்போது முறை: {side}',
    'g.turn.over': 'ஆட்டம் முடிந்தது', 'g.turn.you': 'உங்கள் முறை', 'g.turn.thinking': 'க்ரீடு யோசிக்கிறார்…', 'g.moveN': 'நகர்வு {n}',
    'g.k.over': 'ஆட்டம் முடிந்தது', 'g.k.you': 'நீங்கள் வென்றீர்கள்!', 'g.k.kreedu': 'க்ரீடு வென்றார்', 'g.k.side': 'வெற்றி: {side}', 'g.k.draw': 'சமநிலை',
    'g.end.mate': 'செக்மேட்', 'g.end.mate.t': '{opp} — தப்பிக்க வழியில்லை. வெற்றி: {mover}.',
    'g.end.staleDraw': 'ஸ்டேல்மேட் — சமநிலை', 'g.end.staleDraw.t': '{opp} — சரியான நகர்வு இல்லை, ஆனால் செக்கும் இல்லை. நவீன செஸ்ஸில் இது சமநிலை.',
    'g.end.staleWin': 'ஸ்டேல்மேட் — வெற்றி', 'g.end.staleWin.t': '{opp} — சரியான நகர்வு இல்லை, செக்கும் இல்லை. பழைய ஷத்ரஞ்ச் விதிப்படி இது சமநிலை அல்ல, வெற்றி: {mover}.',
    'g.end.material': 'சமநிலை — காய்கள் போதாது', 'g.end.material.t': 'எந்தப் பக்கத்திடமும் செக்மேட் செய்யும் அளவு காய்கள் இல்லை.',
    'g.end.fifty': 'சமநிலை — ஐம்பது நகர்வு விதி', 'g.end.fifty.t': 'இருபுறமும் ஐம்பது நகர்வுகள் — வெட்டும் இல்லை, சிப்பாய் நகர்வும் இல்லை.',
    'g.end.threefold': 'சமநிலை — மும்முறை மீள்நிகழ்வு', 'g.end.threefold.t': 'ஒரே நிலை மூன்று முறை வந்துவிட்டது.',
    'g.end.bothBare': 'சமநிலை — இரு ராஜாக்களும் தனிமையில்', 'g.end.bothBare.t': '{opp} — ராஜா மட்டுமே மிஞ்சியுள்ளார், ஆனால் பதிலுக்கு {mover} காய்களையும் முழுதாக வெட்ட முடியும். பழைய விதிப்படி இது சமநிலை.',
    'g.end.bare': 'ராஜா தனிமையில்', 'g.end.bare.t': '{opp} — ராஜாவைத் தவிர எதுவும் மிஞ்சவில்லை. வெற்றி: {mover}.',
    'g.end.resign': 'தோல்வி ஒப்புதல்', 'g.end.resign.t': '{loser} தோல்வியை ஒப்புக்கொண்டது. வெற்றி: {winner}.',
    'g.changeSetup': 'அமைப்பை மாற்று', 'g.restart': 'மீண்டும் தொடங்கு', 'g.undo': 'பின்வாங்கு', 'g.flip': 'திருப்பு', 'g.hints': 'குறிப்புகள்', 'g.resign': 'தோல்வியை ஒப்புக்கொள்',
    'g.sound': 'ஒலி', 'g.help': 'விரைவுக் குறிப்பு', 'g.settings': 'அமைப்புகள்',
    'g.captured': '{side}: வெட்டிய காய்கள்', 'g.nothing': 'இன்னும் எதுவும் இல்லை',
    'g.pvpTitle': 'இருவர் ஆட்டம்', 'g.pass': 'ஒவ்வொரு முறையும் சாதனத்தை மாற்றிக் கொடுங்கள்.', 'g.aiOpponent': 'எதிராளி: க்ரீடு', 'g.search': 'ஆழமான தேடல்',
    'g.diff.EASY': 'நிதானமாக, ஒரு நகர்வு முன்வரை மட்டும் யோசிப்பார்.', 'g.diff.MEDIUM': 'சமநிலையாக — யோசித்து நகர்வுகளைத் தேர்ந்தெடுப்பார்.', 'g.diff.HARD': 'ஆழமாக யோசிப்பார் — எதையும் விட்டுத்தரமாட்டார்.',
    'g.diffLong.EASY': 'நிதானமாக, ஒரு நகர்வு முன்வரை மட்டும் யோசிப்பார்.', 'g.diffLong.MEDIUM': 'சமநிலையாக — யோசித்து நகர்வுகளைத் தேர்ந்தெடுப்பார்.', 'g.diffLong.HARD': 'ஆழமாக யோசிப்பார் — எதையும் விட்டுத்தரமாட்டார்.',
    'g.log': 'நகர்வுப் பதிவு ({n})', 'g.logEmpty': 'விளையாடும்போது நகர்வுகள் இங்கே தோன்றும்…',
    'g.promote': 'உங்கள் சிப்பாயை இதாக மாற்றுங்கள்:', 'g.again': 'மீண்டும் விளையாடு',
    'g.settingsTitle': 'ஆட்ட அமைப்புகள்', 'g.moveHints': 'நகர்வுக் குறிப்புகள்', 'g.on': 'ஆன்', 'g.off': 'ஆஃப்', 'g.sfx': 'ஒலிகள்', 'g.enabled': 'ஆன்', 'g.muted': 'அமைதி',
    'g.settingsNote': 'ஆட்டம், எதிராளி, கடினம் அல்லது பக்கத்தை மாற்ற மேலே உள்ள "அமைப்பை மாற்று" அழுத்துங்கள்.',
    'g.quickRef': 'விரைவுக் குறிப்பு — {title}', 'g.backToGame': 'ஆட்டத்துக்குத் திரும்பு',
    'chat.chaturanga.0': 'இந்தப் பலகையில் தூரம் செல்லக்கூடியவை தேர்கள் மட்டுமே — அவற்றைக் கவனியுங்கள்.',
    'chat.chaturanga.1': 'முழு ஆட்டத்திலும் கஜம் எட்டுக் கட்டங்களை மட்டுமே தொடும். விசித்திரமான உயிர்.',
    'chat.chaturanga.2': 'இங்கே ராணி இல்லை. எல்லாவற்றையும் ஒவ்வொரு கட்டமாகக் கட்ட வேண்டும்.',
    'chat.chaturanga.3': 'உங்கள் ராஜா போரில் இறங்கலாம் — இங்கே தூரத்திலிருந்து யாரும் தாக்க முடியாது.',
    'chat.chess.0': 'பொதுவாக மந்திரிக்கு முன் குதிரை. பொதுவாக.',
    'chat.chess.1': 'திறந்த வரிசையில் உள்ள யானை, இரண்டு சிறு காய்களை விட அதிக வேலை செய்யும்.',
    'chat.chess.2': 'காய்களில் முன்னிலையில் இருந்தால், பரிமாற்றம் செய்து சிப்பாய்களைக் காப்பாற்றுங்கள்.',
    'chat.chess.3': 'நான் கொடுக்கும் ஒவ்வொரு செக்கும், என் காய்களை வளர்க்காத ஒரு நகர்வு.',
    'tut.title': 'கற்றுக்கொள்', 'tut.sub': 'ஒவ்வொரு காயின் நகர்வும், இரு காலங்களைப் பிரிக்கும் விதிகளும் — முதல் ஆட்டத்துக்கு முன் இரண்டையும் முயலுங்கள்.',
    'tut.pieces': 'காய்கள்', 'tut.rules': 'விதிகள்', 'tut.normal': 'சாதாரண நகர்வு', 'tut.capture': 'வெட்டு', 'tut.first': 'முதல் நகர்வில் மட்டும்',
    'tut.hop': 'மேலே தாண்டும் (வெட்டாது)', 'tut.moves': 'நகர்வு:', 'tut.tag': 'நகர்வுப் பதிவில் {tag} என எழுதப்படும்.', 'tut.play': 'விளையாடு — {title}',
  },

  ml: {
    'variant.chaturanga': 'ചതുരംഗം', 'variant.chess': 'ചെസ്സ്',
    'side.chaturanga.w': 'ആനക്കൊമ്പ്', 'side.chaturanga.b': 'കരിങ്ങാലി', 'side.chess.w': 'വെള്ള', 'side.chess.b': 'കറുപ്പ്',
    'piece.chaturanga.P': 'പദാതി', 'piece.chaturanga.N': 'അശ്വം', 'piece.chaturanga.E': 'ഗജം', 'piece.chaturanga.R': 'രഥം', 'piece.chaturanga.M': 'മന്ത്രി', 'piece.chaturanga.K': 'രാജാവ്',
    'piece.chess.P': 'കാലാൾ', 'piece.chess.N': 'കുതിര', 'piece.chess.B': 'ആന', 'piece.chess.R': 'തേര്', 'piece.chess.Q': 'മന്ത്രി', 'piece.chess.K': 'രാജാവ്',
    'meaning.chaturanga.P': 'കാലാൾ', 'meaning.chaturanga.N': 'കുതിര', 'meaning.chaturanga.E': 'യുദ്ധ ആന', 'meaning.chaturanga.R': 'തേര്', 'meaning.chaturanga.M': 'മന്ത്രി', 'meaning.chaturanga.K': 'രാജാവ്',
    'level.1': 'ശിഷ്യൻ', 'level.2': 'യോദ്ധാവ്', 'level.3': 'സേനാപതി',
    'level.hint.1': 'തുടക്കക്കാരൻ', 'level.hint.2': 'യോദ്ധാവ്', 'level.hint.3': 'സേനാപതി',
    'worth.exact': 'മൂല്യം {n}', 'worth.about': 'മൂല്യം ഏകദേശം {n}', 'worth.priceless': 'അമൂല്യം', 'worth.game': 'കളി തന്നെ ഇത്',
    'kreedu': 'ക്രീഡു', 'home': 'ഹോം', 'close': 'അടയ്ക്കുക',
    'setup.title': 'നിങ്ങളുടെ കളി സജ്ജമാക്കൂ', 'setup.sub': 'എല്ലാം ഒരൊറ്റ സ്ക്രീനിൽ — തിരഞ്ഞെടുക്കൂ, മാറ്റൂ, തുടങ്ങൂ.',
    'setup.game': 'കളി', 'setup.era.chaturanga': 'ഗുപ്തകാലം, ~ആറാം നൂറ്റാണ്ട്', 'setup.era.chess': 'ആധുനിക കളി',
    'setup.opponent': 'എതിരാളി', 'setup.ai': 'ക്രീഡു (AI)', 'setup.pvp': 'രണ്ടുപേർ',
    'setup.strength': 'ക്രീഡുവിന്റെ കരുത്ത്', 'setup.playAs': 'നിങ്ങളുടെ പക്ഷം', 'setup.board': 'കളത്തിന്റെ രൂപം',
    'setup.ashtapada': 'അഷ്ടപദം (പരമ്പരാഗതം)', 'setup.checkered': 'ചതുരക്കള്ളി', 'setup.tag.ashtapada': 'അഷ്ടപദം', 'setup.tag.checkered': 'ചതുരക്കള്ളി',
    'setup.begin': 'കളി തുടങ്ങൂ — {title}', 'setup.preview': 'മുൻകാഴ്ച — {title}',
    'setup.cap.chaturanga': 'സേനകൾ കണ്ണാടിപോലെ — d-നിരയിൽ രാജാവിന് നേരെ രാജാവ്.',
    'setup.cap.chess': 'സേനകൾ തിരിഞ്ഞ നിലയിൽ — ഓരോ മന്ത്രിയും സ്വന്തം നിറമുള്ള കളത്തിൽ തുടങ്ങും.',
    'setup.backHome': 'ഹോമിലേക്ക് മടങ്ങുക', 'match.title': '{title} കളി',
    'g.reset.pvc': 'നിങ്ങൾ {side} പക്ഷത്താണ്. ആദ്യ നീക്കം എപ്പോഴും: {first}.',
    'g.reset.pvp': 'ആദ്യ നീക്കം: {first}. ഒരു കരു തൊട്ട് അത് എങ്ങോട്ട് പോകാമെന്ന് കാണൂ.',
    'g.reading': 'ക്രീഡു കളം നോക്കുന്നു…', 'g.undone': 'നീക്കം പിൻവലിച്ചു.',
    'g.moved.you': 'നിങ്ങളുടെ നീക്കം: {piece} {from} → {to}', 'g.moved.you.take': 'നിങ്ങളുടെ നീക്കം: {piece} {from} → {to} · വെട്ടിയത്: {captured}',
    'g.moved.kreedu': 'ക്രീഡുവിന്റെ നീക്കം: {piece} {from} → {to}', 'g.moved.kreedu.take': 'ക്രീഡുവിന്റെ നീക്കം: {piece} {from} → {to} · നിങ്ങളുടെ {captured} പോയി',
    'g.moved.side': '{side} നീക്കം: {piece} {from} → {to}', 'g.moved.side.take': '{side} നീക്കം: {piece} {from} → {to} · വെട്ടിയത്: {captured}',
    'g.check': 'ചെക്ക്! {side} ഈ നീക്കത്തിൽത്തന്നെ രക്ഷപ്പെടണം.', 'g.toMove': 'ഇപ്പോൾ ഊഴം: {side}',
    'g.turn.over': 'കളി കഴിഞ്ഞു', 'g.turn.you': 'നിങ്ങളുടെ ഊഴം', 'g.turn.thinking': 'ക്രീഡു ആലോചിക്കുന്നു…', 'g.moveN': 'നീക്കം {n}',
    'g.k.over': 'കളി കഴിഞ്ഞു', 'g.k.you': 'നിങ്ങൾ ജയിച്ചു!', 'g.k.kreedu': 'ക്രീഡു ജയിച്ചു', 'g.k.side': 'വിജയം: {side}', 'g.k.draw': 'സമനില',
    'g.end.mate': 'ചെക്ക്മേറ്റ്', 'g.end.mate.t': '{opp} — രക്ഷപ്പെടാൻ വഴിയില്ല. വിജയം: {mover}.',
    'g.end.staleDraw': 'സ്റ്റെയ്ൽമേറ്റ് — സമനില', 'g.end.staleDraw.t': '{opp} — സാധുവായ നീക്കമില്ല, പക്ഷേ ചെക്കുമില്ല. ആധുനിക ചെസ്സിൽ ഇത് സമനില.',
    'g.end.staleWin': 'സ്റ്റെയ്ൽമേറ്റ് — വിജയം', 'g.end.staleWin.t': '{opp} — സാധുവായ നീക്കമില്ല, ചെക്കുമില്ല. പഴയ ഷത്രഞ്ച് നിയമപ്രകാരം ഇത് സമനിലയല്ല, വിജയം: {mover}.',
    'g.end.material': 'സമനില — കരുക്കൾ പോരാ', 'g.end.material.t': 'ഒരു പക്ഷത്തിനും ചെക്ക്മേറ്റ് ചെയ്യാനുള്ള കരുക്കൾ ബാക്കിയില്ല.',
    'g.end.fifty': 'സമനില — അൻപത് നീക്ക നിയമം', 'g.end.fifty.t': 'ഇരുവശത്തും അൻപത് നീക്കങ്ങൾ — വെട്ടലോ കാലാൾ നീക്കമോ ഇല്ല.',
    'g.end.threefold': 'സമനില — മൂന്നുതവണ ആവർത്തനം', 'g.end.threefold.t': 'ഒരേ നില മൂന്നു തവണ വന്നു.',
    'g.end.bothBare': 'സമനില — രണ്ട് രാജാക്കന്മാരും ഒറ്റയ്ക്ക്', 'g.end.bothBare.t': '{opp} — രാജാവ് മാത്രം ബാക്കി, പക്ഷേ മറുപടിയായി {mover} പക്ഷത്തെയും ഒറ്റയ്ക്കാക്കാം. പഴയ നിയമപ്രകാരം ഇത് സമനില.',
    'g.end.bare': 'രാജാവ് ഒറ്റയ്ക്ക്', 'g.end.bare.t': '{opp} — രാജാവല്ലാതെ ഒന്നും ബാക്കിയില്ല. വിജയം: {mover}.',
    'g.end.resign': 'തോൽവി സമ്മതിച്ചു', 'g.end.resign.t': '{loser} തോൽവി സമ്മതിച്ചു. വിജയം: {winner}.',
    'g.changeSetup': 'ക്രമീകരണം മാറ്റുക', 'g.restart': 'പുനരാരംഭിക്കുക', 'g.undo': 'പിൻവലിക്കുക', 'g.flip': 'തിരിക്കുക', 'g.hints': 'സൂചനകൾ', 'g.resign': 'തോൽവി സമ്മതിക്കുക',
    'g.sound': 'ശബ്ദം', 'g.help': 'ചുരുക്കവിവരം', 'g.settings': 'ക്രമീകരണങ്ങൾ',
    'g.captured': '{side}: വെട്ടിയ കരുക്കൾ', 'g.nothing': 'ഇതുവരെ ഒന്നുമില്ല',
    'g.pvpTitle': 'രണ്ടുപേരുടെ കളി', 'g.pass': 'ഓരോ ഊഴത്തിലും ഉപകരണം കൈമാറുക.', 'g.aiOpponent': 'എതിരാളി: ക്രീഡു', 'g.search': 'ആഴത്തിലുള്ള തിരച്ചിൽ',
    'g.diff.EASY': 'പതുക്കെ, ഒരു നീക്കം മുന്നോട്ട് മാത്രം ചിന്തിക്കും.', 'g.diff.MEDIUM': 'സന്തുലിതം — ആലോചിച്ച് നീക്കങ്ങൾ തിരഞ്ഞെടുക്കും.', 'g.diff.HARD': 'ആഴത്തിൽ ചിന്തിക്കും — ഒട്ടും വിട്ടുകൊടുക്കില്ല.',
    'g.diffLong.EASY': 'പതുക്കെ, ഒരു നീക്കം മുന്നോട്ട് മാത്രം ചിന്തിക്കും.', 'g.diffLong.MEDIUM': 'സന്തുലിതം — ആലോചിച്ച് നീക്കങ്ങൾ തിരഞ്ഞെടുക്കും.', 'g.diffLong.HARD': 'ആഴത്തിൽ ചിന്തിക്കും — ഒട്ടും വിട്ടുകൊടുക്കില്ല.',
    'g.log': 'നീക്കങ്ങളുടെ രേഖ ({n})', 'g.logEmpty': 'കളിക്കുമ്പോൾ നീക്കങ്ങൾ ഇവിടെ കാണാം…',
    'g.promote': 'നിങ്ങളുടെ കാലാളിനെ ഇതാക്കുക:', 'g.again': 'വീണ്ടും കളിക്കൂ',
    'g.settingsTitle': 'കളി ക്രമീകരണങ്ങൾ', 'g.moveHints': 'നീക്ക സൂചനകൾ', 'g.on': 'ഓൺ', 'g.off': 'ഓഫ്', 'g.sfx': 'ശബ്ദങ്ങൾ', 'g.enabled': 'ഓൺ', 'g.muted': 'നിശ്ശബ്ദം',
    'g.settingsNote': 'കളി, എതിരാളി, കാഠിന്യം അല്ലെങ്കിൽ പക്ഷം മാറ്റാൻ മുകളിലെ "ക്രമീകരണം മാറ്റുക" അമർത്തുക.',
    'g.quickRef': 'ചുരുക്കവിവരം — {title}', 'g.backToGame': 'കളിയിലേക്ക് മടങ്ങുക',
    'chat.chaturanga.0': 'ഈ കളത്തിൽ ദൂരേക്ക് എത്തുന്നത് രഥങ്ങൾ മാത്രം — അവയെ ശ്രദ്ധിക്കൂ.',
    'chat.chaturanga.1': 'കളിയിലുടനീളം ഗജം എട്ട് കളങ്ങളിൽ മാത്രമേ എത്തൂ. വിചിത്ര ജീവി.',
    'chat.chaturanga.2': 'ഇവിടെ റാണിയില്ല. എല്ലാം ഓരോ കളമായി പണിതെടുക്കണം.',
    'chat.chaturanga.3': 'നിങ്ങളുടെ രാജാവിന് യുദ്ധത്തിലിറങ്ങാം — ഇവിടെ ദൂരെനിന്ന് ആരും ആക്രമിക്കില്ല.',
    'chat.chess.0': 'സാധാരണ ആനയ്ക്ക് മുമ്പ് കുതിര. സാധാരണ.',
    'chat.chess.1': 'തുറന്ന നിരയിലെ തേര്, രണ്ട് ചെറിയ കരുക്കളേക്കാൾ കൂടുതൽ പണിയെടുക്കും.',
    'chat.chess.2': 'കരുക്കളിൽ മുന്നിലാണെങ്കിൽ, കൈമാറ്റം ചെയ്ത് കാലാളുകളെ കാക്കുക.',
    'chat.chess.3': 'ഞാൻ തരുന്ന ഓരോ ചെക്കും, എന്റെ കരുക്കളെ വികസിപ്പിക്കാത്ത ഒരു നീക്കമാണ്.',
    'tut.title': 'പഠിക്കാം', 'tut.sub': 'ഓരോ കരുവിന്റെയും നീക്കം, രണ്ട് കാലഘട്ടങ്ങളെ വേർതിരിക്കുന്ന നിയമങ്ങൾ — ആദ്യ കളിക്ക് മുമ്പ് രണ്ടും പരീക്ഷിക്കൂ.',
    'tut.pieces': 'കരുക്കൾ', 'tut.rules': 'നിയമങ്ങൾ', 'tut.normal': 'സാധാരണ നീക്കം', 'tut.capture': 'വെട്ട്', 'tut.first': 'ആദ്യ നീക്കത്തിൽ മാത്രം',
    'tut.hop': 'മുകളിലൂടെ ചാടും (വെട്ടില്ല)', 'tut.moves': 'നീക്കം:', 'tut.tag': 'നീക്കങ്ങളുടെ രേഖയിൽ {tag} എന്ന് എഴുതും.', 'tut.play': 'കളിക്കൂ — {title}',
  },
};
