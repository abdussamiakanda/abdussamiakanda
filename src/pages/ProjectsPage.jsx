import Page, { PageHeader } from '../components/Page';
import ProjectCard from '../components/ProjectCard';
import { EmptyState } from '../components/ui/primitives';
import useAsync from '../lib/useAsync';
import { getPersonalProjects } from '../services/dataService';

function ProjectsPage() {
  // Already sorted: ongoing first by start date, then finished by end date.
  const { data: projects, loading } = useAsync(getPersonalProjects, [], []);

  return (
    <Page loading={loading} seo={{ title: 'Projects', description: 'Research simulations and software projects.', url: '/projects' }}>
      <PageHeader
        eyebrow="Projects · Simulation & software"
        title="Built,"
        italic="measured, shipped."
        count={projects.length}
        countLabel="projects"
        lede="Open-source tools and research simulations, from a local LaTeX editor on PyPI to micromagnetic models, with case studies where the story is worth telling."
      />
      <section className="shell space-y-5">
        {projects.length === 0 ? <EmptyState>No projects yet.</EmptyState> : projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
      </section>
    </Page>
  );
}

export default ProjectsPage;
