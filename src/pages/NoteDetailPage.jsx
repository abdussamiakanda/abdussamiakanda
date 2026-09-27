import { useParams } from 'react-router-dom';
import ArticleLayout from '../components/ArticleLayout';
import useAsync from '../lib/useAsync';
import { getNoteBySlug, getNotes, generateSlug } from '../services/dataService';

const slugOf = (item) => generateSlug(item.title);

function NoteDetailPage() {
  const { slug } = useParams();
  const { data, loading } = useAsync(async () => {
    const [entry, all] = await Promise.all([getNoteBySlug(slug), getNotes()]);
    return { entry, all: all ?? [] };
  }, [slug]);

  const entry = data?.entry;
  const siblings = data?.all ?? [];
  const i = siblings.findIndex((e) => slugOf(e) === slug);
  // Lists are newest-first, so "next" is the newer neighbour.
  const next = i > 0 ? siblings[i - 1] : null;
  const prev = i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null;

  return (
    <ArticleLayout
      loading={loading}
      entry={entry}
      error={!loading && !entry ? 'This entry could not be found.' : null}
      section="Notes"
      backTo="/notes"
      seoPath={`/notes/${slug}`}
      prev={prev}
      next={next}
      linkFor={(item) => `/notes/${slugOf(item)}`}
      verse={false}
    />
  );
}

export default NoteDetailPage;
