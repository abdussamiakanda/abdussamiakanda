import { motion } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import { SectionHeading } from '../ui/primitives';
import { EASE } from '../../lib/motion';
import { yearOf } from '../../lib/format';

export default function Awards({ awards }) {
  if (!awards.length) return null;
  return (
    <section id="recognition" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading
          index="05"
          label="Recognition"
          lines={['Problems,', <span key="i" className="italic text-ink-2">solved under pressure.</span>]}
          aside="International physics competitions and conference honours — mostly earned solving hard problems against the clock."
        />
        <ul className="border-t border-line">
          {awards.map((a, i) => {
            const Row = a.website ? motion.a : motion.div;
            return (
              <li key={a.id} className="border-b border-line">
                <Row
                  {...(a.website ? { href: a.website, target: '_blank', rel: 'noopener noreferrer' } : {})}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.8, ease: EASE, delay: Math.min(i, 5) * 0.05 }}
                  className="group relative isolate grid grid-cols-12 items-center gap-4 overflow-hidden py-6 md:py-8"
                >
                  <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-surface transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
                  <span className="col-span-3 font-mono text-sm text-ink-3 transition-colors group-hover:text-up md:col-span-1 md:pl-4">{yearOf(a.date)}</span>
                  <span className="col-span-9 font-display text-3xl leading-none text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-3 md:col-span-4 md:text-4xl">
                    {a.title}
                  </span>
                  <span className="col-span-12 text-sm text-ink-2 md:col-span-6">
                    {a.description}
                    {a.featuredIn && (
                      <>
                        {' '}
                        <span className="text-ink-3">· Featured in </span>
                        {a.featuredInUrl ? (
                          <span
                            role="link"
                            tabIndex={0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(a.featuredInUrl, '_blank', 'noopener');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && window.open(a.featuredInUrl, '_blank', 'noopener')}
                            className="cursor-pointer text-up underline underline-offset-4"
                          >
                            {a.featuredIn}
                          </span>
                        ) : (
                          <span className="text-ink">{a.featuredIn}</span>
                        )}
                      </>
                    )}
                  </span>
                  <span className="hidden justify-end pr-4 md:col-span-1 md:flex">
                    {a.website && (
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 transition-all duration-500 group-hover:rotate-45 group-hover:border-up group-hover:bg-up group-hover:text-on-up">
                        <FiArrowUpRight />
                      </span>
                    )}
                  </span>
                </Row>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
