// A small chess engine used when the remote bot server is unavailable.
// Negamax with alpha-beta pruning, iterative deepening under a time budget,
// MVV-LVA move ordering and a capture-only quiescence search. Evaluation is
// material plus piece-square tables (Michniewski's "simplified evaluation
// function"). Runs inside a Web Worker (engine.worker.js).
import { Chess } from 'chess.js';

const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const MATE = 100000;

// Tables are from White's point of view, rank 8 first (row 0) to rank 1.
const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

// Static evaluation in centipawns from White's point of view.
export function evaluate(chess) {
  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const v = VALUE[p.type] + (p.color === 'w' ? PST[p.type][r][c] : PST[p.type][7 - r][c]);
      score += p.color === 'w' ? v : -v;
    }
  }
  return score;
}

const orderScore = (m) => (m.captured ? 10 * VALUE[m.captured] - VALUE[m.piece] : 0) + (m.promotion ? VALUE[m.promotion] : 0);
const ordered = (moves) => moves.sort((a, b) => orderScore(b) - orderScore(a));

class Timeout extends Error {}

function makeSearcher(deadline) {
  let nodes = 0;
  const tick = () => {
    if (++nodes % 1024 === 0 && performance.now() > deadline) throw new Timeout();
  };
  const sign = (chess) => (chess.turn() === 'w' ? 1 : -1);

  function quiesce(chess, alpha, beta, depth) {
    tick();
    const stand = sign(chess) * evaluate(chess);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (depth === 0) return alpha;
    for (const m of ordered(chess.moves({ verbose: true }).filter((x) => x.captured || x.promotion))) {
      chess.move(m);
      const score = -quiesce(chess, -beta, -alpha, depth - 1);
      chess.undo();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function negamax(chess, depth, alpha, beta, ply) {
    tick();
    if (chess.isCheckmate()) return -MATE + ply;
    if (chess.isDraw()) return 0;
    if (depth === 0) return quiesce(chess, alpha, beta, 4);
    for (const m of ordered(chess.moves({ verbose: true }))) {
      chess.move(m);
      const score = -negamax(chess, depth - 1, -beta, -alpha, ply + 1);
      chess.undo();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  return { negamax };
}

/**
 * Searches `fen` for up to `timeMs`, deepening one ply at a time.
 * Returns { uci, san, score } with score in centipawns for the side to move
 * (mate scores are ±MATE minus distance), plus the depth reached.
 */
export function search(fen, { timeMs = 1200, maxDepth = 5 } = {}) {
  const chess = new Chess(fen);
  const moves = ordered(chess.moves({ verbose: true }));
  if (!moves.length) return null;

  const deadline = performance.now() + timeMs;
  const { negamax } = makeSearcher(deadline);
  let best = { move: moves[0], score: 0, depth: 0 };

  for (let depth = 1; depth <= maxDepth; depth++) {
    try {
      let alpha = -Infinity;
      let bestHere = null;
      // Search the previous best first so a cut-off iteration still helps.
      const list = [best.move, ...moves.filter((m) => m !== best.move)];
      for (const m of list) {
        chess.move(m);
        const score = -negamax(chess, depth - 1, -Infinity, -alpha, 1);
        chess.undo();
        if (score > alpha) {
          alpha = score;
          bestHere = m;
        }
      }
      best = { move: bestHere, score: alpha, depth };
      if (Math.abs(alpha) > MATE - 100) break; // forced mate found
    } catch (e) {
      if (!(e instanceof Timeout)) throw e;
      break;
    }
  }

  const m = best.move;
  return { uci: `${m.from}${m.to}${m.promotion ?? ''}`, san: m.san, score: best.score, depth: best.depth };
}

// Evaluation of `fen` from White's point of view, in the shape the UI uses.
export function evaluatePosition(fen, { timeMs = 400 } = {}) {
  const chess = new Chess(fen);
  if (chess.isCheckmate()) {
    const whiteWon = chess.turn() === 'b';
    return { white: whiteWon ? 1 : 0, label: '#', mate: true };
  }
  if (chess.isDraw()) return { white: 0.5, label: '0.0', mate: false };

  const result = search(fen, { timeMs, maxDepth: 4 });
  const pov = chess.turn() === 'w' ? 1 : -1;
  const cp = pov * (result?.score ?? evaluate(chess) * pov);
  if (Math.abs(cp) > MATE - 100) {
    const plies = MATE - Math.abs(cp);
    return { white: cp > 0 ? 1 : 0, label: `M${Math.ceil(plies / 2)}`, mate: true };
  }
  // Logistic curve: +4 pawns is roughly a 91% bar for White.
  const white = 1 / (1 + 10 ** (-cp / 400));
  return { white, label: Math.abs(cp / 100).toFixed(1), mate: false };
}
