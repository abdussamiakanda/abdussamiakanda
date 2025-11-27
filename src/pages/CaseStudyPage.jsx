import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getPersonalProjects, generateSlug } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import { FaCalendarAlt, FaTag, FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import './CaseStudyPage.css';

function CaseStudyPage() {
  const { slug } = useParams();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCaseStudy();
  }, [slug]);

  const loadCaseStudy = async () => {
    setLoading(true);
    setError(null);
    try {
      const projects = await getPersonalProjects();
      const project = projects.find(p => generateSlug(p.title) === slug);
      
      if (!project) {
        setError('Case study not found');
        setLoading(false);
        return;
      }

      // Check if project has overview data
      if (!project.overview || project.overview.trim() === '') {
        setError('This project does not have a case study');
        setLoading(false);
        return;
      }

      setCaseStudy(project);
      setLoading(false);
    } catch (error) {
      console.error('Error loading case study:', error);
      setError('Failed to load case study');
      setLoading(false);
    }
  };

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

  if (error || !caseStudy) {
    return (
      <div className="app">
        <Header />
        <main className="case-study-main">
          <div className="case-study-container">
            <Link to="/projects" className="back-link">Back to Projects</Link>
            <div style={{ clear: 'both' }}></div>
            <div className="error-container">
              <div className="error-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h2 className="error-title">Case Study Not Found</h2>
              <p className="error-description">
                {error || "The case study you're looking for doesn't exist or hasn't been created yet."}
              </p>
              <div className="error-actions">
                <Link to="/projects" className="error-btn">
                  Browse All Projects
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <SEO 
        title={caseStudy.title}
        description={caseStudy.description || `Case study: ${caseStudy.title}`}
        url={`/projects/case/${slug}`}
        type="article"
      />
      <Header />
      <main className="case-study-main">
        <div className="case-study-container">
          <Link to="/projects" className="back-link">Back to Projects</Link>
          <div style={{ clear: 'both' }}></div>
          
          <article className="case-study-content">
            <header className="case-study-header">
              <div className="case-study-title-wrapper">
                <h1 className="case-study-title">{caseStudy.title}</h1>
                <div className="case-study-meta">
                  {(caseStudy.startDate || caseStudy.endDate) && (
                    <time className="case-study-date">
                      <FaCalendarAlt className="case-study-date-icon" />
                      {caseStudy.startDate && caseStudy.endDate && areDatesSame(caseStudy.startDate, caseStudy.endDate) 
                        ? formatDate(caseStudy.startDate)
                        : (
                          <>
                            {caseStudy.startDate && formatDate(caseStudy.startDate)}
                            {caseStudy.startDate && caseStudy.endDate ? ' - ' : ''}
                            {caseStudy.endDate ? formatDate(caseStudy.endDate) : caseStudy.startDate ? ' (Ongoing)' : ''}
                          </>
                        )
                      }
                    </time>
                  )}
                </div>
              </div>
              {caseStudy.description && (
                <p className="case-study-description">{caseStudy.description}</p>
              )}
              {caseStudy.technologies && caseStudy.technologies.length > 0 && (
                <div className="case-study-technologies">
                  {caseStudy.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
              )}
              <div className="case-study-links">
                {caseStudy.website && (
                  <a 
                    href={caseStudy.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="case-study-link"
                  >
                    <FaExternalLinkAlt />
                    Website
                  </a>
                )}
                {caseStudy.demo && (
                  <a 
                    href={`/demo/${caseStudy.demo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="case-study-link"
                  >
                    <FaExternalLinkAlt />
                    Demo
                  </a>
                )}
                {caseStudy.github && (
                  <a 
                    href={caseStudy.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="case-study-link"
                  >
                    <FaGithub />
                    GitHub
                  </a>
                )}
              </div>
            </header>

            {caseStudy.overview && (
              <div className="case-study-markdown">
                <ReactMarkdown
                  components={{
                    a: ({ node, children, ...props }) => {
                      return <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
                    }
                  }}
                >
                  {caseStudy.overview}
                </ReactMarkdown>
              </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CaseStudyPage;

