import DevProjectCard from '../developer/DevProjectCard';
import Toolkit from '../developer/Toolkit';
import { ArrowLink, Chip, SectionHeading } from '../ui/primitives';
import ProfileLinks from '../ui/ProfileLinks';
import { Reveal } from '../ui/Reveal';
import { shippedCount } from '../../lib/developer';
import { formatRange } from '../../lib/format';

// Home section for the developer side: flagship projects, then the toolkit.
export default function Developer({ developer, skills }) {
  const projects = developer?.projects ?? [];
  const featured = projects.filter((p) => p.featured);
  const categoryLabel = Object.fromEntries((developer?.categories ?? []).map((c) => [c.id, c.label]));

  return (
    <section id="developer" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading
          index="03"
          label="Developer"
          lines={['Full stack,', <span key="i" className="italic text-ink-2">end to end.</span>]}
          aside={
            <>
              <p>{developer?.intro}</p>
              <ArrowLink to="/developer" className="mt-5">
                All {shippedCount(projects)} shipped projects
              </ArrowLink>
            </>
          }
        />

        {/* Positions, laid out like the Research section's. */}
        {developer?.positions?.length > 0 && (
          <Reveal className="mb-4 rounded-3xl border border-line bg-surface p-6 md:p-8">
            <p className="eyebrow mb-6">Positions</p>
            <ul className="space-y-6">
              {developer.positions.map((p) => (
                <li key={p.id} className="grid gap-2 border-b border-line pb-6 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:gap-6">
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-ink md:text-3xl">{p.organization}</h3>
                    <p className="mt-1 text-sm text-ink-2">{p.role}</p>
                    {p.description && <p className="mt-3 max-w-3xl text-sm text-ink-3">{p.description}</p>}
                  </div>
                  <div className="flex items-start gap-2 sm:flex-col sm:items-end">
                    {!p.endDate && <Chip tone="up">Current</Chip>}
                    <span className="eyebrow whitespace-nowrap">{formatRange(p.startDate, p.endDate)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {featured.length > 0 && (
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            {featured.map((p, i) => (
              <DevProjectCard key={p.slug} project={p} category={categoryLabel[p.category]} index={i} variant="feature" />
            ))}
          </div>
        )}

        {skills.length > 0 && <Toolkit skills={skills} />}

        {developer?.profileLinks?.length > 0 && (
          <Reveal className="mt-4 flex flex-wrap items-center gap-3 rounded-3xl border border-line p-4">
            <ProfileLinks links={developer.profileLinks} />
          </Reveal>
        )}
      </div>
    </section>
  );
}
