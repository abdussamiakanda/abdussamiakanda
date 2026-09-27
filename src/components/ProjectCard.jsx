import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowUpRight, FiGithub, FiPlay, FiFileText } from 'react-icons/fi';
import { Chip } from './ui/primitives';
import { EASE } from '../lib/motion';
import { formatRange, siteLabel } from '../lib/format';
import { generateSlug } from '../services/dataService';

// Large project row with technologies and every available link.
export default function ProjectCard({ project, index }) {
  const caseStudy = project.overview ? `/projects/case/${generateSlug(project.title)}` : null;
  const links = [
    caseStudy && { label: 'Case study', to: caseStudy, icon: FiFileText, internal: true },
    project.website && { label: siteLabel(project.website), href: project.website, icon: FiArrowUpRight },
    project.demo && { label: 'Demo', href: `/demo/${project.demo}`, icon: FiPlay },
    project.github && { label: 'GitHub', href: project.github, icon: FiGithub },
  ].filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-7 md:p-10"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-up opacity-0 blur-[90px] transition-opacity duration-700 group-hover:opacity-20" />
      <div className="relative grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-ink-3">P/{String(index + 1).padStart(2, '0')}</span>
            <span className="eyebrow">{formatRange(project.startDate, project.endDate, { ongoing: 'Ongoing' })}</span>
          </div>
          <h3 className="mt-5 font-display text-4xl leading-[1.02] text-ink md:text-5xl">
            {caseStudy ? (
              <Link to={caseStudy} className="link-underline">
                {project.title}
              </Link>
            ) : (
              project.title
            )}
          </h3>
          <p className="mt-5 max-w-2xl text-ink-2">{project.description}</p>
        </div>
        <div className="flex flex-col justify-between gap-6 md:col-span-4 md:items-end">
          <div className="flex flex-wrap gap-2 md:justify-end">
            {project.technologies?.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {links.map(({ label, to, href, icon, internal }) => {
              const Icon = icon;
              return internal ? (
                <Link
                  key={label}
                  to={to}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-bg transition-colors hover:bg-up hover:text-on-up"
                >
                  <Icon /> {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
                >
                  <Icon /> {label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
