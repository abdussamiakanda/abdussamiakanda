import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getPublications } from '../services/dataService';
import './PublicationsPage.css';

function PublicationsPage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    try {
      const data = await getPublications();
      setPublications(data || []);
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setLoading(false);
    }
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
        title="Publications"
        description="Research publications, papers, and academic works."
        url="/publications"
      />
      <Header />
      <main>
        <div className="publications-page-container">
          <Link to="/" className="back-link">Back to Home</Link>
          <h1 className="publications-page-title">Publications</h1>
          
          {publications.length === 0 ? (
            <div className="empty-message">No publications available yet.</div>
          ) : (
            <div className="publications-list">
              {publications.map(publication => (
                <div key={publication.id} className="publication-item">
                  <h3 className="publication-title">{publication.title}</h3>
                  <div className="publication-meta">
                    {publication.authors && <span className="publication-authors">{publication.authors}</span>}
                    {publication.journal && <span className="publication-journal">{publication.journal}</span>}
                    {publication.year && <span className="publication-year">{publication.year}</span>}
                  </div>
                  {publication.description && <p className="publication-description">{publication.description}</p>}
                  {publication.url && (
                    <a href={publication.url} target="_blank" rel="noopener noreferrer" className="publication-link">
                      View Publication
                      <FaExternalLinkAlt className="publication-link-icon" />
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

export default PublicationsPage;

