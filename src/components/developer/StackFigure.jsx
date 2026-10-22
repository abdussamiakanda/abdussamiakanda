import { motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { STACK_LAYERS } from '../../lib/developer';

/**
 * "Fig. 3 — The stack": the layers I build across, drawn as stacked plates.
 * A highlight runs down the plates and back, like a request travelling from
 * the interface to the database and returning.
 */
export default function StackFigure() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const n = STACK_LAYERS.length;

  useEffect(() => {
    if (!inView || reduced) return undefined;
    // 0,1,2,3,2,1,0,… down to the data and back up with the response.
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % (2 * n - 2);
      setActive(i < n ? i : 2 * n - 2 - i);
    }, 900);
    return () => clearInterval(id);
  }, [inView, reduced, n]);

  return (
    <div ref={ref} className="relative mx-auto mt-6 max-w-[420px]" role="img" aria-label={`Layers: ${STACK_LAYERS.map((l) => l.layer).join(', ')}`}>
      <ol className="relative space-y-2.5">
        {STACK_LAYERS.map((l, i) => {
          const on = active === i;
          return (
            <li key={l.layer} className="relative" style={{ paddingLeft: `${i * 4}%`, paddingRight: `${(n - 1 - i) * 4}%` }}>
              <motion.div
                animate={{ y: on ? -3 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`rounded-xl border px-4 py-3 transition-colors duration-500 ${
                  on ? 'border-up bg-up-soft shadow-[0_10px_30px_-12px_var(--up)]' : 'border-line bg-bg'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-mono text-[0.65rem] uppercase tracking-[0.12em] ${on ? 'text-up' : 'text-ink-3'}`}>
                    L{i + 1} · {l.layer}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full transition-colors ${on ? 'bg-up' : 'bg-line-strong'}`} />
                </div>
                <p className="mt-1.5 truncate text-sm text-ink">{l.tools.join(' · ')}</p>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
