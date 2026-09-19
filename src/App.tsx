import type { CSSProperties } from 'react';

type Game = {
  slug: string;
  name: string;
  nativeName: string;
  description: string;
  icon: string;
  color: string;
  href?: string;
};

const games: Game[] = [
  { slug: 'vaikunthapali', name: 'Vaikunthapali', nativeName: 'వైకుంఠపాళి', description: 'Climb toward liberation in the ancestor of Snakes and Ladders.', icon: '🪜', color: 'var(--color-blue)', href: './games/vaikunthapali/site/' },
  { slug: 'puli-meka-aata', name: 'Puli Meka Aata', nativeName: 'పులి మేక ఆట', description: 'A tense hunt where clever goats surround powerful tigers.', icon: '🐅', color: 'var(--color-terracotta)', href: './games/puli-meka-aata/site/' },
  { slug: 'ashta-chamma', name: 'Ashta Chamma', nativeName: 'అష్ట చెమ్మ', description: 'Race your pieces home with cowrie shells and sharp tactics.', icon: '🐚', color: 'var(--color-marigold)', href: './games/ashta-chamma/site/' },
  { slug: 'vaamana-guntalu', name: 'Vaamana Guntalu', nativeName: 'వామన గుంటలు', description: 'Sow, capture, and count in this rhythmic mancala tradition.', icon: '🌰', color: 'var(--color-green)', href: './games/vaamana-guntalu/site/' },
  { slug: 'chaturangam', name: 'Chaturangam', nativeName: 'చతురంగం', description: 'Command the four divisions in the ancient forerunner of chess.', icon: '♞', color: 'var(--color-teal)', href: './games/chaturangam/site/' },
  { slug: 'daadi-aata', name: 'Daadi Aata', nativeName: 'దాడి ఆట', description: 'Form mills, block your rival, and control the crossing lines.', icon: '◉', color: 'var(--color-pink)', href: './games/daadi-aata/site/' },
];

function GameCard({ game, index }: { game: Game; index: number }) {
  const content = <>
    <span className="card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
    <span className="game-icon" aria-hidden="true">{game.icon}</span>
    <h3>{game.name}</h3>
    <p className="native-name" lang="te">{game.nativeName}</p>
    <p className="description">{game.description}</p>
    <span className="card-action">{game.href ? 'Play game →' : 'Integrating soon'}</span>
  </>;
  const style = { '--card-color': game.color } as CSSProperties;

  return game.href
    ? <a className="game-card" data-game={game.slug} href={game.href} style={style}>{content}</a>
    : <article className="game-card unavailable" data-game={game.slug} aria-label={`${game.name}, integrating soon`} style={style}>{content}</article>;
}

export default function App() {
  return <main className="shell">
    <header>
      <div className="brand"><span className="brand-mark" aria-hidden="true">✦</span>KREEDA</div>
      <p className="tagline">Play the past. Keep the stories moving.</p>
    </header>
    <section className="hero" aria-labelledby="page-title">
      <p className="eyebrow">Traditional games · timeless strategy</p>
      <h1 id="page-title">Six games. Thousands of years of play.</h1>
      <p className="intro">Meet India’s classic board games, learn how they travelled across the world, and challenge Kreedu—your playful built-in opponent.</p>
    </section>
    <section aria-labelledby="games-title">
      <div className="section-heading"><h2 id="games-title">Choose your game</h2><span className="count">6 games in the collection</span></div>
      <div className="games">{games.map((game, index) => <GameCard game={game} index={index} key={game.slug} />)}</div>
    </section>
    <footer>KREEDA celebrates the strategy, craft, and living history of Indian play.</footer>
  </main>;
}
