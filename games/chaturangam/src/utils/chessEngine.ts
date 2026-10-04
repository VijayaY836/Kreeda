/* ============================================================
   KREEDA — Chaturangam & Chess engine (TypeScript port)
   One engine, two rule sets. Chaturanga follows the standard
   Shatranj reconstruction; chess is the full modern game.
   Board: Int8Array(64). index = rank*8 + file, a1 = 0.
   Positive = ivory/white, negative = ebony/black.
   Ported faithfully from the original vanilla-JS engine
   (legacy-vanilla/engine.js) — same algorithms, same behaviour,
   wrapped for use from React instead of DOM-bound app.js.
   ============================================================ */
import { Variant } from '../types';

export const P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6, E = 7, M = 8;
export const LET = ['', 'P', 'N', 'B', 'R', 'Q', 'K', 'E', 'M'];
const TYPE_OF: Record<string, number> = { P: 1, N: 2, B: 3, R: 4, Q: 5, K: 6, E: 7, M: 8 };

export const FILE = (i: number) => i & 7;
export const RANK = (i: number) => i >> 3;
export const SQ = (f: number, r: number) => r * 8 + f;
export const NAME_OF_SQ = (i: number) => 'abcdefgh'[FILE(i)] + (RANK(i) + 1);
const SQ_OF_NAME = (s: string) => SQ('abcdefgh'.indexOf(s[0]), (+s[1]) - 1);

/* ---------- precomputed move targets ---------- */
const KNIGHT_T: number[][] = [], KING_T: number[][] = [], ELEPHANT_T: number[][] = [], DIAG1_T: number[][] = [];
const RAYS: { orth: number[][]; diag: number[][] }[] = [];
const DIR_ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIR_DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const DIR_ALL = DIR_ORTH.concat(DIR_DIAG);
(function precompute() {
  const off = (f: number, r: number) => (f >= 0 && f < 8 && r >= 0 && r < 8) ? SQ(f, r) : -1;
  for (let i = 0; i < 64; i++) {
    const f = FILE(i), r = RANK(i);
    KNIGHT_T[i] = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
      .map(([a, b]) => off(f + a, r + b)).filter(s => s >= 0);
    KING_T[i] = DIR_ALL.map(([a, b]) => off(f + a, r + b)).filter(s => s >= 0);
    ELEPHANT_T[i] = [[2, 2], [2, -2], [-2, 2], [-2, -2]].map(([a, b]) => off(f + a, r + b)).filter(s => s >= 0);
    DIAG1_T[i] = DIR_DIAG.map(([a, b]) => off(f + a, r + b)).filter(s => s >= 0);
    const orth: number[][] = [], diag: number[][] = [];
    for (const [a, b] of DIR_ORTH) {
      const line: number[] = []; let nf = f + a, nr = r + b;
      while (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) { line.push(SQ(nf, nr)); nf += a; nr += b; }
      if (line.length) orth.push(line);
    }
    for (const [a, b] of DIR_DIAG) {
      const line: number[] = []; let nf = f + a, nr = r + b;
      while (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) { line.push(SQ(nf, nr)); nf += a; nr += b; }
      if (line.length) diag.push(line);
    }
    RAYS[i] = { orth, diag };
  }
})();

/* ---------- Zobrist ---------- */
function rnd32() { return (Math.random() * 4294967296) | 0; }
const Z1: Int32Array[] = [], Z2: Int32Array[] = [];
for (let p = 0; p < 16; p++) {
  Z1[p] = new Int32Array(64); Z2[p] = new Int32Array(64);
  for (let s = 0; s < 64; s++) { Z1[p][s] = rnd32(); Z2[p][s] = rnd32(); }
}
const ZSIDE1 = rnd32(), ZSIDE2 = rnd32();
const ZCAST1 = new Int32Array(16), ZCAST2 = new Int32Array(16);
for (let i = 0; i < 16; i++) { ZCAST1[i] = rnd32(); ZCAST2[i] = rnd32(); }
const ZEP1 = new Int32Array(8), ZEP2 = new Int32Array(8);
for (let i = 0; i < 8; i++) { ZEP1[i] = rnd32(); ZEP2[i] = rnd32(); }
const pIdx = (c: number) => c > 0 ? c - 1 : 7 + (-c);

/* ---------- position ---------- */
interface UndoEntry {
  m: number; captured: number; capSq: number; cast: number; ep: number; half: number;
  k1: number; k2: number; kw: number; kb: number;
}

