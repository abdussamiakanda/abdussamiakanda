import { useEffect, useRef, useState } from 'react';
import { useFrameLoop, useReducedMotion } from './hooks';
import { WidgetFrame, Slider, Stat } from './shared';

const W = 640;
const H = 190;
const X0 = 30;
const X1 = W - 30;
const WIRE_Y = 95;
const WIDTH = 60; // wall half-width in px
const COLUMNS = 34;
const CW = 640;
const CH = 190;
const CP = { l: 46, r: 16, t: 14, b: 38 };
const cx = (g) => CP.l + (g / 0.4) * (CW - CP.l - CP.r);
const cy = (v) => CP.t + (1 - v / 100) * (CH - CP.t - CP.b);
const SPEED_PER_GRADIENT = 220; // px/s at 0.4 K/nm, for show

export default function HeatWall() {
  const ref = useRef(null);
  const wallRef = useRef(null);
  const dotsRef = useRef(null);
  const state = useRef({ x: (X0 + X1) / 2, dots: Array.from({ length: 14 }, (_, i) => ({ x: X0 + ((X1 - X0) * i) / 14, y: 60 + ((i * 37) % 70) })) });
  const [gradient, setGradient] = useState(0.2);
  const reduced = useReducedMotion();
  const gradRef = useRef(gradient);
  gradRef.current = gradient;

  const paint = () => {
    const s = state.current;
    const wall = wallRef.current;
    if (wall) {
      wall.childNodes.forEach((node, i) => {
        const x = X0 + 14 + ((X1 - X0 - 28) * i) / (COLUMNS - 1);
        const t = (x - s.x) / WIDTH;
        const mx = -Math.tanh(t);
        const my = 1 / Math.cosh(t);
        const len = 15;
        const x1 = x - mx * len;
        const y1 = WIRE_Y + my * len;
        const x2 = x + mx * len;
        const y2 = WIRE_Y - my * len;
        // Shaft plus a two-stroke head, swept back 150 degrees from the tip.
        const a = Math.atan2(y2 - y1, x2 - x1);
        const h = 7;
        const hx = (d) => (x2 + h * Math.cos(a + d)).toFixed(1);
        const hy = (d) => (y2 + h * Math.sin(a + d)).toFixed(1);
        const back = (5 * Math.PI) / 6;
        node.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}M${hx(back)} ${hy(back)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${hx(-back)} ${hy(-back)}`);
      });
      const marker = wall.parentNode.querySelector('[data-wall]');
      marker?.setAttribute('x', s.x - 1);
    }
    dotsRef.current?.childNodes.forEach((node, i) => {
      node.setAttribute('cx', s.dots[i].x);
      node.setAttribute('cy', s.dots[i].y);
    });
  };

  // Draw the first frame right away so reduced-motion readers still see the wire.
  useEffect(() => {
    paint();
  }, []);

  useFrameLoop(
    ref,
    (_t, dt) => {
      const s = state.current;
      const g = gradRef.current;
      // The wall drifts toward the hot end; magnons stream the other way.
      s.x += (g / 0.4) * SPEED_PER_GRADIENT * dt * 0.35;
      if (s.x > X1 - 90) s.x = X0 + 90;
      s.dots.forEach((d) => {
        d.x -= (30 + g * 400) * dt;
        if (d.x < X0) d.x = X1;
      });
      paint();
    },
    !reduced,
  );

  const speed = (gradient / 0.4) * 100;

  return (
    <WidgetFrame
      label="Try it · 1"
      title="Heat pushes the wall"
      caption="The arrows are tiny magnets. Left of the wall they point right, right of it they point left, and in between they twist. Make one end hotter and the wall slides toward it, while the magnon “wind” blows toward the cold end. The plot below shows what the paper found: speed grows in a straight line with the gradient."
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="A nanowire, hot on the right, with a domain wall drifting toward the hot end">
          <defs>
            <linearGradient id="hw-heat" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--down)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--kind-developer)" stopOpacity={0.35 + gradient} />
            </linearGradient>
          </defs>
          <rect x={X0} y={WIRE_Y - 38} width={X1 - X0} height={76} rx={14} fill="url(#hw-heat)" stroke="var(--line-strong)" />
          <g ref={wallRef} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round">
            {Array.from({ length: COLUMNS }, (_, i) => (
              <path key={i} fill="none" strokeLinejoin="round" />
            ))}
          </g>
          <rect data-wall width={2} y={WIRE_Y - 52} height={104} fill="var(--up)" opacity={0.7} />
          <g ref={dotsRef} fill="var(--down)">
            {Array.from({ length: 14 }, (_, i) => (
              <circle key={i} r={3} opacity={0.35 + gradient} />
            ))}
          </g>
          <text x={X0} y={H - 12} fill="var(--down)" fontFamily="var(--font-mono)" fontSize={12}>
            COLD
          </text>
          <text x={X1} y={H - 12} textAnchor="end" fill="var(--kind-developer)" fontFamily="var(--font-mono)" fontSize={12}>
            HOT
          </text>
          <text x={W / 2} y={22} textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={11}>
            ← magnons flow toward cold · wall moves toward hot →
          </text>
        </svg>
      </div>
      <svg viewBox={`0 0 ${CW} ${CH}`} className="mt-4 block h-auto w-full" role="img" aria-label="Wall speed rises in a straight line with the temperature gradient">
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={CP.l} x2={CW - CP.r} y1={cy(v)} y2={cy(v)} stroke="var(--line)" />
            <text x={CP.l - 8} y={cy(v) + 4} textAnchor="end" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={11}>
              {v}
            </text>
          </g>
        ))}
        {[0, 0.1, 0.2, 0.3, 0.4].map((g) => (
          <text key={g} x={cx(g)} y={CH - 16} textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={11}>
            {g}
          </text>
        ))}
        <text x={(CP.l + CW - CP.r) / 2} y={CH - 2} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={11}>
          temperature gradient (K/nm) →
        </text>
        <text x={12} y={CH / 2 - 6} fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={11} transform={`rotate(-90 12 ${CH / 2 - 6})`} textAnchor="middle">
          wall speed (%)
        </text>
        <line x1={cx(0)} y1={cy(0)} x2={cx(0.4)} y2={cy(100)} stroke="var(--up)" strokeWidth={2.4} strokeLinecap="round" />
        <line x1={cx(gradient)} x2={cx(gradient)} y1={cy(0)} y2={cy(speed)} stroke="var(--up)" strokeDasharray="3 4" opacity={0.6} />
        <circle cx={cx(gradient)} cy={cy(speed)} r={7} fill="var(--bg)" stroke="var(--ink)" strokeWidth={2} />
      </svg>
      <div className="mt-5 grid items-end gap-5 md:grid-cols-[1fr_auto]">
        <Slider label="Temperature gradient" value={gradient} min={0} max={0.4} step={0.01} onChange={setGradient} display={`${gradient.toFixed(2)} K/nm`} hint="Steeper hill of temperature, harder push." />
        <Stat label="Wall speed" value={`${speed.toFixed(0)} %`} tone="var(--up)" />
      </div>
    </WidgetFrame>
  );
}
