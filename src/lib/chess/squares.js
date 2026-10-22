// Square overlays for the board, all semi-transparent so the board colours
// show through.
export const SQUARE = {
  // Warm highlight: reads clearly on both the ivory and the jade squares.
  lastMove: { boxShadow: 'inset 0 0 0 999px var(--board-highlight)' },
  selected: { boxShadow: 'inset 0 0 0 999px color-mix(in srgb, var(--up) 45%, transparent), inset 0 0 0 2px color-mix(in srgb, var(--up) 90%, transparent)' },
  check: { background: 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.45) 40%, transparent 72%)' },
  target: { background: 'radial-gradient(circle, rgba(10, 22, 18, 0.30) 17%, transparent 19%)' },
  capture: { background: 'radial-gradient(circle, transparent 58%, rgba(10, 22, 18, 0.30) 60%, rgba(10, 22, 18, 0.30) 72%, transparent 74%)' },
};
