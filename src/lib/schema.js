// schema.org JSON-LD builders. Only facts already published on the site go
// in here: nothing is inferred or embellished.
import { SITE_NAME, SITE_URL, absoluteUrl } from './siteMap.js';
import { toDate } from './format.js';

const PERSON_ID = `${SITE_URL}/#person`;

const isoDate = (value) => toDate(value)?.toISOString().slice(0, 10);

export const personSchema = (profile, education = []) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': PERSON_ID,
  name: profile?.name ?? SITE_NAME,
  url: `${SITE_URL}/`,
  image: absoluteUrl('/images/portrait/sami.webp'),
  description: 'Physicist working on spintronics, magnetization dynamics and micromagnetic simulation.',
  ...(profile?.socialLinks?.some((l) => l.url?.startsWith('mailto:'))
    ? { email: profile.socialLinks.find((l) => l.url.startsWith('mailto:')).url }
    : {}),
  sameAs: (profile?.socialLinks ?? []).map((l) => l.url).filter((u) => /^https?:/.test(u ?? '')),
  alumniOf: education
    .filter((e) => /bachelor|master|doctor|ph\.?d/i.test(e.degree ?? ''))
    .map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution.split(',')[0].trim() })),
  knowsAbout: ['Spintronics', 'Magnetization dynamics', 'Domain-wall dynamics', 'Spin waves', 'Micromagnetic simulation', 'Landau–Lifshitz–Gilbert equation'],
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
});

// BlogPosting for posts, notes and scribbling. `path` is the page's own path.
export const articleSchema = ({ entry, path, description, section }) => {
  const published = isoDate(entry.date);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: String(entry.title ?? '').slice(0, 110),
    ...(entry.englishTitle && entry.englishTitle !== entry.title ? { alternativeHeadline: entry.englishTitle } : {}),
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    ...(published ? { datePublished: published } : {}),
    ...(entry.imageUrl ? { image: absoluteUrl(entry.imageUrl) } : {}),
    articleSection: section,
    inLanguage: /[ঀ-৿]/.test(`${entry.title}${entry.content?.slice(0, 400) ?? ''}`) ? 'bn' : 'en',
    author: entry.author && entry.author !== SITE_NAME ? { '@type': 'Person', name: entry.author } : { '@id': PERSON_ID, '@type': 'Person', name: SITE_NAME },
    publisher: { '@id': PERSON_ID },
  };
};
