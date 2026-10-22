import { FiArrowUpRight, FiBox, FiFileText, FiGithub } from 'react-icons/fi';

export const STATUS = {
  live: { label: 'Live', dot: 'bg-up' },
  package: { label: 'On PyPI', dot: 'bg-down' },
  source: { label: 'Open source', dot: 'bg-ink-3' },
};

// Every link a project has, in a fixed order: its own page first.
export const projectLinks = (project, { withDetail = true } = {}) =>
  [
    withDetail && project.overview && { key: 'case', label: 'Read more', to: `/developer/${project.slug}`, icon: FiFileText },
    project.links?.live && { key: 'live', label: 'Visit', href: project.links.live, icon: FiArrowUpRight },
    project.links?.package && { key: 'package', label: 'PyPI', href: project.links.package, icon: FiBox },
    project.links?.source && { key: 'source', label: 'Source', href: project.links.source, icon: FiGithub },
  ].filter(Boolean);

// Projects that count as shipped: running live or published as a package.
export const shippedCount = (projects = []) => projects.filter((p) => p.status === 'live' || p.status === 'package').length;

// The layers I build across, top (what people touch) to bottom, each with
// technologies used in the projects on /developer.
export const STACK_LAYERS = [
  { layer: 'Interface', tools: ['React', 'Vite', 'Tailwind CSS', 'Three.js', 'Monaco'] },
  { layer: 'Services', tools: ['Node.js', 'Python', 'FastAPI', 'Flask', 'Go'] },
  { layer: 'Data & auth', tools: ['Firebase', 'Supabase', 'PostgreSQL', 'SSO'] },
  { layer: 'Edge & infra', tools: ['Cloudflare Workers', 'Netlify', 'PyPI'] },
];
