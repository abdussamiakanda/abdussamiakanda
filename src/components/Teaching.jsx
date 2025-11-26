import { Link } from 'react-router-dom';
import './Teaching.css';

function Teaching({ data, metadata }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div id="teaching" className="content-block">
      {data && data.length > 0 && (
        <div className="teaching-list">
          {data.map((item) => (
            <div key={item.id} className="teaching-item">
              <div className="teaching-header">
                <h3 className="teaching-institution">{item.institution}</h3>
                <span className="teaching-role">{item.role}</span>
              </div>
              <div className="teaching-dates">
                {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Present'}
              </div>
              {item.subjects && item.subjects.length > 0 && (
                <div className="teaching-subjects">
                  <h4>Subjects Covered:</h4>
                  <ul>
                    {item.subjects.map((subject, index) => (
                      <li key={index}>{subject}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {metadata && (metadata.description || (metadata.generalSubjects && metadata.generalSubjects.length > 0)) && (
        <div className="teaching-summary">
          {metadata.description && (
            <p className="teaching-description">{metadata.description}</p>
          )}
          {metadata.generalSubjects && metadata.generalSubjects.length > 0 && (
            <>
              <p className="teaching-subjects-intro">Here is a general list of the subjects I covered:</p>
              <div className="teaching-general-subjects">
                {metadata.generalSubjects.map((subject, index) => (
                  <span key={index} className="general-subject-tag">{subject}</span>
                ))}
              </div>
              <div className="teaching-courses-link">
                <Link to="/courses" className="courses-link-btn">
                  Explore All Courses <span className="arrow">→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Teaching;

