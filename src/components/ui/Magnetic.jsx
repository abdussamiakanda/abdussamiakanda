import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

// Wrapper that leans toward the pointer while hovered, then springs back.
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    if (reduced || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x: sx, y: sy }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}
