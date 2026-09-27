import { useEffect, useMemo } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Page from '../components/Page';
import PublicationItem from '../components/PublicationItem';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Research from '../components/home/Research';
import Trajectory from '../components/home/Trajectory';
import Awards from '../components/home/Awards';
import Teaching from '../components/home/Teaching';
import Lab from '../components/home/Lab';
import Writing from '../components/home/Writing';
import Beyond from '../components/home/Beyond';
import Marquee from '../components/ui/Marquee';
import { ArrowLink, SectionHeading } from '../components/ui/primitives';
import useAsync from '../lib/useAsync';
import { toDate, yearOf } from '../lib/format';
import * as api from '../services/dataService';

const KEYWORDS = ['Spintronics', 'Domain-wall dynamics', 'Spin-transfer torque', 'Spin-orbit torque', 'Spin waves', 'Magnonic crystals', 'LLG equation', 'Magnetic nanowires'];

const settle = (p, fallback) => p.then((v) => v ?? fallback).catch(() => fallback);

async function loadHome() {
  const [
    profile, research, researchMeta, publications, speeches, teaching, teachingMeta, courses,
    education, activities, awards, projects, programming, webDev, skills, notes, posts, scribbles,
    gallery, curations, hobbies,
  ] = await Promise.all([
    settle(api.getProfile(), null),
    settle(api.getResearch(), []),
    settle(api.getResearchMetadata(), null),
    settle(api.getPublications(), []),
    settle(api.getSpeeches(), []),
    settle(api.getTeaching(), []),
    settle(api.getTeachingMetadata(), null),
    settle(api.getCourses(), []),
    settle(api.getEducation(), []),
    settle(api.getActivities(), []),
    settle(api.getAwards(), []),
    settle(api.getPersonalProjects(), []),
    settle(Promise.all([api.getProgramming(), api.getProgrammingProjects()]).then(([m, projects]) => ({ ...m, projects })), null),
    settle(Promise.all([api.getWebDevelopment(), api.getWebDevProjects()]).then(([m, projects]) => ({ ...m, projects })), null),
    settle(api.getSkills(), []),
    settle(api.getNotes(), []),
    settle(api.getPosts(), []),
    settle(api.getScribblingEntries(), []),
    settle(api.getGallery(), []),
    settle(api.getCurationsEntries(), []),
    settle(api.getHobbies(), []),
  ]);
  return {
    profile, research, researchMeta, publications, speeches, teaching, teachingMeta, courses,
    education, activities, awards, projects, programming, webDev, skills, notes, posts, scribbles,
    gallery, curations, hobbies,
  };
}

// Education, research, teaching and leadership merged into one chronology.
function buildMilestones(d) {
  const primary = /primary school/i;
  return [
    ...d.education
      .filter((e) => !primary.test(e.degree))
      .map((e) => ({ key: e.id, kind: 'Education', title: e.degree, org: e.institution, start: e.startDate, end: e.endDate })),
    ...d.research.map((r) => ({ key: r.id, kind: 'Research', title: r.role.split(',')[0], org: r.institution, start: r.startDate, end: r.endDate })),
    ...d.teaching.map((t) => ({ key: t.id, kind: 'Teaching', title: t.role, org: t.institution, start: t.startDate, end: t.endDate })),
    ...d.activities.map((a) => ({ key: a.id, kind: 'Leadership', title: a.role, org: a.organization, start: a.startDate, end: a.endDate })),
  ].sort((a, b) => (toDate(a.start)?.getTime() ?? 0) - (toDate(b.start)?.getTime() ?? 0));
}

function Home() {
  const { data, loading } = useAsync(loadHome, []);

  const milestones = useMemo(() => (data ? buildMilestones(data) : []), [data]);
  const stats = useMemo(() => {
    if (!data) return {};
    const firstTeaching = Math.min(...data.teaching.map((t) => yearOf(t.startDate) ?? Infinity));
    return {
      publications: data.publications.filter((p) => !p.status).length,
      talks: data.speeches.length,
      awards: data.awards.length,
      yearsTeaching: Number.isFinite(firstTeaching) ? new Date().getFullYear() - firstTeaching : 0,
    };
  }, [data]);

  // Images load after layout; re-measure pinned sections once they settle.
  useEffect(() => {
    if (loading) return undefined;
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 600);
    window.addEventListener('load', refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener('load', refresh);
    };
  }, [loading]);

  return (
    <Page
      loading={loading}
      seo={{
        title: data?.profile?.name ?? 'Md Abdus Sami Akanda',
        description: data?.profile?.description ?? 'Physicist working on spintronics and magnetization dynamics.',
        url: '/',
      }}
    >
      {data && (
        <>
          <Hero profile={data.profile} />

          <Marquee speed={38} className="border-y border-line bg-bg-2 py-5">
            {KEYWORDS.map((k) => (
              <span key={k} className="flex items-center gap-6 pr-6 font-mono text-sm uppercase tracking-[0.14em] text-ink-2">
                {k}
                <span className="text-up">↑↓</span>
              </span>
            ))}
          </Marquee>

          <About profile={data.profile} stats={stats} />
          <Research positions={data.research} links={data.researchMeta?.profileLinks ?? []} />

          {data.publications.length > 0 && (
            <section id="publications" className="relative py-28 md:py-40">
              <div className="shell">
                <SectionHeading
                  index="03"
                  label="Publications"
                  lines={['Selected', <span key="i" className="italic text-ink-2">papers.</span>]}
                  aside={
                    <>
                      <p>Peer-reviewed work in IOP, Elsevier and World Scientific journals, plus manuscripts under review.</p>
                      <ArrowLink to="/publications" className="mt-5">
                        All {data.publications.length} publications
                      </ArrowLink>
                    </>
                  }
                />
                <div className="border-t border-line">
                  {data.publications.slice(0, 3).map((pub, i) => (
                    <PublicationItem key={pub.id} pub={pub} index={data.publications.length - i} />
                  ))}
                </div>
                <div className="mt-10 flex justify-end">
                  <ArrowLink to="/speeches">Talks &amp; posters ({data.speeches.length})</ArrowLink>
                </div>
              </div>
            </section>
          )}

          {milestones.length > 0 && <Trajectory milestones={milestones} />}
          <Awards awards={data.awards} />
          <Teaching roles={data.teaching} meta={data.teachingMeta} courses={data.courses} />
          <Lab projects={data.projects} programming={data.programming} webDev={data.webDev} skills={data.skills} />
          <Writing notes={data.notes} posts={data.posts} scribbles={data.scribbles} />
          <Beyond gallery={data.gallery} curations={data.curations} hobbies={data.hobbies} />
        </>
      )}
    </Page>
  );
}

export default Home;
