import './Posts.css';
import { getPosts, generateSlug } from '../services/dataService';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      // Show only latest 5 posts on homepage
      setPosts((data || []).slice(0, 5));
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
    return null;
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="posts-container">
      <div className="posts-list">
        {posts.map(post => (
          <Link key={post.id} to={`/posts/${generateSlug(post.title)}`} className="post-item post-item-link">
            <div className="post-header">
              <h3 className="post-title">{post.title}</h3>
              {post.date && <span className="post-date">{formatDate(post.date)}</span>}
            </div>
            {post.description && <p className="post-description">{post.description}</p>}
            <span className="post-link-text">Read Post →</span>
          </Link>
        ))}
      </div>
      <div className="posts-view-all">
        <Link to="/posts" className="posts-view-all-link">
          View All Posts →
        </Link>
      </div>
    </div>
  );
}

export default Posts;

