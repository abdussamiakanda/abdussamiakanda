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
