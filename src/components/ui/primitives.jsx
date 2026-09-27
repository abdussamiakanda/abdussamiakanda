import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowUpRight, FiArrowRight } from 'react-icons/fi';
import { Reveal, LineReveal } from './Reveal';

const isExternal = (href = '') => /^(https?:|mailto:|tel:)/.test(href) || href.endsWith('.pdf') || href.endsWith('.html');

// Link that picks router navigation or a plain anchor based on the href.
export function SmartLink({ href, to, children, newTab, ...rest }) {
  const target = to ?? href ?? '#';
  if (isExternal(target)) {
    const blank = newTab ?? !target.startsWith('mailto:');
    return (
      <a href={target} {...(blank ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={target} {...rest}>
      {children}
    </Link>
  );
}

const BTN_BASE =
  'group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full font-mono text-[0.78rem] uppercase tracking-[0.08em] transition-colors duration-300';
const BTN_VARIANTS = {
  solid: 'bg-ink text-bg px-5 py-3 hover:text-on-up',
  ghost: 'border border-line-strong text-ink px-5 py-3 hover:border-ink',
  quiet: 'text-ink-2 hover:text-ink px-0 py-1',
};

// Pill button. The solid variant floods with the spin-up colour on hover.
export function Button({ variant = 'solid', icon = 'up-right', className = '', children, ...rest }) {
  const Icon = icon === 'right' ? FiArrowRight : icon === 'up-right' ? FiArrowUpRight : null;
  return (
    <SmartLink className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${className}`} {...rest}>
      {variant === 'solid' && (
        <span className="absolute inset-0 translate-y-full rounded-full bg-up transition-transform duration-500 ease-out-expo group-hover:translate-y-0" />
      )}
      <span className="relative">{children}</span>
      {Icon && (
        <span className="relative inline-flex h-4 w-4 overflow-hidden">
          <Icon className="absolute inset-0 transition-transform duration-500 ease-out-expo group-hover:-translate-y-full group-hover:translate-x-full" />
          <Icon className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0" />
        </span>
      )}
    </SmartLink>
  );
}

// Inline "Read more →" style link.
export function ArrowLink({ children, className = '', ...rest }) {
  return (
    <SmartLink className={`group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink ${className}`} {...rest}>
      <span className="link-underline">{children}</span>
      <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
    </SmartLink>
  );
}

export function Chip({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'border-line text-ink-2',
    up: 'border-transparent bg-up-soft text-up',
    down: 'border-transparent bg-down-soft text-down',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.08em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

// Numbered section heading used on the home page: "§ 03 — Research".
export function SectionHeading({ index, label, title, lines, aside, className = '' }) {
  return (
    <div className={`mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end ${className}`}>
      <div className="md:col-span-8">
        <Reveal className="eyebrow mb-5 flex items-center gap-3">
          <span className="text-up">§ {index}</span>
          <span className="h-px w-8 bg-line-strong" />
          <span>{label}</span>
        </Reveal>
        <LineReveal
          lines={lines ?? [title]}
          className="font-display text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-ink"
        />
      </div>
      {aside && (
        <Reveal delay={0.15} className="text-ink-2 md:col-span-4 md:pb-3">
          {aside}
        </Reveal>
      )}
    </div>
  );
}

// Shows nothing for the first `delay` ms, so quick loads never flash a
// spinner; slower ones get the spin-needle loader, fading in.
export function Loader({ label = 'Loading', delay = 300 }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return undefined;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5" role="status" aria-live="polite">
      {visible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-5">
          <div className="relative grid h-14 w-14 place-items-center">
            <motion.span
              className="absolute inset-0 rounded-full border border-up"
              animate={{ scale: [0.85, 1.4], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <span className="absolute inset-0 rounded-full border border-line-strong" />
            {/* The logo's spin needle, precessing. */}
            <motion.span
              className="relative block h-7 w-[2px] rounded-full bg-gradient-to-b from-up to-down"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
            >
              <span className="absolute -top-[3px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-up" />
            </motion.span>
          </div>
          <span className="eyebrow">{label}</span>
        </motion.div>
      )}
    </div>
  );
}

// Suspense fallback while a page's code downloads: a slim indeterminate bar
// across the top of the window, shown only if the wait is noticeable.
export function RouteProgress({ delay = 120 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="min-h-screen" role="status" aria-label="Loading page">
      {visible && (
        <div className="fixed inset-x-0 top-0 z-[70] h-[2px] overflow-hidden bg-up-soft">
          <div className="route-progress h-full w-1/3 bg-up" />
        </div>
      )}
    </div>
  );
}

export function EmptyState({ children = 'Nothing here yet.' }) {
  return (
    <div className="rounded-3xl border border-dashed border-line-strong px-6 py-20 text-center text-ink-2">
      <p className="font-display text-3xl italic">{children}</p>
    </div>
  );
}
