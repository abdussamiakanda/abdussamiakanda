// Bot moves and position evaluation.
//
// The remote bot (a model trained on Sami's games) is tried first. If it
// fails or times out it is marked unavailable for the rest of the visit and
// the local engine in a Web Worker is used instead, so the board always works.
const REMOTE_BASE = 'https://abdussamiakanda.pythonanywhere.com/chessbot';
const MOVE_URL = import.meta.env.VITE_CHESSBOT_API_URL || `${REMOTE_BASE}/move`;
const EVAL_URL = import.meta.env.VITE_CHESSBOT_EVAL_URL || `${REMOTE_BASE}/eval`;
const TIMEOUT_MS = 8000;

let remoteState = 'unknown'; // 'unknown' | 'up' | 'down'
const listeners = new Set();
const setRemote = (state) => {
  if (remoteState === state) return;
  remoteState = state;
  listeners.forEach((fn) => fn(state));
};

// Subscribe to 'up'/'down' changes; returns an unsubscribe function.
export function onEngineSource(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export const engineSource = () => remoteState;

async function postJson(url, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    // A parked or expired host answers 200 with an HTML page, so insist on JSON.
    if (!res.ok || !res.headers.get('content-type')?.includes('json')) throw new Error(`Bad response ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---- Local engine (lazy Web Worker) ---------------------------------------

let worker;
let nextId = 0;
const pending = new Map();

function local(type, fen, timeMs) {
  if (!worker) {
    worker = new Worker(new URL('./engine.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      const job = pending.get(data.id);
      if (!job) return;
      pending.delete(data.id);
      if (data.error) job.reject(new Error(data.error));
      else job.resolve(data.result);
    };
  }
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, type, fen, timeMs });
  });
}

// ---- Public API -----------------------------------------------------------

/** Best move for the side to move, as UCI ("e2e4", "e7e8q"). */
export async function getBotMove({ fen, uciMoves }) {
  if (remoteState !== 'down') {
    try {
      const data = await postJson(MOVE_URL, {
        model: 'sami',
        moves: uciMoves,
        topk: 0,
        temperature: 0,
        depth: 6,
        max_ms: 500,
        limit_moves: 8,
      });
      if (!data?.best?.uci) throw new Error('No move in response');
      setRemote('up');
      return data.best.uci;
    } catch {
      setRemote('down');
    }
  }
  const result = await local('best', fen, 1400);
  return result?.uci ?? null;
}

/**
 * Evaluation from White's point of view:
 * { white: 0..1 share of the bar, label: "1.4" | "M3" | "#", mate: boolean }
 */
export async function getEvaluation(fen) {
  if (remoteState !== 'down') {
    try {
      const data = await postJson(EVAL_URL, { fen });
      if (data?.eval_pawns === undefined && !data?.bar) throw new Error('No evaluation in response');
      setRemote('up');
      const display = String(data.display ?? '');
      const mate = /^M[+-]?\d*$/.test(display);
      const pawns = Number(data.eval_pawns ?? 0);
      const white = mate
        ? display.startsWith('M+') || pawns > 0
          ? 1
          : 0
        : data.bar?.white ?? 1 / (1 + 10 ** (-pawns / 4));
      return { white, label: mate ? display.replace(/[+-]/, '') : display || Math.abs(pawns).toFixed(1), mate };
    } catch {
      setRemote('down');
    }
  }
  return local('eval', fen, 350);
}
