import { motion, useReducedMotion } from 'motion/react';
import Header from './Header';
import Footer from './Footer';
import SEO from './SEO';
import { LineReveal, Reveal } from './ui/Reveal';
import { Loader } from './ui/primitives';

const EASE = [0.16, 1, 0.3, 1];

// Standard page frame: SEO, header, animated main, footer.
export default function Page({ seo, loading = false, children, className = '', headerProgress = true }) {
  const reduced = useReducedMotion();
  return (
    <div className="app">
      {seo && <SEO {...seo} />}
      <Header showProgress={headerProgress} />
      <motion.main
        className={`relative ${className}`}
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {loading ? <Loader /> : children}
      </motion.main>
      <Footer />
    </div>
  );
}

// Masthead for inner pages: eyebrow, oversized title, lede and a count.
export function PageHeader({ eyebrow, title, italic, lede, count, countLabel = 'entries', children }) {
  return (
    <header className="shell pb-14 pt-36 md:pb-20 md:pt-44">
      <Reveal className="eyebrow mb-8 flex items-center gap-3">
        <span className="h-px w-8 bg-up" />
        {eyebrow}
      </Reveal>
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <LineReveal
          as="h1"
          animateOnMount
          lines={italic ? [title, <span key="i" className="italic text-ink-2">{italic}</span>] : [title]}
          className="font-display text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.88] tracking-[-0.035em] text-ink md:col-span-9"
        />
        {typeof count === 'number' && (
          <Reveal delay={0.2} className="md:col-span-3 md:text-right">
            <span className="font-display text-6xl text-ink">{String(count).padStart(2, '0')}</span>
            <span className="eyebrow ml-2">{countLabel}</span>
          </Reveal>
        )}
      </div>
      {lede && (
        <Reveal delay={0.25} className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-2">
          {lede}
        </Reveal>
      )}
      {children}
    </header>
  );
}
