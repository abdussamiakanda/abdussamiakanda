import './Gallery.css';
import { getGallery } from '../services/dataService';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getGallery();
      // Show only latest 6 items on homepage
      setItems((data || []).slice(0, 6));
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="gallery-container">
      <div className="gallery-grid">
        {items.map(item => (
          <div key={item.id} className="gallery-item">
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.imageUrl && <img src={item.imageUrl} alt={item.title || 'Gallery item'} />}
                {!item.imageUrl && item.title && <div className="gallery-placeholder">{item.title}</div>}
              </a>
            )}
            {!item.url && item.imageUrl && <img src={item.imageUrl} alt={item.title || 'Gallery item'} />}
            {item.title && <p className="gallery-title">{item.title}</p>}
          </div>
        ))}
      </div>
      <div className="gallery-view-all">
        <Link to="/gallery" className="gallery-view-all-link">
          View All Gallery →
        </Link>
      </div>
    </div>
  );
}

export default Gallery;

