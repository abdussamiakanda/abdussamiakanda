import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top if not on home page
    if (pathname !== '/') {
      // Scroll to top immediately
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Use 'instant' for immediate scroll, works better on mobile
      });
      
      // Also set scroll position directly for better mobile support
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // For iOS Safari
      if (window.scrollY !== 0) {
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 0);
      }
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;

