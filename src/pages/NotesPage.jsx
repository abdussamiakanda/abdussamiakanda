import Page, { PageHeader } from '../components/Page';
import IndexList from '../components/IndexList';
import { EmptyState } from '../components/ui/primitives';
import useAsync from '../lib/useAsync';
import { formatDate } from '../lib/format';
import { getNotes, generateSlug } from '../services/dataService';

function NotesPage() {
  const { data: notes, loading } = useAsync(getNotes, [], []);

  return (
    <Page
      loading={loading}
      seo={{ title: 'Notes', description: 'Academic notes covering topics in physics and related fields.', url: '/notes' }}
    >
      <PageHeader
        eyebrow="Notes · Physics explained"
        title="Field"
        italic="notes."
        count={notes.length}
        countLabel="notes"
        lede="Working explanations from coursework and research — domain walls, nuclear physics, and the mathematics underneath. Equations render natively."
      />
      <section className="shell">
        {notes.length === 0 ? (
          <EmptyState>No notes yet.</EmptyState>
        ) : (
          <IndexList
            items={notes.map((n) => ({
              key: n.id,
              to: `/notes/${generateSlug(n.title)}`,
              title: n.title,
              description: n.description,
              meta: formatDate(n.date, 'short'),
              image: n.imageUrl,
            }))}
          />
        )}
      </section>
    </Page>
  );
}

export default NotesPage;
