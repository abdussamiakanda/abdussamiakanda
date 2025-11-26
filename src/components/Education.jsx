import './Education.css';

function Education({ data }) {
  if (!data || data.length === 0) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div id="education" className="content-block">
      <div className="education-list">
          {data.map((item) => (
            <div key={item.id} className="education-item">
              <div className="education-header">
                <h3 className="education-institution">{item.institution}</h3>
                <span className="education-degree">{item.degree}</span>
              </div>
              <div className="education-dates">
                {formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Present'}
              </div>
              {item.location && <p className="education-location">{item.location}</p>}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Education;