class Position {
  variant: Variant = 'chess';
  b = new Int8Array(64);
  side = 1;
  cast = 0;
  ep = -1;
  half = 0;
  full = 1;
  k1 = 0; k2 = 0;
  kingSq: [number, number] = [0, 0];
  stack: UndoEntry[] = [];
  keyHist: number[] = [];
}

export const Pos = new Position();

const CHESS_BACK = [R, N, B, Q, K, B, N, R];
const CHAT_BACK = [R, N, E, K, M, E, N, R]; // mirrored — raja faces raja

export { CHESS_BACK, CHAT_BACK };

export function setStart(variant: Variant) {
  Pos.variant = variant;
  Pos.b.fill(0);
  const back = variant === 'chess' ? CHESS_BACK : CHAT_BACK;
  for (let f = 0; f < 8; f++) {
    Pos.b[SQ(f, 0)] = back[f];
    Pos.b[SQ(f, 1)] = P;
    Pos.b[SQ(f, 6)] = -P;
    Pos.b[SQ(f, 7)] = -back[f];
  }
  Pos.side = 1;
  Pos.cast = variant === 'chess' ? 15 : 0;
  Pos.ep = -1; Pos.half = 0; Pos.full = 1;
  Pos.stack.length = 0; Pos.keyHist.length = 0;
  syncKings(); rehash();
  Pos.keyHist.push(Pos.k2);
}

function syncKings() {
  for (let i = 0; i < 64; i++) {
    if (Pos.b[i] === K) Pos.kingSq[0] = i;
    else if (Pos.b[i] === -K) Pos.kingSq[1] = i;
  }
}
function rehash() {
  let a = 0, c = 0;
  for (let i = 0; i < 64; i++) { const p = Pos.b[i]; if (p) { const x = pIdx(p); a ^= Z1[x][i]; c ^= Z2[x][i]; } }
  if (Pos.side < 0) { a ^= ZSIDE1; c ^= ZSIDE2; }
  a ^= ZCAST1[Pos.cast]; c ^= ZCAST2[Pos.cast];
  if (Pos.ep >= 0) { a ^= ZEP1[FILE(Pos.ep)]; c ^= ZEP2[FILE(Pos.ep)]; }
  Pos.k1 = a; Pos.k2 = c;
}

export function loadFEN(fen: string, variant?: Variant) {
  Pos.variant = variant || 'chess';
  Pos.b.fill(0);
  const [pl, st, ca, ep, hm, fm] = fen.trim().split(/\s+/);
  let r = 7, f = 0;
  for (const ch of pl) {
    if (ch === '/') { r--; f = 0; }
    else if (/\d/.test(ch)) f += +ch;
    else {
      const t = TYPE_OF[ch.toUpperCase()];
      Pos.b[SQ(f, r)] = ch === ch.toUpperCase() ? t : -t;
      f++;
    }
  }
  Pos.side = st === 'w' ? 1 : -1;
  Pos.cast = 0;
  if (ca && ca !== '-') {
    if (ca.includes('K')) Pos.cast |= 1;
    if (ca.includes('Q')) Pos.cast |= 2;
    if (ca.includes('k')) Pos.cast |= 4;
    if (ca.includes('q')) Pos.cast |= 8;
  }
  Pos.ep = (ep && ep !== '-') ? SQ_OF_NAME(ep) : -1;
  Pos.half = hm ? +hm : 0;
  Pos.full = fm ? +fm : 1;
  Pos.stack.length = 0; Pos.keyHist.length = 0;
  syncKings(); rehash();
  Pos.keyHist.push(Pos.k2);
}

/* ---------- move encoding ----------
   bits 0-5 from, 6-11 to, 12-15 promo type, 16-18 flag
   flag: 0 quiet/capture, 1 double push, 2 en passant, 3 castle */
export const FLAG_DOUBLE = 1, FLAG_EP = 2, FLAG_CASTLE = 3;
export const mk = (f: number, t: number, promo?: number, flag?: number) => f | (t << 6) | ((promo || 0) << 12) | ((flag || 0) << 16);
export const mFrom = (m: number) => m & 63;
export const mTo = (m: number) => (m >>> 6) & 63;
export const mPromo = (m: number) => (m >>> 12) & 15;
export const mFlag = (m: number) => (m >>> 16) & 7;

