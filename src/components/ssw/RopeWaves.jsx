import { useEffect, useRef, useState } from 'react';
import { useFrameLoop, useReducedMotion } from './hooks';
import { WidgetFrame, Slider } from './shared';
import { ALPHA_MAX, ALPHA_MIN, propagationLength, shares } from './model';

const W = 640;
const ROW_H = 74;
const N = 220;
const LAMBDA_NM = 400;
const TAU = Math.PI * 2;

const rows = [
  { key: 'fwd', label: 'wave going out', color: 'var(--down)' },
  { key: 'back', label: 'reflection coming back', color: 'var(--kind-developer)' },
  { key: 'sum', label: 'what you actually see', color: 'var(--up)' },
];

export default function RopeWaves() {
  const ref = useRef(null);
  const pathRefs = useRef({});
  const [logA, setLogA] = useState(Math.log(0.0006));
  const [length, setLength] = useState(2048);
  const reduced = useReducedMotion();
  const alpha = Math.exp(logA);
  const params = useRef({});
  params.current = { alpha, length };

  const paint = (t) => {
    const { alpha: a, length: L } = params.current;
    const lp = propagationLength(a);
    const k = TAU / LAMBDA_NM;
    const w = 2.2 * t * 1.6;
    const amp = ROW_H / 2 - 6;
    const d = { fwd: '', back: '', sum: '' };
    for (let i = 0; i <= N; i += 1) {
      const x = (i / N) * L;
      const px = (i / N) * W;
      const fwd = Math.exp(-x / lp) * Math.cos(k * x - w);
      const back = -Math.exp(-(2 * L - x) / lp) * Math.cos(k * (2 * L - x) - w);
      const cmd = i ? 'L' : 'M';
      d.fwd += `${cmd}${px.toFixed(1)} ${(ROW_H / 2 - fwd * amp).toFixed(1)}`;
      d.back += `${cmd}${px.toFixed(1)} ${(ROW_H / 2 - back * amp).toFixed(1)}`;
      d.sum += `${cmd}${px.toFixed(1)} ${(ROW_H / 2 - (fwd + back) * amp).toFixed(1)}`;
    }
    rows.forEach((r) => pathRefs.current[r.key]?.setAttribute('d', d[r.key]));
  };

  useFrameLoop(ref, (t) => paint(t), !reduced);
  // With reduced motion there is no frame loop, so draw one still frame per slider change.
  useEffect(() => {
    if (reduced) paint(0.6);
  }, [reduced, alpha, length]);

  const s = shares(alpha, length);
  const standing = Math.round(s.standing * 100);

  return (
    <WidgetFrame
      label="Try it · 2"
      title="A rope with a fixed end"
      caption="Shake one end of a rope and the other end is tied down: the wave bounces back. If the wave loses almost no energy along the way (low damping) the bounce is strong and the two waves add up to a pattern that shakes in place without going anywhere. That is a standing wave. Raise the damping and the reflection dies out before it returns. (Damping here is energy leaking away, not rubbing friction.)"
    >
      <div ref={ref} className="space-y-1">
        {rows.map((r, i) => (
          <div key={r.key} className="relative">
            <svg viewBox={`0 0 ${W} ${ROW_H}`} className="block h-auto w-full" role="img" aria-label={r.label}>
              <line x1={0} x2={W} y1={ROW_H / 2} y2={ROW_H / 2} stroke="var(--line-strong)" strokeDasharray="2 5" />
              <path ref={(el) => (pathRefs.current[r.key] = el)} fill="none" stroke={r.color} strokeWidth={i === 2 ? 2.4 : 1.6} strokeLinejoin="round" />
            </svg>
            <span className="absolute left-0 top-0 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">{r.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Slider
          label="Damping"
          value={logA}
          min={Math.log(ALPHA_MIN)}
          max={Math.log(ALPHA_MAX)}
          step={0.01}
          onChange={setLogA}
          display={alpha.toFixed(4)}
          hint={`Wave fades over about ${(propagationLength(alpha) / 1000).toFixed(1)} µm.`}
        />
        <Slider label="Wire length" value={length} min={512} max={4096} step={128} onChange={setLength} display={`${length} nm`} hint="The longer the rope, the more of the echo is lost." />
      </div>
      <p className="mt-5 text-sm text-ink-2">
        Share of the wave energy that ends up <span className="text-up">standing still</span>: <span className="font-mono text-ink">{standing}%</span>. That share does no pushing.
      </p>
    </WidgetFrame>
  );
}
