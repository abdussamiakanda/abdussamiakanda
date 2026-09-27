import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Page from './Page';
import Markdown from './ui/Markdown';
import { LineReveal, Reveal } from './ui/Reveal';
import { Button, Chip } from './ui/primitives';
import { formatDate, readingTime } from '../lib/format';

const hasBangla = (s = '') => /[ঀ-৿]/.test(s);

/**
 * Shared reader for notes, posts and scribbling.
 * `entry` needs title/content and may carry author, date, description,
 * imageUrl, tag, englishTitle and url.
 */
export default function ArticleLayout(props) {
  const { entry, section, backTo, loading, error, seoPath } = props;
  if (loading) return <Page loading />;

  if (error || !entry) {
    return (
      <Page seo={{ title: 'Not found' }}>
        <div className="shell flex min-h-[70vh] flex-col items-start justify-center pt-32">
          <p className="eyebrow mb-4">{section}</p>
          <h1 className="font-display text-6xl text-ink md:text-8xl">
            Lost in <span className="italic text-ink-2">phase space.</span>
          </h1>
          <p className="mt-6 text-ink-2">{error || 'This entry could not be found.'}</p>
          <Button to={backTo} variant="ghost" icon="right" className="mt-10">
            Back to {section}
          </Button>
        </div>
      </Page>
    );
  }

  // Keyed by path so scroll tracking re-measures when moving to prev/next.
  return <ArticleView key={seoPath} {...props} />;
}

// Cover image at its natural aspect ratio: never cropped, only capped in
// height so tall figures still fit on screen. It fades up into place.
function Cover({ src }) {
  const reduced = useReducedMotion();
  return (
    <div className="shell mb-16">
      <motion.figure
        initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center overflow-hidden rounded-3xl border border-line bg-surface p-4 md:p-8"
      >
        <img src={src} alt="" className="block h-auto max-h-[70vh] w-auto max-w-full rounded-xl object-contain" loading="lazy" />
      </motion.figure>
    </div>
  );
}

// Mounted only once the entry exists: useScroll binds to its target refs on
// mount, so they must already be attached to the rendered article body.
function ArticleView({ entry, section, backTo, prev, next, linkFor, verse = false, seoPath }) {
  const bodyRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: bodyRef, offset: ['start 80%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const bangla = hasBangla(entry.title);
  const minutes = readingTime(entry.content);

  return (
    <Page
      headerProgress={false}
      seo={{
        title: entry.title,
        description: entry.description || `Read: ${entry.title}`,
        url: seoPath,
        ogType: 'article',
        ogImage: entry.imageUrl || undefined,
      }}
    >
      {/* Reading progress, pinned just under the header. */}
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-up" style={{ scaleX: progress }} />

      <article>
        <header className="shell pb-12 pt-36 md:pt-44">
          <Reveal className="mb-10">
            <Link to={backTo} className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink">
              <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
              {section}
            </Link>
          </Reveal>
          <div className="flex flex-wrap items-center gap-3">
            {entry.tag && <Chip tone="up">{entry.tag}</Chip>}
            {entry.date && <span className="eyebrow">{formatDate(entry.date)}</span>}
            {!verse && <span className="eyebrow">· {minutes} min read</span>}
          </div>
          <LineReveal
            as="h1"
            animateOnMount
            lines={[entry.title]}
            className={`mt-6 max-w-5xl text-ink ${
              bangla ? 'bangla text-[clamp(2.4rem,6vw,4.8rem)] leading-[1.25]' : 'font-display text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.95] tracking-[-0.025em]'
            }`}
          />
          {entry.englishTitle && entry.englishTitle !== entry.title && (
            <p className="mt-4 font-display text-2xl italic text-ink-3">{entry.englishTitle}</p>
          )}
          {entry.description && !verse && (
            <Reveal delay={0.2} className="mt-8 max-w-3xl text-xl leading-relaxed text-ink-2">
              {entry.description}
            </Reveal>
          )}
        </header>

        {/* Skip the cover when the body already shows the same image. */}
        {entry.imageUrl && !verse && !entry.content?.includes(entry.imageUrl) && <Cover src={entry.imageUrl} />}

        <div className="shell grid gap-12 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-28 space-y-6 border-t border-line pt-6">
              <div>
                <p className="eyebrow mb-1">Written by</p>
                <p className="text-sm text-ink">{entry.author || 'Md Abdus Sami Akanda'}</p>
              </div>
              {entry.date && (
                <div>
                  <p className="eyebrow mb-1">Published</p>
                  <p className="text-sm text-ink">{formatDate(entry.date)}</p>
                </div>
              )}
              <div>
                <p className="eyebrow mb-2">Progress</p>
                <div className="h-px w-full bg-line">
                  <motion.div className="h-px origin-left bg-up" style={{ scaleX: progress }} />
                </div>
              </div>
              {entry.url && (
                <a href={entry.url} target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-up">
                  Original source ↗
                </a>
              )}
            </div>
          </aside>

          <div ref={bodyRef} className="min-w-0 lg:col-span-8">
            <Markdown className={`reading ${verse ? 'verse' : ''} ${bangla && !verse ? 'bangla' : ''} max-w-[68ch]`}>{entry.content}</Markdown>
            {entry.url && (
              <div className="mt-12 lg:hidden">
                <Button href={entry.url} variant="ghost">
                  Original source
                </Button>
              </div>
            )}
          </div>
        </div>

        {(prev || next) && (
          <nav className="shell mt-28 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2" aria-label="More entries">
            {[prev, next].map((item, i) =>
              item ? (
                <Link
                  key={i}
                  to={linkFor(item)}
                  className={`group flex flex-col gap-4 bg-bg p-8 transition-colors hover:bg-surface md:p-10 ${i === 1 ? 'md:items-end md:text-right' : ''}`}
                >
                  <span className="eyebrow flex items-center gap-2">
                    {i === 0 && <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />}
                    {i === 0 ? 'Previous' : 'Next'}
                    {i === 1 && <FiArrowRight className="transition-transform group-hover:translate-x-1" />}
                  </span>
                  <span className={`text-3xl leading-tight text-ink ${hasBangla(item.title) ? 'bangla text-2xl' : 'font-display'}`}>{item.title}</span>
                </Link>
              ) : (
                <div key={i} className="hidden bg-bg md:block" />
              ),
            )}
          </nav>
        )}
      </article>
    </Page>
  );
}
