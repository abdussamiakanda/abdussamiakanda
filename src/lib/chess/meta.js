export const CHESS_COM_USERNAME = 'samithesamurai';

// Plain-text excerpt of a journal entry: drops \Chess{...} blocks and markdown.
export const journalExcerpt = (content = '', max = 160) => {
  const text = content
    .replace(/\\Chess\{[\s\S]*?\}/g, '')
    .replace(/[#>*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};
