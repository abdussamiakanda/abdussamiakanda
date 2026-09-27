import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Infinite ticker. The track holds two copies of the children and slides
 * by exactly one copy width; scroll velocity briefly speeds it up and flips
 * its direction to follow the reader.
 */
export default function Marquee({ children, speed = 40, className = '', reverse = false }) {
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let reset;
    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        track,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration: speed, ease: 'none', repeat: -1 },
      );

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(-5, 5, self.getVelocity() / 350);
          const direction = boost < 0 ? -1 : 1;
          gsap.to(tween, { timeScale: direction * (1 + Math.abs(boost)), duration: 0.25, overwrite: true });
          clearTimeout(reset);
          reset = setTimeout(() => gsap.to(tween, { timeScale: 1, duration: 0.9, overwrite: true }), 140);
        },
      });
    }, track);

    return () => {
      clearTimeout(reset);
      ctx.revert();
    };
  }, [speed, reverse]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
