import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import Marquee from '../ui/Marquee';
import { ArrowLink, Chip, SectionHeading } from '../ui/primitives';
import { Reveal, Stagger } from '../ui/Reveal';
import { staggerItem } from '../../lib/motion';
import { formatRange } from '../../lib/format';

export default function Teaching({ roles, meta, courses }) {
  const subjects = meta?.generalSubjects ?? [];
  return (
    <section id="teaching" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading
          index="06"
          label="Teaching"
          lines={['Explaining it', <span key="i" className="italic text-ink-2">is how I learn it.</span>]}
          aside={meta?.description}
        />
      </div>

      {subjects.length > 0 && (
        <Marquee speed={45} className="mb-16 border-y border-line py-6">
          {subjects.map((s) => (
            <span key={s} className="flex items-center gap-8 pr-8 font-display text-4xl italic text-ink-2 md:text-6xl">
              {s}
              <span className="h-2 w-2 rounded-full bg-up" />
            </span>
          ))}
        </Marquee>
      )}

      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-6">Roles</p>
          <ul className="space-y-4">
            {roles.map((r) => (
              <Reveal as="li" key={r.id} className="rounded-3xl border border-line p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-ink">{r.role}</h3>
                    <p className="mt-1 text-sm text-ink-2">{r.institution}</p>
                  </div>
                  {!r.endDate && <Chip tone="up">Current</Chip>}
                </div>
                {r.subjects?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.subjects.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                )}
                <p className="eyebrow mt-4">{formatRange(r.startDate, r.endDate)}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <p className="eyebrow">Courses designed &amp; taught</p>
            <ArrowLink to="/courses">All courses</ArrowLink>
          </div>
          <Stagger as="ul" className="grid gap-4 sm:grid-cols-2">
            {courses.slice(0, 4).map((c) => (
              <motion.li key={c.id} variants={staggerItem}>
                <Link to={`/courses/${c.slug}`} className="group block overflow-hidden rounded-3xl border border-line bg-surface">
                  <div className="aspect-[16/9] overflow-hidden bg-surface-2">
                    {c.imageUrl && (
                      <img src={c.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <h3 className="font-display text-2xl leading-tight text-ink">{c.title}</h3>
                      <p className="eyebrow mt-1">{c.language}</p>
                    </div>
                    <FiArrowUpRight className="shrink-0 text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-up" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
