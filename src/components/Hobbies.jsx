import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHobbies, generateSlug } from '../services/dataService';
import './Hobbies.css';

function Hobbies() {
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
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
      <div className="hobbies-container">
        <div className="loading-placeholder">Loading hobbies...</div>
      </div>
    );
  }

  if (!hobbies || hobbies.length === 0) {
    return null;
  }

  return (
    <div className="hobbies-container">
      <div className="hobbies-grid">
        {hobbies.map((hobby) => {
          if (!hobby || !hobby.title) {
            return null;
          }
          const slug = generateSlug(hobby.title);
          const isChess = slug === 'chess' || (hobby.title && hobby.title.toLowerCase() === 'chess');
          const route = isChess ? '/hobbies/chess' : (hobby.route || `/hobbies/${slug}`);
          
          return (
            <Link 
              key={hobby.id} 
              to={route}
              className="hobby-card"
            >
              <div className="hobby-icon">
                {hobby.emoji || '🎯'}
              </div>
              <h3 className="hobby-title">{hobby.title}</h3>
            </Link>
          );
        })}
      </div>
      <div className="hobbies-view-all">
        <Link to="/hobbies" className="hobbies-view-all-link">
          View All Hobbies →
        </Link>
      </div>
    </div>
  );
}

export default Hobbies;