/* ---------- attack detection ---------- */
export function attacked(sq: number, by: number): boolean {
  const b = Pos.b;
  for (const s of KNIGHT_T[sq]) if (b[s] === by * N) return true;
  for (const s of KING_T[sq]) if (b[s] === by * K) return true;
  if (Pos.variant === 'chess') {
    for (const line of RAYS[sq].orth) {
      for (const s of line) { const p = b[s]; if (p) { if (p === by * R || p === by * Q) return true; break; } }
    }
    for (const line of RAYS[sq].diag) {
      for (const s of line) { const p = b[s]; if (p) { if (p === by * B || p === by * Q) return true; break; } }
    }
  } else {
    for (const line of RAYS[sq].orth) {
      for (const s of line) { const p = b[s]; if (p) { if (p === by * R) return true; break; } }
    }
    for (const s of DIAG1_T[sq]) if (b[s] === by * M) return true;
    for (const s of ELEPHANT_T[sq]) if (b[s] === by * E) return true;
  }
  const r = RANK(sq), f = FILE(sq), br = r - by;
  if (br >= 0 && br < 8) {
    if (f > 0 && b[SQ(f - 1, br)] === by * P) return true;
    if (f < 7 && b[SQ(f + 1, br)] === by * P) return true;
  }
  return false;
}
export const kingOf = (side: number) => Pos.kingSq[side > 0 ? 0 : 1];
export const inCheck = (side: number) => attacked(kingOf(side), -side);

/* ---------- move generation (pseudo-legal) ---------- */
export function genMoves(out: number[], capturesOnly?: boolean): number[] {
  out.length = 0;
  const b = Pos.b, side = Pos.side, chess = Pos.variant === 'chess';
  const promos = chess ? [Q, R, B, N] : [M];
  for (let i = 0; i < 64; i++) {
    const pc = b[i];
    if (!pc || (pc > 0) !== (side > 0)) continue;
    const t = pc > 0 ? pc : -pc;
    switch (t) {
      case P: {
        const r = RANK(i), f = FILE(i);
        const fr = r + side;
        const last = side > 0 ? 7 : 0;
        if (!capturesOnly && fr >= 0 && fr < 8 && !b[SQ(f, fr)]) {
          if (fr === last) { for (const pr of promos) out.push(mk(i, SQ(f, fr), pr, 0)); }
          else {
            out.push(mk(i, SQ(f, fr), 0, 0));
            const start = side > 0 ? 1 : 6;
            if (chess && r === start && !b[SQ(f, r + 2 * side)]) out.push(mk(i, SQ(f, r + 2 * side), 0, FLAG_DOUBLE));
          }
        }
        for (const df of [-1, 1]) {
          const nf = f + df;
          if (nf < 0 || nf > 7 || fr < 0 || fr > 7) continue;
          const to = SQ(nf, fr), tp = b[to];
          if (tp && (tp > 0) !== (side > 0)) {
            if (fr === last) { for (const pr of promos) out.push(mk(i, to, pr, 0)); }
            else out.push(mk(i, to, 0, 0));
          } else if (chess && to === Pos.ep) {
            out.push(mk(i, to, 0, FLAG_EP));
          }
        }
        break;
      }
      case N: for (const s of KNIGHT_T[i]) { const tp = b[s]; if (tp && (tp > 0) === (side > 0)) continue; if (capturesOnly && !tp) continue; out.push(mk(i, s, 0, 0)); } break;
      case K: for (const s of KING_T[i]) { const tp = b[s]; if (tp && (tp > 0) === (side > 0)) continue; if (capturesOnly && !tp) continue; out.push(mk(i, s, 0, 0)); } break;
      case M: for (const s of DIAG1_T[i]) { const tp = b[s]; if (tp && (tp > 0) === (side > 0)) continue; if (capturesOnly && !tp) continue; out.push(mk(i, s, 0, 0)); } break;
      case E: for (const s of ELEPHANT_T[i]) { const tp = b[s]; if (tp && (tp > 0) === (side > 0)) continue; if (capturesOnly && !tp) continue; out.push(mk(i, s, 0, 0)); } break;
      case R: case B: case Q: {
        const lines = t === R ? RAYS[i].orth : t === B ? RAYS[i].diag : RAYS[i].orth.concat(RAYS[i].diag);
        for (const line of lines) {
          for (const s of line) {
            const tp = b[s];
            if (tp) { if ((tp > 0) !== (side > 0)) out.push(mk(i, s, 0, 0)); break; }
            if (!capturesOnly) out.push(mk(i, s, 0, 0));
          }
        }
        break;
      }
    }
  }
  if (chess && !capturesOnly) {
    const home = side > 0 ? 0 : 7;
    const kSq = SQ(4, home);
    const kBit = side > 0 ? 1 : 4, qBit = side > 0 ? 2 : 8;
    if (b[kSq] === side * K && !attacked(kSq, -side)) {
      if ((Pos.cast & kBit) && b[SQ(5, home)] === 0 && b[SQ(6, home)] === 0 && b[SQ(7, home)] === side * R
        && !attacked(SQ(5, home), -side) && !attacked(SQ(6, home), -side))
        out.push(mk(kSq, SQ(6, home), 0, FLAG_CASTLE));
      if ((Pos.cast & qBit) && b[SQ(3, home)] === 0 && b[SQ(2, home)] === 0 && b[SQ(1, home)] === 0 && b[SQ(0, home)] === side * R
        && !attacked(SQ(3, home), -side) && !attacked(SQ(2, home), -side))
        out.push(mk(kSq, SQ(2, home), 0, FLAG_CASTLE));
    }
  }
  return out;
}

