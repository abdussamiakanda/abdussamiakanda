import { useEffect, useRef } from 'react';

/**
 * A 2D lattice of magnetic moments rendered on canvas.
 *
 * Each spin relaxes toward a local effective field with inertia and damping,
 * so it overshoots and rings the way a damped precessing moment does.
 * Without input, the field is a Néel-type domain wall
 * θ(x) = 2·atan(exp((x − x₀)/δ)) drifting slowly across the hero.
 *
 * The pointer is a local field that curls nearby spins into a magnetic
 * vortex (with a bright core), following the cursor on a critically damped
 * spring. A click or tap flips the vortex's chirality and launches a spin
 * wave: a ring that turns each spin through a full rotation as it passes.
 *
 * Spins are drawn as tapered vector arrows, batched by colour bucket so the
 * whole field costs a few dozen fills per frame.
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

const HUES = 14; // colour buckets between spin-down and spin-up
const ALPHAS = 9; // opacity buckets
const WAVE_SPEED = 520; // px/s
const WAVE_LIFE = 2.6; // s

// Shortest signed angle from a to b.
const angleTo = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export default function SpinField({ className = '', spacing = 34, onStats }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cell = spacing;
    let theta = new Float32Array(0);
    let omega = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let statsTimer = 0;

    // Pointer in client coordinates; mapped into canvas space every frame, so
    // scrolling and the hero's scroll-scale never leave the field behind.
    const client = { x: 0, y: 0, has: false };
    // The field's centre follows the pointer on a critically damped spring.
    const field = { x: 0, y: 0, vx: 0, vy: 0, strength: 0, target: 0, chirality: 1, speed: 0 };
    const waves = [];

    let palette = [];
    let glow = 'rgba(52,227,160,';
    const loadColors = () => {
      const up = hexToRgb(readColor('--up', '#34e3a0'));
      const down = hexToRgb(readColor('--down', '#9a8cff'));
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      palette = [];
      for (let h = 0; h < HUES; h++) {
        const k = h / (HUES - 1);
        const r = Math.round(up[0] * (1 - k) + down[0] * k);
        const g = Math.round(up[1] * (1 - k) + down[1] * k);
        const b = Math.round(up[2] * (1 - k) + down[2] * k);
        const row = [];
        for (let a = 0; a < ALPHAS; a++) {
          // Light backgrounds need a touch more ink to read.
          const alpha = (0.1 + (a / (ALPHAS - 1)) * 0.85) * (light ? 1.15 : 1);
          row.push(`rgba(${r},${g},${b},${Math.min(1, alpha).toFixed(3)})`);
        }
        palette.push(row);
      }
      glow = `rgba(${up[0]},${up[1]},${up[2]},`;
    };

    const resize = () => {
      // Layout size (unaffected by CSS transforms), not the scaled rect.
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = width < 640 ? spacing * 0.85 : spacing;
      cols = Math.max(2, Math.round(width / target) + 1);
      cell = width / (cols - 1);
      rows = Math.ceil(height / cell) + 1;
      theta = new Float32Array(cols * rows);
      omega = new Float32Array(cols * rows);
      for (let i = 0; i < theta.length; i++) theta[i] = Math.random() * Math.PI * 2;
    };

    // Pointer → canvas coordinates, accounting for any CSS scale on the canvas.
    const toLocal = () => {
      const rect = canvas.getBoundingClientRect();
      const sx = width / (rect.width || 1);
      const sy = height / (rect.height || 1);
      const x = (client.x - rect.left) * sx;
      const y = (client.y - rect.top) * sy;
      const inside = client.has && x >= 0 && y >= 0 && x <= width && y <= height;
      return { x, y, inside };
    };

    // Tapered arrow: thin tail, fuller shaft, crisp head.
    const addArrow = (path, x, y, c, s, len, w) => {
      const px = -s; // unit normal
      const py = c;
      const tailX = x - c * len;
      const tailY = y - s * len;
      const tipX = x + c * len;
      const tipY = y + s * len;
      const headLen = len * 0.62;
      const neckX = tipX - c * headLen;
      const neckY = tipY - s * headLen;
      const shaft = w * 0.5;
      const tail = w * 0.18;
      const wing = w * 1.55;
      path.moveTo(tailX + px * tail, tailY + py * tail);
      path.lineTo(neckX + px * shaft, neckY + py * shaft);
      path.lineTo(neckX + px * wing, neckY + py * wing);
      path.lineTo(tipX, tipY);
      path.lineTo(neckX - px * wing, neckY - py * wing);
      path.lineTo(neckX - px * shaft, neckY - py * shaft);
      path.lineTo(tailX - px * tail, tailY - py * tail);
      path.closePath();
    };

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      // Pointer tracking.
      const p = toLocal();
      field.target = p.inside ? 1 : 0;
      if (p.inside && field.strength < 0.02) {
        // Entering: start at the pointer rather than sweeping in from afar.
        field.x = p.x;
        field.y = p.y;
        field.vx = 0;
        field.vy = 0;
      }
      if (p.inside) {
        const k = 160; // spring stiffness (1/s²); damping is critical
        const c = 2 * Math.sqrt(k);
        field.vx += ((p.x - field.x) * k - field.vx * c) * dt;
        field.vy += ((p.y - field.y) * k - field.vy * c) * dt;
        field.x += field.vx * dt;
        field.y += field.vy * dt;
      }
      const speed = Math.hypot(field.vx, field.vy);
      field.speed += (speed - field.speed) * Math.min(1, dt * 6);
      field.strength += (field.target - field.strength) * Math.min(1, dt * (field.target ? 6 : 2.5));

      // Background domain wall, drifting slowly; its width breathes.
      const x0 = width * (0.5 + 0.36 * Math.sin(t * 0.12));
      const delta = Math.max(70, width * 0.08) * (1 + 0.12 * Math.sin(t * 0.5));

      // Vortex: wider and a little stronger when the pointer moves fast.
      const sigma = Math.max(120, Math.min(width, height) * 0.2) * (1 + Math.min(0.5, field.speed / 2400));
      const twoSigma2 = 2 * sigma * sigma;
      const core = sigma * 0.22;
      const strength = field.strength;

      for (let w = waves.length - 1; w >= 0; w--) if (t - waves[w].t0 > WAVE_LIFE) waves.splice(w, 1);

      ctx.clearRect(0, 0, width, height);

      // Soft glow under the field at the vortex core.
      if (strength > 0.02) {
        const r = sigma * 1.6;
        const grad = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, r);
        grad.addColorStop(0, `${glow}${(0.16 * strength).toFixed(3)})`);
        grad.addColorStop(1, `${glow}0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(field.x - r, field.y - r, r * 2, r * 2);
      }

      const buckets = new Map();
      let mx = 0;
      let my = 0;

      for (let j = 0; j < rows; j++) {
        const y = j * cell;
        for (let i = 0; i < cols; i++) {
          const x = i * cell;
          const idx = j * cols + i;

          let target = 2 * Math.atan(Math.exp((x - x0) / delta)) - Math.PI / 2;
          target += 0.16 * Math.sin(y * 0.011 + t * 0.7);

          // Vortex around the field centre: spins curl tangentially with a
          // slight inward spiral, turning out of the plane (brighter, shorter)
          // at the core.
          let influence = 0;
          if (strength > 0.01) {
            const dx = x - field.x;
            const dy = y - field.y;
            const d2 = dx * dx + dy * dy;
            influence = Math.exp(-d2 / twoSigma2) * strength;
            if (influence > 0.003) {
              const curl = Math.atan2(dy, dx) + field.chirality * (Math.PI / 2 + 0.32);
              target += angleTo(target, curl) * Math.min(1, influence * 1.35);
            }
          }

          // Spin waves: a passing ring turns spins through a full rotation.
          let wave = 0;
          for (const wv of waves) {
            const age = t - wv.t0;
            const r = age * WAVE_SPEED;
            const d = Math.hypot(x - wv.x, y - wv.y);
            const band = Math.exp(-(((d - r) / 46) ** 2)) * Math.exp(-age * 1.1);
            if (band > 0.01) {
              target += band * Math.PI * wv.dir;
              wave = Math.max(wave, band);
            }
          }

          const err = angleTo(theta[idx], target);
          omega[idx] += (err * 40 - omega[idx] * 5.6) * dt;
          theta[idx] += omega[idx] * dt;

          const a = theta[idx];
          const c = Math.cos(a);
          const s = Math.sin(a);
          mx += c;
          my += s;

          // Out-of-plane core: in-plane length shrinks near the centre.
          let len = cell * (0.3 + influence * 0.1 + wave * 0.06);
          if (influence > 0.05) {
            const dCore = Math.hypot(x - field.x, y - field.y);
            len *= 0.55 + 0.45 * Math.min(1, dCore / core);
          }
          const edge = Math.min(1, Math.abs(c) * 1.4); // brighter inside the wall
          const alpha = Math.min(1, 0.14 + 0.2 * (1 - edge) + influence * 0.75 + wave * 0.6);
          const hue = Math.min(HUES - 1, Math.max(0, Math.round(((1 - s) / 2) * (HUES - 1))));
          const al = Math.min(ALPHAS - 1, Math.round(alpha * (ALPHAS - 1)));
          const key = hue * ALPHAS + al;
          let path = buckets.get(key);
          if (!path) {
            path = new Path2D();
            buckets.set(key, path);
          }
          addArrow(path, x, y, c, s, len, 2.2 + influence * 1.2 + wave * 0.8);
        }
      }

      for (const [key, path] of buckets) {
        ctx.fillStyle = palette[(key / ALPHAS) | 0][key % ALPHAS];
        ctx.fill(path);
      }

      if (onStats && now - statsTimer > 120) {
        statsTimer = now;
        const n = cols * rows || 1;
        onStats({
          mx: mx / n,
          my: -my / n,
          field: strength,
          x: field.x / (width || 1),
          y: field.y / (height || 1),
        });
      }
    };

    const loop = (now) => {
      if (visible) step(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      client.x = e.clientX;
      client.y = e.clientY;
      client.has = true;
    };
    const onLeave = () => {
      client.has = false;
    };
    // Click or tap: flip the vortex and launch a spin wave from that point.
    const onDown = (e) => {
      onMove(e);
      const p = toLocal();
      if (!p.inside) return;
      field.chirality *= -1;
      waves.push({ x: p.x, y: p.y, t0: performance.now() / 1000, dir: field.chirality });
      if (waves.length > 4) waves.shift();
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
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

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
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, [spacing, onStats]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
