/* ============================================================
   UI layer
   ============================================================ */
function svgArt(inner){ return '<svg viewBox="0 0 40 44" aria-hidden="true">' + inner + '</svg>'; }
/* Modern pieces use the standard Cburnett chess set (Wikimedia Commons,
   Category:SVG_chess_pieces — CC-BY-SA 3.0 / GFDL), retraced with the
   board's own colour variables in place of its hard-coded fill/stroke so
   it themes the same way as every other piece. Own canvas (45x45) since
   that's the geometry the set was drawn to. */
function svgArtChess(inner){ return '<svg viewBox="0 0 45 45" aria-hidden="true">' + inner + '</svg>'; }
const SS = 'stroke="var(--pc-stroke)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="var(--pc-fill)"';

/* Chaturanga-only pieces (Padati, Ashva, Ratha, Gaja, Mantri) keep the
   hand-drawn set; the chess variant now draws entirely from ART_VARIANT.chess
   below, so these P/N/R entries are only ever reached for Chaturanga. */
const ART_BASE = {
  P: svgArt('<path d="M20 6c3 0 5 2.2 5 5 0 1.9-1 3.4-2.4 4.3 2.6 1.3 4.2 3.7 4.6 7.2H12.8c.4-3.5 2-5.9 4.6-7.2A5 5 0 0 1 15 11c0-2.8 2-5 5-5z" '+SS+'/><path d="M14 24h12l2 8H12z" '+SS+'/><path d="M10 32h20l2 6H8z" '+SS+'/>'),
  N: svgArt('<path d="M25 6c-6 0-9.5 3-12 7.5-1.6 2.8-3.5 4-5 4.6-1.2.5-1.3 1.6-.2 2l4.2 1.5-1.4 3.2c-.5 1.2.4 2.2 1.6 1.8l3-1c1.6 3 1.4 5.6.6 8.4h13c1.4-6.6 1.6-12.4-.2-17.4C27.2 11.5 26.6 8.6 25 6z" '+SS+'/><circle cx="22.6" cy="14.2" r="1.5" fill="var(--pc-stroke)"/><path d="M11 32h18l2 6H9z" '+SS+'/>'),
  R: svgArt('<circle cx="20" cy="17" r="10" '+SS+'/><circle cx="20" cy="17" r="3" fill="var(--pc-stroke)"/><path d="M20 7v20M10 17h20M13 10l14 14M27 10L13 24" stroke="var(--pc-stroke)" stroke-width="1.8" stroke-linecap="round"/><path d="M11 32h18l2 6H9z" '+SS+'/>'),
  /* Gaja — war elephant, with a howdah tower strapped to its back */
  E: svgArt('<ellipse cx="10.4" cy="17.5" rx="5.2" ry="6.8" '+SS+'/><ellipse cx="29.6" cy="17.5" rx="5.2" ry="6.8" '+SS+'/><path d="M20 6.2c4.7 0 7.8 3.2 7.8 7.7 0 4.3-2.2 7.5-3.4 9.6h-8.8c-1.2-2.1-3.4-5.3-3.4-9.6 0-4.5 3.1-7.7 7.8-7.7z" '+SS+'/><path d="M15.4 3.6h9.2v3.4h-9.2z" '+SS+'/><path d="M17.2 1.6h1.9v2h-1.9zM20.9 1.6h1.9v2h-1.9z" '+SS+'/><path d="M20 20.5c0 4.2.3 6.7 2.6 8.4 1.5 1.1 1 3-.9 3" fill="none" stroke="var(--pc-stroke)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 22.6l-1.7 3.5M24 22.6l1.7 3.5" fill="none" stroke="var(--pc-stroke)" stroke-width="2" stroke-linecap="round"/><circle cx="16.6" cy="14.6" r="1.3" fill="var(--pc-stroke)"/><circle cx="23.4" cy="14.6" r="1.3" fill="var(--pc-stroke)"/><path d="M11 32h18l2 6H9z" '+SS+'/>'),
  /* Mantri — counsellor, a single diagonal-stepping minister with a modest peaked cap */
  M: svgArt('<path d="M20 4.4l2 4.2 3.8-1-1.5 4.1C26.9 13.2 28.4 15.6 28.4 18.4c0 3.8-3.8 6.3-8.4 6.3s-8.4-2.5-8.4-6.3c0-2.8 1.5-5.2 4.1-6.7L14.2 7.6l3.8 1z" '+SS+'/><circle cx="20" cy="17.4" r="2.3" fill="var(--pc-stroke)"/><path d="M13.3 26.7h13.4l1.5 5H11.8z" '+SS+'/><path d="M10 32h20l2 6H8z" '+SS+'/>')
};

