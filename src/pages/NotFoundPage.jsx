import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import Page from '../components/Page';
import SpinField from '../components/ui/SpinField';
import { Button } from '../components/ui/primitives';

function NotFoundPage() {
  const digitsRef = useRef(null);

  // Digits tumble in like spins flipping into alignment.
  useEffect(() => {
    const digits = digitsRef.current?.querySelectorAll('[data-digit]');
    if (!digits?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const anim = animate(digits, {
      rotateX: [180, 0],
      opacity: [0, 1],
      translateY: ['40%', '0%'],
      delay: stagger(140),
      duration: 1400,
      ease: 'outElastic(1, .6)',
    });
    return () => anim.pause();
  }, []);

  return (
    <Page seo={{ title: 'Page not found', description: 'This page does not exist.' }}>
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <SpinField className="absolute inset-0 h-full w-full opacity-70" spacing={40} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/70" />
        <div className="shell relative pt-24">
          <p className="eyebrow mb-6">Error · 404 · Unbound state</p>
          {/* Line height 1 keeps the serif's full glyph height; each digit gets
              a little padding because gradient text only paints inside its box,
              which would otherwise shave off the italic 0's slant. */}
          <h1
            ref={digitsRef}
            className="flex items-baseline gap-[0.02em] font-display text-[clamp(7rem,28vw,20rem)] leading-none text-ink"
            style={{ perspective: 800 }}
          >
            {['4', '0', '4'].map((d, i) => (
              <span
                key={i}
                data-digit
                className={`inline-block py-[0.04em] ${i === 1 ? '-mx-[0.04em] px-[0.12em] italic text-gradient-spin' : ''}`}
              >
                {d}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-lg text-xl text-ink-2">
            This page tunnelled somewhere we can’t observe. Move your cursor — the spins will point you home.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/" icon="right">
              Back home
            </Button>
            <Button to="/publications" variant="ghost">
              Publications
            </Button>
          </div>
        </div>
      </section>
    </Page>
  );
}

export default NotFoundPage;
