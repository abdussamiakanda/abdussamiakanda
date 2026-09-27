import { motion } from 'motion/react';
import { FiArrowUpRight, FiGithub } from 'react-icons/fi';
import ProjectCard from '../ProjectCard';
import { ArrowLink, SectionHeading } from '../ui/primitives';
import { Reveal } from '../ui/Reveal';
import { EASE } from '../../lib/motion';

function LinkList({ title, description, items, footer }) {
  return (
    <Reveal className="flex flex-col rounded-3xl border border-line p-6 md:p-8">
      <p className="eyebrow mb-3">{title}</p>
      {description && <p className="mb-6 line-clamp-3 text-sm text-ink-2">{description}</p>}
      <ul className="border-t border-line">
        {items.map((p) => (
          <li key={p.id} className="border-b border-line">
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-4">
              <span>
                <span className="block font-display text-2xl text-ink transition-colors group-hover:text-up">{p.name}</span>
                <span className="block text-sm text-ink-3">{p.description}</span>
              </span>
              <FiArrowUpRight className="shrink-0 text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </a>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-6">{footer}</div>}
    </Reveal>
  );
}

// Skills grouped by category, in data order; each group staggers in.
function Toolkit({ skills }) {
  const groups = [];
  for (const skill of skills) {
    const name = skill.category || 'Other';
    const group = groups.find((g) => g.name === name);
    if (group) group.items.push(skill);
    else groups.push({ name, items: [skill] });
  }

  return (
    <Reveal className="rounded-3xl border border-line p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <p className="eyebrow">Toolkit</p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-3">{skills.length} tools · {groups.length} areas</p>
      </div>
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {groups.map((group, gi) => (
          <motion.div
            key={group.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: (gi % 2) * 0.08 }}
            className="border-t border-line pt-4"
          >
            <h3 className="mb-3 flex items-baseline gap-3 text-sm text-ink">
              <span className="font-mono text-[0.65rem] text-up">{String(gi + 1).padStart(2, '0')}</span>
              {group.name}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.map((s) => (
                <li
                  key={s.id}
                  className="rounded-full border border-line px-3 py-1 text-[0.8rem] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

export default function Lab({ projects, programming, webDev, skills }) {
  return (
    <section id="lab" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading
          index="07"
          label="Lab"
          lines={['Tools built', <span key="i" className="italic text-ink-2">along the way.</span>]}
          aside="Simulations for research, packages for friends, and years of building for the web."
        />

        {projects.length > 0 && (
          <div className="mb-4 space-y-4">
            {projects.slice(0, 2).map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
            <div className="flex justify-end pt-2">
              <ArrowLink to="/projects">All projects</ArrowLink>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {programming?.projects?.length > 0 && (
            <LinkList
              title="Software"
              description={programming.description}
              items={programming.projects}
              footer={
                programming.githubUrl && (
                  <a href={programming.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
                    <FiGithub /> <span className="link-underline">GitHub profile</span>
                  </a>
                )
              }
            />
          )}
          {webDev?.projects?.length > 0 && <LinkList title="Web" description={webDev.description} items={webDev.projects} />}
          {skills.length > 0 && (
            <div className="lg:col-span-2">
              <Toolkit skills={skills} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
