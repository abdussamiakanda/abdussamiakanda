import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getScribblingEntries, generateSlug, getSlugTitle } from '../services/dataService';
import './ScribblingPage.css';

function ScribblingPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getScribblingEntries();
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
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
        title="Scribbling"
        description="Collection of poems, stories, drawings, and creative works."
        url="/scribbling"
      />
      <Header />
      <main className="scribbling-page-main">
        <div className="scribbling-page-container">
          <Link to="/" className="back-link">Back to Home</Link>
          <div style={{ clear: 'both' }}></div>
          <h1 className="scribbling-page-title">Scribbling</h1>
          
          {entries.length === 0 ? (
            <div className="empty-message">No entries available yet.</div>
          ) : (
            <div className="scribbling-list">
              {entries.map(entry => (
                <Link key={entry.id} to={`/scribbling/${generateSlug(getSlugTitle(entry))}`} className="scribbling-item scribbling-item-link">
                  <div className="scribbling-title-wrapper">
                    <h3 className="scribbling-title">{entry.title}</h3>
                    <div className="scribbling-meta">
                      {entry.tag && (
                        <span className="scribbling-tag">
                          {entry.tag}
                        </span>
                      )}
                      {entry.date && <span className="scribbling-date">{formatDate(entry.date)}</span>}
                    </div>
                  </div>
                  {entry.description && <p className="scribbling-description">{entry.description}</p>}
                  <span className="scribbling-link-text">Read →</span>
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

export default ScribblingPage;

