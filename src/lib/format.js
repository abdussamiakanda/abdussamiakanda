// Stored dates are unix seconds at UTC midnight (a few legacy entries hold ISO
// strings), so everything is read and formatted in UTC; local time would show
// the previous day for viewers west of Greenwich.
export const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value, style = 'long') => {
  const d = toDate(value);
  if (!d) return '';
  const opts =
    style === 'short'
      ? { year: 'numeric', month: 'short' }
      : style === 'year'
        ? { year: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
};

export const yearOf = (value) => toDate(value)?.getUTCFullYear() ?? null;

// "Aug 2023 — Present", collapsing identical start/end into one date.
export const formatRange = (start, end, { style = 'short', ongoing = 'Present' } = {}) => {
  const s = toDate(start);
  const e = toDate(end);
  if (!s && !e) return '';
  if (s && e && s.toISOString().slice(0, 10) === e.toISOString().slice(0, 10)) return formatDate(start, style);
  const left = s ? formatDate(start, style) : '';
  const right = e ? formatDate(end, style) : ongoing;
  return left ? `${left} — ${right}` : right;
};

export const readingTime = (text = '') => {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

export const titleCase = (s = '') => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const pad = (n, width = 2) => String(n).padStart(width, '0');

// Bold the site owner in an author list, whichever initials form is used.
export const OWNER_PATTERN = /(M\.\s?A\.\s?S\.\s?Akanda|Md\.?\s?Abdus\s?Sami\s?Akanda|A\.\s?S\.\s?Akanda)/;

// Link label for a project's website: package registries get their own name.
export const siteLabel = (url = '') => (/pypi\.org/.test(url) ? 'PyPI' : /npmjs\.com/.test(url) ? 'npm' : 'Website');
