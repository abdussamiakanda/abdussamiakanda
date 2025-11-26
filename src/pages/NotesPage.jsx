import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getNotes, generateSlug } from '../services/dataService';
import './NotesPage.css';

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes();
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
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
        title="Notes"
        description="Academic notes and research materials covering various topics in physics and related fields."
        url="/notes"
      />
      <Header />
      <main>
        <div className="notes-page-container">
          <Link to="/" className="back-link">Back to Home</Link>
          <h1 className="notes-page-title">Notes</h1>
          
          {notes.length === 0 ? (
            <div className="empty-message">No notes available yet.</div>
          ) : (
            <div className="notes-list">
              {notes.map(note => (
                <Link key={note.id} to={`/notes/${generateSlug(note.title)}`} className="note-item note-item-link">
                  <h3 className="note-title">{note.title}</h3>
                  {note.date && <p className="note-date">{formatDate(note.date)}</p>}
                  {note.description && <p className="note-description">{note.description}</p>}
                  <span className="note-link-text">Read Note →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotesPage;

