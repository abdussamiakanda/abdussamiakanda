import { useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * Paired SAN move list with first/prev/next/last controls.
 * `ply` is the number of moves applied to the shown position (0 = start).
 * `times` (optional) holds seconds spent per move.
 */
export default function MoveList({ sans, ply, onPly, times, className = '', emptyLabel = 'No moves yet', latestLabel = 'Last move' }) {
  const listRef = useRef(null);

  // Keep the active move visible by scrolling the list box only. (scrollIntoView
  // would also scroll the page, yanking the window down to the board on load.)
  useEffect(() => {
    const box = listRef.current;
    const item = box?.querySelector('[data-active="true"]');
    if (!box || !item) return;
    const top = item.offsetTop; // box is the offsetParent (position: relative)
    const bottom = top + item.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = top - 8;
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + 8;
  }, [ply]);

  const fmt = (s) => (s === undefined ? '' : s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`);
  const pairs = [];
  for (let i = 0; i < sans.length; i += 2) pairs.push(i);

  const Btn = ({ onClick, disabled, label, children }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="grid h-10 flex-1 place-items-center rounded-xl border border-line text-lg text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line"
    >
      {children}
    </button>
  );

  const Move = ({ index }) => {
    const active = ply === index + 1;
    return (
      <button
        type="button"
        data-active={active}
        onClick={() => onPly(index + 1)}
        className={`flex items-baseline justify-between gap-2 rounded-lg px-2 py-1 text-left font-mono text-[0.82rem] transition-colors ${
          active ? 'bg-up text-on-up' : 'text-ink hover:bg-surface-2'
        }`}
      >
        <span>{sans[index]}</span>
        {times?.[index] !== undefined && <span className={`text-[0.65rem] ${active ? 'opacity-80' : 'text-ink-3'}`}>{fmt(times[index])}</span>}
      </button>
    );
  };

  return (
    <div className={`flex min-h-0 flex-col gap-3 ${className}`}>
      <div className="flex gap-2">
        <Btn onClick={() => onPly(0)} disabled={ply === 0} label="First move (Home)">
          <FiChevronsLeft />
        </Btn>
        <Btn onClick={() => onPly(Math.max(0, ply - 1))} disabled={ply === 0} label="Previous move (←)">
          <FiChevronLeft />
        </Btn>
        <Btn onClick={() => onPly(Math.min(sans.length, ply + 1))} disabled={ply >= sans.length} label="Next move (→)">
          <FiChevronRight />
        </Btn>
        <Btn onClick={() => onPly(sans.length)} disabled={ply >= sans.length} label={`${latestLabel} (End)`}>
          <FiChevronsRight />
        </Btn>
      </div>
      <div ref={listRef} className="relative min-h-0 flex-1 overflow-y-auto rounded-2xl border border-line bg-surface p-2">
        {sans.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-ink-3">{emptyLabel}</p>
        ) : (
          <ol className="grid gap-0.5">
            {pairs.map((i) => (
              <li key={i} className="grid grid-cols-[2.25rem_1fr_1fr] items-center gap-1">
                <span className="text-right font-mono text-[0.72rem] text-ink-3">{i / 2 + 1}.</span>
                <Move index={i} />
                {sans[i + 1] !== undefined ? <Move index={i + 1} /> : <span />}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
