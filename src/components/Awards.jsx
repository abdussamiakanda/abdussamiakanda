import './Awards.css';
import { FaExternalLinkAlt } from 'react-icons/fa';

function Awards({ data }) {
  if (!data || data.length === 0) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div id="awards" className="content-block">
      <div className="awards-list">
          {data.map((item) => (
            <div key={item.id} className="award-item">
              <div className="award-header">
                <h3 className="award-title">{item.title}</h3>
                {item.description && <span className="award-description-badge">{item.description}</span>}
              </div>
              {item.date && <div className="award-date">{formatDate(item.date)}</div>}
              {item.featuredIn && (
                <div className="award-featured">
                  <span className="featured-label">Featured in:</span>{' '}
                  {item.featuredInUrl ? (
                    <a href={item.featuredInUrl} target="_blank" rel="noopener noreferrer" className="featured-link">
                      {item.featuredIn}
                    </a>
                  ) : (
                    item.featuredIn
                  )}
                </div>
              )}
              {item.website && (
                <div className="award-links">
                  <a href={item.website} target="_blank" rel="noopener noreferrer" className="award-link">
                    {item.website}
                    <FaExternalLinkAlt className="award-link-icon" />
                  </a>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Awards;

