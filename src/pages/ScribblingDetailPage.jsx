import { useEffect, useState } from 'react';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getScribblingBySlug, getScribblingEntries, generateSlug, getSlugTitle } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './ScribblingDetailPage.css';

function ScribblingDetailPage() {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEntry();
    loadAllEntries();
  }, [slug]);

  const loadEntry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getScribblingBySlug(slug);
      if (data) {
        setEntry(data);
      } else {
        setError('Entry not found');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      setError('Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  const loadAllEntries = async () => {
    try {
      const data = await getScribblingEntries();
      setAllEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Find current entry index and get next/prev (within same tag if entry has tag)
  const currentIndex = allEntries.findIndex(e => generateSlug(getSlugTitle(e)) === slug);
  const filteredEntries = entry?.tag 
    ? allEntries.filter(e => e.tag === entry.tag)
    : allEntries;
  const currentFilteredIndex = filteredEntries.findIndex(e => generateSlug(getSlugTitle(e)) === slug);
  const nextEntry = currentFilteredIndex > 0 ? filteredEntries[currentFilteredIndex - 1] : null;
  const prevEntry = currentFilteredIndex < filteredEntries.length - 1 ? filteredEntries[currentFilteredIndex + 1] : null;

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

  if (error || !entry) {
    return (
      <div className="app">
      <Header />
      <main className="scribbling-detail-main">
        <div className="scribbling-detail-container">
          <Link to="/scribbling" className="back-link">Back to Scribbling</Link>
          <div className="error-message">{error || 'Entry not found'}</div>
        </div>
      </main>
      </div>
    );
  }

  return (
    <div className="app">
      <SEO 
        title={entry.title}
        description={entry.description || `Read: ${entry.title}`}
        url={`/scribbling/${slug}`}
        type="article"
      />
      <Header />
      <main className="scribbling-detail-main">
        <div className="scribbling-detail-container">
          <Link to="/scribbling" className="back-link">Back to Scribbling</Link>
          <div style={{ clear: 'both' }}></div>
          
          <article className="scribbling-content">
            <header className="scribbling-header">
              <div className="scribbling-title-wrapper">
                <h1 className="scribbling-title">{entry.title}</h1>
                <div className="scribbling-meta">
                  <span className="scribbling-author">
                    <FaUser className="scribbling-author-icon" />
                    {entry.author || 'Md Abdus Sami Akanda'}
                  </span>
                  {entry.date && (
                    <time className="scribbling-date">
                      <FaCalendarAlt className="scribbling-date-icon" />
                      {formatDate(entry.date)}
                    </time>
                  )}
                  {entry.tag && (
                    <span className="scribbling-tag">
                      {entry.tag}
                    </span>
                  )}
                </div>
              </div>
              {entry.description && (
                <p className="scribbling-description">{entry.description}</p>
              )}
            </header>

            {entry.content && (
              <div className="scribbling-markdown">
                <ReactMarkdown
                  remarkPlugins={[
                    [remarkMath, {
                      delimiters: [
                        { left: '$$', right: '$$', display: true, asciiMath: false },
                        { left: '$', right: '$', display: false, asciiMath: false },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '\\(', right: '\\)', display: false }
                      ]
                    }]
                  ]}
                  rehypePlugins={[
                    [
                      rehypeKatex,
                      {
                        throwOnError: false,
                        errorColor: '#cc0000',
                        strict: false,
                        fleqn: false,
                        trust: true,
                        onError: (error, code) => {
                          console.error('LaTeX rendering error:', error.name || error);
                          console.error('Error message:', error.message || error);
                          if (code) {
                            console.error('LaTeX code that failed:', code);
                          }
                          return true;
                        }
                      }
                    ]
                  ]}
                  components={{
                    p: ({ node, children, ...props }) => {
                      const hasMath = React.Children.toArray(children).some(
                        child => typeof child === 'object' && child?.props?.className?.includes('math')
                      );
                      return <p {...props}>{children}</p>;
                    },
                    em: ({ node, children, ...props }) => {
                      if (node?.parent?.type === 'math') {
                        return children;
                      }
                      return <em {...props}>{children}</em>;
                    },
                    strong: ({ node, children, ...props }) => {
                      if (node?.parent?.type === 'math') {
                        return children;
                      }
                      return <strong {...props}>{children}</strong>;
                    },
                    br: () => <br />
                  }}
                >
                  {(() => {
                    let processed = entry.content;
                    // First, convert escaped double newlines to actual double newlines (paragraph breaks)
                    processed = processed.replace(/\\n\\n/g, '\n\n');
                    // Then, convert remaining escaped single newlines to line breaks (2 spaces + newline in markdown)
                    processed = processed.replace(/\\n/g, '  \n');
                    // Finally, convert actual single newlines (that aren't part of \n\n) to line breaks
                    processed = processed.replace(/([^\n])\n([^\n])/g, '$1  \n$2');
                    return processed;
                  })()}
                </ReactMarkdown>
              </div>
            )}

            <nav className="scribbling-navigation">
              {prevEntry && (
                <Link to={`/scribbling/${generateSlug(getSlugTitle(prevEntry))}`} className="scribbling-nav-link scribbling-nav-prev">
                  <span className="scribbling-nav-label">Previous</span>
                  <span className="scribbling-nav-title">{prevEntry.title}</span>
                </Link>
              )}
              {nextEntry && (
                <Link to={`/scribbling/${generateSlug(getSlugTitle(nextEntry))}`} className="scribbling-nav-link scribbling-nav-next">
                  <span className="scribbling-nav-label">Next</span>
                  <span className="scribbling-nav-title">{nextEntry.title}</span>
                </Link>
              )}
            </nav>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ScribblingDetailPage;

