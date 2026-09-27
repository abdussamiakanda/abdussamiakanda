import { useParams } from 'react-router-dom';
import ArticleLayout from '../components/ArticleLayout';
import useAsync from '../lib/useAsync';
import { getPostBySlug, getPosts, generateSlug, getSlugTitle } from '../services/dataService';

const slugOf = (item) => generateSlug(getSlugTitle(item));

function PostDetailPage() {
  const { slug } = useParams();
  const { data, loading } = useAsync(async () => {
    const [entry, all] = await Promise.all([getPostBySlug(slug), getPosts()]);
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
      section="Posts"
      backTo="/posts"
      seoPath={`/posts/${slug}`}
      prev={prev}
      next={next}
      linkFor={(item) => `/posts/${slugOf(item)}`}
      verse={false}
    />
  );
}

export default PostDetailPage;
