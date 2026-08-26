export type IconId = 'ladder' | 'tiger' | 'dice' | 'seeds' | 'chess' | 'mill'
export type TileId = 'blue' | 'terracotta' | 'marigold' | 'green' | 'teal' | 'pink'

export interface Pin {
  x: number
  y: number
  place: string
  name: string
  fact: string
  how: string
}

export interface GameDef {
  id: string
  name: string
  native: string
  icon: IconId
  tile: TileId
  hasSoloMode: boolean
  mapSub: string
  path: boolean
  pins: Pin[]
  instructions: string[]
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const ICONS: Record<IconId, JSX.Element> = {
  ladder: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M7 3v18M17 3v18M7 8h10M7 13h10M7 18h10" />
    </svg>
  ),
  tiger: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3l2.5 4H18l-2 3 2 3h-3.5L12 17l-2.5-4H6l2-3-2-3h3.5L12 3z" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  dice: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="4" y="4" width="16" height="16" />
      <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  seeds: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M3 12c0-3 4-5 9-5s9 2 9 5-4 5-9 5-9-2-9-5z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  ),
  chess: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M9 21h6M8 21l1-5h6l1 5" />
      <path d="M9 16l-1-6h8l-1 6" />
      <path d="M12 10V5M9.5 6.5h5" />
    </svg>
  ),
  mill: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="4" y="4" width="16" height="16" />
      <rect x="8.5" y="8.5" width="7" height="7" />
      <path d="M4 12h4.5M15.5 12H20M12 4v4.5M12 15.5V20" />
    </svg>
  ),
}

