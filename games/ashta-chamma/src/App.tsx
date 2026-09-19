import { useEffect, useRef, useState } from 'react';
import { BookOpen, CircleHelp, History, Play, RotateCcw, Volume2 } from 'lucide-react';
import '../ashta-chamma.js';

type View = 'HOME' | 'ABOUT' | 'HISTORY' | 'RULES' | 'GAME';

const nav: { id: View; label: string }[] = [
  { id: 'HOME', label: 'Home' },
  { id: 'ABOUT', label: 'About' },
  { id: 'HISTORY', label: 'History' },
  { id: 'RULES', label: 'How to Play' },
  { id: 'GAME', label: 'Play Game' },
];

function Header({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => onNavigate('HOME')} aria-label="Go to KREEDA home">
          <span className="brand-mark">✦</span>
          <span><strong>KREEDA</strong><small>క్రీడా · living games</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>{item.label}</button>)}
        </nav>
        <div className="header-tools">
          <button className="icon-button" aria-label="Sound on" title="Sound on"><Volume2 size={17} /></button>
          <button className="icon-button" aria-label="How to play" title="How to play" onClick={() => onNavigate('RULES')}><CircleHelp size={17} /></button>
          <button className="mobile-play" onClick={() => onNavigate('GAME')}><Play size={14} fill="currentColor" /> Play</button>
        </div>
      </div>
      <div className="mobile-nav">{nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>{item.label}</button>)}</div>
    </header>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div className="section-title"><span className="eyebrow">✦ {eyebrow}</span><h1>{title}</h1><p>{subtitle}</p><div className="divider" /></div>;
}

function Home({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <main className="page home-page">
    <section className="hero-grid">
      <div className="hero-copy"><span className="eyebrow">✦ Ancient Indian race game</span><h1>ASHTA<br /><em>CHAMMA</em></h1><p className="telugu">అష్ట చెమ్మ</p><p className="lead">Four shells. Eight steps. One beautifully unpredictable journey home.</p><div className="divider" /><p>Bring your tokens from the nest to the fruit house, protect them on safe squares, and outwit Kreedu one throw at a time.</p><button className="primary-button" onClick={() => onNavigate('GAME')}><Play size={18} fill="currentColor" /> Play Ashta Chamma</button></div>
      <div className="hero-art"><div className="hero-board"><div className="hero-board-title">YOUR BOARD AWAITS</div><div className="mini-grid">{Array.from({ length: 25 }, (_, i) => <span key={i} className={i === 12 ? 'home' : [2, 10, 14, 22].includes(i) ? 'safe' : ''}>{i === 12 ? '✦' : ''}</span>)}</div><div className="hero-caption"><b>4 cowrie shells</b><span>·</span><b>2 sides</b><span>·</span><b>1 winner</b></div></div></div>
    </section>
    <section className="feature-grid"><article className="feature-card teal"><span className="feature-icon">♧</span><h2>Shell-born strategy</h2><p>Every throw opens a small set of choices. Read the board, then choose the token that changes the race.</p></article><article className="feature-card gold"><span className="feature-icon">✦</span><h2>Race to the fruit house</h2><p>Move all four of your terracotta tokens into the centre. Exact steps matter; overshoots do not count.</p></article><article className="feature-card pink"><span className="feature-icon">◉</span><h2>Play with Kreedu</h2><p>Kreedu plays automatically while you decide each move. Capture once to unlock your inner circle.</p></article></section>
  </main>;
}

function InfoView({ view, onNavigate }: { view: 'ABOUT' | 'HISTORY' | 'RULES'; onNavigate: (view: View) => void }) {
  const about = view === 'ABOUT';
  const history = view === 'HISTORY';
  return <main className="page info-page"><SectionTitle eyebrow={about ? 'The game' : history ? 'A living tradition' : 'Official guide'} title={about ? 'A small board, a deep game.' : history ? 'Carried by hands, not screens.' : 'How to play Ashta Chamma'} subtitle={about ? 'A closer look at the pieces, places, and rhythm of this Ashta Chamma implementation.' : history ? 'The known regional names and lineage preserved in this project.' : 'The rules below reflect the game currently implemented on the board.'} />
    <div className="info-layout"><article className="paper-panel"><h2>{about ? 'What is Ashta Chamma?' : history ? 'Names across the south' : 'The rhythm of a turn'}</h2>{about && <><p>Ashta Chamma is a four-player race game played with cowrie shells. This edition is a solo match against Kreedu: you command the terracotta tokens at the bottom, while Kreedu commands the teal tokens at the top.</p><p>The board keeps its 5 × 5 Ashta Chamma shape, including the four safe houses and the fruit house at the centre.</p></>}{history && <><p>The same family of shell-and-token games travels under regional names including Ashta Chamma, Chowka Bara, Daayam, and Vimanam.</p><p className="empty-note">A fuller historical account is intentionally left open here until sources for this particular regional tradition are added.</p></>}{!about && !history && <ol className="rule-list"><li><b>Throw four shells.</b> One to four face-up shells score that number; no face-up shells scores Ashta, or 8.</li><li><b>Choose a token.</b> You may enter a token or move one already on the path when the move is legal.</li><li><b>Protect and capture.</b> Safe houses allow stacking and prevent captures. Landing on another token elsewhere sends it back to its nest.</li><li><b>Find the centre.</b> Reach the fruit house exactly. A Chamma (4), Ashta (8), or capture grants another throw.</li><li><b>Unlock the inner circle.</b> Your first capture lets your side cross from the outer path into the inner path.</li></ol>}</article><aside className="side-panel"><div className="side-panel-head"><BookOpen size={18} /><h2>Ashta Chamma</h2></div><p className="telugu">అష్ట చెమ్మ</p><div className="side-stat"><span>Tokens per side</span><b>4</b></div><div className="side-stat"><span>Shells per throw</span><b>4</b></div><div className="side-stat"><span>Board</span><b>5 × 5</b></div><button className="secondary-button" onClick={() => onNavigate('GAME')}><Play size={15} fill="currentColor" /> Enter the board</button></aside></div>
  </main>;
}

function GameView({ onBack }: { onBack: () => void }) {
  const gameRoot = useRef<HTMLDivElement>(null);
  useEffect(() => { const root = gameRoot.current; if (!root || !window.KreedaAshtaChamma) return; window.KreedaAshtaChamma.mount(root); return () => window.KreedaAshtaChamma?.unmount(); }, []);
  return <main className="page game-page"><div className="game-heading"><div><h1>Ashta Chamma</h1><p>Terracotta is you. Teal is Kreedu. May the shells be kind.</p></div></div><div ref={gameRoot} className="ashta-mount" /></main>;
}

export default function App() {
  const [view, setView] = useState<View>('HOME');
  const navigate = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <div className="app-shell"><Header view={view} onNavigate={navigate} /><div className="content"><>{view === 'HOME' && <Home onNavigate={navigate} />}{view === 'GAME' && <GameView onBack={() => navigate('HOME')} />}{view !== 'HOME' && view !== 'GAME' && <InfoView view={view} onNavigate={navigate} />}</></div><footer><b>KREEDA</b><span>Traditional games, kept in play.</span><span>Ashta Chamma · offline edition</span></footer></div>;
}