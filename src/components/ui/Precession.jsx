import { useEffect, useMemo, useRef } from 'react';
import { useInView } from 'motion/react';
import { createTimeline } from 'animejs';

/**
 * Damped precession of a single magnetic moment (Landau-Lifshitz-Gilbert):
 * the tip spirals around the field axis while the cone angle decays. The
 * trajectory and the moment vector are driven by the same parameter, so the
 * drawn curve always ends exactly at the tip.
 */
const SIZE = 320;
const C = SIZE / 2;
const R = 118;
const TURNS = 7;
const STEPS = 700;
// Animation timing, in ms: draw the spiral, hold, then fade it out.
const DRAW = 6200;
const FADE_AT = 6600;
const CYCLE = 7300;
const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;

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

  // The spiral's points and the arc length up to each one. Turns shrink as
  // the cone closes, so arc length is not proportional to the parameter;
  // revealing the stroke by `cumulative[u]` keeps its end on the tip.
  const { spiral, cumulative } = useMemo(() => {
    const points = Array.from({ length: STEPS + 1 }, (_, i) => pointAt(i / STEPS));
    const lengths = [0];
    for (let i = 1; i < points.length; i += 1) {
      lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }
    return { spiral: toPath(points), cumulative: lengths };
  }, []);
  const rim = useMemo(() => toPath(Array.from({ length: 121 }, (_, i) => project(Math.PI / 2, (i / 120) * Math.PI * 2))), []);
  const origin = [C, C + 34];
  const axisTop = project(0, 0);

  useEffect(() => {
    const path = pathRef.current;
    if (!inView || !path) return undefined;
    const total = cumulative[STEPS];
    path.style.strokeDasharray = `${total} ${total}`;

    const setU = (u) => {
      const [x, y] = pointAt(u);
      armRef.current?.setAttribute('x2', x);
      armRef.current?.setAttribute('y2', y);
      tipRef.current?.setAttribute('cx', x);
      tipRef.current?.setAttribute('cy', y);
      // Arc length at u, interpolated between the two neighbouring points.
      const f = u * STEPS;
      const i = Math.min(Math.floor(f), STEPS - 1);
      const drawn = cumulative[i] + (cumulative[i + 1] - cumulative[i]) * (f - i);
      path.style.strokeDashoffset = `${total - drawn}`;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setU(1);
      return undefined;
    }

    // One clock drives the whole cycle (draw, hold, fade), so every loop
    // starts from the same state. Separate opacity tweens on the path would
    // compete with each other and leave the curve hidden after the first fade.
    const clock = { ms: 0 };
    const tl = createTimeline({ loop: true, loopDelay: 600 }).add(clock, {
      ms: [0, CYCLE],
      duration: CYCLE,
      ease: 'linear',
      onUpdate: () => {
        setU(easeInOutSine(Math.min(clock.ms / DRAW, 1)));
        const fade = Math.max(0, (clock.ms - FADE_AT) / (CYCLE - FADE_AT));
        path.style.opacity = `${1 - fade * (2 - fade)}`; // out-quad
      },
    });

    return () => tl.pause();
  }, [inView, cumulative]);

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
