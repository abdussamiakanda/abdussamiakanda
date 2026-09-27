// Square overlays for the board, all semi-transparent so the board colours
// show through.
export const SQUARE = {
  lastMove: { backgroundColor: 'color-mix(in srgb, var(--up) 34%, transparent)' },
  selected: { backgroundColor: 'color-mix(in srgb, var(--up) 55%, transparent)' },
  check: { background: 'radial-gradient(circle, rgba(239, 68, 68, 0.85) 0%, rgba(239, 68, 68, 0.35) 45%, transparent 75%)' },
  target: { background: 'radial-gradient(circle, rgba(8, 20, 16, 0.28) 20%, transparent 22%)' },
  capture: { background: 'radial-gradient(circle, transparent 56%, rgba(8, 20, 16, 0.28) 58%)' },
};
