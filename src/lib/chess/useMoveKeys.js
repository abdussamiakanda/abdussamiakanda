import { useEffect } from 'react';

// Arrow keys / Home / End step through a game while no form field is focused.
export default function useMoveKeys(ply, length, onPly, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable) return;
      const next = { ArrowLeft: ply - 1, ArrowRight: ply + 1, Home: 0, End: length }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      onPly(Math.max(0, Math.min(length, next)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ply, length, onPly, enabled]);
}
