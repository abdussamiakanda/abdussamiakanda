import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getHobbies, generateSlug } from '../services/dataService';
import './HobbiesPage.css';

function HobbiesPage() {
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
    setLoading(true);
    try {
      const data = await getHobbies();
      setHobbies(data || []);
    } catch (error) {
      console.error('Error loading hobbies:', error);
    } finally {
      setLoading(false);
    }
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
        title="Hobbies"
        description="Explore my hobbies and interests, including chess and other activities."
        url="/hobbies"
      />
      <Header />
      <main className="hobbies-page-main">
        <div className="hobbies-page-container">
          <Link to="/" className="back-link">Back to Home</Link>
          <div style={{ clear: 'both' }}></div>
          <h1 className="hobbies-page-title">Hobbies</h1>
          
          {hobbies.length === 0 ? (
            <div className="empty-message">No hobbies available yet.</div>
          ) : (
            <div className="hobbies-list">
              {hobbies.map(hobby => {
                if (!hobby || !hobby.title) {
                  return null;
                }
                const slug = generateSlug(hobby.title);
                const route = hobby.route || `/hobbies/${slug}`;
                // Special handling for chess
                const isChess = slug === 'chess' || (hobby.title && hobby.title.toLowerCase() === 'chess');
                const finalRoute = isChess ? '/hobbies/chess' : route;
                
                return (
                  <Link 
                    key={hobby.id} 
                    to={finalRoute}
                    className="hobby-list-item hobby-list-link"
                  >
                    <div className="hobby-list-emoji">{hobby.emoji || '🎯'}</div>
                    <h3 className="hobby-list-title">{hobby.title}</h3>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HobbiesPage;

