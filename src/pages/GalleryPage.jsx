import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getGallery } from '../services/dataService';
import './GalleryPage.css';

function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getGallery();
      setItems(data || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
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
        title="Gallery"
        description="A collection of images, artwork, and visual projects."
        url="/gallery"
      />
      <Header />
      <main className="gallery-page-main">
        <div className="gallery-page-container">
          <Link to="/" className="back-link">Back to Home</Link>
          <div style={{ clear: 'both' }}></div>
          <h1 className="gallery-page-title">Gallery</h1>
          
          {items.length === 0 ? (
            <div className="empty-message">No gallery items available yet.</div>
          ) : (
            <div className="gallery-page-grid">
              {items.map(item => (
                <div key={item.id} className="gallery-page-item">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="gallery-page-link">
                      {item.imageUrl && (
                        <div className="gallery-page-image-wrapper">
                          <img src={item.imageUrl} alt={item.title || 'Gallery item'} />
                        </div>
                      )}
                      {!item.imageUrl && item.title && (
                        <div className="gallery-placeholder">{item.title}</div>
                      )}
                      {item.title && <p className="gallery-page-title-text">{item.title}</p>}
                    </a>
                  ) : (
                    <>
                      {item.imageUrl && (
                        <div className="gallery-page-image-wrapper">
                          <img src={item.imageUrl} alt={item.title || 'Gallery item'} />
                        </div>
                      )}
                      {item.title && <p className="gallery-page-title-text">{item.title}</p>}
                    </>
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

export default GalleryPage;

