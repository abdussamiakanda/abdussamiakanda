import './Activities.css';
import { FaExternalLinkAlt } from 'react-icons/fa';

function Activities({ data }) {
  if (!data || data.length === 0) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div id="activities" className="content-block">
      <div className="activities-list">
          {data.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-header">
                <h3 className="activity-organization">{item.organization}</h3>
                <span className="activity-role">{item.role}</span>
              </div>
              <div className="activity-dates">
                {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Present'}
              </div>
              {item.website && (
                <a href={item.website} target="_blank" rel="noopener noreferrer" className="activity-link">
                  {item.website}
                  <FaExternalLinkAlt className="activity-link-icon" />
                </a>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Activities;