const CAST_MASK = new Int8Array(64).fill(15);
CAST_MASK[SQ(4, 0)] = 15 & ~3; CAST_MASK[SQ(0, 0)] = 15 & ~2; CAST_MASK[SQ(7, 0)] = 15 & ~1;
CAST_MASK[SQ(4, 7)] = 15 & ~12; CAST_MASK[SQ(0, 7)] = 15 & ~8; CAST_MASK[SQ(7, 7)] = 15 & ~4;

function xorPiece(p: number, s: number) { const x = pIdx(p); Pos.k1 ^= Z1[x][s]; Pos.k2 ^= Z2[x][s]; }

export function makeMove(m: number) {
  const b = Pos.b, side = Pos.side;
  const from = mFrom(m), to = mTo(m), promo = mPromo(m), flag = mFlag(m);
  const moved = b[from];
  let captured = b[to], capSq = to;
  if (flag === FLAG_EP) { capSq = SQ(FILE(to), RANK(from)); captured = b[capSq]; }

  Pos.stack.push({
    m, captured, capSq, cast: Pos.cast, ep: Pos.ep, half: Pos.half,
    k1: Pos.k1, k2: Pos.k2, kw: Pos.kingSq[0], kb: Pos.kingSq[1],
  });

  if (Pos.ep >= 0) { Pos.k1 ^= ZEP1[FILE(Pos.ep)]; Pos.k2 ^= ZEP2[FILE(Pos.ep)]; }
  Pos.k1 ^= ZCAST1[Pos.cast]; Pos.k2 ^= ZCAST2[Pos.cast];

  if (captured) { xorPiece(captured, capSq); b[capSq] = 0; }
  xorPiece(moved, from); b[from] = 0;
  const placed = promo ? side * promo : moved;
  b[to] = placed; xorPiece(placed, to);

  if (flag === FLAG_CASTLE) {
    const home = side > 0 ? 0 : 7;
    const rf = FILE(to) === 6 ? SQ(7, home) : SQ(0, home);
    const rt = FILE(to) === 6 ? SQ(5, home) : SQ(3, home);
    const rook = b[rf];
    xorPiece(rook, rf); b[rf] = 0;
    b[rt] = rook; xorPiece(rook, rt);
  }

  if ((moved > 0 ? moved : -moved) === K) Pos.kingSq[side > 0 ? 0 : 1] = to;

  Pos.cast &= CAST_MASK[from] & CAST_MASK[to];
  Pos.k1 ^= ZCAST1[Pos.cast]; Pos.k2 ^= ZCAST2[Pos.cast];

  Pos.ep = (flag === FLAG_DOUBLE) ? SQ(FILE(from), RANK(from) + side) : -1;
  if (Pos.ep >= 0) { Pos.k1 ^= ZEP1[FILE(Pos.ep)]; Pos.k2 ^= ZEP2[FILE(Pos.ep)]; }

  Pos.half = (captured || (moved > 0 ? moved : -moved) === P) ? 0 : Pos.half + 1;
  if (side < 0) Pos.full++;
  Pos.side = -side;
  Pos.k1 ^= ZSIDE1; Pos.k2 ^= ZSIDE2;
  Pos.keyHist.push(Pos.k2);
}

export function unmakeMove() {
  const u = Pos.stack.pop()!;
  const m = u.m, b = Pos.b;
  const from = mFrom(m), to = mTo(m), promo = mPromo(m), flag = mFlag(m);
  Pos.side = -Pos.side;
  const side = Pos.side;
  if (side < 0) Pos.full--;
  const moved = promo ? side * P : b[to];
  b[from] = moved; b[to] = 0;
  if (flag === FLAG_CASTLE) {
    const home = side > 0 ? 0 : 7;
    const rf = FILE(to) === 6 ? SQ(7, home) : SQ(0, home);
    const rt = FILE(to) === 6 ? SQ(5, home) : SQ(3, home);
    b[rf] = b[rt]; b[rt] = 0;
  }
  if (u.captured) b[u.capSq] = u.captured;
  Pos.cast = u.cast; Pos.ep = u.ep; Pos.half = u.half;
  Pos.k1 = u.k1; Pos.k2 = u.k2;
  Pos.kingSq[0] = u.kw; Pos.kingSq[1] = u.kb;
  Pos.keyHist.pop();
}

