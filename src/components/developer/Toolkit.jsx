import { motion } from 'motion/react';
import { Reveal } from '../ui/Reveal';
import { EASE } from '../../lib/motion';

// Skills grouped by category, in data order; each group staggers in.
// `label` is the panel's own title; pass null where a section heading already names it.
export default function Toolkit({ skills, label = 'Toolkit' }) {
  const groups = [];
  for (const skill of skills) {
    const name = skill.category || 'Other';
    const group = groups.find((g) => g.name === name);
    if (group) group.items.push(skill);
    else groups.push({ name, items: [skill] });
  }

  return (
    <Reveal className="rounded-3xl border border-line p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        {label ? <p className="eyebrow">{label}</p> : <span />}
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-3">{skills.length} tools · {groups.length} areas</p>
      </div>
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {groups.map((group, gi) => (
          <motion.div
            key={group.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: (gi % 2) * 0.08 }}
            className="border-t border-line pt-4"
          >
            <h3 className="mb-3 flex items-baseline gap-3 text-sm text-ink">
              <span className="font-mono text-[0.65rem] text-up">{String(gi + 1).padStart(2, '0')}</span>
              {group.name}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.map((s) => (
                <li
                  key={s.id}
                  className="rounded-full border border-line px-3 py-1 text-[0.8rem] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}
