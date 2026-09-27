import { motion } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import PublicationItem from '../components/PublicationItem';
import ProjectCard from '../components/ProjectCard';
import Precession from '../components/ui/Precession';
import TeX from '../components/ui/TeX';
import Counter from '../components/ui/Counter';
import { ArrowLink, Button, Chip } from '../components/ui/primitives';
import { Reveal, Stagger } from '../components/ui/Reveal';
import { staggerItem } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { formatRange, toDate } from '../lib/format';
import { getSocialIcon } from '../lib/socialIcons';
import { BROAD_AREA, INTERESTS, LLG_TEX, SPECIFIC_AREAS } from '../lib/research';
import training from '../data/researchTraining.json';
import { getPersonalProjects, getPublications, getResearch, getResearchMetadata, getSpeeches } from '../services/dataService';

// Small numbered heading for the sections of this page.
function Block({ index, title, aside, children, id }) {
  return (
    <section id={id} className="shell py-16 md:py-24">
      <Reveal className="mb-10 grid gap-4 border-t border-line pt-6 md:grid-cols-12">
        <p className="eyebrow md:col-span-3">
          <span className="text-up">{index}</span> — {title}
        </p>
        {aside && <p className="text-ink-2 md:col-span-7 md:col-start-6">{aside}</p>}
      </Reveal>
      {children}
    </section>
  );
}

const byStartDesc = (a, b) => (toDate(b.start)?.getTime() ?? 0) - (toDate(a.start)?.getTime() ?? 0);