export function legalMoves(): number[] {
  const ms = genMoves([]), out: number[] = [];
  const side = Pos.side;
  for (const m of ms) {
    makeMove(m);
    if (!attacked(kingOf(side), -side)) out.push(m);
    unmakeMove();
  }
  return out;
}

export function perft(d: number): number {
  if (d === 0) return 1;
  let n = 0;
  const side = Pos.side;
  for (const m of genMoves([])) {
    makeMove(m);
    if (!attacked(kingOf(side), -side)) n += perft(d - 1);
    unmakeMove();
  }
  return n;
}

/* ---------- draw / terminal helpers ---------- */
export function bareKing(side: number): boolean {
  for (let i = 0; i < 64; i++) { const p = Pos.b[i]; if (p && (p > 0) === (side > 0) && (p > 0 ? p : -p) !== K) return false; }
  return true;
}
export function insufficientMaterial(): boolean {
  if (Pos.variant !== 'chess') return false;
  const minors: { t: number; c: number; dark: boolean }[] = [];
  for (let i = 0; i < 64; i++) {
    const p = Pos.b[i]; if (!p) continue;
    const t = p > 0 ? p : -p;
    if (t === P || t === R || t === Q) return false;
    if (t !== K) minors.push({ t, c: p > 0 ? 1 : -1, dark: (FILE(i) + RANK(i)) % 2 === 1 });
  }
  if (minors.length <= 1) return true;
  if (minors.length === 2 && minors[0].t === B && minors[1].t === B && minors[0].dark === minors[1].dark) return true;
  return false;
}
export function repetitionCount(): number {
  let n = 0;
  const key = Pos.k2;
  for (let i = Pos.keyHist.length - 2; i >= 0; i--) if (Pos.keyHist[i] === key) n++;
  return n;
}

/* ============================================================
   Evaluation + search
   ============================================================ */
function flipTable(t: number[]): Int16Array {
  const o = new Int16Array(64);
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) o[SQ(f, r)] = t[(7 - r) * 8 + f];
  return o;
}
const PST_P = flipTable([0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0]);
const PST_N = flipTable([-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50]);
const PST_B = flipTable([-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20]);
const PST_R = flipTable([0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0]);
const PST_Q = flipTable([-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20]);
const PST_K_MG = flipTable([-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20]);
const PST_K_EG = flipTable([-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50]);
const PST_E = flipTable([-10, -10, -10, -10, -10, -10, -10, -10, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 0, 10, 15, 15, 10, 0, -10, -10, 0, 10, 15, 15, 10, 0, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -10, -10, -10, -10, -10, -10, -10, -10]);
const PST_M = flipTable([-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 5, 5, 0, 0, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 10, 15, 15, 10, 5, -10, -10, 5, 10, 15, 15, 10, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 0, 0, 5, 5, 0, 0, -10, -20, -10, -10, -10, -10, -10, -10, -20]);

const VAL_CHESS = [0, 100, 320, 330, 500, 900, 0, 0, 0];
const VAL_CHAT = [0, 100, 320, 0, 500, 0, 0, 165, 190];
const PST = [null, PST_P, PST_N, PST_B, PST_R, PST_Q, PST_K_MG, PST_E, PST_M] as (Int16Array | null)[];
const PASSED_BONUS = [0, 8, 14, 24, 44, 78, 120, 0];
const MATE = 30000, INF = 1000000;

let VAL = VAL_CHESS;

