import { useParams } from 'react-router-dom';
import ArticleLayout from '../components/ArticleLayout';
import useAsync from '../lib/useAsync';
import { getScribblingBySlug, getScribblingEntries, generateSlug, getSlugTitle } from '../services/dataService';

const slugOf = (item) => generateSlug(getSlugTitle(item));

function ScribblingDetailPage() {
  const { slug } = useParams();
  const { data, loading } = useAsync(async () => {
    const [entry, all] = await Promise.all([getScribblingBySlug(slug), getScribblingEntries()]);
    return { entry, all: all ?? [] };
  }, [slug]);

  const entry = data?.entry;
  // Step through entries of the same kind (poems with poems, etc.).
  const siblings = (data?.all ?? []).filter((e) => !entry?.tag || e.tag === entry.tag);
  const i = siblings.findIndex((e) => slugOf(e) === slug);
  // Lists are newest-first, so "next" is the newer neighbour.
  const next = i > 0 ? siblings[i - 1] : null;
  const prev = i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null;

  return (
    <ArticleLayout
      loading={loading}
      entry={entry}
      error={!loading && !entry ? 'This entry could not be found.' : null}
      section="Scribbling"
      backTo="/scribbling"
      seoPath={`/scribbling/${slug}`}
      prev={prev}
      next={next}
      linkFor={(item) => `/scribbling/${slugOf(item)}`}
      verse={entry?.tag === 'Poem'}
    />
  );
}

export default ScribblingDetailPage;
