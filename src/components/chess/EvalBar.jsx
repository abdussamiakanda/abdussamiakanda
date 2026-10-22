import { useEffect, useRef, useState } from 'react';
import { getEvaluation } from '../../lib/chess/service';

/**
 * Vertical evaluation bar. White's share grows from White's side (bottom
 * unless the board is flipped). Requests are debounced and stale answers are
 * dropped, so stepping quickly through a game doesn't queue up evaluations.
 */
export default function EvalBar({ fen, flipped = false, className = '' }) {
  const [evaluation, setEvaluation] = useState({ white: 0.5, label: '0.0', mate: false });
  const [loading, setLoading] = useState(false);
  const token = useRef(0);

  useEffect(() => {
    if (!fen) return undefined;
    const mine = ++token.current;
    setLoading(true);
    const t = setTimeout(() => {
      getEvaluation(fen)
        .then((ev) => {
          if (mine === token.current && ev) setEvaluation(ev);
        })
        .catch(() => {})
        .finally(() => mine === token.current && setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [fen]);

  const pct = Math.round(evaluation.white * 1000) / 10;
  const whiteLeads = evaluation.white >= 0.5;
  // The number sits at the leading side's end of the bar.
  const labelAtBottom = whiteLeads !== flipped;

  // Two digits fit the bar; "12.4" becomes "12" so it is never clipped.
  const shown = !evaluation.mate && evaluation.label.length > 3 ? String(Math.round(parseFloat(evaluation.label))) : evaluation.label;

  return (
    <div
      className={`relative w-4 overflow-hidden rounded-[5px] bg-[#1f2925] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_0_0_1px_rgba(0,0,0,0.45)] sm:w-[1.15rem] ${className}`}
      role="meter"
      aria-label="Engine evaluation"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${whiteLeads ? 'White' : 'Black'} ${evaluation.label}`}
    >
      <div
        className={`absolute inset-x-0 bg-gradient-to-b from-[#f4f6ef] to-[#dfe5d9] transition-[height] duration-700 ease-out-expo ${flipped ? 'top-0' : 'bottom-0'}`}
        style={{ height: `${pct}%` }}
      />
      <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--board-coord)] opacity-40" />
      <span
        className={`absolute inset-x-0 text-center font-mono text-[0.5rem] font-bold tabular-nums leading-none tracking-tight sm:text-[0.55rem] ${
          labelAtBottom ? 'bottom-1.5' : 'top-1.5'
        } ${whiteLeads ? 'text-[#1b2420]' : 'text-[#eef3ef]'} ${loading ? 'opacity-50' : ''}`}
      >
        {shown}
      </span>
    </div>
  );
}
