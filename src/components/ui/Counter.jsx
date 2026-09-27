import { useEffect, useRef } from 'react';
import { useInView } from 'motion/react';
import { animate } from 'animejs';

// Counts up from zero with Anime.js once it scrolls into view.
export default function Counter({ value = 0, duration = 1800, pad = 2, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return undefined;
    const fmt = (n) => String(Math.round(n)).padStart(pad, '0');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = fmt(value);
      return undefined;
    }
    const state = { n: 0 };
    const anim = animate(state, {
      n: value,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = fmt(state.n);
      },
    });
    return () => anim.pause();
  }, [inView, value, duration, pad]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {String(0).padStart(pad, '0')}
    </span>
  );
}
