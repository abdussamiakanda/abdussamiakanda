import { useState } from 'react';
import { WidgetFrame, Slider, Stat } from './shared';
import { ALPHA_MAX, ALPHA_MIN, criticalDamping, shares, wallSpeed } from './model';

const W = 640;
const H = 270;
const PAD = { l: 46, r: 16, t: 16, b: 38 };
const LOG_MIN = Math.log(ALPHA_MIN);
const LOG_MAX = Math.log(ALPHA_MAX);
const GHOST_LENGTHS = [512, 1024, 2048, 4096];
const TICKS = [0.0005, 0.001, 0.002, 0.004, 0.006];

const xOf = (alpha) => PAD.l + ((Math.log(alpha) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (W - PAD.l - PAD.r);
const yOf = (v) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);

const curve = (L) =>
  Array.from({ length: 90 }, (_, i) => {
    const a = Math.exp(LOG_MIN + ((LOG_MAX - LOG_MIN) * i) / 89);
    return `${i ? 'L' : 'M'}${xOf(a).toFixed(1)} ${yOf(wallSpeed(a, L)).toFixed(1)}`;
  }).join('');

export default function Explorer() {
  const [logA, setLogA] = useState(Math.log(0.0006));
  const [length, setLength] = useState(2048);
  const [gradient, setGradient] = useState(0.2);
  const alpha = Math.exp(logA);
  const s = shares(alpha, length);
  const best = criticalDamping(length);
  const speed = wallSpeed(alpha, length) * (gradient / 0.4);

  const segments = [
    { label: 'Standing (wasted)', value: s.standing, color: 'var(--down)' },
    { label: 'Travelling and arrives', value: s.pushing, color: 'var(--up)' },
    { label: 'Fades before arriving', value: s.faded, color: 'var(--ink-3)' },
  ];

  return (
    <WidgetFrame
      label="Try it · 3"
      title="Find the sweet spot"
      caption="A simplified model built on the paper's argument, not its simulation data: standing waves waste energy at low damping, while at high damping the waves die before they reach the wall. The real simulations show the same hump, with the peak sliding to lower damping in longer wires."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Wall speed against damping for the chosen wire length">
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={yOf(v)} y2={yOf(v)} stroke="var(--line)" />
            <text x={PAD.l - 8} y={yOf(v) + 4} textAnchor="end" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={11}>
              {v}
            </text>
          </g>
        ))}
        {TICKS.map((t) => (
          <text key={t} x={xOf(t)} y={H - 16} textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize={11}>
            {t}
          </text>
        ))}
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 1} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={11}>
          damping →
        </text>
        <text x={12} y={H / 2} fill="var(--ink-2)" fontFamily="var(--font-mono)" fontSize={11} transform={`rotate(-90 12 ${H / 2})`} textAnchor="middle">
          wall speed
        </text>
        {GHOST_LENGTHS.map((L) => (
          <path key={L} d={curve(L)} fill="none" stroke="var(--line-strong)" strokeWidth={1.2} strokeDasharray="3 4" />
        ))}
        <path d={curve(length)} fill="none" stroke="var(--up)" strokeWidth={2.6} strokeLinecap="round" />
        <line x1={xOf(best)} x2={xOf(best)} y1={yOf(0)} y2={yOf(wallSpeed(best, length))} stroke="var(--up)" strokeDasharray="3 4" opacity={0.6} />
        <circle cx={xOf(alpha)} cy={yOf(wallSpeed(alpha, length))} r={7} fill="var(--bg)" stroke="var(--ink)" strokeWidth={2} />
        <text x={xOf(best)} y={yOf(wallSpeed(best, length)) - 12} textAnchor="middle" fill="var(--up)" fontFamily="var(--font-mono)" fontSize={11}>
          best ≈ {best.toFixed(4)}
        </text>
      </svg>

      <div className="mt-4">
        <div className="flex h-5 overflow-hidden rounded-full border border-line">
          {segments.map((seg) => (
            <div key={seg.label} style={{ width: `${seg.value * 100}%`, background: seg.color, transition: 'width 120ms' }} title={`${seg.label}: ${(seg.value * 100).toFixed(0)}%`} />
          ))}
        </div>
        <ul className="mt-3 grid gap-2 text-sm text-ink-2 sm:grid-cols-3">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
              {seg.label} <span className="font-mono text-ink">{(seg.value * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Slider label="Damping" value={logA} min={LOG_MIN} max={LOG_MAX} step={0.01} onChange={setLogA} display={alpha.toFixed(4)} />
        <Slider label="Wire length" value={length} min={512} max={7168} step={128} onChange={setLength} display={`${length} nm`} />
        <Slider label="Temp. gradient" value={gradient} min={0.05} max={0.4} step={0.01} onChange={setGradient} display={`${gradient.toFixed(2)} K/nm`} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Wall speed (relative)" value={speed.toFixed(2)} tone="var(--up)" />
        <Stat label="Best damping for this wire" value={best.toFixed(4)} />
      </div>
    </WidgetFrame>
  );
}
