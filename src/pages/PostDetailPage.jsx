import { useEffect, useState } from 'react';
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getPostBySlug, getPosts, generateSlug } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import './PostDetailPage.css';

function PostDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
    loadAllPosts();
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPostBySlug(slug);
      if (data) {
        setPost(data);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const loadAllPosts = async () => {
    try {
      const data = await getPosts();
      setAllPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Find current post index and get next/prev
  const currentIndex = allPosts.findIndex(p => generateSlug(p.title) === slug);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

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

  if (error || !post) {
    return (
      <div className="app">
        <Header />
        <main className="post-detail-main">
          <div className="post-detail-container">
            <Link to="/posts" className="back-link">Back to Posts</Link>
            <div style={{ clear: 'both' }}></div>
            <div className="error-message">{error || 'Post not found'}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <SEO 
        title={post.title}
        description={post.description || `Read: ${post.title}`}
        url={`/posts/${slug}`}
        type="article"
      />
      <Header />
      <main className="post-detail-main">
        <div className="post-detail-container">
          <Link to="/posts" className="back-link">Back to Posts</Link>
          <div style={{ clear: 'both' }}></div>
          
          <article className="post-content">
            <header className="post-header">
              <div className="post-title-wrapper">
                <h1 className="post-title">{post.title}</h1>
                <div className="post-meta">
                  <span className="post-author">
                    <FaUser className="post-author-icon" />
                    {post.author || 'Md Abdus Sami Akanda'}
                  </span>
                  {post.date && (
                    <time className="post-date">
                      <FaCalendarAlt className="post-date-icon" />
                      {formatDate(post.date)}
                    </time>
                  )}
                </div>
              </div>
              {post.description && (
                <p className="post-description">{post.description}</p>
              )}
            </header>

            {post.content && (
              <div className="post-markdown">
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
                    br: () => <br />,
                    a: ({ node, children, ...props }) => {
                      return <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
                    }
                  }}
                >
                  {(() => {
                    let processed = post.content;
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


            <nav className="post-navigation">
              {prevPost && (
                <Link to={`/posts/${generateSlug(prevPost.title)}`} className="post-nav-link">
                  <span className="post-nav-label">Previous</span>
                  <span className="post-nav-title">{prevPost.title}</span>
                </Link>
              )}
              {nextPost && (
                <Link to={`/posts/${generateSlug(nextPost.title)}`} className="post-nav-link post-nav-next">
                  <span className="post-nav-label">Next</span>
                  <span className="post-nav-title">{nextPost.title}</span>
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

export default PostDetailPage;

