import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import { Chip, EmptyState } from '../components/ui/primitives';
import { Stagger } from '../components/ui/Reveal';
import { staggerItem } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { formatRange } from '../lib/format';
import { getCourses } from '../services/dataService';

function CourseCard({ course, index }) {
  return (
    <motion.li variants={staggerItem}>
      <Link
        to={`/courses/${course.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-colors hover:border-line-strong"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
          {course.imageUrl && (
            <img
              src={course.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
            />
          )}
          <span className="absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink backdrop-blur">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6 md:p-7">
          <div className="mb-4 flex flex-wrap gap-2">
            {course.language && <Chip>{course.language}</Chip>}
            {!course.endDate && <Chip tone="up">Ongoing</Chip>}
            {course.playlist && <Chip tone="down">Recorded</Chip>}
          </div>
          <h3 className="font-display text-3xl leading-tight text-ink">{course.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm text-ink-2">{course.description}</p>
          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="eyebrow">{formatRange(course.startDate, course.endDate)}</span>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 transition-all duration-500 group-hover:rotate-45 group-hover:border-up group-hover:bg-up group-hover:text-on-up">
              <FiArrowUpRight />
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}

function CoursesPage() {
  const { data: courses, loading } = useAsync(getCourses, [], []);

  return (
    <Page loading={loading} seo={{ title: 'Courses', description: 'Courses I have designed and taught.', url: '/courses' }}>
      <PageHeader
        eyebrow="Teaching · Courses"
        title="Lecture"
        italic="halls."
        count={courses.length}
        countLabel="courses"
        lede="Full courses I designed and taught — mechanics, electromagnetism, relativity, calculus and LaTeX — mostly in Bangla for undergraduates, with recorded lectures and notes."
      />
      <section className="shell">
        {courses.length === 0 ? (
          <EmptyState>No courses listed yet.</EmptyState>
        ) : (
          <Stagger as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <CourseCard key={c.id} course={c} index={i} />
            ))}
          </Stagger>
        )}
      </section>
    </Page>
  );
}

export default CoursesPage;
