import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import { FiSearch, FiSun, FiMoon, FiChevronDown, FiX, FiArrowUpRight } from 'react-icons/fi';
import { CV_URL, PRIMARY_NAV, isActivePath } from '../lib/siteMap';
import { useThemeMode } from '../theme/themeModeContext';
import CommandPalette from './CommandPalette';

const EASE = [0.16, 1, 0.3, 1];

// Module-level: survives the header remounting on each route change.
let hasEnteredOnce = false;

// Logo mark: a single spin needle that flips (anime.js) on hover.
// Wordmark logo, shown at every screen size. The green full stop echoes the
// hero heading.
function Mark() {
  return (
    <Link to="/" className="group flex shrink-0 items-baseline font-display text-[1.45rem] leading-none tracking-tight text-ink" aria-label="Home — Md Abdus Sami Akanda">
      Sami&nbsp;<span className="italic text-ink-2 transition-colors duration-300 group-hover:text-ink">Akanda</span>
      <span className="text-up transition-transform duration-300 group-hover:translate-x-0.5">.</span>
    </Link>
  );
}

function Dropdown({ item, pathname }) {
  const [open, setOpen] = useState(false);
  const active = item.children.some((c) => isActivePath(pathname, c.to));
  return (
    <li className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={(e) => !e.currentTarget.parentElement.contains(e.relatedTarget) && setOpen(false)}
        className={`relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${active ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
      >
        {item.label}
        <FiChevronDown className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3"
            onBlur={(e) => !e.currentTarget.parentElement.contains(e.relatedTarget) && setOpen(false)}
          >
            <ul className="rounded-2xl border border-line bg-surface/95 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl">
              {item.children.map((c, i) => (
                <motion.li key={c.to} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i, duration: 0.3 }}>
                  <Link
                    to={c.to}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors hover:bg-surface-2"
                  >
                    <span>
                      <span className={`block text-sm ${isActivePath(pathname, c.to) ? 'text-up' : 'text-ink'}`}>{c.label}</span>
                      <span className="block text-xs text-ink-3">{c.hint}</span>
                    </span>
                    <FiArrowUpRight className="text-ink-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

// `showProgress` is off on article pages, which draw their own reading bar.
function Header({ showProgress = true }) {
  const { pathname } = useLocation();
  const { mode, toggle } = useThemeMode();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  // Decided once per mount; state survives StrictMode's dev re-mount, so the
  // very first header still gets its entrance.
  const [slideIn] = useState(() => !hasEnteredOnce);
  useEffect(() => {
    hasEnteredOnce = true;
  }, []);
  const [palette, setPalette] = useState(false);
  const [themeTip, setThemeTip] = useState(false);
  const [hovered, setHovered] = useState(null);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 240 && y > prev && !drawer);
  });

  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <>
      <motion.header
        // Slide in on the first visit only; later pages mount their own header
        // and it should simply be there.
        initial={slideIn ? { y: -100 } : false}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
            scrolled ? 'border-b border-line bg-[var(--glass)] backdrop-blur-xl' : 'border-b border-transparent'
          }`}
        >
          <nav className="shell flex h-[72px] items-center justify-between gap-4" aria-label="Primary">
            <Mark />

            <ul className="hidden items-center lg:flex" onMouseLeave={() => setHovered(null)}>
              {PRIMARY_NAV.map((item) =>
                item.children ? (
                  <Dropdown key={item.label} item={item} pathname={pathname} />
                ) : (
                  <li key={item.label} className="relative" onMouseEnter={() => setHovered(item.label)}>
                    {hovered === item.label && (
                      <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-surface-2" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                    )}
                    <Link
                      to={item.to}
                      className={`relative z-10 block rounded-full px-4 py-2 text-sm transition-colors ${
                        isActivePath(pathname, item.to) ? 'text-ink' : 'text-ink-2 hover:text-ink'
                      }`}
                    >
                      {item.label}
                      {isActivePath(pathname, item.to) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-up" />}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPalette(true)}
                className="flex h-10 items-center gap-2.5 rounded-full border border-line px-3.5 text-sm text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                aria-label="Search"
              >
                <FiSearch />
                <span className="hidden md:inline">Search</span>
                <kbd className="hidden rounded border border-line px-1 font-mono text-[0.62rem] text-ink-3 md:inline">⌘K</kbd>
              </button>
              {/* Controlled so a click closes it: otherwise it would flip its
                  label under the cursor and linger through the theme reveal. */}
              <Tooltip
                title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                arrow
                placement="bottom"
                open={themeTip}
                onOpen={() => setThemeTip(true)}
                onClose={() => setThemeTip(false)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    setThemeTip(false);
                    // Spread the new theme out from the centre of this button.
                    const r = e.currentTarget.getBoundingClientRect();
                    toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
                  }}
                  className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                  aria-label="Toggle colour theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={mode}
                      initial={{ y: 18, rotate: -90, opacity: 0 }}
                      animate={{ y: 0, rotate: 0, opacity: 1 }}
                      exit={{ y: -18, rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      {mode === 'dark' ? <FiSun /> : <FiMoon />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </Tooltip>
              <a
                href={CV_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-10 items-center rounded-full bg-ink px-4 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-bg transition-colors hover:bg-up hover:text-on-up sm:flex"
              >
                CV
              </a>
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
                aria-label="Open menu"
              >
                <span className="flex w-4 flex-col gap-[5px]">
                  <span className="h-px w-full bg-ink" />
                  <span className="h-px w-2/3 bg-ink" />
                </span>
              </button>
            </div>
          </nav>
        </div>
        {showProgress && <motion.div className="h-px origin-left bg-gradient-to-r from-down via-up to-up" style={{ scaleX: progress }} />}
      </motion.header>

      <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}>
        <div className="flex h-full flex-col px-6 pb-8">
          <div className="flex h-[72px] items-center justify-between">
            <span className="eyebrow">Menu</span>
            <button type="button" onClick={() => setDrawer(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Close menu">
              <FiX />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto" aria-label="Mobile">
            <ul className="space-y-1">
              {[{ label: 'Home', to: '/' }, ...PRIMARY_NAV].map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={drawer ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.6, ease: EASE }}
                  className="border-b border-line py-3"
                >
                  {item.children ? (
                    <>
                      <span className="eyebrow">{item.label}</span>
                      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                        {item.children.map((c) => (
                          <li key={c.to}>
                            <Link to={c.to} className={`font-display text-2xl ${isActivePath(pathname, c.to) ? 'text-up' : 'text-ink'}`}>
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={() => setDrawer(false)}
                      className={`font-display text-4xl ${isActivePath(pathname, item.to) ? 'text-up' : 'text-ink'}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </nav>
          <a href={CV_URL} target="_blank" rel="noopener noreferrer" className="mt-6 flex h-12 items-center justify-center rounded-full bg-ink font-mono text-xs uppercase tracking-[0.12em] text-bg">
            Download CV
          </a>
        </div>
      </Drawer>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}

export default Header;