/* Kings — and, for chess, every other piece too — are drawn separately per
   variant on purpose. No Christian cross belongs on a 6th-century Gupta
   court, so the Raja wears a jewelled turban with no cross. */
const ART_VARIANT = {
  chaturanga: {
    /* Raja — a domed royal turban (ushnisha) with a wrapped band and a
       central jewel, topped with a plain finial. No cross. */
    K: svgArt('<circle cx="20" cy="5.4" r="1.9" '+SS+'/><path d="M20 7.3v2.4" stroke="var(--pc-stroke)" stroke-width="2.1" stroke-linecap="round"/><path d="M20 10.6c5.4 0 9.3 3.5 9.3 8.1 0 2.9-1.6 5.2-3.9 6.7H14.6c-2.3-1.5-3.9-3.8-3.9-6.7 0-4.6 3.9-8.1 9.3-8.1z" '+SS+'/><path d="M11.6 15.2c2.8 1.5 5.6 1.5 8.4 0 2.8 1.5 5.6 1.5 8.4 0" fill="none" stroke="var(--pc-stroke)" stroke-width="1.7" stroke-linecap="round"/><path d="M11.6 19.4c2.8 1.4 5.6 1.4 8.4 0 2.8 1.4 5.6 1.4 8.4 0" fill="none" stroke="var(--pc-stroke)" stroke-width="1.4" stroke-linecap="round" opacity=".7"/><circle cx="20" cy="17.2" r="1.7" fill="var(--pc-stroke)"/><path d="M13.3 25.4h13.4l1.5 5.4H11.8z" '+SS+'/><path d="M10.2 30.8h19.6l2 6.2H8.2z" '+SS+'/>')
  },
  /* Chess — the standard Cburnett/Wikimedia set, all six pieces, retraced
     with var(--pc-fill)/var(--pc-stroke) so ivory/ebony theming still
     works exactly as it does for every other piece on the board. */
  chess: {
    K: svgArtChess('<g fill="none" fill-rule="evenodd" stroke="var(--pc-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="var(--pc-fill)" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="var(--pc-fill)"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g>'),
    Q: svgArtChess('<g fill="var(--pc-fill)" fill-rule="evenodd" stroke="var(--pc-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g>'),
    R: svgArtChess('<g fill="var(--pc-fill)" fill-rule="evenodd" stroke="var(--pc-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g>'),
    B: svgArtChess('<g fill="none" fill-rule="evenodd" stroke="var(--pc-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="var(--pc-fill)" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g>'),
    N: svgArtChess('<g fill="none" fill-rule="evenodd" stroke="var(--pc-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="var(--pc-fill)"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="var(--pc-fill)"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="var(--pc-stroke)"/></g>'),
    P: svgArtChess('<path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="var(--pc-fill)" stroke="var(--pc-stroke)" stroke-width="1.5" stroke-linecap="round"/>')
  }
};

/* getArt(variant, letter) — variant-specific art (currently just the king)
   falls back to the shared set every other piece draws from. */
function getArt(variant, letter){
  const v = ART_VARIANT[variant];
  if(v && v[letter]) return v[letter];
  return ART_BASE[letter];
}

