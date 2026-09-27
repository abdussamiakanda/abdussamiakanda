import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { EASE } from '../../lib/motion';

// Fades and lifts children into place the first time they scroll into view.
export function Reveal({ as = 'div', delay = 0, y = 28, className = '', children, once = true, amount = 0.2, ...rest }) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const container = (stagger, delay) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

// Parent that staggers any <motion.* variants={staggerItem}> children.
export function Stagger({ as = 'div', stagger = 0.07, delay = 0, className = '', children, amount = 0.15, ...rest }) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      variants={container(stagger, delay)}
      initial={reduced ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Masked line-by-line reveal for display headings.
//
// Visibility is observed on the heading itself, not on the sliding lines: a
// line starts translated below its overflow-hidden mask, and
// IntersectionObserver counts that clipping, so a line would never register
// as "in view" and would stay hidden forever.
export function LineReveal({ lines, className = '', lineClassName = '', delay = 0, as = 'h2', animateOnMount = false }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const Tag = as;
  const shown = animateOnMount || inView;
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="-mx-[0.1em] -mb-[0.1em] block overflow-hidden px-[0.1em] pb-[0.1em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={reduced ? false : { y: '110%' }}
            animate={shown || reduced ? { y: '0%' } : { y: '110%' }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export default Reveal;
