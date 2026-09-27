import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FiArrowUpRight, FiPlus } from 'react-icons/fi';
import { Chip } from './ui/primitives';
import { EASE } from '../lib/motion';
import { doiFromUrl, parseJournal, splitAuthors } from '../lib/academic';

export function Authors({ children, className = '' }) {
  const [before, me, after] = splitAuthors(children);
  return (
    <p className={`text-sm text-ink-2 ${className}`}>
      {before}
      {me && <span className="font-medium text-ink underline decoration-up decoration-2 underline-offset-4">{me}</span>}
      {after}
    </p>
  );
}

// One publication row: number, title, venue, metrics and an expandable abstract.
export default function PublicationItem({ pub, index }) {
  const [open, setOpen] = useState(false);
  const journal = parseJournal(pub.journal);
  const doi = doiFromUrl(pub.url);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="group relative grid gap-4 border-b border-line py-10 md:grid-cols-12 md:gap-8"
    >
      <div className="flex items-start justify-between md:col-span-2 md:block">
        <span className="font-mono text-xs text-ink-3">[{String(index).padStart(2, '0')}]</span>
        <span className="font-display text-4xl text-ink md:mt-2 md:block">{pub.year}</span>
      </div>

      <div className="md:col-span-7">
        <h3 className="font-display text-[1.75rem] leading-[1.1] text-ink transition-colors md:text-[2.1rem]">
          {pub.url ? (
            <a href={pub.url} target="_blank" rel="noopener noreferrer" className="link-underline">
              {pub.title}
            </a>
          ) : (
            pub.title
          )}
        </h3>
        <Authors className="mt-4">{pub.authors}</Authors>
        <p className="mt-2 text-sm">
          {pub.status && <span className="text-ink-3">Submitted to </span>}
          <span className="italic text-ink">{journal.venue}</span>
          {journal.details && <span className="text-ink-3">, {journal.details}</span>}
        </p>

        <AnimatePresence initial={false}>
          {open && pub.description && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <span className="mt-5 block border-l-2 border-up pl-4 text-ink-2">{pub.description}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-start gap-2 md:col-span-3 md:flex-col md:items-end">
        <div className="flex flex-wrap gap-2 md:justify-end">
          {pub.status && <Chip tone="up">{pub.status}</Chip>}
          {journal.quartile && <Chip tone={journal.quartile === 'Q1' ? 'up' : 'down'}>{journal.quartile}</Chip>}
          {journal.impact && <Chip>IF {journal.impact}</Chip>}
        </div>
        <div className="flex items-center gap-2 md:mt-auto">
          {pub.description && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex h-10 items-center gap-2 rounded-full border border-line px-4 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              <FiPlus className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`} />
              Abstract
            </button>
          )}
          {pub.url && (
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              title={doi ?? 'Open publication'}
              className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-bg transition-colors hover:bg-up hover:text-on-up"
            >
              {doi ? 'DOI' : 'Open'} <FiArrowUpRight />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
