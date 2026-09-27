import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiPlay, FiArrowUpRight } from 'react-icons/fi';
import Page from '../components/Page';
import Markdown from '../components/ui/Markdown';
import { Button, Chip } from '../components/ui/primitives';
import { LineReveal, Reveal } from '../components/ui/Reveal';
import useAsync from '../lib/useAsync';
import { formatRange, siteLabel } from '../lib/format';
import { getPersonalProjects, generateSlug } from '../services/dataService';

function CaseStudyPage() {
  const { slug } = useParams();
  const { data: project, loading } = useAsync(async () => {
    const projects = await getPersonalProjects();
    return projects.find((p) => generateSlug(p.title) === slug) ?? null;
  }, [slug]);

  if (loading) return <Page loading />;

  if (!project || !project.overview?.trim()) {
    return (
      <Page seo={{ title: 'Case study not found' }}>
        <div className="shell flex min-h-[70vh] flex-col items-start justify-center pt-32">
          <p className="eyebrow mb-4">Case study</p>
          <h1 className="font-display text-6xl text-ink md:text-8xl">
            Not written <span className="italic text-ink-2">yet.</span>
          </h1>
          <p className="mt-6 text-ink-2">{project ? 'This project does not have a case study.' : 'That project could not be found.'}</p>
          <Button to="/projects" variant="ghost" icon="right" className="mt-10">
            Browse all projects
          </Button>
        </div>
      </Page>
    );
  }

  const facts = [
    { label: 'Timeline', value: formatRange(project.startDate, project.endDate, { style: 'long', ongoing: 'Ongoing' }) },
    { label: 'Stack', value: project.technologies?.join(', ') },
  ].filter((f) => f.value);

  return (
    <Page seo={{ title: project.title, description: project.description || `Case study: ${project.title}`, url: `/projects/case/${slug}`, ogType: 'article' }}>
      <article>
        <header className="shell pb-16 pt-36 md:pt-44">
          <Reveal className="mb-10">
            <Link to="/projects" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink">
              <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Projects
            </Link>
          </Reveal>
          <p className="eyebrow mb-6">Case study</p>
          <LineReveal
            as="h1"
            animateOnMount
            lines={[project.title]}
            className="max-w-6xl font-display text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.025em] text-ink"
          />
          {project.description && (
            <Reveal delay={0.2} className="mt-8 max-w-3xl text-xl text-ink-2">
              {project.description}
            </Reveal>
          )}

          <Reveal delay={0.3} className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="bg-bg p-6">
                <p className="eyebrow mb-2">{f.label}</p>
                <p className="text-ink">{f.value}</p>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2 bg-bg p-6">
              {project.website && (
                <Button href={project.website} variant="ghost">
                  {siteLabel(project.website)}
                </Button>
              )}
              {project.demo && (
                <a href={`/demo/${project.demo}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-ink">
                  <FiPlay /> Demo
                </a>
              )}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-ink">
                  <FiGithub /> GitHub <FiArrowUpRight />
                </a>
              )}
            </div>
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.technologies?.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </header>

        <div className="shell">
          <Markdown raw className="reading mx-auto max-w-[68ch]">
            {project.overview}
          </Markdown>
        </div>
      </article>
    </Page>
  );
}

export default CaseStudyPage;
