import { motion } from 'motion/react';

// Segmented control with a sliding pill (shared layout animation).
export default function FilterTabs({ options, value, onChange, id = 'filter', className = '' }) {
  return (
    <div role="tablist" className={`no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line p-1 ${className}`}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const count = typeof opt === 'string' ? undefined : opt.count;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(val)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${active ? 'text-bg' : 'text-ink-2 hover:text-ink'}`}
          >
            {active && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
            <span className="relative flex items-center gap-2">
              {label}
              {count !== undefined && <span className={`font-mono text-[0.65rem] ${active ? 'text-bg/60' : 'text-ink-3'}`}>{count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
