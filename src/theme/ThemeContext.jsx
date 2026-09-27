import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { ThemeModeContext } from './themeModeContext';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

const STORAGE_KEY = 'masa-theme';

const readInitialMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable */
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
};

// MUI palette mirrors the CSS tokens in index.css so dialogs, drawers and
// tooltips sit in the same visual system as the Tailwind-styled surfaces.
const palettes = {
  dark: { bg: '#070a0b', paper: '#10171a', ink: '#e4eeec', ink2: '#95a7a4', up: '#34e3a0', down: '#9a8cff', line: 'rgba(226,238,236,0.08)' },
  light: { bg: '#f2f5f4', paper: '#fbfcfc', ink: '#0b1513', ink2: '#4a5a57', up: '#0a8a5c', down: '#5a4fd6', line: 'rgba(10,22,20,0.1)' },
};

const buildMuiTheme = (mode) => {
  const p = palettes[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: p.up },
      secondary: { main: p.down },
      background: { default: p.bg, paper: p.paper },
      text: { primary: p.ink, secondary: p.ink2 },
      divider: p.line,
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif",
      button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${p.line}` } } },
      // A quiet card that matches the site's surfaces, rather than an
      // inverted block: same font as the UI, hairline border, soft shadow.
      MuiTooltip: {
        defaultProps: { enterDelay: 350, enterNextDelay: 150, disableInteractive: true },
        styleOverrides: {
          tooltip: {
            backgroundColor: p.paper,
            color: p.ink,
            border: `1px solid ${p.line}`,
            boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.45)' : '0 8px 24px rgba(10,22,20,0.12)',
            fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif",
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: 0,
            padding: '6px 10px',
            borderRadius: 10,
          },
          arrow: {
            color: p.paper,
            '&::before': { border: `1px solid ${p.line}` },
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: { backdropFilter: 'blur(6px)', backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(20,20,20,0.25)' },
        },
      },
      MuiDialog: { styleOverrides: { paper: { backgroundColor: p.paper } } },
      MuiDrawer: { styleOverrides: { paper: { backgroundColor: p.bg, borderLeft: `1px solid ${p.line}` } } },
    },
  });
};

// Writes the theme to the DOM immediately, so the switch can happen inside a
// single view-transition snapshot rather than after React's effects.
const applyTheme = (mode) => {
  document.documentElement.setAttribute('data-theme', mode);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', palettes[mode].bg);
};

// Without view transitions, suppress every CSS transition for one frame so
// all surfaces change together instead of fading at different speeds.
const switchInstantly = (update) => {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  update();
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readInitialMode);

  useEffect(() => {
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable */
    }
  }, [mode]);

  // `origin` is the {x, y} viewport point the new theme spreads out from.
  const toggle = useCallback(
    (origin) => {
      const next = mode === 'dark' ? 'light' : 'dark';
      const update = () =>
        flushSync(() => {
          applyTheme(next);
          setMode(next);
        });

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || reduced) {
        switchInstantly(update);
        return;
      }

      const x = origin?.x ?? window.innerWidth - 80;
      const y = origin?.y ?? 36;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      document.documentElement.classList.add('theme-switching');
      const transition = document.startViewTransition(update);
      transition.ready
        .then(() =>
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 650, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
          ),
        )
        .catch(() => {});
      transition.finished.finally(() => document.documentElement.classList.remove('theme-switching'));
    },
    [mode],
  );
  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return (
    <ThemeModeContext.Provider value={value}>
      <StyledEngineProvider enableCssLayer>
        <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
      </StyledEngineProvider>
    </ThemeModeContext.Provider>
  );
}
