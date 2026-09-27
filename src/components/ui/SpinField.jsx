import { useEffect, useRef } from 'react';

/**
 * A 2D lattice of magnetic moments rendered on canvas.
 *
 * Each needle relaxes toward a local effective field with inertia and
 * damping, so it overshoots and rings the way a damped precessing moment
 * does. Without input, the field is a Néel-type domain wall
 * θ(x) = 2·atan(exp((x − x₀)/δ)) drifting back and forth; the pointer acts as
 * a local applied field that pulls nearby spins toward it.
 */
const readColor = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export default function SpinField({ className = '', spacing = 34, onStats }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let theta = new Float32Array(0);
    let omega = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let statsTimer = 0;

    const pointer = { x: -9999, y: -9999, strength: 0, target: 0 };
    let colors = { up: [52, 227, 160], down: [154, 140, 255], ink: [228, 238, 236] };

    const loadColors = () => {
      colors = {
        up: hexToRgb(readColor('--up', '#34e3a0')),
        down: hexToRgb(readColor('--down', '#9a8cff')),
        ink: hexToRgb(readColor('--ink', '#e4eeec')),
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = width < 640 ? spacing * 0.85 : spacing;
      cols = Math.ceil(width / step) + 1;
      rows = Math.ceil(height / step) + 1;
      theta = new Float32Array(cols * rows);
      omega = new Float32Array(cols * rows);
      for (let i = 0; i < theta.length; i++) theta[i] = Math.random() * Math.PI * 2;
    };

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const cell = width / (cols - 1 || 1);

      // Domain wall centre sweeps the width; its width breathes slightly.
      const x0 = width * (0.5 + 0.38 * Math.sin(t * 0.18));
      const delta = Math.max(60, width * 0.07) * (1 + 0.15 * Math.sin(t * 0.7));
      pointer.strength += (pointer.target - pointer.strength) * Math.min(1, dt * 4);
      const radius = Math.max(220, Math.min(width, height) * 0.38);

      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';

      let mx = 0;
      let my = 0;
      const { up, down, ink } = colors;

      for (let j = 0; j < rows; j++) {
        const y = j * cell;
        for (let i = 0; i < cols; i++) {
          const x = i * cell;
          const idx = j * cols + i;

          // Background: Néel wall profile plus a gentle transverse ripple.
          let target = 2 * Math.atan(Math.exp((x - x0) / delta)) - Math.PI / 2;
          target += 0.18 * Math.sin(y * 0.012 + t * 0.9);

          // Applied field from the pointer, fading with distance.
          let influence = 0;
          if (pointer.strength > 0.01) {
            const dx = pointer.x - x;
            const dy = pointer.y - y;
            const d = Math.hypot(dx, dy);
            if (d < radius) {
              influence = (1 - d / radius) ** 2 * pointer.strength;
              const toward = Math.atan2(dy, dx);
              // Blend angles along the shortest arc.
              const diff = Math.atan2(Math.sin(toward - target), Math.cos(toward - target));
              target += diff * Math.min(1, influence * 1.6);
            }
          }

          const err = Math.atan2(Math.sin(target - theta[idx]), Math.cos(target - theta[idx]));
          // Underdamped rotor: stiffness pulls toward the field, damping bleeds ω.
          omega[idx] += (err * 38 - omega[idx] * 5.2) * dt;
          theta[idx] += omega[idx] * dt;

          const a = theta[idx];
          const c = Math.cos(a);
          const s = Math.sin(a);
          mx += c;
          my += s;

          // Colour by vertical projection: spin-up warm, spin-down cool.
          const k = (1 - s) / 2;
          const r = up[0] * (1 - k) + down[0] * k;
          const g = up[1] * (1 - k) + down[1] * k;
          const b = up[2] * (1 - k) + down[2] * k;

          const edge = Math.min(1, Math.abs(c) * 1.4); // brighter inside the wall
          const base = 0.16 + 0.22 * (1 - edge) + influence * 0.6;
          const len = cell * (0.28 + influence * 0.12);

          ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${Math.min(0.95, base)})`;
          ctx.lineWidth = 1.25 + influence * 0.8;
          ctx.beginPath();
          ctx.moveTo(x - c * len, y - s * len);
          ctx.lineTo(x + c * len, y + s * len);
          ctx.stroke();

          // Arrow head as a dot on the leading end.
          ctx.fillStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},${Math.min(0.9, base * 0.9)})`;
          ctx.beginPath();
          ctx.arc(x + c * len, y + s * len, 1.1 + influence, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (onStats && now - statsTimer > 120) {
        statsTimer = now;
        const n = cols * rows || 1;
        onStats({
          mx: mx / n,
          my: -my / n,
          field: pointer.strength,
          x: pointer.x / (width || 1),
          y: pointer.y / (height || 1),
        });
      }
    };

    const loop = (now) => {
      if (visible) step(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      pointer.x = px;
      pointer.y = py;
      pointer.target = px >= 0 && py >= 0 && px <= rect.width && py <= rect.height ? 1 : 0;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    loadColors();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
    });
    io.observe(canvas);
    const mo = new MutationObserver(loadColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    if (reduced) {
      // One settled frame, no animation loop.
      for (let i = 0; i < 240; i++) step(performance.now() + i * 16);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [spacing, onStats]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
