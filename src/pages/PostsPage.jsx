import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getPosts, generateSlug } from '../services/dataService';
import './PostsPage.css';

function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
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
        title="Posts"
        description="Blog posts and articles on various topics including academic insights, personal experiences, and more."
        url="/posts"
      />
      <Header />
      <main className="posts-page-main">
        <div className="posts-page-container">
          <Link to="/" className="back-link">Back to Home</Link>
          <div style={{ clear: 'both' }}></div>
          <h1 className="posts-page-title">Posts</h1>
          
          {posts.length === 0 ? (
            <div className="empty-message">No posts available yet.</div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <Link key={post.id} to={`/posts/${generateSlug(post.title)}`} className="post-item post-item-link">
                  <h3 className="post-title">{post.title}</h3>
                  {post.date && <span className="post-date">{formatDate(post.date)}</span>}
                  {post.description && <p className="post-description">{post.description}</p>}
                  <span className="post-link-text">Read →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PostsPage;

