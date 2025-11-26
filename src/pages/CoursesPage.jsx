import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getCourses } from '../services/dataService';
import './CoursesPage.css';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
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
        title="Courses"
        description="Academic courses taught and course materials."
        url="/courses"
      />
      <Header />
      <main>
        <div className="courses-page-container">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1 className="courses-page-title">All Courses</h1>
          
          {courses.length === 0 ? (
            <div className="empty-message">No courses available yet.</div>
          ) : (
            <div className="courses-list">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <h3 className="course-title">{course.title}</h3>
                  {course.description && <p className="course-description">{course.description}</p>}
                  {course.url && (
                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="course-link">
                      View Course →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CoursesPage;