function evaluate(): number {
  const b = Pos.b, chess = Pos.variant === 'chess';
  let mg = 0, eg = 0, phase = 0;
  const bishops = [0, 0];
  const pawnFiles = [new Int8Array(8), new Int8Array(8)];
  const pawnSq: number[][] = [[], []];

  for (let i = 0; i < 64; i++) {
    const p = b[i]; if (!p) continue;
    const white = p > 0, t = white ? p : -p;
    const ci = white ? 0 : 1;
    const s = white ? i : SQ(FILE(i), 7 - RANK(i));
    const sign = white ? 1 : -1;
    const v = VAL[t];
    if (t === P) { pawnFiles[ci][FILE(i)]++; pawnSq[ci].push(i); }
    if (t === B) bishops[ci]++;
    if (t !== K && t !== P) phase += (t === Q ? 4 : (t === R ? 2 : 1));
    if (t === K) {
      mg += sign * PST_K_MG[s];
      eg += sign * PST_K_EG[s];
    } else {
      const tab = PST[t];
      const psv = tab ? tab[s] : 0;
      mg += sign * (v + psv);
      eg += sign * (v + (t === P ? psv * 1.4 : psv));
    }
  }

  if (chess) {
    if (bishops[0] >= 2) { mg += 30; eg += 45; }
    if (bishops[1] >= 2) { mg -= 30; eg -= 45; }
    for (let ci = 0; ci < 2; ci++) {
      const sign = ci === 0 ? 1 : -1;
      for (let f = 0; f < 8; f++) {
        const n = pawnFiles[ci][f];
        if (n > 1) { mg -= sign * 12 * (n - 1); eg -= sign * 20 * (n - 1); }
        if (n > 0 && !(f > 0 && pawnFiles[ci][f - 1]) && !(f < 7 && pawnFiles[ci][f + 1])) { mg -= sign * 14 * n; eg -= sign * 18 * n; }
      }
      for (const i of pawnSq[ci]) {
        const f = FILE(i), rel = ci === 0 ? RANK(i) : 7 - RANK(i);
        let passed = true;
        for (const j of pawnSq[1 - ci]) {
          const jf = FILE(j), jrel = ci === 0 ? RANK(j) : 7 - RANK(j);
          if (Math.abs(jf - f) <= 1 && jrel > rel) { passed = false; break; }
        }
        if (passed) { mg += sign * PASSED_BONUS[rel] * 0.5; eg += sign * PASSED_BONUS[rel]; }
      }
    }
    for (let i = 0; i < 64; i++) {
      const p = b[i]; if (!p) continue;
      const t = p > 0 ? p : -p;
      if (t !== R) continue;
      const ci = p > 0 ? 0 : 1, sign = p > 0 ? 1 : -1, f = FILE(i);
      if (!pawnFiles[ci][f]) mg += sign * (pawnFiles[1 - ci][f] ? 12 : 22);
    }
  } else {
    for (let i = 0; i < 64; i++) {
      const p = b[i]; if (!p) continue;
      const t = p > 0 ? p : -p;
      if (t !== P) continue;
      const sign = p > 0 ? 1 : -1, rel = p > 0 ? RANK(i) - 1 : 6 - RANK(i);
      mg += sign * rel * rel * 2;
      eg += sign * rel * rel * 3;
    }
  }

  const maxPhase = 24;
  const ph = Math.min(phase, maxPhase);
  let score = (mg * ph + eg * (maxPhase - ph)) / maxPhase;
  score = score * (100 - Math.min(Pos.half, 100)) / 100;
  return Pos.side > 0 ? score : -score;
}

/* ---------- transposition table ---------- */
const TT_BITS = 20, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
const ttKey = new Int32Array(TT_SIZE);
const ttMove = new Int32Array(TT_SIZE);
const ttScore = new Int32Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Int8Array(TT_SIZE);
export function ttClear() { ttFlag.fill(0); ttKey.fill(0); }

const MAX_PLY = 64;
const killers: [number, number][] = Array.from({ length: MAX_PLY }, () => [0, 0]);
const history = new Int32Array(64 * 64);

const S = { nodes: 0, stop: false, deadline: 0 };

function timeUp(): boolean {
  if (S.stop) return true;
  if ((S.nodes & 1023) === 0 && Date.now() > S.deadline) S.stop = true;
  return S.stop;
}

const MVV = [0, 100, 320, 330, 500, 900, 10000, 165, 190];
function scoreMove(m: number, ttm: number, ply: number): number {
  if (m === ttm) return 1e7;
  const to = mTo(m), from = mFrom(m);
  const victim = Pos.b[to];
  if (victim || mFlag(m) === FLAG_EP) {
    const vt = victim ? (victim > 0 ? victim : -victim) : P;
    const at = Pos.b[from]; const att = at > 0 ? at : -at;
    return 1e6 + MVV[vt] * 16 - MVV[att];
  }
  if (mPromo(m)) return 9e5 + MVV[mPromo(m)];
  if (killers[ply][0] === m) return 8e5;
  if (killers[ply][1] === m) return 7e5;
  return history[from * 64 + to];
}
function sortMoves(ms: number[], ttm: number, ply: number): number[] {
  const sc = ms.map(m => scoreMove(m, ttm, ply));
  const idx = ms.map((_, i) => i).sort((a, b) => sc[b] - sc[a]);
  return idx.map(i => ms[i]);
}

