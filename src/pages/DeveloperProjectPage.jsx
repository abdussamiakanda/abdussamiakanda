import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import Page from '../components/Page';
import Markdown from '../components/ui/Markdown';
import { LinkPill } from '../components/developer/DevProjectCard';
import { Button, Chip } from '../components/ui/primitives';
import { LineReveal, Reveal } from '../components/ui/Reveal';
import useAsync from '../lib/useAsync';
import { STATUS, projectLinks } from '../lib/developer';
import { getDeveloper } from '../services/dataService';
import { developerProjectMeta } from '../lib/pageMeta';

function DeveloperProjectPage() {
  const { slug } = useParams();
  const { data, loading } = useAsync(getDeveloper, [], null);

  if (loading) return <Page loading />;

  const flagships = (data?.projects ?? []).filter((p) => p.overview);
  const i = flagships.findIndex((p) => p.slug === slug);
  const project = flagships[i];

  if (!project) {
    return (
      <Page seo={{ title: 'Project not found', noindex: true }}>
        <div className="shell flex min-h-[70vh] flex-col items-start justify-center pt-32">
          <p className="eyebrow mb-4">Developer</p>
          <h1 className="font-display text-6xl text-ink md:text-8xl">
            Not built <span className="italic text-ink-2">here.</span>
          </h1>
          <p className="mt-6 text-ink-2">That project could not be found.</p>
          <Button to="/developer" variant="ghost" icon="right" className="mt-10">
            All projects
          </Button>
        </div>
      </Page>
    );
  }

  const category = data.categories.find((c) => c.id === project.category)?.label;
  const next = flagships[(i + 1) % flagships.length];
  const facts = [
    { label: 'Years', value: project.years },
    { label: 'Status', value: STATUS[project.status]?.label },
    { label: 'Role', value: project.role },
    { label: 'Studio', value: project.org },
    { label: 'Area', value: category },
  ]
    .filter((f) => f.value)
    .slice(0, 3);

  return (
    <Page seo={developerProjectMeta(project)}>
      <article>
        <header className="shell pb-16 pt-36 md:pt-44">
          <Reveal className="mb-10">
            <Link to="/developer" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink">
              <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Developer
            </Link>
          </Reveal>
          <p className="eyebrow mb-6">{category}</p>
          <LineReveal
            as="h1"
            animateOnMount
            lines={[project.title]}
            className="max-w-6xl font-display text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.025em] text-ink"
          />
          <Reveal delay={0.2} className="mt-8 max-w-3xl text-xl text-ink-2">
            {project.tagline}
          </Reveal>

          <Reveal delay={0.3} className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="bg-bg p-6">
                <p className="eyebrow mb-2">{f.label}</p>
                <p className="text-ink">{f.value}</p>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2 bg-bg p-6">
              {projectLinks(project, { withDetail: false }).map((l, li) => (
                <LinkPill key={l.key} link={l} solid={li === 0} />
              ))}
            </div>
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack?.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </header>

        <div className="shell">
          <Markdown raw className="reading mx-auto max-w-[68ch]">
            {project.overview}
          </Markdown>
        </div>

        {project.services?.length > 0 && (
          <section className="shell mt-20" aria-label="Apps">
            <p className="eyebrow mb-6 border-t border-line pt-6">
              <span className="text-up">{String(project.services.length).padStart(2, '0')}</span> — Apps on the platform
            </p>
            {/* Cells draw their own right/bottom rules and overhang by 1px; the
                list clips the outer ones, so a short last row leaves no gap. */}
            <ul className="grid overflow-hidden rounded-3xl border border-line sm:grid-cols-2 lg:grid-cols-3">
              {project.services.map((s) => (
                <li key={s.url} className="-mb-px -mr-px border-b border-r border-line">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col gap-2 p-6 transition-colors hover:bg-surface">
                    <span className="flex items-center justify-between gap-3 font-display text-2xl text-ink">
                      {s.label}
                      <FiArrowUpRight className="shrink-0 text-base text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-up" />
                    </span>
                    <span className="text-sm text-ink-2">{s.description}</span>
                    <span className="mt-auto pt-2 font-mono text-[0.65rem] text-ink-3">{s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {next && next.slug !== project.slug && (
          <nav className="shell mt-28" aria-label="Next project">
            <Link
              to={`/developer/${next.slug}`}
              className="group flex flex-col gap-4 rounded-3xl border border-line bg-surface p-8 transition-colors hover:border-line-strong md:flex-row md:items-end md:justify-between md:p-10"
            >
              <span>
                <span className="eyebrow mb-3 block">Next project</span>
                <span className="font-display text-4xl text-ink md:text-5xl">{next.title}</span>
                <span className="mt-2 block text-ink-2">{next.tagline}</span>
              </span>
              <FiArrowRight className="shrink-0 text-2xl text-ink-2 transition-transform group-hover:translate-x-1 group-hover:text-up" />
            </Link>
          </nav>
        )}
      </article>
    </Page>
  );
}

export default DeveloperProjectPage;
