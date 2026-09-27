import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Counter from '../ui/Counter';
import { SectionHeading } from '../ui/primitives';
import { Reveal } from '../ui/Reveal';

gsap.registerPlugin(ScrollTrigger);

export default function About({ profile, stats }) {
  const root = useRef(null);
  const words = (profile?.description ?? '').split(/\s+/).filter(Boolean);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      // Portrait wipes open from the bottom while the photo settles.
      gsap.fromTo(
        '[data-portrait]',
        { clipPath: 'inset(100% 0% 0% 0% round 28px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 28px)',
          ease: 'none',
          scrollTrigger: { trigger: '[data-portrait]', start: 'top 90%', end: 'top 35%', scrub: 0.6 },
        },
      );
      gsap.fromTo(
        '[data-portrait] img',
        { scale: 1.35 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-portrait]', start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      // Bio lights up word by word as it crosses the viewport.
      gsap.fromTo(
        '[data-word]',
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: '[data-bio]', start: 'top 80%', end: 'bottom 45%', scrub: 0.4 },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [words.length]);

  const figures = [
    { label: 'Peer-reviewed papers', value: stats.publications },
    { label: 'Talks & posters', value: stats.talks },
    { label: 'Awards & medals', value: stats.awards },
    { label: 'Years teaching', value: stats.yearsTeaching },
  ];

  return (
    <section ref={root} id="about" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading index="01" label="About" lines={['Spin, structure', <span key="i" className="italic text-ink-2">& a little poetry.</span>]} />

        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div data-portrait className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-surface" style={{ clipPath: 'inset(0 round 28px)' }}>
              <img src="/images/portrait/sami.webp" alt={profile?.name ?? 'Portrait'} className="h-full w-full object-cover object-[35%_50%]" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] opacity-80">Fig. 1 — Golden hour</span>
                <span className="font-mono text-[0.65rem] opacity-80">m ∥ H</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:col-span-7">
            <p data-bio className="font-display text-[clamp(1.7rem,3.2vw,2.75rem)] leading-[1.18] tracking-[-0.01em] text-ink md:mb-16">
              {words.map((w, i) => (
                <span key={i} data-word>
                  {w}{' '}
                </span>
              ))}
            </p>

            <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:mt-auto md:pt-0">
              {figures.map((f, i) => (
                <Reveal key={f.label} delay={i * 0.08} className="bg-bg p-6 md:p-8">
                  <dd className="font-display text-6xl leading-none text-ink md:text-7xl">
                    <Counter value={f.value} />
                    {i === 3 && <span className="text-up">+</span>}
                  </dd>
                  <dt className="eyebrow mt-3">{f.label}</dt>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
