/* ---------------- tutorial content ---------------- */
const DEMO_BLOCK = `
  <p>Pick a piece to see how it moves. Dots are moves, rings are captures.</p>
  <div class="piece-picker" id="piece-picker"></div>
  <div class="demo-wrap">
    <div class="demo-board" id="demo-board"></div>
    <div class="demo-info" id="demo-info"></div>
  </div>`;

const LEGEND_BLOCK = `
  <h4>Reading the board</h4>
  <div class="legend">
    <div><span class="swatch" style="background:var(--teal); opacity:.55;"></span> Dot — a square you can move to</div>
    <div><span class="swatch" style="background:transparent; border-color:var(--terracotta); border-width:4px;"></span> Ring — a piece you can capture</div>
    <div><span class="swatch" style="background:var(--marigold);"></span> Marigold edge — the last move played</div>
    <div><span class="swatch" style="background:var(--pink);"></span> Pink square — a king in check</div>
  </div>`;

const TUTORIAL = {
chaturanga: [
{id:'quick', label:'Quick start', html:`
  <h3>Sixty seconds and you can play</h3>
  <ul>
    <li>Each side has 16 pieces: a <strong>Raja</strong>, a <strong>Mantri</strong>, two <strong>Gajas</strong>, two <strong>Ashvas</strong>, two <strong>Rathas</strong> and eight <strong>Padatis</strong>.</li>
    <li>Ivory moves first. Tap your piece, then tap a highlighted square.</li>
    <li>Landing on an enemy piece captures it. You may never leave your own Raja under attack.</li>
    <li>Trap the enemy Raja so it cannot escape — that's <strong>checkmate</strong>, and you win.</li>
  </ul>
  <div class="callout">If you already play chess, three things will trip you up: the <b>Mantri moves one square diagonally</b> (it is not a queen), the <b>Gaja jumps exactly two squares diagonally</b> (it is not a bishop), and <b>Padatis never advance two squares</b>. There is no castling.</div>
  ${LEGEND_BLOCK}`},

{id:'story', label:'Where it came from', html:`
  <h3>Four limbs of an army</h3>
  <p><em>Chatur-anga</em> means "four limbs" — the four divisions of a Gupta-era army: foot soldiers, horses, war elephants and chariots, all serving a king and his counsellor. The game turns that battle order into a board.</p>
  <p>It appears in Indian texts from around the 6th century CE. From India it travelled west into Persia as <em>Shatranj</em> — where the cry <em>shah mat</em>, "the king is helpless", became our word checkmate — then through the Islamic world into Spain and Italy, where 15th-century players gave the queen and bishop their modern powers. A separate branch went east and became Xiangqi and Shogi.</p>
  <div class="callout">In Telugu it is <b>చతురంగం (Chaturangam)</b>; you will also hear <b>Chadarangam</b>. Switch to <b>Chess</b> on the setup screen to play the far end of that journey on the same board.</div>
  <h4>An honest note</h4>
  <p>No complete rulebook survives from Gupta India. The moves here follow the standard reconstruction — the same one Shatranj used, which is the closest thing to direct evidence we have. The Gaja is the piece historians argue about most; some regional versions moved it differently.</p>`},

{id:'board', label:'The board', html:`
  <h3>Ashtapada, eight by eight</h3>
  <p>Chaturanga is played on the <em>ashtapada</em> — an eight-by-eight grid that already existed in India as a race-game board. It was <strong>uncheckered</strong>: plain lines with sixteen traditional marked squares, no alternating colours. Checkering came later, in Europe. Switch between the two under Controls; the game plays identically.</p>
  <h4>Setting up</h4>
  <ul>
    <li>Back rank, left to right: <strong>Ratha, Ashva, Gaja, Raja, Mantri, Gaja, Ashva, Ratha</strong>.</li>
    <li>Eight Padatis stand in front of them.</li>
    <li>Both armies mirror each other, so <strong>Raja faces Raja</strong> on the d-file and Mantri faces Mantri on the e-file. This is not the modern chess setup, where the queens face each other on their own colour.</li>
  </ul>
  <div class="callout">Squares are named the modern way — files <b>a</b> to <b>h</b>, ranks <b>1</b> to <b>8</b> from the ivory side — purely so the move record is readable.</div>`},

{id:'pieces', label:'The six pieces', html:`<h3>The six pieces</h3>${DEMO_BLOCK}`},

{id:'rules', label:'Rules of play', html:`
  <h3>Rules of play</h3>
  <h4>Taking turns</h4>
  <ul>
    <li>Ivory moves first, then the sides alternate. You must move on your turn — passing is not allowed.</li>
    <li>Move one piece per turn. Land on an enemy piece to capture it and take its square.</li>
    <li>You cannot capture your own pieces, and only the Ashva and Gaja may pass over an occupied square.</li>
  </ul>
  <h4>Your Raja's safety</h4>
  <ul>
    <li>When a piece attacks your Raja, you are in <strong>check</strong>. Your next move must end it — move the Raja, block the line, or capture the attacker.</li>
    <li>Any move that would leave your own Raja attacked is illegal; the board will not let you play it.</li>
    <li>There is <strong>no castling</strong>. The Raja walks.</li>
  </ul>
  <h4>Padati promotion</h4>
  <ul>
    <li>A Padati reaching the far rank is promoted — but only ever to a <strong>Mantri</strong>. There is no choice of piece.</li>
    <li>Since a Mantri moves a single diagonal step, promotion is a modest reward: worth roughly two Padatis, not nine.</li>
  </ul>
  <h4>What does not exist here</h4>
  <ul>
    <li>No two-square first move for Padatis, and therefore no <em>en passant</em>.</li>
    <li>No castling, no queen, no bishop.</li>
  </ul>`},

{id:'win', label:'How you win', html:`
  <h3>Three ways to win</h3>
  <h4>1. Checkmate</h4>
  <p>The enemy Raja is attacked and has no legal way out. This is the main victory, exactly as in chess.</p>
  <h4>2. Stalemate — and here it is a win</h4>
  <p>If your opponent has no legal move at all but is <em>not</em> in check, you win. Modern chess calls that a draw; Shatranj scored it as a victory for the player who caused it, and this board follows the older rule.</p>
  <h4>3. Baring the Raja</h4>
  <p>Capture every enemy piece so that only the Raja stands alone, and you win. One exception: if your opponent can immediately bare <em>your</em> Raja in reply, the game is drawn instead.</p>
  <div class="callout">These last two matter more than they sound. With no queen on the board, endgames grind — baring the Raja is a real finish, not a curiosity.</div>`},

{id:'chess', label:'vs modern chess', html:`
  <h3>If you already play chess</h3>
  <table class="cmp">
    <tr><th>Piece</th><th>Chaturanga</th><th>Modern chess</th></tr>
    <tr><td>Raja / King</td><td>One square any direction</td><td>Same, plus castling</td></tr>
    <tr><td>Mantri / Queen</td><td>One square diagonally only</td><td>Any distance, any direction</td></tr>
    <tr><td>Gaja / Bishop</td><td>Exactly two diagonally, leaping</td><td>Any distance diagonally</td></tr>
    <tr><td>Ashva / Knight</td><td>Identical</td><td>Identical</td></tr>
    <tr><td>Ratha / Rook</td><td>Identical</td><td>Identical</td></tr>
    <tr><td>Padati / Pawn</td><td>One forward, captures diagonally</td><td>Also two on its first move</td></tr>
    <tr><td>Promotion</td><td>To Mantri only</td><td>Any piece, usually queen</td></tr>
    <tr><td>Stalemate</td><td>Win for the stalemating side</td><td>Draw</td></tr>
    <tr><td>Bare king</td><td>Win</td><td>Not a rule</td></tr>
  </table>
  <div class="callout">The practical effect: the game is <b>much slower</b>. Long-range attacks barely exist, so plans are built a square at a time and a single Ratha becomes enormous.</div>`},

{id:'tips', label:'Tactics', html:`
  <h3>Tactics that actually work here</h3>
  <ul>
    <li><strong>Rathas decide games.</strong> They are the only long-range piece. Open a file for one and it dominates a board where nothing else can answer from a distance.</li>
    <li><strong>Ashvas outrank Gajas.</strong> A Gaja reaches only eight squares in the whole game and can never change that set. Trade a Gaja for an Ashva whenever you are offered it.</li>
    <li><strong>Padati chains are strong.</strong> With no two-square jump, both sides advance slowly, so a wall of mutually defending Padatis is hard to break.</li>
    <li><strong>Walk the Raja out early.</strong> No castling, no queen hunting it — a centralised Raja is a genuine fighting piece here.</li>
    <li><strong>Count for the bare-Raja finish.</strong> If you are up material and cannot force mate, hunting the last enemy piece is a legitimate winning plan.</li>
  </ul>`}
],

chess: [
{id:'quick', label:'Quick start', html:`
  <h3>Sixty seconds and you can play</h3>
  <ul>
    <li>Each side has 16 pieces: a <strong>king</strong>, a <strong>queen</strong>, two <strong>rooks</strong>, two <strong>bishops</strong>, two <strong>knights</strong> and eight <strong>pawns</strong>.</li>
    <li>White moves first. Tap your piece, then tap a highlighted square.</li>
    <li>Landing on an enemy piece captures it. You may never leave your own king under attack.</li>
    <li>Trap the enemy king so it cannot escape — that's <strong>checkmate</strong>, and you win.</li>
  </ul>
  <div class="callout">Coming from Chaturangam? Three things are new: the <b>queen sweeps the whole board</b>, the <b>bishop slides any distance diagonally</b>, and pawns may <b>step two squares</b> on their first move. You also get <b>castling</b>, and stalemate is now a <b>draw</b>, not a win.</div>
  ${LEGEND_BLOCK}`},

{id:'board', label:'The board', html:`
  <h3>The board and the setup</h3>
  <ul>
    <li>Back rank, left to right: <strong>rook, knight, bishop, queen, king, bishop, knight, rook</strong>.</li>
    <li>Eight pawns stand in front. The queen starts on her own colour — white queen on the light square d1, black queen on the dark square d8 — which is why the two armies are rotated rather than mirrored.</li>
    <li>Squares are named by file (<strong>a–h</strong>) and rank (<strong>1–8</strong>) from white's side, so the bottom-left square is a1.</li>
  </ul>
  <h4>Reading the move record</h4>
  <p>Moves are written the standard way: the piece letter plus the destination. <strong>Nf3</strong> is a knight to f3, <strong>exd5</strong> is a pawn on the e-file capturing on d5, <strong>O-O</strong> is castling short, <strong>e8=Q</strong> is a promotion, <strong>+</strong> is check and <strong>#</strong> is checkmate. Pawns get no letter.</p>`},

{id:'pieces', label:'The six pieces', html:`<h3>The six pieces</h3>${DEMO_BLOCK}`},

{id:'special', label:'Special moves', html:`
  <h3>Three moves that break the pattern</h3>
  <h4>Castling</h4>
  <p>Once per game, the king steps two squares towards a rook and that rook hops over to the far side of him. It tucks the king into a corner and brings the rook into play in a single move.</p>
  <ul>
    <li>Short (<strong>O-O</strong>): king e1 to g1, rook h1 to f1. Long (<strong>O-O-O</strong>): king e1 to c1, rook a1 to d1.</li>
    <li>Allowed only if <strong>neither the king nor that rook has moved</strong>, the squares between them are empty, and the king is not in check, does not pass through an attacked square, and does not land on one.</li>
    <li>To castle here, select the king — the castling square appears as a normal move dot.</li>
  </ul>
  <h4>En passant</h4>
  <p>If a pawn uses its two-square first move to slip past an enemy pawn that could have captured it, that enemy pawn may capture it anyway — moving diagonally to the square it skipped, as though it had only moved one. This is only legal on the <strong>very next move</strong>; wait a turn and the chance is gone.</p>
  <h4>Promotion</h4>
  <p>A pawn reaching the eighth rank becomes any piece you choose except a king. You will almost always take a queen, but a knight is occasionally stronger — it is the one piece a queen cannot imitate. The board will ask you which.</p>
  <div class="callout">All three are inventions of the medieval and Renaissance game. None of them exist in Chaturangam.</div>`},

{id:'rules', label:'Rules of play', html:`
  <h3>Rules of play</h3>
  <ul>
    <li>White moves first and the sides alternate. You must move — passing is not allowed.</li>
    <li>Move one piece per turn. Land on an enemy piece to capture it and take its square. Only knights may jump.</li>
    <li>When a piece attacks your king you are in <strong>check</strong>, and your reply must end it: move the king, block the line, or capture the attacker.</li>
    <li>Any move that would leave your own king attacked is illegal; the board will not let you play it. You cannot capture a king, and the two kings can never stand next to each other.</li>
  </ul>
  <h4>Rough piece values</h4>
  <p>Pawn 1, knight 3, bishop 3, rook 5, queen 9. They are a guide, not a law — a knight planted in the middle of the enemy position can be worth more than a rook stuck behind its own pawns. The tray beside the board keeps a running count for you.</p>`},

{id:'win', label:'How you win', html:`
  <h3>Winning, and the five ways to draw</h3>
  <h4>Checkmate</h4>
  <p>The enemy king is attacked and has no legal escape. That's the win.</p>
  <h4>Resignation</h4>
  <p>A player who sees the position is hopeless can resign rather than play it out. Kreedu will not resign on you.</p>
  <h4>Draws</h4>
  <ul>
    <li><strong>Stalemate</strong> — the player to move has no legal move but is <em>not</em> in check. Half a point each. In Chaturangam this same position is a win; the change makes defence in modern chess far more resilient.</li>
    <li><strong>Threefold repetition</strong> — the same position occurs three times.</li>
    <li><strong>Fifty-move rule</strong> — fifty moves by each side with no capture and no pawn move.</li>
    <li><strong>Insufficient material</strong> — neither side has enough left to force mate, e.g. king and bishop against king.</li>
    <li><strong>Agreement</strong> — the two players simply agree. Not offered against Kreedu.</li>
  </ul>
  <div class="callout">All four automatic draws are detected for you and announced when they happen.</div>`},

{id:'origin', label:'vs Chaturangam', html:`
  <h3>What a thousand years changed</h3>
  <table class="cmp">
    <tr><th>Piece</th><th>Chaturanga (6th c.)</th><th>Chess (from 15th c.)</th></tr>
    <tr><td>King / Raja</td><td>One square any direction</td><td>Same, plus castling</td></tr>
    <tr><td>Queen / Mantri</td><td>One square diagonally</td><td>Any distance, any direction</td></tr>
    <tr><td>Bishop / Gaja</td><td>Exactly two diagonally, leaping</td><td>Any distance diagonally</td></tr>
    <tr><td>Knight / Ashva</td><td>Identical</td><td>Identical</td></tr>
    <tr><td>Rook / Ratha</td><td>Identical</td><td>Identical</td></tr>
    <tr><td>Pawn / Padati</td><td>One forward only</td><td>Two on its first move, en passant</td></tr>
    <tr><td>Promotion</td><td>To Mantri only</td><td>Your choice of piece</td></tr>
    <tr><td>Stalemate</td><td>Win for the stalemating side</td><td>Draw</td></tr>
    <tr><td>Bare king</td><td>Win</td><td>Not a rule</td></tr>
  </table>
  <p>Only the knight and rook survived the journey untouched. Everything else was sped up — which is exactly why the modern opening lasts a dozen moves where the ancient one lasted forty.</p>
  <div class="callout">The queen's promotion from one-step counsellor to the strongest piece on the board happened in late-15th-century Spain and Italy. Contemporaries called the new game <em>scacchi alla rabiosa</em> — "madwoman's chess".</div>`},

{id:'tips', label:'Tactics', html:`
  <h3>Ideas that win games</h3>
  <ul>
    <li><strong>Open with the centre.</strong> Push a central pawn, bring out knights and bishops, castle. Three moves with the same piece before you have developed the rest usually costs you.</li>
    <li><strong>Look for forks, pins and skewers.</strong> A knight attacking two pieces at once, or a bishop pinning a knight to the king, wins material without a fight.</li>
    <li><strong>Count the defenders before you capture.</strong> If a square is attacked twice and defended twice, taking first usually loses.</li>
    <li><strong>Trade when you are ahead.</strong> Every swap makes your extra piece a bigger share of what is left.</li>
    <li><strong>In the endgame, the king is a strong piece.</strong> March it towards the action, and push passed pawns.</li>
    <li><strong>Before you move, ask what your opponent's last move threatened.</strong> Most losses are missed threats, not missed brilliancies.</li>
  </ul>`}
]
};