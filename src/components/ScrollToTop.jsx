import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets scroll on navigation, or scrolls to the #hash once that element
// has rendered (home sections mount after their data resolves).
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return undefined;
    }
    let tries = 0;
    let timer;
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries++ < 40) {
        timer = setTimeout(seek, 50);
      }
    };
    seek();
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
