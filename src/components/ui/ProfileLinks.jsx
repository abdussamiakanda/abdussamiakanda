import { FiArrowUpRight } from 'react-icons/fi';
import { getSocialIcon } from '../../lib/socialIcons';

// "Find the work on" row of profile pills. Callers supply the container.
export default function ProfileLinks({ links, label = 'Find the work on' }) {
  return (
    <>
      <span className="eyebrow px-2">{label}</span>
      {links.map((l) => {
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
    </>
  );
}
