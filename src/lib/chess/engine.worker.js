// Runs the local engine off the main thread so the board stays responsive.
import { evaluatePosition, search } from './engine';

self.onmessage = ({ data }) => {
  const { id, type, fen, timeMs } = data;
  try {
    const result = type === 'eval' ? evaluatePosition(fen, { timeMs }) : search(fen, { timeMs, maxDepth: 5 });
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: String(error?.message ?? error) });
  }
};