const PIECE_INFO = {
  chaturanga: {
    P:{n:'Padati', t:'పదాతి', en:'Foot soldier', tag:'Pd', worth:'Worth 1',
       how:'One square straight forward. It captures one square diagonally forward instead.',
       note:'Never two squares, not even from its starting rank — so there is no en passant either. Reaching the far rank promotes it to a Mantri, and only a Mantri.'},
    N:{n:'Ashva', t:'అశ్వ', en:'Horse', tag:'Av', worth:'Worth about 3',
       how:'Two squares one way and one across — the familiar L, jumping over anything.',
       note:'Identical to the modern knight, and relatively far stronger here: on a board where almost nothing moves far, a piece that leaps into the middle is a serious weapon.'},
    E:{n:'Gaja', t:'గజ', en:'War elephant', tag:'Gj', worth:'Worth about 1.5',
       how:'Exactly two squares diagonally, leaping over whatever stands between.',
       note:'It cannot move one square, and it cannot move three. It reaches only eight squares on the entire board and can never reach any other, so two Gajas on the same colour overlap badly.'},
    R:{n:'Ratha', t:'రథ', en:'Chariot', tag:'Rt', worth:'Worth about 5',
       how:'Any distance in a straight line along a rank or file, until something blocks it.',
       note:'Identical to the modern rook and by far the strongest piece here. Whoever gets a Ratha onto an open file usually wins the game.'},
    M:{n:'Mantri', t:'మంత్రి', en:'Counsellor', tag:'Mn', worth:'Worth about 2',
       how:'Exactly one square diagonally. That is all.',
       note:'The ancestor of the queen, but one of the weakest pieces here — it stays on its starting colour forever and covers only four squares.'},
    K:{n:'Raja', t:'రాజు', en:'King', tag:'Rj', worth:'Priceless',
       how:'One square in any direction, straight or diagonal.',
       note:'It can never move onto an attacked square, and no move may leave it exposed. With no long-range attackers about, walking the Raja towards the centre is often a good idea.'}
  },
  chess: {
    P:{n:'Pawn', t:'', en:'', tag:'', worth:'Worth 1',
       how:'One square forward, or two on its very first move. It captures one square diagonally forward.',
       note:'Reaching the far rank promotes it to any piece you choose — almost always a queen. It can also capture en passant; see Special moves.'},
    N:{n:'Knight', t:'', en:'', tag:'N', worth:'Worth about 3',
       how:'Two squares one way and one across, jumping over anything in the way.',
       note:'The only piece that leaps. Knights are at their best in closed positions where bishops have nothing to bite on.'},
    B:{n:'Bishop', t:'', en:'', tag:'B', worth:'Worth about 3',
       how:'Any distance diagonally, until something blocks it.',
       note:'It never leaves its starting colour, so the pair together — one on light, one on dark — is worth more than the sum of its parts. This is the piece the Gaja became.'},
    R:{n:'Rook', t:'', en:'', tag:'R', worth:'Worth about 5',
       how:'Any distance along a rank or file, until something blocks it.',
       note:'Unchanged since Chaturanga. Rooks want open files and the seventh rank.'},
    Q:{n:'Queen', t:'', en:'', tag:'Q', worth:'Worth about 9',
       how:'Any distance in any direction — rook and bishop combined.',
       note:'The strongest piece on the board, and the biggest single change from Chaturanga: the Mantri moved one diagonal step. Fifteenth-century Europe gave her this range and the whole game sped up.'},
    K:{n:'King', t:'', en:'', tag:'K', worth:'The game',
       how:'One square in any direction. Once per game it may castle; see Special moves.',
       note:'It can never move onto an attacked square, and no move may leave it in check. In the middlegame keep it tucked away; in the endgame march it up the board.'}
  }
};
const ORDER = { chaturanga:['P','N','E','R','M','K'], chess:['P','N','B','R','Q','K'] };
const VARIANT_INFO = {
  chaturanga:{ title:'Chaturangam', native:'చతురంగం · चतुरङ्ग · the ancestor of chess',
    lead:'Gupta-era India, around the 6th century. Infantry, cavalry, elephants and chariots line up behind a raja — and every chess board on earth descends from this one. These are the old rules, not the modern ones.',
    sides:{w:'Ivory', b:'Ebony'} },
  chess:{ title:'Chess', native:'the descendant · Shatranj → Europe → the modern game',
    lead:'The same board, a thousand years later. Persia renamed it Shatranj, Europe gave the queen and bishop their range, and the slow ancient game became the fast modern one. Play them side by side and you can feel exactly what changed.',
    sides:{w:'White', b:'Black'} }
};

const MASCOT_FALLBACK = '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#EFA90C" stroke="#5C140F" stroke-width="4"/><circle cx="23" cy="28" r="4.4" fill="#5C140F"/><circle cx="41" cy="28" r="4.4" fill="#5C140F"/><path d="M22 41c4 4.5 16 4.5 20 0" stroke="#5C140F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 5v6M14 12l4 5M50 12l-4 5" stroke="#5C140F" stroke-width="4" stroke-linecap="round"/></svg>';
function mountMascot(id){
  const el = document.getElementById(id); if(!el) return;
  el.innerHTML = MASCOT_FALLBACK;
  const img = new Image();
  img.alt = 'Kreedu, the KREEDA mascot';
  img.onload = ()=>{ el.innerHTML=''; el.appendChild(img); };
  img.src = 'kreedu-mascot.png';
}
['mascot-hero','mascot-strip','mascot-result'].forEach(mountMascot);