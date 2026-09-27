import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Dialog from '@mui/material/Dialog';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import { auth } from '../firebase/config';
import Page, { PageHeader } from '../components/Page';
import IndexList from '../components/IndexList';
import { EmptyState } from '../components/ui/primitives';
import { Reveal } from '../components/ui/Reveal';
import useAsync from '../lib/useAsync';
import { formatDate, toDate } from '../lib/format';
import { journalExcerpt } from '../lib/chess/meta';
import {
  addChessJournalEntry,
  deleteChessJournalEntry,
  generateSlug,
  getChessJournalEntries,
  updateChessJournalEntry,
} from '../services/dataService';

const EMPTY = { title: '', date: '', content: '' };
const field =
  'w-full rounded-2xl border border-line bg-bg px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-up disabled:opacity-60';

function Editor({ open, entry, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      entry
        ? { title: entry.title ?? '', content: entry.content ?? '', date: toDate(entry.date)?.toISOString().slice(0, 10) ?? '' }
        : EMPTY,
    );
  }, [open, entry]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = { title: form.title.trim(), content: form.content, date: form.date || null };
      if (entry) await updateChessJournalEntry(entry.id, data);
      else await addChessJournalEntry(data);
      onSaved();
    } catch (e) {
      console.error(e);
      setError('Could not save the entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const valid = form.title.trim() && form.content.trim();

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: '26px' } } }}>
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="font-display text-3xl text-ink">{entry ? 'Edit entry' : 'New entry'}</h2>
        <button type="button" onClick={onClose} disabled={saving} className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2" aria-label="Close">
          <FiX />
        </button>
      </div>
      <div className="grid gap-4 px-6 py-5">
        <label className="grid gap-1.5">
          <span className="eyebrow">Title</span>
          <input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="The Najdorf that got away" disabled={saving} />
        </label>
        <label className="grid gap-1.5">
          <span className="eyebrow">Date (optional)</span>
          <input type="date" className={field} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} disabled={saving} />
        </label>
        <label className="grid gap-1.5">
          <span className="eyebrow">Content (Markdown)</span>
          <textarea
            className={`${field} min-h-[16rem] font-mono text-sm`}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder={'Write in Markdown. Embed a replayable game with \\Chess{ ...PGN... }'}
            disabled={saving}
          />
          <span className="text-xs text-ink-3">
            Embed a game with <code className="rounded bg-surface-2 px-1 font-mono">\Chess{'{'} …PGN… {'}'}</code>
          </span>
        </label>
        {error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>}
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button type="button" onClick={onClose} disabled={saving} className="h-11 rounded-full border border-line-strong px-5 text-sm text-ink hover:border-ink">
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || !valid}
          className="h-11 rounded-full bg-ink px-6 font-mono text-xs uppercase tracking-[0.1em] text-bg transition-colors hover:bg-up hover:text-on-up disabled:opacity-40"
        >
          {saving ? 'Saving…' : entry ? 'Save changes' : 'Publish entry'}
        </button>
      </div>
    </Dialog>
  );
}

function ChessJournalPage() {
  const [refresh, setRefresh] = useState(0);
  const { data: entries, loading } = useAsync(getChessJournalEntries, [refresh], []);
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null closed · {} new · entry
  const [deleting, setDeleting] = useState(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const q = query.trim().toLowerCase();
  const shown = q ? entries.filter((e) => `${e.title} ${journalExcerpt(e.content, 100000)}`.toLowerCase().includes(q)) : entries;

  const confirmDelete = async () => {
    await deleteChessJournalEntry(deleting.id);
    setDeleting(null);
    setRefresh((r) => r + 1);
  };

  return (
    <Page loading={loading} seo={{ title: 'Chess journal', description: 'Annotated chess games and notes, with replayable positions.', url: '/hobbies/chess/journal' }}>
      <PageHeader
        back={{ to: '/hobbies/chess', label: 'Chess' }}
        eyebrow="Chess · Journal"
        title="Chess"
        italic="journal."
        count={entries.length}
        countLabel={entries.length === 1 ? 'entry' : 'entries'}
        lede="Games worth remembering, annotated. Every embedded game can be replayed move by move."
      >
        <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center gap-3">
          {entries.length > 0 && (
            <label className="flex h-11 w-full items-center gap-3 rounded-full border border-line px-4 focus-within:border-ink sm:w-80">
              <FiSearch className="text-ink-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entries"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              />
            </label>
          )}
          {user && (
            <button
              type="button"
              onClick={() => setEditing({})}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 font-mono text-xs uppercase tracking-[0.1em] text-bg transition-colors hover:bg-up hover:text-on-up"
            >
              <FiPlus /> New entry
            </button>
          )}
        </Reveal>
      </PageHeader>

      <section className="shell">
        {entries.length === 0 ? (
          <EmptyState>No journal entries yet.</EmptyState>
        ) : shown.length === 0 ? (
          <EmptyState>No entries match “{query}”.</EmptyState>
        ) : user ? (
          // Signed in: same list with edit and delete controls.
          <ul className="border-t border-line">
            {shown.map((e) => (
              <li key={e.id} className="flex items-center gap-4 border-b border-line py-5">
                <Link to={`/hobbies/chess/journal/${generateSlug(e.title)}`} className="min-w-0 flex-1">
                  <span className="block font-display text-3xl text-ink hover:text-up">{e.title}</span>
                  <span className="mt-1 block text-sm text-ink-3">{formatDate(e.date)}</span>
                </Link>
                <button type="button" onClick={() => setEditing(e)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 hover:border-ink hover:text-ink" aria-label={`Edit ${e.title}`}>
                  <FiEdit2 />
                </button>
                <button type="button" onClick={() => setDeleting(e)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 hover:border-red-500 hover:text-red-500" aria-label={`Delete ${e.title}`}>
                  <FiTrash2 />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <IndexList
            items={shown.map((e) => ({
              key: e.id,
              to: `/hobbies/chess/journal/${generateSlug(e.title)}`,
              title: e.title,
              description: journalExcerpt(e.content),
              meta: formatDate(e.date, 'short'),
            }))}
          />
        )}
      </section>

      <Editor
        open={editing !== null}
        entry={editing?.id ? editing : null}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          setRefresh((r) => r + 1);
        }}
      />

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '24px' } } }}>
        <div className="p-6">
          <h2 className="font-display text-3xl text-ink">Delete entry?</h2>
          <p className="mt-2 text-ink-2">“{deleting?.title}” will be removed. This can’t be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleting(null)} className="h-11 rounded-full border border-line-strong px-5 text-sm text-ink hover:border-ink">
              Cancel
            </button>
            <button type="button" onClick={confirmDelete} className="h-11 rounded-full bg-red-500 px-5 text-sm text-white hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </Page>
  );
}

export default ChessJournalPage;