function isDrawn(): boolean {
  if (Pos.variant !== 'chess') return false;
  if (Pos.half >= 100) return true;
  if (repetitionCount() >= 1) return true;
  return insufficientMaterial();
}

function quiesce(alpha: number, beta: number, ply: number): number {
  S.nodes++;
  if (timeUp()) return 0;
  const stand = evaluate();
  if (stand >= beta) return stand;
  if (stand > alpha) alpha = stand;
  const side = Pos.side;
  const ms = sortMoves(genMoves([], true), 0, Math.min(ply, MAX_PLY - 1));
  for (const m of ms) {
    const victim = Pos.b[mTo(m)];
    const vt = victim ? (victim > 0 ? victim : -victim) : (mFlag(m) === FLAG_EP ? P : 0);
    if (vt && stand + MVV[vt] + 200 < alpha) continue;
    makeMove(m);
    if (attacked(kingOf(side), -side)) { unmakeMove(); continue; }
    const sc = -quiesce(-beta, -alpha, ply + 1);
    unmakeMove();
    if (S.stop) return 0;
    if (sc >= beta) return sc;
    if (sc > alpha) alpha = sc;
  }
  return alpha;
}

function hasNonPawn(side: number): boolean {
  for (let i = 0; i < 64; i++) {
    const p = Pos.b[i]; if (!p || (p > 0) !== (side > 0)) continue;
    const t = p > 0 ? p : -p;
    if (t !== P && t !== K) return true;
  }
  return false;
}

function search(depth: number, alpha: number, beta: number, ply: number, canNull: boolean): number {
  if (timeUp()) return 0;
  S.nodes++;

  if (ply > 0 && isDrawn()) return 0;

  if (ply > 0) {
    if (alpha < -MATE + ply) alpha = -MATE + ply;
    if (beta > MATE - ply) beta = MATE - ply;
    if (alpha >= beta) return alpha;
  }

  const side = Pos.side;
  const checked = attacked(kingOf(side), -side);
  if (checked) depth++;

  if (depth <= 0) return quiesce(alpha, beta, ply);

  const ti = Pos.k1 & TT_MASK;
  let ttm = 0;
  if (ttFlag[ti] && ttKey[ti] === Pos.k2) {
    ttm = ttMove[ti];
    if (ply > 0 && ttDepth[ti] >= depth) {
      let sc = ttScore[ti];
      if (sc > MATE - 1000) sc -= ply;
      if (sc < -MATE + 1000) sc += ply;
      const fl = ttFlag[ti];
      if (fl === 1) return sc;
      if (fl === 2 && sc >= beta) return sc;
      if (fl === 3 && sc <= alpha) return sc;
    }
  }

  if (canNull && !checked && depth >= 3 && ply > 0 && hasNonPawn(side) && Math.abs(beta) < MATE - 100) {
    const savedEp = Pos.ep;
    Pos.side = -side; Pos.k1 ^= ZSIDE1; Pos.k2 ^= ZSIDE2;
    if (savedEp >= 0) { Pos.k1 ^= ZEP1[FILE(savedEp)]; Pos.k2 ^= ZEP2[FILE(savedEp)]; Pos.ep = -1; }
    Pos.keyHist.push(Pos.k2);
    const R2 = 2 + (depth > 6 ? 1 : 0);
    const sc = -search(depth - 1 - R2, -beta, -beta + 1, ply + 1, false);
    Pos.keyHist.pop();
    Pos.side = side; Pos.k1 ^= ZSIDE1; Pos.k2 ^= ZSIDE2;
    if (savedEp >= 0) { Pos.ep = savedEp; Pos.k1 ^= ZEP1[FILE(savedEp)]; Pos.k2 ^= ZEP2[FILE(savedEp)]; }
    if (S.stop) return 0;
    if (sc >= beta) return beta;
  }

  const ms = sortMoves(genMoves([]), ttm, Math.min(ply, MAX_PLY - 1));
  let best = -INF, bestMoveFound = 0, legal = 0, moveIdx = 0;
  const alphaOrig = alpha;

  for (const m of ms) {
    makeMove(m);
    if (attacked(kingOf(side), -side)) { unmakeMove(); continue; }
    legal++; moveIdx++;
    const isCap = !!Pos.stack[Pos.stack.length - 1].captured || !!mPromo(m);

    let sc: number;
    if (legal === 1) {
      sc = -search(depth - 1, -beta, -alpha, ply + 1, true);
    } else {
      let red = 0;
      if (depth >= 3 && !isCap && !checked && moveIdx > 3) red = moveIdx > 6 ? 2 : 1;
      sc = -search(depth - 1 - red, -alpha - 1, -alpha, ply + 1, true);
      if (sc > alpha && red) sc = -search(depth - 1, -alpha - 1, -alpha, ply + 1, true);
      if (sc > alpha && sc < beta) sc = -search(depth - 1, -beta, -alpha, ply + 1, true);
    }
    unmakeMove();
    if (S.stop) return 0;

    if (sc > best) {
      best = sc; bestMoveFound = m;
      if (sc > alpha) {
        alpha = sc;
        if (alpha >= beta) {
          if (!isCap) {
            const k = killers[Math.min(ply, MAX_PLY - 1)];
            if (k[0] !== m) { k[1] = k[0]; k[0] = m; }
            history[mFrom(m) * 64 + mTo(m)] += depth * depth;
          }
          break;
        }
      }
    }
  }

  if (!legal) {
    if (checked) return -MATE + ply;
    return Pos.variant === 'chess' ? 0 : -MATE + ply;
  }
  if (Pos.variant !== 'chess' && bareKing(side) && !bareKing(-side)) return -MATE + ply + 1;

  let store = best;
  if (store > MATE - 1000) store += ply;
  if (store < -MATE + 1000) store -= ply;
  ttKey[ti] = Pos.k2; ttMove[ti] = bestMoveFound; ttScore[ti] = store; ttDepth[ti] = depth;
  ttFlag[ti] = best <= alphaOrig ? 3 : (best >= beta ? 2 : 1);
  return best;
}

