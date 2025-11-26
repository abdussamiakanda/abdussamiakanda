import { useEffect, useState } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import ChessMatchViewer from '../components/ChessMatchViewer';
import { getHobbies, getChessJournalEntries, generateSlug } from '../services/dataService';
import { seoConfig } from '../utils/seoConfig';
import './ChessPage.css';
import './NoteDetailPage.css';
import '../components/ChessMatchViewer.css';

function ChessPage() {
  const [hobby, setHobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalLoading, setJournalLoading] = useState(true);

  useEffect(() => {
    loadHobby();
    loadJournalEntries();
  }, []);

  const loadHobby = async () => {
    try {
      const hobbies = await getHobbies();
      const chessHobby = hobbies.find(h => {
        const slug = generateSlug(h.title);
        return slug === 'chess' || h.title.toLowerCase() === 'chess';
      });
      setHobby(chessHobby || null);
    } catch (error) {
      console.error('Error loading hobby:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJournalEntries = async () => {
    try {
      const entries = await getChessJournalEntries();
      // Show only latest 3 entries
      setJournalEntries((entries || []).slice(0, 3));
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setJournalLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

  return (
    <div className="app">
      <SEO 
        title={hobby?.title || seoConfig.chess.title}
        description={hobby?.description || seoConfig.chess.description}
        keywords={seoConfig.chess.keywords}
        ogType="article"
      />
      <Header />
      <main className="chess-page-main">
        <div className="chess-page-container">
          <Link to="/hobbies" className="back-link">Back to Hobbies</Link>
          <div style={{ clear: 'both' }}></div>
          
          {hobby ? (
            <>
              <h1 className="chess-page-title">
                {hobby.emoji && <span className="hobby-emoji">{hobby.emoji}</span>}
                {hobby.title}
              </h1>
              
              {hobby.description && (
                <div className="note-description" style={{ fontStyle: 'normal' }}>
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
                          trust: true
                        }
                      ]
                    ]}
                    components={{
                      br: () => <br />
                    }}
                  >
                    {(() => {
                      let processed = hobby.description;
                      processed = processed.replace(/\\n\\n/g, '\n\n');
                      processed = processed.replace(/\\n/g, '  \n');
                      processed = processed.replace(/([^\n])\n([^\n])/g, '$1  \n$2');
                      return processed;
                    })()}
                  </ReactMarkdown>
                </div>
              )}

              {hobby.content && (
                <div className="note-markdown">
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
                      let processed = hobby.content;
                      processed = processed.replace(/\\n\\n/g, '\n\n');
                      processed = processed.replace(/\\n/g, '  \n');
                      processed = processed.replace(/([^\n])\n([^\n])/g, '$1  \n$2');
                      return processed;
                    })()}
                  </ReactMarkdown>
                </div>
              )}

              <div className="note-external-link">
                <Link to="/hobbies/chess/bot" className="external-link">
                  Play Against My AI Bot →
                </Link>
              </div>
            </>
          ) : (
            <div className="error-message">Hobby not found.</div>
          )}
          
          {/* Chess Journal Section */}
          {!journalLoading && (
            <div className="chess-journal-container">
              <div className="match-viewer-header">
                <h2 className="match-viewer-title">
                  Chess Journal
                </h2>
              </div>
              <div className="chess-journal-list">
                {journalEntries.map(entry => {
                  const entrySlug = generateSlug(entry.title);
                  return (
                    <Link 
                      key={entry.id} 
                      to={`/hobbies/chess/journal/${entrySlug}`}
                      className="chess-journal-item chess-journal-item-link"
                    >
                      <div className="chess-journal-header-item">
                        <h3 className="chess-journal-item-title">{entry.title}</h3>
                        {entry.date && <span className="chess-journal-date">{formatDate(entry.date)}</span>}
                      </div>
                      {entry.content && (() => {
                        // Remove chess blocks and clean markdown for excerpt
                        let excerpt = entry.content
                          .replace(/\\Chess\{[\s\S]*?\}/g, '') // Remove chess blocks
                          .replace(/#{1,6}\s+/g, '') // Remove headers
                          .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
                          .replace(/\*([^*]+)\*/g, '$1') // Remove italic
                          .replace(/`([^`]+)`/g, '$1') // Remove inline code
                          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
                          .trim();
                        
                        if (excerpt.length > 150) {
                          excerpt = excerpt.substring(0, 150).trim() + '...';
                        }
                        
                        return excerpt ? (
                          <p className="chess-journal-description">{excerpt}</p>
                        ) : null;
                      })()}
                      <span className="chess-journal-link-text">Read Entry →</span>
                    </Link>
                  );
                })}
              </div>
              <div className="chess-journal-view-all">
                <Link to="/hobbies/chess/journal" className="chess-journal-view-all-link">
                  View All Journal →
                </Link>
              </div>
            </div>
          )}
          
          {/* Chess.com Matches Section */}
          <ChessMatchViewer username="samithesamurai" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ChessPage;

