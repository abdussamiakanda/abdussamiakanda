// Shared easing and variants for Motion components.
export const EASE = [0.16, 1, 0.3, 1];

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
