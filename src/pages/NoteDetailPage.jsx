import { useEffect, useState } from 'react';
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getNoteBySlug, getNotes, generateSlug } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './NoteDetailPage.css';

function NoteDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNote();
    loadAllNotes();
  }, [slug]);

  const loadNote = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNoteBySlug(slug);
      if (data) {
        setNote(data);
      } else {
        setError('Note not found');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const loadAllNotes = async () => {
    try {
      const data = await getNotes();
      setAllNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Find current note index and get next/prev
  const currentIndex = allNotes.findIndex(n => generateSlug(n.title) === slug);
  const nextNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const prevNote = currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

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

  if (error || !note) {
    return (
      <div className="app">
        <Header />
        <main>
          <div className="note-detail-container">
            <Link to="/notes" className="back-link">Back to Notes</Link>
            <div className="error-message">{error || 'Note not found'}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <SEO 
        title={note.title}
        description={note.description || `Read: ${note.title}`}
        url={`/notes/${slug}`}
        type="article"
      />
      <Header />
      <main>
        <div className="note-detail-container">
            <Link to="/notes" className="back-link">Back to Notes</Link>
          
          <article className="note-content">
            <header className="note-header">
              <h1 className="note-title">{note.title}</h1>
              <div className="note-meta">
                <span className="note-author">
                  <FaUser className="note-author-icon" />
                  {note.author || 'Md Abdus Sami Akanda'}
                </span>
                {note.date && (
                  <time className="note-date">
                    <FaCalendarAlt className="note-date-icon" />
                    {formatDate(note.date)}
                  </time>
                )}
              </div>
              {note.description && (
                <p className="note-description">{note.description}</p>
              )}
            </header>

            {note.content && (
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
                        trust: true, // Allow certain commands that might be disabled
                        onError: (error, code) => {
                          console.error('LaTeX rendering error:', error.name || error);
                          console.error('Error message:', error.message || error);
                          if (code) {
                            console.error('LaTeX code that failed:', code);
                          }
                          return true; // Return true to continue processing
                        }
                      }
                    ]
                  ]}
                  components={{
                    // Custom components to prevent markdown from breaking LaTeX
                    p: ({ node, children, ...props }) => {
                      // Check if children contain LaTeX
                      const hasMath = React.Children.toArray(children).some(
                        child => typeof child === 'object' && child?.props?.className?.includes('math')
                      );
                      return <p {...props}>{children}</p>;
                    },
                    // Prevent markdown from processing underscores in LaTeX
                    em: ({ node, children, ...props }) => {
                      // If parent is math, don't process as emphasis
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
                    let processed = note.content;
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

            {note.url && (
              <div className="note-external-link">
                <a href={note.url} target="_blank" rel="noopener noreferrer" className="external-link">
                  View Original Source
                  <FaExternalLinkAlt className="external-link-icon" />
                </a>
              </div>
            )}

            <nav className="note-navigation">
              {prevNote && (
                <Link to={`/notes/${generateSlug(prevNote.title)}`} className="nav-link nav-prev">
                  <span className="nav-label">Previous</span>
                  <span className="nav-title">{prevNote.title}</span>
                </Link>
              )}
              {nextNote && (
                <Link to={`/notes/${generateSlug(nextNote.title)}`} className="nav-link nav-next">
                  <span className="nav-label">Next</span>
                  <span className="nav-title">{nextNote.title}</span>
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

export default NoteDetailPage;

