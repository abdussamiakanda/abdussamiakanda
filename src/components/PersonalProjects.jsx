import './PersonalProjects.css';
import { Link } from 'react-router-dom';
import { generateSlug } from '../services/dataService';

function PersonalProjects({ data, limit }) {
  if (!data || data.length === 0) {
    return null;
  }

  const displayProjects = limit ? data.slice(0, limit) : data;
  const showViewAll = limit; // Always show if limit is set (on homepage)

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const areDatesSame = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = typeof date1 === 'number' ? new Date(date1 * 1000) : new Date(date1);
    const d2 = typeof date2 === 'number' ? new Date(date2 * 1000) : new Date(date2);
    return d1.toDateString() === d2.toDateString();
  };

  return (
    <>
      <div className="personal-projects-container">
        {displayProjects.map((project) => (
          <div key={project.id} className="personal-project-card">
            <div className="project-header">
              <h3 className="project-title">{project.title}</h3>
              {(project.startDate || project.endDate) && (
                <span className="project-date">
                  {project.startDate && project.endDate && areDatesSame(project.startDate, project.endDate) 
                    ? formatDate(project.startDate)
                    : (
                      <>
                        {project.startDate && formatDate(project.startDate)}
                        {project.startDate && project.endDate ? ' - ' : ''}
                        {project.endDate ? formatDate(project.endDate) : project.startDate ? ' (Ongoing)' : ''}
                      </>
                    )
                  }
                </span>
              )}
            </div>
            
            {project.description && (
              <p className="project-description">{project.description}</p>
            )}
            
            {project.technologies && project.technologies.length > 0 && (
              <div className="project-technologies">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
            )}
            
            <div className="project-links">
              {project.overview && (
                <Link 
                  to={`/projects/case/${generateSlug(project.title)}`}
                  className="project-link project-link-case-study"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Case Study
                </Link>
              )}
              {project.website && (
                <a 
                  href={project.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Website
                </a>
              )}
              {project.demo && (
                <a 
                  href={`/demo/${project.demo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Demo
                </a>
              )}
              {project.github && (
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {showViewAll && (
        <div className="projects-view-all">
          <Link to="/projects" className="projects-view-all-link">
            View All Projects →
          </Link>
        </div>
      )}
    </>
  );
}

export default PersonalProjects;

