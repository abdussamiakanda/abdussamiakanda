import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset active section when not on homepage
    if (location.pathname !== '/') {
      setActiveSection('');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
        // Only update active section if we're on the homepage
        if (location.pathname === '/') {
          const sections = ['about', 'developer', 'academic', 'personal'];
          const current = sections.find(section => {
            const element = document.getElementById(section);
            if (element) {
              const rect = element.getBoundingClientRect();
              return rect.top <= 150 && rect.bottom >= 150;
            }
            return false;
          });
          if (current) setActiveSection(current);
        } else {
          // Not on homepage, no active section
          setActiveSection('');
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (sectionId) => {
    // If we're not on the homepage, navigate there first
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      // Wait for navigation, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 65;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // We're on homepage, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 65;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <span className="brand-name">MASA</span>
        </div>
        <ul className="nav-menu">
          <li>
            <button 
              className={activeSection === 'about' ? 'active' : ''} 
              onClick={() => scrollToSection('about')}
            >
              About
            </button>
          </li>
          <li>
            <button 
              className={activeSection === 'developer' ? 'active' : ''} 
              onClick={() => scrollToSection('developer')}
            >
              Developer
            </button>
          </li>
          <li>
            <button 
              className={activeSection === 'academic' ? 'active' : ''} 
              onClick={() => scrollToSection('academic')}
            >
              Academic
            </button>
          </li>
          <li>
            <button 
              className={activeSection === 'personal' ? 'active' : ''} 
              onClick={() => scrollToSection('personal')}
            >
              Personal
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
