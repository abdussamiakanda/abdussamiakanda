import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Chip } from '../ui/primitives';
import { EASE } from '../../lib/motion';
import { STATUS, projectLinks } from '../../lib/developer';

export function LinkPill({ link, solid = false }) {
  const Icon = link.icon;
  const cls = solid
    ? 'bg-ink text-bg hover:bg-up hover:text-on-up'
    : 'border border-line-strong text-ink hover:border-ink';
  const body = (
    <>
      <Icon className="shrink-0" /> <span className="truncate">{link.label}</span>
    </>
  );
  const base = `inline-flex h-10 max-w-full items-center gap-2 rounded-full px-4 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-colors ${cls}`;
  return link.to ? (
    <Link to={link.to} className={base}>
      {body}
    </Link>
  ) : (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={base}>
      {body}
    </a>
  );
}

function Status({ status }) {
  const s = STATUS[status] ?? STATUS.source;
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-2">
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/**
 * A built project. `variant="feature"` is the large card used for flagships;
 * the default is the compact tile used in the full grid.
 */
export default function DevProjectCard({ project, category, index = 0, variant = 'tile' }) {
  const links = projectLinks(project);
  const detail = project.overview ? `/developer/${project.slug}` : null;
  const title = detail ? (
    <Link to={detail} className="link-underline">
      {project.title}
    </Link>
  ) : (
    project.title
  );

  if (variant === 'feature') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: EASE, delay: (index % 2) * 0.08 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-7 md:p-9"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-up opacity-0 blur-[90px] transition-opacity duration-700 group-hover:opacity-20" />
        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-xs text-ink-3">D/{String(index + 1).padStart(2, '0')}</span>
          {category && <span className="eyebrow">{category}</span>}
          <span className="eyebrow">{project.years}</span>
          {project.org && <span className="eyebrow text-up">{project.org}</span>}
          <span className="ml-auto">
            <Status status={project.status} />
          </span>
        </div>
        <h3 className="relative mt-6 font-display text-4xl leading-[1.02] text-ink md:text-5xl">{title}</h3>
        <p className="relative mt-3 text-lg text-ink">{project.tagline}</p>
        {project.role && <p className="relative mt-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-up">{project.role}</p>}
        <p className="relative mt-3 max-w-2xl text-ink-2">{project.description}</p>
        {project.services?.length > 0 && (
          <p className="relative mt-4 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-3">
            {project.services.length} connected apps · {project.services.slice(1, 5).map((s) => s.label).join(' · ')} …
          </p>
        )}
        <div className="relative mt-6 flex flex-wrap gap-2">
          {project.stack?.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
        <div className="relative mt-auto flex flex-wrap gap-2 pt-8">
          {links.map((l, i) => (
            <LinkPill key={l.key} link={l} solid={i === 0} />
          ))}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="group flex h-full flex-col rounded-3xl border border-line bg-bg p-6 transition-colors hover:border-line-strong"
    >
      <div className="flex items-center justify-between gap-3">
        <Status status={project.status} />
        <span className="font-mono text-[0.65rem] text-ink-3">
          {project.org && <span className="mr-2 text-up">{project.org}</span>}
          {project.years}
        </span>
      </div>
      <h3 className="mt-5 font-display text-3xl leading-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-2">{project.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack?.slice(0, 4).map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6">
        {links.map((l) => {
          const Icon = l.icon;
          const cls = 'inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:text-up';
          return l.to ? (
            <Link key={l.key} to={l.to} className={cls}>
              <Icon /> {l.label}
            </Link>
          ) : (
            <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
              <Icon /> {l.label}
            </a>
          );
        })}
      </div>
    </motion.article>
  );
}