function ResearchPage() {
  const { data, loading } = useAsync(
    async () => {
      const [positions, meta, pubs, talks, projects] = await Promise.all([
        getResearch(),
        getResearchMetadata(),
        getPublications(),
        getSpeeches(),
        getPersonalProjects(),
      ]);
      return { positions, links: meta?.profileLinks ?? [], pubs, talks, projects };
    },
    [],
    null,
  );

  if (loading || !data) return <Page loading seo={{ title: 'Research' }} />;

  // Software projects (e.g. GitLaTeX) live on the Projects page, not here.
  const researchProjects = data.projects.filter((p) => p.category !== 'software');

  const published = data.pubs.filter((p) => !p.status);
  const inReview = data.pubs.filter((p) => p.status);
  const figures = [
    { label: 'Journal articles', value: published.length },
    { label: 'Under review', value: inReview.length },
    { label: 'Talks & posters', value: data.talks.length },
    { label: 'Workshops & schools', value: training.length },
  ];

  return (
    <Page seo={{ title: 'Research', description: 'Research in spintronics, magnetization dynamics and spin waves.', url: '/research' }}>
      <PageHeader
        eyebrow={`Research · ${BROAD_AREA}`}
        title="Magnetization,"
        italic="in motion."
        lede="I study how the magnetization of tiny structures can be steered quickly, cheaply and reliably: domain walls pushed by heat, nanoparticles flipped by chirped microwaves, and spin waves travelling through patterned magnets. The tools are theory and simulation, built on the Landau–Lifshitz–Gilbert equation."
      >
        <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-3">
          <Button to="/publications" icon="right">
            Publications
          </Button>
          <Button to="/speeches" variant="ghost" icon="right">
            Talks &amp; posters
          </Button>
        </Reveal>
      </PageHeader>

      {/* Output at a glance */}
      <section className="shell">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
          {figures.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.06} className="bg-bg p-6 md:p-8">
              <dd className="font-display text-6xl leading-none text-ink">
                <Counter value={f.value} />
              </dd>
              <dt className="eyebrow mt-3">{f.label}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      <Block index="01" title="Interests" aside={`Broad area: ${BROAD_AREA}. Within it, the questions I keep returning to:`}>
        <Stagger className="grid gap-4 md:grid-cols-12">
          <motion.div variants={staggerItem} className="rounded-3xl border border-line bg-surface p-6 md:col-span-5 md:row-span-3 md:p-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Fig. 1 — Gilbert damping</span>
              <Chip tone="up">LLG</Chip>
            </div>
            <Precession className="mx-auto mt-4 w-full max-w-[380px]" />
            <TeX display className="no-scrollbar mt-2 overflow-x-auto text-ink [&_.katex-display]:my-2" fallback="∂m/∂t = −γ m × H_eff + α m × ∂m/∂t">
              {LLG_TEX}
            </TeX>
            <p className="mt-3 text-sm text-ink-3">
              A moment precesses about the effective field and, through damping α, spirals in to align with it. Nearly every problem below starts from this equation.
            </p>
          </motion.div>

          {INTERESTS.map((it, i) => (
            <motion.div key={it.title} variants={staggerItem} className="group rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-line-strong md:col-span-7">
              <div className="flex items-start gap-5">
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-mono text-sm transition-transform duration-500 group-hover:rotate-[-8deg] ${
                    it.tone === 'up' ? 'bg-up-soft text-up' : 'bg-down-soft text-down'
                  }`}
                >
                  {it.k}
                </span>
                <div>
                  <p className="font-mono text-[0.65rem] text-ink-3">R/{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 font-display text-3xl text-ink">{it.title}</h3>
                  <p className="mt-2 text-ink-2">{it.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </Stagger>

        <Reveal className="mt-6 rounded-3xl border border-line p-6 md:p-8">
          <p className="eyebrow mb-4">Specific areas</p>
          <ul className="flex flex-wrap gap-2">
            {SPECIFIC_AREAS.map((a) => (
              <li key={a} className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-up hover:text-up">
                {a}
              </li>
            ))}
          </ul>
        </Reveal>
      </Block>

      {data.positions.length > 0 && (
        <Block index="02" title="Positions">
          <ul className="border-t border-line">
            {data.positions.map((p) => (
              <Reveal as="li" key={p.id} className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-8">
                <p className="eyebrow md:col-span-3">{formatRange(p.startDate, p.endDate, { style: 'short' })}</p>
                <div className="md:col-span-9">
                  <h3 className="font-display text-3xl text-ink md:text-4xl">{p.institution}</h3>
                  <p className="mt-1 text-ink-2">{p.role}</p>
                  {p.description && <p className="mt-3 max-w-2xl text-ink-3">{p.description}</p>}
                </div>
              </Reveal>
            ))}
          </ul>
        </Block>
      )}

      {data.pubs.length > 0 && (
        <Block
          index="03"
          title="Recent papers"
          aside={
            <>
              The latest work, including manuscripts under review.{' '}
              <ArrowLink to="/publications" className="ml-1">
                All {data.pubs.length}
              </ArrowLink>
            </>
          }
        >
          <div className="border-t border-line">
            {data.pubs.slice(0, 4).map((pub, i) => (
              <PublicationItem key={pub.id} pub={pub} index={data.pubs.length - i} />
            ))}
          </div>
        </Block>
      )}

      {researchProjects.length > 0 && (
        <Block index="04" title="Simulation projects">
          <div className="space-y-4">
            {researchProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </Block>
      )}

      <Block index="05" title="Training" aside="Schools, workshops and seminar series that shaped the toolkit, from MuMax3 to spin-orbitronics.">
        <ul className="border-t border-line">
          {[...training].sort(byStartDesc).map((t) => (
            <Reveal as="li" key={t.id} className="grid gap-2 border-b border-line py-6 md:grid-cols-12 md:gap-8">
              <p className="eyebrow md:col-span-3">{formatRange(t.start, t.end, { style: 'short' })}</p>
              <div className="md:col-span-7">
                <h3 className="font-display text-2xl leading-tight text-ink">{t.title}</h3>
                <p className="mt-1 text-sm text-ink-3">{t.organizer}</p>
              </div>
              <div className="md:col-span-2 md:text-right">
                <Chip tone={t.kind === 'Course' ? 'up' : 'default'}>{t.kind}</Chip>
              </div>
            </Reveal>
          ))}
        </ul>
      </Block>

      {data.links.length > 0 && (
        <section className="shell pt-8">
          <Reveal className="flex flex-wrap items-center gap-3 rounded-3xl border border-line p-4">
            <span className="eyebrow px-2">Find the work on</span>
            {data.links.map((l) => {
              const Icon = getSocialIcon(l.label);
              return (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-ink-2 transition-colors hover:border-ink hover:text-ink"
                >
                  <Icon /> {l.label}
                  <FiArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              );
            })}
          </Reveal>
        </section>
      )}
    </Page>
  );
}

export default ResearchPage;
