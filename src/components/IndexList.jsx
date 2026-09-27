import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import { Chip } from './ui/primitives';
import { EASE } from '../lib/motion';

const hasBangla = (s = '') => /[ঀ-৿]/.test(s);

/**
 * Editorial table-of-contents list. Rows reveal on scroll; on pointer
 * devices, hovering a row floats its cover image beside the cursor.
 * items: [{ key, to, title, subtitle, meta, tag, image, description }]
 */
export default function IndexList({ items, showNumbers = true }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  const onMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  const preview = items.find((i) => i.key === hover)?.image;

  return (
    <div ref={wrapRef} className="relative" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <ul className="border-t border-line">
        {items.map((item, idx) => (
          <motion.li
            key={item.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE, delay: Math.min(idx, 6) * 0.04 }}
            className="border-b border-line"
          >
            <Link
              to={item.to}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(item.key)}
              onFocus={() => setHover(null)}
              className="group relative grid grid-cols-12 items-baseline gap-4 py-7 md:py-9"
            >
              <span className="absolute inset-0 -mx-4 origin-bottom scale-y-0 rounded-2xl bg-surface transition-transform duration-500 ease-out-expo group-hover:scale-y-100 md:-mx-6" />
              {showNumbers && <span className="relative col-span-2 font-mono text-xs text-ink-3 md:col-span-1">{String(idx + 1).padStart(2, '0')}</span>}
              <span className={`relative ${showNumbers ? 'col-span-10 md:col-span-7' : 'col-span-12 md:col-span-8'}`}>
                <span
                  className={`block text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-2 ${
                    hasBangla(item.title) ? 'bangla text-2xl leading-snug md:text-3xl' : 'font-display text-3xl leading-[1.05] md:text-[2.6rem]'
                  }`}
                >
                  {item.title}
                </span>
                {item.subtitle && <span className="mt-1 block font-display text-lg italic text-ink-3">{item.subtitle}</span>}
                {item.description && (
                  <span className={`mt-3 line-clamp-2 block max-w-xl text-sm text-ink-2 ${hasBangla(item.description) ? 'bangla' : ''}`}>{item.description}</span>
                )}
              </span>
              <span className="relative col-span-12 flex items-center gap-3 md:col-span-4 md:justify-end">
                {item.tag && <Chip tone="up">{item.tag}</Chip>}
                {item.meta && <span className="eyebrow">{item.meta}</span>}
                <span className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-up group-hover:bg-up group-hover:text-on-up md:ml-2">
                  <FiArrowUpRight />
                </span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {preview && (
          <motion.div
            key="preview"
            className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="h-44 w-64 -translate-x-1/2 -translate-y-[115%] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/30">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={preview}
                  src={preview}
                  alt=""
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
