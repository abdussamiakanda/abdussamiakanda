import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

// 3D tilt toward the pointer with a moving specular highlight.
export default function TiltCard({ children, className = '', max = 10, ...rest }) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 55%)`);

  const onMove = (e) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div style={{ perspective: 900 }} className={className} {...rest}>
      <motion.div onPointerMove={onMove} onPointerLeave={reset} style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="group relative h-full">
        {children}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  );
}
