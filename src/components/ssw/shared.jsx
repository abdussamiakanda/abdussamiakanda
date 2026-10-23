import { useId } from 'react';

export function WidgetFrame({ label, title, caption, children }) {
  return (
    <figure className="not-prose my-12 overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-4 md:px-7">
        <p className="eyebrow mb-1">{label}</p>
        <p className="font-display text-2xl leading-tight text-ink">{title}</p>
      </div>
      <div className="p-5 md:p-7">{children}</div>
      {caption && <figcaption className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-3 md:px-7">{caption}</figcaption>}
    </figure>
  );
}

export function Slider({ label, value, min, max, step, onChange, display, hint }) {
  const id = useId();
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.12em] text-ink-2">
          {label}
        </label>
        <span className="font-mono text-sm text-ink">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block w-full cursor-pointer"
        style={{ accentColor: 'var(--up)' }}
      />
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

export function Stat({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-line bg-bg px-4 py-3">
      <p className="eyebrow mb-1">{label}</p>
      <p className="font-mono text-lg" style={{ color: tone ?? 'var(--ink)' }}>
        {value}
      </p>
    </div>
  );
}