export const LEVELS: Record<Variant, Record<number, { ms: number; depth: number; noise: number }>> = {
  chess: {
    1: { ms: 120, depth: 2, noise: 70 },
    2: { ms: 600, depth: 8, noise: 0 },
    3: { ms: 1500, depth: 24, noise: 0 },
  },
  chaturanga: {
    1: { ms: 120, depth: 2, noise: 60 },
    2: { ms: 450, depth: 8, noise: 0 },
    3: { ms: 1200, depth: 24, noise: 0 },
  },
};

/** Difficulty labels used across the UI — Sishya (novice), Yodha (warrior), Senapati (general) */
export const LEVEL_NAMES = ['', 'Sishya', 'Yodha', 'Senapati'];

/** Synchronous search — same signature/behaviour as the original engine.
 *  Callers on the main thread should invoke this off the render path
 *  (e.g. via setTimeout) so a "thinking" UI state can paint first. */
export function bestMove(level: number): number | null {
  VAL = Pos.variant === 'chess' ? VAL_CHESS : VAL_CHAT;
  const cfg = LEVELS[Pos.variant][level];
  S.nodes = 0; S.stop = false; S.deadline = Date.now() + cfg.ms;
  history.fill(0);
  for (const k of killers) { k[0] = 0; k[1] = 0; }

  const roots = legalMoves();
  if (!roots.length) return null;
  if (roots.length === 1) return roots[0];

  let best = roots[0], bestScore = 0;
  const scored = new Map<number, number>();

  for (let d = 1; d <= cfg.depth; d++) {
    let alpha = -INF, localBest = 0, localScore = -INF, first = true;
    const ordered = d === 1 ? roots : roots.slice().sort((a, b) => (scored.get(b) ?? -INF) - (scored.get(a) ?? -INF));
    for (const m of ordered) {
      makeMove(m);
      let sc: number;
      if (first) {
        sc = -search(d - 1, -INF, INF, 1, true);
      } else {
        sc = -search(d - 1, -alpha - 1, -alpha, 1, true);
        if (sc > alpha && !S.stop) sc = -search(d - 1, -INF, -alpha, 1, true);
      }
      unmakeMove();
      if (S.stop) break;
      first = false;
      scored.set(m, sc);
      if (sc > localScore) { localScore = sc; localBest = m; }
      if (sc > alpha) alpha = sc;
    }
    if (S.stop || !localBest) break;
    best = localBest; bestScore = localScore;
    if (Math.abs(bestScore) > MATE - 100) break;
    if (Date.now() > S.deadline - cfg.ms * 0.25) break;
  }

  if (cfg.noise) {
    const list = roots.map(m => ({ m, s: (scored.get(m) ?? -INF) + (Math.random() * 2 - 1) * cfg.noise }));
    list.sort((a, b) => b.s - a.s);
    const top = list.filter(x => x.s > list[0].s - 1e-9);
    return top[Math.floor(Math.random() * top.length)].m;
  }
  return best;
}
