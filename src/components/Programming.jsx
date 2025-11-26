import './Programming.css';
import { useEffect, useState } from 'react';
import { getProgramming, getProgrammingProjects } from '../services/dataService';

function Programming() {
  const [info, setInfo] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [infoData, projectsData] = await Promise.all([
        getProgramming(),
        getProgrammingProjects()
      ]);
      setInfo(infoData);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error loading programming data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!info && (!projects || projects.length === 0)) {
    return null;
  }

  return (
    <div className="programming-container">
      {info && info.description && (
        <div className="programming-description">
          <p>{info.description}</p>
        </div>
      )}
      {info && info.githubUrl && (
        <div className="programming-info">
          <p>Find me on GitHub: <a href={info.githubUrl} target="_blank" rel="noopener noreferrer">{info.githubUrl}</a></p>
        </div>
      )}
      {projects && projects.length > 0 && (
        <div className="programming-projects">
          {projects.map(project => (
            project.url ? (
              <a key={project.id} href={project.url} target="_blank" rel="noopener noreferrer" className="programming-project programming-project-link">
                <div className="project-header-row">
                  <h4>{project.name || project.title}</h4>
                  <div className="project-link-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </div>
                </div>
                {project.description && <p>{project.description}</p>}
              </a>
            ) : (
              <div key={project.id} className="programming-project">
                <div className="project-header-row">
                  <h4>{project.name || project.title}</h4>
                </div>
                {project.description && <p>{project.description}</p>}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default Programming;

