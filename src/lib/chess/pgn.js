import { Chess } from 'chess.js';

const FILES = 'abcdefgh';

// PGN headers as a plain object.
export function parseHeaders(pgn = '') {
  const headers = {};
  for (const m of pgn.matchAll(/\[(\w+)\s+"([^"]*)"\]/g)) headers[m[1]] = m[2];
  return headers;
}

/**
 * Loads a PGN into verbose moves. Tries chess.js directly, then a cleaned
 * copy (comments, variations, NAGs and results stripped), then replays SAN
 * tokens one by one, keeping every legal prefix.
 */
export function loadGame(pgn = '') {
  const headers = parseHeaders(pgn);
  const tryLoad = (text) => {
    const game = new Chess();
    try {
      game.loadPgn(text, { strict: false });
      return game.history({ verbose: true });
    } catch {
      return null;
    }
  };

  let moves = tryLoad(pgn);
  if (!moves?.length) {
    let body = pgn.replace(/\[[^\]]*\]/g, '').replace(/\{[^}]*\}/g, '').replace(/\$\d+/g, '');
    let prev;
    do {
      prev = body;
      body = body.replace(/\([^()]*\)/g, '');
    } while (body !== prev);
    body = body.replace(/[?!]+/g, '').replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/, '').replace(/\s+/g, ' ').trim();
    moves = tryLoad(body);

    if (!moves?.length) {
      const game = new Chess();
      moves = [];
      for (const token of body.split(' ')) {
        const san = token.replace(/^\d+\.+/, '');
        if (!san) continue;
        try {
          moves.push(game.move(san));
        } catch {
          break;
        }
      }
    }
  }
  return { moves: moves ?? [], headers };
}

// FEN after the first `ply` moves (0 = start position).
export function fenAt(moves, ply) {
  const game = new Chess();
  for (let i = 0; i < ply && i < moves.length; i++) game.move(moves[i].san);
  return game.fen();
}

export function kingSquares(fen) {
  const out = {};
  new Chess(fen).board().forEach((row, r) =>
    row.forEach((piece, c) => {
      if (piece?.type === 'k') out[piece.color] = `${FILES[c]}${8 - r}`;
    }),
  );
  return out;
}

export const uciOf = (move) => `${move.from}${move.to}${move.promotion ?? ''}`;

// ---- Chess.com results -----------------------------------------------------

const LOSSES = new Set(['checkmated', 'resigned', 'timeout', 'abandoned', 'lose', 'kingofthehill', 'threecheck', 'bughousepartnerlose']);

// 'win' | 'loss' | 'draw' for the given player in a Chess.com game object.
export function outcomeFor(game, username) {
  const me = game.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
  const result = game[me].result;
  if (result === 'win') return 'win';
  if (LOSSES.has(result)) return 'loss';
  return 'draw';
}

const REASONS = {
  win: 'Won',
  checkmated: 'Lost by checkmate',
  resigned: 'Lost by resignation',
  timeout: 'Lost on time',
  abandoned: 'Lost (abandoned)',
  agreed: 'Draw by agreement',
  stalemate: 'Draw by stalemate',
  repetition: 'Draw by repetition',
  insufficient: 'Draw, insufficient material',
  '50move': 'Draw by 50-move rule',
  timevsinsufficient: 'Draw, time vs insufficient material',
};

export function outcomeLabel(game, username) {
  const me = game.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
  const mine = game[me].result;
  if (mine === 'win') {
    const theirs = game[me === 'white' ? 'black' : 'white'].result;
    const how = { checkmated: 'by checkmate', resigned: 'by resignation', timeout: 'on time', abandoned: 'by abandonment' }[theirs];
    return how ? `Won ${how}` : 'Won';
  }
  return REASONS[mine] ?? mine;
}
