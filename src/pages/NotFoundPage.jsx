import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './NotFoundPage.css';

function NotFoundPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [zeroPosition, setZeroPosition] = useState({ x: 50, y: 20 }); // Default position

  useEffect(() => {
    // Create floating particles
    const createParticle = () => {
      return {
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3
      };
    };

    const initialParticles = Array.from({ length: 20 }, createParticle);
    setParticles(initialParticles);

    // Animate particles
    const animate = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.speedX) % 100,
        y: (particle.y + particle.speedY) % 100
      })));
    }, 50);

    return () => clearInterval(animate);
  }, []);

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    });
  };

  const [currentMessage, setCurrentMessage] = useState(0);

  const funMessages = [
    "Oops! This page went on vacation 🌴",
    "404: Page not found, but we found this fun message! 🎉",
    "This page is off playing hide and seek! 👻",
    "Lost in the digital wilderness? We've got you! 🗺️",
    "404: The page you seek has left the building 🚪",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % funMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [funMessages.length]);

  // Calculate the exact position of the "0" element
  useEffect(() => {
    const calculateZeroPosition = () => {
      const zeroElement = document.querySelector('.error-zero');
      if (zeroElement) {
        const rect = zeroElement.getBoundingClientRect();
        const container = document.querySelector('.not-found-container');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const x = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
          const y = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;
          setZeroPosition({ x, y });
        }
      }
    };

    // Calculate on mount and resize
    calculateZeroPosition();
    window.addEventListener('resize', calculateZeroPosition);
    return () => window.removeEventListener('resize', calculateZeroPosition);
  }, []);

  return (
    <div className="app" onMouseMove={handleMouseMove}>
      <SEO 
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist. Return to the homepage or explore other sections."
      />
      <Header />
      <main className="not-found-main">
        <div className="not-found-container">
          {/* Floating Particles */}
          <div className="particles-container">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Mouse follower glow */}
          <div 
            className="mouse-glow"
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`
            }}
          />

          <div className="not-found-content">
            <div className="error-code">
              <span className="error-number floating">4</span>
              <span className="error-zero spinning">0</span>
              <span className="error-number floating-delay">4</span>
            </div>
            
            <div className="message-container">
              <h1 className="not-found-title">Page Not Found</h1>
              <p className="not-found-subtitle rotating-message">
                {funMessages[currentMessage]}
              </p>
            </div>

            <div className="not-found-links">
              <Link to="/" className="not-found-btn primary bounce-hover">
                <span className="btn-text">Go Home</span>
                <span className="btn-sparkle">✨</span>
              </Link>
            </div>

            {/* Fun emoji animation - sucked into the 0 */}
            <div className="emoji-rain">
              {['🎯', '📚', '💻', '🎨', '🚀', '⚡', '🔥', '⭐', '💡', '🎪', '🌙', '🌟'].map((emoji, idx) => {
                // Create varied starting positions around the edges
                const edgePositions = [
                  { x: 5, y: 15 },   // Top left
                  { x: 95, y: 15 },  // Top right
                  { x: 5, y: 85 },   // Bottom left
                  { x: 95, y: 85 },  // Bottom right
                  { x: 20, y: 5 },   // Top
                  { x: 80, y: 5 },   // Top
                  { x: 20, y: 95 },  // Bottom
                  { x: 80, y: 95 },  // Bottom
                  { x: 10, y: 50 },  // Left
                  { x: 90, y: 50 },  // Right
                  { x: 30, y: 25 },  // Top left area
                  { x: 70, y: 25 },   // Top right area
                ];
                const pos = edgePositions[idx % edgePositions.length];
                return (
                  <span
                    key={idx}
                    className="floating-emoji sucked"
                    style={{
                      animationDelay: `${idx * 0.25}s`,
                      '--start-x': `${pos.x}%`,
                      '--start-y': `${pos.y}%`,
                      '--target-x': `${zeroPosition.x}%`,
                      '--target-y': `${zeroPosition.y}%`
                    }}
                  >
                    {emoji}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFoundPage;

