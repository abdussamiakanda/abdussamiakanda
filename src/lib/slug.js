// URL slugs, shared by the app and the build scripts (keep this file free of
// browser and bundler-only imports so Node can load it directly).
export const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Bangla entries are addressed by their English title when they have one.
export const getSlugTitle = (entry) => {
  if (entry.englishTitle && entry.englishTitle.trim()) {
    return entry.englishTitle;
  }
  return entry.title || '';
};
