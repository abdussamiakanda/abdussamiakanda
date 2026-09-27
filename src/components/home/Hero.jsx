import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SpinField from '../ui/SpinField';
import Magnetic from '../ui/Magnetic';
import { Button } from '../ui/primitives';
import { CV_URL } from '../../lib/siteMap';

gsap.registerPlugin(ScrollTrigger);

const splitChars = (text) =>
  [...text].map((ch, i) => (
    <span key={i} data-char className="inline-block will-change-transform" style={{ whiteSpace: ch === ' ' ? 'pre' : undefined }}>
      {ch}
    </span>
  ));

const fmt = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);

// Live readout of the lattice below the fold line.
function Readout({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-5 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-3">
      <div>
        <p>⟨mₓ⟩</p>
        <p className="mt-1 text-sm tabular-nums text-ink">{fmt(stats.mx)}</p>
      </div>
      <div>
        <p>⟨m_y⟩</p>
        <p className="mt-1 text-sm tabular-nums text-ink">{fmt(stats.my)}</p>
      </div>
      <div>
        <p>|H_ext|</p>
        <p className="mt-1 text-sm tabular-nums text-up">{stats.field.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function Hero({ profile }) {
  const root = useRef(null);
  const [stats, setStats] = useState({ mx: 0, my: 0, field: 0 });
  const onStats = useCallback((s) => setStats(s), []);

  const [first, ...rest] = (profile?.name ?? 'Md Abdus Sami Akanda').split(' ');
  const last = rest.pop() ?? '';
  const middle = [first, ...rest].join(' ');

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (!reduced) {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.from('[data-canvas]', { opacity: 0, scale: 1.08, duration: 2.2 }, 0)
          .from('[data-eyebrow] > *', { y: 20, opacity: 0, stagger: 0.08, duration: 1 }, 0.2)
          .from('[data-char]', { yPercent: 115, rotate: 6, duration: 1.4, stagger: 0.028 }, 0.25)
          .from('[data-rule]', { scaleX: 0, transformOrigin: 'left', duration: 1.4 }, 0.7)
          .from('[data-foot] > *', { y: 30, opacity: 0, stagger: 0.1, duration: 1.1 }, 0.85);
      }

      // On scroll the name drifts up faster than the page and the field dims.
      gsap.to('[data-name]', {
        yPercent: -35,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      // Separate element from the intro fade: a plain to() here would record
      // the intro's opacity:0 start state and scrub the field to invisible.
      gsap.fromTo(
        '[data-canvas-scroll]',
        { opacity: 1, scale: 1 },
        {
          opacity: 0.35,
          scale: 1.06,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div data-canvas className="absolute inset-0">
        <div data-canvas-scroll className="h-full w-full">
          <SpinField className="h-full w-full" onStats={onStats} />
        </div>
      </div>
      {/* Legibility wash: strongest behind the name, clear on the right. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,var(--bg)_0%,transparent_60%)] opacity-90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

      <div className="shell relative flex flex-1 flex-col justify-end pb-10 pt-32 md:pb-14">
        <div data-eyebrow className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="eyebrow flex items-center gap-2 text-ink-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-up" />
            </span>
            MS Physics · University of Nebraska–Lincoln
          </span>
          <span className="eyebrow hidden sm:inline">/</span>
          <span className="eyebrow">Researcher · Academic instructor</span>
        </div>

        <h1 data-name className="font-display text-[clamp(3.6rem,13.5vw,13.5rem)] leading-[0.84] tracking-[-0.045em] text-ink">
          <span className="-mx-[0.12em] block overflow-hidden px-[0.12em] pb-[0.06em]">{splitChars(middle)}</span>
          <span className="-mx-[0.12em] block overflow-hidden px-[0.12em] pb-[0.1em] italic">
            {splitChars(last)}
            <span data-char className="inline-block text-up not-italic">.</span>
          </span>
        </h1>

        <div data-rule className="mt-8 h-px w-full bg-line-strong md:mt-10" />

        <div data-foot className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="max-w-md text-lg leading-relaxed text-ink-2 md:col-span-5">
            Condensed-matter physicist studying how electron <span className="text-ink">spin</span> moves, switches and carries information — from
            domain walls in nanowires to picosecond switching of magnetic tunnel junctions.
          </p>
          <div className="flex flex-wrap gap-3 md:col-span-4">
            <Magnetic>
              <Button to="/publications" icon="right">
                Publications
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href={profile?.cvUrl || CV_URL} variant="ghost">
                Curriculum vitae
              </Button>
            </Magnetic>
          </div>
          <div className="hidden md:col-span-3 md:block">
            <Readout stats={stats} />
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">Move the cursor to apply a field</p>
          </div>
        </div>
      </div>

    </section>
  );
}
