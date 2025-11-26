import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getSpeeches } from '../services/dataService';
import './SpeechesPage.css';

function SpeechesPage() {
  const [speeches, setSpeeches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpeeches();
  }, []);

  const loadSpeeches = async () => {
    setLoading(true);
    try {
      const data = await getSpeeches();
      setSpeeches(data || []);
    } catch (error) {
      console.error('Error loading speeches:', error);
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
        title="Speeches"
        description="Academic speeches, presentations, and talks."
        url="/speeches"
      />
      <Header />
      <main>
        <div className="speeches-page-container">
          <Link to="/" className="back-link">Back to Home</Link>
          <h1 className="speeches-page-title">Speeches</h1>
          
          {speeches.length === 0 ? (
            <div className="empty-message">No speeches available yet.</div>
          ) : (
            <div className="speeches-list">
              {speeches.map(speech => (
                <div key={speech.id} className="speech-item">
                  <h3 className="speech-title">{speech.title}</h3>
                  <div className="speech-meta">
                    {speech.date && <span className="speech-date">{formatDate(speech.date)}</span>}
                    {speech.location && <span className="speech-location">{speech.location}</span>}
                  </div>
                  {speech.description && <p className="speech-description">{speech.description}</p>}
                  {speech.url && (
                    <a href={speech.url} target="_blank" rel="noopener noreferrer" className="speech-link">
                      View Speech
                      <FaExternalLinkAlt className="speech-link-icon" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SpeechesPage;

