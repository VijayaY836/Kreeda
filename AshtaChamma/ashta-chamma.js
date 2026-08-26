/* ============================================================
   ASHTA CHAMMA — standalone game module  v2.1
   ------------------------------------------------------------
   Exposes window.KreedaAshtaChamma = { mount(el), unmount() }.

   v2.1 fixes:
   1. Safe houses allow ANY number of same-side tokens to stack.
   2. Legal-move generation always considers BOTH entry moves AND
      on-board moves simultaneously for every roll.
   3. Inner-circle gate: global per-side capture flag; a token
      may not cross outer→inner until that side has captured once.
   4. Strategic/deadlock win: all 4 of one side in inner circle
      while opponent cannot possibly capture any of them.
   5. canOppCapture: nest tokens can only land on entry square
      (safe house) → can never capture on entry; treated correctly.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. AUTHORITATIVE MOVEMENT PATHS  (0-based row, col)
     Each entry is { r, c }.
     index 0  = start square  (outside entry)
     index 24 = home          (2,2)
  --------------------------------------------------------- */
  function mkPath(coords) {
    return coords.map(function (p) { return { r: p[0], c: p[1] }; });
  }

  const PATHS = {
    1: mkPath([
      [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4],
      [0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
      [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [2, 2]
    ]),
    2: mkPath([
      [2, 4], [1, 4], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
      [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
      [3, 4], [3, 3], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [2, 3], [2, 2]
    ]),
    3: mkPath([
      [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
      [4, 1], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4],
      [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [2, 2]
    ]),
    4: mkPath([
      [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
      [3, 4], [2, 4], [1, 4], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
      [1, 0], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1], [2, 2]
    ])
  };

  const HOME_IDX = 24;               // index 24 = physical cell (2,2)

  /* Player → Path 1 (bottom home, start (4,2))
     Kreedu → Path 3 (top home,    start (0,2)) */
  const SIDE_PATH = { player: 1, kreedu: 3 };

  /* ---------------------------------------------------------
     INNER-CIRCLE BOUNDARY
     Outer circle: path indices  0–15  (inclusive)
     Inner circle: path indices 16–24  (inclusive, 24 = home)

     Crossing outer→inner requires that side's capture flag.
  --------------------------------------------------------- */
  const OUTER_MAX_IDX = 15;
  const INNER_MIN_IDX = 16;

  function isInInner(pathIdx) { return pathIdx >= INNER_MIN_IDX; }

  /* Safe squares — captures blocked here AND same-side tokens
     may stack freely (no blocking rule applies).
     Both entry squares are safe houses.                        */
  const SAFE_CELLS = { '0-2': true, '2-4': true, '4-2': true, '2-0': true };

  function cellKey(r, c) { return r + '-' + c; }
  function isSafe(r, c) { return !!SAFE_CELLS[cellKey(r, c)]; }
  function pathCell(pathNum, idx) { return PATHS[pathNum][idx] || null; }

  function destIsSafeHouse(pathNum, idx) {
    if (idx < 0 || idx > HOME_IDX) return false;
    const cell = pathCell(pathNum, idx);
    return cell ? isSafe(cell.r, cell.c) : false;
  }

  /* ---------------------------------------------------------
     2. COWRIE-ROLL SYSTEM
     Natural shell probabilities (4 cowries):
       1→4/16  2→6/16  3→4/16  4→1/16  8→1/16  (0 up = Ashta = 8)
  --------------------------------------------------------- */
  const NATURAL_WEIGHTS = [
    { v: 1, w: 4 }, { v: 2, w: 6 }, { v: 3, w: 4 }, { v: 4, w: 1 }, { v: 8, w: 1 }
  ];
  const TOTAL_W = NATURAL_WEIGHTS.reduce(function (s, e) { return s + e.w; }, 0);

  function weightedRoll() {
    let r = Math.random() * TOTAL_W;
    for (let i = 0; i < NATURAL_WEIGHTS.length; i++) {
      r -= NATURAL_WEIGHTS[i].w;
      if (r <= 0) return NATURAL_WEIGHTS[i].v;
    }
    return 1;
  }

  function shellsFor(value) {
    const up = value === 8 ? 0 : value;
    const arr = [false, false, false, false];
    const pos = [0, 1, 2, 3].sort(function () { return Math.random() - 0.5; });
    for (let i = 0; i < up; i++) arr[pos[i]] = true;
    return arr;
  }

  /* One compassionate reroll when the first result yields no legal moves */
  function smartRoll(side, state) {
    const v1 = weightedRoll();
    if (legalMovesFor(side, state, v1).length > 0) return v1;
    return weightedRoll();
  }

  /* ---------------------------------------------------------
     3. GAME STATE
  --------------------------------------------------------- */
  function freshToken(side, id) {
    return {
      id: id,
      side: side,
      pathNum: SIDE_PATH[side],
      pathIdx: -1,    // -1 = not yet on board (at home tray)
      home: false     // true = reached (2,2) = won this token
    };
  }

  function newGame() {
    return {
      tokens: {
        player: [0, 1, 2, 3].map(function (i) { return freshToken('player', 'p-' + i); }),
        kreedu: [0, 1, 2, 3].map(function (i) { return freshToken('kreedu', 'k-' + i); })
      },
      turn: 'player',
      shells: [false, false, false, false],
      rollValue: null,
      phase: 'ready',     // 'ready' | 'choose' | 'over'
      legalMoves: [],
      winner: null,
      winReason: null,    // 'home' | 'strategic'
      log: [],
      /* Global per-side inner-circle unlock flags */
      captured: { player: false, kreedu: false }
    };
  }

  /* ---------------------------------------------------------
     4. INNER-CIRCLE GATE
     Returns true if the move from → to is permitted.
     Rule: crossing from outer (≤15) into inner (≥16)
           requires side.captured === true.
  --------------------------------------------------------- */
  function innerGateOK(side, from, to, capFlags) {
    if (to <= OUTER_MAX_IDX) return true;    // stays in outer — always OK
    if (from >= INNER_MIN_IDX) return true;  // already in inner — continue
    return capFlags[side] === true;           // crossing the boundary
  }

  /* ---------------------------------------------------------
     5. LEGAL-MOVE GENERATION
     Every call produces ALL legal actions for `side`:
       (a) entry moves  — one per nest token (if entry square free or safe)
       (b) on-board moves — one per token that can legally advance
     Both types are ALWAYS considered together so the player
     gets the full choice.
  --------------------------------------------------------- */
  function legalMovesFor(side, state, value) {
    const oppSide = side === 'player' ? 'kreedu' : 'player';
    const mine = state.tokens[side];
    const theirs = state.tokens[oppSide];
    const pathNum = SIDE_PATH[side];
    const capFlags = state.captured;
    const moves = [];

    mine.forEach(function (t, idx) {
      if (t.home) return;   // already home, skip

      /* ── (a) ENTRY: token is in the starting tray ── */
      if (t.pathIdx === -1) {
        const entryIdx = 0;
        /* Safe houses allow stacking: skip own-token blocking check
           for the entry square (it is always a safe house).         */
        const cap = findCapture(side, theirs, entryIdx);
        moves.push({ tokenIndex: idx, from: -1, to: entryIdx, capture: cap });
        return;
      }

      /* ── (b) ON-BOARD: try to advance ── */
      const dest = t.pathIdx + value;
      if (dest > HOME_IDX) return;    // overshoot — illegal

      /* Inner-circle gate */
      if (!innerGateOK(side, t.pathIdx, dest, capFlags)) return;

      /* Blocked by own token — EXCEPT on safe houses */
      if (dest < HOME_IDX && !destIsSafeHouse(pathNum, dest)) {
        if (mine.some(function (ot, oi) {
          return oi !== idx && ot.pathIdx === dest && !ot.home;
        })) return;
      }

      const cap = dest === HOME_IDX ? null : findCapture(side, theirs, dest);
      moves.push({ tokenIndex: idx, from: t.pathIdx, to: dest, capture: cap });
    });

    return moves;
  }

  /* Returns the index into theirs[] of an opponent token sharing
     the same physical cell as destIdx on this side's path, or null.
     Captures are impossible on safe squares.                        */
  function findCapture(side, theirs, destIdx) {
    if (destIdx === HOME_IDX) return null;
    const pathNum = SIDE_PATH[side];
    const destCell = pathCell(pathNum, destIdx);
    if (!destCell) return null;
    if (isSafe(destCell.r, destCell.c)) return null;   // safe house → no capture

    const oppPathNum = SIDE_PATH[side === 'player' ? 'kreedu' : 'player'];

    const idx = theirs.findIndex(function (ot) {
      if (ot.pathIdx < 0 || ot.home) return false;
      const otCell = pathCell(oppPathNum, ot.pathIdx);
      return otCell && otCell.r === destCell.r && otCell.c === destCell.c;
    });
    return idx >= 0 ? idx : null;
  }

  /* ---------------------------------------------------------
     6. APPLY MOVE
  --------------------------------------------------------- */
  function applyMove(state, side, tokenIndex, dest) {
    const oppSide = side === 'player' ? 'kreedu' : 'player';
    const token = state.tokens[side][tokenIndex];
    token.pathIdx = dest;
    let captured = false;

    if (dest === HOME_IDX) {
      token.home = true;
    } else {
      const capIdx = findCapture(side, state.tokens[oppSide], dest);
      if (capIdx != null) {
        state.tokens[oppSide][capIdx].pathIdx = -1;
        state.tokens[oppSide][capIdx].home = false;
        captured = true;
        state.captured[side] = true;   // unlock inner circle for this side
      }
    }

    checkWin(state);
    return { captured: captured, reachedHome: dest === HOME_IDX };
  }

  /* ---------------------------------------------------------
     7. WIN CONDITIONS
     A. Traditional:  all 4 tokens reach home (2,2).
     B. Strategic:    all 4 own tokens in inner circle (≥16 or home)
                      AND opponent has no inner-circle tokens
                      AND opponent cannot possibly capture any of ours.
  --------------------------------------------------------- */
  function checkWin(state) {
    if (state.winner) return;

    ['player', 'kreedu'].forEach(function (side) {
      if (state.winner) return;
      const mine = state.tokens[side];
      const oppSide = side === 'player' ? 'kreedu' : 'player';
      const theirs = state.tokens[oppSide];

      /* ── Condition A ── */
      if (mine.every(function (t) { return t.home; })) {
        state.winner = side;
        state.winReason = 'home';
        state.phase = 'over';
        return;
      }

      /* ── Condition B (Strategic win) ── */
      // PREREQUISITE: opponent must have NEVER captured (captured flag = false).
      // If the opponent has captured at least once, they have inner-circle access
      // and can still threaten our tokens — strategic win is not available;
      // only the traditional all-home win (Condition A) can apply.
      if (state.captured[oppSide] === true) return;

      // All 4 of our tokens must be in the inner circle (or home)
      const allInner = mine.every(function (t) {
        return t.home || isInInner(t.pathIdx);
      });
      if (!allInner) return;

      // Opponent must have NO tokens in the inner circle
      const oppHasInner = theirs.some(function (t) {
        return !t.home && isInInner(t.pathIdx);
      });
      if (oppHasInner) return;

      // Opponent must have no possible capture against any of our tokens
      if (!canOppCapture(side, state)) {
        state.winner = side;
        state.winReason = 'strategic';
        state.phase = 'over';
      }
    });
  }

  /* Returns true if the opponent of `side` could land on any of
     side's tokens with any valid roll (1,2,3,4,8).
     Nest tokens (pathIdx === -1) can only enter at index 0 which
     is a safe house → they can never capture on entry, so we skip them. */
  function canOppCapture(side, state) {
    const oppSide = side === 'player' ? 'kreedu' : 'player';
    const mine = state.tokens[side];
    const theirs = state.tokens[oppSide];
    const oppPathNum = SIDE_PATH[oppSide];

    // Build set of physical cells our tokens occupy (only capturable ones)
    const ourCells = {};
    mine.forEach(function (t) {
      if (t.home || t.pathIdx < 0) return;
      const cell = pathCell(SIDE_PATH[side], t.pathIdx);
      if (cell && !isSafe(cell.r, cell.c)) {
        ourCells[cellKey(cell.r, cell.c)] = true;
      }
    });

    const ROLLS = [1, 2, 3, 4, 8];

    return theirs.some(function (ot) {
      if (ot.home) return false;
      // Nest token: can only move to entry square (safe house) → no capture
      if (ot.pathIdx === -1) return false;

      return ROLLS.some(function (roll) {
        const trial = ot.pathIdx + roll;
        if (trial > HOME_IDX) return false;
        // The opponent's move must be legal under the inner-circle gate.
        // If they haven't captured yet, they cannot cross outer→inner,
        // so those simulated landings are not real threats.
        if (!innerGateOK(oppSide, ot.pathIdx, trial, state.captured)) return false;
        const cell = pathCell(oppPathNum, trial);
        if (!cell || isSafe(cell.r, cell.c)) return false;
        return !!ourCells[cellKey(cell.r, cell.c)];
      });
    });
  }

  function extraTurnGranted(rollValue, captured) {
    return rollValue === 4 || rollValue === 8 || captured;
  }

  /* ---------------------------------------------------------
     8. KREEDU AI
     Priority: capture > reach home > enter inner (if allowed)
               > advance furthest > safer square
  --------------------------------------------------------- */
  function destRisk(side, destIdx, opponents) {
    if (destIdx === HOME_IDX) return 0;
    const pathNum = SIDE_PATH[side];
    const destCell = pathCell(pathNum, destIdx);
    if (!destCell || isSafe(destCell.r, destCell.c)) return 0;
    const oppPathNum = SIDE_PATH[side === 'player' ? 'kreedu' : 'player'];
    let risk = 0;
    opponents.forEach(function (ot) {
      if (ot.pathIdx < 0 || ot.home) return;
      [1, 2, 3, 4, 8].forEach(function (step) {
        const trial = pathCell(oppPathNum, ot.pathIdx + step);
        if (trial && trial.r === destCell.r && trial.c === destCell.c) risk++;
      });
    });
    return risk;
  }

  function chooseKreeduMove(moves, state) {
    if (!moves.length) return null;

    // 1. Prefer captures
    const capturing = moves.filter(function (m) { return m.capture != null; });
    const pool = capturing.length ? capturing : moves;

    // 2. Prefer going home
    const goingHome = pool.filter(function (m) { return m.to === HOME_IDX; });
    if (goingHome.length) return goingHome[0];

    // 3. Furthest advancement (inner-circle moves naturally score higher)
    const maxTo = Math.max.apply(null, pool.map(function (m) { return m.to; }));
    const advanced = pool.filter(function (m) { return m.to === maxTo; });
    if (advanced.length === 1) return advanced[0];

    // 4. Tie-break: least risk
    const scored = advanced.map(function (m) {
      return { m: m, risk: destRisk('kreedu', m.to, state.tokens.player) };
    });
    scored.sort(function (a, b) { return a.risk - b.risk; });
    return scored[0].m;
  }

  /* ---------------------------------------------------------
     9. STYLES — scoped to .ashta-wrap
  --------------------------------------------------------- */
  const STYLE_ID = 'ashta-chamma-styles-v21';
  const CSS = `
  .ashta-wrap{ text-align:left; }
  .ashta-status{
    display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;
    background:var(--marigold); color:var(--ink);
    border:var(--bw) solid var(--maroon); border-radius:var(--radius);
    padding:13px 18px; font-weight:800; font-size:14.5px; margin-bottom:18px;
  }
  .ashta-status-msg{ display:flex; align-items:center; gap:10px; }
  .ashta-status-icon{ font-size:19px; line-height:1; }
  .ashta-again-btn{
    border:2.5px solid var(--maroon); background:var(--paper); color:var(--maroon);
    font-family:'Manrope',sans-serif; font-weight:800; font-size:12.5px;
    padding:8px 14px; border-radius:8px; cursor:pointer;
  }
  .ashta-layout{ display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start; }
  .ashta-board-col{ flex:1 1 360px; display:flex; flex-direction:column; align-items:center; gap:10px; }
  .ashta-side-col{ flex:0 0 260px; min-width:240px; display:flex; flex-direction:column; gap:16px; }

  .ashta-tray{
    width:100%; max-width:346px;
    background:var(--paper-deep); border:var(--bw) solid var(--maroon); border-radius:12px;
    padding:9px 14px; display:flex; align-items:center; gap:12px;
  }
  .ashta-tray-label{ font-family:'Fraunces',serif; font-weight:800; font-size:12.5px; color:var(--maroon); flex-shrink:0; }
  .ashta-tray-slots{ display:flex; gap:8px; flex-wrap:wrap; }
  .ashta-slot{
    width:24px; height:24px; border-radius:50%; border:2.2px dashed var(--ink-soft);
    display:flex; align-items:center; justify-content:center;
  }

  .ashta-board{
    display:grid; grid-template-columns:repeat(5,1fr); grid-template-rows:repeat(5,1fr);
    width:346px; height:346px; gap:2px;
    background:var(--maroon); border:var(--bw) solid var(--maroon); border-radius:10px; overflow:hidden;
  }
  .ashta-cell{
    background:var(--paper-deep); position:relative;
    display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:2px; padding:2px;
  }
  .ashta-cell.void-cell{ background:var(--paper); }
  .ashta-cell.safe-cell{ background:var(--blue); }
  .ashta-cell.safe-cell::before, .ashta-cell.safe-cell::after{
    content:''; position:absolute; width:150%; height:2.4px;
    background:rgba(255,255,255,0.5); top:50%; left:-25%; pointer-events:none;
  }
  .ashta-cell.safe-cell::before{ transform:rotate(45deg); }
  .ashta-cell.safe-cell::after{ transform:rotate(-45deg); }
  .ashta-cell.home-cell{ background:var(--marigold); }
  .ashta-cell.p-start{ outline:3px solid var(--terracotta); outline-offset:-4px; }
  .ashta-cell.k-start{ outline:3px solid var(--teal); outline-offset:-4px; }

  .ashta-token{
    width:18px; height:18px; border-radius:50%;
    border:2px solid var(--maroon); flex-shrink:0; cursor:default;
    transition:transform .1s ease;
  }
  .ashta-cell.home-cell .ashta-token{ width:11px; height:11px; border-width:1.4px; }
  .ashta-token.player{ background:var(--terracotta); }
  .ashta-token.kreedu{ background:var(--teal); }
  .ashta-token.selectable{ cursor:pointer; outline:2.4px dashed var(--maroon); outline-offset:2px; }
  .ashta-token.selectable:hover{ transform:scale(1.2); }

  .ashta-map-caption{ font-size:11.5px; font-weight:700; color:var(--ink-soft); text-align:center; }

  .ashta-panel{ background:var(--paper-deep); border:var(--bw) solid var(--maroon); border-radius:var(--radius); padding:16px 18px; }
  .ashta-panel h3{ font-family:'Fraunces',serif; font-size:15px; margin:0 0 12px; color:var(--maroon); font-weight:800; }

  .ashta-shells{ display:flex; gap:10px; justify-content:center; margin-bottom:14px; }
  .ashta-shell{ width:32px; height:32px; }

  .ashta-roll-btn{ padding:13px; font-size:15px; }
  .ashta-roll-btn:disabled{ opacity:.45; cursor:default; transform:none !important; }

  .ashta-score-row{
    display:flex; align-items:center; justify-content:space-between;
    font-size:12.5px; font-weight:800; color:var(--ink);
    background:var(--paper); border:2px solid var(--maroon); border-radius:8px;
    padding:6px 12px; margin-bottom:8px;
  }
  .ashta-score-right{ display:flex; gap:6px; align-items:center; }
  .ashta-score-pips{ display:flex; gap:4px; }
  .ashta-pip{ width:10px; height:10px; border-radius:50%; border:1.5px solid var(--maroon); }
  .ashta-pip.on.player{ background:var(--terracotta); }
  .ashta-pip.on.kreedu{ background:var(--teal); }
  .ashta-inner-badge{
    font-size:10px; font-weight:800; letter-spacing:.2px;
    padding:2px 6px; border-radius:5px; border:1.5px solid var(--maroon);
  }
  .ashta-inner-badge.unlocked{ background:var(--green); color:var(--paper); }
  .ashta-inner-badge.locked{ background:var(--paper); color:var(--ink-soft); }

  .ashta-log{ list-style:none; margin:0; padding:0; max-height:150px; overflow-y:auto;
    display:flex; flex-direction:column-reverse; gap:6px; }
  .ashta-log li{ font-size:12px; font-weight:600; color:var(--ink-soft);
    border-bottom:2px dashed var(--maroon); padding-bottom:6px; }
  .ashta-log li:last-child{ border-bottom:none; padding-bottom:0; }
  .ashta-log:empty::before{ content:'Nothing yet \u2014 throw the shells to begin.';
    font-size:12px; color:var(--ink-soft); font-weight:600; }

  .ashta-legend{ display:flex; flex-direction:column; gap:8px; font-size:12px; font-weight:700; color:var(--ink-soft); }
  .ashta-legend-row{ display:flex; align-items:center; gap:8px; }
  .ashta-legend-swatch{ width:14px; height:14px; border-radius:4px; border:2px solid var(--maroon); flex-shrink:0; }

  @media (max-width:760px){
    .ashta-side-col{ flex:1 1 100%; }
    .ashta-board{ width:100%; max-width:346px; height:auto; aspect-ratio:1/1; }
  }
  `;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------------------------------------------------------
     10. SVG / label helpers
  --------------------------------------------------------- */
  function shellSvg(isUp) {
    const fill = isUp ? 'var(--marigold)' : 'var(--paper-deep)';
    return '<svg class="ashta-shell" viewBox="0 0 24 24" fill="none"' +
      ' stroke="var(--maroon)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<ellipse cx="12" cy="12" rx="9" ry="6" fill="' + fill + '"/>' +
      '<path d="M5 12c3-1.4 11-1.4 14 0"/></svg>';
  }

  function labelForValue(v) {
    if (v === 4) return 'Chamma (4)';
    if (v === 8) return 'Ashta (8)';
    return String(v);
  }

  /* ---------------------------------------------------------
     11. MODULE STATE
  --------------------------------------------------------- */
  let root = null;
  let state = null;
  let timer = null;
  let destroyed = true;

  function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
  function addLog(msg) {
    state.log.push(msg);
    if (state.log.length > 30) state.log.shift();
  }

  /* ---------------------------------------------------------
     12. BOARD GEOMETRY (cell meta for CSS classes)
  --------------------------------------------------------- */
  function buildCellMeta() {
    const meta = {};
    [1, 2, 3, 4].forEach(function (pn) {
      PATHS[pn].forEach(function (cell) {
        const k = cellKey(cell.r, cell.c);
        if (!meta[k]) meta[k] = true;
      });
    });
    return meta;
  }
  const CELL_META = buildCellMeta();

  /* ---------------------------------------------------------
     13. SKELETON HTML
  --------------------------------------------------------- */
  function skeleton() {
    return (
      '<div class="ashta-wrap">' +
      '<div class="ashta-status">' +
      '<div class="ashta-status-msg"><span class="ashta-status-icon">\uD83C\uDFB2</span>' +
      '<span id="ashta-status-text">Your move \u2014 throw the shells.</span></div>' +
      '<button class="ashta-again-btn" id="ashta-again-btn" style="display:none;">Play again</button>' +
      '</div>' +
      '<div class="ashta-layout">' +
      '<div class="ashta-board-col">' +
      '<div class="ashta-tray" id="ashta-tray-kreedu">' +
      '<div class="ashta-tray-label">Kreedu\u2019s tokens</div>' +
      '<div class="ashta-tray-slots" id="ashta-slots-kreedu"></div>' +
      '</div>' +
      '<div class="ashta-board" id="ashta-board"></div>' +
      '<div class="ashta-tray" id="ashta-tray-player">' +
      '<div class="ashta-tray-label">Your tokens</div>' +
      '<div class="ashta-tray-slots" id="ashta-slots-player"></div>' +
      '</div>' +
      '<div class="ashta-map-caption">' +
      'terracotta \u00b7 you (bottom) \u00b7 teal \u00b7 Kreedu (top) \u00b7 \u2715 squares are safe' +
      '</div>' +
      '</div>' +
      '<div class="ashta-side-col">' +
      '<div class="ashta-panel">' +
      '<h3>Score</h3>' +
      '<div class="ashta-score-row"><span>You</span>' +
      '<div class="ashta-score-right">' +
      '<div class="ashta-score-pips" id="score-player"></div>' +
      '<span class="ashta-inner-badge locked" id="badge-player">outer</span>' +
      '</div>' +
      '</div>' +
      '<div class="ashta-score-row"><span>Kreedu</span>' +
      '<div class="ashta-score-right">' +
      '<div class="ashta-score-pips" id="score-kreedu"></div>' +
      '<span class="ashta-inner-badge locked" id="badge-kreedu">outer</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="ashta-panel">' +
      '<h3>Cowrie shells</h3>' +
      '<div class="ashta-shells" id="ashta-shells"></div>' +
      '<button class="play-btn ashta-roll-btn" id="ashta-roll-btn">\u25b6 Throw shells</button>' +
      '</div>' +
      '<div class="ashta-panel">' +
      '<h3>What\u2019s happened</h3>' +
      '<ul class="ashta-log" id="ashta-log"></ul>' +
      '</div>' +
      '<div class="ashta-panel ashta-legend">' +
      '<h3>Legend</h3>' +
      '<div class="ashta-legend-row"><span class="ashta-legend-swatch" style="background:var(--blue);"></span>Safe \u2014 stacking OK, no captures</div>' +
      '<div class="ashta-legend-row"><span class="ashta-legend-swatch" style="background:var(--marigold);"></span>Home \u2014 reach exactly</div>' +
      '<div class="ashta-legend-row"><span class="ashta-legend-swatch" style="background:var(--terracotta);"></span>Your token</div>' +
      '<div class="ashta-legend-row"><span class="ashta-legend-swatch" style="background:var(--teal);"></span>Kreedu\u2019s token</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  /* ---------------------------------------------------------
     14. BOARD RENDERING
  --------------------------------------------------------- */
  function buildBoardCells(boardEl) {
    boardEl.innerHTML = '';
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'ashta-cell';
        cell.dataset.r = r; cell.dataset.c = c;
        const k = cellKey(r, c);
        if (k === '2-2') cell.classList.add('home-cell');
        else if (SAFE_CELLS[k]) cell.classList.add('safe-cell');
        else if (!CELL_META[k]) cell.classList.add('void-cell');
        boardEl.appendChild(cell);
      }
    }
    // Mark start-area cells visually
    const pStart = PATHS[SIDE_PATH.player][0];
    const pEl = boardEl.querySelector('[data-r="' + pStart.r + '"][data-c="' + pStart.c + '"]');
    if (pEl) pEl.classList.add('p-start');
    const kStart = PATHS[SIDE_PATH.kreedu][0];
    const kEl = boardEl.querySelector('[data-r="' + kStart.r + '"][data-c="' + kStart.c + '"]');
    if (kEl) kEl.classList.add('k-start');
  }

  function makePip(side, filled) {
    const pip = document.createElement('div');
    pip.className = 'ashta-pip' + (filled ? ' on ' + side : '');
    return pip;
  }

  function makeTokenEl(side, idx, selectable) {
    const d = document.createElement('div');
    d.className = 'ashta-token ' + side + (selectable ? ' selectable' : '');
    d.dataset.side = side;
    d.dataset.idx = idx;
    return d;
  }

  function render() {
    if (!root || !state) return;

    /* ── Status bar ── */
    const statusText = root.querySelector('#ashta-status-text');
    const againBtn = root.querySelector('#ashta-again-btn');

    if (state.winner) {
      let msg;
      if (state.winner === 'player') {
        msg = state.winReason === 'strategic'
          ? '\uD83C\uDFC6 Strategic win! All your tokens control the inner circle!'
          : '\uD83C\uDFC6 You brought all your tokens home! You win!';
      } else {
        msg = state.winReason === 'strategic'
          ? '\uD83C\uDFC6 Kreedu wins strategically \u2014 its tokens dominate the inner circle.'
          : '\uD83C\uDFC6 Kreedu brought all its tokens home. Better luck next time!';
      }
      statusText.textContent = msg;
      againBtn.style.display = '';
    } else if (state.turn === 'kreedu') {
      statusText.textContent = 'Kreedu is thinking\u2026';
      againBtn.style.display = 'none';
    } else if (state.phase === 'choose') {
      statusText.textContent = 'Rolled ' + labelForValue(state.rollValue) + ' \u2014 pick a token to move.';
      againBtn.style.display = 'none';
    } else {
      statusText.textContent = 'Your move \u2014 throw the shells.';
      againBtn.style.display = 'none';
    }

    /* ── Shells ── */
    root.querySelector('#ashta-shells').innerHTML = state.shells.map(shellSvg).join('');

    /* ── Roll button ── */
    root.querySelector('#ashta-roll-btn').disabled =
      !!state.winner || state.turn !== 'player' || state.phase !== 'ready';

    /* ── Score pips + inner-circle badge ── */
    ['player', 'kreedu'].forEach(function (side) {
      const pipsWrap = root.querySelector('#score-' + side);
      pipsWrap.innerHTML = '';
      const homeCount = state.tokens[side].filter(function (t) { return t.home; }).length;
      for (let i = 0; i < 4; i++) pipsWrap.appendChild(makePip(side, i < homeCount));

      const badge = root.querySelector('#badge-' + side);
      if (state.captured[side]) {
        badge.textContent = 'inner \u2713';
        badge.className = 'ashta-inner-badge unlocked';
      } else {
        badge.textContent = 'outer';
        badge.className = 'ashta-inner-badge locked';
      }
    });

    /* ── Board tokens ── */
    const boardEl = root.querySelector('#ashta-board');
    boardEl.querySelectorAll('.ashta-token').forEach(function (t) { t.remove(); });

    ['player', 'kreedu'].forEach(function (side) {
      state.tokens[side].forEach(function (t, idx) {
        if (t.pathIdx < 0 || t.home) return;
        const cell = pathCell(t.pathNum, t.pathIdx);
        if (!cell) return;
        const cellEl = boardEl.querySelector('[data-r="' + cell.r + '"][data-c="' + cell.c + '"]');
        if (!cellEl) return;
        const canPick = state.turn === side && side === 'player' &&
          state.phase === 'choose' &&
          state.legalMoves.some(function (m) { return m.tokenIndex === idx; });
        cellEl.appendChild(makeTokenEl(side, idx, canPick));
      });
      // Render homed tokens at the centre cell
      const homeCount = state.tokens[side].filter(function (t) { return t.home; }).length;
      if (homeCount > 0) {
        const homeEl = boardEl.querySelector('[data-r="2"][data-c="2"]');
        if (homeEl) {
          for (let i = 0; i < homeCount; i++) {
            homeEl.appendChild(makeTokenEl(side, -1, false));
          }
        }
      }
    });

    /* ── Trays (nest) ── */
    ['player', 'kreedu'].forEach(function (side) {
      const slotsWrap = root.querySelector('#ashta-slots-' + side);
      slotsWrap.innerHTML = '';
      state.tokens[side].forEach(function (t, idx) {
        const slot = document.createElement('div');
        slot.className = 'ashta-slot';
        if (t.pathIdx === -1 && !t.home) {
          const canPick = state.turn === side && side === 'player' &&
            state.phase === 'choose' &&
            state.legalMoves.some(function (m) { return m.tokenIndex === idx; });
          slot.appendChild(makeTokenEl(side, idx, canPick));
        }
        slotsWrap.appendChild(slot);
      });
    });

    /* ── Log ── */
    const logEl = root.querySelector('#ashta-log');
    logEl.innerHTML = state.log.slice(-12).map(function (m) {
      return '<li>' + m + '</li>';
    }).join('');
  }

  /* ---------------------------------------------------------
     15. TURN FLOW
  --------------------------------------------------------- */
  function handleRoll() {
    if (!state || state.phase !== 'ready' || state.turn !== 'player' || state.winner) return;

    const value = smartRoll('player', state);
    state.shells = shellsFor(value);
    state.rollValue = value;

    const moves = legalMovesFor('player', state, value);

    if (!moves.length) {
      addLog('You rolled ' + labelForValue(value) + ' \u2014 no legal move.');
      if (value === 4 || value === 8) {
        addLog('Chamma/Ashta with no move \u2014 throw again!');
        state.phase = 'ready';
        render(); return;
      }
      endPlayerTurn(); return;
    }

    state.legalMoves = moves;
    state.phase = 'choose';
    addLog('You rolled ' + labelForValue(value) + ' \u2014 choose a token.');
    render();
  }

  function handleTokenChoice(idx) {
    if (!state || state.phase !== 'choose' || state.turn !== 'player') return;
    const move = state.legalMoves.find(function (m) { return m.tokenIndex === idx; });
    if (!move) return;

    const rollValue = state.rollValue;
    const result = applyMove(state, 'player', idx, move.to);

    if (result.captured) {
      addLog('You captured Kreedu\u2019s token! Inner circle unlocked! \uD83C\uDF89');
    } else if (result.reachedHome) {
      addLog('\uD83C\uDFE0 A token reached home!');
    } else if (move.from === -1) {
      addLog('A new token entered the board.');
    } else {
      addLog('You moved a token.');
    }

    state.legalMoves = [];
    if (state.winner) { render(); return; }

    if (extraTurnGranted(rollValue, result.captured)) {
      addLog('Extra turn!');
      state.phase = 'ready';
      render();
    } else {
      endPlayerTurn();
    }
  }

  function endPlayerTurn() {
    state.phase = 'ready';
    state.turn = 'kreedu';
    state.legalMoves = [];
    render();
    timer = setTimeout(runKreeduTurn, 750);
  }

  function runKreeduTurn() {
    if (destroyed || !state) return;

    const value = smartRoll('kreedu', state);
    state.shells = shellsFor(value);
    state.rollValue = value;
    const moves = legalMovesFor('kreedu', state, value);
    render();

    if (!moves.length) {
      addLog('Kreedu rolled ' + labelForValue(value) + ' \u2014 no legal move.');
      if (value === 4 || value === 8) {
        addLog('Kreedu gets another throw!');
        timer = setTimeout(runKreeduTurn, 950);
        render(); return;
      }
      endKreeduTurn(); return;
    }

    const chosen = chooseKreeduMove(moves, state);
    timer = setTimeout(function () {
      if (destroyed || !state) return;
      const result = applyMove(state, 'kreedu', chosen.tokenIndex, chosen.to);

      if (result.captured) {
        addLog('Kreedu captured your token! Kreedu unlocks inner circle! \uD83D\uDE08');
      } else if (result.reachedHome) {
        addLog('One of Kreedu\u2019s tokens reached home.');
      } else if (chosen.from === -1) {
        addLog('Kreedu brought a new token onto the board.');
      } else {
        addLog('Kreedu moved a token.');
      }

      if (state.winner) { render(); return; }

      if (extraTurnGranted(value, result.captured)) {
        addLog('Kreedu gets an extra turn!');
        timer = setTimeout(runKreeduTurn, 950);
        render();
      } else {
        endKreeduTurn();
      }
    }, 750);
  }

  function endKreeduTurn() {
    state.phase = 'ready';
    state.turn = 'player';
    render();
  }

  function resetGame() {
    clearTimer();
    state = newGame();
    render();
  }

  /* ---------------------------------------------------------
     16. PUBLIC API
  --------------------------------------------------------- */
  function onRootClick(e) {
    const tok = e.target.closest('.ashta-token.selectable');
    if (tok) { handleTokenChoice(parseInt(tok.dataset.idx, 10)); return; }
    if (e.target.closest('#ashta-roll-btn')) { handleRoll(); return; }
    if (e.target.closest('#ashta-again-btn')) { resetGame(); return; }
  }

  function mount(el) {
    ensureStyles();
    root = el;
    destroyed = false;
    root.innerHTML = skeleton();
    buildBoardCells(root.querySelector('#ashta-board'));
    root.addEventListener('click', onRootClick);
    state = newGame();
    render();
  }

  function unmount() {
    destroyed = true;
    clearTimer();
    if (root) {
      root.removeEventListener('click', onRootClick);
      root.innerHTML = '';
    }
    root = null; state = null;
  }

  window.KreedaAshtaChamma = { mount: mount, unmount: unmount };
})();