export const GAMES: GameDef[] = [
  {
    id: 'vaikunthapali',
    name: 'Vaikunthapali',
    native: 'వైకుంఠపాళి · also Gyan Chauper, Moksha Patam',
    icon: 'ladder',
    tile: 'blue',
    hasSoloMode: true,
    mapSub: 'Traced its own path out of India — tap to follow it.',
    path: true,
    pins: [
      { x: 32, y: 38, place: 'ANDHRA PRADESH, INDIA', name: 'Vaikunthapali', fact: 'A solitary board of virtue and vice — squares of Faith and Knowledge lift you, squares of Greed and Pride drop you back down.', how: 'Origin. Designed as a solo meditation on karma, not a race against anyone.' },
      { x: 52, y: 26, place: 'UNITED KINGDOM', name: 'Snakes and Ladders', fact: 'Colonial families carried the board home; publishers stripped the moral squares and made it a race.', how: 'Brought back by returning colonial families and printed by British board-game makers.' },
      { x: 74, y: 24, place: 'UNITED STATES', name: 'Chutes and Ladders', fact: 'Milton Bradley localised it further in the 1940s, swapping snakes for chutes.', how: 'Licensed and re-illustrated from the British version.' },
    ],
    instructions: [
      '<strong>Objective:</strong> travel from Janma (birth, square 1) to Vaikuntham (square 100).',
      '<strong>Move:</strong> roll the die and advance; a <strong>6 earns another roll</strong>, but three 6s in a row forfeit the turn.',
      '<strong>Virtues</strong> raise ladders — humility, charity, service, faith, knowledge, meditation, compassion.',
      '<strong>Vices</strong> raise snakes — anger, envy, greed, delusion, pride, ego, desire.',
      '<strong>Moksha rule:</strong> you must land exactly on 100 — overshoot and you wait.',
      '<strong>Solo mode</strong> races the clock; against Kreedu it is a straight race to liberation.',
    ],
  },
  {
    id: 'puli-meka',
    name: 'Puli Meka Aata',
    native: 'పులి మేక ఆట · Aadu Puli Aatam, Bagh-Chal',
    icon: 'tiger',
    tile: 'terracotta',
    hasSoloMode: false,
    mapSub: 'A hunt that crossed the Himalayas.',
    path: true,
    pins: [
      { x: 38, y: 42, place: 'SOUTH INDIA', name: 'Puli Meka Aata', fact: 'Three tigers hunt fifteen goats on lines carved into temple floors — you can still find boards etched into stone at Chamundi Hill, Mysore.', how: 'Origin. Played for centuries in Tamil Nadu, Andhra Pradesh and Karnataka temple courtyards.' },
      { x: 56, y: 22, place: 'NEPAL', name: 'Bagh-Chal', fact: 'Same hunt, tougher odds — four tigers instead of three, twenty goats instead of fifteen, on a different grid.', how: 'Carried across trade and pilgrim routes into the Himalayas.' },
    ],
    instructions: [
      '<strong>Two roles:</strong> tigers hunt, goats trap.',
      '<strong>Tigers</strong> win by capturing enough goats.',
      '<strong>Goats</strong> win by blocking every tiger from moving.',
      'Play as either side against Kreedu.',
    ],
  },
  {
    id: 'ashta-chamma',
    name: 'Ashta Chamma',
    native: 'అష్ట చెమ్మ · Chowka Bara, Daayam, Vimanam',
    icon: 'dice',
    tile: 'marigold',
    hasSoloMode: false,
    mapSub: 'One game, a dozen regional names — before it ever left India.',
    path: true,
    pins: [
      { x: 40, y: 44, place: 'TELANGANA / ANDHRA PRADESH', name: 'Ashta Chamma', fact: 'Cast four cowrie shells — all mouths down scores "Atta" (8), all mouths up scores "Chamma" (4).', how: 'Regional name in Telugu-speaking country.' },
      { x: 32, y: 50, place: 'KARNATAKA', name: 'Chowka Bara', fact: 'Same board, same shells, new name — "four, eight" describes the winning throws.', how: 'Neighbouring regional variant.' },
      { x: 34, y: 60, place: 'TAMIL NADU', name: 'Daayam', fact: 'Played on cloth boards stitched with beads, passed down through generations of a household.', how: 'Southern regional variant.' },
      { x: 48, y: 20, place: 'NORTH INDIA', name: 'Pachisi → Ludo', fact: 'Its royal cousin — Akbar reportedly played a life-sized version at Fatehpur Sikri with courtiers as pieces.', how: 'Parallel dice-and-cross lineage, later exported by the British as Ludo.' },
    ],
    instructions: [
      '<strong>Objective:</strong> Race all 4 tokens home before your opponents.',
      '<strong>Move:</strong> Throw the cowries — only Atta (8) or Chamma (4) lets you enter the board.',
      'Land on a rival to send them back to start.',
      'Reach the centre square exactly to win.',
    ],
  },
  {
    id: 'vamana-guntalu',
    name: 'Vaamana Guntalu',
    native: 'వామన గుంటలు · Pallanguzhi',
    icon: 'seeds',
    tile: 'green',
    hasSoloMode: false,
    mapSub: 'Seeds that sailed the Indian Ocean.',
    path: true,
    pins: [
      { x: 36, y: 48, place: 'TAMIL NADU, INDIA', name: 'Pallanguzhi', fact: 'Fourteen pits, tamarind seeds or cowries — mentioned in Chola-era temple inscriptions.', how: 'Origin, popular among women in agrarian households.' },
      { x: 40, y: 44, place: 'ANDHRA / TELANGANA', name: 'Vaamana Guntalu', fact: 'Same fourteen-pit board, played at Sankranti gatherings across generations.', how: 'Regional spread within South India.' },
      { x: 64, y: 56, place: 'MALAYSIA', name: 'Congkak', fact: 'The pit-and-seed format re-appears almost unchanged, thousands of kilometres east.', how: 'Carried by Indian Ocean trade routes.' },
      { x: 52, y: 64, place: 'EAST AFRICA', name: 'Bao / Omweso family', fact: 'Distant mancala cousins with a strikingly similar board logic.', how: 'Possibly linked via the same pre-colonial trade network — history is still debated here.' },
    ],
    instructions: [
      '<strong>Objective:</strong> Collect more seeds than your opponent.',
      '<strong>Sow</strong> seeds from one pit, one at a time, into the following pits.',
      'Empty a pit on your side exactly — capture the opposite pit.',
      'Round ends when one side is fully emptied.',
    ],
  },
  {
    id: 'chaturangam',
    name: 'Chaturangam',
    native: 'చతురంగం · Chadarangam, Shatranj',
    icon: 'chess',
    tile: 'teal',
    hasSoloMode: false,
    mapSub: 'Four divisions of an army, reborn on every continent.',
    path: true,
    pins: [
      { x: 44, y: 46, place: 'INDIA', name: 'Chaturanga', fact: '"Four limbs" — infantry, cavalry, elephants, chariots — the earliest ancestor of chess, from around the 6th century.', how: 'Origin, played in Gupta-era courts.' },
      { x: 52, y: 38, place: 'PERSIA', name: 'Shatranj', fact: '"Shah mat" — the king is helpless — is where we get the word "checkmate."', how: 'Adopted and renamed after trade and conquest routes reached Persia.' },
      { x: 48, y: 22, place: 'EUROPE', name: 'Chess', fact: 'The queen and bishop got their modern powers only in 15th-century Europe.', how: 'Spread through the Islamic world into Spain and Italy.' },
      { x: 76, y: 34, place: 'CHINA / JAPAN', name: 'Xiangqi & Shogi', fact: 'A separate eastward branch — different board, different pieces, same shared root.', how: 'Parallel spread along Silk Road contact.' },
    ],
    instructions: [
      '<strong>Objective:</strong> Checkmate the opposing king.',
      'Each piece moves by its own rule — pawns, knights, bishops, rooks, the queen, the king.',
      "Capture by landing on an opponent's piece.",
      "Play as Chaturanga's modern descendant, chess rules, against Kreedu.",
    ],
  },
  {
    id: 'daadi-aata',
    name: 'Daadi Aata',
    native: "దాడి ఆట · Navakankari, Nine Men's Morris",
    icon: 'mill',
    tile: 'pink',
    hasSoloMode: false,
    mapSub: 'No single birthplace — just pins where it has quietly lived for millennia.',
    path: false,
    pins: [
      { x: 44, y: 44, place: 'INDIA', name: 'Navakankari / Daadi Aata', fact: '"Nine pebbles" — played in temples and village courtyards since at least the Maurya-Gupta era.', how: 'No claimed origin here — one of several places this game has existed for millennia.' },
      { x: 52, y: 30, place: 'ROME', name: "Nine Men's Morris", fact: 'Boards were carved into the stone of cathedrals and castles for soldiers and nobles alike.', how: 'Independently documented from around 1400 BCE.' },
      { x: 50, y: 24, place: 'EGYPT', name: 'Mill game boards', fact: 'Some of the oldest surviving boards of this family come from ancient Egyptian sites.', how: 'A separate, equally old thread of the same idea.' },
    ],
    instructions: [
      '<strong>Objective:</strong> Reduce your opponent to two pieces, or block all their moves.',
      '<strong>Phase 1:</strong> Place all 9 of your seeds, one per turn.',
      'Line up 3 in a row to form a "mill" and remove an opponent\'s piece.',
      '<strong>Phase 2:</strong> Slide pieces along lines to keep forming new mills.',
    ],
  },
]
