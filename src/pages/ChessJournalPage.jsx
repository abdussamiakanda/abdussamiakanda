import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { 
  getChessJournalEntries, 
  addChessJournalEntry,
  updateChessJournalEntry,
  deleteChessJournalEntry,
  generateSlug 
} from '../services/dataService';
import './NotesPage.css';
import './ChessJournalPage.css';

function ChessJournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorDate, setEditorDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadEntries();
  }, []);


  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getChessJournalEntries();
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleOpenEditor = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setEditorTitle(entry.title || '');
      setEditorContent(entry.content || '');
      // Convert timestamp to date string if needed
      if (entry.date) {
        const date = typeof entry.date === 'number' 
          ? new Date(entry.date * 1000) 
          : new Date(entry.date);
        setEditorDate(date.toISOString().split('T')[0]);
      } else {
        setEditorDate('');
      }
    } else {
      setEditingEntry(null);
      setEditorTitle('');
      setEditorContent('');
      setEditorDate('');
    }
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingEntry(null);
    setEditorTitle('');
    setEditorContent('');
    setEditorDate('');
  };

  const handleSaveEntry = async () => {
    if (!editorTitle.trim() || !editorContent.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setSaving(true);
    try {
      if (editingEntry) {
        await updateChessJournalEntry(editingEntry.id, {
          title: editorTitle,
          content: editorContent,
          date: editorDate || null
        });
      } else {
        await addChessJournalEntry({
          title: editorTitle,
          content: editorContent,
          date: editorDate || null
        });
      }
      handleCloseEditor();
      await loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await deleteChessJournalEntry(id);
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const title = (entry.title || '').toLowerCase();
    const content = (entry.content || '')
      .replace(/\\Chess\{[\s\S]*?\}/g, '') // Remove chess blocks
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .toLowerCase();
    
    return title.includes(query) || content.includes(query);
  });


  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <SEO 
        title="Chess Journal"
        description="Chess journal entries with game analysis and annotations"
        url="/hobbies/chess/journal"
      />
      <Header />
      <main className="chess-journal-page-main">
        <div className="chess-journal-page-container">
          <Link to="/hobbies/chess" className="back-link">Back to Chess</Link>
          <div style={{ clear: 'both' }}></div>
          <div className="journal-header-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 className="chess-journal-title" style={{ marginBottom: '0' }}>Chess Journal</h1>
              {user && (
                <button 
                  className="add-entry-btn"
                  onClick={() => handleOpenEditor()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '0',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 400,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#1a1a1a';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.borderColor = '#000000';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  + Add Entry
                </button>
              )}
            </div>
            
            {entries.length > 0 && (
              <div className="journal-search-container">
                <input
                  type="text"
                  className="journal-search-input"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
          
          {entries.length === 0 ? (
            <div className="empty-message">No journal entries yet.</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-message">No entries found matching your search.</div>
          ) : (
            <>
              <div className="notes-list">
                {filteredEntries.map(entry => {
                  const entrySlug = generateSlug(entry.title);
                  // Extract excerpt from content
                  let excerpt = entry.content
                    ? entry.content
                        .replace(/\\Chess\{[\s\S]*?\}/g, '') // Remove chess blocks
                        .replace(/#{1,6}\s+/g, '') // Remove headers
                        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
                        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
                        .replace(/`([^`]+)`/g, '$1') // Remove inline code
                        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
                        .trim()
                    : '';
                  
                  return (
                    <div key={entry.id} style={{ position: 'relative' }}>
                      <Link 
                        to={`/hobbies/chess/journal/${entrySlug}`}
                        className="note-item note-item-link"
                      >
                        <h3 className="note-title">{entry.title}</h3>
                        {entry.date && <p className="note-date">{formatDate(entry.date)}</p>}
                        {excerpt && (
                          <p className="note-description">
                            {excerpt.length > 150 ? excerpt.substring(0, 150).trim() + '...' : excerpt}
                          </p>
                        )}
                        <span className="note-link-text">Read Entry →</span>
                      </Link>
                      {user && (
                        <div style={{
                          position: 'absolute',
                          bottom: '1rem',
                          right: '1rem',
                          display: 'flex',
                          gap: '0.5rem',
                          zIndex: 10
                        }}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenEditor(entry);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: '0',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: 'var(--text-secondary)',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#000000';
                              e.currentTarget.style.borderColor = '#000000';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            title="Edit entry"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                            style={{
                              background: 'rgba(255, 68, 68, 0.2)',
                              border: '1px solid rgba(255, 68, 68, 0.3)',
                              borderRadius: '4px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: 'rgba(255, 255, 255, 0.9)',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.4)';
                              e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)';
                              e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.3)';
                            }}
                            title="Delete entry"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="editor-modal-overlay" onClick={() => !saving && handleCloseEditor()}>
            <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
              <div className="editor-modal-header">
                <h2>{editingEntry ? 'Edit Journal Entry' : 'Add Journal Entry'}</h2>
                <button 
                  className="close-editor-btn"
                  onClick={handleCloseEditor}
                  disabled={saving}
                >
                  ×
                </button>
              </div>
              <div className="editor-modal-content">
                <div className="editor-field">
                  <label htmlFor="editor-title">Title *</label>
                  <input
                    id="editor-title"
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Entry title"
                    disabled={saving}
                  />
                </div>
                <div className="editor-field">
                  <label htmlFor="editor-date">Date (optional)</label>
                  <input
                    id="editor-date"
                    type="date"
                    value={editorDate}
                    onChange={(e) => setEditorDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="editor-field">
                  <label htmlFor="editor-content">Content *</label>
                  <textarea
                    id="editor-content"
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Write your journal entry in Markdown. Use \Chess{...PGN notation...} to embed chess games."
                    rows={15}
                    disabled={saving}
                  />
                  <small className="editor-hint">
                    Use <code>\Chess&#123;...PGN...&#125;</code> to embed chess games
                  </small>
                </div>
              </div>
              <div className="editor-modal-footer">
                <button
                  className="cancel-btn"
                  onClick={handleCloseEditor}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={handleSaveEntry}
                  disabled={saving || !editorTitle.trim() || !editorContent.trim()}
                >
                  {saving ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Entry')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ChessJournalPage;

