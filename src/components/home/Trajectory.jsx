import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Chip } from '../ui/primitives';
import { LineReveal, Reveal } from '../ui/Reveal';
import { formatRange, yearOf } from '../../lib/format';

gsap.registerPlugin(ScrollTrigger);

const TONE = { Education: 'default', Research: 'up', Teaching: 'down', Leadership: 'default' };

/**
 * Horizontal timeline. On wide screens the section pins and vertical
 * scroll drives the track sideways (GSAP ScrollTrigger); on small screens
 * it is a native swipeable row.
 */
export default function Trajectory({ milestones }) {
  const root = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0, track.current.scrollWidth - window.innerWidth);
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      // Progress bar follows the same scroll span as the pinned track.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${distance()}`,
        onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
      });
      // Cards lean in as they enter from the right.
      gsap.utils.toArray('[data-milestone]', track.current).forEach((card) => {
        gsap.from(card, {
          opacity: 0.25,
          y: 40,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 60%', scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, [milestones.length]);

  return (
    <section ref={root} id="trajectory" className="relative overflow-hidden border-y border-line bg-bg-2 md:h-screen">
      <div className="flex h-full flex-col justify-center py-24 md:py-0">
        <div className="shell mb-10 flex items-end justify-between gap-8 md:mb-14">
          <div>
            <Reveal className="eyebrow mb-5 flex items-center gap-3">
              <span className="text-up">§ 04</span>
              <span className="h-px w-8 bg-line-strong" />
              <span>Trajectory</span>
            </Reveal>
            <LineReveal
              lines={['From Netrakona', <span key="i" className="italic text-ink-2">to Nebraska.</span>]}
              className="font-display text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.95] tracking-[-0.02em] text-ink"
            />
          </div>
          <p className="eyebrow hidden md:block">Scroll →</p>
        </div>

        <div className="no-scrollbar overflow-x-auto md:overflow-visible">
          <ol ref={track} className="flex w-max gap-4 px-[clamp(1rem,4vw,3rem)] will-change-transform">
            {milestones.map((m, i) => (
              <li
                key={m.key}
                data-milestone
                className="relative flex w-[78vw] shrink-0 flex-col justify-between rounded-3xl border border-line bg-surface p-6 sm:w-[340px] md:h-[46vh] md:min-h-[340px] md:w-[360px] md:p-8"
              >
                <div className="flex items-center justify-between">
                  <Chip tone={TONE[m.kind]}>{m.kind}</Chip>
                  <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-10 font-display text-7xl leading-none text-ink md:text-8xl">{yearOf(m.start) ?? '—'}</p>
                <div className="mt-8">
                  <h3 className="font-display text-2xl leading-tight text-ink">{m.title}</h3>
                  <p className="mt-2 text-sm text-ink-2">{m.org}</p>
                  <p className="eyebrow mt-4">{formatRange(m.start, m.end)}</p>
                </div>
              </li>
            ))}
            <li className="flex w-[60vw] shrink-0 items-center sm:w-[360px]">
              <p className="font-display text-4xl italic leading-tight text-ink-3">…and the next chapter is still being written.</p>
            </li>
          </ol>
        </div>

        <div className="shell mt-10 hidden md:block">
          <div className="h-px w-full bg-line">
            <div ref={bar} className="h-px origin-left scale-x-0 bg-up" />
          </div>
        </div>
      </div>
    </section>
  );
}
