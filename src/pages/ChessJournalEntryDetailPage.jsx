import { useEffect, useState } from 'react';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getChessJournalEntryBySlug, getChessJournalEntries, generateSlug } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ChessJournalBoard from '../components/ChessJournalBoard';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import './ChessJournalEntryDetailPage.css';

function ChessJournalEntryDetailPage() {
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
      const data = await getChessJournalEntryBySlug(slug);
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
      const data = await getChessJournalEntries();
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

  // Custom markdown renderer that detects \Chess{...} blocks
  const processMarkdown = (content) => {
    if (!content) return [{ type: 'markdown', content: '' }];
    
    const chessPattern = /\\Chess\{([\s\S]*?)\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = chessPattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'markdown',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      parts.push({
        type: 'chess',
        pgn: match[1].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push({
        type: 'markdown',
        content: content.substring(lastIndex)
      });
    }
    
    if (parts.length === 0) {
      return [{ type: 'markdown', content }];
    }
    
    return parts;
  };

  // Find current entry index and get next/prev
  const currentIndex = allEntries.findIndex(e => generateSlug(e.title) === slug);
  const nextEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;
  const prevEntry = currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null;

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
        <main className="chess-journal-entry-detail-main">
          <div className="chess-journal-entry-detail-container">
            <Link to="/hobbies/chess/journal" className="back-link">Back to Journal</Link>
            <div style={{ clear: 'both' }}></div>
            <div className="error-message">{error || 'Entry not found'}</div>
          </div>
        </main>
      </div>
    );
  }

  const processedParts = processMarkdown(entry.content || '');

  return (
    <div className="app">
      <SEO 
        title={entry.title}
        description={`Chess journal entry: ${entry.title}`}
        url={`/hobbies/chess/journal/${slug}`}
        type="article"
      />
      <Header />
      <main className="chess-journal-entry-detail-main">
        <div className="chess-journal-entry-detail-container">
          <Link to="/hobbies/chess/journal" className="back-link">Back to Journal</Link>
          <div style={{ clear: 'both' }}></div>
          
          <article className="chess-journal-entry-content">
            <header className="chess-journal-entry-header">
              <h1 className="chess-journal-entry-title">{entry.title}</h1>
              <div className="chess-journal-entry-meta">
                <span className="chess-journal-entry-author">
                  <FaUser className="chess-journal-entry-author-icon" />
                  {entry.author || 'Md Abdus Sami Akanda'}
                </span>
                {entry.date && (
                  <time className="chess-journal-entry-date">
                    <FaCalendarAlt className="chess-journal-entry-date-icon" />
                    {formatDate(entry.date)}
                  </time>
                )}
              </div>
            </header>

            <div className="chess-journal-entry-markdown">
              {processedParts.map((part, index) => {
                if (part.type === 'chess') {
                  return (
                    <ChessJournalBoard key={`chess-${index}`} pgn={part.pgn} />
                  );
                } else {
                  return (
                    <div key={`markdown-${index}`}>
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
                          let processed = part.content;
                          processed = processed.replace(/\\n\\n/g, '\n\n');
                          processed = processed.replace(/\\n/g, '  \n');
                          processed = processed.replace(/([^\n])\n([^\n])/g, '$1  \n$2');
                          return processed;
                        })()}
                      </ReactMarkdown>
                    </div>
                  );
                }
              })}
            </div>

            <nav className="chess-journal-entry-navigation">
              {prevEntry && (
                <Link to={`/hobbies/chess/journal/${generateSlug(prevEntry.title)}`} className="chess-journal-entry-nav-link">
                  <span className="chess-journal-entry-nav-label">Previous</span>
                  <span className="chess-journal-entry-nav-title">{prevEntry.title}</span>
                </Link>
              )}
              {nextEntry && (
                <Link to={`/hobbies/chess/journal/${generateSlug(nextEntry.title)}`} className="chess-journal-entry-nav-link chess-journal-entry-nav-next">
                  <span className="chess-journal-entry-nav-label">Next</span>
                  <span className="chess-journal-entry-nav-title">{nextEntry.title}</span>
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

export default ChessJournalEntryDetailPage;

