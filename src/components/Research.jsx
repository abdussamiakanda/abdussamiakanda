import { Link } from 'react-router-dom';
import './Research.css';

function Research({ data, metadata }) {
  // Show section if there's data, profile links, or always show work links
  if (!data || data.length === 0) {
    // Still show if there are profile links or always show work links section
    if (!metadata || (!metadata.profileLinks || metadata.profileLinks.length === 0)) {
      return null;
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // Handle Unix timestamp (seconds) from Realtime Database
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div id="research" className="content-block">
      <div className="research-list">
          {data.map((item) => (
            <div key={item.id} className="research-item">
              <div className="research-header">
                <h3 className="research-institution">{item.institution}</h3>
                <span className="research-role">{item.role}</span>
              </div>
              <div className="research-dates">
                {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Present'}
              </div>
              {item.description && <p className="research-description">{item.description}</p>}
              {item.links && item.links.length > 0 && (
                <div className="research-links">
                  {item.links.map((link, index) => (
                    <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="research-link">
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
      
      {(data && data.length > 0) || (metadata && metadata.profileLinks && metadata.profileLinks.length > 0) ? (
        <div className="research-metadata">
          <div className="research-works">
            <p className="research-metadata-label">Here are some of my works:</p>
            <div className="research-works-links">
              <Link to="/publications" className="research-works-link">
                Publications <span className="arrow">→</span>
              </Link>
              <Link to="/speeches" className="research-works-link">
                Speeches <span className="arrow">→</span>
              </Link>
              <Link to="/notes" className="research-works-link">
                Notes <span className="arrow">→</span>
              </Link>
            </div>
          </div>
          {metadata && metadata.profileLinks && metadata.profileLinks.length > 0 && (
            <div className="research-profiles">
              <p className="research-metadata-label">Find Me on:</p>
              <div className="research-profiles-links">
                {metadata.profileLinks.map((link, index) => (
                  <span key={index}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="research-profile-link">
                      {link.label}
                    </a>
                    {index < metadata.profileLinks.length - 1 && <span className="profile-separator">, </span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
      </div>
    </div>
  );
}

export default Research;

