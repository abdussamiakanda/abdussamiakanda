import Page, { PageHeader } from '../components/Page';
import IndexList from '../components/IndexList';
import { EmptyState } from '../components/ui/primitives';
import useAsync from '../lib/useAsync';
import { formatDate } from '../lib/format';
import { getPosts, generateSlug, getSlugTitle } from '../services/dataService';

function PostsPage() {
  const { data: posts, loading } = useAsync(getPosts, [], []);

  return (
    <Page
      loading={loading}
      seo={{ title: 'Posts', description: 'Essays on academia, migration, and everything in between.', url: '/posts' }}
    >
      <PageHeader
        eyebrow="Posts · Essays"
        title="Longer"
        italic="thoughts."
        count={posts.length}
        countLabel="posts"
        lede="Essays in English and Bangla — on graduate school across continents, science, and stories that didn’t fit anywhere else."
      />
      <section className="shell">
        {posts.length === 0 ? (
          <EmptyState>No posts yet.</EmptyState>
        ) : (
          <IndexList
            items={posts.map((p) => ({
              key: p.id,
              to: `/posts/${generateSlug(getSlugTitle(p))}`,
              title: p.title,
              subtitle: p.englishTitle && p.englishTitle !== p.title ? p.englishTitle : null,
              description: p.description,
              meta: formatDate(p.date, 'short'),
              image: p.imageUrl,
            }))}
          />
        )}
      </section>
    </Page>
  );
}

export default PostsPage;
