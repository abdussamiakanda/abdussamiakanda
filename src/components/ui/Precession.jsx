import { useEffect, useMemo, useRef } from 'react';
import { useInView } from 'motion/react';
import { createTimeline, svg } from 'animejs';

/**
 * Damped precession of a single magnetic moment (Landau-Lifshitz-Gilbert):
 * the tip spirals around the field axis while the cone angle decays. The
 * trajectory is drawn with Anime.js drawables and the moment vector follows
 * the same parameter.
 */
const SIZE = 320;
const C = SIZE / 2;
const R = 118;
const TURNS = 7;
const STEPS = 700;

const project = (polar, phi) => {
  const x = Math.sin(polar) * Math.cos(phi);
  const y = Math.cos(polar);
  const z = Math.sin(polar) * Math.sin(phi);
  return [C + R * x, C + 34 - R * 0.92 * y + R * 0.32 * z];
};

const pointAt = (u) => {
  const polar0 = (70 * Math.PI) / 180;
  const polar = polar0 * Math.exp(-3.1 * u) + 0.035;
  return project(polar, u * TURNS * Math.PI * 2);
};

const toPath = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');

export default function Precession({ className = '' }) {
  const ref = useRef(null);
  const pathRef = useRef(null);
  const armRef = useRef(null);
  const tipRef = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });

  const spiral = useMemo(() => toPath(Array.from({ length: STEPS + 1 }, (_, i) => pointAt(i / STEPS))), []);
  const rim = useMemo(() => toPath(Array.from({ length: 121 }, (_, i) => project(Math.PI / 2, (i / 120) * Math.PI * 2))), []);
  const origin = [C, C + 34];
  const axisTop = project(0, 0);

  useEffect(() => {
    if (!inView || !pathRef.current) return undefined;
    const setArm = (u) => {
      const [x, y] = pointAt(u);
      armRef.current?.setAttribute('x2', x);
      armRef.current?.setAttribute('y2', y);
      tipRef.current?.setAttribute('cx', x);
      tipRef.current?.setAttribute('cy', y);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setArm(1);
      return undefined;
    }

    const [drawable] = svg.createDrawable(pathRef.current);
    const state = { u: 0 };
    const tl = createTimeline({ loop: true, loopDelay: 600 })
      .add(drawable, { draw: ['0 0', '0 1'], opacity: [1, 1], duration: 6200, ease: 'inOutSine' }, 0)
      .add(state, { u: [0, 1], duration: 6200, ease: 'inOutSine', onUpdate: () => setArm(state.u) }, 0)
      .add(drawable, { opacity: [1, 0], duration: 700, ease: 'outQuad' }, 6600);

    return () => tl.pause();
  }, [inView]);

  return (
    <svg ref={ref} viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} role="img" aria-label="Damped precession of a magnetic moment">
      <defs>
        <linearGradient id="prec-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--down)" />
          <stop offset="100%" stopColor="var(--up)" />
        </linearGradient>
      </defs>
      <path d={rim} fill="none" stroke="var(--line-strong)" strokeDasharray="2 5" />
      <line x1={origin[0]} y1={origin[1]} x2={axisTop[0]} y2={axisTop[1] - 18} stroke="var(--ink-3)" strokeWidth="1" />
      <text x={axisTop[0] + 8} y={axisTop[1] - 12} fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize="11">
        H_eff
      </text>
      <path ref={pathRef} d={spiral} fill="none" stroke="url(#prec-grad)" strokeWidth="1.4" strokeLinecap="round" />
      <line ref={armRef} x1={origin[0]} y1={origin[1]} x2={origin[0]} y2={origin[1]} stroke="var(--ink)" strokeWidth="1.8" />
      <circle ref={tipRef} cx={origin[0]} cy={origin[1]} r="4.5" fill="var(--up)" />
      <circle cx={origin[0]} cy={origin[1]} r="2.5" fill="var(--ink)" />
      <text x={origin[0] + 10} y={origin[1] + 18} fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize="11">
        m(t)
      </text>
    </svg>
  );
}
