import { motion } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import Precession from '../ui/Precession';
import TeX from '../ui/TeX';
import { ArrowLink, Chip, SectionHeading } from '../ui/primitives';
import { Stagger } from '../ui/Reveal';
import { staggerItem } from '../../lib/motion';
import { formatRange } from '../../lib/format';
import { getSocialIcon } from '../../lib/socialIcons';
import { INTERESTS, LLG_TEX } from '../../lib/research';


export default function Research({ positions, links }) {
  return (
    <section id="research" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading
          index="02"
          label="Research"
          lines={['Magnetization,', <span key="i" className="italic text-ink-2">in motion.</span>]}
          aside={
            <>
              <p>Condensed-matter theory and simulation: how the magnetization of tiny structures can be steered quickly, cheaply and reliably, the groundwork for spin-based memory and logic.</p>
              <ArrowLink to="/research" className="mt-5">
                Research overview
              </ArrowLink>
            </>
          }
        />

        <Stagger className="grid gap-4 md:grid-cols-12">
          {/* Precession diagram */}
          <motion.div variants={staggerItem} className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 md:col-span-5 md:p-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Fig. 2 — Gilbert damping</span>
              <Chip tone="up">LLG</Chip>
            </div>
            <Precession className="mx-auto mt-4 w-full max-w-[380px]" />
            <TeX
              display
              className="no-scrollbar mt-2 overflow-x-auto text-ink [&_.katex-display]:my-2"
              fallback="∂m/∂t = −γ m × H_eff + α m × ∂m/∂t"
            >
              {LLG_TEX}
            </TeX>
            <p className="mt-3 text-sm text-ink-3">
              A moment precesses about the effective field and, through damping α, spirals in to align with it — the equation behind most of my work.
            </p>
          </motion.div>

          {/* Positions */}
          <motion.div variants={staggerItem} className="rounded-3xl border border-line bg-surface p-6 md:col-span-7 md:p-8">
            <p className="eyebrow mb-6">Positions</p>
            <ul className="space-y-6">
              {positions.map((p) => (
                <li key={p.id} className="grid gap-2 border-b border-line pb-6 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:gap-6">
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-ink md:text-3xl">{p.institution}</h3>
                    <p className="mt-1 text-sm text-ink-2">{p.role}</p>
                    {p.description && <p className="mt-3 text-sm text-ink-3">{p.description}</p>}
                  </div>
                  <div className="flex items-start gap-2 sm:flex-col sm:items-end">
                    {!p.endDate && <Chip tone="up">Current</Chip>}
                    <span className="eyebrow whitespace-nowrap">{formatRange(p.startDate, p.endDate)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Interests */}
          {INTERESTS.map((it, i) => (
            <motion.div
              key={it.title}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-line-strong md:col-span-4"
            >
              <div className="flex items-start gap-5">
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-mono text-sm transition-transform duration-500 group-hover:rotate-[-8deg] ${
                    it.tone === 'up' ? 'bg-up-soft text-up' : 'bg-down-soft text-down'
                  }`}
                >
                  {it.k}
                </span>
                <div>
                  <p className="font-mono text-[0.65rem] text-ink-3">R/{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 font-display text-2xl text-ink">{it.title}</h3>
                  <p className="mt-2 text-sm text-ink-2">{it.body}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Profiles */}
          {links.length > 0 && (
            <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3 rounded-3xl border border-line p-4 md:col-span-12">
              <span className="eyebrow px-2">Find the work on</span>
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
            </motion.div>
          )}
        </Stagger>
      </div>
    </section>
  );
}
