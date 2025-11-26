import { Link } from 'react-router-dom';
import { getCurationsTags } from '../services/dataService';
import { useEffect, useState } from 'react';
import SubSection from './SubSection';
import './Curations.css';

function Curations() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await getCurationsTags();
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <SubSection title="Curations">
      <div className="curations-tags">
        {tags.map(tag => (
          <Link key={tag} to={`/curations/${tag}`} className="curations-tag">
            Curated {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </Link>
        ))}
      </div>
    </SubSection>
  );
}

export default Curations;

