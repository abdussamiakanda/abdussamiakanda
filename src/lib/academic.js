// Parsers for the free-text academic fields stored in the JSON data.

// "Journal of X, 35(31), 315701, Institute of Physics (Q1; IF: 2.745)"
//   -> { venue: 'Journal of X', details: '35(31), 315701, Institute of Physics', quartile: 'Q1', impact: '2.745' }
export function parseJournal(raw = '') {
  const metricsMatch = raw.match(/\(([^)]*)\)\s*$/);
  const metrics = metricsMatch?.[1] ?? '';
  const body = metricsMatch ? raw.slice(0, metricsMatch.index).trim() : raw.trim();
  const [venue, ...rest] = body.split(',').map((s) => s.trim());
  return {
    venue,
    details: rest.join(', '),
    quartile: metrics.match(/Q[1-4]/)?.[0] ?? null,
    impact: metrics.match(/IF:\s*([\d.]+)/)?.[1] ?? null,
  };
}

export const doiFromUrl = (url = '') => url.match(/10\.\d{4,9}\/\S+/)?.[0] ?? null;

// Speeches store their kind in the title "(Poster)" or description prefix.
export function parseTalk(talk) {
  const desc = talk.description ?? '';
  const isPoster = /\(poster\)/i.test(talk.title) || /^poster/i.test(desc);
  const kind = isPoster ? 'Poster' : /^talk/i.test(desc) ? 'Talk' : /proceeding/i.test(desc) ? 'Proceeding' : 'Presentation';
  const authors = desc.match(/Authors?:\s*(.+?)\.?$/)?.[1] ?? '';
  return {
    ...talk,
    title: talk.title.replace(/\s*\(poster\)\s*/i, '').trim(),
    kind,
    authors,
  };
}

// Split an author list around the site owner so the name can be emphasised.
export function splitAuthors(authors = '') {
  const re = /(M\.\s?A\.\s?S\.\s?Akanda|Md\.?\s?Abdus\s?Sami\s?Akanda)/;
  const m = authors.match(re);
  if (!m) return [authors, null, ''];
  return [authors.slice(0, m.index), m[0], authors.slice(m.index + m[0].length)];
}
