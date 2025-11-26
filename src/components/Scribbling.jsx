import { Link } from 'react-router-dom';
import { getScribblingEntries, generateSlug, getSlugTitle } from '../services/dataService';
import { useEffect, useState } from 'react';
import SubSection from './SubSection';
import './Scribbling.css';

function Scribbling() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await getScribblingEntries();
      // Show only latest 3 entries on homepage
      setEntries((data || []).slice(0, 3));
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
    return null;
  }

  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <SubSection title="Scribbling">
      <div className="scribbling-entries">
        {entries.map(entry => (
          <Link key={entry.id} to={`/scribbling/${generateSlug(getSlugTitle(entry))}`} className="scribbling-entry">
            <div className="scribbling-entry-title-wrapper">
              <h3 className="scribbling-entry-title">{entry.title}</h3>
              <div className="scribbling-entry-meta">
                {entry.tag && (
                  <span className="scribbling-entry-tag">
                    {entry.tag}
                  </span>
                )}
                {entry.date && <span className="scribbling-entry-date">{formatDate(entry.date)}</span>}
              </div>
            </div>
            {entry.description && <p className="scribbling-entry-description">{entry.description}</p>}
            <span className="scribbling-entry-link-text">Read →</span>
          </Link>
        ))}
      </div>
      <div className="scribbling-view-all">
        <Link to="/scribbling" className="scribbling-view-all-link">
          View All Scribbling →
        </Link>
      </div>
    </SubSection>
  );
}

export default Scribbling;

