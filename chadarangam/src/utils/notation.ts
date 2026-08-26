/* Algebraic-ish move notation — ported from legacy-vanilla/app.js `moveText`.
   Chess: standard SAN. Chaturangam: piece-tag + from-to, e.g. "Rt e2-e4". */
import {
  Pos, FILE, RANK, NAME_OF_SQ, LET, P,
  mFrom, mTo, mPromo, mFlag, FLAG_CASTLE, FLAG_EP,
  makeMove, unmakeMove, legalMoves, attacked, kingOf,
} from './chessEngine';
import { PIECE_INFO } from './pieceArt';
import { PieceLetter } from '../types';

export function moveNotation(m: number): string {
  const from = mFrom(m), to = mTo(m), flag = mFlag(m), promo = mPromo(m);
  const pc = Pos.b[from], t = pc > 0 ? pc : -pc;
  const isCap = Pos.b[to] !== 0 || flag === FLAG_EP;
  let s = '';

  if (flag === FLAG_CASTLE) {
    s = FILE(to) === 6 ? 'O-O' : 'O-O-O';
  } else if (Pos.variant === 'chess') {
    if (t === P) {
      if (isCap) s += 'abcdefgh'[FILE(from)] + 'x';
      s += NAME_OF_SQ(to);
      if (promo) s += '=' + LET[promo];
    } else {
      s += LET[t];
      const rivals = legalMoves().filter(x => x !== m && mTo(x) === to && Math.abs(Pos.b[mFrom(x)]) === t);
      if (rivals.length) {
        const sameFile = rivals.some(x => FILE(mFrom(x)) === FILE(from));
        const sameRank = rivals.some(x => RANK(mFrom(x)) === RANK(from));
        s += !sameFile ? 'abcdefgh'[FILE(from)] : (!sameRank ? String(RANK(from) + 1) : NAME_OF_SQ(from));
      }
      if (isCap) s += 'x';
      s += NAME_OF_SQ(to);
    }
  } else {
    const tag = PIECE_INFO.chaturanga[LET[t] as PieceLetter]?.tag ?? LET[t];
    s = tag + ' ' + NAME_OF_SQ(from) + (isCap ? '×' : '–') + NAME_OF_SQ(to);
    if (promo) s += '=Mn';
  }

  makeMove(m);
  const opp = Pos.side;
  const replies = legalMoves();
  const ck = attacked(kingOf(opp), -opp);
  unmakeMove();
  if (ck) s += replies.length ? '+' : '#';
  else if (!replies.length && Pos.variant !== 'chess') s += '⋘';
  return s;
}
