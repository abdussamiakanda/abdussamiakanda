import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { LineReveal, Reveal } from '../ui/Reveal';
import { EASE } from '../../lib/motion';
import { formatRange, toDate } from '../../lib/format';

// One distinct hue per kind of role (tokens in index.css, checked for AA
// contrast in both themes). Threads, legend and card badges all use it.
const KINDS = {
  Education: { stroke: 'var(--kind-education)' },
  Research: { stroke: 'var(--kind-research)' },
  Teaching: { stroke: 'var(--kind-teaching)' },
  Developer: { stroke: 'var(--kind-developer)' },
  Leadership: { stroke: 'var(--kind-leadership)' },
};
const ORDER = Object.keys(KINDS);

const THREAD_GAP = 11; // px between parallel threads

const BADGE = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.08em]';

// A role's kind, tinted with its thread colour so card and thread match.
function KindBadge({ kind }) {
  const stroke = KINDS[kind]?.stroke ?? 'var(--ink-2)';
  return (
    <span className={BADGE} style={{ color: stroke, background: `color-mix(in srgb, ${stroke} 8%, transparent)` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: stroke }} />
      {kind}
    </span>
  );
}

// Neutral, so it never reads as another kind of role.
function NowBadge() {
  return (
    <span className={`${BADGE} border border-line-strong text-ink`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-up opacity-60 motion-safe:animate-ping" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-up" />
      </span>
      Now
    </span>
  );
}

const ms = (value) => toDate(value)?.getTime();

// "2 yrs 4 mos", from start to end (or to now).
function duration(start, end) {
  const a = toDate(start);
  const b = toDate(end) ?? new Date();
  if (!a) return '';
  const months = Math.max(1, (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth());
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
}

// Gives every role a thread column so concurrent roles sit side by side.
function assignColumns(milestones, now) {
  const ends = [];
  const column = {};
  for (const m of [...milestones].sort((a, b) => ms(a.start) - ms(b.start))) {
    const start = ms(m.start);
    let c = ends.findIndex((end) => end <= start);
    if (c === -1) c = ends.length;
    ends[c] = ms(m.end) ?? now;
    column[m.key] = c;
  }
  return { column, count: ends.length };
}

/**
 * The trajectory as a worldline: time runs down the page, a bright line
 * (drawn as you scroll) is the life, and each role is a thread beside it
 * from its start to its end. Threads running side by side are roles that
 * overlapped. Each role's card sits on the year it began.
 */
export default function Trajectory({ milestones }) {
  const reduced = useReducedMotion();
  const body = useRef(null);
  const rowRefs = useRef({});
  const [rows, setRows] = useState(null); // { [year]: { top, height } }
  const [active, setActive] = useState(null);

  const { years, byYear, column, count, now } = useMemo(() => {
    const nowMs = Date.now();
    const first = Math.min(...milestones.map((m) => toDate(m.start)?.getUTCFullYear() ?? Infinity));
    const last = new Date(nowMs).getUTCFullYear();
    const ys = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    const grouped = Object.fromEntries(ys.map((y) => [y, []]));
    for (const m of milestones) grouped[toDate(m.start)?.getUTCFullYear()]?.push(m);
    return { years: ys, byYear: grouped, now: nowMs, ...assignColumns(milestones, nowMs) };
  }, [milestones]);

  // Rows grow with their cards, so thread positions come from measured rows.
  useLayoutEffect(() => {
    const measure = () => {
      const next = {};
      for (const y of years) {
        const el = rowRefs.current[y];
        if (el) next[y] = { top: el.offsetTop, height: el.offsetHeight };
      }
      setRows(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (body.current) ro.observe(body.current);
    return () => ro.disconnect();
  }, [years]);

  // Time → pixels, linear within each year's row.
  const yAt = (t) => {
    if (!rows) return 0;
    const d = new Date(t);
    const y = d.getUTCFullYear();
    const r = rows[y] ?? rows[years[years.length - 1]];
    const start = Date.UTC(y, 0, 1);
    const frac = Math.min(1, Math.max(0, (t - start) / (Date.UTC(y + 1, 0, 1) - start)));
    return r.top + frac * r.height;
  };

  // The worldline draws itself as the section scrolls past.
  const { scrollYProgress } = useScroll({ target: body, offset: ['start 75%', 'end 60%'] });
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const tipTop = useTransform(drawn, (v) => `${v * 100}%`);

  if (!milestones.length) return null;
  const counts = Object.fromEntries(ORDER.map((k) => [k, milestones.filter((m) => m.kind === k).length]));
  const threadsWidth = Math.max(1, count) * THREAD_GAP;

  return (
    <section id="trajectory" className="relative overflow-hidden border-y border-line bg-bg-2 py-28 md:py-36">
      <div className="shell">
        <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal className="eyebrow mb-5 flex items-center gap-3">
              <span className="text-up">§ 05</span>
              <span className="h-px w-8 bg-line-strong" />
              <span>Trajectory</span>
            </Reveal>
            <LineReveal
              lines={['One worldline,', <span key="i" className="italic text-ink-2">many threads.</span>]}
              className="font-display text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.95] tracking-[-0.02em] text-ink"
            />
          </div>
          <Reveal delay={0.15} className="md:col-span-5 md:pb-3">
            <p className="text-ink-2">
              Time runs down the page. The bright line is me; each thread beside it is a role, from its first day to its last. Where threads
              run side by side, the roles overlapped.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {ORDER.filter((k) => counts[k]).map((k) => (
                <li key={k} className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-2">
                  <span className="h-[3px] w-4 rounded-full" style={{ background: KINDS[k].stroke }} />
                  {k} <span className="text-ink-3">{counts[k]}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div ref={body} className="relative">
          {/* Spine: a faint rail, the drawn worldline over it, and a particle at its tip. */}
          <div className="pointer-events-none absolute inset-y-0 left-[3.25rem] w-px bg-line-strong md:left-[6.5rem]" aria-hidden="true">
            <motion.div
              className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-down via-up to-up"
              style={{ scaleY: reduced ? 1 : drawn, width: 2, marginLeft: -0.5 }}
            />
            {!reduced && (
              <motion.span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: tipTop }}>
                <span className="absolute -inset-2 animate-ping rounded-full bg-up opacity-40" />
                <span className="relative block h-2.5 w-2.5 rounded-full bg-up shadow-[0_0_14px_var(--up)]" />
              </motion.span>
            )}
          </div>

          {/* Threads, one per role, positioned by measured year rows. */}
          {rows && (
            <svg
              className="pointer-events-none absolute top-0 left-[calc(3.25rem+10px)] h-full overflow-visible md:left-[calc(6.5rem+14px)]"
              width={threadsWidth}
              aria-hidden="true"
            >
              {milestones.map((m) => {
                const x = column[m.key] * THREAD_GAP + 4;
                const y1 = yAt(ms(m.start));
                const y2 = yAt(ms(m.end) ?? now);
                const on = active === m.key;
                const dim = active && !on;
                return (
                  <g key={m.key} style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 300ms' }}>
                    <motion.line
                      x1={x}
                      x2={x}
                      y1={y1}
                      y2={Math.max(y1 + 6, y2)}
                      stroke={KINDS[m.kind]?.stroke}
                      strokeWidth={on ? 4 : 2.5}
                      strokeLinecap="round"
                      initial={reduced ? false : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 1.2, ease: EASE }}
                    />
                    <circle cx={x} cy={y1} r={on ? 5 : 4} fill="var(--bg-2)" stroke={KINDS[m.kind]?.stroke} strokeWidth="2" />
                    {m.end ? (
                      <circle cx={x} cy={y2} r="2.5" fill={KINDS[m.kind]?.stroke} />
                    ) : (
                      <circle cx={x} cy={y2} r="3.5" fill={KINDS[m.kind]?.stroke} className="motion-safe:animate-pulse" />
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Year rows with the cards for roles that began that year. */}
          <ol>
            {years.map((y) => {
              const starts = byYear[y];
              return (
                <li
                  key={y}
                  ref={(el) => {
                    rowRefs.current[y] = el;
                  }}
                  className={`relative grid grid-cols-[3.25rem_minmax(0,1fr)] md:grid-cols-[6.5rem_minmax(0,1fr)] ${starts.length ? '' : 'min-h-[1.75rem] md:min-h-[2.25rem]'}`}
                >
                  <span
                    className={`pr-3 text-right font-display leading-none md:pr-6 ${
                      starts.length ? 'pt-3 text-2xl text-ink md:text-4xl' : 'pt-1.5 text-sm text-ink-3 md:text-base'
                    }`}
                  >
                    {starts.length || y === years[0] || y === years[years.length - 1] ? y : `’${String(y).slice(2)}`}
                  </span>
                  <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-3 ${starts.length ? 'py-3' : ''}`} style={{ paddingLeft: threadsWidth + 30 }}>
                    {starts.map((m) => (
                      <Reveal
                        key={m.key}
                        y={16}
                        amount={0.6}
                        onMouseEnter={() => setActive(m.key)}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive(m.key)}
                        onBlur={() => setActive(null)}
                        tabIndex={0}
                        className={`relative rounded-2xl border bg-bg p-4 outline-none transition-colors ${
                          active === m.key ? 'border-ink' : 'border-line hover:border-line-strong'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <KindBadge kind={m.kind} />
                          {!m.end && <NowBadge />}
                          <span className="ml-auto font-mono text-[0.65rem] text-ink-3">{duration(m.start, m.end)}</span>
                        </div>
                        <h3 className="mt-3 font-display text-xl leading-tight text-ink md:text-2xl">{m.title}</h3>
                        <p className="mt-1 text-sm text-ink-2">{m.org}</p>
                        <p className="eyebrow mt-3">{formatRange(m.start, m.end)}</p>
                      </Reveal>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 pl-[calc(3.25rem+40px)] font-display text-2xl italic text-ink-3 md:pl-[calc(6.5rem+80px)] md:text-3xl">
            …and the line keeps going.
          </p>
        </div>
      </div>
    </section>
  );
}
