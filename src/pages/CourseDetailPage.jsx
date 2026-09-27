import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiDownload, FiPlay, FiYoutube } from 'react-icons/fi';
import Page from '../components/Page';
import Markdown from '../components/ui/Markdown';
import { Button, Chip } from '../components/ui/primitives';
import { LineReveal, Reveal } from '../components/ui/Reveal';
import { EASE } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { formatDate, formatRange } from '../lib/format';
import { getCourses } from '../services/dataService';

// The playlist iframe is heavy, so show a poster first and load YouTube only
// when the reader asks for it (privacy-enhanced domain).
function Playlist({ id, title, poster }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-line bg-surface">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/videoseries?list=${id}&autoplay=1`}
          title={`${title} — lecture videos`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 grid place-items-center" aria-label={`Play ${title} lecture videos`}>
          {poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 blur-[2px] transition-opacity duration-500 group-hover:opacity-55" />}
          <span className="relative flex flex-col items-center gap-4">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-up text-2xl text-on-up shadow-2xl transition-transform duration-500 ease-out-expo group-hover:scale-110">
              <FiPlay className="translate-x-0.5" />
            </span>
            <span className="rounded-full bg-bg/80 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ink backdrop-blur">Play lecture playlist</span>
          </span>
        </button>
      )}
    </div>
  );
}

function Section({ index, title, children }) {
  return (
    <section className="border-t border-line pt-8">
      <p className="eyebrow mb-6">
        <span className="text-up">{index}</span> — {title}
      </p>
      {children}
    </section>
  );
}

function CourseDetailPage() {
  const { slug } = useParams();
  const { data: courses, loading } = useAsync(getCourses, [], []);

  if (loading) return <Page loading />;

  const i = courses.findIndex((c) => c.slug === slug);
  const course = courses[i];

  if (!course) {
    return (
      <Page seo={{ title: 'Course not found' }}>
        <div className="shell flex min-h-[70vh] flex-col items-start justify-center pt-32">
          <p className="eyebrow mb-4">Courses</p>
          <h1 className="font-display text-6xl text-ink md:text-8xl">
            No such <span className="italic text-ink-2">lecture.</span>
          </h1>
          <Button to="/courses" variant="ghost" icon="right" className="mt-10">
            All courses
          </Button>
        </div>
      </Page>
    );
  }

  const prev = courses[i - 1];
  const next = courses[i + 1];
  const groups = (course.resources ?? []).reduce((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  let n = 0;
  const idx = () => String(++n).padStart(2, '0');

  const facts = [
    { label: 'Dates', value: course.endDate ? formatRange(course.startDate, course.endDate, { style: 'long' }) : `${formatDate(course.startDate)} — ongoing` },
    { label: 'Language', value: course.language },
    { label: 'Instructor', value: course.instructor },
  ].filter((f) => f.value);

  return (
    <Page seo={{ title: course.title, description: course.description, url: `/courses/${slug}`, ogImage: course.imageUrl }}>
      <header className="shell pb-12 pt-36 md:pt-44">
        <Reveal className="mb-10">
          <Link to="/courses" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink">
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Courses
          </Link>
        </Reveal>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-ink-3">C/{String(i + 1).padStart(2, '0')}</span>
          {course.language && <Chip>{course.language}</Chip>}
          {!course.endDate && <Chip tone="up">Ongoing</Chip>}
          {course.playlist && <Chip tone="down">Recorded</Chip>}
        </div>
        <LineReveal
          as="h1"
          animateOnMount
          lines={[course.title]}
          className="mt-6 max-w-5xl font-display text-[clamp(2.8rem,8vw,7rem)] leading-[0.92] tracking-[-0.03em] text-ink"
        />
        {course.description && (
          <Reveal delay={0.2} className="mt-8 max-w-3xl text-xl leading-relaxed text-ink-2">
            {course.description}
          </Reveal>
        )}
      </header>

      {course.imageUrl && (
        <div className="shell mb-16">
          <motion.figure
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: EASE }}
            className="flex justify-center overflow-hidden rounded-3xl border border-line bg-surface p-4 md:p-8"
          >
            <img src={course.imageUrl} alt="" className="block h-auto max-h-[60vh] w-auto max-w-full rounded-xl object-contain" />
          </motion.figure>
        </div>
      )}

      <div className="shell grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="space-y-6 rounded-3xl border border-line p-6 lg:sticky lg:top-28">
            {facts.map((f) => (
              <div key={f.label}>
                <p className="eyebrow mb-1">{f.label}</p>
                <p className="text-ink">{f.value}</p>
              </div>
            ))}
            <div className="flex flex-col gap-2 border-t border-line pt-6">
              {course.playlist && (
                <a
                  href={`https://www.youtube.com/playlist?list=${course.playlist}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink"
                >
                  <FiYoutube /> <span className="link-underline">Playlist on YouTube</span>
                </a>
              )}
              {course.url && (
                <a href={course.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
                  <FiArrowUpRight /> <span className="link-underline">Official course page</span>
                </a>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-16 lg:col-span-8">
          {course.overview && (
            <Section index={idx()} title="Overview">
              <Markdown>{course.overview}</Markdown>
            </Section>
          )}

          {course.playlist && (
            <Section index={idx()} title="Lecture videos">
              <Playlist id={course.playlist} title={course.title} poster={course.imageUrl} />
            </Section>
          )}

          {course.outline && (
            <Section index={idx()} title="Course outline">
              <Markdown>{course.outline}</Markdown>
            </Section>
          )}

          {Object.keys(groups).length > 0 && (
            <Section index={idx()} title="Resources">
              <div className="space-y-8">
                {Object.entries(groups).map(([group, items]) => (
                  <div key={group}>
                    <p className="mb-3 text-sm text-ink-3">{group}</p>
                    <ul className="border-t border-line">
                      {items.map((r) => (
                        <li key={r.url} className="border-b border-line">
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-4">
                            <span className="text-ink transition-colors group-hover:text-up">{r.title}</span>
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors group-hover:border-up group-hover:bg-up group-hover:text-on-up">
                              <FiDownload />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      {(prev || next) && (
        <nav className="shell mt-28 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2" aria-label="More courses">
          {[prev, next].map((c, k) =>
            c ? (
              <Link
                key={c.id}
                to={`/courses/${c.slug}`}
                className={`group flex flex-col gap-4 bg-bg p-8 transition-colors hover:bg-surface md:p-10 ${k === 1 ? 'md:items-end md:text-right' : ''}`}
              >
                <span className="eyebrow flex items-center gap-2">
                  {k === 0 && <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />}
                  {k === 0 ? 'Previous course' : 'Next course'}
                  {k === 1 && <FiArrowRight className="transition-transform group-hover:translate-x-1" />}
                </span>
                <span className="font-display text-3xl leading-tight text-ink">{c.title}</span>
              </Link>
            ) : (
              <div key={k} className="hidden bg-bg md:block" />
            ),
          )}
        </nav>
      )}
    </Page>
  );
}

export default CourseDetailPage;
